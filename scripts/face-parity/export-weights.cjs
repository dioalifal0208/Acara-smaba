/**
 * Ekspor bobot face-api.js yang SUDAH di-decode tfjs (termasuk de-kuantisasi uint8) agar konversi
 * TFLite memakai angka yang persis sama dengan web.
 *
 *   node scripts/face-parity/export-weights.cjs <folder-output>
 *
 * Output per model: <nama>.json (daftar {path, shape, offset}) + <nama>.bin (float32 little-endian).
 */
const fs = require('fs');
const path = require('path');
const faceapi = require('face-api.js');

const MODELS = path.join(__dirname, '../../public/models');

function paramList(net) {
    // FaceLandmark68Net menyimpan feature extractor sebagai jaringan terpisah.
    const own = net.getParamList();
    const extractor = net.faceFeatureExtractor ? net.faceFeatureExtractor.getParamList().map((p) => ({ ...p, path: `faceFeatureExtractor/${p.path}` })) : [];
    return [...extractor, ...own];
}

async function exportNet(net, name, outDir) {
    const entries = [];
    const chunks = [];
    let offset = 0;
    for (const { path: paramPath, tensor } of paramList(net)) {
        const data = Buffer.from(new Float32Array(await tensor.data()).buffer);
        entries.push({ path: paramPath, shape: tensor.shape, offset });
        chunks.push(data);
        offset += data.length;
    }
    fs.writeFileSync(path.join(outDir, `${name}.bin`), Buffer.concat(chunks));
    fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify({ name, endianness: 'little', dtype: 'float32', params: entries }, null, 1));
    console.log(`${name}: ${entries.length} tensor, ${offset} byte`);
}

(async () => {
    const outDir = process.argv[2];
    if (!outDir) throw new Error('Pakai: node export-weights.cjs <folder-output>');
    fs.mkdirSync(outDir, { recursive: true });
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS);
    await exportNet(faceapi.nets.faceRecognitionNet, 'face_recognition', outDir);
    await exportNet(faceapi.nets.faceLandmark68Net, 'face_landmark_68', outDir);
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
