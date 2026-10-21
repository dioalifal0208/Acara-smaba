import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useToast } from '@/Components/Toast';
import KpiCard from '@/Components/KpiCard';
import { icons } from '@/lib/adminMenu';
import { useConfirm } from '@/Components/ConfirmDialog';
import ImportModal from '@/Components/ImportModal';
import FaceRegistrationModal from '@/Components/FaceRegistrationModal';
import ApproveFaceModal from '@/Components/ApproveFaceModal';
import ApprovePhotoChangeRequestModal from '@/Components/ApprovePhotoChangeRequestModal';

const NON_PERMANENT_STATUSES = ['GTT', 'PTT'];

const isNonPermanentStatus = (status) => NON_PERMANENT_STATUSES.includes(status);

export default function ParticipantsIndex({ participants }) {
    const { flash } = usePage().props;
    const { toast } = useToast();
    const confirm = useConfirm();
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showQr, setShowQr] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('latest');
    const [selectedIds, setSelectedIds] = useState([]);
    const [editParticipant, setEditParticipant] = useState(null);
    const [faceRegistrationParticipant, setFaceRegistrationParticipant] = useState(null);
    const [approveFaceParticipant, setApproveFaceParticipant] = useState(null);
    const [approvePhotoChangeRequestParticipant, setApprovePhotoChangeRequestParticipant] = useState(null);
    const [reviewOnly, setReviewOnly] = useState(false);
    const { url: pageUrl } = usePage();

    const needsReview = (participant) => Boolean(participant.pending_photo_change_request) || participant.face_status === 'pending';
    const reviewCount = participants.filter(needsReview).length;

    // Tautan dari notifikasi admin: ?review=pending (filter) atau ?review=photo|face&participant=ID (buka modal verifikasi).
    useEffect(() => {
        const params = new URLSearchParams(pageUrl.split('?')[1] ?? '');
        const review = params.get('review');
        if (!review) return;

        setReviewOnly(true);
        const target = participants.find((participant) => String(participant.id) === params.get('participant'));
        if (review === 'photo' && target?.pending_photo_change_request) {
            setApprovePhotoChangeRequestParticipant(target);
        } else if (review === 'face' && target?.face_status === 'pending') {
            setApproveFaceParticipant(target);
        } else if (review !== 'pending' && target) {
            toast.info(`Pengajuan ${target.nama} sudah diproses.`);
        }
    }, [pageUrl]);

    const { data, setData, post, processing, errors, reset } = useForm({
        nama: '',
        nis_nip: '',
        status: '',
    });

    const editForm = useForm({
        nama: '',
        nis_nip: '',
        status: '',
    });

    // Show flash toast
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        } else if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('participants.store'), {
            onSuccess: () => {
                reset();
                setShowModal(false);
            },
        });
    };

    const handleCreateStatusChange = (status) => {
        setData({
            ...data,
            status,
            nis_nip: isNonPermanentStatus(status)
                ? '-'
                : data.nis_nip === '-' ? '' : data.nis_nip,
        });
    };

    const handleEditStatusChange = (status) => {
        editForm.setData({
            ...editForm.data,
            status,
            nis_nip: isNonPermanentStatus(status)
                ? '-'
                : editForm.data.nis_nip === '-' ? '' : editForm.data.nis_nip,
        });
    };

    const handleEditClick = (participant) => {
        setEditParticipant(participant);
        let statusVal = participant.status || '';
        const validStatuses = ['PNS', 'PPPK', 'PPPK Paruh Waktu', 'GTT', 'PTT'];
        const found = validStatuses.find(s => s.toLowerCase() === statusVal.trim().toLowerCase());
        if (found) statusVal = found;

        editForm.setData({
            nama: participant.nama,
            nis_nip: participant.nis_nip,
            status: statusVal,
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        editForm.put(route('participants.update', editParticipant.id), {
            onSuccess: () => {
                setEditParticipant(null);
                editForm.reset();
            },
        });
    };

    const handleResetQr = async (participant) => {
        const confirmed = await confirm({
            title: 'Reset QR Peserta',
            message: `QR lama milik "${participant.nama}" tidak akan berlaku lagi di scanner. Gunakan bila QR diduga dipakai orang lain. Lanjutkan?`,
            type: 'danger',
            confirmText: 'Ya, Reset QR',
            cancelText: 'Batal',
        });
        if (confirmed) {
            router.post(route('participants.qr.regenerate', participant.id), {}, {
                preserveScroll: true,
                onSuccess: () => setShowQr(null),
            });
        }
    };

    const handleDelete = async (id, nama) => {
        const confirmed = await confirm({
            title: 'Hapus Peserta',
            message: `Apakah Anda yakin ingin menghapus peserta "${nama}"? Data yang dihapus tidak dapat dikembalikan.`,
            type: 'danger',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
        });
        if (confirmed) {
            router.delete(route('participants.destroy', id), {
                onSuccess: () => {
                    setSelectedIds(prev => prev.filter(item => item !== id));
                }
            });
        }
    };

    const handleSelectAll = (e) => {
        const visibleIds = filteredParticipants.map((participant) => participant.id);

        if (e.target.checked) {
            setSelectedIds((previousIds) => [...new Set([...previousIds, ...visibleIds])]);
        } else {
            setSelectedIds((previousIds) => previousIds.filter((id) => !visibleIds.includes(id)));
        }
    };

    const handleToggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length <= 3) {
            toast.error('Pilih lebih dari 3 peserta untuk melakukan hapus massal.');
            return;
        }

        const confirmed = await confirm({
            title: `Hapus ${selectedIds.length} Peserta`,
            message: `Apakah Anda yakin ingin menghapus ${selectedIds.length} peserta yang dipilih? Semua data terkait dan akun peserta akan dihapus secara permanen.`,
            type: 'danger',
            confirmText: `Ya, Hapus (${selectedIds.length})`,
            cancelText: 'Batal',
        });

        if (confirmed) {
            router.delete(route('participants.bulk-destroy'), {
                data: { ids: selectedIds },
                onSuccess: () => {
                    setSelectedIds([]);
                },
            });
        }
    };

    const handleDownloadSvg = (participant) => {
        window.open(route('participants.download.svg', participant.id), '_blank');
    };

    const handlePrint = (participant) => {
        const printWindow = window.open('', '_blank', 'width=500,height=600');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR Code - ${participant.nama}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
                    .card { text-align: center; padding: 40px; border: 2px solid #e5e7eb; border-radius: 16px; max-width: 400px; }
                    .card h2 { font-size: 20px; color: #1e1b4b; margin-bottom: 4px; }
                    .card p { font-size: 14px; color: #2f9338; margin-bottom: 20px; font-weight: 600; }
                    .card img { width: 280px; height: 280px; margin: 0 auto 16px; display: block; }
                    .card .school { font-size: 11px; color: #9ca3af; margin-top: 12px; }
                    @media print {
                        body { background: #fff; }
                        .card { border: none; }
                    }
                </style>
            </head>
            <body>
                <div class="card">
                    <h2>${participant.nama}</h2>
                    <p>${participant.nis_nip}</p>
                    <img src="${route('participants.qr', participant.id)}" alt="QR Code" />
                    <div class="school">E-Presensi SMABA</div>
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(function() { window.close(); }, 1500);
                        window.print();
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const normalizeStatus = (str) => (str || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');

    const filteredParticipants = participants
        .filter((p) => {
            const matchesSearch = p.nama.toLowerCase().includes(searchQuery.toLowerCase()) || p.nis_nip.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter ? normalizeStatus(p.status) === normalizeStatus(statusFilter) : true;
            const matchesReview = reviewOnly ? needsReview(p) : true;
            return matchesSearch && matchesStatus && matchesReview;
        })
        .sort((a, b) => {
            if (sortBy === 'alpha-asc') {
                return a.nama.localeCompare(b.nama, 'id', { sensitivity: 'base' });
            } else if (sortBy === 'alpha-desc') {
                return b.nama.localeCompare(a.nama, 'id', { sensitivity: 'base' });
            } else if (sortBy === 'oldest') {
                return a.id - b.id;
            } else {
                // 'latest' (Data Terbaru - default)
                return b.id - a.id;
            }
        });
    const mobileParticipants = filteredParticipants.slice(0, 5);

    const attendedCount = participants.filter((participant) => participant.has_attended).length;
    const allVisibleSelected = filteredParticipants.length > 0 && filteredParticipants.every((participant) => selectedIds.includes(participant.id));

    return (
        <AuthenticatedLayout>
            <Head title="Data Peserta" />

            <div className="flex w-full flex-1 flex-col px-4 py-2 sm:px-6 xl:min-h-0 xl:overflow-hidden">
                {/* Judul halaman + aksi utama */}
                <div className="mb-4 shrink-0 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between" data-aos="fade-up">
                    <div>
                        <h3 className="text-xl font-bold text-neutral-800">Data Peserta</h3>
                        <p className="mt-0.5 text-sm text-neutral-500">Kelola peserta, QR presensi, dan verifikasi wajah.</p>
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setShowImportModal(true)} className="btn-soft">
                            <span className="h-4 w-4">{actionIcons.upload}</span>
                            Impor Excel
                        </button>
                        <button type="button" onClick={() => setShowModal(true)} className="btn-brand">
                            <span className="h-4 w-4">{actionIcons.plus}</span>
                            Tambah Peserta
                        </button>
                    </div>
                </div>

                {/* KPI */}
                <section className="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-3">
                    <KpiCard delay={0} label="Total Peserta" value={participants.length} icon={icons.users}>
                        terdaftar di sistem
                    </KpiCard>
                    <KpiCard delay={50} label="Sudah Hadir" value={attendedCount} icon={icons.check}>
                        <span className="font-bold text-emerald-600">{participants.length > 0 ? Math.round((attendedCount / participants.length) * 100) : 0}%</span> dari total peserta
                    </KpiCard>
                    <KpiCard delay={100} label="Belum Hadir" value={participants.length - attendedCount} icon={icons.clock}>
                        {reviewCount > 0
                            ? <><span className="font-bold text-amber-500">{reviewCount}</span> menunggu verifikasi wajah/foto</>
                            : <><span className="font-bold text-emerald-600">0</span> menunggu verifikasi</>}
                    </KpiCard>
                </section>

                {(reviewCount > 0 || reviewOnly) && (
                    <div className="mt-4 flex shrink-0 flex-col gap-3 rounded-lg bg-gradient-to-b from-amber-400 to-orange-500 p-4 text-sm text-white shadow-soft sm:flex-row sm:items-center sm:justify-between" role="status" data-aos="fade-up">
                        <p>
                            {reviewCount > 0
                                ? <><strong className="font-semibold">{reviewCount} peserta</strong> menunggu verifikasi foto/wajah.</>
                                : 'Semua foto dan wajah sudah diverifikasi.'}
                        </p>
                        <button
                            type="button"
                            onClick={() => setReviewOnly(!reviewOnly)}
                            className="self-start rounded-md border border-white/70 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white hover:text-orange-600 sm:self-auto"
                        >
                            {reviewOnly ? 'Tampilkan semua peserta' : 'Tampilkan yang perlu verifikasi'}
                        </button>
                    </div>
                )}

                {/* Tabel peserta */}
                <section className="card-soft mt-4 flex min-h-0 flex-1 flex-col overflow-hidden" data-aos="fade-up" data-aos-delay="100">
                    <div className="flex flex-col gap-3 p-4 pb-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h6 className="text-base font-semibold text-neutral-800">Daftar Peserta</h6>
                            <p className="mt-0.5 flex items-center gap-1 text-sm text-neutral-500">
                                <span className="h-4 w-4 text-emerald-500">{icons.check}</span>
                                <span className="font-bold text-neutral-700">{filteredParticipants.length}</span> dari {participants.length} peserta ditampilkan
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="relative sm:w-64">
                                <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="search"
                                    placeholder="Cari nama atau NIP…"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="input-soft pl-9"
                                />
                            </div>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-soft sm:w-40" aria-label="Urutkan">
                                <option value="latest">Data terbaru</option>
                                <option value="oldest">Data terlama</option>
                                <option value="alpha-asc">Nama A–Z</option>
                                <option value="alpha-desc">Nama Z–A</option>
                            </select>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-soft sm:w-44" aria-label="Filter status pegawai">
                                <option value="">Semua status</option>
                                <option value="PNS">PNS</option>
                                <option value="PPPK">PPPK</option>
                                <option value="PPPK Paruh Waktu">PPPK Paruh Waktu</option>
                                <option value="GTT">GTT</option>
                                <option value="PTT">PTT</option>
                            </select>
                        </div>
                    </div>

                    {/* Aksi massal */}
                    {selectedIds.length > 0 && (
                        <div className="mx-4 mb-3 flex flex-wrap items-center justify-between gap-2 rounded-md bg-neutral-100 px-3 py-2 text-xs animate-[fadeIn_0.2s_ease-out]">
                            <p className="text-neutral-700">
                                <span className="font-bold">{selectedIds.length}</span> peserta dipilih
                                <span className="ml-2 hidden text-neutral-500 sm:inline">
                                    {selectedIds.length <= 3 ? '· pilih minimal 4 untuk hapus massal' : '· siap dihapus massal'}
                                </span>
                            </p>
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => setSelectedIds([])} className="rounded-md px-2.5 py-1 font-medium text-neutral-600 transition-colors hover:bg-white hover:text-neutral-900">
                                    Batal pilih
                                </button>
                                <button
                                    type="button"
                                    disabled={selectedIds.length <= 3}
                                    onClick={handleBulkDelete}
                                    className="rounded-md bg-gradient-to-b from-rose-400 to-rose-600 px-3 py-1 font-medium text-white shadow-dark-sm transition-shadow hover:shadow-dark-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                                    title={selectedIds.length <= 3 ? 'Pilih minimal 4 peserta untuk hapus massal' : `Hapus ${selectedIds.length} peserta terpilih`}
                                >
                                    Hapus massal ({selectedIds.length})
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Daftar kartu (HP) ── */}
                    <ul className="divide-y divide-neutral-100 border-t border-neutral-200 sm:hidden">
                        {filteredParticipants.length === 0 ? (
                            <li className="px-4 py-10 text-center text-sm text-neutral-400">Belum ada data peserta.</li>
                        ) : (
                            mobileParticipants.map((participant) => (
                                <li key={participant.id} className={`space-y-3 px-4 py-3 ${selectedIds.includes(participant.id) ? 'bg-neutral-50' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <Avatar participant={participant} />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-neutral-800">{participant.nama}</p>
                                            <p className="truncate text-xs text-neutral-500">{participant.nis_nip}{participant.status ? ` · ${participant.status}` : ''}</p>
                                            <FaceStatus participant={participant} />
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(participant.id)}
                                            onChange={() => handleToggleSelect(participant.id)}
                                            className="h-4 w-4 cursor-pointer rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                                            aria-label={`Pilih ${participant.nama}`}
                                        />
                                    </div>
                                    <RowActions
                                        participant={participant}
                                        onPhoto={() => setApprovePhotoChangeRequestParticipant(participant)}
                                        onFace={() => setApproveFaceParticipant(participant)}
                                        onQr={() => setShowQr(participant)}
                                        onEdit={() => handleEditClick(participant)}
                                        onDelete={() => handleDelete(participant.id, participant.nama)}
                                    />
                                </li>
                            ))
                        )}
                    </ul>

                    {/* ── Tabel (desktop) ── */}
                    <div className="hidden min-h-0 flex-1 overflow-auto sm:block sm:max-h-[582px] xl:max-h-none">
                        <table className="min-w-full text-left">
                            <thead className="sticky top-0 z-10 bg-white">
                                <tr className="border-y border-neutral-200 text-xs font-semibold uppercase text-neutral-500">
                                    <th className="w-12 px-4 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={allVisibleSelected}
                                            ref={(el) => {
                                                if (el) {
                                                    const selectedVisibleCount = filteredParticipants.filter((participant) => selectedIds.includes(participant.id)).length;
                                                    el.indeterminate = selectedVisibleCount > 0 && selectedVisibleCount < filteredParticipants.length;
                                                }
                                            }}
                                            onChange={handleSelectAll}
                                            className="h-4 w-4 cursor-pointer rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                                            title={allVisibleSelected ? 'Batal pilih semua' : 'Pilih semua hasil filter'}
                                        />
                                    </th>
                                    <th className="px-4 py-3 opacity-70">No</th>
                                    <th className="px-6 py-3 opacity-70">Peserta</th>
                                    <th className="px-6 py-3 opacity-70">NIP</th>
                                    <th className="px-6 py-3 text-center opacity-70">Status Pegawai</th>
                                    <th className="px-6 py-3 text-right opacity-70">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredParticipants.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-neutral-400">Belum ada data peserta.</td>
                                    </tr>
                                ) : (
                                    filteredParticipants.map((participant, index) => (
                                        <tr
                                            key={participant.id}
                                            className={`border-b border-neutral-100 transition-colors last:border-0 ${selectedIds.includes(participant.id) ? 'bg-neutral-100/70' : 'hover:bg-neutral-50'}`}
                                        >
                                            <td className="px-4 py-2.5 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(participant.id)}
                                                    onChange={() => handleToggleSelect(participant.id)}
                                                    className="h-4 w-4 cursor-pointer rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                                                    aria-label={`Pilih ${participant.nama}`}
                                                />
                                            </td>
                                            <td className="px-4 py-2.5 text-xs font-medium tabular-nums text-neutral-500">{index + 1}</td>
                                            <td className="whitespace-nowrap px-6 py-2.5">
                                                <div className="flex items-center gap-3">
                                                    <Avatar participant={participant} />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-neutral-800">{participant.nama}</p>
                                                        <FaceStatus participant={participant} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-2.5 text-xs font-medium text-neutral-600">{participant.nis_nip}</td>
                                            <td className="whitespace-nowrap px-6 py-2.5 text-center">
                                                {participant.status && (
                                                    <span className="inline-flex rounded-md bg-gradient-to-b from-neutral-500 to-neutral-700 px-2 py-0.5 text-[10px] font-bold uppercase leading-4 text-white">
                                                        {participant.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-2.5">
                                                <RowActions
                                                    compact
                                                    participant={participant}
                                                    onPhoto={() => setApprovePhotoChangeRequestParticipant(participant)}
                                                    onFace={() => setApproveFaceParticipant(participant)}
                                                    onQr={() => setShowQr(participant)}
                                                    onEdit={() => handleEditClick(participant)}
                                                    onDelete={() => handleDelete(participant.id, participant.nama)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {/* Add Participant Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={() => { setShowModal(false); reset(); }}>
                    <div className="w-full max-w-md animate-[fadeIn_0.2s_ease-out] rounded-lg bg-white border border-slate-100 p-6 shadow-soft-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-bold text-slate-800">Tambah Peserta Baru</h3>
                            <button onClick={() => { setShowModal(false); reset(); }} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="nama" className="mb-1 block text-sm font-bold text-slate-600">
                                        Nama Lengkap
                                    </label>
                                    <input
                                        id="nama"
                                        type="text"
                                        value={data.nama}
                                        onChange={(e) => setData('nama', e.target.value)}
                                        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-semibold"
                                        placeholder="Masukkan nama lengkap"
                                        autoFocus
                                        required
                                    />
                                    {errors.nama && <p className="mt-1 text-xs text-red-600 font-bold">{errors.nama}</p>}
                                    {data.nama.trim() && !errors.nama && participants.some(p => p.nama.trim().toLowerCase() === data.nama.trim().toLowerCase()) && (
                                        <p className="mt-1 text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                                            <span>⚠</span> Nama ini sudah terdaftar pada NIP: {participants.find(p => p.nama.trim().toLowerCase() === data.nama.trim().toLowerCase())?.nis_nip}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="nis_nip" className="mb-1 block text-sm font-bold text-slate-600">
                                        NIP
                                    </label>
                                    <input
                                        id="nis_nip"
                                        type="text"
                                        value={data.nis_nip}
                                        onChange={(e) => setData('nis_nip', e.target.value)}
                                        readOnly={isNonPermanentStatus(data.status)}
                                        className={`w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-semibold ${isNonPermanentStatus(data.status) ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
                                        placeholder="Masukkan NIP"
                                        required={!isNonPermanentStatus(data.status)}
                                    />
                                    {errors.nis_nip && <p className="mt-1 text-xs text-red-600 font-bold">{errors.nis_nip}</p>}
                                    {isNonPermanentStatus(data.status) && (
                                        <p className="mt-1 text-[11px] font-semibold text-slate-500">NIP otomatis diisi "-" untuk GTT/PTT.</p>
                                    )}
                                    {data.nis_nip.trim() && data.nis_nip !== '-' && !errors.nis_nip && participants.some(p => p.nis_nip === data.nis_nip.trim().replace(/^['"]+/, '').replace(/\.0+$/, '')) && (
                                        <p className="mt-1 text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                                            <span>⚠</span> NIP ini sudah terdaftar pada: {participants.find(p => p.nis_nip === data.nis_nip.trim().replace(/^['"]+/, '').replace(/\.0+$/, ''))?.nama}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4">
                                <label htmlFor="status" className="mb-1 block text-sm font-bold text-slate-600">
                                    Status Pegawai
                                </label>
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => handleCreateStatusChange(e.target.value)}
                                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-semibold"
                                >
                                    <option value="">-- Pilih Status --</option>
                                    <option value="PNS">PNS</option>
                                    <option value="PPPK">PPPK</option>
                                    <option value="PPPK Paruh Waktu">PPPK Paruh Waktu</option>
                                    <option value="GTT">GTT</option>
                                    <option value="PTT">PTT</option>
                                </select>
                                {errors.status && <p className="mt-1 text-xs text-red-600 font-bold">{errors.status}</p>}
                            </div>

                            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); reset(); }}
                                    className="rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-md bg-brand-gradient px-5 py-2.5 text-sm font-bold text-white shadow-dark-sm hover:bg-brand-gradient transition-all disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Participant Modal */}
            {editParticipant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={() => { setEditParticipant(null); editForm.reset(); }}>
                    <div className="w-full max-w-md animate-[fadeIn_0.2s_ease-out] rounded-lg bg-white border border-slate-100 p-6 shadow-soft-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-bold text-slate-800">Edit Data Peserta</h3>
                            <button onClick={() => { setEditParticipant(null); editForm.reset(); }} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="edit_nama" className="mb-1 block text-sm font-bold text-slate-600">
                                        Nama Lengkap
                                    </label>
                                    <input
                                        id="edit_nama"
                                        type="text"
                                        value={editForm.data.nama}
                                        onChange={(e) => editForm.setData('nama', e.target.value)}
                                        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-semibold"
                                        placeholder="Masukkan nama lengkap"
                                        autoFocus
                                        required
                                    />
                                    {editForm.errors.nama && <p className="mt-1 text-xs text-red-600 font-bold">{editForm.errors.nama}</p>}
                                    {editForm.data.nama.trim() && !editForm.errors.nama && participants.some(p => p.id !== editParticipant.id && p.nama.trim().toLowerCase() === editForm.data.nama.trim().toLowerCase()) && (
                                        <p className="mt-1 text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                                            <span>⚠</span> Nama ini sudah digunakan peserta lain (NIP: {participants.find(p => p.id !== editParticipant.id && p.nama.trim().toLowerCase() === editForm.data.nama.trim().toLowerCase())?.nis_nip})
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="edit_nis_nip" className="mb-1 block text-sm font-bold text-slate-600">
                                        NIP
                                    </label>
                                    <input
                                        id="edit_nis_nip"
                                        type="text"
                                        value={editForm.data.nis_nip}
                                        onChange={(e) => editForm.setData('nis_nip', e.target.value)}
                                        readOnly={isNonPermanentStatus(editForm.data.status)}
                                        className={`w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-semibold ${isNonPermanentStatus(editForm.data.status) ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
                                        placeholder="Masukkan NIP"
                                        required={!isNonPermanentStatus(editForm.data.status)}
                                    />
                                    {editForm.errors.nis_nip && <p className="mt-1 text-xs text-red-600 font-bold">{editForm.errors.nis_nip}</p>}
                                    {isNonPermanentStatus(editForm.data.status) && (
                                        <p className="mt-1 text-[11px] font-semibold text-slate-500">NIP otomatis diisi "-" untuk GTT/PTT.</p>
                                    )}
                                    {editForm.data.nis_nip.trim() && editForm.data.nis_nip !== '-' && !editForm.errors.nis_nip && participants.some(p => p.id !== editParticipant.id && p.nis_nip === editForm.data.nis_nip.trim().replace(/^['"]+/, '').replace(/\.0+$/, '')) && (
                                        <p className="mt-1 text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                                            <span>⚠</span> NIP ini sudah digunakan oleh: {participants.find(p => p.id !== editParticipant.id && p.nis_nip === editForm.data.nis_nip.trim().replace(/^['"]+/, '').replace(/\.0+$/, ''))?.nama}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="edit_status" className="mb-1 block text-sm font-bold text-slate-600">
                                        Status Pegawai
                                    </label>
                                    <select
                                        id="edit_status"
                                        value={editForm.data.status}
                                        onChange={(e) => handleEditStatusChange(e.target.value)}
                                        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-semibold"
                                    >
                                        <option value="">-- Pilih Status --</option>
                                        <option value="PNS">PNS</option>
                                        <option value="PPPK">PPPK</option>
                                        <option value="PPPK Paruh Waktu">PPPK Paruh Waktu</option>
                                        <option value="GTT">GTT</option>
                                        <option value="PTT">PTT</option>
                                    </select>
                                    {editForm.errors.status && <p className="mt-1 text-xs text-red-600 font-bold">{editForm.errors.status}</p>}
                                </div>
                            </div>

                            <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                                {editParticipant.face_status === 'pending' ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const participant = editParticipant;
                                            setEditParticipant(null);
                                            editForm.reset();
                                            setApproveFaceParticipant(participant);
                                        }}
                                        className="mr-auto inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-amber-600 shadow-md shadow-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Review Wajah (Pending)
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const participant = editParticipant;
                                            setEditParticipant(null);
                                            editForm.reset();
                                            setFaceRegistrationParticipant(participant);
                                        }}
                                        className="mr-auto inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm font-bold text-neutral-800 hover:bg-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500/20"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {editParticipant.face_status === 'approved' ? 'Perbarui Wajah' : 'Registrasi Wajah'}
                                    </button>
                                )}
                                
                                <button
                                    type="button"
                                    onClick={() => { setEditParticipant(null); editForm.reset(); }}
                                    className="rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="rounded-md bg-brand-gradient px-5 py-2.5 text-sm font-bold text-white shadow-dark-sm hover:bg-brand-gradient transition-all disabled:opacity-50"
                                >
                                    {editForm.processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Face Registration Modal */}
            {faceRegistrationParticipant && (
                <FaceRegistrationModal
                    participant={faceRegistrationParticipant}
                    onClose={() => setFaceRegistrationParticipant(null)}
                    onSuccess={() => {
                        setFaceRegistrationParticipant(null);
                        router.reload({ only: ['participants'] });
                    }}
                />
            )}

            {/* Approve Face Modal */}
            {approveFaceParticipant && (
                <ApproveFaceModal
                    participant={approveFaceParticipant}
                    onClose={() => setApproveFaceParticipant(null)}
                    onSuccess={() => {
                        setApproveFaceParticipant(null);
                        router.reload({ only: ['participants'] });
                    }}
                />
            )}

            {approvePhotoChangeRequestParticipant && (
                <ApprovePhotoChangeRequestModal
                    participant={approvePhotoChangeRequestParticipant}
                    onClose={() => setApprovePhotoChangeRequestParticipant(null)}
                    onSuccess={() => {
                        setApprovePhotoChangeRequestParticipant(null);
                        router.reload({ only: ['participants'] });
                    }}
                />
            )}

            {/* QR Code Modal — Enhanced with Download & Print */}
            {showQr && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={() => setShowQr(null)}>
                    <div className="w-full max-w-sm animate-[fadeIn_0.2s_ease-out] rounded-lg bg-white border border-slate-100 shadow-soft-lg" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <h3 className="text-sm font-bold text-slate-800">QR Code Peserta</h3>
                            <button onClick={() => setShowQr(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 text-center">
                            <div className="mb-4 flex items-center justify-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 border border-neutral-200 text-sm font-bold text-neutral-800">
                                    {showQr.nama.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-left">
                                    <h4 className="text-base font-bold text-slate-800 leading-tight">{showQr.nama}</h4>
                                    <p className="text-xs text-neutral-800 font-bold mt-0.5">{showQr.nis_nip}</p>
                                </div>
                            </div>

                            <div className="my-4 flex items-center justify-center rounded-lg bg-slate-50 p-4 shadow-inner border border-slate-200">
                                <img
                                    src={route('participants.qr', showQr.id)}
                                    alt={`QR Code - ${showQr.nama}`}
                                    className="h-52 w-52 sm:h-56 sm:w-56"
                                />
                            </div>

                            <p className="mb-2 text-xs text-slate-500 font-semibold">Scan QR ini untuk presensi otomatis</p>
                            <p className="break-all rounded-lg bg-slate-100 border border-slate-200 px-3 py-1.5 font-mono text-[9px] text-slate-500">{showQr.qr_token}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-lg">
                            <button
                                onClick={() => handleDownloadSvg(showQr)}
                                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                            </button>
                            <button
                                onClick={() => handlePrint(showQr)}
                                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-brand-gradient px-3 py-2.5 text-xs font-bold text-white transition-all hover:bg-brand-gradient shadow-dark-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Cetak
                            </button>
                        </div>
                        <div className="px-6 pb-4 bg-slate-50 rounded-b-lg">
                            <button
                                onClick={() => handleResetQr(showQr)}
                                className="w-full rounded-md border border-rose-200 bg-white px-3 py-2 text-[11px] font-bold text-rose-600 transition-colors hover:bg-rose-50"
                            >
                                Reset QR (QR lama tidak berlaku)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Excel Modal */}
            <ImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
            />

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}

const iconSvg = (paths) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        {paths.map((d) => <path key={d} d={d} />)}
    </svg>
);

const actionIcons = {
    upload: iconSvg(['M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12']),
    plus: iconSvg(['M12 4v16m8-8H4']),
    eye: iconSvg(['M15 12a3 3 0 11-6 0 3 3 0 016 0z', 'M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z']),
    edit: iconSvg(['M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z']),
    trash: iconSvg(['M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16']),
};

function Avatar({ participant }) {
    return (
        <div className="relative h-9 w-9 shrink-0">
            {participant.photo_url && (
                <img
                    src={participant.photo_url}
                    alt=""
                    className="h-9 w-9 rounded-md object-cover"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextElementSibling) {
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                        }
                    }}
                />
            )}
            <div className={`h-9 w-9 items-center justify-center rounded-md bg-brand-gradient text-xs font-semibold text-white ${participant.photo_url ? 'hidden' : 'flex'}`}>
                {participant.nama.charAt(0).toUpperCase()}
            </div>
        </div>
    );
}

function FaceStatus({ participant }) {
    const [tone, label] = participant.pending_photo_change_request
        ? ['bg-amber-500', 'Foto baru menunggu verifikasi']
        : participant.face_status === 'approved'
            ? ['bg-emerald-500', 'Wajah disetujui']
            : participant.face_status === 'pending'
                ? ['bg-amber-500', 'Wajah menunggu persetujuan']
                : participant.face_status === 'rejected'
                    ? ['bg-rose-500', 'Wajah ditolak']
                    : ['bg-neutral-300', 'Wajah belum terdaftar'];

    return (
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-500">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone}`} />
            {label}
        </p>
    );
}

/** Aksi baris: verifikasi (bila ada) sebagai tombol gradien, sisanya tombol ikon tenang dengan tooltip. */
function RowActions({ participant, compact = false, onPhoto, onFace, onQr, onEdit, onDelete }) {
    const review = 'inline-flex items-center gap-1 rounded-md bg-gradient-to-b from-amber-400 to-orange-500 px-2.5 py-1 text-xs font-medium text-white shadow-dark-sm transition-shadow hover:shadow-dark-hover';
    const ghost = 'inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900';

    return (
        <div className={`flex flex-wrap items-center gap-1 ${compact ? 'justify-end' : ''}`}>
            {participant.pending_photo_change_request && (
                <button type="button" onClick={onPhoto} className={review} title="Verifikasi foto baru">Verifikasi foto</button>
            )}
            {participant.face_status === 'pending' && (
                <button type="button" onClick={onFace} className={review} title="Tinjau pendaftaran wajah">Tinjau wajah</button>
            )}
            <button type="button" onClick={onQr} className={ghost} title="Lihat QR code">
                <span className="h-4 w-4">{icons.qr}</span>
                {!compact && 'QR'}
            </button>
            <button type="button" onClick={onEdit} className={ghost} title="Edit peserta">
                <span className="h-4 w-4">{actionIcons.edit}</span>
                {!compact && 'Edit'}
            </button>
            <button type="button" onClick={onDelete} className={`${ghost} hover:!bg-rose-50 hover:!text-rose-600`} title="Hapus peserta">
                <span className="h-4 w-4">{actionIcons.trash}</span>
                {!compact && 'Hapus'}
            </button>
        </div>
    );
}
