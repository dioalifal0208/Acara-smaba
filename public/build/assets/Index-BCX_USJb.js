const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-Ccr61knf.js","assets/app-D9Y5AOJx.js","assets/app-DIB5KseS.css"])))=>i.map(i=>d[i]);
import{d as U,b as X,r as a,j as e,H as J,_ as Y}from"./app-D9Y5AOJx.js";import{A as Z}from"./AuthenticatedLayout-B9QLB7kI.js";import"./transition-B90vetZR.js";function se({initialStats:z,activeEvent:F}){const{toast:j,addToast:p}=U(),{activeEvent:W}=X().props,o=F||W,[x,B]=a.useState(z),[c,y]=a.useState(!1),[_,g]=a.useState(!1),[S,L]=a.useState(null),[v,A]=a.useState([]),[C,M]=a.useState(!1),[D,Q]=a.useState(0),[q,R]=a.useState({active:!1,style:null}),[$,f]=a.useState(!0),l=a.useRef(null),k=a.useRef(!1),b=a.useRef(""),N=a.useRef(null),u=a.useRef(null),E=a.useCallback(r=>{const t=r?.result?.bounds,s=document.querySelector("#qr-reader video");if(!t||!s)return null;const n=s.videoWidth||s.clientWidth,d=s.videoHeight||s.clientHeight;if(!n||!d)return null;const h=Math.min(Math.max(t.width/n*100,26),62),i=Math.min(Math.max((t.x+t.width/2)/n*100,18),82),m=Math.min(Math.max((t.y+t.height/2)/d*100,18),82);return{left:`${i}%`,top:`${m}%`,width:`${h}%`}},[]),H=a.useCallback(r=>{u.current&&clearTimeout(u.current),R({active:!0,style:E(r)}),u.current=setTimeout(()=>{R({active:!1,style:null})},1200)},[E]),w=a.useCallback(r=>{try{const t=new(window.AudioContext||window.webkitAudioContext),s=t.createOscillator(),n=t.createGain();s.connect(n),n.connect(t.destination),r==="success"?(s.frequency.setValueAtTime(587.33,t.currentTime),s.frequency.setValueAtTime(880,t.currentTime+.1),n.gain.setValueAtTime(.2,t.currentTime),n.gain.exponentialRampToValueAtTime(.01,t.currentTime+.3),s.start(t.currentTime),s.stop(t.currentTime+.3)):r==="already"?(s.frequency.setValueAtTime(440,t.currentTime),s.frequency.setValueAtTime(440,t.currentTime+.15),n.gain.setValueAtTime(.2,t.currentTime),n.gain.exponentialRampToValueAtTime(.01,t.currentTime+.35),s.start(t.currentTime),s.stop(t.currentTime+.35)):(s.type="sawtooth",s.frequency.setValueAtTime(220,t.currentTime),n.gain.setValueAtTime(.3,t.currentTime),n.gain.exponentialRampToValueAtTime(.01,t.currentTime+.3),s.start(t.currentTime),s.stop(t.currentTime+.3))}catch{}},[]),I=a.useCallback(async(r,t=null)=>{if(k.current)return;if(!o){j.error("Belum ada Event yang aktif! Pilih event terlebih dahulu.");return}const s=Date.now();if(!(r===b.current&&s-b.currentTimestamp<3e3)){k.current=!0,M(!0),H(t),b.current=r,b.currentTimestamp=s;try{const n=document.querySelector('meta[name="csrf-token"]')?.getAttribute("content")||"",d=typeof route=="function"?route("scan",void 0,!1):"/scan",h=await fetch(d,{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":n,"X-Requested-With":"XMLHttpRequest",Accept:"application/json"},body:JSON.stringify({qr_token:r})}),i=await h.json().catch(()=>({}));if(h.ok&&(i.status==="success"||i.status==="already")){w(i.status),Q(T=>T+1),i.stats&&B(i.stats);const m=i.timestamp||new Date().toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit"});p({status:i.status,message:i.message,participantName:i.participant?.nama,timestamp:m}),A(T=>[{id:Date.now(),nama:i.participant?.nama||"Peserta",nis_nip:i.participant?.nis_nip||"-",status:i.status,timestamp:m},...T.slice(0,49)])}else{w("error");const m=new Date().toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit"});p({status:"error",message:h.status===419?"Sesi scanner kedaluwarsa. Refresh halaman lalu login kembali jika diminta.":i.message||"Gagal memproses QR Code.",timestamp:m})}}catch{w("error"),p({status:"error",message:"Terjadi kesalahan jaringan. Coba lagi."})}finally{N.current=setTimeout(()=>{k.current=!1,M(!1)},1500)}}},[w,p,o,j,H]),P=async()=>{if(!o){j.error("Gagal memulai scanner: Belum ada event yang aktif!");return}L(null),g(!0),y(!0);try{const t=(await Y(()=>import("./index-Ccr61knf.js"),__vite__mapDeps([0,1,2]))).Html5Qrcode;await new Promise(n=>setTimeout(n,300));const s=new t("qr-reader");l.current=s,await s.start({facingMode:"environment"},{fps:10},(n,d)=>{I(n,d)},()=>{}),g(!1)}catch(r){console.error("Camera Error:",r),g(!1),y(!1),L("Gagal mengakses kamera. Pastikan izin kamera sudah diberikan.")}},K=async()=>{if(l.current){try{await l.current.stop(),l.current.clear()}catch{}l.current=null}y(!1),g(!1)};a.useEffect(()=>{const r=()=>{const t=document.fullscreenElement!=null||Math.abs(window.innerHeight-window.screen.height)<5;f(!t)};return r(),window.addEventListener("resize",r),document.addEventListener("fullscreenchange",r),()=>{window.removeEventListener("resize",r),document.removeEventListener("fullscreenchange",r)}},[]);const O=()=>{document.documentElement.requestFullscreen?document.documentElement.requestFullscreen().catch(r=>{console.warn(`Fullscreen error: ${r.message}`),f(!1)}):f(!1)};a.useEffect(()=>()=>{if(l.current)try{l.current.stop()}catch{}N.current&&clearTimeout(N.current),u.current&&clearTimeout(u.current)},[]);const G=r=>{switch(r){case"success":return e.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700",children:"✓ HADIR"});case"already":return e.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700",children:"⚠ DUPLIKAT"});default:return e.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700",children:"✕ ERROR"})}},V=x.total>0?Math.round(x.hadir/x.total*100):0;return e.jsxs(Z,{header:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-xl font-semibold leading-tight text-gray-800",children:"Scanner Presensi"}),e.jsx("p",{className:"text-xs text-indigo-600 font-bold mt-0.5",children:o?`Event: ${o.nama_event}`:"⚠️ Event Tidak Aktif"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[c&&e.jsxs("span",{className:"flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm border border-emerald-200",children:[e.jsx("span",{className:"h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.8)]"}),"Kamera Aktif"]}),e.jsxs("span",{className:"rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm border border-indigo-100",children:[D," scan"]})]})]}),children:[e.jsx(J,{title:"Scanner Presensi"}),$&&e.jsx("div",{className:"fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-md p-6",children:e.jsxs("div",{className:"w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl text-center transform transition-all",children:[e.jsx("div",{className:"mx-auto w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-10 w-10 text-indigo-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"})})}),e.jsx("h2",{className:"text-2xl font-black text-gray-800 mb-3",children:"Mode Fullscreen"}),e.jsxs("p",{className:"text-gray-500 text-sm mb-8 leading-relaxed",children:["Demi kenyamanan dan agar seluruh antarmuka scanner terlihat sempurna tanpa terpotong, silakan masuk ke mode layar penuh (Fullscreen) atau tekan tombol ",e.jsx("kbd",{className:"bg-gray-100 border border-gray-300 rounded px-2 py-0.5 text-xs font-mono font-bold text-gray-700",children:"F11"}),"."]}),e.jsxs("div",{className:"flex flex-col gap-3",children:[e.jsx("button",{onClick:O,className:"w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95",children:"Masuk Fullscreen Sekarang"}),e.jsx("button",{onClick:()=>f(!1),className:"w-full bg-white hover:bg-gray-50 text-gray-500 font-bold py-3 px-6 rounded-xl transition-all text-xs",children:"Lanjutkan tanpa Fullscreen"})]})]})}),e.jsxs("div",{className:"p-4 sm:p-6 w-full max-w-7xl mx-auto flex flex-col gap-4 lg:gap-6 min-h-[calc(100vh-100px)]",children:[!o&&e.jsxs("div",{className:"rounded-xl bg-amber-50 border border-amber-200 p-4 text-amber-900 flex items-center justify-between gap-4 shadow-sm shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("span",{className:"text-2xl",children:"⚠️"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-bold",children:"Presensi terkunci karena belum ada Event Aktif."}),e.jsx("p",{className:"text-xs text-amber-700 mt-0.5",children:"Admin harus memilih atau mengaktifkan event terlebih dahulu."})]})]}),e.jsx("a",{href:route("events.index"),className:"rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-amber-700 shrink-0 transition-colors",children:"Kelola Event"})]}),e.jsxs("div",{className:"shrink-0 flex flex-wrap sm:flex-nowrap items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-gray-100 gap-4 sm:gap-6",children:[e.jsxs("div",{className:"flex items-center gap-6 px-2 w-full sm:w-auto justify-around sm:justify-start",children:[e.jsxs("div",{className:"text-center sm:text-left",children:[e.jsx("p",{className:"text-[11px] font-bold uppercase tracking-wider text-gray-400",children:"Total Peserta"}),e.jsx("p",{className:"text-2xl font-black text-gray-800 leading-none mt-1",children:x.total})]}),e.jsx("div",{className:"w-px h-10 bg-gray-200 hidden sm:block"}),e.jsxs("div",{className:"text-center sm:text-left",children:[e.jsx("p",{className:"text-[11px] font-bold uppercase tracking-wider text-gray-400",children:"Telah Hadir"}),e.jsx("p",{className:"text-2xl font-black text-emerald-600 leading-none mt-1",children:x.hadir})]})]}),e.jsx("div",{className:"w-px h-10 bg-gray-200 hidden sm:block"}),e.jsxs("div",{className:"flex-1 px-2 w-full sm:w-auto",children:[e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[e.jsx("p",{className:"text-[11px] font-bold uppercase tracking-wider text-gray-400",children:"Progress Presensi"}),e.jsxs("p",{className:"text-sm font-black text-indigo-600",children:[V,"%"]})]}),e.jsx("div",{className:"h-2.5 w-full overflow-hidden rounded-full bg-gray-100 shadow-inner",children:e.jsx("div",{className:"h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-out",style:{width:`${V}%`}})})]})]}),e.jsxs("div",{className:"flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1.618fr_1fr] gap-4 lg:gap-6 items-stretch",children:[e.jsxs("div",{className:"overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 flex flex-col h-full",children:[e.jsxs("div",{className:"bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center justify-between shrink-0",children:[e.jsxs("div",{className:"flex items-center gap-2 text-white",children:[e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5 opacity-90",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:[e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"}),e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15 13a3 3 0 11-6 0 3 3 0 016 0z"})]}),e.jsx("span",{className:"text-sm font-bold tracking-wide",children:C?"Memproses QR...":"Kamera Scanner"})]}),C&&e.jsx("div",{className:"h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"})]}),e.jsxs("div",{className:"p-4 flex flex-col gap-4",children:[e.jsxs("div",{className:"relative overflow-hidden rounded-xl bg-gray-950 w-full aspect-[4/3] lg:aspect-video flex items-center justify-center transition-all duration-300 shadow-inner",children:[c&&e.jsx("div",{id:"qr-reader",className:"w-full h-full absolute inset-0 flex items-center justify-center"}),c&&!_&&e.jsx("div",{className:`scanner-search-overlay ${q.active?"is-locked":"is-searching"}`,"aria-hidden":"true",children:e.jsxs("div",{className:"scanner-search-box",style:q.style||void 0,children:[e.jsx("span",{className:"scanner-search-corner scanner-search-corner-tl"}),e.jsx("span",{className:"scanner-search-corner scanner-search-corner-tr"}),e.jsx("span",{className:"scanner-search-corner scanner-search-corner-bl"}),e.jsx("span",{className:"scanner-search-corner scanner-search-corner-br"}),e.jsx("span",{className:"scanner-search-line"}),e.jsx("span",{className:"scanner-lock-pulse"})]})}),c&&_&&e.jsxs("div",{className:"absolute inset-0 flex flex-col items-center justify-center bg-gray-950/80 text-white z-10 backdrop-blur-sm",children:[e.jsx("div",{className:"mb-4 h-10 w-10 animate-spin rounded-full border-3 border-white/20 border-t-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"}),e.jsx("p",{className:"text-sm text-gray-200 font-medium tracking-wide animate-pulse",children:"Menghubungkan ke kamera..."})]}),!c&&e.jsxs("div",{className:"flex flex-col items-center justify-center py-6 text-gray-500 absolute inset-0",children:[e.jsx("div",{className:"w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-3",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-8 w-8 text-gray-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:[e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:1.5,d:"M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"}),e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:1.5,d:"M15 13a3 3 0 11-6 0 3 3 0 016 0z"})]})}),e.jsx("p",{className:"text-sm font-semibold text-gray-400",children:"Kamera Offline"}),e.jsx("p",{className:"text-xs text-gray-500 mt-1",children:"Klik tombol di bawah untuk memulai"})]})]}),S&&e.jsx("div",{className:"shrink-0 rounded-lg bg-red-50 p-3 border border-red-100",children:e.jsxs("div",{className:"flex items-start gap-3",children:[e.jsx("svg",{className:"mt-0.5 h-4 w-4 shrink-0 text-red-500",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-medium text-red-800",children:S}),e.jsx("button",{onClick:P,className:"mt-1 text-xs font-bold text-red-600 hover:text-red-700 underline",children:"Coba akses lagi"})]})]})}),e.jsx("div",{className:"shrink-0",children:c?e.jsxs("button",{onClick:K,className:"flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-100 border border-red-100 shadow-sm",children:[e.jsx("svg",{className:"h-5 w-5",fill:"currentColor",viewBox:"0 0 20 20",children:e.jsx("path",{fillRule:"evenodd",d:"M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z",clipRule:"evenodd"})}),"Hentikan Kamera"]}):e.jsxs("button",{onClick:P,className:"flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-[0.99]",children:[e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"})}),"Mulai Scan QR Code"]})})]})]}),e.jsxs("div",{className:"flex flex-col h-[450px] lg:h-full rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden",children:[e.jsxs("div",{className:"bg-white border-b border-gray-100 px-5 py-3.5 shrink-0 flex items-center justify-between z-10",children:[e.jsx("h3",{className:"text-sm font-bold text-gray-800",children:"Riwayat Scan"}),v.length>0&&e.jsx("button",{onClick:()=>A([]),className:"text-[11px] font-bold text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors",children:"Bersihkan"})]}),e.jsx("div",{className:"flex-1 overflow-y-auto bg-gray-50/50 min-h-0 h-0",children:v.length===0?e.jsxs("div",{className:"flex flex-col items-center justify-center h-full text-center px-6 py-10",children:[e.jsx("div",{className:"w-16 h-16 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-4",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-8 w-8 text-gray-300",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:1.5,d:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"})})}),e.jsx("p",{className:"text-sm font-bold text-gray-600",children:"Belum ada riwayat"}),e.jsx("p",{className:"text-[11px] text-gray-400 mt-1 leading-relaxed",children:"Hasil scan presensi akan muncul di sini."})]}):e.jsx("div",{className:"divide-y divide-gray-100",children:v.map((r,t)=>e.jsxs("div",{className:`flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white ${t===0?"bg-indigo-50/30":""}`,children:[e.jsx("div",{className:`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm ${r.status==="success"?"bg-emerald-100 text-emerald-700 border border-emerald-200":r.status==="already"?"bg-amber-100 text-amber-700 border border-amber-200":"bg-red-100 text-red-700 border border-red-200"}`,children:r.nama?.charAt(0)?.toUpperCase()||"?"}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("p",{className:"truncate text-[13px] font-bold text-gray-900",children:r.nama}),e.jsxs("div",{className:"flex items-center gap-2 mt-0.5",children:[e.jsx("span",{className:"text-[11px] text-gray-500 font-medium",children:r.nis_nip}),G(r.status)]})]}),e.jsx("div",{className:"shrink-0",children:e.jsx("span",{className:"text-[10px] font-bold text-gray-400 bg-white border border-gray-100 px-1.5 py-1 rounded shadow-sm",children:r.timestamp})})]},r.id))})}),e.jsx("div",{className:"bg-white border-t border-gray-100 px-5 py-3 shrink-0 z-10",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("p",{className:"flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500",children:[e.jsx("span",{className:"h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.6)]"}),"Berhasil"]}),e.jsxs("p",{className:"flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500",children:[e.jsx("span",{className:"h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.6)]"}),"Duplikat"]}),e.jsxs("p",{className:"flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500",children:[e.jsx("span",{className:"h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.6)]"}),"Gagal"]})]})})]})]})]}),e.jsx("style",{children:`
                /* Ensure Html5Qrcode video respects wrapper height and avoids scroll */
                #qr-reader {
                    position: absolute !important;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: transparent;
                    border: none !important;
                    width: 100% !important;
                    height: 100% !important;
                }
                #qr-reader__scan_region {
                    width: 100% !important;
                    height: 100% !important;
                    min-height: unset !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    overflow: hidden !important;
                }
                #qr-reader video {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                    border-radius: 0 !important;
                    margin: 0 !important;
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

                /* Scanner Overlays */
                .scanner-search-overlay {
                    position: absolute;
                    inset: 0;
                    z-index: 5;
                    pointer-events: none;
                    overflow: hidden;
                    background: radial-gradient(circle at center, transparent 0 32%, rgba(3, 7, 18, 0.3) 33% 100%);
                }
                .scanner-search-box {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    width: min(280px, 60%);
                    aspect-ratio: 1 / 1;
                    max-height: 80%;
                    border: 2px solid rgba(99, 102, 241, 0.95);
                    border-radius: 16px;
                    box-shadow: 0 0 0 999px rgba(3, 7, 18, 0.15), 0 0 24px rgba(99, 102, 241, 0.45);
                    transform: translate(-50%, -50%);
                    transition: all 180ms ease;
                    animation: qr-search-focus 2.4s ease-in-out infinite;
                }
                .scanner-search-line {
                    position: absolute;
                    left: 12%;
                    right: 12%;
                    top: 14%;
                    height: 2px;
                    border-radius: 999px;
                    background: linear-gradient(90deg, transparent, #22c55e, #a7f3d0, transparent);
                    box-shadow: 0 0 12px rgba(34, 197, 94, 0.9);
                    animation: qr-search-line 1.6s ease-in-out infinite;
                }
                .scanner-lock-pulse {
                    position: absolute;
                    inset: -6px;
                    border: 2px solid rgba(34, 197, 94, 0);
                    border-radius: 20px;
                    opacity: 0;
                }
                .scanner-search-overlay.is-locked .scanner-search-box {
                    width: min(260px, 55%);
                    border-color: rgba(34, 197, 94, 1);
                    box-shadow: 0 0 0 999px rgba(3, 7, 18, 0.25), 0 0 28px rgba(34, 197, 94, 0.75);
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
                    filter: drop-shadow(0 0 6px rgba(34, 197, 94, 0.9));
                }
                .scanner-search-corner {
                    position: absolute;
                    width: 24px;
                    height: 24px;
                    border-color: #ffffff;
                    filter: drop-shadow(0 0 6px rgba(99, 102, 241, 0.85));
                }
                .scanner-search-corner-tl {
                    left: -2px;
                    top: -2px;
                    border-left: 3px solid;
                    border-top: 3px solid;
                    border-top-left-radius: 16px;
                }
                .scanner-search-corner-tr {
                    right: -2px;
                    top: -2px;
                    border-right: 3px solid;
                    border-top: 3px solid;
                    border-top-right-radius: 16px;
                }
                .scanner-search-corner-bl {
                    left: -2px;
                    bottom: -2px;
                    border-left: 3px solid;
                    border-bottom: 3px solid;
                    border-bottom-left-radius: 16px;
                }
                .scanner-search-corner-br {
                    right: -2px;
                    bottom: -2px;
                    border-right: 3px solid;
                    border-bottom: 3px solid;
                    border-bottom-right-radius: 16px;
                }
                @keyframes qr-search-focus {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
                    50% { transform: translate(-50%, -50%) scale(0.97); opacity: 1; }
                }
                @keyframes qr-lock-box {
                    0% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.5; }
                    70% { transform: translate(-50%, -50%) scale(0.95); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
                @keyframes qr-search-line {
                    0%, 100% { top: 14%; opacity: 0.3; }
                    50% { top: 84%; opacity: 1; }
                }
                @keyframes qr-lock-pulse {
                    0% { transform: scale(0.9); border-color: rgba(34, 197, 94, 0.8); opacity: 1; }
                    100% { transform: scale(1.15); border-color: rgba(34, 197, 94, 0); opacity: 0; }
                }
            `})]})}export{se as default};
