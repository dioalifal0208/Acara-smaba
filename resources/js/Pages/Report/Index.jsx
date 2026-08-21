import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useToast } from '@/Components/Toast';
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
    selectedWorkcodeId,
    selectedWorkcode,
    stats,
    attendances = [],
    participants = [],
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

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        } else if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const uniqueStatuses = [...new Set(attendances.map(a => a.status_pegawai).filter(Boolean))].sort();

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

    const attendancePercentage = stats && stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0;

    // Open Manual Edit Modal
    const openManualEditModal = (att, participantName = '') => {
        setEditingParticipantName(participantName || att.nama || 'Peserta');
        manualEditForm.setData({
            id: att.id,
            tanggal: att.tanggal || (att.waktu_hadir ? att.waktu_hadir.split(' ')[0] : new Date().toISOString().split('T')[0]),
            jam_masuk: att.jam_masuk || '',
            jam_pulang: att.jam_pulang || '',
            status: att.status || 'hadir',
        });
        setShowEditModal(true);
    };

    // Fetch Logs for Participant
    const fetchLogs = async (participantId, participantName, nisNip, statusPegawai) => {
        if (!selectedWorkcode) return;
        setIsLoadingLogs(true);
        try {
            const response = await fetch(`/report/individual/${selectedWorkcode.id}/${participantId}`);
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
                            <td style="text-transform: capitalize;">${selectedWorkcode.kategori === 'harian' ? 'Presensi Harian' : 'Presensi Sekali / Event'}</td>
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
                        <p style="font-weight: bold; text-decoration: underline; font-size: 13px;">Muhtarom, S.Pd., M.Si.</p>
                        <p style="font-size: 11px; color: #475569; font-family: Arial, sans-serif;">NIP. 197205172006041015</p>
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
            const response = await fetch(`/report/individual/${selectedWorkcode.id}/${participantId}`);
            const data = await response.json();
            
            const printWindow = window.open('', '_blank', 'width=800,height=900');
            
            // Urutkan presensi dari tanggal ter-muda hingga tanggal paling tua (kronologis menaik)
            const sortedAttendances = (data.attendances || []).slice().sort((a, b) => {
                const dateA = a.tanggal || '';
                const dateB = b.tanggal || '';
                return dateA.localeCompare(dateB);
            });

            // Ambil batas jam datang dari workcode (default: 07:00)
            const jamDatangSelesai = (data.workcode && data.workcode.jam_datang_selesai) 
                ? data.workcode.jam_datang_selesai.slice(0, 5) 
                : '07:00';

            const rowsHtml = sortedAttendances.map((a, i) => {
                let tanggal = a.tanggal_formatted || a.tanggal || '-';
                let jamDatang = a.jam_masuk || (a.waktu_hadir !== '-' ? a.waktu_hadir : '-');
                let jamPulang = a.jam_pulang || (a.waktu_pulang !== '-' ? a.waktu_pulang : '-');

                let statusBadge = (a.status || 'hadir').toUpperCase();
                let statusColor = '#0f172a';

                if (a.status === 'hadir' || !a.status) {
                    const rawTime = (a.jam_masuk || '').trim().slice(0, 5);
                    if (rawTime && rawTime > jamDatangSelesai) {
                        statusBadge = 'TERLAMBAT';
                        statusColor = '#b91c1c'; // merah jika lewat batas jam masuk (07:00)
                    } else {
                        statusBadge = 'HADIR';
                        statusColor = '#15803d'; // hijau jika tepat waktu (<= 07:00)
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
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${tanggal}</td>
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
                                <th>Tanggal</th>
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
                            <p style="font-weight: bold; text-decoration: underline; font-size: 13px;">Muhtarom, S.Pd., M.Si.</p>
                            <p style="font-size: 11px; color: #475569; font-family: Arial, sans-serif;">NIP. 197205172006041015</p>
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
        switch (status) {
            case 'hadir':
                return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700">✓ Hadir</span>;
            case 'alpha':
                return <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-bold text-red-700">✗ Alpha</span>;
            case 'izin':
                return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-700">! Izin</span>;
            case 'sakit':
                return <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-bold text-blue-700">+ Sakit</span>;
            case 'lupa_absen':
                return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-300 px-2.5 py-0.5 text-xs font-bold text-slate-700">? Lupa Absen</span>;
            default:
                return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">-</span>;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" data-aos="fade-down">
                    <div>
                        <h2 className="text-xl font-extrabold leading-tight text-slate-800">
                            Laporan Kehadiran
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {selectedWorkcode ? `Menampilkan laporan untuk: ${selectedWorkcode.nama_workcode}` : 'Pilih workcode untuk melihat data'}
                        </p>
                    </div>

                    {/* Action & Filter Header */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Filter Workcode Dropdown */}
                        <div className="flex items-center gap-2">
                            <label htmlFor="workcode-filter" className="text-xs font-bold text-slate-600 shrink-0">
                                Workcode:
                            </label>
                            <select
                                id="workcode-filter"
                                value={selectedWorkcodeId || ''}
                                onChange={(e) => handleWorkcodeChange(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-indigo-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer min-w-[170px]"
                            >
                                {workcodes.length === 0 && <option value="">Belum Ada Workcode</option>}
                                {workcodes.map((evt) => (
                                    <option key={evt.id} value={evt.id}>
                                        {evt.is_active ? '🟢 ' : ''}{evt.nama_workcode} ({evt.attendances_count} hadir)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Export & Print Buttons */}
                        {selectedWorkcodeId && (
                            <div className="flex flex-wrap items-center gap-2">
                                <a
                                    href={route('workcodes.export', selectedWorkcodeId)}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 shadow-sm transition-all active:scale-95"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Export Excel (.xlsx)
                                </a>

                                <button
                                    type="button"
                                    onClick={handlePrintReport}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-95"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Cetak Bukti Hadir
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Laporan Kehadiran" />

            <div className="py-4 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col overflow-hidden justify-between max-h-[580px]">
                <div className="mx-auto max-w-[1400px] w-full flex-1 flex flex-col overflow-hidden space-y-3.5">
                    
                    {/* Stats Cards (flex-none) */}
                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 flex-none" data-aos="fade-up">
                        <div className="overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
                            <div className="flex items-center gap-3.5">
                                <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-2.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Peserta</p>
                                    <p className="text-xl font-extrabold text-slate-800 mt-0.5">{stats.total}</p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
                            <div className="flex items-center gap-3.5">
                                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-2.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hadir</p>
                                    <p className="text-xl font-extrabold text-emerald-600 mt-0.5">{stats.hadir}</p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
                            <div className="flex items-center gap-3.5">
                                <div className="rounded-xl bg-amber-50 border border-amber-100 p-2.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Belum Hadir</p>
                                    <p className="text-xl font-extrabold text-amber-600 mt-0.5">{stats.belum}</p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
                            <div className="flex items-center gap-3.5">
                                <div className="rounded-xl bg-purple-50 border border-purple-100 p-2.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Persentase</p>
                                    <p className="text-xl font-extrabold text-purple-600 mt-0.5">{attendancePercentage}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar (flex-none) */}
                    <div className="overflow-hidden rounded-2xl bg-white border border-slate-200 p-3.5 shadow-sm flex-none" data-aos="fade-up" data-aos-delay="100">
                        <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700">Progress Kehadiran</span>
                            <span className="text-xs font-extrabold text-indigo-600">{stats.hadir} / {stats.total}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-700 transition-all duration-1000 ease-out"
                                style={{ width: `${attendancePercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Search and Filters (flex-none) */}
                    <div className="flex flex-col sm:flex-row gap-3 flex-none" data-aos="fade-up" data-aos-delay="150">
                        <div className="relative flex-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Cari data kehadiran berdasarkan nama atau NIP..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-sm font-medium"
                            />
                        </div>
                        <div className="sm:w-64">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3.5 text-xs sm:text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium cursor-pointer"
                            >
                                <option value="">Semua Status Pegawai</option>
                                {uniqueStatuses.map((status, idx) => (
                                    <option key={idx} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Report Table Wrapper (flex-1 and overflow-y-auto to lock vertical height) */}
                    <div className="overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm flex-1 flex flex-col min-h-0" data-aos="fade-up" data-aos-delay="200">
                        <div className="flex-1 overflow-y-auto max-h-[300px]">
                            <table className="w-full min-w-full divide-y divide-slate-200 text-xs">
                                <thead className="bg-slate-50 sticky top-0 z-10 shadow-xs">
                                    <tr>
                                        <th className="w-12 px-3 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500">No</th>
                                        <th className="px-4 py-3 text-left font-extrabold uppercase tracking-wider text-slate-500">Nama Lengkap</th>
                                        <th className="w-44 px-3 py-3 text-left font-extrabold uppercase tracking-wider text-slate-500">NIP</th>
                                        <th className="w-28 px-3 py-3 text-left font-extrabold uppercase tracking-wider text-slate-500">Status Pegawai</th>
                                        {selectedWorkcode?.kategori === 'harian' ? (
                                            <>
                                                <th className="w-16 px-2 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500">Alpha</th>
                                                <th className="w-16 px-2 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500">Izin</th>
                                                <th className="w-16 px-2 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500">Sakit</th>
                                                <th className="w-24 px-2 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500">Lupa Absen</th>
                                                <th className="w-28 px-2 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500">Total Terlambat</th>
                                                <th className="w-60 px-3 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500">Aksi</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-4 py-3 text-left font-extrabold uppercase tracking-wider text-slate-500">Waktu Hadir</th>
                                                <th className="w-28 px-3 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500">Status</th>
                                                <th className="w-40 px-3 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500">Aksi</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {filteredAttendances.length === 0 ? (
                                        <tr>
                                            <td colSpan={selectedWorkcode?.kategori === 'harian' ? 10 : 7} className="px-4 py-16 text-center align-middle bg-white">
                                                <div className="flex flex-col items-center justify-center text-center mx-auto w-full">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200/80 mb-2.5 shadow-2xs">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-700">Belum ada peserta yang hadir</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">Data kehadiran peserta pada workcode ini masih kosong.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAttendances.map((attendance, index) => (
                                            <tr key={attendance.id || attendance.participant_id || index} className="transition-colors hover:bg-slate-50/70">
                                                <td className="px-3 py-2.5 text-center text-xs text-slate-400 font-semibold">{index + 1}</td>
                                                <td className="px-4 py-2.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600 shrink-0">
                                                            {(attendance.nama || 'P').charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">{attendance.nama}</span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2.5 text-xs text-slate-600 font-semibold font-mono">{attendance.nis_nip || '-'}</td>
                                                <td className="px-3 py-2.5 text-xs text-slate-600 font-medium">{attendance.status_pegawai || '-'}</td>
                                                {selectedWorkcode?.kategori === 'harian' ? (
                                                    <>
                                                        <td className="px-2 py-2.5 text-xs text-red-600 font-bold text-center">{attendance.total_alpha || '0'}</td>
                                                        <td className="px-2 py-2.5 text-xs text-amber-600 font-bold text-center">{attendance.total_izin || '0'}</td>
                                                        <td className="px-2 py-2.5 text-xs text-blue-600 font-bold text-center">{attendance.total_sakit || '0'}</td>
                                                        <td className="px-2 py-2.5 text-xs text-slate-600 font-bold text-center">{attendance.total_lupa_absen || '0'}</td>
                                                        <td className="px-2 py-2.5 text-xs text-orange-600 font-bold text-center">{attendance.total_menit_terlambat ? attendance.total_menit_terlambat + ' Menit' : '0 Menit'}</td>
                                                        <td className="px-3 py-2.5 text-center">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <button 
                                                                    onClick={() => {
                                                                        const pObj = participants.find(p => p.id === attendance.participant_id) || {
                                                                            id: attendance.participant_id,
                                                                            nama: attendance.nama,
                                                                            nis_nip: attendance.nis_nip,
                                                                            status: attendance.status_pegawai
                                                                        };
                                                                        setCalendarParticipant(pObj);
                                                                        setShowCalendarModal(true);
                                                                    }}
                                                                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-2xs shrink-0"
                                                                    title="Buka Kalender 1 Bulan & Kelola Presensi"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                    <span>Kalender</span>
                                                                </button>
                                                                <button 
                                                                    onClick={() => fetchLogs(attendance.participant_id, attendance.nama, attendance.nis_nip, attendance.status_pegawai)}
                                                                    className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-slate-100 border border-slate-200 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors shadow-2xs shrink-0"
                                                                    title="Daftar Log Presensi"
                                                                >
                                                                    <span>Log</span>
                                                                </button>
                                                                <button 
                                                                    onClick={() => handlePrintIndividualRecap(attendance.participant_id, attendance.nama)}
                                                                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors shadow-2xs shrink-0"
                                                                    title="Cetak Surat Bukti Rekap Individu"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                                    </svg>
                                                                    <span>Cetak</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="px-4 py-2.5 text-xs text-slate-700 font-mono font-semibold">{attendance.waktu_hadir}</td>
                                                        <td className="px-3 py-2.5 text-center">
                                                            {renderStatusBadge(attendance.status)}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-center">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <button
                                                                    onClick={() => openManualEditModal(attendance, attendance.nama)}
                                                                    className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-colors"
                                                                    title="Edit Presensi"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteAttendance(attendance.id, attendance.nama, attendance.waktu_hadir)}
                                                                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                                                                    title="Hapus Presensi"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                    </div>
                </div>
            </div>

            {/* Modal Edit Presensi */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-slate-800">Edit Log Presensi</h3>
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
                                className="mt-1 w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                    <InputLabel htmlFor="edit_jam_masuk" value="Jam Datang" className="text-xs font-bold text-slate-600" />
                                    <TextInput
                                        id="edit_jam_masuk"
                                        type="time"
                                        value={manualEditForm.data.jam_masuk}
                                        onChange={(e) => manualEditForm.setData('jam_masuk', e.target.value)}
                                        className="mt-1 w-full text-xs"
                                    />
                                    <InputError message={manualEditForm.errors.jam_masuk} className="mt-1 text-xs" />
                                </div>

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
                            </div>
                        )}

                        <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                            <SecondaryButton type="button" onClick={() => setShowEditModal(false)}>
                                Batal
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={manualEditForm.processing} className="bg-indigo-600 hover:bg-indigo-700">
                                {manualEditForm.processing ? 'Menyimpan...' : 'Perbarui Presensi'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal 3: Kelola Riwayat Log Presensi (Mode Harian) */}
            <Modal show={showLogsModal} onClose={() => setShowLogsModal(false)} maxWidth="2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-slate-800">
                                    Riwayat Presensi: {selectedParticipantForLogs?.nama}
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
                                className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors"
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
                                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                                >
                                    📅 Buka kalender presensi sekarang
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto max-h-[350px] overflow-y-auto rounded-xl border border-slate-200">
                                <table className="min-w-full divide-y divide-slate-200 text-xs">
                                    <thead className="bg-slate-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-2.5 text-left font-extrabold text-slate-500 uppercase tracking-wider">No</th>
                                            <th className="px-4 py-2.5 text-left font-extrabold text-slate-500 uppercase tracking-wider">Tanggal</th>
                                            <th className="px-4 py-2.5 text-center font-extrabold text-slate-500 uppercase tracking-wider">Jam Datang</th>
                                            <th className="px-4 py-2.5 text-center font-extrabold text-slate-500 uppercase tracking-wider">Jam Pulang</th>
                                            <th className="px-4 py-2.5 text-center font-extrabold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-2.5 text-center font-extrabold text-slate-500 uppercase tracking-wider">Aksi</th>
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
                                                    {att.jam_masuk ? `${att.jam_masuk} WIB` : (att.waktu_hadir !== '-' ? att.waktu_hadir : '-')}
                                                </td>
                                                <td className="px-4 py-2.5 text-center font-mono font-medium text-slate-700">
                                                    {att.jam_pulang ? `${att.jam_pulang} WIB` : (att.waktu_pulang !== '-' ? att.waktu_pulang : '-')}
                                                </td>
                                                <td className="px-4 py-2.5 text-center">
                                                    {renderStatusBadge(att.status)}
                                                </td>
                                                <td className="px-4 py-2.5 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => openManualEditModal(att, selectedParticipantForLogs.nama)}
                                                            className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
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
                        <SecondaryButton onClick={() => setShowLogsModal(false)}>
                            Tutup
                        </SecondaryButton>
                    </div>
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
