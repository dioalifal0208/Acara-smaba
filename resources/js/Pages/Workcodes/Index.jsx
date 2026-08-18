import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
});
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import { useToast } from '@/Components/Toast';
import { useConfirm } from '@/Components/ConfirmDialog';


function LocationMarker({ position, setPosition, radius }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
        locationfound(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, 17); // Zoom otomatis ke level 17 agar radius terlihat jelas
        },
    });
    
    // Add custom control for Locate Me
    useEffect(() => {
        const locateControl = L.control({ position: 'topright' });
        locateControl.onAdd = function() {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            div.style.backgroundColor = 'white';
            div.style.width = '34px';
            div.style.height = '34px';
            div.style.cursor = 'pointer';
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.justifyContent = 'center';
            div.title = 'Lokasi Saya Saat Ini';
            div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>';
            
            div.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                map.locate();
            }
            return div;
        };
        locateControl.addTo(map);
        
        return () => {
            map.removeControl(locateControl);
        };
    }, [map]);

    return position === null ? null : (
        <React.Fragment>
            <Marker position={position}></Marker>
            <Circle center={position} pathOptions={{ fillColor: 'blue' }} radius={radius} />
        </React.Fragment>
    );
}


class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMsg: error.toString() };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Map Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-4 bg-red-100 text-red-700 text-xs rounded-xl border border-red-200">Error loading map: {this.state.errorMsg}</div>;
    }
    return this.props.children;
  }
}

export default function WorkcodesIndex({ workcodes }) {
    const { flash } = usePage().props;
    const { toast } = useToast();
    const confirm = useConfirm();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [mapPosition, setMapPosition] = useState({ lat: -7.1086, lng: 112.1715 }); // default to SMAN 1 Babat approx area

    const { data, setData, post, processing, errors, reset } = useForm({
        nama_workcode: '',
        deskripsi: '',
        kategori: 'workcode',
        hari_aktif: [1,2,3,4,5],
        jam_datang_mulai: '06:00',
        jam_datang_selesai: '07:00',
        jam_pulang_mulai: '15:30',
        jam_pulang_selesai: '22:00',
        latitude: '',
        longitude: '',
        radius_meters: 100,
        set_active: true,
    });

    const handleToggleDay = (day) => {
        const days = [...data.hari_aktif];
        if (days.includes(day)) {
            setData('hari_aktif', days.filter(d => d !== day));
        } else {
            setData('hari_aktif', [...days, day]);
        }
    };

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        } else if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleSubmit = (e) => {
        if (mapPosition) {
            data.latitude = mapPosition.lat;
            data.longitude = mapPosition.lng;
        }
        e.preventDefault();
        post(route('workcodes.store'), {
            onSuccess: () => {
                reset();
                setShowCreateModal(false);
            },
        });
    };

    const handleActivate = (id, nama) => {
        router.post(route('workcodes.activate', id));
    };

    const handleDeactivate = (id, nama) => {
        router.post(route('workcodes.deactivate', id));
    };

    const handleDelete = async (id, nama) => {
        const confirmed = await confirm({
            title: 'Hapus Workcode',
            message: `Apakah Anda yakin ingin menghapus workcode "${nama}"? Semua data kehadiran yang terikat pada workcode ini juga akan terhapus.`,
            type: 'danger',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
        });
        if (confirmed) {
            router.delete(route('workcodes.destroy', id));
        }
    };

    const activeWorkcode = workcodes.find((e) => e.is_active);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" data-aos="fade-down">
                    <div>
                        <h2 className="text-xl font-extrabold leading-tight text-slate-800">
                            Kelola Workcode / Kegiatan
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Admin wajib mengaktifkan workcode sebelum sesi presensi dimulai
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700 hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Buat Workcode Baru
                    </button>
                </div>
            }
        >
            <Head title="Kelola Workcode" />

            <div className="py-4 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col overflow-y-auto">
                <div className="mx-auto max-w-7xl w-full space-y-6">

                    {/* Active Workcode Highlight Banner */}
                    <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-6 text-white shadow-xl relative" data-aos="fade-up">
                        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    STATUS SAAT INI
                                </span>
                                <h3 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
                                    {activeWorkcode ? activeWorkcode.nama_workcode : 'Belum Ada Workcode Aktif'}
                                </h3>
                                <p className="text-xs text-indigo-200 mt-1 max-w-xl">
                                    {activeWorkcode
                                        ? activeWorkcode.deskripsi || 'Workcode ini sedang berlangsung. Semua presensi scanner & self check-in akan dicatat ke workcode ini.'
                                        : 'Sistem presensi terkunci. Buat atau pilih workcode di bawah untuk mengizinkan peserta/panitia melakukan scan.'}
                                </p>
                            </div>
                            {activeWorkcode && (
                                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 shrink-0">
                                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-200">Total Presensi</span>
                                    <span className="text-2xl font-black text-emerald-400">{activeWorkcode.attendances_count} Kehadiran</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Workcodes List */}
                    <div className="space-y-4" data-aos="fade-up" data-aos-delay="100">
                        <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">Daftar Workcode</h3>

                        {workcodes.length === 0 ? (
                            <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center shadow-sm">
                                <svg className="mx-auto h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <h4 className="text-base font-bold text-slate-700">Belum Ada Workcode Terdaftar</h4>
                                <p className="text-xs text-slate-500 mt-1">Buat workcode pertama Anda untuk memulai presensi digital.</p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-700"
                                >
                                    Buat Workcode Baru
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {workcodes.map((workcode) => (
                                    <div
                                        key={workcode.id}
                                        className={`rounded-2xl bg-white border transition-all p-5 shadow-sm hover:shadow-md flex flex-col justify-between relative ${
                                            workcode.is_active
                                                ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                                                : 'border-slate-200'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                                            workcode.is_active
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                : 'bg-slate-100 text-slate-600'
                                                        }`}
                                                    >
                                                        <span className={`h-1.5 w-1.5 rounded-full ${workcode.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                        {workcode.is_active ? 'AKTIF' : 'Non-Aktif'}
                                                    </span>
                                                    {workcode.kategori === 'harian' ? (
                                                        <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                                            Harian
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                                            Kegiatan
                                                        </span>
                                                    )}
                                                </div>

                                                <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                                                    {new Date(workcode.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            </div>

                                            <h4 className="text-base font-extrabold text-slate-800 line-clamp-1">
                                                {workcode.nama_workcode}
                                            </h4>

                                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
                                                {workcode.deskripsi || 'Tidak ada deskripsi.'}
                                            </p>

                                            {workcode.kategori === 'harian' && (
                                                <div className="mt-2.5 flex flex-col gap-1 rounded-lg bg-blue-50/60 border border-blue-100 p-2 text-[11px] text-blue-900 font-medium">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-500 text-[10px]">Datang:</span>
                                                        <span className="font-bold font-mono">{workcode.jam_datang_mulai?.substring(0,5) || '06:00'} - {workcode.jam_datang_selesai?.substring(0,5) || '07:00'}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-500 text-[10px]">Pulang:</span>
                                                        <span className="font-bold font-mono">{workcode.jam_pulang_mulai?.substring(0,5) || '15:30'} - {workcode.jam_pulang_selesai?.substring(0,5) || '22:00'}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                            <div className="text-xs font-semibold text-slate-500">
                                                <span className="font-extrabold text-indigo-600">{workcode.attendances_count}</span> Peserta Hadir
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={route('workcodes.export', workcode.id)}
                                                    className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition inline-flex items-center gap-1 shadow-xs"
                                                    title="Export Bukti Hadir Excel (.xlsx)"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                    <span>Export</span>
                                                </a>

                                                {workcode.is_active ? (
                                                    <button
                                                        onClick={() => handleDeactivate(workcode.id, workcode.nama_workcode)}
                                                        className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
                                                    >
                                                        Nonaktifkan
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleActivate(workcode.id, workcode.nama_workcode)}
                                                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
                                                    >
                                                        Aktifkan
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleDelete(workcode.id, workcode.nama_workcode)}
                                                    className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                                    title="Hapus Workcode"
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

            {/* Modal Buat Workcode Baru */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />

                    <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-slate-200/80 animate-[fadeIn_0.2s_ease-out] flex flex-col my-auto">
                        {/* Header */}
                        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/90 px-6 py-3">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-extrabold text-slate-800">Buat Workcode Baru</h3>
                                    <p className="text-[11px] text-slate-500 font-medium">Konfigurasi jadwal waktu & batasan radius presensi</p>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setShowCreateModal(false)} 
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 sm:p-6">
                            <form id="create-workcode-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                                {/* Left Column (7 cols) */}
                                <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
                                    {/* Nama Workcode */}
                                    <div>
                                        <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                                            Nama Workcode / Kegiatan <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Contoh: Presensi Harian Guru & Karyawan / Upworkcode..."
                                            value={data.nama_workcode}
                                            onChange={(e) => setData('nama_workcode', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium shadow-2xs transition-all"
                                        />
                                        {errors.nama_workcode && <p className="mt-1 text-[10px] text-red-600 font-bold">{errors.nama_workcode}</p>}
                                    </div>

                                    {/* Deskripsi Singkat */}
                                    <div>
                                        <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                                            Deskripsi (Opsional)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Keterangan singkat mengenai workcode ini..."
                                            value={data.deskripsi}
                                            onChange={(e) => setData('deskripsi', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium shadow-2xs transition-all"
                                        />
                                    </div>

                                    {/* Segmented Kategori Switch */}
                                    <div>
                                        <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                                            Kategori Presensi <span className="text-red-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                                            <button
                                                type="button"
                                                onClick={() => setData('kategori', 'workcode')}
                                                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                                                    data.kategori === 'workcode'
                                                        ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/80'
                                                        : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                            >
                                                <span>📅</span>
                                                <span>Absen Kegiatan (1x)</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setData('kategori', 'harian')}
                                                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                                                    data.kategori === 'harian'
                                                        ? 'bg-blue-600 text-white shadow-sm'
                                                        : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                            >
                                                <span>⏰</span>
                                                <span>Presensi Harian</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Seamless Configuration Box (Fixed identical height for both tabs) */}
                                    <div className="h-[138px]">
                                        {data.kategori === 'workcode' ? (
                                            <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/40 p-2.5 h-full flex flex-col justify-between animate-[fadeIn_0.15s_ease-out]">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                                                        <span>📌</span> Mode Presensi Sekali
                                                    </span>
                                                    <span className="text-[10px] text-indigo-700 font-bold bg-indigo-100/70 px-2 py-0.5 rounded-md">
                                                        1x Scan / Peserta
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 flex-1 mt-1.5">
                                                    <div className="bg-white rounded-lg p-2 border border-indigo-100/80 shadow-2xs flex flex-col justify-center">
                                                        <span className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-0.5">
                                                            🎯 Mekanisme
                                                        </span>
                                                        <p className="text-[11px] text-slate-600 leading-snug">
                                                            Peserta cukup scan 1 kali. Kehadiran langsung tercatat sebagai <b>HADIR</b>.
                                                        </p>
                                                    </div>
                                                    <div className="bg-white rounded-lg p-2 border border-indigo-100/80 shadow-2xs flex flex-col justify-center">
                                                        <span className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-0.5">
                                                            💡 Penggunaan
                                                        </span>
                                                        <p className="text-[11px] text-slate-600 leading-snug">
                                                            Upworkcode bendera, seminar, rapat pleno, ujian sekolah, dan kegiatan insidental.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 p-2.5 h-full flex flex-col justify-between animate-[fadeIn_0.15s_ease-out]">
                                                {/* Hari Aktif Buttons */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[10px] font-extrabold text-blue-900 uppercase tracking-wider">Hari Kerja Aktif</span>
                                                        <span className="text-[10px] text-blue-600 font-bold bg-blue-100/70 px-2 py-0.5 rounded-md">{data.hari_aktif.length} hari aktif</span>
                                                    </div>
                                                    <div className="grid grid-cols-7 gap-1">
                                                        {[
                                                            { id: 1, name: 'Sen' },
                                                            { id: 2, name: 'Sel' },
                                                            { id: 3, name: 'Rab' },
                                                            { id: 4, name: 'Kam' },
                                                            { id: 5, name: 'Jum' },
                                                            { id: 6, name: 'Sab' },
                                                            { id: 7, name: 'Min' },
                                                        ].map((day) => {
                                                            const isSelected = data.hari_aktif.includes(day.id);
                                                            return (
                                                                <button
                                                                    type="button"
                                                                    key={day.id}
                                                                    onClick={() => handleToggleDay(day.id)}
                                                                    className={`py-1 text-[11px] font-bold rounded-md border transition-all text-center ${
                                                                        isSelected
                                                                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                                                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                                                    }`}
                                                                >
                                                                    {day.name}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Jam Datang & Pulang In 2 Small Columns */}
                                                <div className="grid grid-cols-2 gap-2">
                                                    {/* Datang */}
                                                    <div className="bg-white rounded-lg p-1.5 border border-blue-100 shadow-2xs">
                                                        <span className="block text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-0.5">
                                                            🟢 Jam Datang
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                type="time"
                                                                value={data.jam_datang_mulai}
                                                                onChange={(e) => setData('jam_datang_mulai', e.target.value)}
                                                                className="w-full min-w-0 rounded border border-slate-200 px-1 py-0.5 text-[11px] font-bold font-mono text-slate-800 focus:border-blue-500 shadow-2xs"
                                                                required={data.kategori === 'harian'}
                                                            />
                                                            <span className="text-[10px] font-bold text-slate-400">-</span>
                                                            <input
                                                                type="time"
                                                                value={data.jam_datang_selesai}
                                                                onChange={(e) => setData('jam_datang_selesai', e.target.value)}
                                                                className="w-full min-w-0 rounded border border-slate-200 px-1 py-0.5 text-[11px] font-bold font-mono text-slate-800 focus:border-blue-500 shadow-2xs"
                                                                required={data.kategori === 'harian'}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Pulang */}
                                                    <div className="bg-white rounded-lg p-1.5 border border-blue-100 shadow-2xs">
                                                        <span className="block text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">
                                                            🟠 Jam Pulang
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                type="time"
                                                                value={data.jam_pulang_mulai}
                                                                onChange={(e) => setData('jam_pulang_mulai', e.target.value)}
                                                                className="w-full min-w-0 rounded border border-slate-200 px-1 py-0.5 text-[11px] font-bold font-mono text-slate-800 focus:border-blue-500 shadow-2xs"
                                                                required={data.kategori === 'harian'}
                                                            />
                                                            <span className="text-[10px] font-bold text-slate-400">-</span>
                                                            <input
                                                                type="time"
                                                                value={data.jam_pulang_selesai}
                                                                onChange={(e) => setData('jam_pulang_selesai', e.target.value)}
                                                                className="w-full min-w-0 rounded border border-slate-200 px-1 py-0.5 text-[11px] font-bold font-mono text-slate-800 focus:border-blue-500 shadow-2xs"
                                                                required={data.kategori === 'harian'}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Activate Checkbox */}
                                    <label className="flex items-center gap-2 cursor-pointer pt-0.5 select-none">
                                        <input
                                            type="checkbox"
                                            checked={data.set_active}
                                            onChange={(e) => setData('set_active', e.target.checked)}
                                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        />
                                        <span className="text-xs font-bold text-slate-700">Langsung jadikan Workcode Aktif</span>
                                    </label>
                                </div>

                                {/* Right Column: Map (5 cols) */}
                                <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50/80 p-3 rounded-2xl border border-slate-200 gap-2">
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
                                            <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                                            Titik Presensi (Radius 100m)
                                        </span>
                                        {mapPosition ? (
                                            <span className="text-[10px] font-extrabold text-indigo-600 font-mono bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100">
                                                {mapPosition.lat.toFixed(4)}, {mapPosition.lng.toFixed(4)}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-red-500">Belum diset</span>
                                        )}
                                    </div>

                                    <div className="w-full h-[260px] sm:h-[300px] rounded-xl overflow-hidden border border-slate-200 relative shadow-inner bg-slate-100">
                                        <MapErrorBoundary>
                                            <MapContainer center={[-6.2088, 106.8456]} zoom={14} scrollWheelZoom={true} attributionControl={false} style={{ height: '100%', width: '100%' }}>
                                                <TileLayer
                                                    attribution='&copy; OpenStreetMap contributors'
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                />
                                                <LocationMarker position={mapPosition} setPosition={setMapPosition} radius={100} />
                                            </MapContainer>
                                        </MapErrorBoundary>
                                    </div>

                                    <p className="text-[10px] text-slate-400 text-center leading-tight">
                                        Klik pada peta untuk memindahkan titik lokasi.
                                    </p>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/90 px-6 py-2.5">
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition shadow-2xs"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                form="create-workcode-form"
                                disabled={processing}
                                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-50 transition"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan & Aktifkan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
