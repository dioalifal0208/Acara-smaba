import{r as z,j as t,H as A,e as _}from"./app-C52RX2cB.js";import{A as L}from"./AuthenticatedLayout-UtCDpy8W.js";import"./transition-Dv455fDS.js";function I({events:f=[],selectedEventId:p,selectedEvent:i,stats:s,attendances:u=[]}){const[c,w]=z.useState(""),y=e=>{_.get(route("report"),{event_id:e},{preserveState:!0,preserveScroll:!0})},h=u.filter(e=>e.nama.toLowerCase().includes(c.toLowerCase())||e.nis_nip.toLowerCase().includes(c.toLowerCase())),m=s.total>0?Math.round(s.hadir/s.total*100):0,j=()=>{if(!i)return;const e=window.open("","_blank","width=800,height=900"),r=h.map((a,x)=>`
            <tr>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${x+1}</td>
                <td style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px;">${a.nama}</td>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 11px;">${a.nis_nip}</td>
                <td style="padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${a.status_pegawai||"-"}</td>
                ${i.kategori==="harian"?`
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${a.total_hadir||"0"}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${a.total_alpha||"0"}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${a.total_izin||"0"}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${a.total_sakit||"0"}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${a.total_lupa_absen||"0"}</td>
                    `:`
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${a.waktu_hadir}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px;">${a.status?a.status.replace("_"," ").toUpperCase():"-"}</td>
                    `}
            </tr>
        `).join(""),n=i.kategori==="harian"?`
                <th style="width: 35px;">No</th>
                <th>Nama Lengkap</th>
                <th style="width: 150px;">NIP</th>
                <th style="width: 130px;">Status Pegawai</th>
                <th style="width: 50px;">Hadir</th>
                <th style="width: 50px;">Alpha</th>
                <th style="width: 50px;">Izin</th>
                <th style="width: 50px;">Sakit</th>
                <th style="width: 60px;">Lupa Absen</th>
            `:`
                <th style="width: 35px;">No</th>
                <th>Nama Lengkap</th>
                <th style="width: 150px;">NIP</th>
                <th>Status Pegawai</th>
                <th style="width: 130px;">Waktu Presensi</th>
                <th style="width: 70px;">Status</th>
            `;e.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Rekap Presensi - ${i.nama_event}</title>
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
                    <h2>REKAP PRESENSI ${i.nama_event.toUpperCase()}</h2>
                </div>

                <div class="meta-info">
                    <table>
                        <tr>
                            <td style="width: 140px; font-weight: bold;">Nama Event / Kegiatan</td>
                            <td style="width: 10px;">:</td>
                            <td style="font-weight: bold;">${i.nama_event}</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold;">Total Kehadiran</td>
                            <td>:</td>
                            <td>${s.hadir} dari ${s.total} peserta (${m}%)</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold;">Waktu Cetak</td>
                            <td>:</td>
                            <td>${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})} WIB</td>
                        </tr>
                    </table>
                </div>

                <table class="data-table">
                    <thead>
                        <tr>
                            ${n}
                        </tr>
                    </thead>
                    <tbody>
                        ${r||'<tr><td colspan="10" style="text-align:center; padding: 10px;">Belum ada data kehadiran</td></tr>'}
                    </tbody>
                </table>

                <div class="ttd-section">
                    <div class="ttd-box">
                        <p>Babat, ${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</p>

                        <p style="font-weight: bold; text-decoration: underline; font-size: 13px;">Muhtarom, S.Pd., M.Si.</p>
                        <p style="font-size: 11px; color: #475569; font-family: Arial, sans-serif;">SMA Negeri 1 Babat</p>
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        setTimeout(function() { window.print(); }, 600);
                    };
                <\/script>
            </body>
            </html>
        `),e.document.close()},v=async(e,r)=>{if(i)try{const a=await(await fetch(`/report/individual/${i.id}/${e}`)).json(),x=window.open("","_blank","width=800,height=900"),k=a.attendances.map((d,N)=>{let l="-",b="-",g="-";if(d.waktu_hadir&&d.waktu_hadir!=="-"){const o=d.waktu_hadir.split(" ");o.length>=4?(l=o.slice(0,3).join(" "),b=o[3]):l=d.waktu_hadir}if(d.waktu_pulang&&d.waktu_pulang!=="-"){const o=d.waktu_pulang.split(" ");o.length>=4?(g=o[3],l==="-"&&(l=o.slice(0,3).join(" "))):g=d.waktu_pulang}return`
                    <tr>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${N+1}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${l}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${b}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${g}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px;">${d.status.replace("_"," ").toUpperCase()}</td>
                    </tr>
                `}).join("");x.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Rekap Kehadiran - ${r}</title>
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
                                <td style="font-weight: bold;">${a.participant.nama}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">NIP / NIS</td>
                                <td>:</td>
                                <td>${a.participant.nis_nip||"-"}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">Status Pegawai</td>
                                <td>:</td>
                                <td>${a.participant.status||"-"}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">Workcode</td>
                                <td>:</td>
                                <td>${a.event.nama_event}</td>
                            </tr>
                        </table>
                    </div>

                    <table class="data-table">
                        <thead>
                            <tr>
                                <th style="width: 35px;">No</th>
                                <th>Tanggal</th>
                                <th>Waktu Hadir</th>
                                <th>Waktu Pulang</th>
                                <th style="width: 100px;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${k||'<tr><td colspan="5" style="text-align:center; padding: 10px;">Belum ada data kehadiran</td></tr>'}
                        </tbody>
                    </table>

                    <div class="ttd-section">
                        <div class="ttd-box">
                            <p>Babat, ${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</p>
                            <p style="margin-bottom: 5px;">Kepala Sekolah,</p>
                            <br><br><br>
                            <p style="font-weight: bold; text-decoration: underline;">Dr. SONY YUDI SAPUTRA, S.Pd., M.Pd.</p>
                            <p>NIP. 19700305 199412 1 002</p>
                        </div>
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(() => window.close(), 500);
                        }
                    <\/script>
                </body>
                </html>
            `),x.document.close()}catch(n){console.error("Gagal mengambil data rekap:",n),alert("Terjadi kesalahan saat memuat rekap individu.")}};return t.jsxs(L,{header:t.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-4","data-aos":"fade-down",children:[t.jsxs("div",{children:[t.jsx("h2",{className:"text-xl font-extrabold leading-tight text-slate-800",children:"Laporan Kehadiran"}),t.jsx("p",{className:"text-xs text-slate-500 font-medium mt-0.5",children:i?`Menampilkan laporan untuk: ${i.nama_event}`:"Pilih event untuk melihat data"})]}),t.jsxs("div",{className:"flex flex-wrap items-center gap-2.5",children:[t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsx("label",{htmlFor:"event-filter",className:"text-xs font-bold text-slate-600 shrink-0",children:"Event:"}),t.jsxs("select",{id:"event-filter",value:p||"",onChange:e=>y(e.target.value),className:"rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-indigo-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer min-w-[170px]",children:[f.length===0&&t.jsx("option",{value:"",children:"Belum Ada Event"}),f.map(e=>t.jsxs("option",{value:e.id,children:[e.is_active?"🟢 ":"",e.nama_event," (",e.attendances_count," hadir)"]},e.id))]})]}),p&&t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsxs("a",{href:route("events.export",p),className:"inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 shadow-sm transition-all active:scale-95",children:[t.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4 text-emerald-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"})}),"Export Excel (.xlsx)"]}),t.jsxs("button",{type:"button",onClick:j,className:"inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-95",children:[t.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"})}),"Cetak Bukti Hadir"]})]})]})]}),children:[t.jsx(A,{title:"Laporan Kehadiran"}),t.jsx("div",{className:"py-4 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col overflow-hidden justify-between max-h-[580px]",children:t.jsxs("div",{className:"mx-auto max-w-7xl w-full flex-1 flex flex-col overflow-hidden space-y-4",children:[t.jsxs("div",{className:"mb-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 flex-none","data-aos":"fade-up",children:[t.jsx("div",{className:"overflow-hidden rounded-xl bg-white border border-slate-200 p-4 shadow-sm",children:t.jsxs("div",{className:"flex items-center gap-4",children:[t.jsx("div",{className:"rounded-xl bg-indigo-50 border border-indigo-100 p-2.5",children:t.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6 text-indigo-700",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"})})}),t.jsxs("div",{children:[t.jsx("p",{className:"text-[10px] font-semibold text-slate-500 uppercase tracking-wider",children:"Total Peserta"}),t.jsx("p",{className:"text-xl font-extrabold text-slate-800 mt-0.5",children:s.total})]})]})}),t.jsx("div",{className:"overflow-hidden rounded-xl bg-white border border-slate-200 p-4 shadow-sm",children:t.jsxs("div",{className:"flex items-center gap-4",children:[t.jsx("div",{className:"rounded-xl bg-emerald-50 border border-emerald-100 p-2.5",children:t.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6 text-emerald-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"})})}),t.jsxs("div",{children:[t.jsx("p",{className:"text-[10px] font-semibold text-slate-500 uppercase tracking-wider",children:"Hadir"}),t.jsx("p",{className:"text-xl font-extrabold text-emerald-600 mt-0.5",children:s.hadir})]})]})}),t.jsx("div",{className:"overflow-hidden rounded-xl bg-white border border-slate-200 p-4 shadow-sm",children:t.jsxs("div",{className:"flex items-center gap-4",children:[t.jsx("div",{className:"rounded-xl bg-amber-50 border border-amber-100 p-2.5",children:t.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6 text-amber-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"})})}),t.jsxs("div",{children:[t.jsx("p",{className:"text-[10px] font-semibold text-slate-500 uppercase tracking-wider",children:"Belum Hadir"}),t.jsx("p",{className:"text-xl font-extrabold text-amber-600 mt-0.5",children:s.belum})]})]})}),t.jsx("div",{className:"overflow-hidden rounded-xl bg-white border border-slate-200 p-4 shadow-sm",children:t.jsxs("div",{className:"flex items-center gap-4",children:[t.jsx("div",{className:"rounded-xl bg-purple-50 border border-purple-100 p-2.5",children:t.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6 text-purple-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:[t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"}),t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"})]})}),t.jsxs("div",{children:[t.jsx("p",{className:"text-[10px] font-semibold text-slate-500 uppercase tracking-wider",children:"Persentase"}),t.jsxs("p",{className:"text-xl font-extrabold text-purple-600 mt-0.5",children:[m,"%"]})]})]})})]}),t.jsxs("div",{className:"overflow-hidden rounded-xl bg-white border border-slate-200 p-4 shadow-sm flex-none","data-aos":"fade-up","data-aos-delay":"100",children:[t.jsxs("div",{className:"mb-2 flex items-center justify-between",children:[t.jsx("span",{className:"text-xs font-bold text-slate-700",children:"Progress Kehadiran"}),t.jsxs("span",{className:"text-xs font-bold text-indigo-600",children:[s.hadir," / ",s.total]})]}),t.jsx("div",{className:"h-2.5 w-full overflow-hidden rounded-full bg-slate-100",children:t.jsx("div",{className:"h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-700 transition-all duration-1000 ease-out",style:{width:`${m}%`}})})]}),t.jsx("div",{className:"mb-2 flex-none","data-aos":"fade-up","data-aos-delay":"150",children:t.jsxs("div",{className:"relative",children:[t.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2.5,d:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"})}),t.jsx("input",{type:"text",placeholder:"Cari data kehadiran berdasarkan nama atau NIP...",value:c,onChange:e=>w(e.target.value),className:"w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-sm font-medium"})]})}),t.jsx("div",{className:"overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm flex-1 flex flex-col min-h-0","data-aos":"fade-up","data-aos-delay":"200",children:t.jsx("div",{className:"overflow-x-auto flex-1 overflow-y-auto max-h-[300px]",children:t.jsxs("table",{className:"min-w-full divide-y divide-slate-200 relative",children:[t.jsx("thead",{className:"bg-slate-50 sticky top-0 z-10 shadow-sm",children:t.jsxs("tr",{children:[t.jsx("th",{className:"px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500",children:"No"}),t.jsx("th",{className:"px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500",children:"Nama Lengkap"}),t.jsx("th",{className:"px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500",children:"NIP"}),t.jsx("th",{className:"px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500",children:"Status Pegawai"}),i?.kategori==="harian"?t.jsxs(t.Fragment,{children:[t.jsx("th",{className:"px-6 py-3 text-center text-xs font-extrabold uppercase tracking-wider text-slate-500",children:"Hadir"}),t.jsx("th",{className:"px-6 py-3 text-center text-xs font-extrabold uppercase tracking-wider text-slate-500",children:"Alpha"}),t.jsx("th",{className:"px-6 py-3 text-center text-xs font-extrabold uppercase tracking-wider text-slate-500",children:"Izin"}),t.jsx("th",{className:"px-6 py-3 text-center text-xs font-extrabold uppercase tracking-wider text-slate-500",children:"Sakit"}),t.jsx("th",{className:"px-6 py-3 text-center text-xs font-extrabold uppercase tracking-wider text-slate-500",children:"Lupa Absen"}),t.jsx("th",{className:"px-6 py-3 text-center text-xs font-extrabold uppercase tracking-wider text-slate-500",children:"Aksi"})]}):t.jsxs(t.Fragment,{children:[t.jsx("th",{className:"px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500",children:"Waktu Hadir"}),t.jsx("th",{className:"px-6 py-3 text-center text-xs font-extrabold uppercase tracking-wider text-slate-500",children:"Status"})]})]})}),t.jsx("tbody",{className:"divide-y divide-slate-100 bg-white",children:h.length===0?t.jsx("tr",{children:t.jsxs("td",{colSpan:"6",className:"px-6 py-10 text-center text-slate-600",children:[t.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"mx-auto h-10 w-10 text-slate-300 mb-1",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:1,d:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"})}),t.jsx("p",{className:"text-xs font-semibold",children:"Belum ada peserta yang hadir."})]})}):h.map((e,r)=>t.jsxs("tr",{className:"transition-colors hover:bg-slate-50/50",children:[t.jsx("td",{className:"whitespace-nowrap px-6 py-3.5 text-xs text-slate-500 font-semibold",children:r+1}),t.jsx("td",{className:"whitespace-nowrap px-6 py-3.5",children:t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx("div",{className:"flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600",children:e.nama.charAt(0).toUpperCase()}),t.jsx("span",{className:"text-sm font-bold text-slate-800",children:e.nama})]})}),t.jsx("td",{className:"whitespace-nowrap px-6 py-3.5 text-xs text-slate-700 font-semibold font-mono",children:e.nis_nip}),t.jsx("td",{className:"whitespace-nowrap px-6 py-3.5 text-xs text-slate-600",children:e.status_pegawai||"-"}),i?.kategori==="harian"?t.jsxs(t.Fragment,{children:[t.jsx("td",{className:"whitespace-nowrap px-6 py-3.5 text-xs text-emerald-600 font-bold text-center",children:e.total_hadir||"0"}),t.jsx("td",{className:"whitespace-nowrap px-6 py-3.5 text-xs text-red-600 font-bold text-center",children:e.total_alpha||"0"}),t.jsx("td",{className:"whitespace-nowrap px-6 py-3.5 text-xs text-amber-600 font-bold text-center",children:e.total_izin||"0"}),t.jsx("td",{className:"whitespace-nowrap px-6 py-3.5 text-xs text-blue-600 font-bold text-center",children:e.total_sakit||"0"}),t.jsx("td",{className:"whitespace-nowrap px-6 py-3.5 text-xs text-slate-600 font-bold text-center",children:e.total_lupa_absen||"0"}),t.jsx("td",{className:"whitespace-nowrap px-6 py-3.5 text-center",children:t.jsx("button",{onClick:()=>v(e.participant_id,e.nama),className:"inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors",children:"🖨️ Cetak Rekap"})})]}):t.jsxs(t.Fragment,{children:[t.jsx("td",{className:"whitespace-nowrap px-6 py-3.5 text-xs text-slate-700 font-mono font-semibold",children:e.waktu_hadir}),t.jsxs("td",{className:"whitespace-nowrap px-6 py-3.5 text-center",children:[e.status==="hadir"&&t.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700",children:"✓ Hadir"}),e.status==="alpha"&&t.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700",children:"✗ Alpha"}),e.status==="izin"&&t.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700",children:"! Izin"}),e.status==="sakit"&&t.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700",children:"+ Sakit"}),e.status==="lupa_absen"&&t.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-700",children:"? Lupa Absen"})]})]})]},e.id))})]})})})]})})]})}export{I as default};
