import { useCallback, useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import {
    DETECTOR_OPTIONS,
    ENROLLMENT_TIMEOUT_SECONDS,
    FRONT_SAMPLES,
    SAME_PERSON_MAX_DISTANCE,
    STABLE_FRAMES,
    assessFace,
    faceBrightness,
    isStable,
    loadEnrollmentModels,
    visibleRegion,
} from '@/Utils/faceEnrollment';

const cameraErrorMessage = (error) => {
    switch (error?.name) {
        case 'NotAllowedError':
            return 'Izin kamera ditolak. Izinkan akses kamera di pengaturan browser lalu coba lagi.';
        case 'NotFoundError':
            return 'Kamera tidak ditemukan pada perangkat ini.';
        case 'NotReadableError':
            return 'Kamera sedang dipakai aplikasi lain. Tutup aplikasi tersebut lalu coba lagi.';
        default:
            return window.isSecureContext
                ? 'Kamera tidak dapat diakses.'
                : 'Kamera hanya bisa dipakai melalui HTTPS.';
    }
};

/**
 * Kamera pendaftaran wajah menghadap depan.
 *
 * Wajah harus utuh di dalam bingkai, lurus ke kamera, stabil, cukup terang, mata terbuka, dan
 * satu-satunya wajah di layar. Beberapa sampel wajah depan diambil dan dicek berasal dari orang
 * yang sama; sampel inilah data acuan presensi. `onComplete({ descriptors, photo })` boleh async;
 * bila melempar error, pesan ditampilkan dan pengguna bisa mengulang.
 */
export default function FaceEnrollmentCamera({ onComplete, className = '' }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const samplerRef = useRef(typeof document !== 'undefined' ? document.createElement('canvas') : null);
    const streamRef = useRef(null);
    const runningRef = useRef(false);
    const loopRef = useRef(null);

    // Status pendaftaran (ref agar loop deteksi tidak membaca state basi)
    const capturedRef = useRef([]);
    const stableRef = useRef(0);
    const prevBoxRef = useRef(null);
    const photoRef = useRef(null);

    const [phase, setPhase] = useState('loading'); // loading | camera | uploading | error
    const [errorMsg, setErrorMsg] = useState(null);
    const [captured, setCaptured] = useState(0);
    const [hint, setHint] = useState('Menyiapkan kamera...');
    const [faceOk, setFaceOk] = useState(false);
    const [timeLeft, setTimeLeft] = useState(ENROLLMENT_TIMEOUT_SECONDS);
    const [attempt, setAttempt] = useState(0);

    const stopCamera = useCallback(() => {
        runningRef.current = false;
        clearTimeout(loopRef.current);
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
    }, []);

    const resetProgress = useCallback(() => {
        capturedRef.current = [];
        stableRef.current = 0;
        prevBoxRef.current = null;
        photoRef.current = null;
        setCaptured(0);
    }, []);

    const fail = useCallback((message) => {
        stopCamera();
        setErrorMsg(message);
        setPhase('error');
    }, [stopCamera]);

    const capturePhoto = (video) => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.9);
    };

    const drawOverlay = (detections, frame, ok) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        if (canvas.width !== frame.width || canvas.height !== frame.height) {
            canvas.width = frame.width;
            canvas.height = frame.height;
        }
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = ok ? 'rgba(52, 211, 153, 0.95)' : 'rgba(251, 191, 36, 0.9)';
        detections.forEach((det) => {
            det.landmarks.positions.forEach((pt) => {
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, Math.max(1.5, frame.width / 320), 0, Math.PI * 2);
                ctx.fill();
            });
        });
    };

    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    const finish = useCallback(async () => {
        stopCamera();
        setPhase('uploading');
        setHint('Memproses data wajah...');
        try {
            await onCompleteRef.current({ descriptors: capturedRef.current, photo: photoRef.current });
        } catch (error) {
            setErrorMsg(error?.response?.data?.message || error?.message || 'Gagal menyimpan data wajah.');
            setPhase('error');
        }
    }, [stopCamera]);

    const processFrame = useCallback(async (video) => {
        const frame = { width: video.videoWidth, height: video.videoHeight };
        const detections = await faceapi
            .detectAllFaces(video, DETECTOR_OPTIONS())
            .withFaceLandmarks()
            .withFaceDescriptors();

        const resetStable = (message) => {
            stableRef.current = 0;
            prevBoxRef.current = null;
            setFaceOk(false);
            if (message) setHint(message);
        };

        if (detections.length === 0) {
            drawOverlay([], frame, false);
            return resetStable('Posisikan seluruh wajah di dalam bingkai.');
        }
        if (detections.length > 1) {
            drawOverlay(detections, frame, false);
            return resetStable('Terdeteksi lebih dari satu wajah. Pastikan hanya Anda yang ada di depan kamera.');
        }

        const detection = detections[0];
        const box = detection.detection.box;
        const brightness = faceBrightness(video, box, samplerRef.current);
        const quality = assessFace(detection, visibleRegion(video), brightness);

        if (!quality.ok) {
            drawOverlay(detections, frame, false);
            return resetStable(quality.hint);
        }

        drawOverlay(detections, frame, true);
        setFaceOk(true);

        stableRef.current = isStable(prevBoxRef.current, box, frame.width) ? stableRef.current + 1 : 1;
        prevBoxRef.current = box;
        if (stableRef.current < STABLE_FRAMES) {
            setHint('Tahan posisi, jangan bergerak...');
            return;
        }

        const descriptor = Array.from(detection.descriptor);
        const reference = capturedRef.current[0];
        if (reference && faceapi.euclideanDistance(reference, descriptor) > SAME_PERSON_MAX_DISTANCE) {
            resetProgress();
            return resetStable('Wajah berbeda terdeteksi. Pendaftaran diulang dari awal.');
        }

        capturedRef.current.push(descriptor);
        setCaptured(capturedRef.current.length);
        if (!photoRef.current) photoRef.current = capturePhoto(video);
        stableRef.current = 0;
        prevBoxRef.current = null;

        if (capturedRef.current.length >= FRONT_SAMPLES) {
            await finish();
            return;
        }
        setHint('Bagus. Tahan sebentar lagi...');
    }, [finish, resetProgress]);

    // Muat model + nyalakan kamera (ulang setiap kali "Coba Lagi")
    useEffect(() => {
        let cancelled = false;

        const start = async () => {
            setPhase('loading');
            setErrorMsg(null);
            resetProgress();
            setTimeLeft(ENROLLMENT_TIMEOUT_SECONDS);
            setHint('Memuat model AI wajah...');

            try {
                await loadEnrollmentModels();
            } catch {
                if (!cancelled) fail('Gagal memuat model AI wajah. Periksa koneksi internet lalu coba lagi.');
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
                });
                if (cancelled) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }
                streamRef.current = stream;
                videoRef.current.srcObject = stream;
                await videoRef.current.play().catch(() => {});
            } catch (error) {
                if (!cancelled) fail(cameraErrorMessage(error));
                return;
            }

            setPhase('camera');
            setHint('Lihat lurus ke kamera dengan wajah tepat di dalam bingkai.');
            runningRef.current = true;

            const tick = async () => {
                if (!runningRef.current) return;
                const video = videoRef.current;
                if (video && video.readyState >= 2 && video.videoWidth) {
                    try {
                        await processFrame(video);
                    } catch {
                        // frame gagal diproses; lanjut ke frame berikutnya
                    }
                }
                if (runningRef.current) loopRef.current = setTimeout(tick, 120);
            };
            tick();
        };

        start();

        return () => {
            cancelled = true;
            stopCamera();
        };
    }, [attempt]); // eslint-disable-line react-hooks/exhaustive-deps

    // Batas waktu keseluruhan
    useEffect(() => {
        if (phase !== 'camera') return undefined;
        if (timeLeft <= 0) {
            fail('Waktu pendaftaran habis. Pastikan pencahayaan cukup dan ikuti instruksi di layar.');
            return undefined;
        }
        const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [phase, timeLeft, fail]);

    const progress = Math.round((captured / FRONT_SAMPLES) * 100);

    return (
        <div className={`relative bg-black w-full aspect-[3/4] overflow-hidden ${className}`}>
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`absolute inset-0 w-full h-full object-cover -scale-x-100 ${phase === 'camera' ? '' : 'opacity-30'}`}
            />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover -scale-x-100 pointer-events-none" />

            {/* Bingkai oval panduan */}
            {phase === 'camera' && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div
                        className={`w-[62%] h-[72%] rounded-[50%] border-[3px] transition-colors duration-300 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] ${
                            faceOk ? 'border-emerald-400' : 'border-white/70 border-dashed'
                        }`}
                    />
                </div>
            )}

            {/* Instruksi */}
            {phase === 'camera' && (
                <div className="absolute top-3 inset-x-3 z-20">
                    <div className="rounded-2xl bg-slate-900/75 backdrop-blur-md border border-white/10 px-3.5 py-2.5 text-white">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">Wajah menghadap depan</p>
                            <span className={`text-[10px] font-black ${timeLeft <= 15 ? 'text-rose-300' : 'text-white/70'}`}>{timeLeft}s</span>
                        </div>
                        <p className="text-sm font-extrabold leading-snug mt-0.5">Lihat lurus ke kamera dan tahan posisi</p>
                    </div>
                </div>
            )}

            {/* Petunjuk + progres */}
            {phase === 'camera' && (
                <div className="absolute bottom-3 inset-x-3 z-20">
                    <div className={`rounded-xl px-3 py-2 text-center text-xs font-bold backdrop-blur-md border ${faceOk ? 'bg-emerald-500/25 border-emerald-300/40 text-emerald-50' : 'bg-amber-500/25 border-amber-300/40 text-amber-50'}`}>
                        {hint}
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/20 overflow-hidden">
                        <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="mt-1 text-center text-[10px] font-semibold text-white/70">
                        {captured} / {FRONT_SAMPLES} sampel wajah terekam
                    </p>
                </div>
            )}

            {(phase === 'loading' || phase === 'uploading') && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-white">
                    <div className="h-10 w-10 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin mb-3" />
                    <p className="text-xs font-semibold">{hint}</p>
                </div>
            )}

            {phase === 'error' && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center bg-black/70">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                        <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-sm font-bold text-white mb-4">{errorMsg}</p>
                    <button
                        type="button"
                        onClick={() => setAttempt((n) => n + 1)}
                        className="w-full rounded-xl bg-white/20 px-6 py-2.5 text-sm font-bold text-white hover:bg-white/30"
                    >
                        Coba Lagi
                    </button>
                </div>
            )}
        </div>
    );
}
