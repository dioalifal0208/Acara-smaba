import { useCallback } from 'react';
import { createPortal } from 'react-dom';
import { router } from '@inertiajs/react';
import axios from 'axios';
import FaceEnrollmentCamera from '@/Components/FaceEnrollmentCamera';

const playTone = (type) => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.frequency.setValueAtTime(type === 'success' ? 523 : 220, ctx.currentTime);
        if (type === 'success') osc.frequency.setValueAtTime(659, ctx.currentTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
    } catch {
        // audio opsional
    }
};

export default function SelfFaceRegistrationModal({ participant, onClose }) {
    const handleComplete = useCallback(async ({ descriptors, photo }) => {
        try {
            await axios.post(`/api/participants/${participant.id}/face/self`, { descriptor: descriptors, photo });
        } catch (error) {
            playTone('error');
            throw error;
        }
        playTone('success');
        onClose(true);
        router.reload({ only: ['participant'] });
    }, [participant.id, onClose]);

    const modalContent = (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/80 p-0 sm:p-4 backdrop-blur-sm" onClick={() => onClose(false)}>
            <div className="w-full sm:max-w-sm rounded-none rounded-t-3xl sm:rounded-3xl bg-white overflow-hidden shadow-2xl relative max-h-[95dvh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between relative z-10">
                    <div>
                        <h2 className="text-sm font-extrabold text-slate-800">Pendaftaran Wajah</h2>
                        <p className="text-[10px] text-slate-500 font-semibold">Wajah menghadap depan sebagai data acuan presensi</p>
                    </div>
                    <button type="button" onClick={() => onClose(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <FaceEnrollmentCamera onComplete={handleComplete} />

                <div className="bg-slate-900 text-slate-300 px-4 py-3 text-[10px] font-medium leading-relaxed">
                    Ikuti instruksi di layar. Pastikan wajah terlihat penuh, tidak memakai masker/kacamata gelap, dan pencahayaan cukup.
                    Setelah tersimpan, data wajah menunggu persetujuan admin sebelum bisa dipakai untuk presensi.
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
