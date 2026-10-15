/**
 * Verifikasi wajah hidup (anti foto/layar) tanpa kedip dan tanpa toleh.
 *
 * 1. Tantangan senyum: pengguna mulai dengan wajah biasa lalu tersenyum. Foto (tersenyum atau
 *    tidak) tidak bisa berganti ekspresi. Ekspresi dibaca faceExpressionNet face-api.js.
 * 2. Cek 3D pasif: wajah asli berbentuk 3D, jadi saat kepala bergerak titik hidung bergeser
 *    tidak seragam terhadap kontur wajah. Foto/layar itu datar: bila dimiringkan, seluruh 68 titik
 *    bergerak seperti satu bidang (pas dengan transformasi affine). Bila gerakan "bidang datar"
 *    terdeteksi berulang, wajah ditolak. Bila gerakan terlalu kecil untuk dinilai, cek ini tidak
 *    menolak (keputusan diserahkan ke tantangan senyum) agar pengguna asli yang diam tidak ditolak.
 *
 * Catatan: pemeriksaan di browser menahan foto cetak/layar, tetapi bukan pengamanan mutlak.
 */
import * as faceapi from 'face-api.js';

const NEUTRAL_MAX_HAPPY = 0.3;
const SMILE_MIN_HAPPY = 0.7;
const NEUTRAL_FRAMES = 3;
const SMILE_FRAMES = 2;
/** Jarak maksimum descriptor wajah biasa vs saat tersenyum (harus orang yang sama). */
const SAME_PERSON_MAX_DISTANCE = 0.6;

const FLAT = {
    minAnisotropy: 0.05, // perubahan bentuk (miring/menoleh) minimal agar frame bisa dinilai
    maxResidual: 0.02, // sisa non-affine relatif jarak antar mata; di bawah ini = bergerak seperti bidang datar
    votesNeeded: 3,
};

const toPoints = (landmarks) => landmarks.positions.map((p) => [p.x, p.y]);

const interocular = (pts) => {
    const avg = (from, to) => {
        const slice = pts.slice(from, to);
        return [slice.reduce((s, p) => s + p[0], 0) / slice.length, slice.reduce((s, p) => s + p[1], 0) / slice.length];
    };
    const [lx, ly] = avg(36, 42);
    const [rx, ry] = avg(42, 48);
    return Math.hypot(rx - lx, ry - ly) || 1;
};

/** Solusi sistem linear 3x3 (aturan Cramer). */
const solve3 = (m, v) => {
    const det = (a) => a[0][0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1])
        - a[0][1] * (a[1][0] * a[2][2] - a[1][2] * a[2][0])
        + a[0][2] * (a[1][0] * a[2][1] - a[1][1] * a[2][0]);
    const d = det(m);
    if (Math.abs(d) < 1e-9) return null;
    return [0, 1, 2].map((col) => det(m.map((row, i) => row.map((value, j) => (j === col ? v[i] : value)))) / d);
};

/** Transformasi affine least-squares yang memetakan `src` ke `dst`. */
function fitAffine(src, dst) {
    const ata = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    const atx = [0, 0, 0];
    const aty = [0, 0, 0];
    src.forEach(([x, y], i) => {
        const row = [x, y, 1];
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) ata[r][c] += row[r] * row[c];
            atx[r] += row[r] * dst[i][0];
            aty[r] += row[r] * dst[i][1];
        }
    });
    const px = solve3(ata, atx);
    const py = solve3(ata, aty);
    return px && py ? { a: px[0], b: px[1], c: px[2], d: py[0], e: py[1], f: py[2] } : null;
}

/** Seberapa tidak seragam skala transformasi (0 = hanya geser/putar/zoom, tanpa perubahan bentuk). */
function anisotropy({ a, b, d, e }) {
    const p = a * a + b * b + d * d + e * e;
    const q = Math.sqrt(Math.max(0, (a * a + b * b - d * d - e * e) ** 2 + 4 * (a * d + b * e) ** 2));
    const s1 = Math.sqrt((p + q) / 2);
    const s2 = Math.sqrt(Math.max(1e-12, (p - q) / 2));
    return s1 / s2 - 1;
}

/** Pelacak gerakan "bidang datar" dari landmark wajah lintas frame. */
export function createFlatFaceTracker() {
    let reference = null;
    let flatVotes = 0;
    let depthVotes = 0;

    return {
        add(landmarks) {
            const pts = toPoints(landmarks);
            if (!reference) {
                reference = { pts, iod: interocular(pts) };
                return;
            }
            const t = fitAffine(pts, reference.pts);
            if (!t || anisotropy(t) < FLAT.minAnisotropy) return;

            const residual = Math.sqrt(pts.reduce((sum, [x, y], i) => {
                const [rx, ry] = reference.pts[i];
                return sum + (t.a * x + t.b * y + t.c - rx) ** 2 + (t.d * x + t.e * y + t.f - ry) ** 2;
            }, 0) / pts.length) / reference.iod;

            if (residual < FLAT.maxResidual) flatVotes += 1;
            else depthVotes += 1;
        },
        isFlat() {
            return flatVotes >= FLAT.votesNeeded && flatVotes > depthVotes * 3;
        },
        reset() {
            reference = null;
            flatVotes = 0;
            depthVotes = 0;
        },
    };
}

/**
 * Tantangan wajah hidup. `validate(detection)` dipanggil tiap frame dengan hasil deteksi yang
 * menyertakan landmarks + expressions (+ descriptor bila ada); mengembalikan true sekali
 * verifikasi lolos. `instruction` diperbarui sebagai petunjuk, `failure` terisi bila foto/layar
 * terdeteksi, dan `referenceDescriptor` berisi descriptor wajah biasa untuk pencocokan.
 */
export function createLivenessChallenge() {
    const tracker = createFlatFaceTracker();
    let stage = 'neutral';
    let streak = 0;

    const challenge = {
        id: 'smile',
        label: 'Senyum',
        badge: 'Senyum 🙂',
        icon: '🙂',
        description: 'Lihat ke kamera dengan wajah biasa, lalu tersenyum saat diminta.',
        instruction: 'Lihat ke kamera dengan wajah biasa (tidak tersenyum)...',
        failure: null,
        referenceDescriptor: null,

        validate(detection) {
            if (challenge.failure || !detection?.landmarks || !detection?.expressions) return false;

            tracker.add(detection.landmarks);
            if (tracker.isFlat()) {
                challenge.failure = 'Terdeteksi foto atau layar, bukan wajah asli. Gunakan wajah Anda langsung di depan kamera.';
                challenge.instruction = challenge.failure;
                return false;
            }

            const happy = detection.expressions.happy ?? 0;

            if (stage === 'neutral') {
                streak = happy < NEUTRAL_MAX_HAPPY ? streak + 1 : 0;
                if (detection.descriptor && happy < NEUTRAL_MAX_HAPPY) {
                    challenge.referenceDescriptor = detection.descriptor;
                }
                if (streak >= NEUTRAL_FRAMES) {
                    stage = 'smile';
                    streak = 0;
                    challenge.instruction = 'Sekarang tersenyum 🙂';
                } else {
                    challenge.instruction = 'Lihat ke kamera dengan wajah biasa (tidak tersenyum)...';
                }
                return false;
            }

            streak = happy > SMILE_MIN_HAPPY ? streak + 1 : 0;
            challenge.instruction = streak > 0 ? 'Tahan senyum...' : 'Sekarang tersenyum 🙂';
            if (streak < SMILE_FRAMES) return false;

            // Wajah yang tersenyum harus orang yang sama dengan wajah biasa sebelumnya.
            if (detection.descriptor && challenge.referenceDescriptor
                && faceapi.euclideanDistance(detection.descriptor, challenge.referenceDescriptor) > SAME_PERSON_MAX_DISTANCE) {
                stage = 'neutral';
                streak = 0;
                challenge.referenceDescriptor = null;
                tracker.reset();
                challenge.instruction = 'Wajah berubah. Ulangi: lihat ke kamera dengan wajah biasa...';
                return false;
            }

            return true;
        },
    };

    return challenge;
}

/** Kompatibilitas: komponen presensi memanggil getRandomChallenge() untuk tantangan baru. */
export function getRandomChallenge() {
    return createLivenessChallenge();
}
