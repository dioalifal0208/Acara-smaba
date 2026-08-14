const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-DaNMrLmU.js","assets/app-Dr7QUAXJ.js","assets/app-Dnv7wZef.css"])))=>i.map(i=>d[i]);
import{d as O,b as G,r as n,j as e,H as U,_ as X}from"./app-Dr7QUAXJ.js";import{A as F}from"./AuthenticatedLayout-u1k7fzMm.js";import"./transition-DSS5Madh.js";function ee({initialStats:V,activeEvent:z}){const{toast:j,addToast:p}=O(),{activeEvent:B}=G().props,c=z||B,[x,W]=n.useState(V),[l,v]=n.useState(!1),[T,f]=n.useState(!1),[S,A]=n.useState(null),[y,M]=n.useState([]),[R,C]=n.useState(!1),[D,Q]=n.useState(0),[_,q]=n.useState({active:!1,style:null}),o=n.useRef(null),w=n.useRef(!1),g=n.useRef(""),N=n.useRef(null),u=n.useRef(null),L=n.useCallback(s=>{const t=s?.result?.bounds,a=document.querySelector("#qr-reader video");if(!t||!a)return null;const r=a.videoWidth||a.clientWidth,d=a.videoHeight||a.clientHeight;if(!r||!d)return null;const h=Math.min(Math.max(t.width/r*100,26),62),i=Math.min(Math.max((t.x+t.width/2)/r*100,18),82),m=Math.min(Math.max((t.y+t.height/2)/d*100,18),82);return{left:`${i}%`,top:`${m}%`,width:`${h}%`}},[]),H=n.useCallback(s=>{u.current&&clearTimeout(u.current),q({active:!0,style:L(s)}),u.current=setTimeout(()=>{q({active:!1,style:null})},1200)},[L]),b=n.useCallback(s=>{try{const t=new(window.AudioContext||window.webkitAudioContext),a=t.createOscillator(),r=t.createGain();a.connect(r),r.connect(t.destination),s==="success"?(a.frequency.setValueAtTime(587.33,t.currentTime),a.frequency.setValueAtTime(880,t.currentTime+.1),r.gain.setValueAtTime(.2,t.currentTime),r.gain.exponentialRampToValueAtTime(.01,t.currentTime+.3),a.start(t.currentTime),a.stop(t.currentTime+.3)):s==="already"?(a.frequency.setValueAtTime(440,t.currentTime),a.frequency.setValueAtTime(440,t.currentTime+.15),r.gain.setValueAtTime(.2,t.currentTime),r.gain.exponentialRampToValueAtTime(.01,t.currentTime+.35),a.start(t.currentTime),a.stop(t.currentTime+.35)):(a.type="sawtooth",a.frequency.setValueAtTime(220,t.currentTime),r.gain.setValueAtTime(.3,t.currentTime),r.gain.exponentialRampToValueAtTime(.01,t.currentTime+.3),a.start(t.currentTime),a.stop(t.currentTime+.3))}catch{}},[]),I=n.useCallback(async(s,t=null)=>{if(w.current)return;if(!c){j.error("Belum ada Event yang aktif! Pilih event terlebih dahulu.");return}const a=Date.now();if(!(s===g.current&&a-g.currentTimestamp<3e3)){w.current=!0,C(!0),H(t),g.current=s,g.currentTimestamp=a;try{const r=document.querySelector('meta[name="csrf-token"]')?.getAttribute("content")||"",d=typeof route=="function"?route("scan",void 0,!1):"/scan",h=await fetch(d,{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":r,"X-Requested-With":"XMLHttpRequest",Accept:"application/json"},body:JSON.stringify({qr_token:s})}),i=await h.json().catch(()=>({}));if(h.ok&&(i.status==="success"||i.status==="already")){b(i.status),Q(k=>k+1),i.stats&&W(i.stats);const m=i.timestamp||new Date().toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit"});p({status:i.status,message:i.message,participantName:i.participant?.nama,timestamp:m}),M(k=>[{id:Date.now(),nama:i.participant?.nama||"Peserta",nis_nip:i.participant?.nis_nip||"-",status:i.status,timestamp:m},...k.slice(0,49)])}else{b("error");const m=new Date().toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit"});p({status:"error",message:h.status===419?"Sesi scanner kedaluwarsa. Refresh halaman lalu login kembali jika diminta.":i.message||"Gagal memproses QR Code.",timestamp:m})}}catch{b("error"),p({status:"error",message:"Terjadi kesalahan jaringan. Coba lagi."})}finally{N.current=setTimeout(()=>{w.current=!1,C(!1)},1500)}}},[b,p,c,j,H]),P=async()=>{if(!c){j.error("Gagal memulai scanner: Belum ada event yang aktif!");return}A(null),f(!0),v(!0);try{const t=(await X(()=>import("./index-DaNMrLmU.js"),__vite__mapDeps([0,1,2]))).Html5Qrcode;await new Promise(r=>setTimeout(r,300));const a=new t("qr-reader");o.current=a,await a.start({facingMode:"environment"},{fps:10,aspectRatio:1},(r,d)=>{I(r,d)},()=>{}),f(!1)}catch(s){console.error("Camera Error:",s),f(!1),v(!1),A("Gagal mengakses kamera. Pastikan izin kamera sudah diberikan.")}},$=async()=>{if(o.current){try{await o.current.stop(),o.current.clear()}catch{}o.current=null}v(!1),f(!1)};n.useEffect(()=>()=>{if(o.current)try{o.current.stop()}catch{}N.current&&clearTimeout(N.current),u.current&&clearTimeout(u.current)},[]);const K=s=>{switch(s){case"success":return e.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700",children:"✓ HADIR"});case"already":return e.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700",children:"⚠ DUPLIKAT"});default:return e.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700",children:"✕ ERROR"})}},E=x.total>0?Math.round(x.hadir/x.total*100):0;return e.jsxs(F,{header:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-xl font-semibold leading-tight text-gray-800",children:"Scanner Presensi"}),e.jsx("p",{className:"text-xs text-indigo-600 font-bold mt-0.5",children:c?`Event: ${c.nama_event}`:"⚠️ Event Tidak Aktif"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[l&&e.jsxs("span",{className:"flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700",children:[e.jsx("span",{className:"h-2 w-2 animate-pulse rounded-full bg-emerald-500"}),"Kamera Aktif"]}),e.jsxs("span",{className:"rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700",children:[D," scan"]})]})]}),children:[e.jsx(U,{title:"Scanner Presensi"}),e.jsx("div",{className:"py-6 flex-1 overflow-y-auto w-full",children:e.jsxs("div",{className:"mx-auto max-w-7xl sm:px-6 lg:px-8 h-full space-y-4",children:[!c&&e.jsxs("div",{className:"rounded-2xl bg-amber-50 border border-amber-200 p-4 text-amber-900 flex items-center justify-between gap-4 shadow-sm",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("span",{className:"text-xl",children:"⚠️"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-bold",children:"Presensi terkunci karena belum ada Event Aktif."}),e.jsx("p",{className:"text-[11px] text-amber-700",children:"Admin harus memilih atau mengaktifkan event terlebih dahulu."})]})]}),e.jsx("a",{href:route("events.index"),className:"rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-amber-700 shrink-0",children:"Kelola Event"})]}),e.jsxs("div",{className:"grid grid-cols-1 gap-6 lg:grid-cols-3",children:[e.jsxs("div",{className:"lg:col-span-2 space-y-4",children:[e.jsxs("div",{className:"grid grid-cols-3 gap-3",children:[e.jsxs("div",{className:"rounded-xl bg-white p-4 shadow-md",children:[e.jsx("p",{className:"text-xs font-medium text-gray-500",children:"Total"}),e.jsx("p",{className:"text-2xl font-bold text-gray-900",children:x.total})]}),e.jsxs("div",{className:"rounded-xl bg-white p-4 shadow-md",children:[e.jsx("p",{className:"text-xs font-medium text-gray-500",children:"Hadir"}),e.jsx("p",{className:"text-2xl font-bold text-emerald-600",children:x.hadir})]}),e.jsxs("div",{className:"rounded-xl bg-white p-4 shadow-md",children:[e.jsx("div",{className:"flex items-center justify-between",children:e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-medium text-gray-500",children:"Progress"}),e.jsxs("p",{className:"text-2xl font-bold text-indigo-600",children:[E,"%"]})]})}),e.jsx("div",{className:"mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200",children:e.jsx("div",{className:"h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700",style:{width:`${E}%`}})})]})]}),e.jsxs("div",{className:"overflow-hidden rounded-2xl bg-white shadow-lg",children:[e.jsx("div",{className:"bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3",children:e.jsxs("div",{className:"flex items-center justify-between text-white",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"})}),e.jsx("span",{className:"text-sm font-semibold",children:R?"Memproses...":"Arahkan ke QR Code"})]}),R&&e.jsx("div",{className:"h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"})]})}),e.jsxs("div",{className:"p-4",children:[e.jsxs("div",{className:"relative overflow-hidden rounded-xl bg-gray-950 w-full flex items-center justify-center",style:{minHeight:l?"320px":"0px"},children:[l&&e.jsx("div",{id:"qr-reader",className:"w-full text-center"}),l&&!T&&e.jsx("div",{className:`scanner-search-overlay ${_.active?"is-locked":"is-searching"}`,"aria-hidden":"true",children:e.jsxs("div",{className:"scanner-search-box",style:_.style||void 0,children:[e.jsx("span",{className:"scanner-search-corner scanner-search-corner-tl"}),e.jsx("span",{className:"scanner-search-corner scanner-search-corner-tr"}),e.jsx("span",{className:"scanner-search-corner scanner-search-corner-bl"}),e.jsx("span",{className:"scanner-search-corner scanner-search-corner-br"}),e.jsx("span",{className:"scanner-search-line"}),e.jsx("span",{className:"scanner-lock-pulse"})]})}),l&&T&&e.jsxs("div",{className:"absolute inset-0 flex flex-col items-center justify-center bg-gray-950 text-white z-10",children:[e.jsx("div",{className:"mb-3 h-8 w-8 animate-spin rounded-full border-3 border-white/20 border-t-indigo-500"}),e.jsx("p",{className:"text-sm text-gray-400",children:"Menghubungkan ke kamera..."})]})]}),!l&&e.jsxs("div",{className:"flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-12",children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",className:"mb-4 h-16 w-16 text-gray-300",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:[e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:1,d:"M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"}),e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:1,d:"M15 13a3 3 0 11-6 0 3 3 0 016 0z"})]}),e.jsx("p",{className:"text-sm text-gray-500",children:"Kamera belum aktif"}),e.jsx("p",{className:"text-xs text-gray-600",children:"Tekan tombol di bawah untuk mulai scan"})]}),S&&e.jsx("div",{className:"mt-4 rounded-xl bg-red-50 p-4",children:e.jsxs("div",{className:"flex items-start gap-3",children:[e.jsx("svg",{className:"mt-0.5 h-5 w-5 shrink-0 text-red-500",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-medium text-red-800",children:S}),e.jsx("button",{onClick:P,className:"mt-2 text-sm font-semibold text-red-600 underline hover:text-red-700",children:"Coba lagi"})]})]})}),e.jsx("div",{className:"mt-4",children:l?e.jsxs("button",{onClick:$,className:"flex w-full items-center justify-center gap-2 rounded-xl bg-red-100 px-4 py-2.5 text-sm font-semibold text-red-700 transition-all hover:bg-red-200",children:[e.jsx("svg",{className:"h-4 w-4",fill:"currentColor",viewBox:"0 0 20 20",children:e.jsx("path",{fillRule:"evenodd",d:"M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z",clipRule:"evenodd"})}),"Hentikan Kamera"]}):e.jsxs("button",{onClick:P,className:"flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-indigo-700",children:[e.jsx("svg",{className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"})}),"Mulai Scan"]})})]})]})]}),e.jsx("div",{className:"lg:col-span-1",children:e.jsxs("div",{className:"sticky top-4 overflow-hidden rounded-2xl bg-white shadow-lg",children:[e.jsx("div",{className:"border-b border-gray-100 px-5 py-3",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("h3",{className:"text-sm font-semibold text-gray-900",children:"Riwayat Scan"}),y.length>0&&e.jsx("button",{onClick:()=>M([]),className:"text-xs font-semibold text-gray-600 hover:text-gray-900",children:"Bersihkan"})]})}),e.jsx("div",{className:"max-h-[calc(100vh-300px)] overflow-y-auto",children:y.length===0?e.jsxs("div",{className:"flex flex-col items-center justify-center py-12 text-center",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"mb-3 h-10 w-10 text-gray-200",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:1,d:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"})}),e.jsx("p",{className:"text-xs text-gray-600",children:"Belum ada scan"}),e.jsx("p",{className:"text-[10px] text-gray-500",children:"Scan QR untuk memulai"})]}):e.jsx("div",{className:"divide-y divide-gray-50",children:y.map((s,t)=>e.jsxs("div",{className:`flex items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-50 ${t===0?"bg-indigo-50/50":""}`,children:[e.jsx("div",{className:`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${s.status==="success"?"bg-emerald-100 text-emerald-600":s.status==="already"?"bg-amber-100 text-amber-600":"bg-red-100 text-red-600"}`,children:s.nama?.charAt(0)?.toUpperCase()||"?"}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("p",{className:"truncate text-sm font-medium text-gray-900",children:s.nama}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-xs text-gray-600",children:s.nis_nip}),K(s.status)]})]}),e.jsx("span",{className:"shrink-0 text-[10px] font-semibold text-gray-500",children:s.timestamp})]},s.id))})}),e.jsxs("div",{className:"border-t border-gray-100 bg-gray-50/50 px-5 py-3",children:[e.jsx("p",{className:"text-[10px] font-bold uppercase tracking-wider text-gray-600",children:"Panduan"}),e.jsxs("div",{className:"mt-1 space-y-1",children:[e.jsxs("p",{className:"flex items-center gap-1.5 text-[11px] text-gray-500",children:[e.jsx("span",{className:"h-1.5 w-1.5 rounded-full bg-emerald-500"}),"Hijau = Berhasil dicatat"]}),e.jsxs("p",{className:"flex items-center gap-1.5 text-[11px] text-gray-500",children:[e.jsx("span",{className:"h-1.5 w-1.5 rounded-full bg-amber-500"}),"Kuning = Sudah hadir sebelumnya"]}),e.jsxs("p",{className:"flex items-center gap-1.5 text-[11px] text-gray-500",children:[e.jsx("span",{className:"h-1.5 w-1.5 rounded-full bg-red-500"}),"Merah = QR tidak valid"]})]})]})]})})]})]})}),e.jsx("style",{children:`
                #qr-reader video {
                    border-radius: 12px !important;
                    width: 100% !important;
                    height: auto !important;
                    object-fit: cover !important;
                }
                #qr-reader__scan_region {
                    min-height: 280px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                #qr-reader__dashboard_section_swaplink,
                #qr-reader__status_span,
                #qr-reader__header_message {
                    display: none !important;
                }
                #qr-reader__dashboard_section {
                    padding: 0 !important;
                    display: none !important;
                }
                .scanner-search-overlay {
                    position: absolute;
                    inset: 0;
                    z-index: 5;
                    pointer-events: none;
                    overflow: hidden;
                    background:
                        radial-gradient(circle at center, transparent 0 34%, rgba(3, 7, 18, 0.18) 35% 100%);
                }
                .scanner-search-box {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    width: clamp(150px, 42%, 250px);
                    aspect-ratio: 1 / 1;
                    border: 2px solid rgba(99, 102, 241, 0.95);
                    border-radius: 18px;
                    box-shadow: 0 0 0 999px rgba(3, 7, 18, 0.12), 0 0 28px rgba(99, 102, 241, 0.45);
                    transform: translate(-50%, -50%);
                    transition: left 180ms ease, top 180ms ease, width 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
                    animation: qr-search-focus 2.4s ease-in-out infinite;
                }
                .scanner-search-line {
                    position: absolute;
                    left: 12%;
                    right: 12%;
                    top: 14%;
                    height: 3px;
                    border-radius: 999px;
                    background: linear-gradient(90deg, transparent, #22c55e, #a7f3d0, transparent);
                    box-shadow: 0 0 18px rgba(34, 197, 94, 0.9);
                    animation: qr-search-line 1.6s ease-in-out infinite;
                }
                .scanner-lock-pulse {
                    position: absolute;
                    inset: -8px;
                    border: 2px solid rgba(34, 197, 94, 0);
                    border-radius: 22px;
                    opacity: 0;
                }
                .scanner-search-overlay.is-locked .scanner-search-box {
                    width: clamp(130px, 34%, 230px);
                    border-color: rgba(34, 197, 94, 1);
                    box-shadow: 0 0 0 999px rgba(3, 7, 18, 0.24), 0 0 36px rgba(34, 197, 94, 0.75);
                    animation: qr-lock-box 420ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
                }
                .scanner-search-overlay.is-locked .scanner-search-line {
                    opacity: 0;
                    animation: none;
                }
                .scanner-search-overlay.is-locked .scanner-lock-pulse {
                    animation: qr-lock-pulse 700ms ease-out both;
                }
                .scanner-search-overlay.is-locked .scanner-search-corner {
                    border-color: #22c55e;
                    filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.9));
                }
                .scanner-search-corner {
                    position: absolute;
                    width: 28px;
                    height: 28px;
                    border-color: #ffffff;
                    filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.85));
                }
                .scanner-search-corner-tl {
                    left: -2px;
                    top: -2px;
                    border-left: 4px solid;
                    border-top: 4px solid;
                    border-top-left-radius: 18px;
                }
                .scanner-search-corner-tr {
                    right: -2px;
                    top: -2px;
                    border-right: 4px solid;
                    border-top: 4px solid;
                    border-top-right-radius: 18px;
                }
                .scanner-search-corner-bl {
                    left: -2px;
                    bottom: -2px;
                    border-left: 4px solid;
                    border-bottom: 4px solid;
                    border-bottom-left-radius: 18px;
                }
                .scanner-search-corner-br {
                    right: -2px;
                    bottom: -2px;
                    border-right: 4px solid;
                    border-bottom: 4px solid;
                    border-bottom-right-radius: 18px;
                }
                @keyframes qr-search-focus {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
                    50% { transform: translate(-50%, -50%) scale(0.96); opacity: 1; }
                }
                @keyframes qr-lock-box {
                    0% { transform: translate(-50%, -50%) scale(1.18); opacity: 0.45; }
                    70% { transform: translate(-50%, -50%) scale(0.92); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
                @keyframes qr-search-line {
                    0%, 100% { top: 14%; opacity: 0.45; }
                    50% { top: 84%; opacity: 1; }
                }
                @keyframes qr-lock-pulse {
                    0% { transform: scale(0.9); border-color: rgba(34, 197, 94, 0.75); opacity: 1; }
                    100% { transform: scale(1.18); border-color: rgba(34, 197, 94, 0); opacity: 0; }
                }
            `})]})}export{ee as default};
