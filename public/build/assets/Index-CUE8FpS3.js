import{d as Ne,a as ke,r as l,j as e,e as Z,b as Ce,u as Me,H as Pe,f as oe}from"./app-CqO5jv3g.js";import{A as ze}from"./AuthenticatedLayout-DBekNR0B.js";import{M as we}from"./Modal-tmQ_CBKs.js";import{S as je}from"./SecondaryButton-Da_rjiRl.js";import{I as R}from"./InputError-XHTAlZcc.js";import{P as De}from"./PrimaryButton-xy2DGETw.js";import{I as de}from"./InputLabel-Bg8SKKUI.js";import{T as fe}from"./TextInput-CcAZxGMs.js";import"./transition-B8ns5Ady.js";const ye=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"],$e=["Min","Sen","Sel","Rab","Kam","Jum","Sab"];function Be({show:L=!1,onClose:H=()=>{},workcode:i=null,participants:u=[],initialParticipant:W=null,onAttendanceChanged:K=()=>{}}){const{toast:N}=Ne(),X=ke(),[x,A]=l.useState(null),[T,C]=l.useState(""),[xe,M]=l.useState(!1),k=new Date,[h,_]=l.useState(k.getFullYear()),[p,f]=l.useState(k.getMonth()),[V,E]=l.useState([]),[ce,P]=l.useState(!1),[Y,pe]=l.useState({});l.useEffect(()=>{(async()=>{try{const t=await Z.get("/api/holidays");pe(t.data||{})}catch(t){console.error("Gagal memuat data hari libur:",t)}})()},[]);const[r,F]=l.useState(null),[g,S]=l.useState({id:null,workcode_id:i?.id||"",participant_id:"",tanggal:"",jam_masuk:"07:00",jam_pulang:"15:30",status:"hadir"}),[m,ee]=l.useState(!1),[z,O]=l.useState({});l.useEffect(()=>{L&&(W?(A(W),C("")):u.length>0&&!x&&A(u[0]))},[L,W]);const U=async s=>{if(!(!i||!s)){P(!0);try{const t=await Z.get(`/report/individual/${i.id}/${s}`);E(t.data.attendances||[])}catch(t){console.error("Gagal mengambil data presensi:",t),N.error("Gagal memuat data presensi kalender.")}finally{P(!1)}}};l.useEffect(()=>{L&&x&&i&&U(x.id)},[L,x?.id,i?.id]);const D=l.useMemo(()=>{if(!T.trim())return u;const s=T.toLowerCase();return u.filter(t=>(t.nama||"").toLowerCase().includes(s)||t.nis_nip&&t.nis_nip.toLowerCase().includes(s))},[u,T]),te=l.useMemo(()=>{const s={};return V.forEach(t=>{t.tanggal&&(s[t.tanggal]=t)}),s},[V]),se=()=>{p===0?(f(11),_(s=>s-1)):f(s=>s-1)},J=()=>{p===11?(f(0),_(s=>s+1)):f(s=>s+1)},q=()=>{_(k.getFullYear()),f(k.getMonth())},G=l.useMemo(()=>{const s=new Date(h,p,1).getDay(),t=new Date(h,p+1,0).getDate(),a=new Date(h,p,0).getDate(),n=[];for(let c=s-1;c>=0;c--){const b=a-c,y=p===0?11:p-1,Q=`${p===0?h-1:h}-${String(y+1).padStart(2,"0")}-${String(b).padStart(2,"0")}`;n.push({dayNumber:b,dateStr:Q,isCurrentMonth:!1,isWeekend:!1})}for(let c=1;c<=t;c++){const b=new Date(h,p,c),y=`${h}-${String(p+1).padStart(2,"0")}-${String(c).padStart(2,"0")}`,w=b.getDay(),Q=w===0||w===6,he=!!Y[y],ue=Y[y]||null,ge=k.getFullYear()===h&&k.getMonth()===p&&k.getDate()===c;n.push({dayNumber:c,dateStr:y,isCurrentMonth:!0,isWeekend:Q,isHoliday:he,holidayName:ue,isToday:ge,dayOfWeek:w,attendance:te[y]||null})}const d=n.length,v=(d<=35?35:42)-d;for(let c=1;c<=v;c++){const b=p===11?0:p+1,w=`${p===11?h+1:h}-${String(b+1).padStart(2,"0")}-${String(c).padStart(2,"0")}`;n.push({dayNumber:c,dateStr:w,isCurrentMonth:!1,isWeekend:!1})}return n},[h,p,te,Y]),$=l.useMemo(()=>{let s=0,t=0,a=0,n=0,d=0,j=0;const v=`${h}-${String(p+1).padStart(2,"0")}`;return V.forEach(c=>{c.tanggal&&c.tanggal.startsWith(v)&&(c.status==="hadir"?s++:c.status==="izin"?t++:c.status==="sakit"?a++:c.status==="alpha"?n++:c.status==="lupa_absen"?d++:c.status==="libur"&&j++)}),{hadir:s,izin:t,sakit:a,alpha:n,lupaAbsen:d,libur:j}},[V,h,p]),ae=s=>{if(!s.isCurrentMonth)return;const a=new Date(s.dateStr).toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"}),n=s.attendance;S(n?{id:n.id,workcode_id:i.id,participant_id:x.id,tanggal:s.dateStr,jam_masuk:n.jam_masuk||"",jam_pulang:n.jam_pulang||"",status:n.status||"hadir"}:{id:null,workcode_id:i.id,participant_id:x.id,tanggal:s.dateStr,jam_masuk:"07:00",jam_pulang:"15:30",status:"hadir"}),O({}),F({dateStr:s.dateStr,dateFormatted:a,existingAttendance:n})},me=async s=>{s.preventDefault(),ee(!0),O({});try{if(g.id){const t=await Z.put(route("admin.attendances.update",g.id),g);N.success(t.data?.message||"Presensi berhasil diperbarui.")}else{const t=await Z.post(route("admin.attendances.store"),g);N.success(t.data?.message||"Presensi berhasil disimpan.")}F(null),await U(x.id),K()}catch(t){console.error("Gagal menyimpan presensi:",t),t.response?.data?.errors&&O(t.response.data.errors),N.error(t.response?.data?.message||"Gagal menyimpan data presensi.")}finally{ee(!1)}},ne=async()=>{if(!r?.existingAttendance)return;if(await X({title:"Hapus Log Presensi",message:`Apakah Anda yakin ingin menghapus catatan presensi untuk ${x?.nama} pada tanggal ${r.dateFormatted}? Status hari tersebut akan direset.`,type:"danger",confirmText:"Ya, Hapus Data",cancelText:"Batal"}))try{const t=await Z.delete(route("admin.attendances.destroy",r.existingAttendance.id));N.success(t.data?.message||"Presensi berhasil dihapus."),F(null),await U(x.id),K()}catch(t){console.error("Gagal menghapus presensi:",t),N.error(t.response?.data?.message||"Gagal menghapus data presensi.")}};return e.jsxs(we,{show:L,onClose:H,maxWidth:"5xl",closeable:!1,children:[e.jsxs("div",{className:"p-5 sm:p-7 flex flex-col max-h-[92vh] overflow-y-auto",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-slate-100 pb-3",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"})})}),e.jsxs("div",{children:[e.jsxs("h3",{className:"text-base font-extrabold text-slate-800 flex items-center gap-2",children:["Kalender Presensi Peserta",i&&e.jsx("span",{className:"text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100",children:i.nama_workcode})]}),e.jsx("p",{className:"text-xs text-slate-500 font-medium",children:"Klik kotak tanggal pada kalender untuk menambah, mengedit, atau menghapus presensi."})]})]}),e.jsx("button",{type:"button",onClick:H,className:"rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]}),e.jsxs("div",{className:"mt-3.5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center flex-1",children:[e.jsxs("div",{className:"relative flex-1 sm:max-w-xs",children:[e.jsxs("div",{className:"relative",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"})}),e.jsx("input",{type:"text",placeholder:"Cari nama peserta / NIP...",value:T,onChange:s=>{C(s.target.value),M(!0)},onFocus:()=>M(!0),className:"w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-7 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium shadow-xs"}),T&&e.jsx("button",{type:"button",onClick:()=>C(""),className:"absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs",children:"✕"})]}),xe&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0 z-20",onClick:()=>M(!1)}),e.jsx("div",{className:"absolute left-0 right-0 top-full mt-1.5 z-30 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl py-1",children:D.length===0?e.jsx("div",{className:"px-4 py-3 text-xs text-slate-500 text-center font-medium",children:"Tidak ada peserta ditemukan."}):D.map(s=>e.jsxs("button",{type:"button",onClick:()=>{A(s),C(""),M(!1)},className:`w-full px-3.5 py-1.5 text-left text-xs flex items-center justify-between hover:bg-indigo-50/70 transition-colors ${x?.id===s.id?"bg-indigo-50 text-indigo-700 font-bold":"text-slate-700"}`,children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700",children:(s.nama||"").charAt(0).toUpperCase()}),e.jsxs("div",{children:[e.jsx("p",{className:"font-bold text-slate-800 leading-tight",children:s.nama}),e.jsxs("p",{className:"text-[9px] text-slate-500 font-mono",children:["NIP: ",s.nis_nip||"-"]})]})]}),e.jsx("span",{className:"text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold",children:s.status||"-"})]},s.id))})]})]}),x&&e.jsxs("div",{className:"flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200/90 shadow-xs shrink-0",children:[e.jsx("div",{className:"flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-extrabold text-white",children:(x.nama||"").charAt(0).toUpperCase()}),e.jsxs("div",{className:"leading-tight",children:[e.jsx("p",{className:"text-xs font-extrabold text-slate-800",children:x.nama}),e.jsxs("p",{className:"text-[10px] text-slate-500 font-medium",children:["NIP: ",e.jsx("span",{className:"font-mono",children:x.nis_nip||"-"})," • ",x.status||"-"]})]})]})]}),e.jsxs("div",{className:"flex items-center justify-between sm:justify-end gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200/90 shadow-xs shrink-0",children:[e.jsx("button",{type:"button",onClick:se,className:"flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors",title:"Bulan Sebelumnya",children:"❮"}),e.jsxs("h4",{className:"text-xs font-extrabold text-slate-800 px-2 min-w-[130px] text-center",children:[ye[p]," ",h]}),e.jsx("button",{type:"button",onClick:J,className:"flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors",title:"Bulan Berikutnya",children:"❯"}),e.jsx("button",{type:"button",onClick:q,className:"ml-1 px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors",children:"Bulan Ini"})]})]}),e.jsxs("div",{className:"mt-3 bg-white rounded-2xl border border-slate-200 p-2.5 shadow-xs",children:[e.jsx("div",{className:"grid grid-cols-7 gap-1 sm:gap-1.5 mb-1 sm:mb-1.5 text-center",children:$e.map((s,t)=>e.jsxs("div",{className:`py-1 text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider rounded-lg ${t===0||t===6?"text-red-500 bg-red-50/60":"text-slate-500 bg-slate-50"}`,children:[e.jsx("span",{className:"sm:hidden",children:s.charAt(0)}),e.jsx("span",{className:"hidden sm:inline",children:s})]},t))}),ce?e.jsxs("div",{className:"py-16 text-center text-xs font-semibold text-slate-500 flex flex-col items-center gap-2",children:[e.jsx("div",{className:"h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"}),"Memuat data kalender presensi..."]}):e.jsx("div",{className:"grid grid-cols-7 gap-1 sm:gap-1.5",children:G.map((s,t)=>{const a=s.attendance,n=s.isCurrentMonth;return e.jsxs("div",{onClick:()=>n&&ae(s),className:`group min-h-[44px] sm:min-h-[64px] rounded-xl p-0.5 sm:p-1.5 flex flex-col justify-between transition-all select-none ${n?"border border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer "+(s.isToday?"bg-indigo-50/20 ring-2 ring-indigo-500/30":"bg-white hover:bg-slate-50/50"):"bg-slate-50/40 text-slate-300 border border-transparent cursor-not-allowed opacity-30"}`,children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-1.5 min-w-0",children:[e.jsx("span",{title:s.holidayName||"",className:`text-xs font-bold leading-none shrink-0 ${n?s.isToday?"flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white font-black text-[10px]":s.isWeekend||s.isHoliday?"text-red-500":"text-slate-700":"text-slate-300"}`,children:s.dayNumber}),n&&s.isHoliday&&e.jsx("span",{className:"text-[8px] font-bold text-red-600 bg-red-50 border border-red-100 px-1 rounded truncate max-w-[45px] sm:max-w-[70px]",title:s.holidayName,children:s.holidayName})]}),n&&!a&&e.jsx("span",{className:"text-[10px] text-slate-300 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold shrink-0",children:"+"})]}),n&&a&&e.jsxs("div",{className:"mt-1 flex flex-col gap-0.5",children:[a.status==="hadir"&&e.jsxs("div",{className:"rounded-md bg-emerald-50 border border-emerald-200 px-1 py-0.5 text-center",children:[e.jsx("span",{className:"text-[9px] font-black text-emerald-700 block leading-tight",children:"✓ HADIR"}),(a.jam_masuk||a.jam_pulang)&&e.jsxs("span",{className:"text-[8px] font-medium text-emerald-600 block leading-tight font-mono",children:[a.jam_masuk||"–"," - ",a.jam_pulang||"–"]})]}),a.status==="alpha"&&e.jsx("div",{className:"rounded-md bg-red-50 border border-red-200 px-1 py-0.5 text-center",children:e.jsx("span",{className:"text-[9px] font-black text-red-700 block leading-tight",children:"✗ ALPHA"})}),a.status==="izin"&&e.jsx("div",{className:"rounded-md bg-amber-50 border border-amber-200 px-1 py-0.5 text-center",children:e.jsx("span",{className:"text-[9px] font-black text-amber-700 block leading-tight",children:"! IZIN"})}),a.status==="sakit"&&e.jsx("div",{className:"rounded-md bg-blue-50 border border-blue-200 px-1 py-0.5 text-center",children:e.jsx("span",{className:"text-[9px] font-black text-blue-700 block leading-tight",children:"+ SAKIT"})}),a.status==="lupa_absen"&&e.jsx("div",{className:"rounded-md bg-slate-100 border border-slate-300 px-1 py-0.5 text-center",children:e.jsx("span",{className:"text-[9px] font-black text-slate-700 block leading-tight",children:"? LUPA ABSEN"})}),a.status==="libur"&&e.jsx("div",{className:"rounded-md bg-rose-50 border border-rose-200 px-1 py-0.5 text-center",children:e.jsx("span",{className:"text-[9px] font-black text-rose-700 block leading-tight",children:"★ LIBUR"})})]}),n&&!a&&e.jsx("div",{className:"h-3 flex items-center justify-center",children:e.jsx("span",{className:"text-[9px] text-slate-300 font-medium group-hover:hidden",children:"-"})})]},t)})})]}),e.jsxs("div",{className:"mt-3.5 flex flex-wrap items-center justify-between gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200",children:[e.jsxs("div",{className:"flex flex-wrap items-center gap-3 sm:gap-5 text-xs",children:[e.jsxs("span",{className:"text-[11px] font-bold text-slate-500 uppercase tracking-wider",children:["Rekap ",ye[p],":"]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-emerald-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-emerald-500"})," Hadir: ",$.hadir]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-amber-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-amber-500"})," Izin: ",$.izin]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-blue-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-blue-500"})," Sakit: ",$.sakit]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-red-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-red-500"})," Alpha: ",$.alpha]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-slate-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-slate-400"})," Lupa Absen: ",$.lupaAbsen]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-rose-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-rose-500"})," Libur: ",$.libur]})]}),e.jsx(je,{onClick:H,className:"text-xs",children:"Tutup"})]})]}),r&&e.jsx("div",{className:"fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]",children:e.jsxs("div",{className:"relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150",onClick:s=>s.stopPropagation(),children:[e.jsxs("div",{className:"flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100/70 text-indigo-600 shadow-xs",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"})})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-sm font-black text-slate-800",children:r.existingAttendance?"Edit Data Presensi":"Input Presensi Manual"}),e.jsx("p",{className:"text-xs font-bold text-indigo-600",children:r.dateFormatted})]})]}),e.jsx("button",{type:"button",onClick:()=>F(null),className:"rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition-colors",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]}),e.jsxs("form",{onSubmit:me,className:"p-6 space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80",children:[e.jsx("div",{className:"flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shrink-0",children:(x?.nama||"P").charAt(0).toUpperCase()}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("p",{className:"text-xs font-extrabold text-slate-800 truncate leading-tight",children:x?.nama}),e.jsxs("p",{className:"text-[10px] text-slate-500 font-mono leading-tight",children:["NIP: ",x?.nis_nip||"-"," • ",x?.status||"-"]})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-extrabold text-slate-700 mb-2",children:"Pilih Status Kehadiran:"}),e.jsx("div",{className:"grid grid-cols-3 gap-2",children:[{key:"hadir",label:"Hadir",icon:"✓",activeBg:"bg-emerald-600 text-white border-emerald-600 shadow-emerald-200 shadow-md"},{key:"izin",label:"Izin",icon:"!",activeBg:"bg-amber-500 text-white border-amber-500 shadow-amber-200 shadow-md"},{key:"sakit",label:"Sakit",icon:"+",activeBg:"bg-blue-600 text-white border-blue-600 shadow-blue-200 shadow-md"},{key:"lupa_absen",label:"Lupa Absen",icon:"?",activeBg:"bg-slate-700 text-white border-slate-700 shadow-slate-200 shadow-md"},{key:"alpha",label:"Alpha",icon:"✗",activeBg:"bg-red-600 text-white border-red-600 shadow-red-200 shadow-md"},{key:"libur",label:"Libur",icon:"★",activeBg:"bg-rose-600 text-white border-rose-600 shadow-rose-200 shadow-md"}].map(s=>{const t=g.status===s.key;return e.jsxs("button",{type:"button",onClick:()=>S({...g,status:s.key}),className:`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 select-none ${t?s.activeBg:"bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"}`,children:[e.jsx("span",{className:"font-mono text-xs",children:s.icon}),e.jsx("span",{children:s.label})]},s.key)})}),e.jsx(R,{message:z.status?.[0]||z.status,className:"mt-1 text-xs"})]}),!["alpha","libur"].includes(g.status)&&e.jsxs("div",{className:"p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-[11px] font-extrabold text-slate-600 uppercase tracking-wider",children:"Jam Kehadiran"}),e.jsx("div",{className:"flex items-center gap-1.5 text-[10px]",children:e.jsx("button",{type:"button",onClick:()=>{S({...g,jam_masuk:"07:00",jam_pulang:"15:30"})},className:"px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 font-semibold transition-colors",children:"Preset Normal (07:00 - 15:30)"})})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{children:[e.jsx("label",{htmlFor:"modal_jam_masuk",className:"block text-[11px] font-bold text-slate-600 mb-1",children:"Jam Datang"}),e.jsx("input",{id:"modal_jam_masuk",type:"time",value:g.jam_masuk,onChange:s=>S({...g,jam_masuk:s.target.value}),className:"w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-mono font-bold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-xs"}),e.jsx(R,{message:z.jam_masuk?.[0]||z.jam_masuk,className:"mt-0.5 text-[10px]"})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"modal_jam_pulang",className:"block text-[11px] font-bold text-slate-600 mb-1",children:"Jam Pulang"}),e.jsx("input",{id:"modal_jam_pulang",type:"time",value:g.jam_pulang,onChange:s=>S({...g,jam_pulang:s.target.value}),className:"w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-mono font-bold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-xs"}),e.jsx(R,{message:z.jam_pulang?.[0]||z.jam_pulang,className:"mt-0.5 text-[10px]"})]})]})]}),e.jsxs("div",{className:"pt-3 border-t border-slate-100 flex items-center justify-between gap-3",children:[e.jsx("div",{children:r.existingAttendance&&e.jsxs("button",{type:"button",onClick:ne,disabled:m,className:"inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 border border-red-200/80 rounded-xl transition-all active:scale-95 shadow-xs disabled:opacity-50",title:"Hapus presensi dan reset status pada tanggal ini",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3.5 w-3.5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"})}),"Hapus Presensi"]})}),e.jsxs("div",{className:"flex items-center gap-2 ml-auto",children:[e.jsx("button",{type:"button",onClick:()=>F(null),className:"px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors",children:"Batal"}),e.jsxs("button",{type:"submit",disabled:m,className:`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 ${r.existingAttendance?"bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-200":"bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-200"}`,children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3.5 w-3.5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2.5,d:"M5 13l4 4L19 7"})}),m?"Menyimpan...":r.existingAttendance?"Perbarui Presensi":"Simpan Presensi"]})]})]})]})]})})]})}function Je({workcodes:L=[],selectedWorkcodeId:H,selectedWorkcode:i,stats:u,attendances:W=[],participants:K=[],kepalaSekolahNama:N="Muhtarom, S.Pd., M.Si.",kepalaSekolahNip:X="197205172006041015"}){const{flash:x}=Ce().props,{toast:A}=Ne(),T=ke(),[C,xe]=l.useState(""),[M,k]=l.useState(""),[h,_]=l.useState(!1),[p,f]=l.useState(!1),[V,E]=l.useState(!1),[ce,P]=l.useState(null),[Y,pe]=l.useState(""),[r,F]=l.useState(null),[g,S]=l.useState(!1),m=Me({id:null,tanggal:"",jam_masuk:"",jam_pulang:"",status:"hadir"});l.useEffect(()=>{x?.success?A.success(x.success):x?.error&&A.error(x.error)},[x]);const ee=["PNS","PPPK","PPPK Paruh Waktu","GTT","PTT"],z=W.map(t=>t.status_pegawai).filter(Boolean).sort(),O=[...new Set([...ee,...z])],U=t=>{oe.get(route("report"),{workcode_id:t},{preserveState:!0,preserveScroll:!0})},D=W.filter(t=>{const a=(t.nama||"").toLowerCase().includes(C.toLowerCase())||(t.nis_nip||"").toLowerCase().includes(C.toLowerCase()),n=M===""||t.status_pegawai===M;return a&&n}),te=D.slice(0,5),se=u&&u.total>0?Math.round(u.hadir/u.total*100):0,J=["workcode","24_jam"].includes(i?.kategori),q=(t,a="")=>{pe(a||t.nama||"Peserta"),m.setData({id:t.id,tanggal:t.tanggal||(t.waktu_hadir?t.waktu_hadir.split(" ")[0]:new Date().toISOString().split("T")[0]),jam_masuk:t.jam_masuk||"",jam_pulang:J?"":t.jam_pulang||"",status:t.status||"hadir"}),_(!0)},G=async(t,a,n,d)=>{if(i){S(!0);try{const v=await(await fetch(`/report/individual/${i.id}/${t}`)).json();F({id:t,nama:a||v.participant.nama,nis_nip:n||v.participant.nis_nip,status_pegawai:d||v.participant.status,attendances:v.attendances||[]}),f(!0)}catch(j){console.error("Gagal mengambil data riwayat:",j),A.error("Gagal memuat riwayat presensi.")}finally{S(!1)}}},$=t=>{t.preventDefault(),m.put(route("admin.attendances.update",m.data.id),{preserveScroll:!0,onSuccess:()=>{_(!1),m.reset(),p&&r&&G(r.id,r.nama,r.nis_nip,r.status_pegawai)}})},ae=async(t,a,n)=>{await T({title:"Hapus Log Presensi",message:`Apakah Anda yakin ingin menghapus catatan presensi ${a?`untuk "${a}"`:""} ${n?`tanggal ${n}`:""}? Tindakan ini akan menghapus data kehadiran/alpha/izin hari tersebut.`,type:"danger",confirmText:"Ya, Hapus Data",cancelText:"Batal"})&&oe.delete(route("admin.attendances.destroy",t),{preserveScroll:!0,onSuccess:()=>{p&&r&&G(r.id,r.nama,r.nis_nip,r.status_pegawai)}})},me=()=>{if(!i)return;const t=window.open("","_blank","width=800,height=900"),a=D.map((d,j)=>`
            <tr>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${j+1}</td>
                <td style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px;">${d.nama}</td>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 11px;">${d.nis_nip}</td>
                <td style="padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${d.status_pegawai||"-"}</td>
                ${i.kategori==="harian"?`
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${d.total_alpha||"0"}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${d.total_izin||"0"}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${d.total_sakit||"0"}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${d.total_lupa_absen||"0"}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${d.total_menit_terlambat?d.total_menit_terlambat+" Menit":"0 Menit"}</td>
                    `:`
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${d.waktu_hadir}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px;">${d.status?d.status.replace("_"," ").toUpperCase():"-"}</td>
                    `}
            </tr>
        `).join(""),n=i.kategori==="harian"?`
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
                <title>Rekap Presensi - ${i.nama_workcode}</title>
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
                            <td>${i.nama_workcode}</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold;">Kategori Presensi</td>
                            <td>:</td>
                            <td style="text-transform: capitalize;">${i.kategori==="harian"?"Presensi Harian":i.kategori==="24_jam"?"Presensi 24 Jam":"Presensi Sekali / Event"}</td>
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
                            ${n}
                        </tr>
                    </thead>
                    <tbody>
                        ${a||'<tr><td colspan="9" style="text-align:center; padding: 10px;">Belum ada data kehadiran</td></tr>'}
                    </tbody>
                </table>

                <div class="ttd-section">
                    <div class="ttd-box">
                        <p>Babat, ${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</p>
                        <p style="margin-bottom: 5px;">Kepala Sekolah,</p>
                        <div class="ttd-qr-wrap" style="display: flex; justify-content: center; margin: 10px 0;">
                            <img src="${window.location.origin}/workcodes/${i.id}/qr-signature" style="width: 80px; height: 80px;" alt="QR TTD" />
                        </div>
                        <p style="font-weight: bold; text-decoration: underline; font-size: 13px;">${N}</p>
                        <p style="font-size: 11px; color: #475569; font-family: Arial, sans-serif;">NIP. ${X}</p>
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        setTimeout(function() { window.focus(); window.print(); }, 600);
                    };
                <\/script>
            </body>
            </html>
        `),t.document.close()},ne=async(t,a)=>{if(i)try{const n=new Date,d=n.getFullYear(),j=n.getMonth()+1,v=n.toLocaleDateString("id-ID",{month:"long",year:"numeric"}),b=await(await fetch(`/report/individual/${i.id}/${t}?year=${d}&month=${j}`)).json(),y=window.open("","_blank","width=800,height=900"),w=(b.attendances||[]).slice().sort((o,be)=>{const ie=o.tanggal||"",re=be.tanggal||"";return ie.localeCompare(re)}),Q=b.workcode&&b.workcode.jam_datang_selesai?b.workcode.jam_datang_selesai.slice(0,5):"07:00",he=w.map((o,be)=>{let ie="-";if(o.tanggal){const[le,Le,Ae]=o.tanggal.split("-").map(Number);ie=new Date(le,Le-1,Ae).toLocaleDateString("id-ID",{weekday:"long",day:"2-digit",month:"long",year:"numeric"})}let re=o.jam_masuk||(o.waktu_hadir!=="-"?o.waktu_hadir:"-"),ve=o.jam_pulang||(o.waktu_pulang!=="-"?o.waktu_pulang:"-");o.status==="libur"&&(re="-",ve="-");let B=(o.status||"hadir").toUpperCase(),I="#0f172a";if(o.status==="hadir"||!o.status){const le=(o.jam_masuk||"").trim().slice(0,5);le&&le>Q?(B="TERLAMBAT",I="#b91c1c"):(B="HADIR",I="#15803d")}else o.status==="terlambat"?(B="TERLAMBAT",I="#b91c1c"):o.status==="izin"?(B="IZIN",I="#b45309"):o.status==="sakit"?(B="SAKIT",I="#1d4ed8"):o.status==="alpha"?(B="ALPHA",I="#b91c1c"):o.status==="lupa_absen"&&(B="LUPA ABSEN",I="#475569");return`
                    <tr>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${be+1}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${ie}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${re}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${ve}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px; color: ${I};">${B}</td>
                    </tr>
                `}).join(""),ue=w.filter(o=>o.status==="alpha").length,ge=w.filter(o=>o.status==="izin").length,_e=w.filter(o=>o.status==="sakit").length,Se=w.filter(o=>o.status==="lupa_absen").length;y.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Rekap Kehadiran - ${a}</title>
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
                                <td style="font-weight: bold;">${a}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">NIP</td>
                                <td>:</td>
                                <td style="font-family: monospace;">${b.participant.nis_nip||"-"}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">Status Kepegawaian</td>
                                <td>:</td>
                                <td>${b.participant.status||"-"}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">WorkCode</td>
                                <td>:</td>
                                <td>${i.nama_workcode}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">Periode Bulan</td>
                                <td>:</td>
                                <td>${v}</td>
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
                                <td style="width: 25%; color: #b91c1c;">${ue} Hari</td>
                                <td style="width: 25%; color: #b45309;">${ge} Hari</td>
                                <td style="width: 25%; color: #1d4ed8;">${_e} Hari</td>
                                <td style="width: 25%; color: #475569;">${Se} Hari</td>
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
                            ${he||'<tr><td colspan="5" style="text-align:center; padding: 10px;">Belum ada data kehadiran</td></tr>'}
                        </tbody>
                    </table>

                    <div class="ttd-section">
                        <div class="ttd-box">
                            <p>Babat, ${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</p>
                            <p style="margin-bottom: 5px;">Kepala Sekolah,</p>
                            <div class="ttd-qr-wrap" style="display: flex; justify-content: center; margin: 10px 0;">
                                <img src="${window.location.origin}/workcodes/${i.id}/qr-signature" style="width: 80px; height: 80px;" alt="QR TTD" />
                            </div>
                            <p style="font-weight: bold; text-decoration: underline; font-size: 13px;">${N}</p>
                            <p style="font-size: 11px; color: #475569; font-family: Arial, sans-serif;">NIP. ${X}</p>
                        </div>
                    </div>

                    <script>
                        window.onload = function() {
                            setTimeout(function() { window.focus(); window.print(); }, 600);
                        };
                    <\/script>
                </body>
                </html>
            `),y.document.close()}catch(n){console.error("Gagal mengambil data rekap:",n),A.error("Terjadi kesalahan saat memuat rekap individu.")}},s=t=>{switch(t){case"hadir":return e.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700",children:"✓ Hadir"});case"alpha":return e.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-bold text-red-700",children:"✗ Alpha"});case"izin":return e.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-700",children:"! Izin"});case"sakit":return e.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-bold text-blue-700",children:"+ Sakit"});case"lupa_absen":return e.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-300 px-2.5 py-0.5 text-xs font-bold text-slate-700",children:"? Lupa Absen"});default:return e.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600",children:"-"})}};return e.jsxs(ze,{header:e.jsxs("div",{className:"flex min-w-0 items-center justify-between gap-3","data-aos":"fade-down",children:[e.jsxs("h2",{className:"shrink-0 text-base font-extrabold leading-tight text-slate-800 sm:text-xl",children:[e.jsx("span",{className:"md:hidden",children:"Laporan"}),e.jsx("span",{className:"hidden md:inline",children:"Laporan Kehadiran"})]}),e.jsxs("div",{className:"flex min-w-0 items-center justify-end gap-2",children:[e.jsx("label",{htmlFor:"workcode-filter",className:"sr-only",children:"Pilih workcode laporan"}),e.jsxs("select",{id:"workcode-filter",value:H||"",onChange:t=>U(t.target.value),className:"w-28 min-w-0 cursor-pointer truncate rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-indigo-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 sm:w-44 lg:w-72",children:[L.length===0&&e.jsx("option",{value:"",children:"Belum Ada Workcode"}),L.map(t=>e.jsxs("option",{value:t.id,children:[t.is_active?"🟢 ":"",t.nama_workcode," (",t.attendances_count," hadir)"]},t.id))]}),H&&e.jsxs("div",{className:"flex shrink-0 items-center gap-2",children:[e.jsxs("a",{href:route("workcodes.export",H),"aria-label":"Export Excel",title:"Export Excel (.xlsx)",className:"inline-flex h-9 w-9 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-emerald-200 bg-white text-xs font-bold text-emerald-700 shadow-sm transition-all hover:bg-emerald-50 active:scale-[0.98] xl:w-auto xl:px-3.5",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4 text-emerald-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"})}),e.jsx("span",{className:"hidden xl:inline",children:"Export Excel (.xlsx)"})]}),e.jsxs("button",{type:"button",onClick:me,"aria-label":"Cetak bukti hadir",title:"Cetak Bukti Hadir",className:"inline-flex h-9 w-9 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-sm shadow-indigo-500/20 transition-all hover:bg-indigo-700 active:scale-[0.98] xl:w-auto xl:px-3.5",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"})}),e.jsx("span",{className:"hidden xl:inline",children:"Cetak Bukti Hadir"})]})]})]})]}),children:[e.jsx(Pe,{title:"Laporan Kehadiran"}),e.jsx("div",{className:"py-4 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col",children:e.jsxs("div",{className:"mx-auto max-w-7xl w-full flex-1 flex flex-col space-y-3.5",children:[e.jsxs("div",{className:"grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 flex-none","data-aos":"fade-up",children:[e.jsx("div",{className:"overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm",children:e.jsxs("div",{className:"flex items-center gap-3.5",children:[e.jsx("div",{className:"rounded-xl bg-indigo-50 border border-indigo-100 p-2.5",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6 text-indigo-700",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"})})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] font-bold text-slate-400 uppercase tracking-wider",children:"Total Peserta"}),e.jsx("p",{className:"text-xl font-extrabold text-slate-800 mt-0.5",children:u.total})]})]})}),e.jsx("div",{className:"overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm",children:e.jsxs("div",{className:"flex items-center gap-3.5",children:[e.jsx("div",{className:"rounded-xl bg-emerald-50 border border-emerald-100 p-2.5",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6 text-emerald-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"})})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] font-bold text-slate-400 uppercase tracking-wider",children:"Hadir"}),e.jsx("p",{className:"text-xl font-extrabold text-emerald-600 mt-0.5",children:u.hadir})]})]})}),e.jsx("div",{className:"overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm",children:e.jsxs("div",{className:"flex items-center gap-3.5",children:[e.jsx("div",{className:"rounded-xl bg-amber-50 border border-amber-100 p-2.5",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6 text-amber-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"})})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] font-bold text-slate-400 uppercase tracking-wider",children:"Belum Hadir"}),e.jsx("p",{className:"text-xl font-extrabold text-amber-600 mt-0.5",children:u.belum})]})]})}),e.jsx("div",{className:"overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm",children:e.jsxs("div",{className:"flex items-center gap-3.5",children:[e.jsx("div",{className:"rounded-xl bg-purple-50 border border-purple-100 p-2.5",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6 text-purple-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:[e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"}),e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"})]})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] font-bold text-slate-400 uppercase tracking-wider",children:"Persentase"}),e.jsxs("p",{className:"text-xl font-extrabold text-purple-600 mt-0.5",children:[se,"%"]})]})]})})]}),e.jsxs("div",{className:"overflow-hidden rounded-2xl bg-white border border-slate-200 p-3.5 shadow-sm flex-none","data-aos":"fade-up","data-aos-delay":"100",children:[e.jsxs("div",{className:"mb-1.5 flex items-center justify-between",children:[e.jsx("span",{className:"text-xs font-bold text-slate-700",children:"Progress Kehadiran"}),e.jsxs("span",{className:"text-xs font-extrabold text-indigo-600",children:[u.hadir," / ",u.total]})]}),e.jsx("div",{className:"h-2 w-full overflow-hidden rounded-full bg-slate-100",children:e.jsx("div",{className:"h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-700 transition-all duration-1000 ease-out",style:{width:`${se}%`}})})]}),e.jsxs("div",{className:"flex flex-col sm:flex-row gap-3 flex-none","data-aos":"fade-up","data-aos-delay":"150",children:[e.jsxs("div",{className:"relative flex-1",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2.5,d:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"})}),e.jsx("input",{type:"text",placeholder:"Cari data kehadiran berdasarkan nama atau NIP...",value:C,onChange:t=>xe(t.target.value),className:"w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-sm font-medium"})]}),e.jsx("div",{className:"sm:w-64",children:e.jsxs("select",{value:M,onChange:t=>k(t.target.value),className:"w-full rounded-xl border border-slate-200 bg-white py-2 px-3.5 text-xs sm:text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium cursor-pointer",children:[e.jsx("option",{value:"",children:"Semua Status Pegawai"}),O.map((t,a)=>e.jsx("option",{value:t,children:t},a))]})})]}),e.jsx("div",{className:"sm:hidden space-y-3","data-aos":"fade-up","data-aos-delay":"200",children:D.length===0?e.jsx("div",{className:"rounded-2xl bg-white border border-slate-200 p-10 text-center shadow-sm",children:e.jsx("p",{className:"text-sm font-semibold text-slate-500",children:"Belum ada data kehadiran."})}):te.map((t,a)=>e.jsxs("div",{className:"rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-sm font-bold text-indigo-600 shrink-0",children:(t.nama||"P").charAt(0).toUpperCase()}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"text-sm font-bold text-slate-800 truncate",children:t.nama}),e.jsxs("p",{className:"text-xs text-slate-500 font-mono",children:[t.nis_nip||"-"," · ",t.status_pegawai||"-"]})]})]}),i?.kategori==="harian"?e.jsxs("div",{className:"grid grid-cols-4 gap-1.5 text-center",children:[e.jsxs("div",{className:"rounded-lg bg-red-50 border border-red-100 p-1.5",children:[e.jsx("p",{className:"text-[9px] font-bold uppercase text-red-500",children:"Alpha"}),e.jsx("p",{className:"text-base font-extrabold text-red-600",children:t.total_alpha||"0"})]}),e.jsxs("div",{className:"rounded-lg bg-amber-50 border border-amber-100 p-1.5",children:[e.jsx("p",{className:"text-[9px] font-bold uppercase text-amber-500",children:"Izin"}),e.jsx("p",{className:"text-base font-extrabold text-amber-600",children:t.total_izin||"0"})]}),e.jsxs("div",{className:"rounded-lg bg-blue-50 border border-blue-100 p-1.5",children:[e.jsx("p",{className:"text-[9px] font-bold uppercase text-blue-500",children:"Sakit"}),e.jsx("p",{className:"text-base font-extrabold text-blue-600",children:t.total_sakit||"0"})]}),e.jsxs("div",{className:"rounded-lg bg-slate-50 border border-slate-200 p-1.5",children:[e.jsx("p",{className:"text-[9px] font-bold uppercase text-slate-500",children:"Terlambat"}),e.jsx("p",{className:"text-xs font-extrabold text-orange-600 leading-tight mt-0.5",children:t.total_menit_terlambat?t.total_menit_terlambat+"m":"0"})]})]}):e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-xs text-slate-600 font-mono",children:t.status!=="libur"?t.waktu_hadir:"-"}),s(t.status)]}),e.jsx("div",{className:"flex flex-wrap gap-2",children:i?.kategori==="harian"?e.jsxs(e.Fragment,{children:[e.jsx("button",{onClick:()=>{const n=K.find(d=>d.id===t.participant_id)||{id:t.participant_id,nama:t.nama,nis_nip:t.nis_nip,status:t.status_pegawai};P(n),E(!0)},className:"inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100",children:"Kalender"}),e.jsx("button",{onClick:()=>G(t.participant_id,t.nama,t.nis_nip,t.status_pegawai),className:"inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200",children:"Riwayat"}),e.jsx("button",{onClick:()=>ne(t.participant_id,t.nama),className:"inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200",children:"Cetak"})]}):e.jsx("button",{onClick:()=>q(t,t.nama),className:"inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100",children:"Edit Presensi"})})]},t.id||t.participant_id||a))}),e.jsx("div",{className:"hidden sm:flex overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm flex-1 flex-col min-h-0","data-aos":"fade-up","data-aos-delay":"200",children:e.jsx("div",{className:"min-h-0 flex-1 max-h-[474px] overflow-y-auto",children:e.jsxs("table",{className:"w-full min-w-full divide-y divide-slate-200 text-xs",children:[e.jsx("thead",{className:"bg-slate-50 sticky top-0 z-10 shadow-xs",children:e.jsxs("tr",{children:[e.jsx("th",{className:"w-12 px-3 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"No"}),e.jsx("th",{className:"px-4 py-3 text-left font-extrabold uppercase tracking-wider text-slate-500",children:"Nama Lengkap"}),e.jsx("th",{className:"w-44 px-3 py-3 text-left font-extrabold uppercase tracking-wider text-slate-500",children:"NIP"}),e.jsx("th",{className:"w-28 px-3 py-3 text-left font-extrabold uppercase tracking-wider text-slate-500",children:"Status Pegawai"}),i?.kategori==="harian"?e.jsxs(e.Fragment,{children:[e.jsx("th",{className:"w-16 px-2 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"Alpha"}),e.jsx("th",{className:"w-16 px-2 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"Izin"}),e.jsx("th",{className:"w-16 px-2 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"Sakit"}),e.jsx("th",{className:"w-24 px-2 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"Lupa Absen"}),e.jsx("th",{className:"w-28 px-2 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"Total Terlambat"}),e.jsx("th",{className:"w-60 px-3 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"Aksi"})]}):e.jsxs(e.Fragment,{children:[e.jsx("th",{className:"px-4 py-3 text-left font-extrabold uppercase tracking-wider text-slate-500",children:"Waktu Hadir"}),e.jsx("th",{className:"w-28 px-3 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"Status"}),e.jsx("th",{className:"w-40 px-3 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"Aksi"})]})]})}),e.jsx("tbody",{className:"divide-y divide-slate-100 bg-white",children:D.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:i?.kategori==="harian"?10:7,className:"px-4 py-16 text-center align-middle bg-white",children:e.jsxs("div",{className:"flex flex-col items-center justify-center text-center mx-auto w-full",children:[e.jsx("div",{className:"flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200/80 mb-2.5 shadow-2xs",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6 text-slate-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:1.5,d:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"})})}),e.jsx("p",{className:"text-sm font-bold text-slate-700",children:"Belum ada peserta yang hadir"}),e.jsx("p",{className:"text-xs text-slate-400 mt-0.5",children:"Data kehadiran peserta pada workcode ini masih kosong."})]})})}):D.map((t,a)=>e.jsxs("tr",{className:"transition-colors hover:bg-slate-50/70",children:[e.jsx("td",{className:"px-3 py-2.5 text-center text-xs text-slate-400 font-semibold",children:a+1}),e.jsx("td",{className:"px-4 py-2.5",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600 shrink-0",children:(t.nama||"P").charAt(0).toUpperCase()}),e.jsx("span",{className:"text-xs sm:text-sm font-bold text-slate-800 leading-snug",children:t.nama})]})}),e.jsx("td",{className:"px-3 py-2.5 text-xs text-slate-600 font-semibold font-mono",children:t.nis_nip||"-"}),e.jsx("td",{className:"px-3 py-2.5 text-xs text-slate-600 font-medium",children:t.status_pegawai||"-"}),i?.kategori==="harian"?e.jsxs(e.Fragment,{children:[e.jsx("td",{className:"px-2 py-2.5 text-xs text-red-600 font-bold text-center",children:t.total_alpha||"0"}),e.jsx("td",{className:"px-2 py-2.5 text-xs text-amber-600 font-bold text-center",children:t.total_izin||"0"}),e.jsx("td",{className:"px-2 py-2.5 text-xs text-blue-600 font-bold text-center",children:t.total_sakit||"0"}),e.jsx("td",{className:"px-2 py-2.5 text-xs text-slate-600 font-bold text-center",children:t.total_lupa_absen||"0"}),e.jsx("td",{className:"px-2 py-2.5 text-xs text-orange-600 font-bold text-center",children:t.total_menit_terlambat?t.total_menit_terlambat+" Menit":"0 Menit"}),e.jsx("td",{className:"px-3 py-2.5 text-center",children:e.jsxs("div",{className:"flex items-center justify-center gap-1.5",children:[e.jsxs("button",{onClick:()=>{const n=K.find(d=>d.id===t.participant_id)||{id:t.participant_id,nama:t.nama,nis_nip:t.nis_nip,status:t.status_pegawai};P(n),E(!0)},className:"inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-2xs shrink-0",title:"Buka Kalender 1 Bulan & Kelola Presensi",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3.5 w-3.5 text-emerald-600 shrink-0",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"})}),e.jsx("span",{children:"Kalender"})]}),e.jsx("button",{onClick:()=>G(t.participant_id,t.nama,t.nis_nip,t.status_pegawai),className:"inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-slate-100 border border-slate-200 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors shadow-2xs shrink-0",title:"Daftar Log Presensi",children:e.jsx("span",{children:"Log"})}),e.jsxs("button",{onClick:()=>ne(t.participant_id,t.nama),className:"inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors shadow-2xs shrink-0",title:"Cetak Surat Bukti Rekap Individu",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3.5 w-3.5 text-slate-600 shrink-0",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"})}),e.jsx("span",{children:"Cetak"})]})]})})]}):e.jsxs(e.Fragment,{children:[e.jsx("td",{className:"px-4 py-2.5 text-xs text-slate-700 font-mono font-semibold",children:t.status==="libur"?"-":t.waktu_hadir}),e.jsx("td",{className:"px-3 py-2.5 text-center",children:s(t.status)}),e.jsx("td",{className:"px-3 py-2.5 text-center",children:e.jsxs("div",{className:"flex items-center justify-center gap-1.5",children:[e.jsx("button",{onClick:()=>q(t,t.nama),className:"p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-colors",title:"Edit Presensi",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"})})}),e.jsx("button",{onClick:()=>ae(t.id,t.nama,t.waktu_hadir),className:"p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors",title:"Hapus Presensi",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"})})})]})})]})]},t.id||t.participant_id||a))})]})})})]})}),e.jsx(we,{show:h,onClose:()=>_(!1),maxWidth:"md",children:e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-slate-100 pb-4",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"})})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-base font-extrabold text-slate-800",children:"Edit Log Presensi"}),e.jsx("p",{className:"text-xs text-slate-500 font-medium",children:Y})]})]}),e.jsx("button",{type:"button",onClick:()=>_(!1),className:"rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]}),e.jsxs("form",{onSubmit:$,className:"mt-5 space-y-4",children:[e.jsxs("div",{children:[e.jsx(de,{htmlFor:"edit_tanggal",value:"Tanggal Presensi",className:"text-xs font-bold text-slate-700"}),e.jsx(fe,{id:"edit_tanggal",type:"date",value:m.data.tanggal,onChange:t=>m.setData("tanggal",t.target.value),className:"mt-1 w-full text-xs font-medium",required:!0}),e.jsx(R,{message:m.errors.tanggal,className:"mt-1 text-xs"})]}),e.jsxs("div",{children:[e.jsx(de,{htmlFor:"edit_status",value:"Status Kehadiran",className:"text-xs font-bold text-slate-700"}),e.jsxs("select",{id:"edit_status",value:m.data.status,onChange:t=>m.setData("status",t.target.value),className:"mt-1 w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10",required:!0,children:[e.jsx("option",{value:"hadir",children:"Hadir"}),e.jsx("option",{value:"izin",children:"Izin"}),e.jsx("option",{value:"sakit",children:"Sakit"}),e.jsx("option",{value:"lupa_absen",children:"Lupa Absen"}),e.jsx("option",{value:"alpha",children:"Alpha"})]}),e.jsx(R,{message:m.errors.status,className:"mt-1 text-xs"})]}),m.data.status!=="alpha"&&e.jsxs("div",{className:`grid grid-cols-1 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 ${J?"":"sm:grid-cols-2"}`,children:[e.jsxs("div",{children:[e.jsx(de,{htmlFor:"edit_jam_masuk",value:J?"Jam Absen":"Jam Datang",className:"text-xs font-bold text-slate-600"}),e.jsx(fe,{id:"edit_jam_masuk",type:"time",value:m.data.jam_masuk,onChange:t=>m.setData("jam_masuk",t.target.value),className:"mt-1 w-full text-xs"}),e.jsx(R,{message:m.errors.jam_masuk,className:"mt-1 text-xs"})]}),!J&&e.jsxs("div",{children:[e.jsx(de,{htmlFor:"edit_jam_pulang",value:"Jam Pulang",className:"text-xs font-bold text-slate-600"}),e.jsx(fe,{id:"edit_jam_pulang",type:"time",value:m.data.jam_pulang,onChange:t=>m.setData("jam_pulang",t.target.value),className:"mt-1 w-full text-xs"}),e.jsx(R,{message:m.errors.jam_pulang,className:"mt-1 text-xs"})]})]}),e.jsxs("div",{className:"mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4",children:[e.jsx(je,{type:"button",onClick:()=>_(!1),children:"Batal"}),e.jsx(De,{type:"submit",disabled:m.processing,className:"bg-indigo-600 hover:bg-indigo-700",children:m.processing?"Menyimpan...":"Perbarui Presensi"})]})]})]})}),e.jsx(we,{show:p,onClose:()=>f(!1),maxWidth:"2xl",children:e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-slate-100 pb-4",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"})})}),e.jsxs("div",{children:[e.jsxs("h3",{className:"text-base font-extrabold text-slate-800",children:["Riwayat Presensi: ",r?.nama]}),e.jsxs("p",{className:"text-xs text-slate-500 font-medium",children:["NIP: ",e.jsx("span",{className:"font-mono",children:r?.nis_nip||"-"})," • ",r?.status_pegawai||"-"]})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("button",{type:"button",onClick:()=>{P(r),E(!0),f(!1)},className:"inline-flex items-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3.5 w-3.5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"})}),"Buka Kalender"]}),e.jsx("button",{type:"button",onClick:()=>f(!1),className:"rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]})]}),e.jsx("div",{className:"mt-4",children:g?e.jsx("div",{className:"py-12 text-center text-slate-500 text-xs font-semibold",children:"Memuat data riwayat presensi..."}):r?.attendances?.length===0?e.jsxs("div",{className:"py-12 text-center text-slate-500",children:[e.jsx("p",{className:"text-xs font-semibold",children:"Belum ada riwayat rekaman presensi untuk peserta ini."}),e.jsx("button",{type:"button",onClick:()=>{P(r),E(!0),f(!1)},className:"mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline",children:"📅 Buka kalender presensi sekarang"})]}):e.jsx("div",{className:"overflow-x-auto max-h-[350px] overflow-y-auto rounded-xl border border-slate-200",children:e.jsxs("table",{className:"min-w-full divide-y divide-slate-200 text-xs",children:[e.jsx("thead",{className:"bg-slate-50 sticky top-0 z-10",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-4 py-2.5 text-left font-extrabold text-slate-500 uppercase tracking-wider",children:"No"}),e.jsx("th",{className:"px-4 py-2.5 text-left font-extrabold text-slate-500 uppercase tracking-wider",children:"Tanggal"}),e.jsx("th",{className:"px-4 py-2.5 text-center font-extrabold text-slate-500 uppercase tracking-wider",children:"Jam Datang"}),e.jsx("th",{className:"px-4 py-2.5 text-center font-extrabold text-slate-500 uppercase tracking-wider",children:"Jam Pulang"}),e.jsx("th",{className:"px-4 py-2.5 text-center font-extrabold text-slate-500 uppercase tracking-wider",children:"Status"}),e.jsx("th",{className:"px-4 py-2.5 text-center font-extrabold text-slate-500 uppercase tracking-wider",children:"Aksi"})]})}),e.jsx("tbody",{className:"divide-y divide-slate-100 bg-white",children:r?.attendances?.map((t,a)=>e.jsxs("tr",{className:"hover:bg-slate-50/60 transition-colors",children:[e.jsx("td",{className:"px-4 py-2.5 text-slate-500 font-semibold",children:a+1}),e.jsx("td",{className:"px-4 py-2.5 font-bold text-slate-800",children:t.tanggal_formatted||t.tanggal||"-"}),e.jsx("td",{className:"px-4 py-2.5 text-center font-mono font-medium text-slate-700",children:t.status==="libur"?"-":t.jam_masuk?`${t.jam_masuk} WIB`:t.waktu_hadir!=="-"?t.waktu_hadir:"-"}),e.jsx("td",{className:"px-4 py-2.5 text-center font-mono font-medium text-slate-700",children:t.status==="libur"?"-":t.jam_pulang?`${t.jam_pulang} WIB`:t.waktu_pulang!=="-"?t.waktu_pulang:"-"}),e.jsx("td",{className:"px-4 py-2.5 text-center",children:s(t.status)}),e.jsx("td",{className:"px-4 py-2.5 text-center",children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[e.jsx("button",{type:"button",onClick:()=>q(t,r.nama),className:"p-1 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors",title:"Edit Log Presensi Ini",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"})})}),e.jsx("button",{type:"button",onClick:()=>ae(t.id,r.nama,t.tanggal_formatted||t.tanggal),className:"p-1 rounded-lg text-red-600 hover:bg-red-50 transition-colors",title:"Hapus Log Presensi Ini (Reset Status)",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"})})})]})})]},t.id||a))})]})})}),e.jsx("div",{className:"mt-5 flex justify-end border-t border-slate-100 pt-3",children:e.jsx(je,{onClick:()=>f(!1),children:"Tutup"})})]})}),e.jsx(Be,{show:V,onClose:()=>{E(!1),P(null),oe.reload({only:["stats","attendances"],preserveScroll:!0,preserveState:!0})},workcode:i,participants:K,initialParticipant:ce,onAttendanceChanged:()=>{oe.reload({only:["stats","attendances"],preserveScroll:!0,preserveState:!0})}})]})}export{Je as default};
