import{r as g,j as e,H as b,e as u}from"./app-vpSl2Kw4.js";import{A as w}from"./AuthenticatedLayout-BMeX47xO.js";import"./transition-aP9LVEmc.js";function y({events:x=[],selectedEventId:r,selectedEvent:s,stats:a,attendances:c=[]}){const[o,p]=g.useState(""),h=t=>{u.get(route("report"),{event_id:t},{preserveState:!0,preserveScroll:!0})},l=c.filter(t=>t.nama.toLowerCase().includes(o.toLowerCase())||t.nis_nip.toLowerCase().includes(o.toLowerCase())),d=a.total>0?Math.round(a.hadir/a.total*100):0,m=()=>{if(!s)return;const t=window.open("","_blank","width=800,height=900"),n=l.map((i,f)=>`
            <tr>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${f+1}</td>
                <td style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px;">${i.nama}</td>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 11px;">${i.nis_nip}</td>
                <td style="padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${i.keterangan||"-"}</td>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${i.waktu_hadir}</td>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; color: #059669; font-weight: bold; font-size: 11px;">Hadir</td>
            </tr>
        `).join("");t.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bukti Daftar Hadir - ${s.nama_event}</title>
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
                    <h2>BUKTI DAFTAR HADIR PESERTA ACARA</h2>
                </div>

                <div class="meta-info">
                    <table>
                        <tr>
                            <td style="width: 140px; font-weight: bold;">Nama Acara / Event</td>
                            <td style="width: 10px;">:</td>
                            <td style="font-weight: bold;">${s.nama_event}</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold;">Total Kehadiran</td>
                            <td>:</td>
                            <td>${a.hadir} dari ${a.total} peserta (${d}%)</td>
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
                            <th style="width: 35px;">No</th>
                            <th>Nama Lengkap</th>
                            <th style="width: 150px;">NIP</th>
                            <th>Keterangan</th>
                            <th style="width: 130px;">Waktu Presensi</th>
                            <th style="width: 70px;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${n||'<tr><td colspan="6" style="text-align: center; padding: 20px; border: 1px solid #cbd5e1;">Belum ada data kehadiran</td></tr>'}
                    </tbody>
                </table>

                <div class="ttd-section">
                    <div class="ttd-box">
                        <p>Babat, ${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</p>
                        <p style="font-weight: bold; margin-top: 2px;">Mengetahui,</p>
                        <p style="font-weight: bold;">Kepala SMA Negeri 1 Babat</p>
                        
                        <div class="ttd-qr-wrap">
                            <img src="${route("events.qr-signature",s.id)}" alt="QR Tanda Tangan Digital" />
                            <span style="font-size: 8px; color: #475569; font-family: Arial, sans-serif; margin-top: 2px; font-weight: bold; letter-spacing: 0.3px;">✓ TTD Digital Terverifikasi</span>
                        </div>

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
        `),t.document.close()};return e.jsxs(w,{header:e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-4","data-aos":"fade-down",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-xl font-extrabold leading-tight text-slate-800",children:"Laporan Kehadiran"}),e.jsx("p",{className:"text-xs text-slate-500 font-medium mt-0.5",children:s?`Menampilkan laporan untuk: ${s.nama_event}`:"Pilih event untuk melihat data"})]}),e.jsxs("div",{className:"flex flex-wrap items-center gap-2.5",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("label",{htmlFor:"event-filter",className:"text-xs font-bold text-slate-600 shrink-0",children:"Event:"}),e.jsxs("select",{id:"event-filter",value:r||"",onChange:t=>h(t.target.value),className:"rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-indigo-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer min-w-[170px]",children:[x.length===0&&e.jsx("option",{value:"",children:"Belum Ada Event"}),x.map(t=>e.jsxs("option",{value:t.id,children:[t.is_active?"🟢 ":"",t.nama_event," (",t.attendances_count," hadir)"]},t.id))]})]}),r&&e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("a",{href:route("events.export",r),className:"inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 shadow-sm transition-all active:scale-95",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4 text-emerald-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"})}),"Export Excel (.xlsx)"]}),e.jsxs("button",{type:"button",onClick:m,className:"inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-95",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"})}),"Cetak Bukti Hadir"]})]})]})]}),children:[e.jsx(b,{title:"Laporan Kehadiran"}),e.jsx("div",{className:"py-4 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col overflow-hidden justify-between max-h-[580px]",children:e.jsxs("div",{className:"mx-auto max-w-7xl w-full flex-1 flex flex-col overflow-hidden space-y-4",children:[e.jsxs("div",{className:"mb-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 flex-none","data-aos":"fade-up",children:[e.jsx("div",{className:"overflow-hidden rounded-xl bg-white border border-slate-200 p-4 shadow-sm",children:e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:"rounded-xl bg-indigo-50 border border-indigo-100 p-2.5",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6 text-indigo-700",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"})})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] font-semibold text-slate-500 uppercase tracking-wider",children:"Total Peserta"}),e.jsx("p",{className:"text-xl font-extrabold text-slate-800 mt-0.5",children:a.total})]})]})}),e.jsx("div",{className:"overflow-hidden rounded-xl bg-white border border-slate-200 p-4 shadow-sm",children:e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:"rounded-xl bg-emerald-50 border border-emerald-100 p-2.5",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6 text-emerald-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"})})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] font-semibold text-slate-500 uppercase tracking-wider",children:"Hadir"}),e.jsx("p",{className:"text-xl font-extrabold text-emerald-600 mt-0.5",children:a.hadir})]})]})}),e.jsx("div",{className:"overflow-hidden rounded-xl bg-white border border-slate-200 p-4 shadow-sm",children:e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:"rounded-xl bg-amber-50 border border-amber-100 p-2.5",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6 text-amber-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"})})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] font-semibold text-slate-500 uppercase tracking-wider",children:"Belum Hadir"}),e.jsx("p",{className:"text-xl font-extrabold text-amber-600 mt-0.5",children:a.belum})]})]})}),e.jsx("div",{className:"overflow-hidden rounded-xl bg-white border border-slate-200 p-4 shadow-sm",children:e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:"rounded-xl bg-purple-50 border border-purple-100 p-2.5",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6 text-purple-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:[e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"}),e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"})]})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] font-semibold text-slate-500 uppercase tracking-wider",children:"Persentase"}),e.jsxs("p",{className:"text-xl font-extrabold text-purple-600 mt-0.5",children:[d,"%"]})]})]})})]}),e.jsxs("div",{className:"overflow-hidden rounded-xl bg-white border border-slate-200 p-4 shadow-sm flex-none","data-aos":"fade-up","data-aos-delay":"100",children:[e.jsxs("div",{className:"mb-2 flex items-center justify-between",children:[e.jsx("span",{className:"text-xs font-bold text-slate-700",children:"Progress Kehadiran"}),e.jsxs("span",{className:"text-xs font-bold text-indigo-600",children:[a.hadir," / ",a.total]})]}),e.jsx("div",{className:"h-2.5 w-full overflow-hidden rounded-full bg-slate-100",children:e.jsx("div",{className:"h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-700 transition-all duration-1000 ease-out",style:{width:`${d}%`}})})]}),e.jsx("div",{className:"mb-2 flex-none","data-aos":"fade-up","data-aos-delay":"150",children:e.jsxs("div",{className:"relative",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2.5,d:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"})}),e.jsx("input",{type:"text",placeholder:"Cari data kehadiran berdasarkan nama atau NIP/NIS...",value:o,onChange:t=>p(t.target.value),className:"w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-sm font-medium"})]})}),e.jsx("div",{className:"overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm flex-1 flex flex-col min-h-0","data-aos":"fade-up","data-aos-delay":"200",children:e.jsx("div",{className:"overflow-x-auto flex-1 overflow-y-auto max-h-[300px]",children:e.jsxs("table",{className:"min-w-full divide-y divide-slate-200 relative",children:[e.jsx("thead",{className:"bg-slate-50 sticky top-0 z-10 shadow-sm",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500",children:"No"}),e.jsx("th",{className:"px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500",children:"Nama Lengkap"}),e.jsx("th",{className:"px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500",children:"NIP"}),e.jsx("th",{className:"px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500",children:"Keterangan"}),e.jsx("th",{className:"px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-500",children:"Waktu Hadir"}),e.jsx("th",{className:"px-6 py-3 text-center text-xs font-extrabold uppercase tracking-wider text-slate-500",children:"Status"})]})}),e.jsx("tbody",{className:"divide-y divide-slate-100 bg-white",children:l.length===0?e.jsx("tr",{children:e.jsxs("td",{colSpan:"6",className:"px-6 py-10 text-center text-slate-600",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"mx-auto h-10 w-10 text-slate-300 mb-1",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:1,d:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"})}),e.jsx("p",{className:"text-xs font-semibold",children:"Belum ada peserta yang hadir."})]})}):l.map((t,n)=>e.jsxs("tr",{className:"transition-colors hover:bg-slate-50/50",children:[e.jsx("td",{className:"whitespace-nowrap px-6 py-3.5 text-xs text-slate-500 font-semibold",children:n+1}),e.jsx("td",{className:"whitespace-nowrap px-6 py-3.5",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600",children:t.nama.charAt(0).toUpperCase()}),e.jsx("span",{className:"text-sm font-bold text-slate-800",children:t.nama})]})}),e.jsx("td",{className:"whitespace-nowrap px-6 py-3.5 text-xs text-slate-700 font-semibold font-mono",children:t.nis_nip}),e.jsx("td",{className:"whitespace-nowrap px-6 py-3.5 text-xs text-slate-600",children:t.keterangan||"-"}),e.jsx("td",{className:"whitespace-nowrap px-6 py-3.5 text-xs text-slate-700 font-mono font-semibold",children:t.waktu_hadir}),e.jsx("td",{className:"whitespace-nowrap px-6 py-3.5 text-center",children:e.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700",children:"✓ Hadir"})})]},t.id))})]})})})]})})]})}export{y as default};
