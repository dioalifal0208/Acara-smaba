import FaceEnrollmentCamera from '@/Components/FaceEnrollmentCamera';
import PublicShell from '@/Layouts/PublicShell';
import { Button } from '@/ui';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Hourglass } from 'lucide-react';
import { useCallback, useState } from 'react';

/** Halaman pendaftaran wajah mandiri (layar penuh, tanpa menu) untuk peserta. */
export default function FaceRegistration({ participant }) {
    const [result, setResult] = useState(null);

    const handleComplete = useCallback(async ({ descriptors, photo }) => {
        const res = await axios.post(`/api/participants/${participant.id}/face/self`, { descriptor: descriptors, photo });
        setResult(res.data);
    }, [participant.id]);

    return (
        <PublicShell footer="Pendaftaran wajah">
            <Head title={result ? 'Wajah terkirim' : 'Daftarkan wajah'} />

            {result ? (
                <div className="space-y-4 pt-6 text-center" role="status">
                    <Hourglass className="mx-auto h-14 w-14 text-status-telat" strokeWidth={1.5} aria-hidden="true" />
                    <h1 className="font-display text-2xl font-semibold text-ink">Wajah terkirim</h1>
                    <p className="text-sm text-ink-2">Data wajah menunggu persetujuan admin. Presensi wajah di aplikasi aktif setelah disetujui.</p>
                    <Button variant="primary" size="lg" href={route('participant.dashboard')} className="w-full">Ke beranda</Button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <h1 className="font-display text-2xl font-semibold text-ink">Daftarkan wajah</h1>
                        <p className="mt-1 text-sm text-ink-2">Wajah menghadap depan, dipakai sebagai acuan presensi wajah.</p>
                    </div>
                    <FaceEnrollmentCamera onComplete={handleComplete} className="overflow-hidden rounded-xl" />
                    <p className="text-sm text-ink-2">Ikuti petunjuk di layar. Pastikan wajah terlihat penuh, tanpa masker atau kacamata gelap, dengan cahaya cukup.</p>
                    <Button variant="ghost" href={route('participant.dashboard')} className="w-full">Kembali ke beranda</Button>
                </div>
            )}
        </PublicShell>
    );
}
