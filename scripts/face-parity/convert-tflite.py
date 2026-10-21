"""Rebuild face-api.js models from their TFJS weight manifests and export fp32 TFLite.

Inputs to both exported models are raw RGB float32 (0..255), NHWC:
  * face_landmark_68.tflite: [1, 112, 112, 3] -> [1, 136]
  * face_recognition.tflite: [1, 150, 150, 3] -> [1, 128]

The resize/pad and landmark post-processing are deliberately kept outside the
models; see docs/android/face-parity/README.md for that pipeline.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
import tensorflow as tf


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "public" / "models"
OUT = ROOT / "docs" / "android" / "face-parity" / "models"
FIXTURES = ROOT / "docs" / "android" / "face-parity" / "fixtures.json"


def load_tfjs_weights(prefix: str) -> dict[str, np.ndarray]:
    manifest = json.loads((SOURCE / f"{prefix}-weights_manifest.json").read_text())
    result: dict[str, np.ndarray] = {}
    for group in manifest:
        blob = b"".join((SOURCE / part).read_bytes() for part in group["paths"])
        offset = 0
        for entry in group["weights"]:
            count = int(np.prod(entry["shape"]))
            quant = entry.get("quantization")
            if quant:
                if quant["dtype"] != "uint8":
                    raise ValueError(f"Unsupported quantization: {quant['dtype']}")
                values = np.frombuffer(blob, dtype=np.uint8, count=count, offset=offset)
                offset += count
                values = values.astype(np.float32) * quant["scale"] + quant["min"]
            else:
                values = np.frombuffer(blob, dtype="<f4", count=count, offset=offset).copy()
                offset += count * 4
            result[entry["name"]] = values.reshape(entry["shape"])
        if offset != len(blob):
            raise ValueError(f"Unconsumed bytes in {prefix}: {len(blob) - offset}")
    return result


def c(weights: dict[str, np.ndarray], name: str) -> tf.Tensor:
    return tf.constant(weights[name], dtype=tf.float32)


class Landmark(tf.Module):
    def __init__(self, w: dict[str, np.ndarray]):
        self.w = w

    @tf.function(input_signature=[tf.TensorSpec([1, 112, 112, 3], tf.float32, name="rgb")])
    def __call__(self, rgb: tf.Tensor) -> dict[str, tf.Tensor]:
        x = (rgb - tf.constant([122.782, 117.001, 104.298], tf.float32)) / 255.0
        for block in range(4):
            prefix = f"dense{block}"
            if block == 0:
                out1 = tf.nn.relu(tf.nn.conv2d(x, c(self.w, f"{prefix}/conv0/filters"), 2, "SAME") + c(self.w, f"{prefix}/conv0/bias"))
            else:
                out1 = tf.nn.relu(self.sep(x, prefix, 0, 2))
            out2 = self.sep(out1, prefix, 1, 1)
            out3 = self.sep(tf.nn.relu(out1 + out2), prefix, 2, 1)
            x = tf.nn.relu(out1 + out2 + out3 + self.sep(tf.nn.relu(out1 + out2 + out3), prefix, 3, 1))
        x = tf.nn.avg_pool2d(x, [7, 7], [2, 2], "VALID")
        x = tf.reshape(x, [1, 256])
        return {"landmarks": tf.linalg.matmul(x, c(self.w, "fc/weights")) + c(self.w, "fc/bias")}

    def sep(self, x: tf.Tensor, prefix: str, index: int, stride: int) -> tf.Tensor:
        base = f"{prefix}/conv{index}"
        x = tf.nn.depthwise_conv2d(x, c(self.w, f"{base}/depthwise_filter"), [1, stride, stride, 1], "SAME")
        x = tf.nn.conv2d(x, c(self.w, f"{base}/pointwise_filter"), 1, "SAME")
        return x + c(self.w, f"{base}/bias")


class Recognition(tf.Module):
    def __init__(self, w: dict[str, np.ndarray]):
        self.w = w

    def conv(self, x: tf.Tensor, prefix: str, down: bool = False, relu: bool = True) -> tf.Tensor:
        base = f"{prefix}/conv"
        x = tf.nn.conv2d(x, c(self.w, f"{base}/filters"), 2 if down else 1, "VALID" if down else "SAME")
        x = (x + c(self.w, f"{base}/bias")) * c(self.w, f"{prefix}/scale/weights") + c(self.w, f"{prefix}/scale/biases")
        return tf.nn.relu(x) if relu else x

    def residual(self, x: tf.Tensor, prefix: str) -> tf.Tensor:
        return tf.nn.relu(x + self.conv(self.conv(x, f"{prefix}/conv1"), f"{prefix}/conv2", relu=False))

    def residual_down(self, x: tf.Tensor, prefix: str) -> tf.Tensor:
        out = self.conv(self.conv(x, f"{prefix}/conv1", down=True), f"{prefix}/conv2", relu=False)
        pooled = tf.nn.avg_pool2d(x, 2, 2, "VALID")
        # face-api.js pads the convolution result at the end when VALID sizes differ.
        pad_h = tf.shape(pooled)[1] - tf.shape(out)[1]
        pad_w = tf.shape(pooled)[2] - tf.shape(out)[2]
        out = tf.pad(out, [[0, 0], [0, pad_h], [0, pad_w], [0, 0]])
        channel_pad = tf.shape(out)[3] - tf.shape(pooled)[3]
        pooled = tf.pad(pooled, [[0, 0], [0, 0], [0, 0], [0, channel_pad]])
        return tf.nn.relu(pooled + out)

    @tf.function(input_signature=[tf.TensorSpec([1, 150, 150, 3], tf.float32, name="rgb")])
    def __call__(self, rgb: tf.Tensor) -> dict[str, tf.Tensor]:
        x = (rgb - tf.constant([122.782, 117.001, 104.298], tf.float32)) / 256.0
        x = self.conv(x, "conv32_down", down=True)
        x = tf.nn.max_pool2d(x, 3, 2, "VALID")
        for name in ("conv32_1", "conv32_2", "conv32_3"):
            x = self.residual(x, name)
        for name in ("conv64_down", "conv128_down", "conv256_down", "conv256_down_out"):
            x = self.residual_down(x, name)
            if name == "conv64_down":
                for inner in ("conv64_1", "conv64_2", "conv64_3"):
                    x = self.residual(x, inner)
            elif name == "conv128_down":
                for inner in ("conv128_1", "conv128_2"):
                    x = self.residual(x, inner)
            elif name == "conv256_down":
                for inner in ("conv256_1", "conv256_2"):
                    x = self.residual(x, inner)
        x = tf.reduce_mean(x, [1, 2])
        return {"descriptor": tf.linalg.matmul(x, c(self.w, "fc"))}


def export(module: tf.Module, name: str) -> Path:
    OUT.mkdir(parents=True, exist_ok=True)
    converter = tf.lite.TFLiteConverter.from_concrete_functions([module.__call__.get_concrete_function()], module)
    converter.optimizations = []
    converter.target_spec.supported_types = [tf.float32]
    path = OUT / name
    path.write_bytes(converter.convert())
    return path


def run_tflite(path: Path, image: np.ndarray) -> np.ndarray:
    interpreter = tf.lite.Interpreter(model_path=str(path), num_threads=1)
    interpreter.allocate_tensors()
    input_info = interpreter.get_input_details()[0]
    output_info = interpreter.get_output_details()[0]
    interpreter.set_tensor(input_info["index"], image.astype(np.float32)[None, ...])
    interpreter.invoke()
    return interpreter.get_tensor(output_info["index"])[0]


def report(recognition: Path, landmark: Path) -> None:
    fixture = json.loads(FIXTURES.read_text())
    rows = []
    for case in fixture["recognition"]:
        image_info = case["input"]
        raw = np.frombuffer((FIXTURES.parent / image_info["file"]).read_bytes(), np.uint8).reshape(image_info["height"], image_info["width"], 3)
        output = run_tflite(recognition, raw)
        expected = np.array(case["descriptor_raw"], np.float32)
        rows.append({"name": case["name"], "max_abs_error": float(np.max(np.abs(output - expected))), "l2_distance": float(np.linalg.norm(output / np.linalg.norm(output) - expected / np.linalg.norm(expected)))})
    pipeline = fixture["pipeline"]
    info = pipeline["image"]
    image = np.frombuffer((FIXTURES.parent / info["file"]).read_bytes(), np.uint8).reshape(info["height"], info["width"], 3)
    box = pipeline["detection_box"]
    crop = image[box["y"]:box["y"] + box["height"], box["x"]:box["x"] + box["width"]]
    h, w = crop.shape[:2]
    square = np.zeros((max(h, w), max(h, w), 3), np.float32)
    square[(max(h, w) - h) // 2:(max(h, w) - h) // 2 + h, (max(h, w) - w) // 2:(max(h, w) - w) // 2 + w] = crop
    resized = tf.image.resize(square[None, ...], [112, 112], method="bilinear", antialias=False).numpy()[0]
    output = run_tflite(landmark, resized).reshape(68, 2)
    # Convert padded-square coordinates back to crop-relative coordinates.
    pad_x, pad_y = (max(h, w) - w) / 2, (max(h, w) - h) / 2
    actual = np.column_stack(((output[:, 0] * 112 - pad_x * 112 / max(h, w)) / (112 * w / max(h, w)), (output[:, 1] * 112 - pad_y * 112 / max(h, w)) / (112 * h / max(h, w))))
    expected = np.array([[point["x"], point["y"]] for point in pipeline["landmarks_relative_to_crop"]], np.float32)
    payload = {
        "format": "TFLite fp32", "models": {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in (landmark, recognition)},
        "recognition": rows,
        "landmark_pipeline": {"max_abs_relative_error": float(np.max(np.abs(actual - expected))), "max_abs_pixel_error": float(np.max(np.abs((actual - expected) * [w, h])))}
    }
    payload["passed"] = all(row["max_abs_error"] <= 1e-3 and row["l2_distance"] <= 5e-3 for row in rows) and payload["landmark_pipeline"]["max_abs_pixel_error"] <= 0.5
    (OUT / "conversion-report.json").write_text(json.dumps(payload, indent=2) + "\n")
    if not payload["passed"]:
        raise SystemExit(json.dumps(payload, indent=2))


if __name__ == "__main__":
    landmark = export(Landmark(load_tfjs_weights("face_landmark_68_model")), "face_landmark_68.tflite")
    recognition = export(Recognition(load_tfjs_weights("face_recognition_model")), "face_recognition.tflite")
    report(recognition, landmark)
