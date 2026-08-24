import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function VerifySignature({ workcode, kepalaSekolahNama, kepalaSekolahNip, waktuCetak }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center pt-6 sm:pt-0">
            <Head title="Verifikasi Tanda Tangan" />

            <div className="w-full sm:max-w-md mt-6 px-6 py-8 bg-white shadow-xl overflow-hidden sm:rounded-2xl border border-gray-100 relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-600"></div>
                
                <div className="flex justify-center mb-6">
                    <ApplicationLogo className="w-20 h-20 fill-current text-gray-500" />
                </div>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-500 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">DOKUMEN SAH</h2>
                    <p className="text-sm text-gray-500 mt-1">Telah Terverifikasi oleh Sistem</p>
                </div>

                <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Informasi Dokumen</h3>
                        <p className="font-semibold text-gray-800">Rekap Presensi - {workcode.nama_workcode}</p>
                        <p className="text-sm text-gray-600">Dicetak pada: {waktuCetak}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ditandatangani Oleh</h3>
                        <p className="font-semibold text-gray-800">{kepalaSekolahNama}</p>
                        <p className="text-sm text-gray-600 font-mono">NIP. {kepalaSekolahNip}</p>
                        <p className="text-xs text-gray-500 mt-2 font-medium">Kepala Sekolah SMA Negeri 1 Babat</p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400">
                        Dokumen ini dihasilkan secara elektronik dan sah tanpa memerlukan stempel basah.
                    </p>
                    <div className="mt-4">
                        <Link href="/" className="text-sm font-medium text-emerald-600 hover:text-emerald-500">
                            Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
