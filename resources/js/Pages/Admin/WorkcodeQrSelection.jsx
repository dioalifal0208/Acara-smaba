import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function WorkcodeQrSelection({ activeWorkcodes = [] }) {
    return (
        <AuthenticatedLayout>
            <Head title="Pilih Workcode QR" />
            <div className="mx-auto flex w-full max-w-3xl flex-1 items-center px-4 py-8 sm:px-6">
                <div className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
                    <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-indigo-700">QR Presensi</span>
                    <h1 className="mt-3 text-2xl font-black text-slate-900">Pilih workcode yang akan ditampilkan</h1>
                    <p className="mt-2 text-sm font-medium text-slate-500">Saat ini ada {activeWorkcodes.length} workcode aktif. Pilih satu agar QR yang ditampilkan memiliki konteks kegiatan yang jelas.</p>
                    <div className="mt-6 space-y-3">
                        {activeWorkcodes.map((workcode) => (
                            <Link key={workcode.id} href={route('admin.master-qr', { workcode_id: workcode.id })} className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300 hover:bg-indigo-50">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-extrabold text-slate-800">{workcode.nama_workcode}</p>
                                    <p className="mt-1 text-[11px] font-medium text-slate-500">{workcode.kategori === 'harian' ? 'Presensi harian' : 'Kegiatan'} · {workcode.participants_count || 0} peserta dipilih</p>
                                </div>
                                <span className="shrink-0 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition group-hover:bg-indigo-700">Pilih QR</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
