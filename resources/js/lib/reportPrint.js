import { appUrl } from '@/lib/appUrl';

/*
 * Cetak laporan (jendela cetak berisi HTML A4 dengan kop sekolah & QR tanda tangan kepala sekolah).
 * Tata letak cetak sengaja tidak ikut redesign layar: dipindahkan apa adanya dari Report/Index.jsx.
 * Data dari pengguna (nama, NIP, dll.) di-escape sebelum ditulis ke HTML.
 */

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Rekap presensi satu workcode (baris yang sedang tampil sesuai filter). */
export function printReport({ workcode: selectedWorkcode, attendances: filteredAttendances, period = null, kepalaSekolahNama, kepalaSekolahNip }) {

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    // Urutan cetak: PNS, PPPK, PPPK Paruh Waktu, lalu status lain; di dalam tiap status nama A-Z.
    const statusOrder = ['pns', 'pppk', 'pppk paruh waktu'];
    const statusRank = (status) => {
        const index = statusOrder.indexOf((status || '').trim().toLowerCase().replace(/\s+/g, ' '));
        return index === -1 ? statusOrder.length : index;
    };
    const printedAttendances = [...filteredAttendances].sort((a, b) =>
        statusRank(a.status_pegawai) - statusRank(b.status_pegawai)
        || a.nama.localeCompare(b.nama, 'id', { sensitivity: 'base' }));
    const rowsHtml = printedAttendances.map((a, i) => `
        <tr>
            <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${i + 1}</td>
            <td style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px;">${esc(a.nama)}</td>
            <td style="text-align: center; padding: 7px 6px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 10.5px; white-space: nowrap;">${esc(a.nis_nip && a.nis_nip !== 'null' ? a.nis_nip : '-')}</td>
            <td style="padding: 7px 6px; border: 1px solid #cbd5e1; font-size: 11px; white-space: nowrap;">${esc(a.status_pegawai || '-')}</td>
            ${selectedWorkcode.kategori === 'harian' 
                ? `
                    <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${a.total_alpha || '0'}</td>
                    <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${a.total_izin || '0'}</td>
                    <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${a.total_sakit || '0'}</td>
                    <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${a.total_lupa_absen || '0'}</td>
                    <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${a.total_menit_terlambat ? a.total_menit_terlambat + ' Menit' : '0 Menit'}</td>
                ` 
                : `
                    <td style="text-align: center; padding: 7px 6px; border: 1px solid #cbd5e1; font-size: 11px; white-space: nowrap;">${a.waktu_hadir}</td>
                    <td style="text-align: center; padding: 7px 6px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px; white-space: nowrap;">${a.status ? a.status.replace('_', ' ').toUpperCase() : '-'}</td>
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
            <th style="width: 5%;">No</th>
            <th>Nama Lengkap</th>
            <th style="width: 22%;">NIP</th>
            <th style="width: 17%;">Status Pegawai</th>
            <th style="width: 11%;">Jam Hadir</th>
            <th style="width: 10%;">Status</th>
        `;
    const columnCount = selectedWorkcode.kategori === 'harian' ? 9 : 6;

    // Tanggal kegiatan: tanggal jadwal workcode, atau tanggal presensi pertama bila tidak terjadwal.
    // Presensi harian direkap per bulan: periode dari server (tanggal 1 s.d. akhir bulan).
    const formatTanggal = (value, options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) =>
        new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString('id-ID', options);
    const namaHari = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    let tanggalKegiatan = '-';
    // Tanggal tanda tangan ikut tanggal kegiatan; presensi harian (tanpa satu tanggal) memakai tanggal cetak.
    let tanggalTtd = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    if (selectedWorkcode.kategori === 'harian') {
        if (period?.label) {
            tanggalKegiatan = period.label;
        } else {
            const hari = [...(selectedWorkcode.hari_aktif || [])].map(Number).sort((a, b) => a - b);
            if (hari.length) tanggalKegiatan = `Setiap ${hari.map(d => namaHari[d]).join(', ')}`;
        }
    } else {
        const firstAttendanceDate = filteredAttendances.map(a => a.tanggal).filter(Boolean).sort()[0];
        const tanggal = selectedWorkcode.tanggal || firstAttendanceDate;
        if (tanggal) {
            tanggalKegiatan = formatTanggal(tanggal);
            tanggalTtd = formatTanggal(tanggal, { day: 'numeric', month: 'long', year: 'numeric' });
        }
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Rekap Presensi - ${esc(selectedWorkcode.nama_workcode)}</title>
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
                        <td>${esc(selectedWorkcode.nama_workcode)}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">Kategori Presensi</td>
                        <td>:</td>
                        <td style="text-transform: capitalize;">${selectedWorkcode.kategori === 'harian'
                            ? 'Presensi Harian'
                            : 'Presensi Sekali / Event'}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">Tanggal Kegiatan</td>
                        <td>:</td>
                        <td>${tanggalKegiatan}</td>
                    </tr>
                </table>
            </div>

            <table class="data-table"${selectedWorkcode.kategori === 'harian' ? '' : ' style="table-layout: fixed;"'}>
                <thead>
                    <tr>
                        ${tableHeadersHtml}
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml || `<tr><td colspan="${columnCount}" style="text-align:center; padding: 10px;">Belum ada data kehadiran</td></tr>`}
                </tbody>
            </table>

            <div class="ttd-section">
                <div class="ttd-box">
                    <p>Babat, ${tanggalTtd}</p>
                    <p style="margin-bottom: 5px;">Kepala Sekolah,</p>
                    <div class="ttd-qr-wrap" style="display: flex; justify-content: center; margin: 10px 0;">
                        <img src="${window.location.origin}/workcodes/${selectedWorkcode.id}/qr-signature?logo=1" style="width: 90px; height: 90px;" alt="QR TTD" />
                    </div>
                    <p style="font-weight: bold; text-decoration: underline; font-size: 13px;">${esc(kepalaSekolahNama)}</p>
                    <p style="font-size: 11px; color: #475569; font-family: Arial, sans-serif;">NIP. ${esc(kepalaSekolahNip)}</p>
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
}

/** Rekap kehadiran individu bulan berjalan. Melempar galat bila data gagal dimuat. */
export async function printIndividualRecap({ workcode: selectedWorkcode, participantId, participantName, kepalaSekolahNama, kepalaSekolahNip }) {
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
            <title>Rekap Kehadiran - ${esc(participantName)}</title>
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
                        <td style="font-weight: bold;">${esc(participantName)}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">NIP</td>
                        <td>:</td>
                        <td style="font-family: monospace;">${esc(data.participant.nis_nip || '-')}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">Status Kepegawaian</td>
                        <td>:</td>
                        <td>${esc(data.participant.status || '-')}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">WorkCode</td>
                        <td>:</td>
                        <td>${esc(selectedWorkcode.nama_workcode)}</td>
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
                        <img src="${window.location.origin}/workcodes/${selectedWorkcode.id}/qr-signature?logo=1" style="width: 90px; height: 90px;" alt="QR TTD" />
                    </div>
                    <p style="font-weight: bold; text-decoration: underline; font-size: 13px;">${esc(kepalaSekolahNama)}</p>
                    <p style="font-size: 11px; color: #475569; font-family: Arial, sans-serif;">NIP. ${esc(kepalaSekolahNip)}</p>
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
}
