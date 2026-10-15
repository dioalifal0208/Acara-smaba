/**
 * Pendaftaran wajah (menghadap depan) berbasis face-api.js.
 *
 * Kualitas tiap frame diperiksa ketat memakai 68 titik landmark wajah: wajah utuh di area
 * yang terlihat, di tengah, lurus menghadap kamera, cukup terang, mata terbuka, dan diam.
 * Beberapa sampel wajah depan diambil sebagai data acuan presensi.
 */
import * as faceapi from 'face-api.js';
import { MODEL_URL } from '@/lib/appUrl';

let modelsPromise = null;

export function loadEnrollmentModels() {
    modelsPromise ??= Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]).catch((error) => {
        modelsPromise = null;
        throw error;
    });

    return modelsPromise;
}

export const DETECTOR_OPTIONS = () => new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 });

export const ENROLLMENT_TIMEOUT_SECONDS = 60;

/** Jumlah sampel wajah depan yang disimpan (server mewajibkan minimal 3). */
export const FRONT_SAMPLES = 3;

/** Frame stabil berturut-turut sebelum satu sampel diambil. */
export const STABLE_FRAMES = 5;

/** Jarak maksimum antar sampel ke sampel pertama (harus orang yang sama). */
export const SAME_PERSON_MAX_DISTANCE = 0.5;

const LIMITS = {
    minScore: 0.75,
    edgeMargin: 0.04, // wajah + titik landmark wajib berada di dalam area terlihat dengan margin 4%
    minHeight: 0.32, // tinggi kotak wajah relatif tinggi area terlihat
    maxHeight: 0.85,
    maxCenterOffsetX: 0.15,
    maxCenterOffsetY: 0.18,
    maxRollDeg: 12,
    minBrightness: 65,
    maxBrightness: 215,
    eyesOpenEar: 0.2,
    frontalYaw: 0.1,
    stableMove: 0.03, // pergeseran pusat wajah antar frame relatif lebar frame
};

const mean = (points) => ({
    x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
    y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
});

const eyeAspectRatio = (p) => {
    const v1 = Math.hypot(p[1].x - p[5].x, p[1].y - p[5].y);
    const v2 = Math.hypot(p[2].x - p[4].x, p[2].y - p[4].y);
    const h = Math.hypot(p[0].x - p[3].x, p[0].y - p[3].y);
    return h > 0 ? (v1 + v2) / (2 * h) : 0;
};

/**
 * Estimasi pose kepala dari landmark 68 titik (koordinat kamera asli, belum dicerminkan).
 * yaw: posisi ujung hidung relatif titik tengah kedua mata, dinormalisasi jarak antar mata.
 */
export function estimatePose(landmarks) {
    const p = landmarks.positions;
    const leftEye = mean(p.slice(36, 42));
    const rightEye = mean(p.slice(42, 48));
    const eyesMid = { x: (leftEye.x + rightEye.x) / 2, y: (leftEye.y + rightEye.y) / 2 };
    const interocular = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y) || 1;
    const nose = p[30];

    return {
        yaw: (nose.x - eyesMid.x) / interocular,
        rollDeg: (Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * 180) / Math.PI,
        ear: Math.min(eyeAspectRatio(p.slice(36, 42)), eyeAspectRatio(p.slice(42, 48))),
    };
}

/** Rata-rata kecerahan area wajah (0-255). */
export function faceBrightness(video, box, sampler) {
    try {
        const size = 24;
        sampler.width = size;
        sampler.height = size;
        const ctx = sampler.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(video, box.x, box.y, box.width, box.height, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        let total = 0;
        for (let i = 0; i < data.length; i += 4) {
            total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        }
        return total / (data.length / 4);
    } catch {
        return 128;
    }
}

/**
 * Bagian frame kamera yang benar-benar terlihat di layar. Video ditampilkan dengan
 * `object-cover`, jadi frame landscape di wadah portrait terpotong kiri-kanan.
 */
export function visibleRegion(video) {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const cw = video.clientWidth || vw;
    const ch = video.clientHeight || vh;
    const scale = Math.max(cw / vw, ch / vh);
    const width = Math.min(vw, cw / scale);
    const height = Math.min(vh, ch / scale);

    return { x: (vw - width) / 2, y: (vh - height) / 2, width, height };
}

/**
 * Periksa kualitas satu frame wajah depan terhadap area yang terlihat (`frame` dari visibleRegion).
 * Mengembalikan { ok, hint, pose }.
 */
export function assessFace(detection, frame, brightness) {
    const { x: X0 = 0, y: Y0 = 0, width: W, height: H } = frame;
    const box = detection.detection.box;
    const pose = estimatePose(detection.landmarks);
    const fail = (hint) => ({ ok: false, hint, pose });

    if (detection.detection.score < LIMITS.minScore) {
        return fail('Wajah kurang jelas. Hadapkan wajah ke kamera dan pastikan tidak tertutup.');
    }

    const mx = W * LIMITS.edgeMargin;
    const my = H * LIMITS.edgeMargin;
    const outside = (x, y) => x < X0 + mx || y < Y0 + my || x > X0 + W - mx || y > Y0 + H - my;
    if (outside(box.x, box.y) || outside(box.x + box.width, box.y + box.height)
        || detection.landmarks.positions.some((pt) => outside(pt.x, pt.y))) {
        return fail('Wajah terpotong. Mundur sedikit hingga seluruh wajah masuk ke dalam bingkai.');
    }

    const heightRatio = box.height / H;
    if (heightRatio < LIMITS.minHeight) return fail('Wajah terlalu jauh. Dekatkan wajah ke kamera.');
    if (heightRatio > LIMITS.maxHeight) return fail('Wajah terlalu dekat. Mundur sedikit.');

    const cx = (box.x - X0 + box.width / 2) / W - 0.5;
    const cy = (box.y - Y0 + box.height / 2) / H - 0.5;
    if (Math.abs(cx) > LIMITS.maxCenterOffsetX || Math.abs(cy) > LIMITS.maxCenterOffsetY) {
        return fail('Posisikan wajah tepat di tengah bingkai.');
    }

    if (Math.abs(pose.rollDeg) > LIMITS.maxRollDeg) return fail('Luruskan kepala, jangan dimiringkan.');
    if (Math.abs(pose.yaw) > LIMITS.frontalYaw) return fail('Hadapkan wajah lurus ke kamera.');
    if (brightness < LIMITS.minBrightness) return fail('Pencahayaan terlalu gelap. Cari tempat yang lebih terang.');
    if (brightness > LIMITS.maxBrightness) return fail('Wajah terlalu silau. Hindari cahaya langsung dari belakang/depan.');
    if (pose.ear < LIMITS.eyesOpenEar) return fail('Buka mata dan lihat ke kamera.');

    return { ok: true, hint: null, pose };
}

export function isStable(previousBox, box, frameWidth) {
    if (!previousBox) return false;
    const dx = (previousBox.x + previousBox.width / 2) - (box.x + box.width / 2);
    const dy = (previousBox.y + previousBox.height / 2) - (box.y + box.height / 2);
    return Math.hypot(dx, dy) / frameWidth <= LIMITS.stableMove
        && Math.abs(previousBox.height - box.height) / box.height <= 0.08;
}
