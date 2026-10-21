import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import KpiCard from '@/Components/KpiCard';
import { icons } from '@/lib/adminMenu';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { useToast } from '@/Components/Toast';
import { useConfirm } from '@/Components/ConfirmDialog';
import GoogleMap from '@/Components/GoogleMap';

const DEFAULT_MAP_POSITION = { lat: -6.2088, lng: 106.8456 };
const INDONESIA_BOUNDS = {
    south: -11.5,
    north: 6.5,
    west: 94.5,
    east: 141.5,
};

const isValidCoordinate = (coordinate) => {
    if (!coordinate) return false;

    const { lat, lng } = coordinate;

    return Number.isFinite(lat)
        && Number.isFinite(lng)
        && lat >= -90
        && lat <= 90
        && lng >= -180
        && lng <= 180;
};

const isWithinIndonesia = (coordinate) => (
    isValidCoordinate(coordinate)
    && coordinate.lat >= INDONESIA_BOUNDS.south
    && coordinate.lat <= INDONESIA_BOUNDS.north
    && coordinate.lng >= INDONESIA_BOUNDS.west
    && coordinate.lng <= INDONESIA_BOUNDS.east
);

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
      return <div className="p-4 bg-red-100 text-red-700 text-xs rounded-lg border border-red-200">Error loading map: {this.state.errorMsg}</div>;
    }
    return this.props.children;
  }
}

const normalizeTimeForInput = (value, fallback) => {
    return typeof value === 'string' && value.length >= 5
        ? value.substring(0, 5)
        : fallback;
};

const getTodayForInput = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

    return now.toISOString().slice(0, 10);
};

const normalizeDailySchedule = (schedule) => {
    return Object.fromEntries(
        Object.entries(schedule).map(([day, times]) => [
            day,
            {
                ...times,
                jam_datang_mulai: normalizeTimeForInput(times?.jam_datang_mulai, '06:00'),
                jam_datang_selesai: normalizeTimeForInput(times?.jam_datang_selesai, '07:00'),
                jam_pulang_mulai: normalizeTimeForInput(times?.jam_pulang_mulai, '15:30'),
                jam_pulang_selesai: normalizeTimeForInput(times?.jam_pulang_selesai, '22:00'),
            },
        ]),
    );
};

// Batas tutup presensi datang ("HH:MM" + toleransi), paling lambat 23:59 — sama dengan Workcode::withLateTolerance.
const addToleranceToTime = (time, minutes) => {
    const [hours, mins] = (time || '').split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(mins)) return null;
    const total = Math.min(hours * 60 + mins + minutes, 23 * 60 + 59);

    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

export default function WorkcodesIndex({ workcodes, participants, lateToleranceMinutes = 60 }) {
    const { flash } = usePage().props;
    const { toast } = useToast();
    const confirm = useConfirm();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [previewMapWorkcode, setPreviewMapWorkcode] = useState(null);
    const [mapPosition, setMapPosition] = useState(DEFAULT_MAP_POSITION);
    const [locationStatus, setLocationStatus] = useState(null);
    const [editingWorkcode, setEditingWorkcode] = useState(null);
    const [isParticipantSelectionOpen, setIsParticipantSelectionOpen] = useState(false);
    const [participantSearch, setParticipantSearch] = useState('');

    const { data, setData, post, put, processing, errors, reset, transform } = useForm({
        nama_workcode: '',
        deskripsi: '',
        kategori: 'workcode',
        tanggal: getTodayForInput(),
        jam_aktif_mulai: '07:00',
        jam_aktif_selesai: '10:00',
        hari_aktif: [1,2,3,4,5],
        jam_datang_mulai: '06:00',
        jam_datang_selesai: '07:00',
        jam_pulang_mulai: '15:30',
        jam_pulang_selesai: '22:00',
        jadwal_per_hari: {
            1: { jam_datang_mulai: '06:00', jam_datang_selesai: '07:00', jam_pulang_mulai: '15:30', jam_pulang_selesai: '22:00' },
            2: { jam_datang_mulai: '06:00', jam_datang_selesai: '07:00', jam_pulang_mulai: '15:30', jam_pulang_selesai: '22:00' },
            3: { jam_datang_mulai: '06:00', jam_datang_selesai: '07:00', jam_pulang_mulai: '15:30', jam_pulang_selesai: '22:00' },
            4: { jam_datang_mulai: '06:00', jam_datang_selesai: '07:00', jam_pulang_mulai: '15:30', jam_pulang_selesai: '22:00' },
            5: { jam_datang_mulai: '06:00', jam_datang_selesai: '07:00', jam_pulang_mulai: '16:00', jam_pulang_selesai: '22:00' },
            6: { jam_datang_mulai: '06:00', jam_datang_selesai: '07:00', jam_pulang_mulai: '15:30', jam_pulang_selesai: '22:00' },
            7: { jam_datang_mulai: '06:00', jam_datang_selesai: '07:00', jam_pulang_mulai: '15:30', jam_pulang_selesai: '22:00' },
        },
        latitude: '',
        longitude: '',
        radius_meters: 100,
        set_active: true,
        participant_ids: [],
    });

    const updateJadwalPerHari = (hari, field, value) => {
        setData('jadwal_per_hari', {
            ...data.jadwal_per_hari,
            [hari]: {
                ...data.jadwal_per_hari[hari],
                [field]: value
            }
        });
    };

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

    useEffect(() => {
        if (!showCreateModal) {
            setLocationStatus(null);
        }
    }, [showCreateModal]);

    const handleCreate = () => {
        reset();
        setEditingWorkcode(null);
        setIsParticipantSelectionOpen(false);
        setParticipantSearch('');
        setMapPosition(DEFAULT_MAP_POSITION);
        setLocationStatus(null);
        setShowCreateModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        transform((formData) => ({
            ...formData,
            latitude: mapPosition?.lat ?? formData.latitude,
            longitude: mapPosition?.lng ?? formData.longitude,
            set_active: formData.kategori === 'workcode' ? false : formData.set_active,
        }));

        const showSubmissionError = (submissionErrors) => {
            toast.error(Object.values(submissionErrors)[0] || 'Workcode gagal disimpan. Periksa kembali data yang diisi.');
        };
        
        if (editingWorkcode) {
            put(route('workcodes.update', editingWorkcode.id), {
                onSuccess: () => {
                    reset();
                    setEditingWorkcode(null);
                    setShowCreateModal(false);
                },
                onError: showSubmissionError,
            });
        } else {
            post(route('workcodes.store'), {
                onSuccess: () => {
                    reset();
                    setShowCreateModal(false);
                },
                onError: showSubmissionError,
            });
        }
    };

    const handleEdit = (workcode) => {
        const storedPosition = {
            lat: Number(workcode.latitude),
            lng: Number(workcode.longitude),
        };
        const safePosition = isWithinIndonesia(storedPosition)
            ? storedPosition
            : DEFAULT_MAP_POSITION;

        setEditingWorkcode(workcode);
        setIsParticipantSelectionOpen(false);
        setParticipantSearch('');
        setLocationStatus(null);
        setData({
            nama_workcode: workcode.nama_workcode,
            deskripsi: workcode.deskripsi || '',
            kategori: workcode.kategori || 'workcode',
            tanggal: workcode.tanggal || '',
            jam_aktif_mulai: normalizeTimeForInput(workcode.jam_aktif_mulai, '07:00'),
            jam_aktif_selesai: normalizeTimeForInput(workcode.jam_aktif_selesai, '10:00'),
            hari_aktif: workcode.hari_aktif || [1,2,3,4,5],
            jam_datang_mulai: normalizeTimeForInput(workcode.jam_datang_mulai, '06:00'),
            jam_datang_selesai: normalizeTimeForInput(workcode.jam_datang_selesai, '07:00'),
            jam_pulang_mulai: normalizeTimeForInput(workcode.jam_pulang_mulai, '15:30'),
            jam_pulang_selesai: normalizeTimeForInput(workcode.jam_pulang_selesai, '22:00'),
            jadwal_per_hari: normalizeDailySchedule(workcode.jadwal_per_hari || {
                1: { jam_datang_mulai: '06:00', jam_datang_selesai: '07:00', jam_pulang_mulai: '15:30', jam_pulang_selesai: '22:00' },
                2: { jam_datang_mulai: '06:00', jam_datang_selesai: '07:00', jam_pulang_mulai: '15:30', jam_pulang_selesai: '22:00' },
                3: { jam_datang_mulai: '06:00', jam_datang_selesai: '07:00', jam_pulang_mulai: '15:30', jam_pulang_selesai: '22:00' },
                4: { jam_datang_mulai: '06:00', jam_datang_selesai: '07:00', jam_pulang_mulai: '15:30', jam_pulang_selesai: '22:00' },
                5: { jam_datang_mulai: '06:00', jam_datang_selesai: '07:00', jam_pulang_mulai: '15:30', jam_pulang_selesai: '22:00' },
                6: { jam_datang_mulai: '06:00', jam_datang_selesai: '07:00', jam_pulang_mulai: '15:30', jam_pulang_selesai: '22:00' },
                7: { jam_datang_mulai: '06:00', jam_datang_selesai: '07:00', jam_pulang_mulai: '15:30', jam_pulang_selesai: '22:00' },
            }),
            latitude: workcode.latitude || '',
            longitude: workcode.longitude || '',
            radius_meters: workcode.radius_meters || 100,
            set_active: false,
            participant_ids: (workcode.participants || []).map((participant) => participant.id),
        });
        setMapPosition(safePosition);
        setShowCreateModal(true);
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

    const activeWorkcode = workcodes.find((e) => e.is_effectively_active);

    const activeCount = workcodes.filter((workcode) => workcode.is_effectively_active).length;
    const todayIso = new Date().getDay() === 0 ? 7 : new Date().getDay();
    const todayName = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'][todayIso - 1];
    const badge = 'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase leading-4 text-white';
    const formatDate = (value) => new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <AuthenticatedLayout>
            <Head title="Kelola Workcode" />

            <div className="flex w-full flex-1 flex-col px-4 py-2 sm:px-6 xl:min-h-0 xl:overflow-hidden">
                {/* Judul halaman + aksi utama */}
                <div className="mb-4 shrink-0 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between" data-aos="fade-up">
                    <div>
                        <h3 className="text-xl font-bold text-neutral-800">Workcode</h3>
                        <p className="mt-0.5 text-sm text-neutral-500">Atur jadwal presensi harian dan kegiatan beserta batas lokasinya.</p>
                    </div>
                    <button type="button" onClick={handleCreate} className="btn-brand self-start sm:self-auto">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Buat Workcode
                    </button>
                </div>

                {/* KPI */}
                <section className="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-3">
                    <KpiCard delay={0} label="Workcode Aktif" value={activeWorkcode ? activeCount : 0} icon={icons.calendar}>
                        {activeWorkcode
                            ? <span className="font-semibold text-neutral-700">{activeWorkcode.nama_workcode}</span>
                            : <><span className="font-bold text-rose-500">Terkunci</span>, belum ada yang aktif</>}
                    </KpiCard>
                    <KpiCard delay={50} label="Presensi Workcode Aktif" value={activeWorkcode?.attendances_count ?? 0} icon={icons.check}>
                        <span className="font-bold text-emerald-600">{activeWorkcode?.attendances_count ?? 0}</span> kehadiran tercatat
                    </KpiCard>
                    <KpiCard delay={100} label="Total Workcode" value={workcodes.length} icon={icons.chart}>
                        {activeWorkcode?.latitude && activeWorkcode?.longitude ? (
                            <>
                                Radius <span className="font-bold text-neutral-800">{activeWorkcode.radius_meters || 100} m</span> ·{' '}
                                <button type="button" onClick={() => setPreviewMapWorkcode(activeWorkcode)} className="font-medium text-brand-700 underline-offset-2 hover:underline">
                                    lihat peta
                                </button>
                            </>
                        ) : (
                            'tanpa batas lokasi aktif'
                        )}
                    </KpiCard>
                </section>

                {/* Daftar workcode */}
                <section className="mt-4 flex flex-col xl:min-h-0 xl:flex-1" data-aos="fade-up" data-aos-delay="100">
                    <div className="mb-3 flex shrink-0 items-end justify-between">
                        <div>
                            <h6 className="text-base font-semibold text-neutral-800">Daftar Workcode</h6>
                            <p className="text-sm text-neutral-500">Workcode aktif ditandai garis gelap.</p>
                        </div>
                    </div>

                    {workcodes.length === 0 ? (
                        <div className="card-soft px-6 py-12 text-center">
                            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-dark">
                                <span className="h-6 w-6">{icons.calendar}</span>
                            </span>
                            <h4 className="text-base font-semibold text-neutral-800">Belum ada workcode</h4>
                            <p className="mt-1 text-sm text-neutral-500">Buat workcode pertama untuk mulai menerima presensi.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 content-start gap-4 md:grid-cols-2 xl:-mx-1 xl:min-h-0 xl:flex-1 xl:grid-cols-3 xl:overflow-y-auto xl:px-1 xl:pb-1">
                            {workcodes.map((workcode) => {
                                const schedule = workcode.jadwal_per_hari?.[todayIso] || {
                                    jam_datang_mulai: workcode.jam_datang_mulai,
                                    jam_datang_selesai: workcode.jam_datang_selesai,
                                    jam_pulang_mulai: workcode.jam_pulang_mulai,
                                    jam_pulang_selesai: workcode.jam_pulang_selesai,
                                };
                                const autoManaged = workcode.kategori === 'workcode' && workcode.jam_aktif_mulai && workcode.jam_aktif_selesai;

                                return (
                                    <article
                                        key={workcode.id}
                                        className={`card-soft flex flex-col transition-shadow duration-200 hover:shadow-soft-lg ${workcode.is_effectively_active ? '!border-brand-500 ring-1 ring-brand-500' : ''}`}
                                    >
                                        <div className="p-4 pb-3">
                                            <div className="mb-2 flex flex-wrap items-center gap-1.5">
                                                <span className={`${badge} ${workcode.is_effectively_active ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' : 'bg-gradient-to-b from-neutral-300 to-neutral-400'}`}>
                                                    {workcode.is_effectively_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                                <span className={`${badge} bg-brand-gradient`}>{workcode.kategori === 'harian' ? 'Harian' : 'Kegiatan'}</span>
                                                {workcode.tanggal && (
                                                    <span className="text-xs font-medium text-neutral-500">{formatDate(workcode.tanggal)}</span>
                                                )}
                                            </div>
                                            <h4 className="line-clamp-1 text-base font-semibold text-neutral-800" title={workcode.nama_workcode}>{workcode.nama_workcode}</h4>
                                            <p className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-sm text-neutral-500">{workcode.deskripsi || 'Tidak ada deskripsi.'}</p>
                                        </div>

                                        <hr className="hr-fade" />

                                        <dl className="space-y-2 p-4 py-3 text-xs">
                                            {autoManaged && (
                                                <InfoRow label="Aktif otomatis" value={`${workcode.jam_aktif_mulai.substring(0, 5)}–${workcode.jam_aktif_selesai.substring(0, 5)} WIB`} />
                                            )}
                                            {workcode.kategori === 'harian' && (
                                                workcode.hari_aktif?.includes(todayIso) ? (
                                                    <>
                                                        <InfoRow label={`Datang (${todayName})`} value={`${schedule.jam_datang_mulai?.substring(0, 5) || '06:00'}–${schedule.jam_datang_selesai?.substring(0, 5) || '07:00'} (telat s.d. ${addToleranceToTime(schedule.jam_datang_selesai?.substring(0, 5) || '07:00', lateToleranceMinutes)})`} dot="bg-emerald-500" />
                                                        <InfoRow label={`Pulang (${todayName})`} value={`${schedule.jam_pulang_mulai?.substring(0, 5) || '15:30'}–${schedule.jam_pulang_selesai?.substring(0, 5) || '22:00'}`} dot="bg-amber-500" />
                                                    </>
                                                ) : (
                                                    <InfoRow label={`Hari ini (${todayName})`} value="Libur" dot="bg-rose-500" />
                                                )
                                            )}
                                            {workcode.kategori === 'harian' && (
                                                <InfoRow label="Hari kerja" value={`${workcode.hari_aktif?.length || 0} hari/minggu`} />
                                            )}
                                            <div className="flex items-center justify-between gap-3">
                                                <dt className="text-neutral-500">Lokasi</dt>
                                                <dd className="flex items-center gap-2 font-semibold text-neutral-800">
                                                    {workcode.latitude && workcode.longitude ? (
                                                        <>
                                                            Radius {workcode.radius_meters || 100} m
                                                            <button
                                                                type="button"
                                                                onClick={() => setPreviewMapWorkcode(workcode)}
                                                                className="rounded px-1.5 py-0.5 font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                                                                title="Lihat peta & radius"
                                                            >
                                                                Peta ↗
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="font-normal text-neutral-400">Tanpa batas lokasi</span>
                                                    )}
                                                </dd>
                                            </div>
                                        </dl>

                                        <hr className="hr-fade mt-auto" />
                                        <div className="flex items-center justify-between gap-2 p-4 py-3">
                                            <p className="text-sm text-neutral-500">
                                                <span className="font-bold text-neutral-800">{workcode.attendances_count}</span> hadir
                                            </p>
                                            <div className="flex items-center gap-1">
                                                {autoManaged ? (
                                                    <span className="px-2 text-xs font-medium text-neutral-400" title="Aktif & nonaktif mengikuti jam otomatis">Otomatis</span>
                                                ) : workcode.is_active ? (
                                                    <button type="button" onClick={() => handleDeactivate(workcode.id, workcode.nama_workcode)} className="rounded-md border border-brand-600 px-3 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-600 hover:text-white">
                                                        Nonaktifkan
                                                    </button>
                                                ) : (
                                                    <button type="button" onClick={() => handleActivate(workcode.id, workcode.nama_workcode)} className="rounded-md bg-brand-gradient px-3 py-1 text-xs font-medium text-white shadow-dark-sm transition-shadow hover:shadow-dark-hover active:opacity-85">
                                                        Aktifkan
                                                    </button>
                                                )}
                                                <button type="button" onClick={() => handleEdit(workcode)} className="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900" title="Edit workcode">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button type="button" onClick={() => handleDelete(workcode.id, workcode.nama_workcode)} className="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-rose-50 hover:text-rose-600" title="Hapus workcode">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            {/* Modal Buat Workcode Baru */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />

                    <div className="relative my-auto flex h-[680px] max-h-[calc(100dvh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-soft-lg transition-all animate-[fadeIn_0.2s_ease-out] sm:max-h-[calc(100dvh-3rem)] md:max-h-[calc(100dvh-4rem)]">
                        {/* Header */}
                        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/90 px-6 py-3">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-dark-sm">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800">{editingWorkcode ? 'Edit Workcode' : 'Buat Workcode Baru'}</h3>
                                    <p className="text-[11px] text-slate-500 font-medium">Pilih format presensi & batasan radius</p>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setShowCreateModal(false)} 
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
                            <form id="create-workcode-form" onSubmit={handleSubmit} autoComplete="off" className="grid grid-cols-1 gap-5 items-stretch lg:h-full lg:min-h-0 lg:grid-cols-12">
                                {/* Left Column (7 cols) */}
                                <div className="flex flex-col gap-4 lg:col-span-7 lg:h-full lg:min-h-0">
                                    {/* Nama Workcode */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Nama Workcode / Kegiatan <span className="text-red-500">*</span>
                                        </label>
                                        {/* Cegah pengelola password browser mengisi username akun ke kolom ini */}
                                        <input
                                            type="text"
                                            name="nama_workcode"
                                            autoComplete="off"
                                            data-lpignore="true"
                                            data-1p-ignore="true"
                                            data-bwignore="true"
                                            data-form-type="other"
                                            required
                                            placeholder="Contoh: Presensi Harian Guru & Karyawan / Upworkcode..."
                                            value={data.nama_workcode}
                                            onChange={(e) => setData('nama_workcode', e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium shadow-2xs transition-all"
                                        />
                                        {errors.nama_workcode && <p className="mt-1 text-[10px] text-red-600 font-bold">{errors.nama_workcode}</p>}
                                    </div>

                                    {/* Jadwal aktif otomatis untuk kegiatan */}
                                    {data.kategori === 'workcode' && (
                                        <div className="animate-[fadeIn_0.15s_ease-out] rounded-lg border border-neutral-200 bg-neutral-100 p-3">
                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-800">
                                                    Jadwal Aktif Otomatis
                                                </span>
                                                <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[9px] font-bold text-neutral-800">
                                                    WIB
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                                <div>
                                                    <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-slate-600">
                                                        Tanggal <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        required
                                                        value={data.tanggal}
                                                        onChange={(e) => setData('tanggal', e.target.value)}
                                                        className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                                                    />
                                                    {errors.tanggal && <p className="mt-1 text-[9px] font-bold text-red-600">{errors.tanggal}</p>}
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-slate-600">
                                                        Jam Mulai <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="time"
                                                        required
                                                        value={data.jam_aktif_mulai}
                                                        onChange={(e) => setData('jam_aktif_mulai', e.target.value)}
                                                        className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 shadow-2xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                                                    />
                                                    {errors.jam_aktif_mulai && <p className="mt-1 text-[9px] font-bold text-red-600">{errors.jam_aktif_mulai}</p>}
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-slate-600">
                                                        Jam Selesai <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="time"
                                                        required
                                                        value={data.jam_aktif_selesai}
                                                        min={data.jam_aktif_mulai || undefined}
                                                        onChange={(e) => setData('jam_aktif_selesai', e.target.value)}
                                                        className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 shadow-2xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                                                    />
                                                    {errors.jam_aktif_selesai && <p className="mt-1 text-[9px] font-bold text-red-600">{errors.jam_aktif_selesai}</p>}
                                                </div>
                                            </div>
                                            <p className="mt-2 text-[10px] leading-snug text-neutral-800">
                                                Workcode menyala otomatis pada jam mulai dan langsung ditutup pada jam selesai.
                                            </p>
                                        </div>
                                    )}

                                    {/* Kategori Presensi */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Kategori Presensi <span className="text-red-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-1 gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200/80 sm:grid-cols-2">
                                            <button
                                                type="button"
                                                onClick={() => setData('kategori', 'workcode')}
                                                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                                                    data.kategori === 'workcode'
                                                        ? 'bg-white text-neutral-800 shadow-sm ring-1 ring-slate-200/80'
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
                                                        ? 'bg-brand-gradient text-white shadow-dark-sm'
                                                        : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                            >
                                                <span>⏰</span>
                                                <span>Presensi Harian</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Seamless Configuration Box */}
                                    <div className="flex min-h-[148px] flex-col lg:min-h-0 lg:flex-1">
                                        {data.kategori === 'workcode' ? (
                                            <div className="rounded-lg border border-neutral-200/80 bg-neutral-100 p-3 flex-1 flex flex-col justify-center gap-3 animate-[fadeIn_0.15s_ease-out]">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                                                        <span>📌</span> Mode Presensi Sekali
                                                    </span>
                                                    <span className="text-[10px] text-neutral-800 font-bold bg-neutral-100 px-2 py-0.5 rounded-md">
                                                        1x Scan / Peserta
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 flex-1 mt-1.5">
                                                    <div className="bg-white rounded-lg p-2 border border-neutral-200/80 shadow-2xs flex flex-col justify-center">
                                                        <span className="block text-[10px] font-bold text-neutral-800 uppercase tracking-wider mb-0.5">
                                                            🎯 Mekanisme
                                                        </span>
                                                        <p className="text-[11px] text-slate-600 leading-snug">
                                                            Peserta cukup scan 1 kali. Kehadiran langsung tercatat sebagai <b>HADIR</b>.
                                                        </p>
                                                    </div>
                                                    <div className="bg-white rounded-lg p-2 border border-neutral-200/80 shadow-2xs flex flex-col justify-center">
                                                        <span className="block text-[10px] font-bold text-neutral-800 uppercase tracking-wider mb-0.5">
                                                            💡 Penggunaan
                                                        </span>
                                                        <p className="text-[11px] text-slate-600 leading-snug">
                                                            Upworkcode bendera, seminar, rapat pleno, ujian sekolah, dan kegiatan insidental.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-lg border border-blue-200/80 bg-blue-50/50 p-3 animate-[fadeIn_0.15s_ease-out]">
                                                {/* Hari Aktif Buttons */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">Hari Kerja Aktif</span>
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
                                                                            ? 'bg-brand-600 text-white border-brand-600 shadow-2xs'
                                                                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                                                    }`}
                                                                >
                                                                    {day.name}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <p className="text-[10px] leading-snug text-blue-800">
                                                    ⏱️ Presensi datang tetap dibuka {lateToleranceMinutes} menit setelah jam datang selesai dan dicatat <b>terlambat</b>. Jam pulang mulai harus setelah batas itu. Presensi pulang tanpa toleransi.
                                                </p>
                                                {errors.jam_pulang_mulai && <p className="text-[9px] font-bold text-red-600">{errors.jam_pulang_mulai}</p>}

                                                {/* Jam Datang & Pulang Dinamis Per Hari */}
                                                <div className="flex max-h-[150px] flex-col gap-2 overflow-y-auto pr-1 lg:min-h-0 lg:flex-1 lg:max-h-none">
                                                    {data.hari_aktif.sort().map(hariId => {
                                                        const dayName = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'][hariId - 1];
                                                        const jadwal = data.jadwal_per_hari[hariId] || { jam_datang_mulai: '06:00', jam_datang_selesai: '07:00', jam_pulang_mulai: '15:30', jam_pulang_selesai: '22:00' };
                                                        const conflictError = errors[`jadwal_per_hari.${hariId}.jam_pulang_mulai`];

                                                        return (
                                                            <div key={hariId} className={`bg-white rounded-lg p-1.5 border shadow-2xs flex flex-col gap-1 ${conflictError ? 'border-red-300' : 'border-blue-100'}`}>
                                                            <div className="flex flex-col md:flex-row md:items-center gap-2">
                                                                <div className="w-10 shrink-0 text-center">
                                                                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">{dayName}</span>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-2 flex-1">
                                                                    {/* Datang */}
                                                                    <div className="flex flex-col">
                                                                        <span className="block text-[9px] font-bold text-emerald-700 uppercase tracking-wider mb-0.5">🟢 Datang</span>
                                                                        <div className="flex items-center gap-1">
                                                                            <input
                                                                                type="time"
                                                                                value={jadwal.jam_datang_mulai}
                                                                                onChange={(e) => updateJadwalPerHari(hariId, 'jam_datang_mulai', e.target.value)}
                                                                                className="w-full min-w-0 rounded border border-slate-200 px-1 py-0.5 text-[11px] font-bold font-mono text-slate-800 focus:border-blue-500 shadow-2xs"
                                                                                required={data.kategori === 'harian'}
                                                                            />
                                                                            <span className="text-[10px] font-bold text-slate-400">-</span>
                                                                            <input
                                                                                type="time"
                                                                                value={jadwal.jam_datang_selesai}
                                                                                onChange={(e) => updateJadwalPerHari(hariId, 'jam_datang_selesai', e.target.value)}
                                                                                className="w-full min-w-0 rounded border border-slate-200 px-1 py-0.5 text-[11px] font-bold font-mono text-slate-800 focus:border-blue-500 shadow-2xs"
                                                                                required={data.kategori === 'harian'}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    {/* Pulang */}
                                                                    <div className="flex flex-col">
                                                                        <span className="block text-[9px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">🟠 Pulang</span>
                                                                        <div className="flex items-center gap-1">
                                                                            <input
                                                                                type="time"
                                                                                value={jadwal.jam_pulang_mulai}
                                                                                onChange={(e) => updateJadwalPerHari(hariId, 'jam_pulang_mulai', e.target.value)}
                                                                                className="w-full min-w-0 rounded border border-slate-200 px-1 py-0.5 text-[11px] font-bold font-mono text-slate-800 focus:border-blue-500 shadow-2xs"
                                                                                required={data.kategori === 'harian'}
                                                                            />
                                                                            <span className="text-[10px] font-bold text-slate-400">-</span>
                                                                            <input
                                                                                type="time"
                                                                                value={jadwal.jam_pulang_selesai}
                                                                                onChange={(e) => updateJadwalPerHari(hariId, 'jam_pulang_selesai', e.target.value)}
                                                                                className="w-full min-w-0 rounded border border-slate-200 px-1 py-0.5 text-[11px] font-bold font-mono text-slate-800 focus:border-blue-500 shadow-2xs"
                                                                                required={data.kategori === 'harian'}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {conflictError && <p className="px-1 text-[9px] font-bold text-red-600">{conflictError}</p>}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <button type="button" onClick={() => setIsParticipantSelectionOpen(true)} className="min-w-0 text-left">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">Peserta Workcode</p>
                                                <p className="mt-0.5 text-[10px] leading-snug text-emerald-700">{data.participant_ids.length === 0 ? 'Belum dibatasi — semua peserta dapat presensi.' : `${data.participant_ids.length} peserta dipilih.`}</p>
                                            </button>
                                            <button type="button" onClick={() => setIsParticipantSelectionOpen(true)} className="shrink-0 rounded-md border border-emerald-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100">Pilih Peserta</button>
                                        </div>
                                    </div>

                                    {/* Activate Checkbox */}
                                    {!editingWorkcode && data.kategori === 'harian' && (
                                        <label className="flex items-center gap-2 cursor-pointer pt-0.5 select-none">
                                            <input
                                                type="checkbox"
                                                checked={data.set_active}
                                                onChange={(e) => setData('set_active', e.target.checked)}
                                                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                                            />
                                            <span className="text-xs font-bold text-slate-700">Langsung jadikan Workcode Aktif</span>
                                        </label>
                                    )}
                                </div>

                                {/* Right Column: Map (5 cols) */}
                                <div className="flex flex-col justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3 lg:col-span-5 lg:h-full lg:min-h-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                                                <svg className="w-3.5 h-3.5 text-neutral-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                                                Titik & Radius
                                            </span>
                                            <div className="flex items-center bg-white rounded-md border border-slate-200 shadow-2xs overflow-hidden">
                                                <input 
                                                    type="number" 
                                                    min="10" 
                                                    max="5000"
                                                    value={data.radius_meters}
                                                    onChange={(e) => setData('radius_meters', parseInt(e.target.value) || 10)}
                                                    className="w-14 h-6 border-none px-1 py-0 text-[10px] font-bold text-center text-slate-800 focus:ring-0 focus:outline-none"
                                                />
                                                <span className="px-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 border-l border-slate-200 h-6 flex items-center">
                                                    m
                                                </span>
                                            </div>
                                        </div>
                                        {mapPosition ? (
                                            <span className="text-[10px] font-bold text-neutral-800 font-mono bg-neutral-100 px-1.5 py-0.5 rounded-md border border-neutral-200">
                                                {mapPosition.lat.toFixed(4)}, {mapPosition.lng.toFixed(4)}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-red-500">Belum diset</span>
                                        )}
                                    </div>

                                    <div className="relative h-[260px] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-inner sm:h-[300px] lg:h-auto lg:min-h-[260px] lg:flex-1">
                                        <MapErrorBoundary>
                                            <GoogleMap
                                                position={mapPosition}
                                                radius={data.radius_meters || 100}
                                                interactive
                                                onPositionChange={setMapPosition}
                                                onLocationStatusChange={setLocationStatus}
                                            />
                                        </MapErrorBoundary>
                                    </div>

                                    <p className={`text-[10px] text-center leading-tight font-medium ${
                                        locationStatus?.type === 'error'
                                            ? 'text-red-600'
                                            : locationStatus?.type === 'success'
                                                ? 'text-emerald-600'
                                                : locationStatus?.type === 'locating'
                                                    ? 'text-neutral-800 animate-pulse'
                                                    : locationStatus?.type === 'manual'
                                                        ? 'text-slate-600'
                                                        : 'text-slate-400'
                                    }`}>
                                        {locationStatus?.message || 'Klik ikon lokasi untuk memakai GPS, klik peta, atau geser marker untuk memilih titik.'}
                                    </p>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/90 px-6 py-3.5">
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition shadow-sm"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                form="create-workcode-form"
                                disabled={processing}
                                className="inline-flex items-center justify-center rounded-md bg-brand-gradient px-6 py-2.5 text-sm font-bold text-white shadow-dark-sm hover:bg-brand-gradient disabled:opacity-50 transition"
                            >
                                {processing ? 'Menyimpan...' : editingWorkcode ? 'Simpan Perubahan' : (
                                    data.kategori === 'workcode'
                                        ? 'Simpan Jadwal'
                                        : 'Simpan & Aktifkan'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isParticipantSelectionOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
                    <button type="button" aria-label="Tutup pemilihan peserta" onClick={() => setIsParticipantSelectionOpen(false)} className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
                    <div className="relative flex max-h-[min(720px,calc(100dvh-2rem))] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft-lg">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-emerald-50 px-5 py-4 sm:px-6">
                            <div>
                                <p className="text-base font-bold text-emerald-950">Pilih Peserta Workcode</p>
                                <p className="mt-1 text-xs font-medium text-emerald-700">Hanya peserta yang dicentang dapat menggunakan workcode ini.</p>
                            </div>
                            <button type="button" onClick={() => setIsParticipantSelectionOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-800" aria-label="Tutup">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="border-b border-slate-100 px-5 py-3 sm:px-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-emerald-800">
                                    <input type="checkbox" checked={participants.length > 0 && data.participant_ids.length === participants.length} onChange={(event) => setData('participant_ids', event.target.checked ? participants.map((participant) => participant.id) : [])} className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500" />
                                    Centang seluruh peserta
                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px]">{data.participant_ids.length}/{participants.length}</span>
                                </label>
                                <input value={participantSearch} onChange={(event) => setParticipantSearch(event.target.value)} placeholder="Cari nama atau NIP..." className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-emerald-500 focus:ring-emerald-500 sm:w-60" />
                            </div>
                            <p className="mt-2 text-[11px] text-slate-500">Kosongkan semua centang jika workcode ini terbuka untuk seluruh peserta.</p>
                        </div>
                        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {participants.filter((participant) => `${participant.nama} ${participant.nis_nip || ''}`.toLowerCase().includes(participantSearch.toLowerCase())).map((participant) => {
                                    const selected = data.participant_ids.includes(participant.id);
                                    return <label key={participant.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${selected ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40'}`}>
                                        <input type="checkbox" checked={selected} onChange={() => setData('participant_ids', selected ? data.participant_ids.filter((id) => id !== participant.id) : [...data.participant_ids, participant.id])} className="h-4 w-4 shrink-0 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500" />
                                        <span className="min-w-0"><span className="block truncate text-xs font-bold text-slate-800">{participant.nama}</span><span className="mt-0.5 block truncate text-[10px] font-medium text-slate-500">{participant.nis_nip || participant.status || 'Tanpa NIP'}</span></span>
                                    </label>;
                                })}
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-5 py-3 sm:px-6">
                            <p className="text-xs font-semibold text-slate-500">{data.participant_ids.length === 0 ? 'Semua peserta diizinkan.' : `${data.participant_ids.length} peserta dibatasi untuk workcode ini.`}</p>
                            <button type="button" onClick={() => setIsParticipantSelectionOpen(false)} className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700">Selesai</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Popup Peta & Radius Workcode */}
            {previewMapWorkcode && previewMapWorkcode.latitude && previewMapWorkcode.longitude && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setPreviewMapWorkcode(null)} />

                    <div className="relative w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-soft-lg border border-slate-100 animate-[fadeIn_0.2s_ease-out] flex flex-col my-auto z-10">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-800 shrink-0 shadow-xs">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-slate-800 truncate">
                                        {previewMapWorkcode.nama_workcode}
                                    </h3>
                                    <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                                        <span>Area Geofencing Presensi</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <span className="text-neutral-800 font-bold">Radius: {previewMapWorkcode.radius_meters || 100} Meter</span>
                                    </p>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setPreviewMapWorkcode(null)} 
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Map Body */}
                        <div className="relative w-full h-[360px] sm:h-[400px] bg-slate-100">
                            <MapErrorBoundary>
                                <GoogleMap
                                    position={{
                                        lat: Number(previewMapWorkcode.latitude),
                                        lng: Number(previewMapWorkcode.longitude),
                                    }}
                                    radius={Number(previewMapWorkcode.radius_meters) || 100}
                                />
                            </MapErrorBoundary>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-3 text-xs">
                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                                <span className="font-mono text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700">
                                    Lat: {Number(previewMapWorkcode.latitude).toFixed(6)}, Lng: {Number(previewMapWorkcode.longitude).toFixed(6)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={`https://www.google.com/maps?q=${previewMapWorkcode.latitude},${previewMapWorkcode.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-md bg-white border border-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-neutral-800 hover:bg-slate-50 transition inline-flex items-center gap-1 shadow-2xs"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    <span>Buka Google Maps</span>
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setPreviewMapWorkcode(null)}
                                    className="rounded-md bg-slate-800 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-700 transition"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

function InfoRow({ label, value, dot }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-1.5 text-neutral-500">
                {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
                {label}
            </dt>
            <dd className="font-semibold tabular-nums text-neutral-800">{value}</dd>
        </div>
    );
}
