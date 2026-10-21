import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { appUrl } from '@/lib/appUrl';
import { backgroundReload, jitteredInterval } from '@/lib/backgroundReload';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useToast } from '@/Components/Toast';
import KpiCard from '@/Components/KpiCard';
import { icons } from '@/lib/adminMenu';
import { useConfirm } from '@/Components/ConfirmDialog';
import Modal from '@/Components/Modal';
import AttendanceCalendarModal from '@/Components/AttendanceCalendarModal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function ReportIndex({
    workcodes = [],
    activeWorkcodes = [],
    selectedWorkcodeId,
    selectedWorkcode,
    stats,
    attendances = [],
    participants = [],
    kepalaSekolahNama = 'Muhtarom, S.Pd., M.Si.',
    kepalaSekolahNip = '197205172006041015',
}) {
    const { flash } = usePage().props;
    const { toast } = useToast();
    const confirm = useConfirm();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Modal States
    const [showEditModal, setShowEditModal] = useState(false);
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [calendarParticipant, setCalendarParticipant] = useState(null);
    const [signatureAttendance, setSignatureAttendance] = useState(null);
    const [detailAttendance, setDetailAttendance] = useState(null);
    const [facePreview, setFacePreview] = useState(null);

    const [editingParticipantName, setEditingParticipantName] = useState('');
    const [selectedParticipantForLogs, setSelectedParticipantForLogs] = useState(null);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);

    // Form Manual Edit
    const manualEditForm = useForm({
        id: null,
        tanggal: '',
        jam_masuk: '',
        jam_pulang: '',
        status: 'hadir',
    });

    // Presensi dari aplikasi Android/scanner masuk terus: segarkan rekap di latar belakang,
    // kecuali saat admin sedang membuka modal (agar form edit tidak tertimpa).
    const isModalOpen = showEditModal || showLogsModal || showCalendarModal || signatureAttendance !== null || detailAttendance !== null;
    useEffect(() => {
        if (isModalOpen) {
            return undefined;
        }

        const reload = () => backgroundReload({ only: ['stats', 'attendances', 'participants', 'activeWorkcodes'], preserveScroll: true, preserveState: true });
        const interval = window.setInterval(reload, jitteredInterval(20000));
        const onVisible = () => document.visibilityState === 'visible' && reload();
        document.addEventListener('visibilitychange', onVisible);

        return () => {
            window.clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [isModalOpen]);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        } else if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const standardEmploymentStatuses = ['PNS', 'PPPK', 'PPPK Paruh Waktu', 'GTT', 'PTT'];
    const detectedEmploymentStatuses = attendances
        .map((attendance) => attendance.status_pegawai)
        .filter(Boolean)
        .sort();
    const uniqueStatuses = [...new Set([...standardEmploymentStatuses, ...detectedEmploymentStatuses])];

    const handleWorkcodeChange = (workcodeId) => {
        router.get(route('report'), { workcode_id: workcodeId }, { preserveState: true, preserveScroll: true });
    };

    const filteredAttendances = attendances.filter(
        (a) => {
            const matchSearch = (a.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (a.nis_nip || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchStatus = statusFilter === '' || a.status_pegawai === statusFilter;
            return matchSearch && matchStatus;
        }
    );
    const mobileAttendances = filteredAttendances.slice(0, 5);

    const attendancePercentage = stats && stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0;
    const isSingleAttendanceWorkcode = selectedWorkcode?.kategori === 'workcode';

    const formatAttendanceDate = (date) => {
        if (!date) return '-';

        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(new Date(`${date}T00:00:00`));
    };

    // Open Manual Edit Modal
    const openManualEditModal = (att, participantName = '') => {
        const waktuHadir = att.waktu_hadir && att.waktu_hadir !== '-' ? String(att.waktu_hadir) : '';
        const tanggalDariWaktuHadir = waktuHadir.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] || '';
        const jamDariWaktuHadir = waktuHadir.match(/(\d{2}:\d{2})(?::\d{2})?$/)?.[1] || '';

        setEditingParticipantName(participantName || att.nama || 'Peserta');
        manualEditForm.setData({
            id: att.id,
            tanggal: att.tanggal || tanggalDariWaktuHadir || new Date().toISOString().split('T')[0],
            jam_masuk: att.jam_masuk || jamDariWaktuHadir,
            jam_pulang: isSingleAttendanceWorkcode ? '' : (att.jam_pulang || ''),
            status: att.status || 'hadir',
        });
        setShowEditModal(true);
    };

    // Fetch Logs for Participant
    const fetchLogs = async (participantId, participantName, nisNip, statusPegawai) => {
        if (!selectedWorkcode) return;
        setIsLoadingLogs(true);
        try {
            const response = await fetch(appUrl(`report/individual/${selectedWorkcode.id}/${participantId}`));
            const data = await response.json();
            setSelectedParticipantForLogs({
                id: participantId,
                nama: participantName || data.participant.nama,
                nis_nip: nisNip || data.participant.nis_nip,
                status_pegawai: statusPegawai || data.participant.status,
                attendances: data.attendances || [],
            });
            setShowLogsModal(true);
        } catch (error) {
            console.error('Gagal mengambil data riwayat:', error);
            toast.error('Gagal memuat riwayat presensi.');
        } finally {
            setIsLoadingLogs(false);
        }
    };

    // Submit Manual Edit
    const handleManualEditSubmit = (e) => {
        e.preventDefault();
        manualEditForm.put(route('admin.attendances.update', manualEditForm.data.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowEditModal(false);
                manualEditForm.reset();
                if (showLogsModal && selectedParticipantForLogs) {
                    fetchLogs(
                        selectedParticipantForLogs.id,
                        selectedParticipantForLogs.nama,
                        selectedParticipantForLogs.nis_nip,
                        selectedParticipantForLogs.status_pegawai
                    );
                }
            },
        });
    };

    // Handle Delete Attendance
    const handleDeleteAttendance = async (attendanceId, participantName, dateInfo) => {
        const confirmed = await confirm({
            title: 'Hapus Log Presensi',
            message: `Apakah Anda yakin ingin menghapus catatan presensi ${participantName ? `untuk "${participantName}"` : ''} ${dateInfo ? `tanggal ${dateInfo}` : ''}? Tindakan ini akan menghapus data kehadiran/alpha/izin hari tersebut.`,
            type: 'danger',
            confirmText: 'Ya, Hapus Data',
            cancelText: 'Batal',
        });

        if (confirmed) {
            router.delete(route('admin.attendances.destroy', attendanceId), {
                preserveScroll: true,
                onSuccess: () => {
                    if (showLogsModal && selectedParticipantForLogs) {
                        fetchLogs(
                            selectedParticipantForLogs.id,
                            selectedParticipantForLogs.nama,
                            selectedParticipantForLogs.nis_nip,
                            selectedParticipantForLogs.status_pegawai
                        );
                    }
                },
            });
        }
    };

    // Cetak Laporan Keseluruhan
    const handlePrintReport = () => {
        if (!selectedWorkcode) return;

        const printWindow = window.open('', '_blank', 'width=800,height=900');
        const rowsHtml = filteredAttendances.map((a, i) => `
            <tr>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${i + 1}</td>
                <td style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px;">${a.nama}</td>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 11px;">${a.nis_nip}</td>
                <td style="padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${a.status_pegawai || '-'}</td>
                ${selectedWorkcode.kategori === 'harian' 
                    ? `
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${a.total_alpha || '0'}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${a.total_izin || '0'}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${a.total_sakit || '0'}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${a.total_lupa_absen || '0'}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${a.total_menit_terlambat ? a.total_menit_terlambat + ' Menit' : '0 Menit'}</td>
                    ` 
                    : `
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${a.waktu_hadir}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px;">${a.status ? a.status.replace('_', ' ').toUpperCase() : '-'}</td>
                        <td style="text-align: center; padding: 4px 8px; border: 1px solid #cbd5e1;">
                            <div style="font-weight: bold; font-size: 10px;">${a.attendance_method || '-'}</div>
                            ${a.signature_url ? `<img src="${a.signature_url}" alt="Tanda tangan ${a.nama}" style="display: block; width: 90px; height: 34px; object-fit: contain; margin: 2px auto 0;" />` : ''}
                        </td>
                    `
                }
            </tr>
        `).join('');

        const tableHeadersHtml = selectedWorkcode.kategori === 'harian'
            ? `
                <th style="width: 35px;">No</th>
                <th style="width: 250px;">Nama Lengkap</th>
                <th style="width: 150px;">NIP</th>
                <th style="width: 90px;">Status Pegawai</th>
                <th style="width: 50px;">Alpha</th>
                <th style="width: 50px;">Izin</th>
                <th style="width: 50px;">Sakit</th>
                <th style="width: 60px;">Lupa Absen</th>
                <th style="width: 90px;">Total Terlambat</th>
            `
            : `
                <th style="width: 35px;">No</th>
                <th>Nama Lengkap</th>
                <th style="width: 150px;">NIP</th>
                <th>Status Pegawai</th>
                <th style="width: 130px;">Waktu Presensi</th>
                <th style="width: 70px;">Status</th>
                <th style="width: 110px;">Metode</th>
            `;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Rekap Presensi - ${selectedWorkcode.nama_workcode}</title>
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 2.5cm 2.5cm 2.5cm 2.5cm;
                    }
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                        font-family: 'Times New Roman', Times, serif;
                    }
                    html, body {
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        background: #fff;
                        color: #0f172a;
                    }
                    @media screen {
                        body {
                            padding: 2.5cm;
                            max-width: 210mm;
                            margin: 0 auto;
                        }
                    }
                    @media print {
                        @page {
                            size: A4 portrait;
                            margin: 2.5cm 2.5cm 2.5cm 2.5cm;
                        }
                        html, body {
                            width: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            background: #fff !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                    }
                    .header-kop {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        border-bottom: 3px double #000;
                        padding-bottom: 12px;
                        margin-bottom: 20px;
                        text-align: center;
                    }
                    .kop-logo-left {
                        width: 70px;
                        display: flex;
                        justify-content: flex-start;
                        align-items: center;
                    }
                    .kop-logo-left img {
                        width: 65px;
                        height: 75px;
                        object-fit: contain;
                    }
                    .kop-logo-right {
                        width: 70px;
                        display: flex;
                        justify-content: flex-end;
                        align-items: center;
                    }
                    .kop-logo-right img {
                        width: 65px;
                        height: 75px;
                        object-fit: contain;
                    }
                    .kop-text {
                        flex: 1;
                        padding: 0 10px;
                        text-align: center;
                    }
                    .kop-text .instansi {
                        font-size: 13px;
                        font-weight: bold;
                        text-transform: uppercase;
                        line-height: 1.35;
                        letter-spacing: 0.5px;
                    }
                    .kop-text .sekolah {
                        font-size: 17px;
                        font-weight: bold;
                        text-transform: uppercase;
                        margin-top: 3px;
                        letter-spacing: 0.5px;
                    }
                    .kop-text .alamat {
                        font-size: 10.5px;
                        font-style: italic;
                        color: #1e293b;
                        margin-top: 4px;
                        font-family: Arial, sans-serif;
                    }
                    .title-doc {
                        text-align: center;
                        margin-bottom: 18px;
                    }
                    .title-doc h2 {
                        font-size: 15px;
                        font-weight: bold;
                        text-transform: uppercase;
                        text-decoration: underline;
                    }
                    .meta-info {
                        margin-bottom: 16px;
                        font-size: 12px;
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                    }
                    .meta-info table {
                        width: 100%;
                    }
                    .meta-info td {
                        padding: 2px 0;
                    }
                    table.data-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 25px;
                        font-size: 11px;
                        font-family: Arial, sans-serif;
                    }
                    table.data-table th {
                        background: #f1f5f9;
                        border: 1px solid #94a3b8;
                        padding: 7px 8px;
                        text-transform: uppercase;
                        font-size: 10px;
                        font-weight: bold;
                    }
                    .ttd-section {
                        display: flex;
                        justify-content: flex-end;
                        margin-top: 30px;
                        font-size: 12px;
                        font-family: Arial, sans-serif;
                        page-break-inside: avoid;
                    }
                    .ttd-box {
                        width: 250px;
                        text-align: center;
                        line-height: 1.4;
                    }
                </style>
            </head>
            <body>
                <div class="header-kop">
                    <div class="kop-logo-left">
                        <img src="${window.location.origin}/images/jatim.png" alt="Logo Pemprov Jatim" />
                    </div>
                    <div class="kop-text">
                        <div class="instansi">PEMERINTAH PROVINSI JAWA TIMUR<br>DINAS PENDIDIKAN</div>
                        <div class="sekolah">SMA NEGERI 1 BABAT</div>
                        <div class="alamat">Jl. Sumowiharjo No.1 Telp. 0322-3326616 Fax. (0322) 451201<br>Email: smanegeri1babat.lmg@gmail.com</div>
                    </div>
                    <div class="kop-logo-right">
                        <img src="${window.location.origin}/images/logo.png" alt="Logo SMAN 1 Babat" />
                    </div>
                </div>

                <div class="title-doc">
                    <h2>DAFTAR HADIR / REKAP PRESENSI</h2>
                </div>

                <div class="meta-info">
                    <table>
                        <tr>
                            <td style="width: 130px; font-weight: bold;">WorkCode</td>
                            <td style="width: 15px;">:</td>
                            <td>${selectedWorkcode.nama_workcode}</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold;">Kategori Presensi</td>
                            <td>:</td>
                            <td style="text-transform: capitalize;">${selectedWorkcode.kategori === 'harian'
                                ? 'Presensi Harian'
                                : 'Presensi Sekali / Event'}</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold;">Waktu Cetak</td>
                            <td>:</td>
                            <td>${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</td>
                        </tr>
                    </table>
                </div>

                <table class="data-table">
                    <thead>
                        <tr>
                            ${tableHeadersHtml}
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml || '<tr><td colspan="9" style="text-align:center; padding: 10px;">Belum ada data kehadiran</td></tr>'}
                    </tbody>
                </table>

                <div class="ttd-section">
                    <div class="ttd-box">
                        <p>Babat, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p style="margin-bottom: 5px;">Kepala Sekolah,</p>
                        <div class="ttd-qr-wrap" style="display: flex; justify-content: center; margin: 10px 0;">
                            <img src="${window.location.origin}/workcodes/${selectedWorkcode.id}/qr-signature" style="width: 80px; height: 80px;" alt="QR TTD" />
                        </div>
                        <p style="font-weight: bold; text-decoration: underline; font-size: 13px;">${kepalaSekolahNama}</p>
                        <p style="font-size: 11px; color: #475569; font-family: Arial, sans-serif;">NIP. ${kepalaSekolahNip}</p>
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        setTimeout(function() { window.focus(); window.print(); }, 600);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Cetak Rekap Individu
    const handlePrintIndividualRecap = async (participantId, participantName) => {
        if (!selectedWorkcode) return;
        try {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const periodLabel = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
            const response = await fetch(appUrl(`report/individual/${selectedWorkcode.id}/${participantId}?year=${year}&month=${month}`));
            const data = await response.json();
            
            const printWindow = window.open('', '_blank', 'width=800,height=900');
            
            // Urutkan presensi dari tanggal ter-muda hingga tanggal paling tua (kronologis menaik)
            const sortedAttendances = (data.attendances || []).slice().sort((a, b) => {
                const dateA = a.tanggal || '';
                const dateB = b.tanggal || '';
                return dateA.localeCompare(dateB);
            });

            const rowsHtml = sortedAttendances.map((a, i) => {
                let hariDanTanggal = '-';
                if (a.tanggal) {
                    const [attendanceYear, attendanceMonth, attendanceDay] = a.tanggal.split('-').map(Number);
                    hariDanTanggal = new Date(attendanceYear, attendanceMonth - 1, attendanceDay)
                        .toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                        });
                }
                let jamDatang = a.jam_masuk || (a.waktu_hadir !== '-' ? a.waktu_hadir : '-');
                let jamPulang = a.jam_pulang || (a.waktu_pulang !== '-' ? a.waktu_pulang : '-');

                if (a.status === 'libur') {
                    jamDatang = '-';
                    jamPulang = '-';
                }

                let statusBadge = (a.status || 'hadir').toUpperCase();
                let statusColor = '#0f172a';

                if (a.status === 'hadir' || !a.status) {
                    // Terlambat dihitung server dari jadwal hari itu (jadwal_per_hari workcode).
                    if (a.is_late) {
                        statusBadge = 'TERLAMBAT';
                        statusColor = '#b91c1c';
                    } else {
                        statusBadge = 'HADIR';
                        statusColor = '#15803d';
                    }
                } else if (a.status === 'terlambat') {
                    statusBadge = 'TERLAMBAT';
                    statusColor = '#b91c1c';
                } else if (a.status === 'izin') {
                    statusBadge = 'IZIN';
                    statusColor = '#b45309';
                } else if (a.status === 'sakit') {
                    statusBadge = 'SAKIT';
                    statusColor = '#1d4ed8';
                } else if (a.status === 'alpha') {
                    statusBadge = 'ALPHA';
                    statusColor = '#b91c1c';
                } else if (a.status === 'lupa_absen') {
                    statusBadge = 'LUPA ABSEN';
                    statusColor = '#475569';
                }

                return `
                    <tr>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${i + 1}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${hariDanTanggal}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${jamDatang}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${jamPulang}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px; color: ${statusColor};">${statusBadge}</td>
                    </tr>
                `;
            }).join('');

            const totalAlpha = sortedAttendances.filter(a => a.status === 'alpha').length;
            const totalIzin = sortedAttendances.filter(a => a.status === 'izin').length;
            const totalSakit = sortedAttendances.filter(a => a.status === 'sakit').length;
            const totalLupaAbsen = sortedAttendances.filter(a => a.status === 'lupa_absen').length;

            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Rekap Kehadiran - ${participantName}</title>
                    <style>
                        @page {
                            size: A4 portrait;
                            margin: 2.5cm 2.5cm 2.5cm 2.5cm;
                        }
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                            font-family: 'Times New Roman', Times, serif;
                        }
                        html, body {
                            width: 100%;
                            margin: 0;
                            padding: 0;
                            background: #fff;
                            color: #0f172a;
                        }
                        @media screen {
                            body {
                                padding: 2.5cm;
                                max-width: 210mm;
                                margin: 0 auto;
                            }
                        }
                        @media print {
                            @page {
                                size: A4 portrait;
                                margin: 2.5cm 2.5cm 2.5cm 2.5cm;
                            }
                            html, body {
                                width: 100% !important;
                                margin: 0 !important;
                                padding: 0 !important;
                                background: #fff !important;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                        }
                        .header-kop {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            border-bottom: 3px double #000;
                            padding-bottom: 12px;
                            margin-bottom: 20px;
                            text-align: center;
                        }
                        .kop-logo-left {
                            width: 70px;
                            display: flex;
                            justify-content: flex-start;
                            align-items: center;
                        }
                        .kop-logo-left img {
                            width: 65px;
                            height: 75px;
                            object-fit: contain;
                        }
                        .kop-logo-right {
                            width: 70px;
                            display: flex;
                            justify-content: flex-end;
                            align-items: center;
                        }
                        .kop-logo-right img {
                            width: 65px;
                            height: 75px;
                            object-fit: contain;
                        }
                        .kop-text {
                            flex: 1;
                            padding: 0 10px;
                            text-align: center;
                        }
                        .kop-text .instansi {
                            font-size: 13px;
                            font-weight: bold;
                            text-transform: uppercase;
                            line-height: 1.35;
                            letter-spacing: 0.5px;
                        }
                        .kop-text .sekolah {
                            font-size: 17px;
                            font-weight: bold;
                            text-transform: uppercase;
                            margin-top: 3px;
                            letter-spacing: 0.5px;
                        }
                        .kop-text .alamat {
                            font-size: 10.5px;
                            font-style: italic;
                            color: #1e293b;
                            margin-top: 4px;
                            font-family: Arial, sans-serif;
                        }
                        .title-doc {
                            text-align: center;
                            margin-bottom: 18px;
                        }
                        .title-doc h2 {
                            font-size: 15px;
                            font-weight: bold;
                            text-transform: uppercase;
                            text-decoration: underline;
                        }
                        .meta-info {
                            margin-bottom: 16px;
                            font-size: 12px;
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                        }
                        .meta-info table {
                            width: 100%;
                        }
                        .meta-info td {
                            padding: 2px 0;
                        }
                        table.data-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 20px;
                            font-size: 11px;
                            font-family: Arial, sans-serif;
                        }
                        table.data-table th {
                            background: #f1f5f9;
                            border: 1px solid #94a3b8;
                            padding: 7px 8px;
                            text-transform: uppercase;
                            font-size: 10px;
                            font-weight: bold;
                        }
                        .summary-table {
                            width: 100%;
                            table-layout: fixed;
                            border-collapse: collapse;
                            font-size: 11px;
                            font-family: Arial, sans-serif;
                            margin-bottom: 25px;
                        }
                        .summary-table th {
                            width: 25%;
                            background: #f8fafc;
                            border: 1px solid #94a3b8;
                            padding: 6px 8px;
                            text-align: center;
                            font-weight: bold;
                            font-size: 10px;
                            text-transform: uppercase;
                        }
                        .summary-table td {
                            width: 25%;
                            border: 1px solid #cbd5e1;
                            padding: 6px 8px;
                            text-align: center;
                            font-weight: bold;
                            font-size: 11px;
                        }
                        .ttd-section {
                            display: flex;
                            justify-content: flex-end;
                            margin-top: 25px;
                            font-size: 12px;
                            font-family: Arial, sans-serif;
                            page-break-inside: avoid;
                        }
                        .ttd-box {
                            width: 250px;
                            text-align: center;
                            line-height: 1.4;
                        }
                    </style>
                </head>
                <body>
                    <div class="header-kop">
                        <div class="kop-logo-left">
                            <img src="${window.location.origin}/images/jatim.png" alt="Logo Pemprov Jatim" />
                        </div>
                        <div class="kop-text">
                            <div class="instansi">PEMERINTAH PROVINSI JAWA TIMUR<br>DINAS PENDIDIKAN</div>
                            <div class="sekolah">SMA NEGERI 1 BABAT</div>
                            <div class="alamat">Jl. Sumowiharjo No.1 Telp. 0322-3326616 Fax. (0322) 451201<br>Email: smanegeri1babat.lmg@gmail.com</div>
                        </div>
                        <div class="kop-logo-right">
                            <img src="${window.location.origin}/images/logo.png" alt="Logo SMAN 1 Babat" />
                        </div>
                    </div>

                    <div class="title-doc">
                        <h2>REKAP BUKTI KEHADIRAN INDIVIDU</h2>
                    </div>

                    <div class="meta-info">
                        <table>
                            <tr>
                                <td style="width: 130px; font-weight: bold;">Nama Pegawai</td>
                                <td style="width: 15px;">:</td>
                                <td style="font-weight: bold;">${participantName}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">NIP</td>
                                <td>:</td>
                                <td style="font-family: monospace;">${data.participant.nis_nip || '-'}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">Status Kepegawaian</td>
                                <td>:</td>
                                <td>${data.participant.status || '-'}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">WorkCode</td>
                                <td>:</td>
                                <td>${selectedWorkcode.nama_workcode}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">Periode Bulan</td>
                                <td>:</td>
                                <td>${periodLabel}</td>
                            </tr>
                        </table>
                    </div>

                    <table class="summary-table">
                        <thead>
                            <tr>
                                <th style="width: 25%;">Alpha</th>
                                <th style="width: 25%;">Izin</th>
                                <th style="width: 25%;">Sakit</th>
                                <th style="width: 25%;">Lupa Absen</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="width: 25%; color: #b91c1c;">${totalAlpha} Hari</td>
                                <td style="width: 25%; color: #b45309;">${totalIzin} Hari</td>
                                <td style="width: 25%; color: #1d4ed8;">${totalSakit} Hari</td>
                                <td style="width: 25%; color: #475569;">${totalLupaAbsen} Hari</td>
                            </tr>
                        </tbody>
                    </table>

                    <table class="data-table">
                        <thead>
                            <tr>
                                <th style="width: 35px;">No</th>
                                <th>Hari &amp; Tanggal</th>
                                <th>Jam Datang</th>
                                <th>Jam Pulang</th>
                                <th style="width: 100px;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml || '<tr><td colspan="5" style="text-align:center; padding: 10px;">Belum ada data kehadiran</td></tr>'}
                        </tbody>
                    </table>

                    <div class="ttd-section">
                        <div class="ttd-box">
                            <p>Babat, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            <p style="margin-bottom: 5px;">Kepala Sekolah,</p>
                            <div class="ttd-qr-wrap" style="display: flex; justify-content: center; margin: 10px 0;">
                                <img src="${window.location.origin}/workcodes/${selectedWorkcode.id}/qr-signature" style="width: 80px; height: 80px;" alt="QR TTD" />
                            </div>
                            <p style="font-weight: bold; text-decoration: underline; font-size: 13px;">${kepalaSekolahNama}</p>
                            <p style="font-size: 11px; color: #475569; font-family: Arial, sans-serif;">NIP. ${kepalaSekolahNip}</p>
                        </div>
                    </div>

                    <script>
                        window.onload = function() {
                            setTimeout(function() { window.focus(); window.print(); }, 600);
                        };
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        } catch (error) {
            console.error("Gagal mengambil data rekap:", error);
            toast.error("Terjadi kesalahan saat memuat rekap individu.");
        }
    };

    const renderStatusBadge = (status) => {
        const badge = 'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase leading-4 text-white';
        switch (status) {
            case 'hadir':
                return <span className={`${badge} bg-gradient-to-b from-emerald-400 to-emerald-600`}>Hadir</span>;
            case 'alpha':
                return <span className={`${badge} bg-gradient-to-b from-rose-400 to-rose-600`}>Alpha</span>;
            case 'izin':
                return <span className={`${badge} bg-gradient-to-b from-amber-400 to-orange-500`}>Izin</span>;
            case 'sakit':
                return <span className={`${badge} bg-gradient-to-b from-sky-400 to-sky-600`}>Sakit</span>;
            case 'lupa_absen':
                return <span className={`${badge} bg-gradient-to-b from-neutral-400 to-neutral-600`}>Lupa absen</span>;
            default:
                return <span className="text-xs text-neutral-400">-</span>;
        }
    };

    const isDaily = selectedWorkcode?.kategori === 'harian';
    const ghost = 'inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900';
    const openCalendar = (attendance) => {
        const participant = participants.find((p) => p.id === attendance.participant_id) || {
            id: attendance.participant_id,
            nama: attendance.nama,
            nis_nip: attendance.nis_nip,
            status: attendance.status_pegawai,
        };
        setCalendarParticipant(participant);
        setShowCalendarModal(true);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Laporan Kehadiran" />

            <div className="flex w-full flex-1 flex-col px-4 py-2 sm:px-6 xl:min-h-0 xl:overflow-hidden">
                {/* Judul halaman + pilihan workcode + ekspor */}
                <div className="mb-4 shrink-0 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between" data-aos="fade-up">
                    <div className="min-w-0">
                        <h3 className="text-xl font-bold text-neutral-800">Laporan Kehadiran</h3>
                        <p className="mt-0.5 text-sm text-neutral-500">
                            {activeWorkcodes.length > 1
                                ? `${activeWorkcodes.length} workcode aktif bersamaan: ${activeWorkcodes.map((workcode) => workcode.nama_workcode).join(' · ')}`
                                : 'Rekap kehadiran per workcode, lengkap dengan bukti presensi.'}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <label htmlFor="workcode-filter" className="sr-only">Pilih workcode laporan</label>
                        <select
                            id="workcode-filter"
                            value={selectedWorkcodeId || ''}
                            onChange={(e) => handleWorkcodeChange(e.target.value)}
                            className="input-soft min-w-0 sm:w-72"
                        >
                            {workcodes.length === 0 && <option value="">Belum ada workcode</option>}
                            {workcodes.map((evt) => (
                                <option key={evt.id} value={evt.id}>
                                    {evt.is_active ? '● ' : ''}{evt.nama_workcode} ({evt.attendances_count} hadir)
                                </option>
                            ))}
                        </select>
                        {selectedWorkcodeId && (
                            <div className="flex gap-2">
                                <a href={route('workcodes.export', selectedWorkcodeId)} className="btn-soft flex-1 sm:flex-none" title="Ekspor Excel (.xlsx)">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Ekspor Excel
                                </a>
                                <button type="button" onClick={handlePrintReport} className="btn-brand flex-1 sm:flex-none" title="Cetak bukti hadir">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Cetak
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* KPI */}
                <section className="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <KpiCard delay={0} label="Total Peserta" value={stats.total} icon={icons.users}>
                        <span className="truncate">{selectedWorkcode?.nama_workcode || 'belum ada workcode'}</span>
                    </KpiCard>
                    <KpiCard delay={50} label="Hadir" value={stats.hadir} icon={icons.check}>
                        <span className="font-bold text-emerald-600">{attendancePercentage}%</span> dari total peserta
                    </KpiCard>
                    <KpiCard delay={100} label="Belum Hadir" value={stats.belum} icon={icons.clock}>
                        <span className="font-bold text-rose-500">{stats.total > 0 ? 100 - attendancePercentage : 0}%</span> belum tercatat
                    </KpiCard>
                    <KpiCard delay={150} label="Persentase Kehadiran" value={`${attendancePercentage}%`} icon={icons.chart}>
                        <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-neutral-200">
                            <span className="block h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000 ease-out" style={{ width: `${attendancePercentage}%` }} />
                        </span>
                    </KpiCard>
                </section>

                {/* Tabel laporan */}
                <section className="card-soft mt-4 flex min-h-0 flex-1 flex-col overflow-hidden" data-aos="fade-up" data-aos-delay="100">
                    <div className="flex flex-col gap-3 p-4 pb-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h6 className="text-base font-semibold text-neutral-800">{isDaily ? 'Rekap Presensi Harian' : 'Daftar Kehadiran'}</h6>
                            <p className="mt-0.5 flex items-center gap-1 text-sm text-neutral-500">
                                <span className="h-4 w-4 text-emerald-500">{icons.check}</span>
                                <span className="font-bold text-neutral-700">{filteredAttendances.length}</span> baris ditampilkan
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="relative sm:w-72">
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
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-soft sm:w-48" aria-label="Filter status pegawai">
                                <option value="">Semua status pegawai</option>
                                {uniqueStatuses.map((status, idx) => (
                                    <option key={idx} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* ── Daftar kartu (HP) ── */}
                    <ul className="divide-y divide-neutral-100 border-t border-neutral-200 sm:hidden">
                        {filteredAttendances.length === 0 ? (
                            <li className="px-4 py-10 text-center text-sm text-neutral-400">Belum ada data kehadiran.</li>
                        ) : (
                            mobileAttendances.map((attendance, index) => (
                                <li key={attendance.id || attendance.participant_id || index} className="space-y-3 px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <Initial name={attendance.nama} />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-neutral-800">{attendance.nama}</p>
                                            <p className="truncate text-xs text-neutral-500">{attendance.nis_nip || '-'} · {attendance.status_pegawai || '-'}</p>
                                        </div>
                                    </div>
                                    {isDaily ? (
                                        <div className="grid grid-cols-4 gap-2 text-center">
                                            <MiniCount label="Alpha" value={attendance.total_alpha || 0} tone="text-rose-600" />
                                            <MiniCount label="Izin" value={attendance.total_izin || 0} tone="text-amber-600" />
                                            <MiniCount label="Sakit" value={attendance.total_sakit || 0} tone="text-sky-600" />
                                            <MiniCount label="Telat" value={attendance.total_menit_terlambat ? `${attendance.total_menit_terlambat}m` : 0} tone="text-orange-600" />
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold tabular-nums text-neutral-800">{attendance.status !== 'libur' ? attendance.waktu_hadir : '-'}</span>
                                                {renderStatusBadge(attendance.status)}
                                            </div>
                                            <ProofThumb attendance={attendance} onOpen={() => setSignatureAttendance(attendance)} />
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-1">
                                        {isDaily ? (
                                            <button type="button" onClick={() => setDetailAttendance(attendance)} className={ghost}>
                                                <DetailIcon />
                                                Detail
                                            </button>
                                        ) : (
                                            <button type="button" onClick={() => openManualEditModal(attendance, attendance.nama)} className={ghost}>Edit presensi</button>
                                        )}
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>

                    {/* ── Tabel (desktop) ── */}
                    <div className="hidden min-h-0 flex-1 overflow-auto sm:block sm:max-h-[474px] xl:max-h-none">
                        <table className="w-full min-w-full text-left">
                            <thead className="sticky top-0 z-10 bg-white">
                                <tr className="border-y border-neutral-200 text-xs font-semibold uppercase text-neutral-500 [&>th]:opacity-70">
                                    <th className="w-12 px-4 py-3 text-center">No</th>
                                    <th className="px-4 py-3">Peserta</th>
                                    <th className="px-4 py-3">Status Pegawai</th>
                                    {isDaily ? (
                                        <>
                                            <th className="px-2 py-3 text-center">Alpha</th>
                                            <th className="px-2 py-3 text-center">Izin</th>
                                            <th className="px-2 py-3 text-center">Sakit</th>
                                            <th className="px-2 py-3 text-center">Lupa Absen</th>
                                            <th className="px-2 py-3 text-center">Terlambat</th>
                                            <th className="px-4 py-3 text-right">Aksi</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-4 py-3">Waktu Hadir</th>
                                            <th className="px-3 py-3 text-center">Status</th>
                                            <th className="px-3 py-3 text-center">Metode & Bukti</th>
                                            <th className="px-4 py-3 text-right">Aksi</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAttendances.length === 0 ? (
                                    <tr>
                                        <td colSpan={isDaily ? 9 : 7} className="px-4 py-16 text-center">
                                            <p className="text-sm font-medium text-neutral-600">Belum ada peserta yang hadir</p>
                                            <p className="mt-0.5 text-xs text-neutral-400">Data kehadiran pada workcode ini masih kosong.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAttendances.map((attendance, index) => (
                                        <tr key={attendance.id || attendance.participant_id || index} className="border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50">
                                            <td className="px-4 py-2.5 text-center text-xs font-medium tabular-nums text-neutral-500">{index + 1}</td>
                                            <td className="px-4 py-2.5">
                                                <div className="flex items-center gap-3">
                                                    <Initial name={attendance.nama} />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold leading-snug text-neutral-800">{attendance.nama}</p>
                                                        <p className="text-xs text-neutral-500">{attendance.nis_nip || '-'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2.5 text-xs font-medium text-neutral-600">{attendance.status_pegawai || '-'}</td>
                                            {isDaily ? (
                                                <>
                                                    <td className="px-2 py-2.5 text-center text-xs font-bold tabular-nums text-rose-600">{attendance.total_alpha || 0}</td>
                                                    <td className="px-2 py-2.5 text-center text-xs font-bold tabular-nums text-amber-600">{attendance.total_izin || 0}</td>
                                                    <td className="px-2 py-2.5 text-center text-xs font-bold tabular-nums text-sky-600">{attendance.total_sakit || 0}</td>
                                                    <td className="px-2 py-2.5 text-center text-xs font-bold tabular-nums text-neutral-600">{attendance.total_lupa_absen || 0}</td>
                                                    <td className="px-2 py-2.5 text-center text-xs font-bold tabular-nums text-orange-600">{attendance.total_menit_terlambat || 0} mnt</td>
                                                    <td className="px-4 py-2.5">
                                                        <div className="flex items-center justify-end">
                                                            <button type="button" onClick={() => setDetailAttendance(attendance)} className={ghost} title="Kalender, log foto wajah & cetak rekap">
                                                                <DetailIcon />
                                                                Detail
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-4 py-2.5 text-xs font-bold tabular-nums text-neutral-800">{attendance.status === 'libur' ? '-' : attendance.waktu_hadir}</td>
                                                    <td className="px-3 py-2.5 text-center">{renderStatusBadge(attendance.status)}</td>
                                                    <td className="px-3 py-2 text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className="text-[11px] font-bold uppercase text-neutral-600">{attendance.attendance_method || '—'}</span>
                                                            <ProofThumb attendance={attendance} onOpen={() => setSignatureAttendance(attendance)} />
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button type="button" onClick={() => openManualEditModal(attendance, attendance.nama)} className={ghost} title="Edit presensi">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                </svg>
                                                            </button>
                                                            <button type="button" onClick={() => handleDeleteAttendance(attendance.id, attendance.nama, attendance.waktu_hadir)} className={`${ghost} hover:!bg-rose-50 hover:!text-rose-600`} title="Hapus presensi">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {/* Detail tanda tangan dan presensi */}
            <Modal show={Boolean(signatureAttendance)} onClose={() => setSignatureAttendance(null)} maxWidth="lg">
                {signatureAttendance && (
                    <div className="p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75 11.25 15 15 9.75M12 3C7.03 3 3 5.015 3 7.5c0 1.381 1.244 2.617 3.2 3.442L5.25 15l4.307-2.154C10.337 12.946 11.156 13 12 13c4.97 0 9-2.015 9-4.5S16.97 3 12 3Z" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="truncate text-base font-bold text-slate-800">Detail Presensi</h3>
                                    <p className="truncate text-xs font-medium text-slate-500">{selectedWorkcode?.nama_workcode || 'Workcode'}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSignatureAttendance(null)}
                                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                                aria-label="Tutup detail presensi"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-5 rounded-lg border border-neutral-200 bg-neutral-100 p-4 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-800">
                                {signatureAttendance.face_capture_url ? 'Foto Presensi Wajah' : 'Tanda Tangan Digital'}
                            </p>
                            <img
                                src={signatureAttendance.face_capture_url || signatureAttendance.signature_url}
                                alt={`${signatureAttendance.face_capture_url ? 'Foto presensi wajah' : 'Tanda tangan'} ${signatureAttendance.nama}`}
                                className={`mx-auto mt-2 h-32 w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-inner ${signatureAttendance.face_capture_url ? 'object-cover' : 'object-contain p-2'}`}
                            />
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-lg border border-neutral-200 bg-white p-3 sm:col-span-2 shadow-soft">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Peserta</p>
                                <p className="mt-1 text-sm font-bold text-slate-800">{signatureAttendance.nama}</p>
                                <p className="text-xs font-medium text-slate-500">{signatureAttendance.nis_nip || 'Tanpa NIP'} · {signatureAttendance.status_pegawai || '-'}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tanggal Presensi</p>
                                <p className="mt-1 text-xs font-bold text-slate-800">{formatAttendanceDate(signatureAttendance.tanggal)}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Waktu Hadir</p>
                                <p className="mt-1 font-mono text-xs font-bold text-slate-800">{signatureAttendance.waktu_hadir !== '-' ? `${signatureAttendance.waktu_hadir} WIB` : '-'}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Waktu Pulang</p>
                                <p className="mt-1 font-mono text-xs font-bold text-slate-800">{signatureAttendance.waktu_pulang !== '-' ? `${signatureAttendance.waktu_pulang} WIB` : '-'}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status Kehadiran</p>
                                <div className="mt-1">{renderStatusBadge(signatureAttendance.status)}</div>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Metode Presensi</p>
                                <p className="mt-1 text-xs font-bold text-slate-800">{signatureAttendance.attendance_method || '-'}</p>
                            </div>
                        </div>

                        {selectedWorkcode?.latitude && selectedWorkcode?.longitude && (
                            <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Lokasi Workcode</p>
                                <p className="mt-1 text-xs font-semibold text-emerald-950">Radius presensi {selectedWorkcode.radius_meters || 100} meter</p>
                                <p className="mt-0.5 font-mono text-[10px] text-emerald-700">{Number(selectedWorkcode.latitude).toFixed(6)}, {Number(selectedWorkcode.longitude).toFixed(6)}</p>
                            </div>
                        )}

                        <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
                            <SecondaryButton onClick={() => setSignatureAttendance(null)}>Tutup</SecondaryButton>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Detail peserta (mode harian): pilih Kalender, Log, atau Cetak */}
            <Modal show={Boolean(detailAttendance)} onClose={() => setDetailAttendance(null)} maxWidth="md">
                {detailAttendance && (
                    <div className="p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <Initial name={detailAttendance.nama} />
                                <div className="min-w-0">
                                    <h3 className="truncate text-base font-bold text-slate-800">{detailAttendance.nama}</h3>
                                    <p className="truncate text-xs font-medium text-slate-500">
                                        {detailAttendance.nis_nip || 'Tanpa NIP'} · {detailAttendance.status_pegawai || '-'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDetailAttendance(null)}
                                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                                aria-label="Tutup detail peserta"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <DetailAction
                                icon={<span className="h-5 w-5">{icons.calendar}</span>}
                                label="Kalender"
                                desc="Kalender 1 bulan & kelola presensi"
                                onClick={() => {
                                    const att = detailAttendance;
                                    setDetailAttendance(null);
                                    openCalendar(att);
                                }}
                            />
                            <DetailAction
                                icon={<span className="h-5 w-5">{icons.document}</span>}
                                label="Log"
                                desc="Riwayat presensi & foto wajah hasil scan"
                                onClick={() => {
                                    const att = detailAttendance;
                                    setDetailAttendance(null);
                                    fetchLogs(att.participant_id, att.nama, att.nis_nip, att.status_pegawai);
                                }}
                            />
                            <DetailAction
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                }
                                label="Cetak"
                                desc="Cetak rekap individu"
                                onClick={() => {
                                    const att = detailAttendance;
                                    setDetailAttendance(null);
                                    handlePrintIndividualRecap(att.participant_id, att.nama);
                                }}
                            />
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal Edit Presensi */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-800">Edit Log Presensi</h3>
                                <p className="text-xs text-slate-500 font-medium">{editingParticipantName}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowEditModal(false)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleManualEditSubmit} className="mt-5 space-y-4">
                        <div>
                            <InputLabel htmlFor="edit_tanggal" value="Tanggal Presensi" className="text-xs font-bold text-slate-700" />
                            <TextInput
                                id="edit_tanggal"
                                type="date"
                                value={manualEditForm.data.tanggal}
                                onChange={(e) => manualEditForm.setData('tanggal', e.target.value)}
                                className="mt-1 w-full text-xs font-medium"
                                required
                            />
                            <InputError message={manualEditForm.errors.tanggal} className="mt-1 text-xs" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_status" value="Status Kehadiran" className="text-xs font-bold text-slate-700" />
                            <select
                                id="edit_status"
                                value={manualEditForm.data.status}
                                onChange={(e) => manualEditForm.setData('status', e.target.value)}
                                className="mt-1 w-full rounded-md border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                                required
                            >
                                <option value="hadir">Hadir</option>
                                <option value="izin">Izin</option>
                                <option value="sakit">Sakit</option>
                                <option value="lupa_absen">Lupa Absen</option>
                                <option value="alpha">Alpha</option>
                            </select>
                            <InputError message={manualEditForm.errors.status} className="mt-1 text-xs" />
                        </div>

                        {manualEditForm.data.status !== 'alpha' && (
                            <div className={`grid grid-cols-1 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 ${isSingleAttendanceWorkcode ? '' : 'sm:grid-cols-2'}`}>
                                <div>
                                    <InputLabel
                                        htmlFor="edit_jam_masuk"
                                        value={isSingleAttendanceWorkcode ? 'Jam Absen' : 'Jam Datang'}
                                        className="text-xs font-bold text-slate-600"
                                    />
                                    <TextInput
                                        id="edit_jam_masuk"
                                        type="time"
                                        value={manualEditForm.data.jam_masuk}
                                        onChange={(e) => manualEditForm.setData('jam_masuk', e.target.value)}
                                        className="mt-1 w-full text-xs"
                                    />
                                    <InputError message={manualEditForm.errors.jam_masuk} className="mt-1 text-xs" />
                                </div>

                                {!isSingleAttendanceWorkcode && (
                                    <div>
                                        <InputLabel htmlFor="edit_jam_pulang" value="Jam Pulang" className="text-xs font-bold text-slate-600" />
                                        <TextInput
                                            id="edit_jam_pulang"
                                            type="time"
                                            value={manualEditForm.data.jam_pulang}
                                            onChange={(e) => manualEditForm.setData('jam_pulang', e.target.value)}
                                            className="mt-1 w-full text-xs"
                                        />
                                        <InputError message={manualEditForm.errors.jam_pulang} className="mt-1 text-xs" />
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                            <SecondaryButton type="button" onClick={() => setShowEditModal(false)}>
                                Batal
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={manualEditForm.processing} className="bg-neutral-600 hover:bg-neutral-700">
                                {manualEditForm.processing ? 'Menyimpan...' : 'Perbarui Presensi'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal 3: Kelola Riwayat Log Presensi (Mode Harian) */}
            <Modal show={showLogsModal} onClose={() => { setShowLogsModal(false); setFacePreview(null); }} maxWidth="3xl">
                <div className="relative p-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    Log Presensi: {selectedParticipantForLogs?.nama}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    NIP: <span className="font-mono">{selectedParticipantForLogs?.nis_nip || '-'}</span> • {selectedParticipantForLogs?.status_pegawai || '-'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setCalendarParticipant(selectedParticipantForLogs);
                                    setShowCalendarModal(true);
                                    setShowLogsModal(false);
                                }}
                                className="inline-flex items-center gap-1 rounded-md bg-brand-gradient hover:bg-brand-gradient px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Buka Kalender
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowLogsModal(false)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="mt-4">
                        {isLoadingLogs ? (
                            <div className="py-12 text-center text-slate-500 text-xs font-semibold">
                                Memuat data riwayat presensi...
                            </div>
                        ) : selectedParticipantForLogs?.attendances?.length === 0 ? (
                            <div className="py-12 text-center text-slate-500">
                                <p className="text-xs font-semibold">Belum ada riwayat rekaman presensi untuk peserta ini.</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCalendarParticipant(selectedParticipantForLogs);
                                        setShowCalendarModal(true);
                                        setShowLogsModal(false);
                                    }}
                                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-neutral-800 hover:underline"
                                >
                                    📅 Buka kalender presensi sekarang
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto max-h-[350px] overflow-y-auto rounded-lg border border-slate-200">
                                <table className="min-w-full divide-y divide-slate-200 text-xs">
                                    <thead className="bg-slate-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wider">No</th>
                                            <th className="px-4 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
                                            <th className="px-4 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wider">Jam Datang</th>
                                            <th className="px-4 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wider">Jam Pulang</th>
                                            <th className="px-4 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wider">Foto Wajah</th>
                                            <th className="px-4 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {selectedParticipantForLogs?.attendances?.map((att, idx) => (
                                            <tr key={att.id || idx} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-4 py-2.5 text-slate-500 font-semibold">{idx + 1}</td>
                                                <td className="px-4 py-2.5 font-bold text-slate-800">
                                                    {att.tanggal_formatted || att.tanggal || '-'}
                                                </td>
                                                <td className="px-4 py-2.5 text-center font-mono font-medium text-slate-700">
                                                    {att.status === 'libur' ? '-' : (att.jam_masuk ? `${att.jam_masuk} WIB` : (att.waktu_hadir !== '-' ? att.waktu_hadir : '-'))}
                                                </td>
                                                <td className="px-4 py-2.5 text-center font-mono font-medium text-slate-700">
                                                    {att.status === 'libur' ? '-' : (att.jam_pulang ? `${att.jam_pulang} WIB` : (att.waktu_pulang !== '-' ? att.waktu_pulang : '-'))}
                                                </td>
                                                <td className="px-4 py-2.5 text-center">
                                                    {renderStatusBadge(att.status)}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {att.face_capture_url || att.face_capture_pulang_url ? (
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            {[
                                                                { url: att.face_capture_url, label: 'Datang', time: att.jam_masuk },
                                                                { url: att.face_capture_pulang_url, label: 'Pulang', time: att.jam_pulang },
                                                            ].map((shot) => (
                                                                <FaceThumb
                                                                    key={shot.label}
                                                                    url={shot.url}
                                                                    label={shot.label}
                                                                    onOpen={() => setFacePreview({ ...shot, tanggal: att.tanggal_formatted || att.tanggal })}
                                                                />
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-center text-slate-400">-</p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2.5 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => openManualEditModal(att, selectedParticipantForLogs.nama)}
                                                            className="p-1 rounded-lg text-neutral-800 hover:bg-neutral-100 transition-colors"
                                                            title="Edit Log Presensi Ini"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteAttendance(att.id, selectedParticipantForLogs.nama, att.tanggal_formatted || att.tanggal)}
                                                            className="p-1 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                                            title="Hapus Log Presensi Ini (Reset Status)"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="mt-5 flex justify-end border-t border-slate-100 pt-3">
                        <SecondaryButton onClick={() => { setShowLogsModal(false); setFacePreview(null); }}>
                            Tutup
                        </SecondaryButton>
                    </div>

                    {/* Pratinjau foto wajah hasil scan, tampil di atas tabel log */}
                    {facePreview && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/70 p-4" onClick={() => setFacePreview(null)}>
                            <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-soft-lg" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Foto Wajah {facePreview.label}</p>
                                        <p className="truncate text-sm font-bold text-slate-800">{selectedParticipantForLogs?.nama}</p>
                                        <p className="text-xs font-medium text-slate-500">
                                            {facePreview.tanggal || '-'}{facePreview.time ? ` · ${facePreview.time} WIB` : ''}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFacePreview(null)}
                                        className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                                        aria-label="Tutup pratinjau foto"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <img
                                    src={facePreview.url}
                                    alt={`Foto wajah ${facePreview.label.toLowerCase()} ${selectedParticipantForLogs?.nama || ''}`}
                                    className="mt-3 aspect-[3/4] w-full rounded-lg border border-slate-200 bg-slate-100 object-cover"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Modal 4: Kalender Presensi 1 Bulan Interaktif */}
            <AttendanceCalendarModal
                show={showCalendarModal}
                onClose={() => {
                    setShowCalendarModal(false);
                    setCalendarParticipant(null);
                    router.reload({ only: ['stats', 'attendances'], preserveScroll: true, preserveState: true });
                }}
                workcode={selectedWorkcode}
                participants={participants}
                initialParticipant={calendarParticipant}
                onAttendanceChanged={() => {
                    router.reload({ only: ['stats', 'attendances'], preserveScroll: true, preserveState: true });
                }}
            />
        </AuthenticatedLayout>
    );
}

function Initial({ name }) {
    return (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-gradient text-xs font-semibold text-white">
            {(name || 'P').charAt(0).toUpperCase()}
        </span>
    );
}

function MiniCount({ label, value, tone }) {
    return (
        <div className="rounded-md border border-neutral-200 px-1 py-1.5">
            <p className="text-[10px] font-medium uppercase text-neutral-500">{label}</p>
            <p className={`text-sm font-bold tabular-nums ${tone}`}>{value}</p>
        </div>
    );
}

function DetailIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

function DetailAction({ icon, label, desc, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 text-left transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 sm:flex-col sm:items-center sm:text-center"
        >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800">{icon}</span>
            <span className="min-w-0">
                <span className="block text-sm font-bold text-neutral-800">{label}</span>
                <span className="block text-[11px] leading-snug text-neutral-500">{desc}</span>
            </span>
        </button>
    );
}

function FaceThumb({ url, label, onOpen }) {
    const [failed, setFailed] = useState(false);

    if (!url || failed) {
        return (
            <span
                className="flex h-12 w-10 flex-col items-center justify-center rounded-md border border-dashed border-slate-200 text-center text-[8px] font-semibold uppercase leading-3 text-slate-300"
                title={failed ? `File foto ${label.toLowerCase()} tidak ditemukan` : `Tidak ada foto ${label.toLowerCase()}`}
            >
                {label}
                {failed && <span className="normal-case text-rose-300">hilang</span>}
            </span>
        );
    }

    return (
        <button
            type="button"
            onClick={onOpen}
            title={`Lihat foto wajah ${label.toLowerCase()}`}
            className="group relative overflow-hidden rounded-md border border-slate-200 transition-shadow hover:shadow-soft-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
            <img src={url} alt="" loading="lazy" onError={() => setFailed(true)} className="h-12 w-10 bg-slate-100 object-cover" />
            <span className="absolute inset-x-0 bottom-0 bg-slate-900/60 text-center text-[8px] font-bold uppercase leading-3 text-white">{label}</span>
        </button>
    );
}

function ProofThumb({ attendance, onOpen }) {
    if (!attendance.signature_url && !attendance.face_capture_url) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={onOpen}
            title="Lihat detail presensi dan bukti kehadiran"
            className="inline-flex rounded-md border border-neutral-200 transition-shadow hover:shadow-soft-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
            <img src={attendance.face_capture_url || attendance.signature_url} alt={`Bukti presensi ${attendance.nama}`} className="h-9 w-24 rounded-md bg-white object-contain" />
        </button>
    );
}
