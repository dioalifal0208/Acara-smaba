import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useToast } from '@/Components/Toast';
import { useConfirm } from '@/Components/ConfirmDialog';
import ImportModal from '@/Components/ImportModal';
import FaceRegistrationModal from '@/Components/FaceRegistrationModal';
import ApproveFaceModal from '@/Components/ApproveFaceModal';

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

    const handleEditClick = (participant) => {
        setEditParticipant(participant);
        let statusVal = participant.status || '';
        const validStatuses = ['PNS', 'PPPK', 'PPPK Paruh Waktu'];
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
        if (e.target.checked) {
            setSelectedIds(filteredParticipants.map((p) => p.id));
        } else {
            setSelectedIds([]);
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
                    .card p { font-size: 14px; color: #6366f1; margin-bottom: 20px; font-weight: 600; }
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
            return matchesSearch && matchesStatus;
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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between" data-aos="fade-down">
                    <h2 className="text-xl font-extrabold leading-tight text-slate-800">
                        Kelola Data Peserta
                    </h2>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setShowImportModal(true)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm focus:outline-none transition-all active:scale-95 cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Impor Excel
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-indigo-700 shadow-indigo-500/10 focus:outline-none"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Tambah Peserta
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Data Peserta" />

            {/* Toast is now handled globally via ToastProvider */}

            <div className="py-4 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col overflow-hidden justify-between max-h-[580px]">
                <div className="mx-auto max-w-7xl w-full flex-1 flex flex-col overflow-hidden space-y-3">
                    
                    {/* Stats Cards (flex-none) */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 flex-none" data-aos="fade-up">
                        <div className="overflow-hidden rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-2.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Peserta</p>
                                    <p className="text-xl font-extrabold text-slate-800 mt-0.5">{participants.length}</p>
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
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Sudah Hadir</p>
                                    <p className="text-xl font-extrabold text-emerald-600 mt-0.5">{participants.filter(p => p.has_attended).length}</p>
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
                                    <p className="text-xl font-extrabold text-amber-600 mt-0.5">{participants.filter(p => !p.has_attended).length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter (flex-none) */}
                    <div className="flex-none flex flex-col sm:flex-row gap-3" data-aos="fade-up" data-aos-delay="100">
                        <div className="relative flex-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Cari berdasarkan nama atau NIP..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-sm font-medium"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-44 sm:w-48">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-sm font-medium cursor-pointer"
                                >
                                    <option value="latest">Data Terbaru</option>
                                    <option value="oldest">Data Terlama</option>
                                    <option value="alpha-asc">Urut Abjad (A - Z)</option>
                                    <option value="alpha-desc">Urut Abjad (Z - A)</option>
                                </select>
                            </div>
                            <div className="w-44 sm:w-52">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-sm font-medium cursor-pointer"
                                >
                                    <option value="">Semua Status Pegawai</option>
                                    <option value="PNS">PNS</option>
                                    <option value="PPPK">PPPK</option>
                                    <option value="PPPK Paruh Waktu">PPPK Paruh Waktu</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Bulk Action Toolbar */}
                    {selectedIds.length > 0 && (
                        <div className="flex-none flex flex-wrap items-center justify-between gap-2 rounded-xl bg-indigo-50/80 border border-indigo-200 px-4 py-2 text-xs animate-[fadeIn_0.2s_ease-out]">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-black text-white shadow-sm">
                                    {selectedIds.length}
                                </span>
                                <span className="font-bold text-slate-700">
                                    Peserta dipilih
                                </span>
                                {selectedIds.length <= 3 ? (
                                    <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-amber-100/90 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        Pilih lebih dari 3 peserta (minimal 4) untuk hapus massal
                                    </span>
                                ) : (
                                    <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-emerald-100/90 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Siap dihapus massal ({selectedIds.length} peserta)
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedIds([])}
                                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm cursor-pointer"
                                >
                                    Batal Pilih
                                </button>
                                <button
                                    type="button"
                                    disabled={selectedIds.length <= 3}
                                    onClick={handleBulkDelete}
                                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all shadow-sm ${
                                        selectedIds.length > 3
                                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20 active:scale-95 cursor-pointer'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/60'
                                    }`}
                                    title={selectedIds.length <= 3 ? "Pilih lebih dari 3 peserta (minimal 4) untuk mengaktifkan tombol hapus massal" : `Hapus ${selectedIds.length} peserta terpilih`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Hapus Massal ({selectedIds.length})
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Table Wrapper (flex-1 and overflow-y-auto to lock scroll within screen height) */}
                    <div className="overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm flex-1 flex flex-col min-h-0" data-aos="fade-up" data-aos-delay="200">
                        <div className="overflow-x-auto flex-1 overflow-y-auto max-h-[300px]">
                            <table className="min-w-full divide-y divide-slate-200 relative">
                                <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="w-12 px-4 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={filteredParticipants.length > 0 && selectedIds.length === filteredParticipants.length}
                                                ref={(el) => {
                                                    if (el) {
                                                        el.indeterminate = selectedIds.length > 0 && selectedIds.length < filteredParticipants.length;
                                                    }
                                                }}
                                                onChange={handleSelectAll}
                                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                title={selectedIds.length === filteredParticipants.length ? "Batal Pilih Semua" : "Pilih Semua"}
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500">No</th>
                                        <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500">Nama</th>
                                        <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500">NIP</th>
                                        <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500">Status Pegawai</th>
                                        <th className="px-6 py-3 text-center text-xs font-extrabold uppercase tracking-wider text-slate-500">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {filteredParticipants.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-slate-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <p className="text-xs font-semibold">Belum ada data peserta.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredParticipants.map((participant, index) => (
                                            <tr 
                                                key={participant.id} 
                                                className={`transition-colors ${selectedIds.includes(participant.id) ? 'bg-indigo-50/60' : 'hover:bg-slate-50/50'}`}
                                            >
                                                <td className="whitespace-nowrap px-4 py-3.5 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(participant.id)}
                                                        onChange={() => handleToggleSelect(participant.id)}
                                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-3.5 text-xs text-slate-500 font-semibold">{index + 1}</td>
                                                <td className="whitespace-nowrap px-6 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative h-8 w-8 shrink-0">
                                                            {participant.photo_url && (
                                                                <img 
                                                                    src={participant.photo_url} 
                                                                    alt={participant.nama} 
                                                                    className="h-8 w-8 rounded-full object-cover border border-slate-200"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none';
                                                                        if (e.currentTarget.nextElementSibling) {
                                                                            e.currentTarget.nextElementSibling.style.display = 'flex';
                                                                        }
                                                                    }}
                                                                />
                                                            )}
                                                            <div 
                                                                className={`h-8 w-8 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600 ${participant.photo_url ? 'hidden' : 'flex'}`}
                                                            >
                                                                {participant.nama.charAt(0).toUpperCase()}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-slate-800">{participant.nama}</span>
                                                            {participant.face_status === 'approved' ? (
                                                                <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                                    Wajah Disetujui
                                                                </span>
                                                            ) : participant.face_status === 'pending' ? (
                                                                <span className="text-[10px] font-semibold text-amber-600 flex items-center gap-1 mt-0.5">
                                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                    Menunggu Persetujuan
                                                                </span>
                                                            ) : participant.face_status === 'rejected' ? (
                                                                <span className="text-[10px] font-semibold text-red-500 flex items-center gap-1 mt-0.5">
                                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                                                    Wajah Ditolak
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] font-medium text-slate-400 mt-0.5">Wajah Belum Terdaftar</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-3.5 text-xs text-slate-600 font-semibold">{participant.nis_nip}</td>
                                                <td className="whitespace-nowrap px-6 py-3.5">
                                                    {participant.status ? (
                                                        <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-600 border border-indigo-100 uppercase">
                                                            {participant.status}
                                                        </span>
                                                    ) : null}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-3.5 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {participant.face_status === 'pending' && (
                                                            <button
                                                                onClick={() => setApproveFaceParticipant(participant)}
                                                                className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-bold text-white transition-colors hover:bg-amber-600 shadow-md shadow-amber-500/20"
                                                                title="Review Wajah"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                                Review
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => setShowQr(participant)}
                                                            className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 transition-colors hover:bg-indigo-100"
                                                            title="Lihat QR Code"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                            </svg>
                                                            QR
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditClick(participant)}
                                                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                                                            title="Edit Peserta"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(participant.id, participant.nama)}
                                                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 transition-colors hover:bg-red-100"
                                                            title="Hapus"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            Hapus
                                                        </button>
                                                    </div>
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

            {/* Add Participant Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={() => { setShowModal(false); reset(); }}>
                    <div className="w-full max-w-md animate-[fadeIn_0.2s_ease-out] rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-extrabold text-slate-800">Tambah Peserta Baru</h3>
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
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-semibold"
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
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-semibold"
                                        placeholder="Masukkan NIP"
                                        required
                                    />
                                    {errors.nis_nip && <p className="mt-1 text-xs text-red-600 font-bold">{errors.nis_nip}</p>}
                                    {data.nis_nip.trim() && !errors.nis_nip && participants.some(p => p.nis_nip === data.nis_nip.trim().replace(/^['"]+/, '').replace(/\.0+$/, '')) && (
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
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-semibold"
                                >
                                    <option value="">-- Pilih Status --</option>
                                    <option value="PNS">PNS</option>
                                    <option value="PPPK">PPPK</option>
                                    <option value="PPPK Paruh Waktu">PPPK Paruh Waktu</option>
                                </select>
                                {errors.status && <p className="mt-1 text-xs text-red-600 font-bold">{errors.status}</p>}
                            </div>

                            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); reset(); }}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-xl bg-indigo-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/10 hover:bg-indigo-700 transition-all disabled:opacity-50"
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
                    <div className="w-full max-w-md animate-[fadeIn_0.2s_ease-out] rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-extrabold text-slate-800">Edit Data Peserta</h3>
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
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-semibold"
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
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-semibold"
                                        placeholder="Masukkan NIP"
                                        required
                                    />
                                    {editForm.errors.nis_nip && <p className="mt-1 text-xs text-red-600 font-bold">{editForm.errors.nis_nip}</p>}
                                    {editForm.data.nis_nip.trim() && !editForm.errors.nis_nip && participants.some(p => p.id !== editParticipant.id && p.nis_nip === editForm.data.nis_nip.trim().replace(/^['"]+/, '').replace(/\.0+$/, '')) && (
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
                                        onChange={(e) => editForm.setData('status', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-semibold"
                                    >
                                        <option value="">-- Pilih Status --</option>
                                        <option value="PNS">PNS</option>
                                        <option value="PPPK">PPPK</option>
                                        <option value="PPPK Paruh Waktu">PPPK Paruh Waktu</option>
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
                                        className="mr-auto inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-amber-600 shadow-md shadow-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
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
                                        className="mr-auto inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700 hover:bg-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="rounded-xl bg-indigo-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/10 hover:bg-indigo-700 transition-all disabled:opacity-50"
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

            {/* QR Code Modal — Enhanced with Download & Print */}
            {showQr && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={() => setShowQr(null)}>
                    <div className="w-full max-w-sm animate-[fadeIn_0.2s_ease-out] rounded-2xl bg-white border border-slate-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <h3 className="text-sm font-extrabold text-slate-800">QR Code Peserta</h3>
                            <button onClick={() => setShowQr(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 text-center">
                            <div className="mb-4 flex items-center justify-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-sm font-bold text-indigo-600">
                                    {showQr.nama.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-left">
                                    <h4 className="text-base font-extrabold text-slate-800 leading-tight">{showQr.nama}</h4>
                                    <p className="text-xs text-indigo-600 font-bold mt-0.5">{showQr.nis_nip}</p>
                                </div>
                            </div>

                            <div className="my-4 flex items-center justify-center rounded-xl bg-slate-50 p-4 shadow-inner border border-slate-200">
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
                        <div className="flex gap-2 border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-2xl">
                            <button
                                onClick={() => handleDownloadSvg(showQr)}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                            </button>
                            <button
                                onClick={() => handlePrint(showQr)}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-700 px-3 py-2.5 text-xs font-bold text-white transition-all hover:bg-indigo-800 shadow-md shadow-indigo-500/10"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Cetak
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
