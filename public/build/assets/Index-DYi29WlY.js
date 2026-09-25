import{d as ke,a as Ne,r as o,j as e,e as Q,b as Me,u as Pe,H as ze,f as ie}from"./app-CwJpzi8_.js";import{A as De}from"./AuthenticatedLayout-CK3TXizn.js";import{M as we}from"./Modal-CW9pFg4R.js";import{S as je}from"./SecondaryButton-D0kec25N.js";import{I as W}from"./InputError-DrmHUCwz.js";import{P as $e}from"./PrimaryButton-DFEaf7-O.js";import{I as le}from"./InputLabel-C9B-Swyg.js";import{T as fe}from"./TextInput-DNUSoK_X.js";import"./transition-S-Ybi5Eu.js";const ye=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"],Be=["Min","Sen","Sel","Rab","Kam","Jum","Sab"];function Ie({show:A=!1,onClose:H=()=>{},workcode:r=null,participants:g=[],initialParticipant:K=null,onAttendanceChanged:V=()=>{}}){const{toast:y}=ke(),Z=Ne(),[x,C]=o.useState(null),[T,M]=o.useState(""),[oe,P]=o.useState(!1),k=new Date,[u,N]=o.useState(k.getFullYear()),[m,w]=o.useState(k.getMonth()),[J,E]=o.useState([]),[de,z]=o.useState(!1),[Y,xe]=o.useState({});o.useEffect(()=>{(async()=>{try{const a=await Q.get("/api/holidays");xe(a.data||{})}catch(a){console.error("Gagal memuat data hari libur:",a)}})()},[]);const[l,F]=o.useState(null),[b,_]=o.useState({id:null,workcode_id:r?.id||"",participant_id:"",tanggal:"",jam_masuk:"07:00",jam_pulang:"15:30",status:"hadir"}),[h,X]=o.useState(!1),[D,O]=o.useState({});o.useEffect(()=>{A&&(K?(C(K),M("")):g.length>0&&!x&&C(g[0]))},[A,K]);const U=async s=>{if(!(!r||!s)){z(!0);try{const a=await Q.get(`/report/individual/${r.id}/${s}`);E(a.data.attendances||[])}catch(a){console.error("Gagal mengambil data presensi:",a),y.error("Gagal memuat data presensi kalender.")}finally{z(!1)}}};o.useEffect(()=>{A&&x&&r&&U(x.id)},[A,x?.id,r?.id]);const $=o.useMemo(()=>{if(!T.trim())return g;const s=T.toLowerCase();return g.filter(a=>(a.nama||"").toLowerCase().includes(s)||a.nis_nip&&a.nis_nip.toLowerCase().includes(s))},[g,T]),ee=o.useMemo(()=>{const s={};return J.forEach(a=>{a.tanggal&&(s[a.tanggal]=a)}),s},[J]),ce=()=>{m===0?(w(11),N(s=>s-1)):w(s=>s-1)},te=()=>{m===11?(w(0),N(s=>s+1)):w(s=>s+1)},G=()=>{N(k.getFullYear()),w(k.getMonth())},q=o.useMemo(()=>{const s=new Date(u,m,1).getDay(),a=new Date(u,m+1,0).getDate(),t=new Date(u,m,0).getDate(),n=[];for(let i=s-1;i>=0;i--){const R=t-i,f=m===0?11:m-1,L=`${m===0?u-1:u}-${String(f+1).padStart(2,"0")}-${String(R).padStart(2,"0")}`;n.push({dayNumber:R,dateStr:L,isCurrentMonth:!1,isWeekend:!1})}for(let i=1;i<=a;i++){const R=new Date(u,m,i),f=`${u}-${String(m+1).padStart(2,"0")}-${String(i).padStart(2,"0")}`,S=R.getDay(),L=S===0||S===6,he=!!Y[f],ue=Y[f]||null,ge=k.getFullYear()===u&&k.getMonth()===m&&k.getDate()===i;n.push({dayNumber:i,dateStr:f,isCurrentMonth:!0,isWeekend:L,isHoliday:he,holidayName:ue,isToday:ge,dayOfWeek:S,attendance:ee[f]||null})}const p=n.length,v=(p<=35?35:42)-p;for(let i=1;i<=v;i++){const R=m===11?0:m+1,S=`${m===11?u+1:u}-${String(R+1).padStart(2,"0")}-${String(i).padStart(2,"0")}`;n.push({dayNumber:i,dateStr:S,isCurrentMonth:!1,isWeekend:!1})}return n},[u,m,ee,Y]),j=o.useMemo(()=>{let s=0,a=0,t=0,n=0,p=0,c=0;const v=`${u}-${String(m+1).padStart(2,"0")}`;return J.forEach(i=>{i.tanggal&&i.tanggal.startsWith(v)&&(i.status==="hadir"?s++:i.status==="izin"?a++:i.status==="sakit"?t++:i.status==="alpha"?n++:i.status==="lupa_absen"?p++:i.status==="libur"&&c++)}),{hadir:s,izin:a,sakit:t,alpha:n,lupaAbsen:p,libur:c}},[J,u,m]),pe=s=>{if(!s.isCurrentMonth)return;const t=new Date(s.dateStr).toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"}),n=s.attendance;_(n?{id:n.id,workcode_id:r.id,participant_id:x.id,tanggal:s.dateStr,jam_masuk:n.jam_masuk||"",jam_pulang:n.jam_pulang||"",status:n.status||"hadir"}:{id:null,workcode_id:r.id,participant_id:x.id,tanggal:s.dateStr,jam_masuk:"07:00",jam_pulang:"15:30",status:"hadir"}),O({}),F({dateStr:s.dateStr,dateFormatted:t,existingAttendance:n})},se=async s=>{s.preventDefault(),X(!0),O({});try{if(b.id){const a=await Q.put(route("admin.attendances.update",b.id),b);y.success(a.data?.message||"Presensi berhasil diperbarui.")}else{const a=await Q.post(route("admin.attendances.store"),b);y.success(a.data?.message||"Presensi berhasil disimpan.")}F(null),await U(x.id),V()}catch(a){console.error("Gagal menyimpan presensi:",a),a.response?.data?.errors&&O(a.response.data.errors),y.error(a.response?.data?.message||"Gagal menyimpan data presensi.")}finally{X(!1)}},me=async()=>{if(!l?.existingAttendance)return;if(await Z({title:"Hapus Log Presensi",message:`Apakah Anda yakin ingin menghapus catatan presensi untuk ${x?.nama} pada tanggal ${l.dateFormatted}? Status hari tersebut akan direset.`,type:"danger",confirmText:"Ya, Hapus Data",cancelText:"Batal"}))try{const a=await Q.delete(route("admin.attendances.destroy",l.existingAttendance.id));y.success(a.data?.message||"Presensi berhasil dihapus."),F(null),await U(x.id),V()}catch(a){console.error("Gagal menghapus presensi:",a),y.error(a.response?.data?.message||"Gagal menghapus data presensi.")}};return e.jsxs(we,{show:A,onClose:H,maxWidth:"5xl",closeable:!1,children:[e.jsxs("div",{className:"p-5 sm:p-7 flex flex-col max-h-[92vh] overflow-y-auto",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-slate-100 pb-3",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"})})}),e.jsxs("div",{children:[e.jsxs("h3",{className:"text-base font-extrabold text-slate-800 flex items-center gap-2",children:["Kalender Presensi Peserta",r&&e.jsx("span",{className:"text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100",children:r.nama_workcode})]}),e.jsx("p",{className:"text-xs text-slate-500 font-medium",children:"Klik kotak tanggal pada kalender untuk menambah, mengedit, atau menghapus presensi."})]})]}),e.jsx("button",{type:"button",onClick:H,className:"rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]}),e.jsxs("div",{className:"mt-3.5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center flex-1",children:[e.jsxs("div",{className:"relative flex-1 sm:max-w-xs",children:[e.jsxs("div",{className:"relative",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"})}),e.jsx("input",{type:"text",placeholder:"Cari nama peserta / NIP...",value:T,onChange:s=>{M(s.target.value),P(!0)},onFocus:()=>P(!0),className:"w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-7 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium shadow-xs"}),T&&e.jsx("button",{type:"button",onClick:()=>M(""),className:"absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs",children:"✕"})]}),oe&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0 z-20",onClick:()=>P(!1)}),e.jsx("div",{className:"absolute left-0 right-0 top-full mt-1.5 z-30 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl py-1",children:$.length===0?e.jsx("div",{className:"px-4 py-3 text-xs text-slate-500 text-center font-medium",children:"Tidak ada peserta ditemukan."}):$.map(s=>e.jsxs("button",{type:"button",onClick:()=>{C(s),M(""),P(!1)},className:`w-full px-3.5 py-1.5 text-left text-xs flex items-center justify-between hover:bg-indigo-50/70 transition-colors ${x?.id===s.id?"bg-indigo-50 text-indigo-700 font-bold":"text-slate-700"}`,children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700",children:(s.nama||"").charAt(0).toUpperCase()}),e.jsxs("div",{children:[e.jsx("p",{className:"font-bold text-slate-800 leading-tight",children:s.nama}),e.jsxs("p",{className:"text-[9px] text-slate-500 font-mono",children:["NIP: ",s.nis_nip||"-"]})]})]}),e.jsx("span",{className:"text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold",children:s.status||"-"})]},s.id))})]})]}),x&&e.jsxs("div",{className:"flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200/90 shadow-xs shrink-0",children:[e.jsx("div",{className:"flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-extrabold text-white",children:(x.nama||"").charAt(0).toUpperCase()}),e.jsxs("div",{className:"leading-tight",children:[e.jsx("p",{className:"text-xs font-extrabold text-slate-800",children:x.nama}),e.jsxs("p",{className:"text-[10px] text-slate-500 font-medium",children:["NIP: ",e.jsx("span",{className:"font-mono",children:x.nis_nip||"-"})," • ",x.status||"-"]})]})]})]}),e.jsxs("div",{className:"flex items-center justify-between sm:justify-end gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200/90 shadow-xs shrink-0",children:[e.jsx("button",{type:"button",onClick:ce,className:"flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors",title:"Bulan Sebelumnya",children:"❮"}),e.jsxs("h4",{className:"text-xs font-extrabold text-slate-800 px-2 min-w-[130px] text-center",children:[ye[m]," ",u]}),e.jsx("button",{type:"button",onClick:te,className:"flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors",title:"Bulan Berikutnya",children:"❯"}),e.jsx("button",{type:"button",onClick:G,className:"ml-1 px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors",children:"Bulan Ini"})]})]}),e.jsxs("div",{className:"mt-3 bg-white rounded-2xl border border-slate-200 p-2.5 shadow-xs",children:[e.jsx("div",{className:"grid grid-cols-7 gap-1 sm:gap-1.5 mb-1 sm:mb-1.5 text-center",children:Be.map((s,a)=>e.jsxs("div",{className:`py-1 text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider rounded-lg ${a===0||a===6?"text-red-500 bg-red-50/60":"text-slate-500 bg-slate-50"}`,children:[e.jsx("span",{className:"sm:hidden",children:s.charAt(0)}),e.jsx("span",{className:"hidden sm:inline",children:s})]},a))}),de?e.jsxs("div",{className:"py-16 text-center text-xs font-semibold text-slate-500 flex flex-col items-center gap-2",children:[e.jsx("div",{className:"h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"}),"Memuat data kalender presensi..."]}):e.jsx("div",{className:"grid grid-cols-7 gap-1 sm:gap-1.5",children:q.map((s,a)=>{const t=s.attendance,n=s.isCurrentMonth;return e.jsxs("div",{onClick:()=>n&&pe(s),className:`group min-h-[44px] sm:min-h-[64px] rounded-xl p-0.5 sm:p-1.5 flex flex-col justify-between transition-all select-none ${n?"border border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer "+(s.isToday?"bg-indigo-50/20 ring-2 ring-indigo-500/30":"bg-white hover:bg-slate-50/50"):"bg-slate-50/40 text-slate-300 border border-transparent cursor-not-allowed opacity-30"}`,children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-1.5 min-w-0",children:[e.jsx("span",{title:s.holidayName||"",className:`text-xs font-bold leading-none shrink-0 ${n?s.isToday?"flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white font-black text-[10px]":s.isWeekend||s.isHoliday?"text-red-500":"text-slate-700":"text-slate-300"}`,children:s.dayNumber}),n&&s.isHoliday&&e.jsx("span",{className:"text-[8px] font-bold text-red-600 bg-red-50 border border-red-100 px-1 rounded truncate max-w-[45px] sm:max-w-[70px]",title:s.holidayName,children:s.holidayName})]}),n&&!t&&e.jsx("span",{className:"text-[10px] text-slate-300 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold shrink-0",children:"+"})]}),n&&t&&e.jsxs("div",{className:"mt-1 flex flex-col gap-0.5",children:[t.status==="hadir"&&e.jsxs("div",{className:"rounded-md bg-emerald-50 border border-emerald-200 px-1 py-0.5 text-center",children:[e.jsx("span",{className:"text-[9px] font-black text-emerald-700 block leading-tight",children:"✓ HADIR"}),(t.jam_masuk||t.jam_pulang)&&e.jsxs("span",{className:"text-[8px] font-medium text-emerald-600 block leading-tight font-mono",children:[t.jam_masuk||"–"," - ",t.jam_pulang||"–"]})]}),t.status==="alpha"&&e.jsx("div",{className:"rounded-md bg-red-50 border border-red-200 px-1 py-0.5 text-center",children:e.jsx("span",{className:"text-[9px] font-black text-red-700 block leading-tight",children:"✗ ALPHA"})}),t.status==="izin"&&e.jsx("div",{className:"rounded-md bg-amber-50 border border-amber-200 px-1 py-0.5 text-center",children:e.jsx("span",{className:"text-[9px] font-black text-amber-700 block leading-tight",children:"! IZIN"})}),t.status==="sakit"&&e.jsx("div",{className:"rounded-md bg-blue-50 border border-blue-200 px-1 py-0.5 text-center",children:e.jsx("span",{className:"text-[9px] font-black text-blue-700 block leading-tight",children:"+ SAKIT"})}),t.status==="lupa_absen"&&e.jsx("div",{className:"rounded-md bg-slate-100 border border-slate-300 px-1 py-0.5 text-center",children:e.jsx("span",{className:"text-[9px] font-black text-slate-700 block leading-tight",children:"? LUPA ABSEN"})}),t.status==="libur"&&e.jsx("div",{className:"rounded-md bg-rose-50 border border-rose-200 px-1 py-0.5 text-center",children:e.jsx("span",{className:"text-[9px] font-black text-rose-700 block leading-tight",children:"★ LIBUR"})})]}),n&&!t&&e.jsx("div",{className:"h-3 flex items-center justify-center",children:e.jsx("span",{className:"text-[9px] text-slate-300 font-medium group-hover:hidden",children:"-"})})]},a)})})]}),e.jsxs("div",{className:"mt-3.5 flex flex-wrap items-center justify-between gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200",children:[e.jsxs("div",{className:"flex flex-wrap items-center gap-3 sm:gap-5 text-xs",children:[e.jsxs("span",{className:"text-[11px] font-bold text-slate-500 uppercase tracking-wider",children:["Rekap ",ye[m],":"]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-emerald-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-emerald-500"})," Hadir: ",j.hadir]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-amber-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-amber-500"})," Izin: ",j.izin]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-blue-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-blue-500"})," Sakit: ",j.sakit]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-red-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-red-500"})," Alpha: ",j.alpha]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-slate-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-slate-400"})," Lupa Absen: ",j.lupaAbsen]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-rose-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-rose-500"})," Libur: ",j.libur]})]}),e.jsx(je,{onClick:H,className:"text-xs",children:"Tutup"})]})]}),l&&e.jsx("div",{className:"fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]",children:e.jsxs("div",{className:"relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150",onClick:s=>s.stopPropagation(),children:[e.jsxs("div",{className:"flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100/70 text-indigo-600 shadow-xs",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"})})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-sm font-black text-slate-800",children:l.existingAttendance?"Edit Data Presensi":"Input Presensi Manual"}),e.jsx("p",{className:"text-xs font-bold text-indigo-600",children:l.dateFormatted})]})]}),e.jsx("button",{type:"button",onClick:()=>F(null),className:"rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition-colors",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]}),e.jsxs("form",{onSubmit:se,className:"p-6 space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80",children:[e.jsx("div",{className:"flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shrink-0",children:(x?.nama||"P").charAt(0).toUpperCase()}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("p",{className:"text-xs font-extrabold text-slate-800 truncate leading-tight",children:x?.nama}),e.jsxs("p",{className:"text-[10px] text-slate-500 font-mono leading-tight",children:["NIP: ",x?.nis_nip||"-"," • ",x?.status||"-"]})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-extrabold text-slate-700 mb-2",children:"Pilih Status Kehadiran:"}),e.jsx("div",{className:"grid grid-cols-3 gap-2",children:[{key:"hadir",label:"Hadir",icon:"✓",activeBg:"bg-emerald-600 text-white border-emerald-600 shadow-emerald-200 shadow-md"},{key:"izin",label:"Izin",icon:"!",activeBg:"bg-amber-500 text-white border-amber-500 shadow-amber-200 shadow-md"},{key:"sakit",label:"Sakit",icon:"+",activeBg:"bg-blue-600 text-white border-blue-600 shadow-blue-200 shadow-md"},{key:"lupa_absen",label:"Lupa Absen",icon:"?",activeBg:"bg-slate-700 text-white border-slate-700 shadow-slate-200 shadow-md"},{key:"alpha",label:"Alpha",icon:"✗",activeBg:"bg-red-600 text-white border-red-600 shadow-red-200 shadow-md"},{key:"libur",label:"Libur",icon:"★",activeBg:"bg-rose-600 text-white border-rose-600 shadow-rose-200 shadow-md"}].map(s=>{const a=b.status===s.key;return e.jsxs("button",{type:"button",onClick:()=>_({...b,status:s.key}),className:`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 select-none ${a?s.activeBg:"bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"}`,children:[e.jsx("span",{className:"font-mono text-xs",children:s.icon}),e.jsx("span",{children:s.label})]},s.key)})}),e.jsx(W,{message:D.status?.[0]||D.status,className:"mt-1 text-xs"})]}),!["alpha","libur"].includes(b.status)&&e.jsxs("div",{className:"p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-[11px] font-extrabold text-slate-600 uppercase tracking-wider",children:"Jam Kehadiran"}),e.jsx("div",{className:"flex items-center gap-1.5 text-[10px]",children:e.jsx("button",{type:"button",onClick:()=>{_({...b,jam_masuk:"07:00",jam_pulang:"15:30"})},className:"px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 font-semibold transition-colors",children:"Preset Normal (07:00 - 15:30)"})})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{children:[e.jsx("label",{htmlFor:"modal_jam_masuk",className:"block text-[11px] font-bold text-slate-600 mb-1",children:"Jam Datang"}),e.jsx("input",{id:"modal_jam_masuk",type:"time",value:b.jam_masuk,onChange:s=>_({...b,jam_masuk:s.target.value}),className:"w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-mono font-bold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-xs"}),e.jsx(W,{message:D.jam_masuk?.[0]||D.jam_masuk,className:"mt-0.5 text-[10px]"})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"modal_jam_pulang",className:"block text-[11px] font-bold text-slate-600 mb-1",children:"Jam Pulang"}),e.jsx("input",{id:"modal_jam_pulang",type:"time",value:b.jam_pulang,onChange:s=>_({...b,jam_pulang:s.target.value}),className:"w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-mono font-bold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-xs"}),e.jsx(W,{message:D.jam_pulang?.[0]||D.jam_pulang,className:"mt-0.5 text-[10px]"})]})]})]}),e.jsxs("div",{className:"pt-3 border-t border-slate-100 flex items-center justify-between gap-3",children:[e.jsx("div",{children:l.existingAttendance&&e.jsxs("button",{type:"button",onClick:me,disabled:h,className:"inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 border border-red-200/80 rounded-xl transition-all active:scale-95 shadow-xs disabled:opacity-50",title:"Hapus presensi dan reset status pada tanggal ini",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3.5 w-3.5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"})}),"Hapus Presensi"]})}),e.jsxs("div",{className:"flex items-center gap-2 ml-auto",children:[e.jsx("button",{type:"button",onClick:()=>F(null),className:"px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors",children:"Batal"}),e.jsxs("button",{type:"submit",disabled:h,className:`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 ${l.existingAttendance?"bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-200":"bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-200"}`,children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3.5 w-3.5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2.5,d:"M5 13l4 4L19 7"})}),h?"Menyimpan...":l.existingAttendance?"Perbarui Presensi":"Simpan Presensi"]})]})]})]})]})})]})}function Ge({workcodes:A=[],selectedWorkcodeId:H,selectedWorkcode:r,stats:g,attendances:K=[],participants:V=[],kepalaSekolahNama:y="Muhtarom, S.Pd., M.Si.",kepalaSekolahNip:Z="197205172006041015"}){const{flash:x}=Me().props,{toast:C}=ke(),T=Ne(),[M,oe]=o.useState(""),[P,k]=o.useState(""),[u,N]=o.useState(!1),[m,w]=o.useState(!1),[J,E]=o.useState(!1),[de,z]=o.useState(null),[Y,xe]=o.useState(""),[l,F]=o.useState(null),[b,_]=o.useState(!1),h=Pe({id:null,tanggal:"",jam_masuk:"",jam_pulang:"",status:"hadir"});o.useEffect(()=>{x?.success?C.success(x.success):x?.error&&C.error(x.error)},[x]);const X=["PNS","PPPK","PPPK Paruh Waktu","GTT","PTT"],D=K.map(t=>t.status_pegawai).filter(Boolean).sort(),O=[...new Set([...X,...D])],U=t=>{ie.get(route("report"),{workcode_id:t},{preserveState:!0,preserveScroll:!0})},$=K.filter(t=>{const n=(t.nama||"").toLowerCase().includes(M.toLowerCase())||(t.nis_nip||"").toLowerCase().includes(M.toLowerCase()),p=P===""||t.status_pegawai===P;return n&&p}),ee=$.slice(0,5),ce=$.slice(0,8),te=g&&g.total>0?Math.round(g.hadir/g.total*100):0,G=r?.kategori==="workcode",q=(t,n="")=>{xe(n||t.nama||"Peserta"),h.setData({id:t.id,tanggal:t.tanggal||(t.waktu_hadir?t.waktu_hadir.split(" ")[0]:new Date().toISOString().split("T")[0]),jam_masuk:t.jam_masuk||"",jam_pulang:G?"":t.jam_pulang||"",status:t.status||"hadir"}),N(!0)},j=async(t,n,p,c)=>{if(r){_(!0);try{const i=await(await fetch(`/report/individual/${r.id}/${t}`)).json();F({id:t,nama:n||i.participant.nama,nis_nip:p||i.participant.nis_nip,status_pegawai:c||i.participant.status,attendances:i.attendances||[]}),w(!0)}catch(v){console.error("Gagal mengambil data riwayat:",v),C.error("Gagal memuat riwayat presensi.")}finally{_(!1)}}},pe=t=>{t.preventDefault(),h.put(route("admin.attendances.update",h.data.id),{preserveScroll:!0,onSuccess:()=>{N(!1),h.reset(),m&&l&&j(l.id,l.nama,l.nis_nip,l.status_pegawai)}})},se=async(t,n,p)=>{await T({title:"Hapus Log Presensi",message:`Apakah Anda yakin ingin menghapus catatan presensi ${n?`untuk "${n}"`:""} ${p?`tanggal ${p}`:""}? Tindakan ini akan menghapus data kehadiran/alpha/izin hari tersebut.`,type:"danger",confirmText:"Ya, Hapus Data",cancelText:"Batal"})&&ie.delete(route("admin.attendances.destroy",t),{preserveScroll:!0,onSuccess:()=>{m&&l&&j(l.id,l.nama,l.nis_nip,l.status_pegawai)}})},me=()=>{if(!r)return;const t=window.open("","_blank","width=800,height=900"),n=$.map((c,v)=>`
            <tr>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${v+1}</td>
                <td style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px;">${c.nama}</td>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 11px;">${c.nis_nip}</td>
                <td style="padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${c.status_pegawai||"-"}</td>
                ${r.kategori==="harian"?`
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${c.total_alpha||"0"}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${c.total_izin||"0"}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${c.total_sakit||"0"}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${c.total_lupa_absen||"0"}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${c.total_menit_terlambat?c.total_menit_terlambat+" Menit":"0 Menit"}</td>
                    `:`
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${c.waktu_hadir}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px;">${c.status?c.status.replace("_"," ").toUpperCase():"-"}</td>
                    `}
            </tr>
        `).join(""),p=r.kategori==="harian"?`
                <th style="width: 35px;">No</th>
                <th style="width: 250px;">Nama Lengkap</th>
                <th style="width: 150px;">NIP</th>
                <th style="width: 90px;">Status Pegawai</th>
                <th style="width: 50px;">Alpha</th>
                <th style="width: 50px;">Izin</th>
                <th style="width: 50px;">Sakit</th>
                <th style="width: 60px;">Lupa Absen</th>
                <th style="width: 90px;">Total Terlambat</th>
            `:`
                <th style="width: 35px;">No</th>
                <th>Nama Lengkap</th>
                <th style="width: 150px;">NIP</th>
                <th>Status Pegawai</th>
                <th style="width: 130px;">Waktu Presensi</th>
                <th style="width: 70px;">Status</th>
            `;t.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Rekap Presensi - ${r.nama_workcode}</title>
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
                            <td>${r.nama_workcode}</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold;">Kategori Presensi</td>
                            <td>:</td>
                            <td style="text-transform: capitalize;">${r.kategori==="harian"?"Presensi Harian":"Presensi Sekali / Event"}</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold;">Waktu Cetak</td>
                            <td>:</td>
                            <td>${new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})} WIB</td>
                        </tr>
                    </table>
                </div>

                <table class="data-table">
                    <thead>
                        <tr>
                            ${p}
                        </tr>
                    </thead>
                    <tbody>
                        ${n||'<tr><td colspan="9" style="text-align:center; padding: 10px;">Belum ada data kehadiran</td></tr>'}
                    </tbody>
                </table>

                <div class="ttd-section">
                    <div class="ttd-box">
                        <p>Babat, ${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</p>
                        <p style="margin-bottom: 5px;">Kepala Sekolah,</p>
                        <div class="ttd-qr-wrap" style="display: flex; justify-content: center; margin: 10px 0;">
                            <img src="${window.location.origin}/workcodes/${r.id}/qr-signature" style="width: 80px; height: 80px;" alt="QR TTD" />
                        </div>
                        <p style="font-weight: bold; text-decoration: underline; font-size: 13px;">${y}</p>
                        <p style="font-size: 11px; color: #475569; font-family: Arial, sans-serif;">NIP. ${Z}</p>
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        setTimeout(function() { window.focus(); window.print(); }, 600);
                    };
                <\/script>
            </body>
            </html>
        `),t.document.close()},s=async(t,n)=>{if(r)try{const p=new Date,c=p.getFullYear(),v=p.getMonth()+1,i=p.toLocaleDateString("id-ID",{month:"long",year:"numeric"}),f=await(await fetch(`/report/individual/${r.id}/${t}?year=${c}&month=${v}`)).json(),S=window.open("","_blank","width=800,height=900"),L=(f.attendances||[]).slice().sort((d,be)=>{const ae=d.tanggal||"",ne=be.tanggal||"";return ae.localeCompare(ne)}),he=f.workcode&&f.workcode.jam_datang_selesai?f.workcode.jam_datang_selesai.slice(0,5):"07:00",ue=L.map((d,be)=>{let ae="-";if(d.tanggal){const[re,Ae,Ce]=d.tanggal.split("-").map(Number);ae=new Date(re,Ae-1,Ce).toLocaleDateString("id-ID",{weekday:"long",day:"2-digit",month:"long",year:"numeric"})}let ne=d.jam_masuk||(d.waktu_hadir!=="-"?d.waktu_hadir:"-"),ve=d.jam_pulang||(d.waktu_pulang!=="-"?d.waktu_pulang:"-");d.status==="libur"&&(ne="-",ve="-");let B=(d.status||"hadir").toUpperCase(),I="#0f172a";if(d.status==="hadir"||!d.status){const re=(d.jam_masuk||"").trim().slice(0,5);re&&re>he?(B="TERLAMBAT",I="#b91c1c"):(B="HADIR",I="#15803d")}else d.status==="terlambat"?(B="TERLAMBAT",I="#b91c1c"):d.status==="izin"?(B="IZIN",I="#b45309"):d.status==="sakit"?(B="SAKIT",I="#1d4ed8"):d.status==="alpha"?(B="ALPHA",I="#b91c1c"):d.status==="lupa_absen"&&(B="LUPA ABSEN",I="#475569");return`
                    <tr>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${be+1}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${ae}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${ne}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${ve}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px; color: ${I};">${B}</td>
                    </tr>
                `}).join(""),ge=L.filter(d=>d.status==="alpha").length,_e=L.filter(d=>d.status==="izin").length,Se=L.filter(d=>d.status==="sakit").length,Le=L.filter(d=>d.status==="lupa_absen").length;S.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Rekap Kehadiran - ${n}</title>
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
                                <td style="font-weight: bold;">${n}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">NIP</td>
                                <td>:</td>
                                <td style="font-family: monospace;">${f.participant.nis_nip||"-"}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">Status Kepegawaian</td>
                                <td>:</td>
                                <td>${f.participant.status||"-"}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">WorkCode</td>
                                <td>:</td>
                                <td>${r.nama_workcode}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">Periode Bulan</td>
                                <td>:</td>
                                <td>${i}</td>
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
                                <td style="width: 25%; color: #b91c1c;">${ge} Hari</td>
                                <td style="width: 25%; color: #b45309;">${_e} Hari</td>
                                <td style="width: 25%; color: #1d4ed8;">${Se} Hari</td>
                                <td style="width: 25%; color: #475569;">${Le} Hari</td>
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
                            ${ue||'<tr><td colspan="5" style="text-align:center; padding: 10px;">Belum ada data kehadiran</td></tr>'}
                        </tbody>
                    </table>

                    <div class="ttd-section">
                        <div class="ttd-box">
                            <p>Babat, ${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</p>
                            <p style="margin-bottom: 5px;">Kepala Sekolah,</p>
                            <div class="ttd-qr-wrap" style="display: flex; justify-content: center; margin: 10px 0;">
                                <img src="${window.location.origin}/workcodes/${r.id}/qr-signature" style="width: 80px; height: 80px;" alt="QR TTD" />
                            </div>
                            <p style="font-weight: bold; text-decoration: underline; font-size: 13px;">${y}</p>
                            <p style="font-size: 11px; color: #475569; font-family: Arial, sans-serif;">NIP. ${Z}</p>
                        </div>
                    </div>

                    <script>
                        window.onload = function() {
                            setTimeout(function() { window.focus(); window.print(); }, 600);
                        };
                    <\/script>
                </body>
                </html>
            `),S.document.close()}catch(p){console.error("Gagal mengambil data rekap:",p),C.error("Terjadi kesalahan saat memuat rekap individu.")}},a=t=>{switch(t){case"hadir":return e.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700",children:"✓ Hadir"});case"alpha":return e.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-bold text-red-700",children:"✗ Alpha"});case"izin":return e.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-700",children:"! Izin"});case"sakit":return e.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-bold text-blue-700",children:"+ Sakit"});case"lupa_absen":return e.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-300 px-2.5 py-0.5 text-xs font-bold text-slate-700",children:"? Lupa Absen"});default:return e.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600",children:"-"})}};return e.jsxs(De,{header:e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-4","data-aos":"fade-down",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-xl font-extrabold leading-tight text-slate-800",children:"Laporan Kehadiran"}),e.jsx("p",{className:"text-xs text-slate-500 font-medium mt-0.5",children:r?`Menampilkan laporan untuk: ${r.nama_workcode}`:"Pilih workcode untuk melihat data"})]}),e.jsxs("div",{className:"flex flex-wrap items-center gap-2.5",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("label",{htmlFor:"workcode-filter",className:"text-xs font-bold text-slate-600 shrink-0",children:"Workcode:"}),e.jsxs("select",{id:"workcode-filter",value:H||"",onChange:t=>U(t.target.value),className:"rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-indigo-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer min-w-[170px]",children:[A.length===0&&e.jsx("option",{value:"",children:"Belum Ada Workcode"}),A.map(t=>e.jsxs("option",{value:t.id,children:[t.is_active?"🟢 ":"",t.nama_workcode," (",t.attendances_count," hadir)"]},t.id))]})]}),H&&e.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[e.jsxs("a",{href:route("workcodes.export",H),className:"inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 shadow-sm transition-all active:scale-95",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4 text-emerald-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"})}),"Export Excel (.xlsx)"]}),e.jsxs("button",{type:"button",onClick:me,className:"inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-95",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"})}),"Cetak Bukti Hadir"]})]})]})]}),children:[e.jsx(ze,{title:"Laporan Kehadiran"}),e.jsx("div",{className:"py-4 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col",children:e.jsxs("div",{className:"mx-auto max-w-7xl w-full flex-1 flex flex-col space-y-3.5",children:[e.jsxs("div",{className:"grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 flex-none","data-aos":"fade-up",children:[e.jsx("div",{className:"overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm",children:e.jsxs("div",{className:"flex items-center gap-3.5",children:[e.jsx("div",{className:"rounded-xl bg-indigo-50 border border-indigo-100 p-2.5",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6 text-indigo-700",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"})})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] font-bold text-slate-400 uppercase tracking-wider",children:"Total Peserta"}),e.jsx("p",{className:"text-xl font-extrabold text-slate-800 mt-0.5",children:g.total})]})]})}),e.jsx("div",{className:"overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm",children:e.jsxs("div",{className:"flex items-center gap-3.5",children:[e.jsx("div",{className:"rounded-xl bg-emerald-50 border border-emerald-100 p-2.5",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6 text-emerald-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"})})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] font-bold text-slate-400 uppercase tracking-wider",children:"Hadir"}),e.jsx("p",{className:"text-xl font-extrabold text-emerald-600 mt-0.5",children:g.hadir})]})]})}),e.jsx("div",{className:"overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm",children:e.jsxs("div",{className:"flex items-center gap-3.5",children:[e.jsx("div",{className:"rounded-xl bg-amber-50 border border-amber-100 p-2.5",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6 text-amber-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"})})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] font-bold text-slate-400 uppercase tracking-wider",children:"Belum Hadir"}),e.jsx("p",{className:"text-xl font-extrabold text-amber-600 mt-0.5",children:g.belum})]})]})}),e.jsx("div",{className:"overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm",children:e.jsxs("div",{className:"flex items-center gap-3.5",children:[e.jsx("div",{className:"rounded-xl bg-purple-50 border border-purple-100 p-2.5",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6 text-purple-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:[e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"}),e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"})]})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] font-bold text-slate-400 uppercase tracking-wider",children:"Persentase"}),e.jsxs("p",{className:"text-xl font-extrabold text-purple-600 mt-0.5",children:[te,"%"]})]})]})})]}),e.jsxs("div",{className:"overflow-hidden rounded-2xl bg-white border border-slate-200 p-3.5 shadow-sm flex-none","data-aos":"fade-up","data-aos-delay":"100",children:[e.jsxs("div",{className:"mb-1.5 flex items-center justify-between",children:[e.jsx("span",{className:"text-xs font-bold text-slate-700",children:"Progress Kehadiran"}),e.jsxs("span",{className:"text-xs font-extrabold text-indigo-600",children:[g.hadir," / ",g.total]})]}),e.jsx("div",{className:"h-2 w-full overflow-hidden rounded-full bg-slate-100",children:e.jsx("div",{className:"h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-700 transition-all duration-1000 ease-out",style:{width:`${te}%`}})})]}),e.jsxs("div",{className:"flex flex-col sm:flex-row gap-3 flex-none","data-aos":"fade-up","data-aos-delay":"150",children:[e.jsxs("div",{className:"relative flex-1",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2.5,d:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"})}),e.jsx("input",{type:"text",placeholder:"Cari data kehadiran berdasarkan nama atau NIP...",value:M,onChange:t=>oe(t.target.value),className:"w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-sm font-medium"})]}),e.jsx("div",{className:"sm:w-64",children:e.jsxs("select",{value:P,onChange:t=>k(t.target.value),className:"w-full rounded-xl border border-slate-200 bg-white py-2 px-3.5 text-xs sm:text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium cursor-pointer",children:[e.jsx("option",{value:"",children:"Semua Status Pegawai"}),O.map((t,n)=>e.jsx("option",{value:t,children:t},n))]})})]}),e.jsx("div",{className:"sm:hidden space-y-3","data-aos":"fade-up","data-aos-delay":"200",children:$.length===0?e.jsx("div",{className:"rounded-2xl bg-white border border-slate-200 p-10 text-center shadow-sm",children:e.jsx("p",{className:"text-sm font-semibold text-slate-500",children:"Belum ada data kehadiran."})}):ee.map((t,n)=>e.jsxs("div",{className:"rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-sm font-bold text-indigo-600 shrink-0",children:(t.nama||"P").charAt(0).toUpperCase()}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"text-sm font-bold text-slate-800 truncate",children:t.nama}),e.jsxs("p",{className:"text-xs text-slate-500 font-mono",children:[t.nis_nip||"-"," · ",t.status_pegawai||"-"]})]})]}),r?.kategori==="harian"?e.jsxs("div",{className:"grid grid-cols-4 gap-1.5 text-center",children:[e.jsxs("div",{className:"rounded-lg bg-red-50 border border-red-100 p-1.5",children:[e.jsx("p",{className:"text-[9px] font-bold uppercase text-red-500",children:"Alpha"}),e.jsx("p",{className:"text-base font-extrabold text-red-600",children:t.total_alpha||"0"})]}),e.jsxs("div",{className:"rounded-lg bg-amber-50 border border-amber-100 p-1.5",children:[e.jsx("p",{className:"text-[9px] font-bold uppercase text-amber-500",children:"Izin"}),e.jsx("p",{className:"text-base font-extrabold text-amber-600",children:t.total_izin||"0"})]}),e.jsxs("div",{className:"rounded-lg bg-blue-50 border border-blue-100 p-1.5",children:[e.jsx("p",{className:"text-[9px] font-bold uppercase text-blue-500",children:"Sakit"}),e.jsx("p",{className:"text-base font-extrabold text-blue-600",children:t.total_sakit||"0"})]}),e.jsxs("div",{className:"rounded-lg bg-slate-50 border border-slate-200 p-1.5",children:[e.jsx("p",{className:"text-[9px] font-bold uppercase text-slate-500",children:"Terlambat"}),e.jsx("p",{className:"text-xs font-extrabold text-orange-600 leading-tight mt-0.5",children:t.total_menit_terlambat?t.total_menit_terlambat+"m":"0"})]})]}):e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-xs text-slate-600 font-mono",children:t.status!=="libur"?t.waktu_hadir:"-"}),a(t.status)]}),e.jsx("div",{className:"flex flex-wrap gap-2",children:r?.kategori==="harian"?e.jsxs(e.Fragment,{children:[e.jsx("button",{onClick:()=>{const p=V.find(c=>c.id===t.participant_id)||{id:t.participant_id,nama:t.nama,nis_nip:t.nis_nip,status:t.status_pegawai};z(p),E(!0)},className:"inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100",children:"Kalender"}),e.jsx("button",{onClick:()=>j(t.participant_id,t.nama,t.nis_nip,t.status_pegawai),className:"inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200",children:"Riwayat"}),e.jsx("button",{onClick:()=>s(t.participant_id,t.nama),className:"inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200",children:"Cetak"})]}):e.jsx("button",{onClick:()=>q(t,t.nama),className:"inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100",children:"Edit Presensi"})})]},t.id||t.participant_id||n))}),e.jsx("div",{className:"hidden sm:flex overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm flex-1 flex-col min-h-0","data-aos":"fade-up","data-aos-delay":"200",children:e.jsx("div",{className:"min-h-0 flex-1 overflow-hidden",children:e.jsxs("table",{className:"w-full min-w-full divide-y divide-slate-200 text-xs",children:[e.jsx("thead",{className:"bg-slate-50 sticky top-0 z-10 shadow-xs",children:e.jsxs("tr",{children:[e.jsx("th",{className:"w-12 px-3 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"No"}),e.jsx("th",{className:"px-4 py-3 text-left font-extrabold uppercase tracking-wider text-slate-500",children:"Nama Lengkap"}),e.jsx("th",{className:"w-44 px-3 py-3 text-left font-extrabold uppercase tracking-wider text-slate-500",children:"NIP"}),e.jsx("th",{className:"w-28 px-3 py-3 text-left font-extrabold uppercase tracking-wider text-slate-500",children:"Status Pegawai"}),r?.kategori==="harian"?e.jsxs(e.Fragment,{children:[e.jsx("th",{className:"w-16 px-2 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"Alpha"}),e.jsx("th",{className:"w-16 px-2 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"Izin"}),e.jsx("th",{className:"w-16 px-2 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"Sakit"}),e.jsx("th",{className:"w-24 px-2 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"Lupa Absen"}),e.jsx("th",{className:"w-28 px-2 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"Total Terlambat"}),e.jsx("th",{className:"w-60 px-3 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"Aksi"})]}):e.jsxs(e.Fragment,{children:[e.jsx("th",{className:"px-4 py-3 text-left font-extrabold uppercase tracking-wider text-slate-500",children:"Waktu Hadir"}),e.jsx("th",{className:"w-28 px-3 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"Status"}),e.jsx("th",{className:"w-40 px-3 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"Aksi"})]})]})}),e.jsx("tbody",{className:"divide-y divide-slate-100 bg-white",children:$.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:r?.kategori==="harian"?10:7,className:"px-4 py-16 text-center align-middle bg-white",children:e.jsxs("div",{className:"flex flex-col items-center justify-center text-center mx-auto w-full",children:[e.jsx("div",{className:"flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200/80 mb-2.5 shadow-2xs",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6 text-slate-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:1.5,d:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"})})}),e.jsx("p",{className:"text-sm font-bold text-slate-700",children:"Belum ada peserta yang hadir"}),e.jsx("p",{className:"text-xs text-slate-400 mt-0.5",children:"Data kehadiran peserta pada workcode ini masih kosong."})]})})}):ce.map((t,n)=>e.jsxs("tr",{className:"transition-colors hover:bg-slate-50/70",children:[e.jsx("td",{className:"px-3 py-2.5 text-center text-xs text-slate-400 font-semibold",children:n+1}),e.jsx("td",{className:"px-4 py-2.5",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600 shrink-0",children:(t.nama||"P").charAt(0).toUpperCase()}),e.jsx("span",{className:"text-xs sm:text-sm font-bold text-slate-800 leading-snug",children:t.nama})]})}),e.jsx("td",{className:"px-3 py-2.5 text-xs text-slate-600 font-semibold font-mono",children:t.nis_nip||"-"}),e.jsx("td",{className:"px-3 py-2.5 text-xs text-slate-600 font-medium",children:t.status_pegawai||"-"}),r?.kategori==="harian"?e.jsxs(e.Fragment,{children:[e.jsx("td",{className:"px-2 py-2.5 text-xs text-red-600 font-bold text-center",children:t.total_alpha||"0"}),e.jsx("td",{className:"px-2 py-2.5 text-xs text-amber-600 font-bold text-center",children:t.total_izin||"0"}),e.jsx("td",{className:"px-2 py-2.5 text-xs text-blue-600 font-bold text-center",children:t.total_sakit||"0"}),e.jsx("td",{className:"px-2 py-2.5 text-xs text-slate-600 font-bold text-center",children:t.total_lupa_absen||"0"}),e.jsx("td",{className:"px-2 py-2.5 text-xs text-orange-600 font-bold text-center",children:t.total_menit_terlambat?t.total_menit_terlambat+" Menit":"0 Menit"}),e.jsx("td",{className:"px-3 py-2.5 text-center",children:e.jsxs("div",{className:"flex items-center justify-center gap-1.5",children:[e.jsxs("button",{onClick:()=>{const p=V.find(c=>c.id===t.participant_id)||{id:t.participant_id,nama:t.nama,nis_nip:t.nis_nip,status:t.status_pegawai};z(p),E(!0)},className:"inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-2xs shrink-0",title:"Buka Kalender 1 Bulan & Kelola Presensi",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3.5 w-3.5 text-emerald-600 shrink-0",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"})}),e.jsx("span",{children:"Kalender"})]}),e.jsx("button",{onClick:()=>j(t.participant_id,t.nama,t.nis_nip,t.status_pegawai),className:"inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-slate-100 border border-slate-200 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors shadow-2xs shrink-0",title:"Daftar Log Presensi",children:e.jsx("span",{children:"Log"})}),e.jsxs("button",{onClick:()=>s(t.participant_id,t.nama),className:"inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors shadow-2xs shrink-0",title:"Cetak Surat Bukti Rekap Individu",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3.5 w-3.5 text-slate-600 shrink-0",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"})}),e.jsx("span",{children:"Cetak"})]})]})})]}):e.jsxs(e.Fragment,{children:[e.jsx("td",{className:"px-4 py-2.5 text-xs text-slate-700 font-mono font-semibold",children:t.status==="libur"?"-":t.waktu_hadir}),e.jsx("td",{className:"px-3 py-2.5 text-center",children:a(t.status)}),e.jsx("td",{className:"px-3 py-2.5 text-center",children:e.jsxs("div",{className:"flex items-center justify-center gap-1.5",children:[e.jsx("button",{onClick:()=>q(t,t.nama),className:"p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-colors",title:"Edit Presensi",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"})})}),e.jsx("button",{onClick:()=>se(t.id,t.nama,t.waktu_hadir),className:"p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors",title:"Hapus Presensi",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"})})})]})})]})]},t.id||t.participant_id||n))})]})})})]})}),e.jsx(we,{show:u,onClose:()=>N(!1),maxWidth:"md",children:e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-slate-100 pb-4",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"})})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-base font-extrabold text-slate-800",children:"Edit Log Presensi"}),e.jsx("p",{className:"text-xs text-slate-500 font-medium",children:Y})]})]}),e.jsx("button",{type:"button",onClick:()=>N(!1),className:"rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]}),e.jsxs("form",{onSubmit:pe,className:"mt-5 space-y-4",children:[e.jsxs("div",{children:[e.jsx(le,{htmlFor:"edit_tanggal",value:"Tanggal Presensi",className:"text-xs font-bold text-slate-700"}),e.jsx(fe,{id:"edit_tanggal",type:"date",value:h.data.tanggal,onChange:t=>h.setData("tanggal",t.target.value),className:"mt-1 w-full text-xs font-medium",required:!0}),e.jsx(W,{message:h.errors.tanggal,className:"mt-1 text-xs"})]}),e.jsxs("div",{children:[e.jsx(le,{htmlFor:"edit_status",value:"Status Kehadiran",className:"text-xs font-bold text-slate-700"}),e.jsxs("select",{id:"edit_status",value:h.data.status,onChange:t=>h.setData("status",t.target.value),className:"mt-1 w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10",required:!0,children:[e.jsx("option",{value:"hadir",children:"Hadir"}),e.jsx("option",{value:"izin",children:"Izin"}),e.jsx("option",{value:"sakit",children:"Sakit"}),e.jsx("option",{value:"lupa_absen",children:"Lupa Absen"}),e.jsx("option",{value:"alpha",children:"Alpha"})]}),e.jsx(W,{message:h.errors.status,className:"mt-1 text-xs"})]}),h.data.status!=="alpha"&&e.jsxs("div",{className:`grid grid-cols-1 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 ${G?"":"sm:grid-cols-2"}`,children:[e.jsxs("div",{children:[e.jsx(le,{htmlFor:"edit_jam_masuk",value:G?"Jam Absen":"Jam Datang",className:"text-xs font-bold text-slate-600"}),e.jsx(fe,{id:"edit_jam_masuk",type:"time",value:h.data.jam_masuk,onChange:t=>h.setData("jam_masuk",t.target.value),className:"mt-1 w-full text-xs"}),e.jsx(W,{message:h.errors.jam_masuk,className:"mt-1 text-xs"})]}),!G&&e.jsxs("div",{children:[e.jsx(le,{htmlFor:"edit_jam_pulang",value:"Jam Pulang",className:"text-xs font-bold text-slate-600"}),e.jsx(fe,{id:"edit_jam_pulang",type:"time",value:h.data.jam_pulang,onChange:t=>h.setData("jam_pulang",t.target.value),className:"mt-1 w-full text-xs"}),e.jsx(W,{message:h.errors.jam_pulang,className:"mt-1 text-xs"})]})]}),e.jsxs("div",{className:"mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4",children:[e.jsx(je,{type:"button",onClick:()=>N(!1),children:"Batal"}),e.jsx($e,{type:"submit",disabled:h.processing,className:"bg-indigo-600 hover:bg-indigo-700",children:h.processing?"Menyimpan...":"Perbarui Presensi"})]})]})]})}),e.jsx(we,{show:m,onClose:()=>w(!1),maxWidth:"2xl",children:e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-slate-100 pb-4",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"})})}),e.jsxs("div",{children:[e.jsxs("h3",{className:"text-base font-extrabold text-slate-800",children:["Riwayat Presensi: ",l?.nama]}),e.jsxs("p",{className:"text-xs text-slate-500 font-medium",children:["NIP: ",e.jsx("span",{className:"font-mono",children:l?.nis_nip||"-"})," • ",l?.status_pegawai||"-"]})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("button",{type:"button",onClick:()=>{z(l),E(!0),w(!1)},className:"inline-flex items-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3.5 w-3.5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"})}),"Buka Kalender"]}),e.jsx("button",{type:"button",onClick:()=>w(!1),className:"rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]})]}),e.jsx("div",{className:"mt-4",children:b?e.jsx("div",{className:"py-12 text-center text-slate-500 text-xs font-semibold",children:"Memuat data riwayat presensi..."}):l?.attendances?.length===0?e.jsxs("div",{className:"py-12 text-center text-slate-500",children:[e.jsx("p",{className:"text-xs font-semibold",children:"Belum ada riwayat rekaman presensi untuk peserta ini."}),e.jsx("button",{type:"button",onClick:()=>{z(l),E(!0),w(!1)},className:"mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline",children:"📅 Buka kalender presensi sekarang"})]}):e.jsx("div",{className:"overflow-x-auto max-h-[350px] overflow-y-auto rounded-xl border border-slate-200",children:e.jsxs("table",{className:"min-w-full divide-y divide-slate-200 text-xs",children:[e.jsx("thead",{className:"bg-slate-50 sticky top-0 z-10",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-4 py-2.5 text-left font-extrabold text-slate-500 uppercase tracking-wider",children:"No"}),e.jsx("th",{className:"px-4 py-2.5 text-left font-extrabold text-slate-500 uppercase tracking-wider",children:"Tanggal"}),e.jsx("th",{className:"px-4 py-2.5 text-center font-extrabold text-slate-500 uppercase tracking-wider",children:"Jam Datang"}),e.jsx("th",{className:"px-4 py-2.5 text-center font-extrabold text-slate-500 uppercase tracking-wider",children:"Jam Pulang"}),e.jsx("th",{className:"px-4 py-2.5 text-center font-extrabold text-slate-500 uppercase tracking-wider",children:"Status"}),e.jsx("th",{className:"px-4 py-2.5 text-center font-extrabold text-slate-500 uppercase tracking-wider",children:"Aksi"})]})}),e.jsx("tbody",{className:"divide-y divide-slate-100 bg-white",children:l?.attendances?.map((t,n)=>e.jsxs("tr",{className:"hover:bg-slate-50/60 transition-colors",children:[e.jsx("td",{className:"px-4 py-2.5 text-slate-500 font-semibold",children:n+1}),e.jsx("td",{className:"px-4 py-2.5 font-bold text-slate-800",children:t.tanggal_formatted||t.tanggal||"-"}),e.jsx("td",{className:"px-4 py-2.5 text-center font-mono font-medium text-slate-700",children:t.status==="libur"?"-":t.jam_masuk?`${t.jam_masuk} WIB`:t.waktu_hadir!=="-"?t.waktu_hadir:"-"}),e.jsx("td",{className:"px-4 py-2.5 text-center font-mono font-medium text-slate-700",children:t.status==="libur"?"-":t.jam_pulang?`${t.jam_pulang} WIB`:t.waktu_pulang!=="-"?t.waktu_pulang:"-"}),e.jsx("td",{className:"px-4 py-2.5 text-center",children:a(t.status)}),e.jsx("td",{className:"px-4 py-2.5 text-center",children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[e.jsx("button",{type:"button",onClick:()=>q(t,l.nama),className:"p-1 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors",title:"Edit Log Presensi Ini",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"})})}),e.jsx("button",{type:"button",onClick:()=>se(t.id,l.nama,t.tanggal_formatted||t.tanggal),className:"p-1 rounded-lg text-red-600 hover:bg-red-50 transition-colors",title:"Hapus Log Presensi Ini (Reset Status)",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"})})})]})})]},t.id||n))})]})})}),e.jsx("div",{className:"mt-5 flex justify-end border-t border-slate-100 pt-3",children:e.jsx(je,{onClick:()=>w(!1),children:"Tutup"})})]})}),e.jsx(Ie,{show:J,onClose:()=>{E(!1),z(null),ie.reload({only:["stats","attendances"],preserveScroll:!0,preserveState:!0})},workcode:r,participants:V,initialParticipant:de,onAttendanceChanged:()=>{ie.reload({only:["stats","attendances"],preserveScroll:!0,preserveState:!0})}})]})}export{Ge as default};
