/**
 * Membuat fixture paritas descriptor wajah untuk Android dari model face-api.js yang dipakai web.
 *
 *   node scripts/face-parity/generate-fixtures.cjs
 *
 * Semua input adalah gambar sintetis deterministik (bukan wajah orang), sehingga fixture tidak
 * mengandung data biometrik. Inferensi memakai jalur tensor face-api.js (backend CPU tfjs-core),
 * yang deterministik; jalur canvas browser bergantung pada interpolasi browser.
 * Output: docs/android/face-parity/
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const faceapi = require('face-api.js');

const tf = faceapi.tf;
const ROOT = path.join(__dirname, '../..');
const MODELS = path.join(ROOT, 'public/models');
const OUT = path.join(ROOT, 'docs/android/face-parity');
const INPUTS = path.join(OUT, 'inputs');

const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');
const round = (v) => Number(v.toPrecision(9));
const l2 = (v) => {
    const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
    return v.map((x) => x / norm);
};
const euclidean = (a, b) => Math.sqrt(a.reduce((s, x, i) => s + (x - b[i]) ** 2, 0));

/** xorshift32, seed > 0. Dipakai untuk membuat ulang input di Android tanpa file biner. */
function xorshift32(seed) {
    let state = seed >>> 0;
    return () => {
        state ^= state << 13; state >>>= 0;
        state ^= state >>> 17;
        state ^= state << 5; state >>>= 0;
        return state;
    };
}

/**
 * Gambar sintetis RGB uint8 (HWC). Pola: gradien halus + derau xorshift32, agar nilai piksel
 * tersebar 0..255 dan seluruh jaringan teraktivasi.
 *   v = (x * gx + y * gy + c * 85 + (rand() & noiseMask)) & 255
 */
function syntheticImage({ width, height, seed, gx, gy, noiseMask }) {
    const rand = xorshift32(seed);
    const data = new Uint8Array(width * height * 3);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            for (let c = 0; c < 3; c++) {
                data[(y * width + x) * 3 + c] = (x * gx + y * gy + c * 85 + (rand() & noiseMask)) & 255;
            }
        }
    }
    return data;
}

function saveInput(name, spec, data) {
    const file = `inputs/${name}.rgb`;
    fs.writeFileSync(path.join(OUT, file), Buffer.from(data));
    return {
        file,
        format: 'RGB uint8, HWC, baris dari atas, tanpa header',
        width: spec.width,
        height: spec.height,
        generator: { algorithm: 'syntheticImage + xorshift32 (lihat README)', ...spec },
        sha256: sha256(Buffer.from(data)),
    };
}

const toTensor = (data, width, height) => tf.tensor3d(data, [height, width, 3], 'int32');
const vector = (typed) => Array.from(typed).map(round);

async function main() {
    fs.mkdirSync(INPUTS, { recursive: true });
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS);

    const models = fs.readdirSync(MODELS)
        .filter((f) => f.startsWith('face_recognition_model') || f.startsWith('face_landmark_68_model'))
        .sort()
        .map((f) => ({ file: `public/models/${f}`, bytes: fs.statSync(path.join(MODELS, f)).size, sha256: sha256(fs.readFileSync(path.join(MODELS, f))) }));

    // 1) Embedding: input sudah berupa crop 150x150 hasil preprocessing (tanpa pad/resize).
    const recognitionSpecs = [
        { name: 'recog_150_a', width: 150, height: 150, seed: 1, gx: 1, gy: 2, noiseMask: 63 },
        { name: 'recog_150_b', width: 150, height: 150, seed: 2, gx: 3, gy: 1, noiseMask: 63 },
        { name: 'recog_150_c', width: 150, height: 150, seed: 3, gx: 0, gy: 0, noiseMask: 255 },
        // Bukan persegi: menguji pad-ke-persegi (nol, di tengah) lalu resize bilinear ke 150.
        { name: 'recog_120x150_pad', width: 120, height: 150, seed: 4, gx: 2, gy: 1, noiseMask: 31 },
    ];
    const recognition = [];
    for (const { name, ...spec } of recognitionSpecs) {
        const data = syntheticImage(spec);
        const descriptor = vector(await faceapi.nets.faceRecognitionNet.computeFaceDescriptor(toTensor(data, spec.width, spec.height)));
        recognition.push({
            name,
            input: saveInput(name, spec, data),
            descriptor_raw: descriptor,
            descriptor_l2: l2(descriptor).map(round),
            raw_l2_norm: round(Math.sqrt(descriptor.reduce((s, x) => s + x * x, 0))),
        });
    }

    const distances = [];
    for (let i = 0; i < recognition.length; i++) {
        for (let j = i + 1; j < recognition.length; j++) {
            distances.push({
                a: recognition[i].name,
                b: recognition[j].name,
                euclidean_raw: round(euclidean(recognition[i].descriptor_raw, recognition[j].descriptor_raw)),
                euclidean_l2: round(euclidean(l2(recognition[i].descriptor_raw), l2(recognition[j].descriptor_raw))),
            });
        }
    }

    // 2) Pipeline penuh tanpa detektor: kotak deteksi tetap -> landmark 68 -> crop dlib -> descriptor.
    const imageSpec = { width: 320, height: 240, seed: 7, gx: 1, gy: 1, noiseMask: 127 };
    const image = syntheticImage(imageSpec);
    const imageTensor = toTensor(image, imageSpec.width, imageSpec.height);
    const detectionBox = new faceapi.Box({ x: 96, y: 40, width: 128, height: 150 });

    const [landmarkCrop] = await faceapi.extractFaceTensors(imageTensor, [detectionBox]);
    const landmarksRelative = await faceapi.nets.faceLandmark68Net.detectLandmarks(landmarkCrop);
    const landmarks = landmarksRelative.shiftBy(detectionBox.x, detectionBox.y);
    const alignedRect = landmarks.align(null, { useDlibAlignment: true });
    const [faceCrop] = await faceapi.extractFaceTensors(imageTensor, [alignedRect]);
    const pipelineDescriptor = vector(await faceapi.nets.faceRecognitionNet.computeFaceDescriptor(faceCrop));
    const [leftEye, rightEye, mouth] = landmarks.getRefPointsForAlignment();
    const point = (p) => ({ x: round(p.x), y: round(p.y) });

    const pipeline = {
        name: 'pipeline_320x240',
        image: saveInput('pipeline_320x240', imageSpec, image),
        detection_box: { x: detectionBox.x, y: detectionBox.y, width: detectionBox.width, height: detectionBox.height },
        landmark_crop_size: { width: landmarkCrop.shape[1], height: landmarkCrop.shape[0] },
        landmarks_relative_to_crop: landmarksRelative.relativePositions.map(point),
        landmarks_image_px: landmarks.positions.map(point),
        alignment_ref_points: { left_eye_center: point(leftEye), right_eye_center: point(rightEye), mouth_center: point(mouth) },
        aligned_rect: { x: alignedRect.x, y: alignedRect.y, width: alignedRect.width, height: alignedRect.height },
        face_crop_size: { width: faceCrop.shape[1], height: faceCrop.shape[0] },
        descriptor_raw: pipelineDescriptor,
        descriptor_l2: l2(pipelineDescriptor).map(round),
    };

    // Port alignDlib di bawah harus identik dengan face-api.js pada pipeline nyata.
    const ported = dlibRect({ image: imageSpec, left_eye_center: leftEye, right_eye_center: rightEye, mouth_center: mouth });
    if (JSON.stringify(ported) !== JSON.stringify(pipeline.aligned_rect)) {
        throw new Error(`dlibRect berbeda dari face-api: ${JSON.stringify(ported)} vs ${JSON.stringify(pipeline.aligned_rect)}`);
    }

    // 3) Kasus alignment murni (tanpa model): titik referensi -> kotak crop.
    const alignmentCases = [
        { image: { width: 640, height: 480 }, left_eye_center: { x: 280, y: 200 }, right_eye_center: { x: 360, y: 200 }, mouth_center: { x: 320, y: 290 } },
        { image: { width: 480, height: 640 }, left_eye_center: { x: 20, y: 30 }, right_eye_center: { x: 70, y: 32 }, mouth_center: { x: 44, y: 90 } },
    ].map((c) => ({ ...c, expected_rect: dlibRect(c) }));

    const fixtures = {
        schema: 1,
        generated_by: 'scripts/face-parity/generate-fixtures.cjs',
        face_api_version: require('face-api.js/package.json').version,
        tfjs_core_version: tf.version_core,
        tf_backend: tf.getBackend(),
        models,
        preprocessing: {
            landmark_net: { input_size: 112, pad_to_square: 'nol, gambar di tengah', resize: 'tf.image.resizeBilinear (alignCorners=false)', normalize: '(px - [122.782, 117.001, 104.298]) / 255' },
            recognition_net: { input_size: 150, pad_to_square: 'nol, gambar di tengah', resize: 'tf.image.resizeBilinear (alignCorners=false)', normalize: '(px - [122.782, 117.001, 104.298]) / 256', channel_order: 'RGB' },
        },
        recognition,
        distances,
        pipeline,
        alignment_cases: alignmentCases,
    };

    fs.writeFileSync(path.join(OUT, 'fixtures.json'), `${JSON.stringify(fixtures, null, 2)}\n`);
    console.log(`fixtures.json ditulis ke ${path.relative(ROOT, OUT)} (backend ${tf.getBackend()})`);
}

/** Port langsung FaceLandmarks.alignDlib (face-api.js 0.22.2) untuk kasus uji tanpa model. */
function dlibRect({ image, left_eye_center: l, right_eye_center: r, mouth_center: m }) {
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const size = Math.floor((dist(m, l) + dist(m, r)) / 2 / 0.45);
    const ref = { x: (l.x + r.x + m.x) / 3, y: (l.y + r.y + m.y) / 3 };
    const x = Math.floor(Math.max(0, ref.x - 0.5 * size));
    const y = Math.floor(Math.max(0, ref.y - 0.43 * size));
    // Sama dengan face-api: lebar/tinggi tidak dipotong di sini; dipotong saat crop (clipAtImageBorders).
    return { x, y, width: Math.min(size, image.width + x), height: Math.min(size, image.height + y) };
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
