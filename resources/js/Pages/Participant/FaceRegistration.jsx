import { Head } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import axios from 'axios';
import FaceEnrollmentCamera from '@/Components/FaceEnrollmentCamera';
import { appUrl } from '@/lib/appUrl';

export default function FaceRegistration({ participant }) {
    const [result, setResult] = useState(null);

    const handleComplete = useCallback(async ({ descriptors, photo }) => {
        const res = await axios.post(`/api/participants/${participant.id}/face/self`, { descriptor: descriptors, photo });
        setResult(res.data);
    }, [participant.id]);

    if (result) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <Head title="Pendaftaran Berhasil" />
                <div className="w-full max-w-sm rounded-3xl bg-white border border-emerald-200 shadow-xl p-7">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
                        <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-extrabold text-emerald-800 mb-1">Berhasil Disimpan!</h2>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4 mt-4 text-sm text-emerald-800 font-medium">
                        Data wajah Anda telah terkirim dan sedang menunggu persetujuan Admin. Presensi wajah aktif otomatis setelah disetujui.
                    </div>
                    <a href={route('participant.dashboard')} className="block w-full rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-200">
                        Kembali ke Dashboard
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
            <Head title="Pendaftaran Wajah" />

            <div className="w-full max-w-sm rounded-3xl bg-white overflow-hidden shadow-2xl relative">
                <div className="bg-white px-5 py-4 border-b border-slate-100 text-center relative z-10">
                    <img src={appUrl('images/logo.png')} alt="Logo" className="h-10 w-10 mx-auto object-contain mb-2" />
                    <h2 className="text-sm font-extrabold text-slate-800">Pendaftaran Wajah</h2>
                    <p className="text-[10px] text-slate-500 font-semibold">Wajah menghadap depan sebagai data acuan presensi</p>
                </div>

                <FaceEnrollmentCamera onComplete={handleComplete} />

                <div className="bg-slate-900 text-slate-300 px-4 py-3 text-[10px] font-medium leading-relaxed">
                    Ikuti instruksi di layar. Pastikan wajah terlihat penuh, tidak memakai masker/kacamata gelap, dan pencahayaan cukup.
                </div>
            </div>

            <a href={route('participant.dashboard')} className="mt-6 text-xs text-white/50 hover:text-white font-semibold transition-colors underline underline-offset-4">
                Kembali ke Dashboard
            </a>
        </div>
    );
}
