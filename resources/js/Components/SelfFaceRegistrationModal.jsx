import FaceEnrollmentCamera from '@/Components/FaceEnrollmentCamera';
import { Dialog } from '@/ui';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { useCallback } from 'react';

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

/** Peserta mendaftarkan wajahnya sendiri lewat kamera; hasilnya menunggu persetujuan admin. */
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

    return (
        <Dialog
            open
            onClose={() => onClose(false)}
            title="Daftarkan wajah"
            description="Wajah menghadap depan, dipakai sebagai acuan presensi wajah."
            size="md"
        >
            <FaceEnrollmentCamera onComplete={handleComplete} className="rounded-xl" />
            <p className="mt-3 text-sm text-ink-2">
                Ikuti petunjuk di layar. Pastikan wajah terlihat penuh, tanpa masker atau kacamata gelap, dengan cahaya cukup. Setelah tersimpan, wajah menunggu persetujuan admin.
            </p>
        </Dialog>
    );
}
