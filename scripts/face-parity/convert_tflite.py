"""
Bangun ulang FaceLandmark68Net & FaceRecognitionNet (face-api.js 0.22.2) di TensorFlow, verifikasi
terhadap fixture web, konversi ke TFLite fp32, lalu verifikasi ulang model TFLite.

    node scripts/face-parity/export-weights.cjs <weights-dir>
    .venv-tflite/Scripts/python scripts/face-parity/convert_tflite.py <weights-dir> <out-dir>

Output di <out-dir>: face_landmark_68.tflite, face_recognition.tflite, conversion_report.json.
Proses berhenti dengan kode 1 bila ada uji yang tidak lolos toleransi.

Kontrak model (normalisasi sudah DI DALAM model, Android tidak boleh menormalisasi lagi):
  face_landmark_68.tflite : input  float32 [1,112,112,3] RGB 0..255 (crop kotak deteksi, sudah pad-ke-persegi + resize)
                            output float32 [1,136] x0,y0,x1,y1,... relatif terhadap persegi 112 yang sudah dipad
  face_recognition.tflite : input  float32 [1,150,150,3] RGB 0..255 (crop dlib, sudah pad-ke-persegi + resize)
                            output float32 [1,128] descriptor mentah (belum L2)
"""

import hashlib
import json
import math
import os
import sys
from pathlib import Path

import numpy as np
import tensorflow as tf

ROOT = Path(__file__).resolve().parents[2]
FIXTURES = ROOT / "docs/android/face-parity/fixtures.json"
MEAN_RGB = np.array([122.782, 117.001, 104.298], dtype=np.float32)

# Toleransi dari docs/android/face-parity/README.md §4.
TOL_ELEMENT = 1e-3
TOL_DESCRIPTOR_L2 = 5e-3
TOL_LANDMARK_PX = 0.5
TOL_PIPELINE_L2 = 1e-2


# ---------------------------------------------------------------- bobot

def load_weights(weights_dir: Path, name: str) -> dict:
    index = json.loads((weights_dir / f"{name}.json").read_text(encoding="utf-8"))
    blob = (weights_dir / f"{name}.bin").read_bytes()
    params = {}
    for entry in index["params"]:
        count = int(np.prod(entry["shape"])) if entry["shape"] else 1
        values = np.frombuffer(blob, dtype="<f4", count=count, offset=entry["offset"])
        params[entry["path"]] = tf.constant(values.reshape(entry["shape"]))
    return params


# ---------------------------------------------------------------- FaceRecognitionNet

class FaceRecognitionNet(tf.Module):
    """faceRecognitionNet/FaceRecognitionNet.js + convLayer.js + residualLayer.js + scaleLayer.js."""

    BLOCKS = [
        ("conv32_1", False), ("conv32_2", False), ("conv32_3", False),
        ("conv64_down", True), ("conv64_1", False), ("conv64_2", False), ("conv64_3", False),
        ("conv128_down", True), ("conv128_1", False), ("conv128_2", False),
        ("conv256_down", True), ("conv256_1", False), ("conv256_2", False),
        ("conv256_down_out", True),
    ]

    def __init__(self, params: dict):
        super().__init__()
        self.p = params

    def _conv(self, x, prefix, stride, relu, padding="SAME"):
        out = tf.nn.conv2d(x, self.p[f"{prefix}/conv/filters"], [1, stride, stride, 1], padding)
        out = out + self.p[f"{prefix}/conv/bias"]
        out = out * self.p[f"{prefix}/scale/weights"] + self.p[f"{prefix}/scale/biases"]
        return tf.nn.relu(out) if relu else out

    def _residual(self, x, prefix):
        out = self._conv(x, f"{prefix}/conv1", 1, True)
        out = self._conv(out, f"{prefix}/conv2", 1, False)
        return tf.nn.relu(out + x)

    def _residual_down(self, x, prefix):
        out = self._conv(x, f"{prefix}/conv1", 2, True, "VALID")
        out = self._conv(out, f"{prefix}/conv2", 1, False)
        pooled = tf.nn.avg_pool2d(x, 2, 2, "VALID")
        # Bentuk statis: face-api menambah baris/kolom nol di akhir bila ukuran spasial berbeda,
        # dan menggandakan kanal pooled dengan nol bila jumlah kanal berbeda.
        if pooled.shape[1] != out.shape[1] or pooled.shape[2] != out.shape[2]:
            out = tf.pad(out, [[0, 0], [0, pooled.shape[1] - out.shape[1]], [0, pooled.shape[2] - out.shape[2]], [0, 0]])
        if pooled.shape[3] != out.shape[3]:
            pooled = tf.concat([pooled, tf.zeros_like(pooled)], axis=3)
        return tf.nn.relu(pooled + out)

    @tf.function(input_signature=[tf.TensorSpec([1, 150, 150, 3], tf.float32, name="rgb_0_255")])
    def __call__(self, rgb):
        x = (rgb - MEAN_RGB) / 256.0
        out = self._conv(x, "conv32_down", 2, True, "VALID")
        out = tf.nn.max_pool2d(out, 3, 2, "VALID")
        for prefix, down in self.BLOCKS:
            out = self._residual_down(out, prefix) if down else self._residual(out, prefix)
        out = tf.reduce_mean(out, axis=[1, 2])
        return tf.identity(tf.matmul(out, self.p["fc"]), name="descriptor")


# ---------------------------------------------------------------- FaceLandmark68Net

class FaceLandmark68Net(tf.Module):
    """faceFeatureExtractor/FaceFeatureExtractor.js + denseBlock.js (denseBlock4) + fullyConnectedLayer.js."""

    def __init__(self, params: dict):
        super().__init__()
        self.p = params

    def _sep(self, x, prefix, stride):
        out = tf.nn.separable_conv2d(
            x, self.p[f"{prefix}/depthwise_filter"], self.p[f"{prefix}/pointwise_filter"], [1, stride, stride, 1], "SAME"
        )
        return out + self.p[f"{prefix}/bias"]

    def _dense_block4(self, x, prefix, first):
        if first:
            out1 = tf.nn.conv2d(x, self.p[f"{prefix}/conv0/filters"], [1, 2, 2, 1], "SAME") + self.p[f"{prefix}/conv0/bias"]
        else:
            out1 = self._sep(x, f"{prefix}/conv0", 2)
        out1 = tf.nn.relu(out1)
        out2 = self._sep(out1, f"{prefix}/conv1", 1)
        in3 = tf.nn.relu(out1 + out2)
        out3 = self._sep(in3, f"{prefix}/conv2", 1)
        in4 = tf.nn.relu(out1 + (out2 + out3))
        out4 = self._sep(in4, f"{prefix}/conv3", 1)
        return tf.nn.relu(out1 + (out2 + (out3 + out4)))

    @tf.function(input_signature=[tf.TensorSpec([1, 112, 112, 3], tf.float32, name="rgb_0_255")])
    def __call__(self, rgb):
        x = (rgb - MEAN_RGB) / 255.0
        for i in range(4):
            x = self._dense_block4(x, f"faceFeatureExtractor/dense{i}", first=(i == 0))
        x = tf.nn.avg_pool2d(x, 7, 2, "VALID")
        x = tf.reshape(x, [1, -1])
        return tf.identity(tf.matmul(x, self.p["fc/weights"]) + self.p["fc/bias"], name="landmarks")


# ---------------------------------------------------------------- preprocessing referensi (jalur tensor face-api.js)

def pad_to_square(img: np.ndarray) -> np.ndarray:
    """ops/padToSquare.js (isCenterImage=true): akhir = round(d/2) (JS Math.round), awal = d - akhir."""
    h, w = img.shape[:2]
    if h == w:
        return img
    diff = abs(h - w)
    end = math.floor(diff * 0.5 + 0.5)
    start = diff - end
    pad = [(start, end), (0, 0), (0, 0)] if h < w else [(0, 0), (start, end), (0, 0)]
    return np.pad(img, pad, constant_values=0)


def to_square_input(img: np.ndarray, size: int) -> np.ndarray:
    """NetInput.toBatchTensor: pad ke persegi lalu tf.image.resizeBilinear (alignCorners=false, tanpa half-pixel)."""
    square = pad_to_square(img.astype(np.float32))
    batch = square[None]
    if square.shape[0] != size:
        batch = tf.compat.v1.image.resize_bilinear(batch, [size, size], align_corners=False, half_pixel_centers=False).numpy()
    return batch.astype(np.float32)


def landmarks_relative(raw: np.ndarray, crop_w: int, crop_h: int) -> np.ndarray:
    """FaceLandmark68NetBase.postProcess: output relatif persegi 112 -> relatif terhadap crop asli."""
    scale = 112 / max(crop_w, crop_h)
    w, h = crop_w * scale, crop_h * scale
    pad_x = abs(w - h) / 2 if w < h else 0.0
    pad_y = abs(w - h) / 2 if h < w else 0.0
    xy = raw.reshape(68, 2) * 112
    return np.stack([(xy[:, 0] - pad_x) / w, (xy[:, 1] - pad_y) / h], axis=1)


def dlib_rect(points: np.ndarray, width: int, height: int) -> dict:
    """FaceLandmarks.alignDlib + Box.clipAtImageBorders (dipakai extractFaceTensors)."""
    left, right, mouth = points[36:42].mean(0), points[42:48].mean(0), points[48:68].mean(0)
    dist = lambda a, b: float(np.hypot(*(a - b)))
    size = math.floor((dist(mouth, left) + dist(mouth, right)) / 2 / 0.45)
    ref = (left + right + mouth) / 3
    x = math.floor(max(0, ref[0] - 0.5 * size))
    y = math.floor(max(0, ref[1] - 0.43 * size))
    return {"x": x, "y": y, "width": min(size, width + x), "height": min(size, height + y)}


def crop(img: np.ndarray, box: dict) -> np.ndarray:
    h, w = img.shape[:2]
    x, y = max(box["x"], 0), max(box["y"], 0)
    cw = math.floor(min(box["x"] + box["width"] - x, w - x))
    ch = math.floor(min(box["y"] + box["height"] - y, h - y))
    return img[math.floor(y):math.floor(y) + ch, math.floor(x):math.floor(x) + cw]


def read_input(entry: dict) -> np.ndarray:
    data = (FIXTURES.parent / entry["file"]).read_bytes()
    assert hashlib.sha256(data).hexdigest() == entry["sha256"], f"SHA-256 input {entry['file']} tidak cocok"
    return np.frombuffer(data, dtype=np.uint8).reshape(entry["height"], entry["width"], 3)


# ---------------------------------------------------------------- verifikasi

def compare(actual, expected) -> dict:
    a, e = np.asarray(actual, np.float64).ravel(), np.asarray(expected, np.float64).ravel()
    if a.shape != e.shape or not np.isfinite(a).all() or not np.isfinite(e).all():
        raise ValueError("Output/reference shape mismatch or non-finite values")
    if np.linalg.norm(a) == 0 or np.linalg.norm(e) == 0:
        raise ValueError("Cannot compare a zero-norm descriptor")
    l2 = lambda v: v / np.linalg.norm(v)
    return {"max_abs": float(np.abs(a - e).max()), "l2_distance": float(np.linalg.norm(l2(a) - l2(e)))}


def verify(run_landmark, run_recognition, fixtures: dict) -> dict:
    """Jalankan semua fixture dengan fungsi inferensi tertentu (TF atau TFLite)."""
    results, ok = {"recognition": [], "pipeline": {}}, True

    for item in fixtures["recognition"]:
        descriptor = run_recognition(to_square_input(read_input(item["input"]), 150))
        stats = compare(descriptor, item["descriptor_raw"])
        stats["pass"] = stats["max_abs"] <= TOL_ELEMENT and stats["l2_distance"] <= TOL_DESCRIPTOR_L2
        ok &= stats["pass"]
        results["recognition"].append({"name": item["name"], **stats})

    pipe = fixtures["pipeline"]
    image = read_input(pipe["image"])
    box = pipe["detection_box"]
    face = crop(image, box)
    rel = landmarks_relative(run_landmark(to_square_input(face, 112)), face.shape[1], face.shape[0])
    points = rel * [face.shape[1], face.shape[0]] + [box["x"], box["y"]]
    if not np.isfinite(points).all():
        raise ValueError("Non-finite landmarks")
    expected_points = np.array([[p["x"], p["y"]] for p in pipe["landmarks_image_px"]])
    landmark_err = float(np.abs(points - expected_points).max())
    rect = dlib_rect(points, image.shape[1], image.shape[0])
    descriptor = run_recognition(to_square_input(crop(image, rect), 150))
    stats = compare(descriptor, pipe["descriptor_raw"])
    results["pipeline"] = {
        "landmark_max_px": landmark_err,
        "aligned_rect": rect,
        "aligned_rect_match": rect == pipe["aligned_rect"],
        **stats,
    }
    results["pipeline"]["pass"] = (
        landmark_err <= TOL_LANDMARK_PX and rect == pipe["aligned_rect"] and stats["l2_distance"] <= TOL_PIPELINE_L2
    )
    ok &= results["pipeline"]["pass"]
    results["pass"] = bool(ok)
    return results


def tflite_runner(model_bytes: bytes, input_size: int, output_size: int):
    # TF 2.16.1's Windows XNNPACK delegate crashes during interpreter cleanup
    # on this host (0xC0000374). Use optimized built-in CPU kernels for parity;
    # Android delegates must be validated separately on the target device.
    interpreter = tf.lite.Interpreter(
        model_content=model_bytes,
        num_threads=1,
        experimental_op_resolver_type=tf.lite.experimental.OpResolverType.BUILTIN_WITHOUT_DEFAULT_DELEGATES,
    )
    interpreter.allocate_tensors()
    inp, out = interpreter.get_input_details()[0], interpreter.get_output_details()[0]
    if (inp["shape"].tolist() != [1, input_size, input_size, 3]
            or out["shape"].tolist() != [1, output_size]
            or inp["dtype"] != np.float32 or out["dtype"] != np.float32):
        raise ValueError("TFLite model does not satisfy the Android float32 tensor contract")

    def run(x):
        interpreter.set_tensor(inp["index"], x)
        interpreter.invoke()
        return interpreter.get_tensor(out["index"])[0].copy()

    return run, interpreter


def model_info(model_bytes: bytes, interpreter) -> dict:
    ops = sorted({d["op_name"] for d in interpreter._get_ops_details()})
    describe = lambda d: {"name": d["name"], "shape": d["shape"].tolist(), "dtype": np.dtype(d["dtype"]).name}
    return {
        "bytes": len(model_bytes),
        "sha256": hashlib.sha256(model_bytes).hexdigest(),
        "inputs": [describe(d) for d in interpreter.get_input_details()],
        "outputs": [describe(d) for d in interpreter.get_output_details()],
        "ops": ops,
    }


def convert(module: tf.Module) -> bytes:
    converter = tf.lite.TFLiteConverter.from_concrete_functions([module.__call__.get_concrete_function()], module)
    converter.optimizations = []  # fp32 murni: tanpa kuantisasi, tanpa fp16
    converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS]
    return converter.convert()


def main(weights_dir: Path, out_dir: Path) -> int:
    out_dir.mkdir(parents=True, exist_ok=True)
    report_path = out_dir / "conversion_report.json"
    report_path.write_text(json.dumps({"pass": False, "state": "running"}) + "\n", encoding="utf-8")
    fixtures = json.loads(FIXTURES.read_text(encoding="utf-8"))
    for source in fixtures["models"]:
        source_path = ROOT / source["file"]
        if hashlib.sha256(source_path.read_bytes()).hexdigest() != source["sha256"]:
            raise ValueError(f"Source weight hash mismatch: {source['file']}")
    landmark = FaceLandmark68Net(load_weights(weights_dir, "face_landmark_68"))
    recognition = FaceRecognitionNet(load_weights(weights_dir, "face_recognition"))

    tf_result = verify(lambda x: landmark(x).numpy()[0], lambda x: recognition(x).numpy()[0], fixtures)

    models, runners, model_bytes = {}, {}, {}
    for name, module in [("face_landmark_68", landmark), ("face_recognition", recognition)]:
        data = convert(module)
        input_size, output_size = (112, 136) if name == "face_landmark_68" else (150, 128)
        runners[name], interpreter = tflite_runner(data, input_size, output_size)
        models[name] = model_info(data, interpreter)
        model_bytes[name] = data

    tflite_result = verify(runners["face_landmark_68"], runners["face_recognition"], fixtures)

    report = {
        "tensorflow_version": tf.__version__,
        "python_version": sys.version,
        "numpy_version": np.__version__,
        "converter_sha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        "runtime": {
            "tflite_resolver": "BUILTIN_WITHOUT_DEFAULT_DELEGATES",
            "num_threads": 1,
            "TF_ENABLE_ONEDNN_OPTS": os.environ.get("TF_ENABLE_ONEDNN_OPTS", "default"),
        },
        "android_contract": {
            "input": "float32 NHWC RGB 0..255 after centered zero padding and resize",
            "normalization": "inside models; Android must not normalize again",
            "mirror": "inference pixels are not mirrored; preview may be mirrored",
            "resize": "bilinear align_corners=false half_pixel_centers=false",
            "embedding_output": "raw 128-dimensional descriptor, no L2 inside model",
        },
        "source": {
            "face_api_version": fixtures["face_api_version"],
            "weights": fixtures["models"],
            "fixtures_sha256": hashlib.sha256(FIXTURES.read_bytes()).hexdigest(),
        },
        "tolerances": {
            "element_max_abs": TOL_ELEMENT,
            "descriptor_l2": TOL_DESCRIPTOR_L2,
            "landmark_px": TOL_LANDMARK_PX,
            "pipeline_descriptor_l2": TOL_PIPELINE_L2,
        },
        "models": models,
        "verification": {"tensorflow": tf_result, "tflite": tflite_result},
        "pass": bool(tf_result["pass"] and tflite_result["pass"]),
    }
    if report["pass"]:
        for name, data in model_bytes.items():
            (out_dir / f"{name}.tflite").write_bytes(data)
    report_path.write_text(json.dumps(report, indent=2, allow_nan=False) + "\n", encoding="utf-8")
    print(json.dumps({"pass": report["pass"], "tf": tf_result, "tflite": tflite_result}, indent=2), flush=True)
    return 0 if report["pass"] else 1


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    sys.exit(main(Path(sys.argv[1]), Path(sys.argv[2])))
