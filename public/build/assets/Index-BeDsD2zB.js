import{c as We,u as Je,r,j as e,f as ce,e as Be,d as Ue,H as qe,b as ye,g as Ee}from"./app-DI9BQkDg.js";import{A as Qe}from"./AuthenticatedLayout-aLmZ5DQa.js";import{j as Ze,b as Xe}from"./backgroundReload-6tqgcpxe.js";import{K as Ne}from"./KpiCard-CcPOdBGZ.js";import{i as Q}from"./adminMenu-SBTRyOQ3.js";import{M as xe}from"./Modal-NFCicK6I.js";import{S as Se}from"./SecondaryButton-kgElixJb.js";import{I as Z}from"./InputError-ChFMMau7.js";import{P as et}from"./PrimaryButton-CIezMWQT.js";import{I as ke}from"./InputLabel-CTp2lTOF.js";import{T as De}from"./TextInput-BMD0rrLP.js";import"./transition-C-2dkcUM.js";const Fe=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"],tt=["Min","Sen","Sel","Rab","Kam","Jum","Sab"];function at({show:u=!1,onClose:v=()=>{},workcode:h=null,participants:n=[],initialParticipant:N=null,onAttendanceChanged:U=()=>{}}){const{toast:$}=We(),me=Je(),[g,I]=r.useState(null),[D,X]=r.useState(""),[le,ee]=r.useState(!1),P=new Date,[k,te]=r.useState(P.getFullYear()),[m,z]=r.useState(P.getMonth()),[M,pe]=r.useState([]),[ae,ue]=r.useState(!1),[R,f]=r.useState({});r.useEffect(()=>{(async()=>{try{const s=await ce.get("/api/holidays");f(s.data||{})}catch(s){console.error("Gagal memuat data hari libur:",s)}})()},[]);const[S,_]=r.useState(null),[w,L]=r.useState({id:null,workcode_id:h?.id||"",participant_id:"",tanggal:"",jam_masuk:"07:00",jam_pulang:"15:30",status:"hadir"}),[B,he]=r.useState(!1),[K,p]=r.useState({});r.useEffect(()=>{u&&(N?(I(N),X("")):n.length>0&&!g&&I(n[0]))},[u,N]);const re=async a=>{if(!(!h||!a)){ue(!0);try{const s=await ce.get(`/report/individual/${h.id}/${a}`);pe(s.data.attendances||[])}catch(s){console.error("Gagal mengambil data presensi:",s),$.error("Gagal memuat data presensi kalender.")}finally{ue(!1)}}};r.useEffect(()=>{u&&g&&h&&re(g.id)},[u,g?.id,h?.id]);const ge=r.useMemo(()=>{if(!D.trim())return n;const a=D.toLowerCase();return n.filter(s=>(s.nama||"").toLowerCase().includes(a)||s.nis_nip&&s.nis_nip.toLowerCase().includes(a))},[n,D]),ie=r.useMemo(()=>{const a={};return M.forEach(s=>{s.tanggal&&(a[s.tanggal]=s)}),a},[M]),j=()=>{m===0?(z(11),te(a=>a-1)):z(a=>a-1)},be=()=>{m===11?(z(0),te(a=>a+1)):z(a=>a+1)},Le=()=>{te(P.getFullYear()),z(P.getMonth())},Ce=r.useMemo(()=>{const a=new Date(k,m,1).getDay(),s=new Date(k,m+1,0).getDate(),b=new Date(k,m,0).getDate(),c=[];for(let x=a-1;x>=0;x--){const J=b-x,A=m===0?11:m-1,E=`${m===0?k-1:k}-${String(A+1).padStart(2,"0")}-${String(J).padStart(2,"0")}`;c.push({dayNumber:J,dateStr:E,isCurrentMonth:!1,isWeekend:!1})}for(let x=1;x<=s;x++){const J=new Date(k,m,x),A=`${k}-${String(m+1).padStart(2,"0")}-${String(x).padStart(2,"0")}`,C=J.getDay(),E=C===0||C===6,Pe=!!R[A],t=R[A]||null,l=P.getFullYear()===k&&P.getMonth()===m&&P.getDate()===x;c.push({dayNumber:x,dateStr:A,isCurrentMonth:!0,isWeekend:E,isHoliday:Pe,holidayName:t,isToday:l,dayOfWeek:C,attendance:ie[A]||null})}const H=c.length,se=(H<=35?35:42)-H;for(let x=1;x<=se;x++){const J=m===11?0:m+1,C=`${m===11?k+1:k}-${String(J+1).padStart(2,"0")}-${String(x).padStart(2,"0")}`;c.push({dayNumber:x,dateStr:C,isCurrentMonth:!1,isWeekend:!1})}return c},[k,m,ie,R]),W=r.useMemo(()=>{let a=0,s=0,b=0,c=0,H=0,oe=0;const se=`${k}-${String(m+1).padStart(2,"0")}`;return M.forEach(x=>{x.tanggal&&x.tanggal.startsWith(se)&&(x.status==="hadir"?a++:x.status==="izin"?s++:x.status==="sakit"?b++:x.status==="alpha"?c++:x.status==="lupa_absen"?H++:x.status==="libur"&&oe++)}),{hadir:a,izin:s,sakit:b,alpha:c,lupaAbsen:H,libur:oe}},[M,k,m]),Ae=a=>{if(!a.isCurrentMonth)return;const b=new Date(a.dateStr).toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"}),c=a.attendance;L(c?{id:c.id,workcode_id:h.id,participant_id:g.id,tanggal:a.dateStr,jam_masuk:c.jam_masuk||"",jam_pulang:c.jam_pulang||"",status:c.status||"hadir"}:{id:null,workcode_id:h.id,participant_id:g.id,tanggal:a.dateStr,jam_masuk:"07:00",jam_pulang:"15:30",status:"hadir"}),p({}),_({dateStr:a.dateStr,dateFormatted:b,existingAttendance:c})},T=async a=>{a.preventDefault(),he(!0),p({});try{if(w.id){const s=await ce.put(route("admin.attendances.update",w.id),w);$.success(s.data?.message||"Presensi berhasil diperbarui.")}else{const s=await ce.post(route("admin.attendances.store"),w);$.success(s.data?.message||"Presensi berhasil disimpan.")}_(null),await re(g.id),U()}catch(s){console.error("Gagal menyimpan presensi:",s),s.response?.data?.errors&&p(s.response.data.errors),$.error(s.response?.data?.message||"Gagal menyimpan data presensi.")}finally{he(!1)}},$e=async()=>{if(!S?.existingAttendance)return;if(await me({title:"Hapus Log Presensi",message:`Apakah Anda yakin ingin menghapus catatan presensi untuk ${g?.nama} pada tanggal ${S.dateFormatted}? Status hari tersebut akan direset.`,type:"danger",confirmText:"Ya, Hapus Data",cancelText:"Batal"}))try{const s=await ce.delete(route("admin.attendances.destroy",S.existingAttendance.id));$.success(s.data?.message||"Presensi berhasil dihapus."),_(null),await re(g.id),U()}catch(s){console.error("Gagal menghapus presensi:",s),$.error(s.response?.data?.message||"Gagal menghapus data presensi.")}};return e.jsxs(xe,{show:u,onClose:v,maxWidth:"5xl",closeable:!1,children:[e.jsxs("div",{className:"p-5 sm:p-7 flex flex-col max-h-[92vh] overflow-y-auto",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-slate-100 pb-3",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"})})}),e.jsxs("div",{children:[e.jsxs("h3",{className:"text-base font-extrabold text-slate-800 flex items-center gap-2",children:["Kalender Presensi Peserta",h&&e.jsx("span",{className:"text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100",children:h.nama_workcode})]}),e.jsx("p",{className:"text-xs text-slate-500 font-medium",children:"Klik kotak tanggal pada kalender untuk menambah, mengedit, atau menghapus presensi."})]})]}),e.jsx("button",{type:"button",onClick:v,className:"rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]}),e.jsxs("div",{className:"mt-3.5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center flex-1",children:[e.jsxs("div",{className:"relative flex-1 sm:max-w-md",children:[e.jsxs("div",{className:"relative",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"})}),e.jsx("input",{type:"text",placeholder:"Cari nama peserta / NIP...",value:D,onChange:a=>{X(a.target.value),ee(!0)},onFocus:()=>ee(!0),className:"w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-7 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium shadow-xs"}),D&&e.jsx("button",{type:"button",onClick:()=>X(""),className:"absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs",children:"✕"})]}),le&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0 z-20",onClick:()=>ee(!1)}),e.jsx("div",{className:"absolute left-0 right-0 top-full mt-1.5 z-30 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl py-1",children:ge.length===0?e.jsx("div",{className:"px-4 py-3 text-xs text-slate-500 text-center font-medium",children:"Tidak ada peserta ditemukan."}):ge.map(a=>e.jsxs("button",{type:"button",onClick:()=>{I(a),X(""),ee(!1)},className:`w-full px-3.5 py-1.5 text-left text-xs flex items-center justify-between hover:bg-indigo-50/70 transition-colors ${g?.id===a.id?"bg-indigo-50 text-indigo-700 font-bold":"text-slate-700"}`,children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700",children:(a.nama||"").charAt(0).toUpperCase()}),e.jsxs("div",{children:[e.jsx("p",{className:"font-bold text-slate-800 leading-tight",children:a.nama}),e.jsxs("p",{className:"text-[9px] text-slate-500 font-mono",children:["NIP: ",a.nis_nip||"-"]})]})]}),e.jsx("span",{className:"text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold",children:a.status||"-"})]},a.id))})]})]}),g&&e.jsxs("div",{className:"flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200/90 shadow-xs shrink-0",children:[e.jsx("div",{className:"flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-extrabold text-white",children:(g.nama||"").charAt(0).toUpperCase()}),e.jsxs("div",{className:"leading-tight",children:[e.jsx("p",{className:"text-xs font-extrabold text-slate-800",children:g.nama}),e.jsxs("p",{className:"text-[10px] text-slate-500 font-medium",children:["NIP: ",e.jsx("span",{className:"font-mono",children:g.nis_nip||"-"})," • ",g.status||"-"]})]})]})]}),e.jsxs("div",{className:"flex items-center justify-between sm:justify-end gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200/90 shadow-xs shrink-0",children:[e.jsx("button",{type:"button",onClick:j,className:"flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors",title:"Bulan Sebelumnya",children:"❮"}),e.jsxs("h4",{className:"text-xs font-extrabold text-slate-800 px-2 min-w-[130px] text-center",children:[Fe[m]," ",k]}),e.jsx("button",{type:"button",onClick:be,className:"flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors",title:"Bulan Berikutnya",children:"❯"}),e.jsx("button",{type:"button",onClick:Le,className:"ml-1 px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors",children:"Bulan Ini"})]})]}),e.jsxs("div",{className:"mt-3 bg-white rounded-2xl border border-slate-200 p-2.5 shadow-xs",children:[e.jsx("div",{className:"grid grid-cols-7 gap-1 sm:gap-1.5 mb-1 sm:mb-1.5 text-center",children:tt.map((a,s)=>e.jsxs("div",{className:`py-1 text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider rounded-lg ${s===0||s===6?"text-red-500 bg-red-50/60":"text-slate-500 bg-slate-50"}`,children:[e.jsx("span",{className:"sm:hidden",children:a.charAt(0)}),e.jsx("span",{className:"hidden sm:inline",children:a})]},s))}),ae?e.jsxs("div",{className:"py-16 text-center text-xs font-semibold text-slate-500 flex flex-col items-center gap-2",children:[e.jsx("div",{className:"h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"}),"Memuat data kalender presensi..."]}):e.jsx("div",{className:"grid grid-cols-7 gap-1 sm:gap-1.5",children:Ce.map((a,s)=>{const b=a.attendance,c=a.isCurrentMonth;return e.jsxs("div",{onClick:()=>c&&Ae(a),className:`group min-h-[44px] sm:min-h-[64px] rounded-xl p-0.5 sm:p-1.5 flex flex-col justify-between transition-all select-none ${c?"border border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer "+(a.isToday?"bg-indigo-50/20 ring-2 ring-indigo-500/30":"bg-white hover:bg-slate-50/50"):"bg-slate-50/40 text-slate-300 border border-transparent cursor-not-allowed opacity-30"}`,children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-1.5 min-w-0",children:[e.jsx("span",{title:a.holidayName||"",className:`text-xs font-bold leading-none shrink-0 ${c?a.isToday?"flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white font-black text-[10px]":a.isWeekend||a.isHoliday?"text-red-500":"text-slate-700":"text-slate-300"}`,children:a.dayNumber}),c&&a.isHoliday&&e.jsx("span",{className:"text-[8px] font-bold text-red-600 bg-red-50 border border-red-100 px-1 rounded truncate max-w-[45px] sm:max-w-[70px]",title:a.holidayName,children:a.holidayName})]}),c&&!b&&e.jsx("span",{className:"text-[10px] text-slate-300 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold shrink-0",children:"+"})]}),c&&b&&e.jsxs("div",{className:"mt-1 flex flex-col gap-0.5",children:[b.status==="hadir"&&e.jsxs("div",{className:"rounded-md bg-emerald-50 border border-emerald-200 px-1 py-0.5 text-center",children:[e.jsx("span",{className:"text-[9px] font-black text-emerald-700 block leading-tight",children:"✓ HADIR"}),(b.jam_masuk||b.jam_pulang)&&e.jsxs("span",{className:"text-[8px] font-medium text-emerald-600 block leading-tight font-mono",children:[b.jam_masuk||"–"," - ",b.jam_pulang||"–"]})]}),b.status==="alpha"&&e.jsx("div",{className:"rounded-md bg-red-50 border border-red-200 px-1 py-0.5 text-center",children:e.jsx("span",{className:"text-[9px] font-black text-red-700 block leading-tight",children:"✗ ALPHA"})}),b.status==="izin"&&e.jsx("div",{className:"rounded-md bg-amber-50 border border-amber-200 px-1 py-0.5 text-center",children:e.jsx("span",{className:"text-[9px] font-black text-amber-700 block leading-tight",children:"! IZIN"})}),b.status==="sakit"&&e.jsx("div",{className:"rounded-md bg-blue-50 border border-blue-200 px-1 py-0.5 text-center",children:e.jsx("span",{className:"text-[9px] font-black text-blue-700 block leading-tight",children:"+ SAKIT"})}),b.status==="lupa_absen"&&e.jsx("div",{className:"rounded-md bg-slate-100 border border-slate-300 px-1 py-0.5 text-center",children:e.jsx("span",{className:"text-[9px] font-black text-slate-700 block leading-tight",children:"? LUPA ABSEN"})}),b.status==="libur"&&e.jsx("div",{className:"rounded-md bg-rose-50 border border-rose-200 px-1 py-0.5 text-center",children:e.jsx("span",{className:"text-[9px] font-black text-rose-700 block leading-tight",children:"★ LIBUR"})})]}),c&&!b&&e.jsx("div",{className:"h-3 flex items-center justify-center",children:e.jsx("span",{className:"text-[9px] text-slate-300 font-medium group-hover:hidden",children:"-"})})]},s)})})]}),e.jsxs("div",{className:"mt-3.5 flex flex-wrap items-center justify-between gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200",children:[e.jsxs("div",{className:"flex flex-wrap items-center gap-3 sm:gap-5 text-xs",children:[e.jsxs("span",{className:"text-[11px] font-bold text-slate-500 uppercase tracking-wider",children:["Rekap ",Fe[m],":"]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-emerald-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-emerald-500"})," Hadir: ",W.hadir]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-amber-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-amber-500"})," Izin: ",W.izin]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-blue-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-blue-500"})," Sakit: ",W.sakit]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-red-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-red-500"})," Alpha: ",W.alpha]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-slate-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-slate-400"})," Lupa Absen: ",W.lupaAbsen]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-rose-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-rose-500"})," Libur: ",W.libur]})]}),e.jsx(Se,{onClick:v,className:"text-xs",children:"Tutup"})]})]}),S&&e.jsx("div",{className:"fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]",children:e.jsxs("div",{className:"relative w-full max-w-lg rounded-xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150",onClick:a=>a.stopPropagation(),children:[e.jsxs("div",{className:"flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100/70 text-indigo-600 shadow-xs",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"})})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-sm font-black text-slate-800",children:S.existingAttendance?"Edit Data Presensi":"Input Presensi Manual"}),e.jsx("p",{className:"text-xs font-bold text-indigo-600",children:S.dateFormatted})]})]}),e.jsx("button",{type:"button",onClick:()=>_(null),className:"rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition-colors",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]}),e.jsxs("form",{onSubmit:T,className:"p-6 space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80",children:[e.jsx("div",{className:"flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shrink-0",children:(g?.nama||"P").charAt(0).toUpperCase()}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("p",{className:"text-xs font-extrabold text-slate-800 truncate leading-tight",children:g?.nama}),e.jsxs("p",{className:"text-[10px] text-slate-500 font-mono leading-tight",children:["NIP: ",g?.nis_nip||"-"," • ",g?.status||"-"]})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-extrabold text-slate-700 mb-2",children:"Pilih Status Kehadiran:"}),e.jsx("div",{className:"grid grid-cols-3 gap-2",children:[{key:"hadir",label:"Hadir",icon:"✓",activeBg:"bg-emerald-600 text-white border-emerald-600 shadow-emerald-200 shadow-md"},{key:"izin",label:"Izin",icon:"!",activeBg:"bg-amber-500 text-white border-amber-500 shadow-amber-200 shadow-md"},{key:"sakit",label:"Sakit",icon:"+",activeBg:"bg-blue-600 text-white border-blue-600 shadow-blue-200 shadow-md"},{key:"lupa_absen",label:"Lupa Absen",icon:"?",activeBg:"bg-slate-700 text-white border-slate-700 shadow-slate-200 shadow-md"},{key:"alpha",label:"Alpha",icon:"✗",activeBg:"bg-red-600 text-white border-red-600 shadow-red-200 shadow-md"},{key:"libur",label:"Libur",icon:"★",activeBg:"bg-rose-600 text-white border-rose-600 shadow-rose-200 shadow-md"}].map(a=>{const s=w.status===a.key;return e.jsxs("button",{type:"button",onClick:()=>L({...w,status:a.key}),className:`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 select-none ${s?a.activeBg:"bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"}`,children:[e.jsx("span",{className:"font-mono text-xs",children:a.icon}),e.jsx("span",{children:a.label})]},a.key)})}),e.jsx(Z,{message:K.status?.[0]||K.status,className:"mt-1 text-xs"})]}),!["alpha","libur"].includes(w.status)&&e.jsxs("div",{className:"p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-[11px] font-extrabold text-slate-600 uppercase tracking-wider",children:"Jam Kehadiran"}),e.jsx("div",{className:"flex items-center gap-1.5 text-[10px]",children:e.jsx("button",{type:"button",onClick:()=>{L({...w,jam_masuk:"07:00",jam_pulang:"15:30"})},className:"px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 font-semibold transition-colors",children:"Preset Normal (07:00 - 15:30)"})})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{children:[e.jsx("label",{htmlFor:"modal_jam_masuk",className:"block text-[11px] font-bold text-slate-600 mb-1",children:"Jam Datang"}),e.jsx("input",{id:"modal_jam_masuk",type:"time",value:w.jam_masuk,onChange:a=>L({...w,jam_masuk:a.target.value}),className:"w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-mono font-bold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-xs"}),e.jsx(Z,{message:K.jam_masuk?.[0]||K.jam_masuk,className:"mt-0.5 text-[10px]"})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"modal_jam_pulang",className:"block text-[11px] font-bold text-slate-600 mb-1",children:"Jam Pulang"}),e.jsx("input",{id:"modal_jam_pulang",type:"time",value:w.jam_pulang,onChange:a=>L({...w,jam_pulang:a.target.value}),className:"w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-mono font-bold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-xs"}),e.jsx(Z,{message:K.jam_pulang?.[0]||K.jam_pulang,className:"mt-0.5 text-[10px]"})]})]})]}),e.jsxs("div",{className:"pt-3 border-t border-slate-100 flex items-center justify-between gap-3",children:[e.jsx("div",{children:S.existingAttendance&&e.jsxs("button",{type:"button",onClick:$e,disabled:B,className:"inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 border border-red-200/80 rounded-xl transition-all active:scale-95 shadow-xs disabled:opacity-50",title:"Hapus presensi dan reset status pada tanggal ini",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3.5 w-3.5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"})}),"Hapus Presensi"]})}),e.jsxs("div",{className:"flex items-center gap-2 ml-auto",children:[e.jsx("button",{type:"button",onClick:()=>_(null),className:"px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors",children:"Batal"}),e.jsxs("button",{type:"submit",disabled:B,className:`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 ${S.existingAttendance?"bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-200":"bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-200"}`,children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3.5 w-3.5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2.5,d:"M5 13l4 4L19 7"})}),B?"Menyimpan...":S.existingAttendance?"Perbarui Presensi":"Simpan Presensi"]})]})]})]})]})})]})}function gt({workcodes:u=[],activeWorkcodes:v=[],selectedWorkcodeId:h,selectedWorkcode:n,stats:N,attendances:U=[],participants:$=[],kepalaSekolahNama:me="Muhtarom, S.Pd., M.Si.",kepalaSekolahNip:g="197205172006041015"}){const{flash:I}=Be().props,{toast:D}=We(),X=Je(),[le,ee]=r.useState(""),[P,k]=r.useState(""),[te,m]=r.useState(!1),[z,M]=r.useState(!1),[pe,ae]=r.useState(!1),[ue,R]=r.useState(null),[f,S]=r.useState(null),[_,w]=r.useState(null),[L,B]=r.useState(null),[he,K]=r.useState(""),[p,re]=r.useState(null),[ge,ie]=r.useState(!1),j=Ue({id:null,tanggal:"",jam_masuk:"",jam_pulang:"",status:"hadir"}),be=te||z||pe||f!==null||_!==null;r.useEffect(()=>{if(be)return;const t=()=>Xe({only:["stats","attendances","participants","activeWorkcodes"],preserveScroll:!0,preserveState:!0}),l=window.setInterval(t,Ze(2e4)),i=()=>document.visibilityState==="visible"&&t();return document.addEventListener("visibilitychange",i),()=>{window.clearInterval(l),document.removeEventListener("visibilitychange",i)}},[be]),r.useEffect(()=>{I?.success?D.success(I.success):I?.error&&D.error(I.error)},[I]);const Le=["PNS","PPPK","PPPK Paruh Waktu","GTT","PTT"],Ce=U.map(t=>t.status_pegawai).filter(Boolean).sort(),W=[...new Set([...Le,...Ce])],Ae=t=>{ye.get(route("report"),{workcode_id:t},{preserveState:!0,preserveScroll:!0})},T=U.filter(t=>{const l=(t.nama||"").toLowerCase().includes(le.toLowerCase())||(t.nis_nip||"").toLowerCase().includes(le.toLowerCase()),i=P===""||t.status_pegawai===P;return l&&i}),$e=T.slice(0,5),a=N&&N.total>0?Math.round(N.hadir/N.total*100):0,s=n?.kategori==="workcode",b=t=>t?new Intl.DateTimeFormat("id-ID",{day:"numeric",month:"long",year:"numeric"}).format(new Date(`${t}T00:00:00`)):"-",c=(t,l="")=>{const i=t.waktu_hadir&&t.waktu_hadir!=="-"?String(t.waktu_hadir):"",q=i.match(/^(\d{4}-\d{2}-\d{2})/)?.[1]||"",V=i.match(/(\d{2}:\d{2})(?::\d{2})?$/)?.[1]||"";K(l||t.nama||"Peserta"),j.setData({id:t.id,tanggal:t.tanggal||q||new Date().toISOString().split("T")[0],jam_masuk:t.jam_masuk||V,jam_pulang:s?"":t.jam_pulang||"",status:t.status||"hadir"}),m(!0)},H=async(t,l,i,q)=>{if(n){ie(!0);try{const O=await(await fetch(Ee(`report/individual/${n.id}/${t}`))).json();re({id:t,nama:l||O.participant.nama,nis_nip:i||O.participant.nis_nip,status_pegawai:q||O.participant.status,attendances:O.attendances||[]}),M(!0)}catch(V){console.error("Gagal mengambil data riwayat:",V),D.error("Gagal memuat riwayat presensi.")}finally{ie(!1)}}},oe=t=>{t.preventDefault(),j.put(route("admin.attendances.update",j.data.id),{preserveScroll:!0,onSuccess:()=>{m(!1),j.reset(),z&&p&&H(p.id,p.nama,p.nis_nip,p.status_pegawai)}})},se=async(t,l,i)=>{await X({title:"Hapus Log Presensi",message:`Apakah Anda yakin ingin menghapus catatan presensi ${l?`untuk "${l}"`:""} ${i?`tanggal ${i}`:""}? Tindakan ini akan menghapus data kehadiran/alpha/izin hari tersebut.`,type:"danger",confirmText:"Ya, Hapus Data",cancelText:"Batal"})&&ye.delete(route("admin.attendances.destroy",t),{preserveScroll:!0,onSuccess:()=>{z&&p&&H(p.id,p.nama,p.nis_nip,p.status_pegawai)}})},x=()=>{if(!n)return;const t=window.open("","_blank","width=800,height=900"),l=["pns","pppk","pppk paruh waktu"],i=o=>{const y=l.indexOf((o||"").trim().toLowerCase().replace(/\s+/g," "));return y===-1?l.length:y},V=[...T].sort((o,y)=>i(o.status_pegawai)-i(y.status_pegawai)||o.nama.localeCompare(y.nama,"id",{sensitivity:"base"})).map((o,y)=>`
            <tr>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${y+1}</td>
                <td style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px;">${o.nama}</td>
                <td style="text-align: center; padding: 7px 6px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 10.5px; white-space: nowrap;">${o.nis_nip&&o.nis_nip!=="null"?o.nis_nip:"-"}</td>
                <td style="padding: 7px 6px; border: 1px solid #cbd5e1; font-size: 11px; white-space: nowrap;">${o.status_pegawai||"-"}</td>
                ${n.kategori==="harian"?`
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${o.total_alpha||"0"}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${o.total_izin||"0"}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${o.total_sakit||"0"}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${o.total_lupa_absen||"0"}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${o.total_menit_terlambat?o.total_menit_terlambat+" Menit":"0 Menit"}</td>
                    `:`
                        <td style="text-align: center; padding: 7px 6px; border: 1px solid #cbd5e1; font-size: 11px; white-space: nowrap;">${o.waktu_hadir}</td>
                        <td style="text-align: center; padding: 7px 6px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px; white-space: nowrap;">${o.status?o.status.replace("_"," ").toUpperCase():"-"}</td>
                    `}
            </tr>
        `).join(""),O=n.kategori==="harian"?`
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
                <th style="width: 5%;">No</th>
                <th>Nama Lengkap</th>
                <th style="width: 22%;">NIP</th>
                <th style="width: 17%;">Status Pegawai</th>
                <th style="width: 11%;">Jam Hadir</th>
                <th style="width: 10%;">Status</th>
            `,Te=n.kategori==="harian"?9:6,ne=(o,y={weekday:"long",day:"numeric",month:"long",year:"numeric"})=>new Date(`${String(o).slice(0,10)}T00:00:00`).toLocaleDateString("id-ID",y),fe=["","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"];let F="-",je=new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"});if(n.kategori==="harian"){const o=[...n.hari_aktif||[]].map(Number).sort((y,de)=>y-de);o.length&&(F=`Setiap ${o.map(y=>fe[y]).join(", ")}`)}else{const o=T.map(de=>de.tanggal).filter(Boolean).sort()[0],y=n.tanggal||o;y&&(F=ne(y),je=ne(y,{day:"numeric",month:"long",year:"numeric"}))}t.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Rekap Presensi - ${n.nama_workcode}</title>
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
                            <td>${n.nama_workcode}</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold;">Kategori Presensi</td>
                            <td>:</td>
                            <td style="text-transform: capitalize;">${n.kategori==="harian"?"Presensi Harian":"Presensi Sekali / Event"}</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold;">Tanggal Kegiatan</td>
                            <td>:</td>
                            <td>${F}</td>
                        </tr>
                    </table>
                </div>

                <table class="data-table"${n.kategori==="harian"?"":' style="table-layout: fixed;"'}>
                    <thead>
                        <tr>
                            ${O}
                        </tr>
                    </thead>
                    <tbody>
                        ${V||`<tr><td colspan="${Te}" style="text-align:center; padding: 10px;">Belum ada data kehadiran</td></tr>`}
                    </tbody>
                </table>

                <div class="ttd-section">
                    <div class="ttd-box">
                        <p>Babat, ${je}</p>
                        <p style="margin-bottom: 5px;">Kepala Sekolah,</p>
                        <div class="ttd-qr-wrap" style="display: flex; justify-content: center; margin: 10px 0;">
                            <img src="${window.location.origin}/workcodes/${n.id}/qr-signature?logo=1" style="width: 90px; height: 90px;" alt="QR TTD" />
                        </div>
                        <p style="font-weight: bold; text-decoration: underline; font-size: 13px;">${me}</p>
                        <p style="font-size: 11px; color: #475569; font-family: Arial, sans-serif;">NIP. ${g}</p>
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        setTimeout(function() { window.focus(); window.print(); }, 600);
                    };
                <\/script>
            </body>
            </html>
        `),t.document.close()},J=async(t,l)=>{if(n)try{const i=new Date,q=i.getFullYear(),V=i.getMonth()+1,O=i.toLocaleDateString("id-ID",{month:"long",year:"numeric"}),ne=await(await fetch(Ee(`report/individual/${n.id}/${t}?year=${q}&month=${V}`))).json(),fe=window.open("","_blank","width=800,height=900"),F=(ne.attendances||[]).slice().sort((d,Me)=>{const we=d.tanggal||"",ve=Me.tanggal||"";return we.localeCompare(ve)}),je=F.map((d,Me)=>{let we="-";if(d.tanggal){const[Oe,Ge,Ye]=d.tanggal.split("-").map(Number);we=new Date(Oe,Ge-1,Ye).toLocaleDateString("id-ID",{weekday:"long",day:"2-digit",month:"long",year:"numeric"})}let ve=d.jam_masuk||(d.waktu_hadir!=="-"?d.waktu_hadir:"-"),He=d.jam_pulang||(d.waktu_pulang!=="-"?d.waktu_pulang:"-");d.status==="libur"&&(ve="-",He="-");let G=(d.status||"hadir").toUpperCase(),Y="#0f172a";return d.status==="hadir"||!d.status?d.is_late?(G="TERLAMBAT",Y="#b91c1c"):(G="HADIR",Y="#15803d"):d.status==="terlambat"?(G="TERLAMBAT",Y="#b91c1c"):d.status==="izin"?(G="IZIN",Y="#b45309"):d.status==="sakit"?(G="SAKIT",Y="#1d4ed8"):d.status==="alpha"?(G="ALPHA",Y="#b91c1c"):d.status==="lupa_absen"&&(G="LUPA ABSEN",Y="#475569"),`
                    <tr>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${Me+1}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${we}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${ve}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${He}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px; color: ${Y};">${G}</td>
                    </tr>
                `}).join(""),o=F.filter(d=>d.status==="alpha").length,y=F.filter(d=>d.status==="izin").length,de=F.filter(d=>d.status==="sakit").length,Ve=F.filter(d=>d.status==="lupa_absen").length;fe.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Rekap Kehadiran - ${l}</title>
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
                                <td style="font-weight: bold;">${l}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">NIP</td>
                                <td>:</td>
                                <td style="font-family: monospace;">${ne.participant.nis_nip||"-"}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">Status Kepegawaian</td>
                                <td>:</td>
                                <td>${ne.participant.status||"-"}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">WorkCode</td>
                                <td>:</td>
                                <td>${n.nama_workcode}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">Periode Bulan</td>
                                <td>:</td>
                                <td>${O}</td>
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
                                <td style="width: 25%; color: #b91c1c;">${o} Hari</td>
                                <td style="width: 25%; color: #b45309;">${y} Hari</td>
                                <td style="width: 25%; color: #1d4ed8;">${de} Hari</td>
                                <td style="width: 25%; color: #475569;">${Ve} Hari</td>
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
                            ${je||'<tr><td colspan="5" style="text-align:center; padding: 10px;">Belum ada data kehadiran</td></tr>'}
                        </tbody>
                    </table>

                    <div class="ttd-section">
                        <div class="ttd-box">
                            <p>Babat, ${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</p>
                            <p style="margin-bottom: 5px;">Kepala Sekolah,</p>
                            <div class="ttd-qr-wrap" style="display: flex; justify-content: center; margin: 10px 0;">
                                <img src="${window.location.origin}/workcodes/${n.id}/qr-signature?logo=1" style="width: 90px; height: 90px;" alt="QR TTD" />
                            </div>
                            <p style="font-weight: bold; text-decoration: underline; font-size: 13px;">${me}</p>
                            <p style="font-size: 11px; color: #475569; font-family: Arial, sans-serif;">NIP. ${g}</p>
                        </div>
                    </div>

                    <script>
                        window.onload = function() {
                            setTimeout(function() { window.focus(); window.print(); }, 600);
                        };
                    <\/script>
                </body>
                </html>
            `),fe.document.close()}catch(i){console.error("Gagal mengambil data rekap:",i),D.error("Terjadi kesalahan saat memuat rekap individu.")}},A=t=>{const l="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase leading-4 text-white";switch(t){case"hadir":return e.jsx("span",{className:`${l} bg-gradient-to-b from-emerald-400 to-emerald-600`,children:"Hadir"});case"alpha":return e.jsx("span",{className:`${l} bg-gradient-to-b from-rose-400 to-rose-600`,children:"Alpha"});case"izin":return e.jsx("span",{className:`${l} bg-gradient-to-b from-amber-400 to-orange-500`,children:"Izin"});case"sakit":return e.jsx("span",{className:`${l} bg-gradient-to-b from-sky-400 to-sky-600`,children:"Sakit"});case"lupa_absen":return e.jsx("span",{className:`${l} bg-gradient-to-b from-neutral-400 to-neutral-600`,children:"Lupa absen"});default:return e.jsx("span",{className:"text-xs text-neutral-400",children:"-"})}},C=n?.kategori==="harian",E="inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900",Pe=t=>{const l=$.find(i=>i.id===t.participant_id)||{id:t.participant_id,nama:t.nama,nis_nip:t.nis_nip,status:t.status_pegawai};R(l),ae(!0)};return e.jsxs(Qe,{children:[e.jsx(qe,{title:"Laporan Kehadiran"}),e.jsxs("div",{className:"flex w-full flex-1 flex-col px-4 py-2 sm:px-6 xl:min-h-0 xl:overflow-hidden",children:[e.jsxs("div",{className:"mb-4 shrink-0 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between","data-aos":"fade-up",children:[e.jsxs("div",{className:"min-w-0",children:[e.jsx("h3",{className:"text-xl font-bold text-neutral-800",children:"Laporan Kehadiran"}),e.jsx("p",{className:"mt-0.5 text-sm text-neutral-500",children:v.length>1?`${v.length} workcode aktif bersamaan: ${v.map(t=>t.nama_workcode).join(" · ")}`:"Rekap kehadiran per workcode, lengkap dengan bukti presensi."})]}),e.jsxs("div",{className:"flex flex-col gap-2 sm:flex-row sm:items-center",children:[e.jsx("label",{htmlFor:"workcode-filter",className:"sr-only",children:"Pilih workcode laporan"}),e.jsxs("select",{id:"workcode-filter",value:h||"",onChange:t=>Ae(t.target.value),className:"input-soft min-w-0 sm:w-72",children:[u.length===0&&e.jsx("option",{value:"",children:"Belum ada workcode"}),u.map(t=>e.jsxs("option",{value:t.id,children:[t.is_active?"● ":"",t.nama_workcode," (",t.attendances_count," hadir)"]},t.id))]}),h&&e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("a",{href:route("workcodes.export",h),className:"btn-soft flex-1 sm:flex-none",title:"Ekspor Excel (.xlsx)",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:1.75,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"})}),"Ekspor Excel"]}),e.jsxs("button",{type:"button",onClick:x,className:"btn-brand flex-1 sm:flex-none",title:"Cetak bukti hadir",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:1.75,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"})}),"Cetak"]})]})]})]}),e.jsxs("section",{className:"grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",children:[e.jsx(Ne,{delay:0,label:"Total Peserta",value:N.total,icon:Q.users,children:e.jsx("span",{className:"truncate",children:n?.nama_workcode||"belum ada workcode"})}),e.jsxs(Ne,{delay:50,label:"Hadir",value:N.hadir,icon:Q.check,children:[e.jsxs("span",{className:"font-bold text-emerald-600",children:[a,"%"]})," dari total peserta"]}),e.jsxs(Ne,{delay:100,label:"Belum Hadir",value:N.belum,icon:Q.clock,children:[e.jsxs("span",{className:"font-bold text-rose-500",children:[N.total>0?100-a:0,"%"]})," belum tercatat"]}),e.jsx(Ne,{delay:150,label:"Persentase Kehadiran",value:`${a}%`,icon:Q.chart,children:e.jsx("span",{className:"mt-1.5 block h-1 overflow-hidden rounded-full bg-neutral-200",children:e.jsx("span",{className:"block h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000 ease-out",style:{width:`${a}%`}})})})]}),e.jsxs("section",{className:"card-soft mt-4 flex min-h-0 flex-1 flex-col overflow-hidden","data-aos":"fade-up","data-aos-delay":"100",children:[e.jsxs("div",{className:"flex flex-col gap-3 p-4 pb-3 lg:flex-row lg:items-center lg:justify-between",children:[e.jsxs("div",{children:[e.jsx("h6",{className:"text-base font-semibold text-neutral-800",children:C?"Rekap Presensi Harian":"Daftar Kehadiran"}),e.jsxs("p",{className:"mt-0.5 flex items-center gap-1 text-sm text-neutral-500",children:[e.jsx("span",{className:"h-4 w-4 text-emerald-500",children:Q.check}),e.jsx("span",{className:"font-bold text-neutral-700",children:T.length})," baris ditampilkan"]})]}),e.jsxs("div",{className:"flex flex-col gap-2 sm:flex-row lg:flex-1 lg:justify-end lg:pl-8",children:[e.jsxs("div",{className:"relative min-w-0 sm:flex-1 lg:max-w-2xl",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:2,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"})}),e.jsx("input",{type:"search",placeholder:"Cari nama atau NIP…",value:le,onChange:t=>ee(t.target.value),className:"input-soft pl-9"})]}),e.jsxs("select",{value:P,onChange:t=>k(t.target.value),className:"input-soft sm:w-48 sm:shrink-0","aria-label":"Filter status pegawai",children:[e.jsx("option",{value:"",children:"Semua status pegawai"}),W.map((t,l)=>e.jsx("option",{value:t,children:t},l))]})]})]}),e.jsx("ul",{className:"divide-y divide-neutral-100 border-t border-neutral-200 sm:hidden",children:T.length===0?e.jsx("li",{className:"px-4 py-10 text-center text-sm text-neutral-400",children:"Belum ada data kehadiran."}):$e.map((t,l)=>e.jsxs("li",{className:"space-y-3 px-4 py-3",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(ze,{name:t.nama}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("p",{className:"truncate text-sm font-semibold text-neutral-800",children:t.nama}),e.jsxs("p",{className:"truncate text-xs text-neutral-500",children:[t.nis_nip||"-"," · ",t.status_pegawai||"-"]})]})]}),C?e.jsxs("div",{className:"grid grid-cols-4 gap-2 text-center",children:[e.jsx(_e,{label:"Alpha",value:t.total_alpha||0,tone:"text-rose-600"}),e.jsx(_e,{label:"Izin",value:t.total_izin||0,tone:"text-amber-600"}),e.jsx(_e,{label:"Sakit",value:t.total_sakit||0,tone:"text-sky-600"}),e.jsx(_e,{label:"Telat",value:t.total_menit_terlambat?`${t.total_menit_terlambat}m`:0,tone:"text-orange-600"})]}):e.jsxs("div",{className:"flex items-center justify-between gap-3",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-xs font-bold tabular-nums text-neutral-800",children:t.status!=="libur"?t.waktu_hadir:"-"}),A(t.status)]}),e.jsx(Ke,{attendance:t,onOpen:()=>S(t)})]}),e.jsx("div",{className:"flex flex-wrap gap-1",children:C?e.jsxs("button",{type:"button",onClick:()=>w(t),className:E,children:[e.jsx(Re,{}),"Detail"]}):e.jsx("button",{type:"button",onClick:()=>c(t,t.nama),className:E,children:"Edit presensi"})})]},t.id||t.participant_id||l))}),e.jsx("div",{className:"hidden min-h-0 flex-1 overflow-auto sm:block sm:max-h-[474px] xl:max-h-none",children:e.jsxs("table",{className:"w-full min-w-full text-left",children:[e.jsx("thead",{className:"sticky top-0 z-10 bg-white",children:e.jsxs("tr",{className:"border-y border-neutral-200 text-xs font-semibold uppercase text-neutral-500 [&>th]:opacity-70",children:[e.jsx("th",{className:"w-12 px-4 py-3 text-center",children:"No"}),e.jsx("th",{className:"px-4 py-3",children:"Peserta"}),e.jsx("th",{className:"px-4 py-3",children:"Status Pegawai"}),C?e.jsxs(e.Fragment,{children:[e.jsx("th",{className:"px-2 py-3 text-center",children:"Alpha"}),e.jsx("th",{className:"px-2 py-3 text-center",children:"Izin"}),e.jsx("th",{className:"px-2 py-3 text-center",children:"Sakit"}),e.jsx("th",{className:"px-2 py-3 text-center",children:"Lupa Absen"}),e.jsx("th",{className:"px-2 py-3 text-center",children:"Terlambat"}),e.jsx("th",{className:"px-4 py-3 text-right",children:"Aksi"})]}):e.jsxs(e.Fragment,{children:[e.jsx("th",{className:"px-4 py-3",children:"Waktu Hadir"}),e.jsx("th",{className:"px-3 py-3 text-center",children:"Status"}),e.jsx("th",{className:"px-3 py-3 text-center",children:"Metode & Bukti"}),e.jsx("th",{className:"px-4 py-3 text-right",children:"Aksi"})]})]})}),e.jsx("tbody",{children:T.length===0?e.jsx("tr",{children:e.jsxs("td",{colSpan:C?9:7,className:"px-4 py-16 text-center",children:[e.jsx("p",{className:"text-sm font-medium text-neutral-600",children:"Belum ada peserta yang hadir"}),e.jsx("p",{className:"mt-0.5 text-xs text-neutral-400",children:"Data kehadiran pada workcode ini masih kosong."})]})}):T.map((t,l)=>e.jsxs("tr",{className:"border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50",children:[e.jsx("td",{className:"px-4 py-2.5 text-center text-xs font-medium tabular-nums text-neutral-500",children:l+1}),e.jsx("td",{className:"px-4 py-2.5",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(ze,{name:t.nama}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("p",{className:"text-sm font-semibold leading-snug text-neutral-800",children:t.nama}),e.jsx("p",{className:"text-xs text-neutral-500",children:t.nis_nip||"-"})]})]})}),e.jsx("td",{className:"px-4 py-2.5 text-xs font-medium text-neutral-600",children:t.status_pegawai||"-"}),C?e.jsxs(e.Fragment,{children:[e.jsx("td",{className:"px-2 py-2.5 text-center text-xs font-bold tabular-nums text-rose-600",children:t.total_alpha||0}),e.jsx("td",{className:"px-2 py-2.5 text-center text-xs font-bold tabular-nums text-amber-600",children:t.total_izin||0}),e.jsx("td",{className:"px-2 py-2.5 text-center text-xs font-bold tabular-nums text-sky-600",children:t.total_sakit||0}),e.jsx("td",{className:"px-2 py-2.5 text-center text-xs font-bold tabular-nums text-neutral-600",children:t.total_lupa_absen||0}),e.jsxs("td",{className:"px-2 py-2.5 text-center text-xs font-bold tabular-nums text-orange-600",children:[t.total_menit_terlambat||0," mnt"]}),e.jsx("td",{className:"px-4 py-2.5",children:e.jsx("div",{className:"flex items-center justify-end",children:e.jsxs("button",{type:"button",onClick:()=>w(t),className:E,title:"Kalender, log foto wajah & cetak rekap",children:[e.jsx(Re,{}),"Detail"]})})})]}):e.jsxs(e.Fragment,{children:[e.jsx("td",{className:"px-4 py-2.5 text-xs font-bold tabular-nums text-neutral-800",children:t.status==="libur"?"-":t.waktu_hadir}),e.jsx("td",{className:"px-3 py-2.5 text-center",children:A(t.status)}),e.jsx("td",{className:"px-3 py-2 text-center",children:e.jsxs("div",{className:"flex flex-col items-center gap-1",children:[e.jsx("span",{className:"text-[11px] font-bold uppercase text-neutral-600",children:t.attendance_method||"—"}),e.jsx(Ke,{attendance:t,onOpen:()=>S(t)})]})}),e.jsx("td",{className:"px-4 py-2.5",children:e.jsxs("div",{className:"flex items-center justify-end gap-1",children:[e.jsx("button",{type:"button",onClick:()=>c(t,t.nama),className:E,title:"Edit presensi",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:1.75,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"})})}),e.jsx("button",{type:"button",onClick:()=>se(t.id,t.nama,t.waktu_hadir),className:`${E} hover:!bg-rose-50 hover:!text-rose-600`,title:"Hapus presensi",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:1.75,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"})})})]})})]})]},t.id||t.participant_id||l))})]})})]})]}),e.jsx(xe,{show:!!f,onClose:()=>S(null),maxWidth:"lg",children:f&&e.jsxs("div",{className:"p-5 sm:p-6",children:[e.jsxs("div",{className:"flex items-start justify-between gap-4 border-b border-slate-100 pb-4",children:[e.jsxs("div",{className:"flex min-w-0 items-center gap-3",children:[e.jsx("div",{className:"flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 12.75 11.25 15 15 9.75M12 3C7.03 3 3 5.015 3 7.5c0 1.381 1.244 2.617 3.2 3.442L5.25 15l4.307-2.154C10.337 12.946 11.156 13 12 13c4.97 0 9-2.015 9-4.5S16.97 3 12 3Z"})})}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("h3",{className:"truncate text-base font-bold text-slate-800",children:"Detail Presensi"}),e.jsx("p",{className:"truncate text-xs font-medium text-slate-500",children:n?.nama_workcode||"Workcode"})]})]}),e.jsx("button",{type:"button",onClick:()=>S(null),className:"rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600","aria-label":"Tutup detail presensi",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18 18 6M6 6l12 12"})})})]}),e.jsxs("div",{className:"mt-5 rounded-lg border border-neutral-200 bg-neutral-100 p-4 text-center",children:[e.jsx("p",{className:"text-[10px] font-bold uppercase tracking-wider text-neutral-800",children:f.face_capture_url?"Foto Presensi Wajah":"Tanda Tangan Digital"}),e.jsx("img",{src:f.face_capture_url||f.signature_url,alt:`${f.face_capture_url?"Foto presensi wajah":"Tanda tangan"} ${f.nama}`,className:`mx-auto mt-2 h-32 w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-inner ${f.face_capture_url?"object-cover":"object-contain p-2"}`})]}),e.jsxs("div",{className:"mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2",children:[e.jsxs("div",{className:"rounded-lg border border-neutral-200 bg-white p-3 sm:col-span-2 shadow-soft",children:[e.jsx("p",{className:"text-[10px] font-bold uppercase tracking-wider text-slate-400",children:"Peserta"}),e.jsx("p",{className:"mt-1 text-sm font-bold text-slate-800",children:f.nama}),e.jsxs("p",{className:"text-xs font-medium text-slate-500",children:[f.nis_nip||"Tanpa NIP"," · ",f.status_pegawai||"-"]})]}),e.jsxs("div",{className:"rounded-lg border border-slate-200 bg-slate-50 p-3",children:[e.jsx("p",{className:"text-[10px] font-bold uppercase tracking-wider text-slate-400",children:"Tanggal Presensi"}),e.jsx("p",{className:"mt-1 text-xs font-bold text-slate-800",children:b(f.tanggal)})]}),e.jsxs("div",{className:"rounded-lg border border-slate-200 bg-slate-50 p-3",children:[e.jsx("p",{className:"text-[10px] font-bold uppercase tracking-wider text-slate-400",children:"Waktu Hadir"}),e.jsx("p",{className:"mt-1 font-mono text-xs font-bold text-slate-800",children:f.waktu_hadir!=="-"?`${f.waktu_hadir} WIB`:"-"})]}),e.jsxs("div",{className:"rounded-lg border border-slate-200 bg-slate-50 p-3",children:[e.jsx("p",{className:"text-[10px] font-bold uppercase tracking-wider text-slate-400",children:"Waktu Pulang"}),e.jsx("p",{className:"mt-1 font-mono text-xs font-bold text-slate-800",children:f.waktu_pulang!=="-"?`${f.waktu_pulang} WIB`:"-"})]}),e.jsxs("div",{className:"rounded-lg border border-slate-200 bg-slate-50 p-3",children:[e.jsx("p",{className:"text-[10px] font-bold uppercase tracking-wider text-slate-400",children:"Status Kehadiran"}),e.jsx("div",{className:"mt-1",children:A(f.status)})]}),e.jsxs("div",{className:"rounded-lg border border-slate-200 bg-slate-50 p-3",children:[e.jsx("p",{className:"text-[10px] font-bold uppercase tracking-wider text-slate-400",children:"Metode Presensi"}),e.jsx("p",{className:"mt-1 text-xs font-bold text-slate-800",children:f.attendance_method||"-"})]})]}),n?.latitude&&n?.longitude&&e.jsxs("div",{className:"mt-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3",children:[e.jsx("p",{className:"text-[10px] font-bold uppercase tracking-wider text-emerald-700",children:"Lokasi Workcode"}),e.jsxs("p",{className:"mt-1 text-xs font-semibold text-emerald-950",children:["Radius presensi ",n.radius_meters||100," meter"]}),e.jsxs("p",{className:"mt-0.5 font-mono text-[10px] text-emerald-700",children:[Number(n.latitude).toFixed(6),", ",Number(n.longitude).toFixed(6)]})]}),e.jsx("div",{className:"mt-5 flex justify-end border-t border-slate-100 pt-4",children:e.jsx(Se,{onClick:()=>S(null),children:"Tutup"})})]})}),e.jsx(xe,{show:!!_,onClose:()=>w(null),maxWidth:"md",children:_&&e.jsxs("div",{className:"p-5 sm:p-6",children:[e.jsxs("div",{className:"flex items-start justify-between gap-4 border-b border-slate-100 pb-4",children:[e.jsxs("div",{className:"flex min-w-0 items-center gap-3",children:[e.jsx(ze,{name:_.nama}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("h3",{className:"truncate text-base font-bold text-slate-800",children:_.nama}),e.jsxs("p",{className:"truncate text-xs font-medium text-slate-500",children:[_.nis_nip||"Tanpa NIP"," · ",_.status_pegawai||"-"]})]})]}),e.jsx("button",{type:"button",onClick:()=>w(null),className:"rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600","aria-label":"Tutup detail peserta",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18 18 6M6 6l12 12"})})})]}),e.jsxs("div",{className:"mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3",children:[e.jsx(Ie,{icon:e.jsx("span",{className:"h-5 w-5",children:Q.calendar}),label:"Kalender",desc:"Kalender 1 bulan & kelola presensi",onClick:()=>{const t=_;w(null),Pe(t)}}),e.jsx(Ie,{icon:e.jsx("span",{className:"h-5 w-5",children:Q.document}),label:"Log",desc:"Riwayat presensi & foto wajah hasil scan",onClick:()=>{const t=_;w(null),H(t.participant_id,t.nama,t.nis_nip,t.status_pegawai)}}),e.jsx(Ie,{icon:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:1.75,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"})}),label:"Cetak",desc:"Cetak rekap individu",onClick:()=>{const t=_;w(null),J(t.participant_id,t.nama)}})]})]})}),e.jsx(xe,{show:te,onClose:()=>m(!1),maxWidth:"md",children:e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-slate-100 pb-4",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"})})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-base font-bold text-slate-800",children:"Edit Log Presensi"}),e.jsx("p",{className:"text-xs text-slate-500 font-medium",children:he})]})]}),e.jsx("button",{type:"button",onClick:()=>m(!1),className:"rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]}),e.jsxs("form",{onSubmit:oe,className:"mt-5 space-y-4",children:[e.jsxs("div",{children:[e.jsx(ke,{htmlFor:"edit_tanggal",value:"Tanggal Presensi",className:"text-xs font-bold text-slate-700"}),e.jsx(De,{id:"edit_tanggal",type:"date",value:j.data.tanggal,onChange:t=>j.setData("tanggal",t.target.value),className:"mt-1 w-full text-xs font-medium",required:!0}),e.jsx(Z,{message:j.errors.tanggal,className:"mt-1 text-xs"})]}),e.jsxs("div",{children:[e.jsx(ke,{htmlFor:"edit_status",value:"Status Kehadiran",className:"text-xs font-bold text-slate-700"}),e.jsxs("select",{id:"edit_status",value:j.data.status,onChange:t=>j.setData("status",t.target.value),className:"mt-1 w-full rounded-md border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20",required:!0,children:[e.jsx("option",{value:"hadir",children:"Hadir"}),e.jsx("option",{value:"izin",children:"Izin"}),e.jsx("option",{value:"sakit",children:"Sakit"}),e.jsx("option",{value:"lupa_absen",children:"Lupa Absen"}),e.jsx("option",{value:"alpha",children:"Alpha"})]}),e.jsx(Z,{message:j.errors.status,className:"mt-1 text-xs"})]}),j.data.status!=="alpha"&&e.jsxs("div",{className:`grid grid-cols-1 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 ${s?"":"sm:grid-cols-2"}`,children:[e.jsxs("div",{children:[e.jsx(ke,{htmlFor:"edit_jam_masuk",value:s?"Jam Absen":"Jam Datang",className:"text-xs font-bold text-slate-600"}),e.jsx(De,{id:"edit_jam_masuk",type:"time",value:j.data.jam_masuk,onChange:t=>j.setData("jam_masuk",t.target.value),className:"mt-1 w-full text-xs"}),e.jsx(Z,{message:j.errors.jam_masuk,className:"mt-1 text-xs"})]}),!s&&e.jsxs("div",{children:[e.jsx(ke,{htmlFor:"edit_jam_pulang",value:"Jam Pulang",className:"text-xs font-bold text-slate-600"}),e.jsx(De,{id:"edit_jam_pulang",type:"time",value:j.data.jam_pulang,onChange:t=>j.setData("jam_pulang",t.target.value),className:"mt-1 w-full text-xs"}),e.jsx(Z,{message:j.errors.jam_pulang,className:"mt-1 text-xs"})]})]}),e.jsxs("div",{className:"mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4",children:[e.jsx(Se,{type:"button",onClick:()=>m(!1),children:"Batal"}),e.jsx(et,{type:"submit",disabled:j.processing,className:"bg-neutral-600 hover:bg-neutral-700",children:j.processing?"Menyimpan...":"Perbarui Presensi"})]})]})]})}),e.jsx(xe,{show:z,onClose:()=>{M(!1),B(null)},maxWidth:"3xl",children:e.jsxs("div",{className:"relative p-6",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-slate-100 pb-4",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"})})}),e.jsxs("div",{children:[e.jsxs("h3",{className:"text-base font-bold text-slate-800",children:["Log Presensi: ",p?.nama]}),e.jsxs("p",{className:"text-xs text-slate-500 font-medium",children:["NIP: ",e.jsx("span",{className:"font-mono",children:p?.nis_nip||"-"})," • ",p?.status_pegawai||"-"]})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("button",{type:"button",onClick:()=>{R(p),ae(!0),M(!1)},className:"inline-flex items-center gap-1 rounded-md bg-brand-gradient hover:bg-brand-gradient px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3.5 w-3.5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"})}),"Buka Kalender"]}),e.jsx("button",{type:"button",onClick:()=>M(!1),className:"rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]})]}),e.jsx("div",{className:"mt-4",children:ge?e.jsx("div",{className:"py-12 text-center text-slate-500 text-xs font-semibold",children:"Memuat data riwayat presensi..."}):p?.attendances?.length===0?e.jsxs("div",{className:"py-12 text-center text-slate-500",children:[e.jsx("p",{className:"text-xs font-semibold",children:"Belum ada riwayat rekaman presensi untuk peserta ini."}),e.jsx("button",{type:"button",onClick:()=>{R(p),ae(!0),M(!1)},className:"mt-3 inline-flex items-center gap-1 text-xs font-bold text-neutral-800 hover:underline",children:"📅 Buka kalender presensi sekarang"})]}):e.jsx("div",{className:"overflow-x-auto max-h-[350px] overflow-y-auto rounded-lg border border-slate-200",children:e.jsxs("table",{className:"min-w-full divide-y divide-slate-200 text-xs",children:[e.jsx("thead",{className:"bg-slate-50 sticky top-0 z-10",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-4 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wider",children:"No"}),e.jsx("th",{className:"px-4 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wider",children:"Tanggal"}),e.jsx("th",{className:"px-4 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wider",children:"Jam Datang"}),e.jsx("th",{className:"px-4 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wider",children:"Jam Pulang"}),e.jsx("th",{className:"px-4 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wider",children:"Status"}),e.jsx("th",{className:"px-4 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wider",children:"Foto Wajah"}),e.jsx("th",{className:"px-4 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wider",children:"Aksi"})]})}),e.jsx("tbody",{className:"divide-y divide-slate-100 bg-white",children:p?.attendances?.map((t,l)=>e.jsxs("tr",{className:"hover:bg-slate-50/60 transition-colors",children:[e.jsx("td",{className:"px-4 py-2.5 text-slate-500 font-semibold",children:l+1}),e.jsx("td",{className:"px-4 py-2.5 font-bold text-slate-800",children:t.tanggal_formatted||t.tanggal||"-"}),e.jsx("td",{className:"px-4 py-2.5 text-center font-mono font-medium text-slate-700",children:t.status==="libur"?"-":t.jam_masuk?`${t.jam_masuk} WIB`:t.waktu_hadir!=="-"?t.waktu_hadir:"-"}),e.jsx("td",{className:"px-4 py-2.5 text-center font-mono font-medium text-slate-700",children:t.status==="libur"?"-":t.jam_pulang?`${t.jam_pulang} WIB`:t.waktu_pulang!=="-"?t.waktu_pulang:"-"}),e.jsx("td",{className:"px-4 py-2.5 text-center",children:A(t.status)}),e.jsx("td",{className:"px-4 py-2",children:t.face_capture_url||t.face_capture_pulang_url?e.jsx("div",{className:"flex items-center justify-center gap-1.5",children:[{url:t.face_capture_url,label:"Datang",time:t.jam_masuk},{url:t.face_capture_pulang_url,label:"Pulang",time:t.jam_pulang}].map(i=>e.jsx(st,{url:i.url,label:i.label,expired:t.media_expired,onOpen:()=>B({...i,tanggal:t.tanggal_formatted||t.tanggal})},i.label))}):e.jsx("p",{className:"text-center text-slate-400",children:"-"})}),e.jsx("td",{className:"px-4 py-2.5 text-center",children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[e.jsx("button",{type:"button",onClick:()=>c(t,p.nama),className:"p-1 rounded-lg text-neutral-800 hover:bg-neutral-100 transition-colors",title:"Edit Log Presensi Ini",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"})})}),e.jsx("button",{type:"button",onClick:()=>se(t.id,p.nama,t.tanggal_formatted||t.tanggal),className:"p-1 rounded-lg text-red-600 hover:bg-red-50 transition-colors",title:"Hapus Log Presensi Ini (Reset Status)",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"})})})]})})]},t.id||l))})]})})}),e.jsx("div",{className:"mt-5 flex justify-end border-t border-slate-100 pt-3",children:e.jsx(Se,{onClick:()=>{M(!1),B(null)},children:"Tutup"})}),L&&e.jsx("div",{className:"absolute inset-0 z-20 flex items-center justify-center bg-slate-900/70 p-4",onClick:()=>B(null),children:e.jsxs("div",{className:"w-full max-w-sm rounded-xl bg-white p-4 shadow-soft-lg",onClick:t=>t.stopPropagation(),children:[e.jsxs("div",{className:"flex items-start justify-between gap-3",children:[e.jsxs("div",{className:"min-w-0",children:[e.jsxs("p",{className:"text-[10px] font-bold uppercase tracking-wider text-slate-400",children:["Foto Wajah ",L.label]}),e.jsx("p",{className:"truncate text-sm font-bold text-slate-800",children:p?.nama}),e.jsxs("p",{className:"text-xs font-medium text-slate-500",children:[L.tanggal||"-",L.time?` · ${L.time} WIB`:""]})]}),e.jsx("button",{type:"button",onClick:()=>B(null),className:"rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600","aria-label":"Tutup pratinjau foto",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18 18 6M6 6l12 12"})})})]}),e.jsx("img",{src:L.url,alt:`Foto wajah ${L.label.toLowerCase()} ${p?.nama||""}`,className:"mt-3 aspect-[3/4] w-full rounded-lg border border-slate-200 bg-slate-100 object-cover"})]})})]})}),e.jsx(at,{show:pe,onClose:()=>{ae(!1),R(null),ye.reload({only:["stats","attendances"],preserveScroll:!0,preserveState:!0})},workcode:n,participants:$,initialParticipant:ue,onAttendanceChanged:()=>{ye.reload({only:["stats","attendances"],preserveScroll:!0,preserveState:!0})}})]})}function ze({name:u}){return e.jsx("span",{className:"flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-gradient text-xs font-semibold text-white",children:(u||"P").charAt(0).toUpperCase()})}function _e({label:u,value:v,tone:h}){return e.jsxs("div",{className:"rounded-md border border-neutral-200 px-1 py-1.5",children:[e.jsx("p",{className:"text-[10px] font-medium uppercase text-neutral-500",children:u}),e.jsx("p",{className:`text-sm font-bold tabular-nums ${h}`,children:v})]})}function Re(){return e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:1.75,children:[e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"}),e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M15 12a3 3 0 11-6 0 3 3 0 016 0z"})]})}function Ie({icon:u,label:v,desc:h,onClick:n}){return e.jsxs("button",{type:"button",onClick:n,className:"flex items-center gap-3 rounded-lg border border-neutral-200 p-3 text-left transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 sm:flex-col sm:items-center sm:text-center",children:[e.jsx("span",{className:"flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800",children:u}),e.jsxs("span",{className:"min-w-0",children:[e.jsx("span",{className:"block text-sm font-bold text-neutral-800",children:v}),e.jsx("span",{className:"block text-[11px] leading-snug text-neutral-500",children:h})]})]})}function st({url:u,label:v,expired:h=!1,onOpen:n}){const[N,U]=r.useState(!1),{mediaRetentionDays:$=30}=Be().props;return!u||N?e.jsxs("span",{className:"flex h-12 w-10 flex-col items-center justify-center rounded-md border border-dashed border-slate-200 text-center text-[8px] font-semibold uppercase leading-3 text-slate-300",title:N?`File foto ${v.toLowerCase()} tidak ditemukan`:h?`Foto presensi hanya disimpan ${$} hari`:`Tidak ada foto ${v.toLowerCase()}`,children:[v,N&&e.jsx("span",{className:"normal-case text-rose-300",children:"hilang"}),!N&&h&&e.jsx("span",{className:"normal-case text-amber-400",children:"kedaluwarsa"})]}):e.jsxs("button",{type:"button",onClick:n,title:`Lihat foto wajah ${v.toLowerCase()}`,className:"group relative overflow-hidden rounded-md border border-slate-200 transition-shadow hover:shadow-soft-lg focus:outline-none focus:ring-2 focus:ring-brand-500",children:[e.jsx("img",{src:u,alt:"",loading:"lazy",onError:()=>U(!0),className:"h-12 w-10 bg-slate-100 object-cover"}),e.jsx("span",{className:"absolute inset-x-0 bottom-0 bg-slate-900/60 text-center text-[8px] font-bold uppercase leading-3 text-white",children:v})]})}function Ke({attendance:u,onOpen:v}){const{mediaRetentionDays:h=30}=Be().props;return!u.signature_url&&!u.face_capture_url?u.media_expired?e.jsx("span",{className:"text-[10px] font-semibold text-amber-500",title:`Foto & tanda tangan presensi hanya disimpan ${h} hari`,children:"Bukti kedaluwarsa"}):null:e.jsx("button",{type:"button",onClick:v,title:"Lihat detail presensi dan bukti kehadiran",className:"inline-flex rounded-md border border-neutral-200 transition-shadow hover:shadow-soft-lg focus:outline-none focus:ring-2 focus:ring-brand-500",children:e.jsx("img",{src:u.face_capture_url||u.signature_url,alt:`Bukti presensi ${u.nama}`,loading:"lazy",decoding:"async",className:"h-9 w-24 rounded-md bg-white object-contain"})})}export{gt as default};
