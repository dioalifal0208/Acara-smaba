import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function ReportIndex({ events = [], selectedEventId, selectedEvent, stats, attendances = [] }) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleEventChange = (eventId) => {
        router.get(route('report'), { event_id: eventId }, { preserveState: true, preserveScroll: true });
    };

    const filteredAttendances = attendances.filter(
        (a) =>
            a.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.nis_nip.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const attendancePercentage = stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" data-aos="fade-down">
                    <div>
                        <h2 className="text-xl font-extrabold leading-tight text-slate-800">
                            Laporan Kehadiran
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {selectedEvent ? `Menampilkan laporan untuk: ${selectedEvent.nama_event}` : 'Pilih event untuk melihat data'}
                        </p>
                    </div>

                    {/* Filter Event Dropdown */}
                    <div className="flex items-center gap-2">
                        <label htmlFor="event-filter" className="text-xs font-bold text-slate-600 shrink-0">
                            Filter Event:
                        </label>
                        <select
                            id="event-filter"
                            value={selectedEventId || ''}
                            onChange={(e) => handleEventChange(e.target.value)}
                            className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-indigo-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer min-w-[180px]"
                        >
                            {events.length === 0 && <option value="">Belum Ada Event</option>}
                            {events.map((evt) => (
                                <option key={evt.id} value={evt.id}>
                                    {evt.is_active ? '🟢 ' : ''}{evt.nama_event} ({evt.attendances_count} hadir)
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            }
        >
            <Head title="Laporan Kehadiran" />

            <div className="py-4 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col overflow-hidden justify-between max-h-[580px]">
                <div className="mx-auto max-w-7xl w-full flex-1 flex flex-col overflow-hidden space-y-4">
                    
                    {/* Stats Cards (flex-none) */}
                    <div className="mb-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 flex-none" data-aos="fade-up">
                        <div className="overflow-hidden rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-2.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Peserta</p>
                                    <p className="text-xl font-extrabold text-slate-800 mt-0.5">{stats.total}</p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-2.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Hadir</p>
                                    <p className="text-xl font-extrabold text-emerald-600 mt-0.5">{stats.hadir}</p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="rounded-xl bg-amber-50 border border-amber-100 p-2.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Belum Hadir</p>
                                    <p className="text-xl font-extrabold text-amber-600 mt-0.5">{stats.belum}</p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="rounded-xl bg-purple-50 border border-purple-100 p-2.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Persentase</p>
                                    <p className="text-xl font-extrabold text-purple-600 mt-0.5">{attendancePercentage}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar (flex-none) */}
                    <div className="overflow-hidden rounded-xl bg-white border border-slate-200 p-4 shadow-sm flex-none" data-aos="fade-up" data-aos-delay="100">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700">Progress Kehadiran</span>
                            <span className="text-xs font-bold text-indigo-600">{stats.hadir} / {stats.total}</span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-700 transition-all duration-1000 ease-out"
                                style={{ width: `${attendancePercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Search (flex-none) */}
                    <div className="mb-2 flex-none" data-aos="fade-up" data-aos-delay="150">
                        <div className="relative">
                            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Cari data kehadiran berdasarkan nama atau NIP/NIS..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-sm font-medium"
                            />
                        </div>
                    </div>

                    {/* Report Table Wrapper (flex-1 and overflow-y-auto to lock vertical height) */}
                    <div className="overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm flex-1 flex flex-col min-h-0" data-aos="fade-up" data-aos-delay="200">
                        <div className="overflow-x-auto flex-1 overflow-y-auto max-h-[300px]">
                            <table className="min-w-full divide-y divide-slate-200 relative">
                                <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500">No</th>
                                        <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500">Nama Lengkap</th>
                                        <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500">NIS/NIP</th>
                                        <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500">Waktu Hadir</th>
                                        <th className="px-6 py-3 text-center text-xs font-extrabold uppercase tracking-wider text-slate-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {filteredAttendances.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-slate-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-slate-300 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                <p className="text-xs font-semibold">Belum ada peserta yang hadir.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAttendances.map((attendance, index) => (
                                            <tr key={attendance.id} className="transition-colors hover:bg-slate-50/50">
                                                <td className="whitespace-nowrap px-6 py-3.5 text-xs text-slate-500 font-semibold">{index + 1}</td>
                                                <td className="whitespace-nowrap px-6 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600">
                                                            {attendance.nama.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-800">{attendance.nama}</span>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-3.5 text-xs text-slate-700 font-semibold">{attendance.nis_nip}</td>
                                                <td className="whitespace-nowrap px-6 py-3.5 text-xs text-slate-700 font-mono font-semibold">{attendance.waktu_hadir}</td>
                                                <td className="whitespace-nowrap px-6 py-3.5 text-center">
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                                                        ✓ Hadir
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
