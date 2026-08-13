import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useToast } from '@/Components/Toast';
import { useConfirm } from '@/Components/ConfirmDialog';

export default function EventsIndex({ events }) {
    const { flash } = usePage().props;
    const { toast } = useToast();
    const confirm = useConfirm();
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        nama_event: '',
        deskripsi: '',
        set_active: true,
    });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        } else if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('events.store'), {
            onSuccess: () => {
                reset();
                setShowCreateModal(false);
            },
        });
    };

    const handleActivate = (id, nama) => {
        router.post(route('events.activate', id));
    };

    const handleDeactivate = (id, nama) => {
        router.post(route('events.deactivate', id));
    };

    const handleDelete = async (id, nama) => {
        const confirmed = await confirm({
            title: 'Hapus Event',
            message: `Apakah Anda yakin ingin menghapus event "${nama}"? Semua data kehadiran yang terikat pada event ini juga akan terhapus.`,
            type: 'danger',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
        });
        if (confirmed) {
            router.delete(route('events.destroy', id));
        }
    };

    const activeEvent = events.find((e) => e.is_active);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" data-aos="fade-down">
                    <div>
                        <h2 className="text-xl font-extrabold leading-tight text-slate-800">
                            Kelola Event / Acara
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Admin wajib mengaktifkan event sebelum sesi presensi dimulai
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700 hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Buat Event Baru
                    </button>
                </div>
            }
        >
            <Head title="Kelola Event" />

            <div className="py-4 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col overflow-y-auto">
                <div className="mx-auto max-w-7xl w-full space-y-6">

                    {/* Active Event Highlight Banner */}
                    <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-6 text-white shadow-xl relative" data-aos="fade-up">
                        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    STATUS SAAT INI
                                </span>
                                <h3 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
                                    {activeEvent ? activeEvent.nama_event : 'Belum Ada Event Aktif'}
                                </h3>
                                <p className="text-xs text-indigo-200 mt-1 max-w-xl">
                                    {activeEvent
                                        ? activeEvent.deskripsi || 'Event ini sedang berlangsung. Semua presensi scanner & self check-in akan dicatat ke event ini.'
                                        : 'Sistem presensi terkunci. Buat atau pilih event di bawah untuk mengizinkan peserta/panitia melakukan scan.'}
                                </p>
                            </div>
                            {activeEvent && (
                                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 shrink-0">
                                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-200">Total Presensi</span>
                                    <span className="text-2xl font-black text-emerald-400">{activeEvent.attendances_count} Kehadiran</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Events List */}
                    <div className="space-y-4" data-aos="fade-up" data-aos-delay="100">
                        <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">Daftar Event</h3>

                        {events.length === 0 ? (
                            <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center shadow-sm">
                                <svg className="mx-auto h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <h4 className="text-base font-bold text-slate-700">Belum Ada Event Terdaftar</h4>
                                <p className="text-xs text-slate-500 mt-1">Buat event pertama Anda untuk memulai presensi digital.</p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-700"
                                >
                                    Buat Event Baru
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {events.map((event) => (
                                    <div
                                        key={event.id}
                                        className={`rounded-2xl bg-white border transition-all p-5 shadow-sm hover:shadow-md flex flex-col justify-between relative ${
                                            event.is_active
                                                ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                                                : 'border-slate-200'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                                        event.is_active
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${event.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                    {event.is_active ? 'AKTIF' : 'Non-Aktif'}
                                                </span>

                                                <span className="text-[10px] text-slate-400 font-semibold">
                                                    {new Date(event.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            </div>

                                            <h4 className="text-base font-extrabold text-slate-800 line-clamp-1">
                                                {event.nama_event}
                                            </h4>

                                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
                                                {event.deskripsi || 'Tidak ada deskripsi.'}
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                            <div className="text-xs font-semibold text-slate-500">
                                                <span className="font-extrabold text-indigo-600">{event.attendances_count}</span> Peserta Hadir
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {event.is_active ? (
                                                    <button
                                                        onClick={() => handleDeactivate(event.id, event.nama_event)}
                                                        className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
                                                    >
                                                        Nonaktifkan
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleActivate(event.id, event.nama_event)}
                                                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
                                                    >
                                                        Aktifkan
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleDelete(event.id, event.nama_event)}
                                                    className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                                    title="Hapus Event"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Buat Event Baru */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />

                    <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all border border-slate-200 animate-[fadeIn_0.2s_ease-out]">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 className="text-base font-extrabold text-slate-800">Buat Event Baru</h3>
                            <button onClick={() => setShowCreateModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Nama Event / Acara <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Upacara Bendera, Classmeet 2026..."
                                    value={data.nama_event}
                                    onChange={(e) => setData('nama_event', e.target.value)}
                                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium"
                                />
                                {errors.nama_event && <p className="mt-1 text-xs text-red-600 font-medium">{errors.nama_event}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Deskripsi (Opsional)
                                </label>
                                <textarea
                                    rows="3"
                                    placeholder="Keterangan singkat mengenai event..."
                                    value={data.deskripsi}
                                    onChange={(e) => setData('deskripsi', e.target.value)}
                                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="set_active"
                                    checked={data.set_active}
                                    onChange={(e) => setData('set_active', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="set_active" className="text-xs font-bold text-slate-700">
                                    Langsung aktifkan event ini untuk presensi sekarang
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan & Aktifkan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
