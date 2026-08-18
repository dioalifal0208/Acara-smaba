import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function ReportIndex({ workcodes = [], selectedWorkcodeId, selectedWorkcode, stats, attendances = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const uniqueStatuses = [...new Set(attendances.map(a => a.status_pegawai).filter(Boolean))].sort();

    const handleWorkcodeChange = (workcodeId) => {
        router.get(route('report'), { workcode_id: workcodeId }, { preserveState: true, preserveScroll: true });
    };

    const filteredAttendances = attendances.filter(
        (a) => {
            const matchSearch = a.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                a.nis_nip.toLowerCase().includes(searchQuery.toLowerCase());
            const matchStatus = statusFilter === '' || a.status_pegawai === statusFilter;
            return matchSearch && matchStatus;
        }
    );

    const attendancePercentage = stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0;

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
                        margin: 2.5cm;
                    }
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                        font-family: 'Times New Roman', Times, serif;
                    }
                    body {
                        color: #0f172a;
                        background: #fff;
                        padding: 2.5cm;
                        width: 100%;
                    }
                    @media print {
                        body {
                            padding: 0 !important;
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
                        text-align: center;
                        width: 230px;
                    }
                    .ttd-qr-wrap {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        margin: 8px 0;
                    }
                    .ttd-qr-wrap img {
                        width: 82px;
                        height: 82px;
                        object-fit: contain;
                    }
                </style>
            </head>
            <body>
                <div class="header-kop">
                    <div class="kop-logo-left">
                        <img src="/images/jatim.png" alt="Logo Jawa Timur">
                    </div>
                    <div class="kop-text">
                        <div class="instansi">PEMERINTAH PROVINSI JAWA TIMUR<br>DINAS PENDIDIKAN</div>
                        <div class="sekolah">SMA NEGERI 1 BABAT</div>
                        <div class="alamat">Jl. Sumowiharjo No.1, Kec. Babat, Kab. Lamongan Jawa Timur 62271</div>
                    </div>
                    <div class="kop-logo-right">
                        <img src="/images/logo.png" alt="Logo SMAN 1 Babat">
                    </div>
                </div>

                <div class="title-doc">
                    <h2>REKAP PRESENSI BULAN ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase()}</h2>
                </div>

                <div class="meta-info">
                    <table>
                        <tr>
                            <td style="width: 140px; font-weight: bold;">Nama Workcode / Kegiatan</td>
                            <td style="width: 10px;">:</td>
                            <td style="font-weight: bold;">${selectedWorkcode.nama_workcode}</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold;">Total Kehadiran</td>
                            <td>:</td>
                            <td>${stats.hadir} dari ${stats.total} peserta (${attendancePercentage}%)</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold;">Waktu Cetak</td>
                            <td>:</td>
                            <td>${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</td>
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
                        ${rowsHtml || '<tr><td colspan="10" style="text-align:center; padding: 10px;">Belum ada data kehadiran</td></tr>'}
                    </tbody>
                </table>

                <div class="ttd-section">
                    <div class="ttd-box">
                        <p>Babat, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

                        <p style="margin-bottom: 5px;">Kepala Sekolah,</p>
                        <div class="ttd-qr-wrap" style="display: flex; justify-content: center; margin: 10px 0;">
                            <img src="/workcodes/${selectedWorkcode.id}/qr-signature" style="width: 80px; height: 80px;" alt="QR TTD" />
                        </div>
                        <p style="font-weight: bold; text-decoration: underline; font-size: 13px;">Muhtarom, S.Pd., M.Si.</p>
                        <p style="font-size: 11px; color: #475569; font-family: Arial, sans-serif;">NIP. 197205172006041015</p>
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        setTimeout(function() { window.print(); }, 600);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handlePrintIndividualRecap = async (participantId, participantName) => {
        if (!selectedWorkcode) return;
        try {
            const response = await fetch(`/report/individual/${selectedWorkcode.id}/${participantId}`);
            const data = await response.json();
            
            const printWindow = window.open('', '_blank', 'width=800,height=900');
            
            const rowsHtml = data.attendances.map((a, i) => {
                let tanggal = '-';
                let jamDatang = '-';
                let jamPulang = '-';

                if (a.waktu_hadir && a.waktu_hadir !== '-') {
                    const parts = a.waktu_hadir.split(' ');
                    if (parts.length >= 4) {
                        tanggal = parts.slice(0, 3).join(' ');
                        jamDatang = parts[3];
                        const dateObj = new Date(tanggal);
                        if (!isNaN(dateObj)) {
                            const hari = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });
                            tanggal = `${hari}, ${tanggal}`;
                        }
                    } else {
                        tanggal = a.waktu_hadir;
                    }
                }

                if (a.waktu_pulang && a.waktu_pulang !== '-') {
                    const parts = a.waktu_pulang.split(' ');
                    if (parts.length >= 4) {
                        jamPulang = parts[3];
                        if (tanggal === '-') {
                            tanggal = parts.slice(0, 3).join(' ');
                            const dateObj = new Date(tanggal);
                            if (!isNaN(dateObj)) {
                                const hari = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });
                                tanggal = `${hari}, ${tanggal}`;
                            }
                        }
                    } else {
                        jamPulang = a.waktu_pulang;
                    }
                }

                return `
                    <tr>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${i + 1}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${tanggal}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${jamDatang}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${jamPulang}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px;">${data.participant.status || '-'}</td>
                    </tr>
                `;
            }).join('');

            const totalAlpha = data.attendances.filter(a => a.status === 'alpha').length;
            const totalIzin = data.attendances.filter(a => a.status === 'izin').length;
            const totalSakit = data.attendances.filter(a => a.status === 'sakit').length;
            const totalLupaAbsen = data.attendances.filter(a => a.status === 'lupa_absen').length;
            const totalHadir = data.attendances.filter(a => a.status === 'hadir').length;

            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Rekap Kehadiran - ${participantName}</title>
                    <style>
                        @page { size: A4 portrait; margin: 2.5cm; }
                        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Times New Roman', Times, serif; }
                        body { color: #0f172a; background: #fff; padding: 2.5cm; width: 100%; }
                        @media print { body { padding: 0 !important; } }
                        .header-kop { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px double #000; padding-bottom: 12px; margin-bottom: 20px; text-align: center; }
                        .kop-logo-left, .kop-logo-right { width: 70px; display: flex; align-items: center; }
                        .kop-logo-left { justify-content: flex-start; }
                        .kop-logo-right { justify-content: flex-end; }
                        .kop-logo-left img, .kop-logo-right img { width: 65px; height: 75px; object-fit: contain; }
                        .kop-text { flex: 1; padding: 0 10px; text-align: center; }
                        .kop-text .instansi { font-size: 13px; font-weight: bold; text-transform: uppercase; line-height: 1.35; letter-spacing: 0.5px; }
                        .kop-text .sekolah { font-size: 17px; font-weight: bold; text-transform: uppercase; margin-top: 3px; letter-spacing: 0.5px; }
                        .kop-text .alamat { font-size: 10.5px; font-style: italic; color: #1e293b; margin-top: 4px; font-family: Arial, sans-serif; }
                        .title-doc { text-align: center; margin-bottom: 18px; }
                        .title-doc h2 { font-size: 15px; font-weight: bold; text-transform: uppercase; text-decoration: underline; }
                        .meta-info { margin-bottom: 16px; font-size: 12px; font-family: Arial, sans-serif; line-height: 1.6; }
                        .meta-info table { width: 100%; }
                        .meta-info td { padding: 2px 0; }
                        table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 11px; font-family: Arial, sans-serif; }
                        table.data-table th { background: #f1f5f9; border: 1px solid #94a3b8; padding: 7px 8px; text-transform: uppercase; font-size: 10px; font-weight: bold; }
                        .ttd-section { display: flex; justify-content: flex-end; margin-top: 30px; font-size: 12px; font-family: Arial, sans-serif; page-break-inside: avoid; }
                        .ttd-box { text-align: center; width: 230px; }
                    </style>
                </head>
                <body>
                    <div class="header-kop">
                        <div class="kop-logo-left">
                            <img src="/images/jatim.png" alt="Logo Jawa Timur">
                        </div>
                        <div class="kop-text">
                            <div class="instansi">PEMERINTAH PROVINSI JAWA TIMUR<br>DINAS PENDIDIKAN</div>
                            <div class="sekolah">SMA NEGERI 1 BABAT</div>
                            <div class="alamat">Jl. Sumowiharjo No.1, Kec. Babat, Kab. Lamongan Jawa Timur 62271</div>
                        </div>
                        <div class="kop-logo-right">
                            <img src="/images/logo.png" alt="Logo SMAN 1 Babat">
                        </div>
                    </div>

                    <div class="title-doc">
                        <h2>REKAP PRESENSI INDIVIDU</h2>
                    </div>

                    <div class="meta-info">
                        <table>
                            <tr>
                                <td style="width: 140px; font-weight: bold;">Nama Lengkap</td>
                                <td style="width: 10px;">:</td>
                                <td style="font-weight: bold;">${data.participant.nama}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">NIP</td>
                                <td>:</td>
                                <td>${data.participant.nis_nip || '-'}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">Status Pegawai</td>
                                <td>:</td>
                                <td>${data.participant.status || '-'}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">Workcode</td>
                                <td>:</td>
                                <td>${data.workcode.nama_workcode}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <table class="data-table" style="margin-bottom: 15px;">
                        <thead>
                            <tr>
                                <th style="text-align: center; width: 25%;">Alpha</th>
                                <th style="text-align: center; width: 25%;">Izin</th>
                                <th style="text-align: center; width: 25%;">Sakit</th>
                                <th style="text-align: center; width: 25%;">Lupa Absen</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px; font-weight: bold; color: #dc2626;">${totalAlpha}</td>
                                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px; font-weight: bold; color: #d97706;">${totalIzin}</td>
                                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px; font-weight: bold; color: #2563eb;">${totalSakit}</td>
                                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px; font-weight: bold; color: #475569;">${totalLupaAbsen}</td>
                            </tr>
                        </tbody>
                    </table>

                    <table class="data-table">
                        <thead>
                            <tr>
                                <th style="width: 35px;">No</th>
                                <th>Tanggal</th>
                                <th>Waktu Hadir</th>
                                <th>Waktu Pulang</th>
                                <th style="width: 100px;">Status Pegawai</th>
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
                                <img src="/workcodes/${selectedWorkcode.id}/qr-signature" style="width: 80px; height: 80px;" alt="QR TTD" />
                            </div>
                            <p style="font-weight: bold; text-decoration: underline; font-size: 13px;">Muhtarom, S.Pd., M.Si.</p>
                            <p style="font-size: 11px; color: #475569; font-family: Arial, sans-serif;">NIP. 197205172006041015</p>
                        </div>
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(() => window.close(), 500);
                        }
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        } catch (error) {
            console.error("Gagal mengambil data rekap:", error);
            alert("Terjadi kesalahan saat memuat rekap individu.");
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
                            <div className="flex items-center gap-2">
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

                    {/* Search and Filters (flex-none) */}
                    <div className="mb-2 flex flex-col sm:flex-row gap-3 flex-none" data-aos="fade-up" data-aos-delay="150">
                        <div className="relative flex-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Cari data kehadiran berdasarkan nama atau NIP..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-sm font-medium"
                            />
                        </div>
                        <div className="sm:w-64">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium cursor-pointer"
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
                        <div className="overflow-x-auto flex-1 overflow-y-auto max-h-[300px]">
                            <table className="min-w-full divide-y divide-slate-200 relative">
                                <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500">No</th>
                                        <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500">Nama Lengkap</th>
                                        <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500">NIP</th>
                                        <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500">Status Pegawai</th>
                                        {selectedWorkcode?.kategori === 'harian' ? (
                                            <>
                                                <th className="px-6 py-3 text-center text-xs font-extrabold uppercase tracking-wider text-slate-500">Alpha</th>
                                                <th className="px-6 py-3 text-center text-xs font-extrabold uppercase tracking-wider text-slate-500">Izin</th>
                                                <th className="px-6 py-3 text-center text-xs font-extrabold uppercase tracking-wider text-slate-500">Sakit</th>
                                                <th className="px-6 py-3 text-center text-xs font-extrabold uppercase tracking-wider text-slate-500">Lupa Absen</th>
                                                <th className="px-6 py-3 text-center text-xs font-extrabold uppercase tracking-wider text-slate-500">Total Terlambat</th>
                                                <th className="px-6 py-3 text-center text-xs font-extrabold uppercase tracking-wider text-slate-500">Aksi</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500">Waktu Hadir</th>
                                                <th className="px-6 py-3 text-center text-xs font-extrabold uppercase tracking-wider text-slate-500">Status</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {filteredAttendances.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-10 text-center text-slate-600">
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
                                                <td className="whitespace-nowrap px-6 py-3.5 text-xs text-slate-700 font-semibold font-mono">{attendance.nis_nip}</td>
                                                <td className="whitespace-nowrap px-6 py-3.5 text-xs text-slate-600">{attendance.status_pegawai || '-'}</td>
                                                {selectedWorkcode?.kategori === 'harian' ? (
                                                    <>
                                                        <td className="whitespace-nowrap px-6 py-3.5 text-xs text-red-600 font-bold text-center">{attendance.total_alpha || '0'}</td>
                                                        <td className="whitespace-nowrap px-6 py-3.5 text-xs text-amber-600 font-bold text-center">{attendance.total_izin || '0'}</td>
                                                        <td className="whitespace-nowrap px-6 py-3.5 text-xs text-blue-600 font-bold text-center">{attendance.total_sakit || '0'}</td>
                                                        <td className="whitespace-nowrap px-6 py-3.5 text-xs text-slate-600 font-bold text-center">{attendance.total_lupa_absen || '0'}</td>
                                                        <td className="whitespace-nowrap px-6 py-3.5 text-xs text-orange-600 font-bold text-center">{attendance.total_menit_terlambat ? attendance.total_menit_terlambat + ' Menit' : '0 Menit'}</td>
                                                        <td className="whitespace-nowrap px-6 py-3.5 text-center">
                                                            <button 
                                                                onClick={() => handlePrintIndividualRecap(attendance.participant_id, attendance.nama)}
                                                                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
                                                            >
                                                                🖨️ Cetak Rekap
                                                            </button>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="whitespace-nowrap px-6 py-3.5 text-xs text-slate-700 font-mono font-semibold">{attendance.waktu_hadir}</td>
                                                        <td className="whitespace-nowrap px-6 py-3.5 text-center">
                                                            {attendance.status === 'hadir' && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">✓ Hadir</span>}
                                                            {attendance.status === 'alpha' && <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">✗ Alpha</span>}
                                                            {attendance.status === 'izin' && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">! Izin</span>}
                                                            {attendance.status === 'sakit' && <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">+ Sakit</span>}
                                                            {attendance.status === 'lupa_absen' && <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-700">? Lupa Absen</span>}
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
        </AuthenticatedLayout>
    );
}
