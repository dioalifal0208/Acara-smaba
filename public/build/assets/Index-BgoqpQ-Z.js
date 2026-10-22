import{c as He,u as Ee,r as l,j as e,f as re,e as $e,d as Ye,H as Ue,b as ge,g as ze}from"./app-BRtvYaTT.js";import{A as qe}from"./AuthenticatedLayout-CqXmeeTs.js";import{j as Qe,b as Ze}from"./backgroundReload-BMJ_ZTa3.js";import{K as be}from"./KpiCard-DIhTfKgh.js";import{i as G}from"./adminMenu-PnxHrh2j.js";import{M as ie}from"./Modal-B1YFf5Rc.js";import{S as we}from"./SecondaryButton-DXPi6FX0.js";import{I as Y}from"./InputError-CCdbndPf.js";import{P as Xe}from"./PrimaryButton-DV5lCtiz.js";import{I as fe}from"./InputLabel-5OSL2D9y.js";import{T as Ce}from"./TextInput-DnBZTVhC.js";import"./transition-CFFT96S5.js";const Ie=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"],et=["Min","Sen","Sel","Rab","Kam","Jum","Sab"];function tt({show:p=!1,onClose:v=()=>{},workcode:h=null,participants:r=[],initialParticipant:y=null,onAttendanceChanged:O=()=>{}}){const{toast:A}=He(),oe=Ee(),[g,z]=l.useState(null),[M,U]=l.useState(""),[te,q]=l.useState(!1),P=new Date,[N,Q]=l.useState(P.getFullYear()),[x,D]=l.useState(P.getMonth()),[$,de]=l.useState([]),[Z,ce]=l.useState(!1),[H,f]=l.useState({});l.useEffect(()=>{(async()=>{try{const s=await re.get("/api/holidays");f(s.data||{})}catch(s){console.error("Gagal memuat data hari libur:",s)}})()},[]);const[_,k]=l.useState(null),[w,S]=l.useState({id:null,workcode_id:h?.id||"",participant_id:"",tanggal:"",jam_masuk:"07:00",jam_pulang:"15:30",status:"hadir"}),[I,xe]=l.useState(!1),[E,m]=l.useState({});l.useEffect(()=>{p&&(y?(z(y),U("")):r.length>0&&!g&&z(r[0]))},[p,y]);const ae=async a=>{if(!(!h||!a)){ce(!0);try{const s=await re.get(`/report/individual/${h.id}/${a}`);de(s.data.attendances||[])}catch(s){console.error("Gagal mengambil data presensi:",s),A.error("Gagal memuat data presensi kalender.")}finally{ce(!1)}}};l.useEffect(()=>{p&&g&&h&&ae(g.id)},[p,g?.id,h?.id]);const me=l.useMemo(()=>{if(!M.trim())return r;const a=M.toLowerCase();return r.filter(s=>(s.nama||"").toLowerCase().includes(a)||s.nis_nip&&s.nis_nip.toLowerCase().includes(a))},[r,M]),se=l.useMemo(()=>{const a={};return $.forEach(s=>{s.tanggal&&(a[s.tanggal]=s)}),a},[$]),j=()=>{x===0?(D(11),Q(a=>a-1)):D(a=>a-1)},pe=()=>{x===11?(D(0),Q(a=>a+1)):D(a=>a+1)},ve=()=>{Q(P.getFullYear()),D(P.getMonth())},ye=l.useMemo(()=>{const a=new Date(N,x,1).getDay(),s=new Date(N,x+1,0).getDate(),b=new Date(N,x,0).getDate(),o=[];for(let c=a-1;c>=0;c--){const W=b-c,C=x===0?11:x-1,T=`${x===0?N-1:N}-${String(C+1).padStart(2,"0")}-${String(W).padStart(2,"0")}`;o.push({dayNumber:W,dateStr:T,isCurrentMonth:!1,isWeekend:!1})}for(let c=1;c<=s;c++){const W=new Date(N,x,c),C=`${N}-${String(x+1).padStart(2,"0")}-${String(c).padStart(2,"0")}`,L=W.getDay(),T=L===0||L===6,_e=!!H[C],t=H[C]||null,n=P.getFullYear()===N&&P.getMonth()===x&&P.getDate()===c;o.push({dayNumber:c,dateStr:C,isCurrentMonth:!0,isWeekend:T,isHoliday:_e,holidayName:t,isToday:n,dayOfWeek:L,attendance:se[C]||null})}const B=o.length,X=(B<=35?35:42)-B;for(let c=1;c<=X;c++){const W=x===11?0:x+1,L=`${x===11?N+1:N}-${String(W+1).padStart(2,"0")}-${String(c).padStart(2,"0")}`;o.push({dayNumber:c,dateStr:L,isCurrentMonth:!1,isWeekend:!1})}return o},[N,x,se,H]),F=l.useMemo(()=>{let a=0,s=0,b=0,o=0,B=0,ne=0;const X=`${N}-${String(x+1).padStart(2,"0")}`;return $.forEach(c=>{c.tanggal&&c.tanggal.startsWith(X)&&(c.status==="hadir"?a++:c.status==="izin"?s++:c.status==="sakit"?b++:c.status==="alpha"?o++:c.status==="lupa_absen"?B++:c.status==="libur"&&ne++)}),{hadir:a,izin:s,sakit:b,alpha:o,lupaAbsen:B,libur:ne}},[$,N,x]),Ne=a=>{if(!a.isCurrentMonth)return;const b=new Date(a.dateStr).toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"}),o=a.attendance;S(o?{id:o.id,workcode_id:h.id,participant_id:g.id,tanggal:a.dateStr,jam_masuk:o.jam_masuk||"",jam_pulang:o.jam_pulang||"",status:o.status||"hadir"}:{id:null,workcode_id:h.id,participant_id:g.id,tanggal:a.dateStr,jam_masuk:"07:00",jam_pulang:"15:30",status:"hadir"}),m({}),k({dateStr:a.dateStr,dateFormatted:b,existingAttendance:o})},R=async a=>{a.preventDefault(),xe(!0),m({});try{if(w.id){const s=await re.put(route("admin.attendances.update",w.id),w);A.success(s.data?.message||"Presensi berhasil diperbarui.")}else{const s=await re.post(route("admin.attendances.store"),w);A.success(s.data?.message||"Presensi berhasil disimpan.")}k(null),await ae(g.id),O()}catch(s){console.error("Gagal menyimpan presensi:",s),s.response?.data?.errors&&m(s.response.data.errors),A.error(s.response?.data?.message||"Gagal menyimpan data presensi.")}finally{xe(!1)}},ke=async()=>{if(!_?.existingAttendance)return;if(await oe({title:"Hapus Log Presensi",message:`Apakah Anda yakin ingin menghapus catatan presensi untuk ${g?.nama} pada tanggal ${_.dateFormatted}? Status hari tersebut akan direset.`,type:"danger",confirmText:"Ya, Hapus Data",cancelText:"Batal"}))try{const s=await re.delete(route("admin.attendances.destroy",_.existingAttendance.id));A.success(s.data?.message||"Presensi berhasil dihapus."),k(null),await ae(g.id),O()}catch(s){console.error("Gagal menghapus presensi:",s),A.error(s.response?.data?.message||"Gagal menghapus data presensi.")}};return e.jsxs(ie,{show:p,onClose:v,maxWidth:"5xl",closeable:!1,children:[e.jsxs("div",{className:"p-5 sm:p-7 flex flex-col max-h-[92vh] overflow-y-auto",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-slate-100 pb-3",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"})})}),e.jsxs("div",{children:[e.jsxs("h3",{className:"text-base font-extrabold text-slate-800 flex items-center gap-2",children:["Kalender Presensi Peserta",h&&e.jsx("span",{className:"text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100",children:h.nama_workcode})]}),e.jsx("p",{className:"text-xs text-slate-500 font-medium",children:"Klik kotak tanggal pada kalender untuk menambah, mengedit, atau menghapus presensi."})]})]}),e.jsx("button",{type:"button",onClick:v,className:"rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]}),e.jsxs("div",{className:"mt-3.5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center flex-1",children:[e.jsxs("div",{className:"relative flex-1 sm:max-w-xs",children:[e.jsxs("div",{className:"relative",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"})}),e.jsx("input",{type:"text",placeholder:"Cari nama peserta / NIP...",value:M,onChange:a=>{U(a.target.value),q(!0)},onFocus:()=>q(!0),className:"w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-7 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium shadow-xs"}),M&&e.jsx("button",{type:"button",onClick:()=>U(""),className:"absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs",children:"✕"})]}),te&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0 z-20",onClick:()=>q(!1)}),e.jsx("div",{className:"absolute left-0 right-0 top-full mt-1.5 z-30 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl py-1",children:me.length===0?e.jsx("div",{className:"px-4 py-3 text-xs text-slate-500 text-center font-medium",children:"Tidak ada peserta ditemukan."}):me.map(a=>e.jsxs("button",{type:"button",onClick:()=>{z(a),U(""),q(!1)},className:`w-full px-3.5 py-1.5 text-left text-xs flex items-center justify-between hover:bg-indigo-50/70 transition-colors ${g?.id===a.id?"bg-indigo-50 text-indigo-700 font-bold":"text-slate-700"}`,children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700",children:(a.nama||"").charAt(0).toUpperCase()}),e.jsxs("div",{children:[e.jsx("p",{className:"font-bold text-slate-800 leading-tight",children:a.nama}),e.jsxs("p",{className:"text-[9px] text-slate-500 font-mono",children:["NIP: ",a.nis_nip||"-"]})]})]}),e.jsx("span",{className:"text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold",children:a.status||"-"})]},a.id))})]})]}),g&&e.jsxs("div",{className:"flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200/90 shadow-xs shrink-0",children:[e.jsx("div",{className:"flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-extrabold text-white",children:(g.nama||"").charAt(0).toUpperCase()}),e.jsxs("div",{className:"leading-tight",children:[e.jsx("p",{className:"text-xs font-extrabold text-slate-800",children:g.nama}),e.jsxs("p",{className:"text-[10px] text-slate-500 font-medium",children:["NIP: ",e.jsx("span",{className:"font-mono",children:g.nis_nip||"-"})," • ",g.status||"-"]})]})]})]}),e.jsxs("div",{className:"flex items-center justify-between sm:justify-end gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200/90 shadow-xs shrink-0",children:[e.jsx("button",{type:"button",onClick:j,className:"flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors",title:"Bulan Sebelumnya",children:"❮"}),e.jsxs("h4",{className:"text-xs font-extrabold text-slate-800 px-2 min-w-[130px] text-center",children:[Ie[x]," ",N]}),e.jsx("button",{type:"button",onClick:pe,className:"flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors",title:"Bulan Berikutnya",children:"❯"}),e.jsx("button",{type:"button",onClick:ve,className:"ml-1 px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors",children:"Bulan Ini"})]})]}),e.jsxs("div",{className:"mt-3 bg-white rounded-2xl border border-slate-200 p-2.5 shadow-xs",children:[e.jsx("div",{className:"grid grid-cols-7 gap-1 sm:gap-1.5 mb-1 sm:mb-1.5 text-center",children:et.map((a,s)=>e.jsxs("div",{className:`py-1 text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider rounded-lg ${s===0||s===6?"text-red-500 bg-red-50/60":"text-slate-500 bg-slate-50"}`,children:[e.jsx("span",{className:"sm:hidden",children:a.charAt(0)}),e.jsx("span",{className:"hidden sm:inline",children:a})]},s))}),Z?e.jsxs("div",{className:"py-16 text-center text-xs font-semibold text-slate-500 flex flex-col items-center gap-2",children:[e.jsx("div",{className:"h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"}),"Memuat data kalender presensi..."]}):e.jsx("div",{className:"grid grid-cols-7 gap-1 sm:gap-1.5",children:ye.map((a,s)=>{const b=a.attendance,o=a.isCurrentMonth;return e.jsxs("div",{onClick:()=>o&&Ne(a),className:`group min-h-[44px] sm:min-h-[64px] rounded-xl p-0.5 sm:p-1.5 flex flex-col justify-between transition-all select-none ${o?"border border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer "+(a.isToday?"bg-indigo-50/20 ring-2 ring-indigo-500/30":"bg-white hover:bg-slate-50/50"):"bg-slate-50/40 text-slate-300 border border-transparent cursor-not-allowed opacity-30"}`,children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-1.5 min-w-0",children:[e.jsx("span",{title:a.holidayName||"",className:`text-xs font-bold leading-none shrink-0 ${o?a.isToday?"flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white font-black text-[10px]":a.isWeekend||a.isHoliday?"text-red-500":"text-slate-700":"text-slate-300"}`,children:a.dayNumber}),o&&a.isHoliday&&e.jsx("span",{className:"text-[8px] font-bold text-red-600 bg-red-50 border border-red-100 px-1 rounded truncate max-w-[45px] sm:max-w-[70px]",title:a.holidayName,children:a.holidayName})]}),o&&!b&&e.jsx("span",{className:"text-[10px] text-slate-300 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold shrink-0",children:"+"})]}),o&&b&&e.jsxs("div",{className:"mt-1 flex flex-col gap-0.5",children:[b.status==="hadir"&&e.jsxs("div",{className:"rounded-md bg-emerald-50 border border-emerald-200 px-1 py-0.5 text-center",children:[e.jsx("span",{className:"text-[9px] font-black text-emerald-700 block leading-tight",children:"✓ HADIR"}),(b.jam_masuk||b.jam_pulang)&&e.jsxs("span",{className:"text-[8px] font-medium text-emerald-600 block leading-tight font-mono",children:[b.jam_masuk||"–"," - ",b.jam_pulang||"–"]})]}),b.status==="alpha"&&e.jsx("div",{className:"rounded-md bg-red-50 border border-red-200 px-1 py-0.5 text-center",children:e.jsx("span",{className:"text-[9px] font-black text-red-700 block leading-tight",children:"✗ ALPHA"})}),b.status==="izin"&&e.jsx("div",{className:"rounded-md bg-amber-50 border border-amber-200 px-1 py-0.5 text-center",children:e.jsx("span",{className:"text-[9px] font-black text-amber-700 block leading-tight",children:"! IZIN"})}),b.status==="sakit"&&e.jsx("div",{className:"rounded-md bg-blue-50 border border-blue-200 px-1 py-0.5 text-center",children:e.jsx("span",{className:"text-[9px] font-black text-blue-700 block leading-tight",children:"+ SAKIT"})}),b.status==="lupa_absen"&&e.jsx("div",{className:"rounded-md bg-slate-100 border border-slate-300 px-1 py-0.5 text-center",children:e.jsx("span",{className:"text-[9px] font-black text-slate-700 block leading-tight",children:"? LUPA ABSEN"})}),b.status==="libur"&&e.jsx("div",{className:"rounded-md bg-rose-50 border border-rose-200 px-1 py-0.5 text-center",children:e.jsx("span",{className:"text-[9px] font-black text-rose-700 block leading-tight",children:"★ LIBUR"})})]}),o&&!b&&e.jsx("div",{className:"h-3 flex items-center justify-center",children:e.jsx("span",{className:"text-[9px] text-slate-300 font-medium group-hover:hidden",children:"-"})})]},s)})})]}),e.jsxs("div",{className:"mt-3.5 flex flex-wrap items-center justify-between gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200",children:[e.jsxs("div",{className:"flex flex-wrap items-center gap-3 sm:gap-5 text-xs",children:[e.jsxs("span",{className:"text-[11px] font-bold text-slate-500 uppercase tracking-wider",children:["Rekap ",Ie[x],":"]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-emerald-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-emerald-500"})," Hadir: ",F.hadir]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-amber-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-amber-500"})," Izin: ",F.izin]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-blue-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-blue-500"})," Sakit: ",F.sakit]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-red-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-red-500"})," Alpha: ",F.alpha]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-slate-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-slate-400"})," Lupa Absen: ",F.lupaAbsen]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-rose-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-rose-500"})," Libur: ",F.libur]})]}),e.jsx(we,{onClick:v,className:"text-xs",children:"Tutup"})]})]}),_&&e.jsx("div",{className:"fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]",children:e.jsxs("div",{className:"relative w-full max-w-lg rounded-xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150",onClick:a=>a.stopPropagation(),children:[e.jsxs("div",{className:"flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100/70 text-indigo-600 shadow-xs",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"})})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-sm font-black text-slate-800",children:_.existingAttendance?"Edit Data Presensi":"Input Presensi Manual"}),e.jsx("p",{className:"text-xs font-bold text-indigo-600",children:_.dateFormatted})]})]}),e.jsx("button",{type:"button",onClick:()=>k(null),className:"rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition-colors",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]}),e.jsxs("form",{onSubmit:R,className:"p-6 space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80",children:[e.jsx("div",{className:"flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shrink-0",children:(g?.nama||"P").charAt(0).toUpperCase()}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("p",{className:"text-xs font-extrabold text-slate-800 truncate leading-tight",children:g?.nama}),e.jsxs("p",{className:"text-[10px] text-slate-500 font-mono leading-tight",children:["NIP: ",g?.nis_nip||"-"," • ",g?.status||"-"]})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-extrabold text-slate-700 mb-2",children:"Pilih Status Kehadiran:"}),e.jsx("div",{className:"grid grid-cols-3 gap-2",children:[{key:"hadir",label:"Hadir",icon:"✓",activeBg:"bg-emerald-600 text-white border-emerald-600 shadow-emerald-200 shadow-md"},{key:"izin",label:"Izin",icon:"!",activeBg:"bg-amber-500 text-white border-amber-500 shadow-amber-200 shadow-md"},{key:"sakit",label:"Sakit",icon:"+",activeBg:"bg-blue-600 text-white border-blue-600 shadow-blue-200 shadow-md"},{key:"lupa_absen",label:"Lupa Absen",icon:"?",activeBg:"bg-slate-700 text-white border-slate-700 shadow-slate-200 shadow-md"},{key:"alpha",label:"Alpha",icon:"✗",activeBg:"bg-red-600 text-white border-red-600 shadow-red-200 shadow-md"},{key:"libur",label:"Libur",icon:"★",activeBg:"bg-rose-600 text-white border-rose-600 shadow-rose-200 shadow-md"}].map(a=>{const s=w.status===a.key;return e.jsxs("button",{type:"button",onClick:()=>S({...w,status:a.key}),className:`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 select-none ${s?a.activeBg:"bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"}`,children:[e.jsx("span",{className:"font-mono text-xs",children:a.icon}),e.jsx("span",{children:a.label})]},a.key)})}),e.jsx(Y,{message:E.status?.[0]||E.status,className:"mt-1 text-xs"})]}),!["alpha","libur"].includes(w.status)&&e.jsxs("div",{className:"p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-[11px] font-extrabold text-slate-600 uppercase tracking-wider",children:"Jam Kehadiran"}),e.jsx("div",{className:"flex items-center gap-1.5 text-[10px]",children:e.jsx("button",{type:"button",onClick:()=>{S({...w,jam_masuk:"07:00",jam_pulang:"15:30"})},className:"px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 font-semibold transition-colors",children:"Preset Normal (07:00 - 15:30)"})})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{children:[e.jsx("label",{htmlFor:"modal_jam_masuk",className:"block text-[11px] font-bold text-slate-600 mb-1",children:"Jam Datang"}),e.jsx("input",{id:"modal_jam_masuk",type:"time",value:w.jam_masuk,onChange:a=>S({...w,jam_masuk:a.target.value}),className:"w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-mono font-bold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-xs"}),e.jsx(Y,{message:E.jam_masuk?.[0]||E.jam_masuk,className:"mt-0.5 text-[10px]"})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"modal_jam_pulang",className:"block text-[11px] font-bold text-slate-600 mb-1",children:"Jam Pulang"}),e.jsx("input",{id:"modal_jam_pulang",type:"time",value:w.jam_pulang,onChange:a=>S({...w,jam_pulang:a.target.value}),className:"w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-mono font-bold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-xs"}),e.jsx(Y,{message:E.jam_pulang?.[0]||E.jam_pulang,className:"mt-0.5 text-[10px]"})]})]})]}),e.jsxs("div",{className:"pt-3 border-t border-slate-100 flex items-center justify-between gap-3",children:[e.jsx("div",{children:_.existingAttendance&&e.jsxs("button",{type:"button",onClick:ke,disabled:I,className:"inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 border border-red-200/80 rounded-xl transition-all active:scale-95 shadow-xs disabled:opacity-50",title:"Hapus presensi dan reset status pada tanggal ini",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3.5 w-3.5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"})}),"Hapus Presensi"]})}),e.jsxs("div",{className:"flex items-center gap-2 ml-auto",children:[e.jsx("button",{type:"button",onClick:()=>k(null),className:"px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors",children:"Batal"}),e.jsxs("button",{type:"submit",disabled:I,className:`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 ${_.existingAttendance?"bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-200":"bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-200"}`,children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3.5 w-3.5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2.5,d:"M5 13l4 4L19 7"})}),I?"Menyimpan...":_.existingAttendance?"Perbarui Presensi":"Simpan Presensi"]})]})]})]})]})})]})}function gt({workcodes:p=[],activeWorkcodes:v=[],selectedWorkcodeId:h,selectedWorkcode:r,stats:y,attendances:O=[],participants:A=[],kepalaSekolahNama:oe="Muhtarom, S.Pd., M.Si.",kepalaSekolahNip:g="197205172006041015"}){const{flash:z}=$e().props,{toast:M}=He(),U=Ee(),[te,q]=l.useState(""),[P,N]=l.useState(""),[Q,x]=l.useState(!1),[D,$]=l.useState(!1),[de,Z]=l.useState(!1),[ce,H]=l.useState(null),[f,_]=l.useState(null),[k,w]=l.useState(null),[S,I]=l.useState(null),[xe,E]=l.useState(""),[m,ae]=l.useState(null),[me,se]=l.useState(!1),j=Ye({id:null,tanggal:"",jam_masuk:"",jam_pulang:"",status:"hadir"}),pe=Q||D||de||f!==null||k!==null;l.useEffect(()=>{if(pe)return;const t=()=>Ze({only:["stats","attendances","participants","activeWorkcodes"],preserveScroll:!0,preserveState:!0}),n=window.setInterval(t,Qe(2e4)),d=()=>document.visibilityState==="visible"&&t();return document.addEventListener("visibilitychange",d),()=>{window.clearInterval(n),document.removeEventListener("visibilitychange",d)}},[pe]),l.useEffect(()=>{z?.success?M.success(z.success):z?.error&&M.error(z.error)},[z]);const ve=["PNS","PPPK","PPPK Paruh Waktu","GTT","PTT"],ye=O.map(t=>t.status_pegawai).filter(Boolean).sort(),F=[...new Set([...ve,...ye])],Ne=t=>{ge.get(route("report"),{workcode_id:t},{preserveState:!0,preserveScroll:!0})},R=O.filter(t=>{const n=(t.nama||"").toLowerCase().includes(te.toLowerCase())||(t.nis_nip||"").toLowerCase().includes(te.toLowerCase()),d=P===""||t.status_pegawai===P;return n&&d}),ke=R.slice(0,5),a=y&&y.total>0?Math.round(y.hadir/y.total*100):0,s=r?.kategori==="workcode",b=t=>t?new Intl.DateTimeFormat("id-ID",{day:"numeric",month:"long",year:"numeric"}).format(new Date(`${t}T00:00:00`)):"-",o=(t,n="")=>{const d=t.waktu_hadir&&t.waktu_hadir!=="-"?String(t.waktu_hadir):"",u=d.match(/^(\d{4}-\d{2}-\d{2})/)?.[1]||"",K=d.match(/(\d{2}:\d{2})(?::\d{2})?$/)?.[1]||"";E(n||t.nama||"Peserta"),j.setData({id:t.id,tanggal:t.tanggal||u||new Date().toISOString().split("T")[0],jam_masuk:t.jam_masuk||K,jam_pulang:s?"":t.jam_pulang||"",status:t.status||"hadir"}),x(!0)},B=async(t,n,d,u)=>{if(r){se(!0);try{const ee=await(await fetch(ze(`report/individual/${r.id}/${t}`))).json();ae({id:t,nama:n||ee.participant.nama,nis_nip:d||ee.participant.nis_nip,status_pegawai:u||ee.participant.status,attendances:ee.attendances||[]}),$(!0)}catch(K){console.error("Gagal mengambil data riwayat:",K),M.error("Gagal memuat riwayat presensi.")}finally{se(!1)}}},ne=t=>{t.preventDefault(),j.put(route("admin.attendances.update",j.data.id),{preserveScroll:!0,onSuccess:()=>{x(!1),j.reset(),D&&m&&B(m.id,m.nama,m.nis_nip,m.status_pegawai)}})},X=async(t,n,d)=>{await U({title:"Hapus Log Presensi",message:`Apakah Anda yakin ingin menghapus catatan presensi ${n?`untuk "${n}"`:""} ${d?`tanggal ${d}`:""}? Tindakan ini akan menghapus data kehadiran/alpha/izin hari tersebut.`,type:"danger",confirmText:"Ya, Hapus Data",cancelText:"Batal"})&&ge.delete(route("admin.attendances.destroy",t),{preserveScroll:!0,onSuccess:()=>{D&&m&&B(m.id,m.nama,m.nis_nip,m.status_pegawai)}})},c=()=>{if(!r)return;const t=window.open("","_blank","width=800,height=900"),n=R.map((u,K)=>`
            <tr>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${K+1}</td>
                <td style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px;">${u.nama}</td>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 11px;">${u.nis_nip}</td>
                <td style="padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${u.status_pegawai||"-"}</td>
                ${r.kategori==="harian"?`
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${u.total_alpha||"0"}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${u.total_izin||"0"}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${u.total_sakit||"0"}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${u.total_lupa_absen||"0"}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${u.total_menit_terlambat?u.total_menit_terlambat+" Menit":"0 Menit"}</td>
                    `:`
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${u.waktu_hadir}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px;">${u.status?u.status.replace("_"," ").toUpperCase():"-"}</td>
                        <td style="text-align: center; padding: 4px 8px; border: 1px solid #cbd5e1;">
                            <div style="font-weight: bold; font-size: 10px;">${u.attendance_method||"-"}</div>
                            ${u.signature_url?`<img src="${u.signature_url}" alt="Tanda tangan ${u.nama}" style="display: block; width: 90px; height: 34px; object-fit: contain; margin: 2px auto 0;" />`:""}
                        </td>
                    `}
            </tr>
        `).join(""),d=r.kategori==="harian"?`
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
                <th style="width: 110px;">Metode</th>
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
                            ${d}
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
                        <p style="font-weight: bold; text-decoration: underline; font-size: 13px;">${oe}</p>
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
        `),t.document.close()},W=async(t,n)=>{if(r)try{const d=new Date,u=d.getFullYear(),K=d.getMonth()+1,ee=d.toLocaleDateString("id-ID",{month:"long",year:"numeric"}),Se=await(await fetch(ze(`report/individual/${r.id}/${t}?year=${u}&month=${K}`))).json(),Me=window.open("","_blank","width=800,height=900"),le=(Se.attendances||[]).slice().sort((i,Le)=>{const ue=i.tanggal||"",he=Le.tanggal||"";return ue.localeCompare(he)}),Fe=le.map((i,Le)=>{let ue="-";if(i.tanggal){const[Ve,Oe,Ge]=i.tanggal.split("-").map(Number);ue=new Date(Ve,Oe-1,Ge).toLocaleDateString("id-ID",{weekday:"long",day:"2-digit",month:"long",year:"numeric"})}let he=i.jam_masuk||(i.waktu_hadir!=="-"?i.waktu_hadir:"-"),De=i.jam_pulang||(i.waktu_pulang!=="-"?i.waktu_pulang:"-");i.status==="libur"&&(he="-",De="-");let J=(i.status||"hadir").toUpperCase(),V="#0f172a";return i.status==="hadir"||!i.status?i.is_late?(J="TERLAMBAT",V="#b91c1c"):(J="HADIR",V="#15803d"):i.status==="terlambat"?(J="TERLAMBAT",V="#b91c1c"):i.status==="izin"?(J="IZIN",V="#b45309"):i.status==="sakit"?(J="SAKIT",V="#1d4ed8"):i.status==="alpha"?(J="ALPHA",V="#b91c1c"):i.status==="lupa_absen"&&(J="LUPA ABSEN",V="#475569"),`
                    <tr>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${Le+1}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${ue}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${he}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${De}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px; color: ${V};">${J}</td>
                    </tr>
                `}).join(""),Re=le.filter(i=>i.status==="alpha").length,We=le.filter(i=>i.status==="izin").length,Ke=le.filter(i=>i.status==="sakit").length,Je=le.filter(i=>i.status==="lupa_absen").length;Me.document.write(`
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
                                <td style="font-family: monospace;">${Se.participant.nis_nip||"-"}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">Status Kepegawaian</td>
                                <td>:</td>
                                <td>${Se.participant.status||"-"}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">WorkCode</td>
                                <td>:</td>
                                <td>${r.nama_workcode}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">Periode Bulan</td>
                                <td>:</td>
                                <td>${ee}</td>
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
                                <td style="width: 25%; color: #b91c1c;">${Re} Hari</td>
                                <td style="width: 25%; color: #b45309;">${We} Hari</td>
                                <td style="width: 25%; color: #1d4ed8;">${Ke} Hari</td>
                                <td style="width: 25%; color: #475569;">${Je} Hari</td>
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
                            ${Fe||'<tr><td colspan="5" style="text-align:center; padding: 10px;">Belum ada data kehadiran</td></tr>'}
                        </tbody>
                    </table>

                    <div class="ttd-section">
                        <div class="ttd-box">
                            <p>Babat, ${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</p>
                            <p style="margin-bottom: 5px;">Kepala Sekolah,</p>
                            <div class="ttd-qr-wrap" style="display: flex; justify-content: center; margin: 10px 0;">
                                <img src="${window.location.origin}/workcodes/${r.id}/qr-signature" style="width: 80px; height: 80px;" alt="QR TTD" />
                            </div>
                            <p style="font-weight: bold; text-decoration: underline; font-size: 13px;">${oe}</p>
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
            `),Me.document.close()}catch(d){console.error("Gagal mengambil data rekap:",d),M.error("Terjadi kesalahan saat memuat rekap individu.")}},C=t=>{const n="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase leading-4 text-white";switch(t){case"hadir":return e.jsx("span",{className:`${n} bg-gradient-to-b from-emerald-400 to-emerald-600`,children:"Hadir"});case"alpha":return e.jsx("span",{className:`${n} bg-gradient-to-b from-rose-400 to-rose-600`,children:"Alpha"});case"izin":return e.jsx("span",{className:`${n} bg-gradient-to-b from-amber-400 to-orange-500`,children:"Izin"});case"sakit":return e.jsx("span",{className:`${n} bg-gradient-to-b from-sky-400 to-sky-600`,children:"Sakit"});case"lupa_absen":return e.jsx("span",{className:`${n} bg-gradient-to-b from-neutral-400 to-neutral-600`,children:"Lupa absen"});default:return e.jsx("span",{className:"text-xs text-neutral-400",children:"-"})}},L=r?.kategori==="harian",T="inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900",_e=t=>{const n=A.find(d=>d.id===t.participant_id)||{id:t.participant_id,nama:t.nama,nis_nip:t.nis_nip,status:t.status_pegawai};H(n),Z(!0)};return e.jsxs(qe,{children:[e.jsx(Ue,{title:"Laporan Kehadiran"}),e.jsxs("div",{className:"flex w-full flex-1 flex-col px-4 py-2 sm:px-6 xl:min-h-0 xl:overflow-hidden",children:[e.jsxs("div",{className:"mb-4 shrink-0 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between","data-aos":"fade-up",children:[e.jsxs("div",{className:"min-w-0",children:[e.jsx("h3",{className:"text-xl font-bold text-neutral-800",children:"Laporan Kehadiran"}),e.jsx("p",{className:"mt-0.5 text-sm text-neutral-500",children:v.length>1?`${v.length} workcode aktif bersamaan: ${v.map(t=>t.nama_workcode).join(" · ")}`:"Rekap kehadiran per workcode, lengkap dengan bukti presensi."})]}),e.jsxs("div",{className:"flex flex-col gap-2 sm:flex-row sm:items-center",children:[e.jsx("label",{htmlFor:"workcode-filter",className:"sr-only",children:"Pilih workcode laporan"}),e.jsxs("select",{id:"workcode-filter",value:h||"",onChange:t=>Ne(t.target.value),className:"input-soft min-w-0 sm:w-72",children:[p.length===0&&e.jsx("option",{value:"",children:"Belum ada workcode"}),p.map(t=>e.jsxs("option",{value:t.id,children:[t.is_active?"● ":"",t.nama_workcode," (",t.attendances_count," hadir)"]},t.id))]}),h&&e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("a",{href:route("workcodes.export",h),className:"btn-soft flex-1 sm:flex-none",title:"Ekspor Excel (.xlsx)",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:1.75,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"})}),"Ekspor Excel"]}),e.jsxs("button",{type:"button",onClick:c,className:"btn-brand flex-1 sm:flex-none",title:"Cetak bukti hadir",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:1.75,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"})}),"Cetak"]})]})]})]}),e.jsxs("section",{className:"grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",children:[e.jsx(be,{delay:0,label:"Total Peserta",value:y.total,icon:G.users,children:e.jsx("span",{className:"truncate",children:r?.nama_workcode||"belum ada workcode"})}),e.jsxs(be,{delay:50,label:"Hadir",value:y.hadir,icon:G.check,children:[e.jsxs("span",{className:"font-bold text-emerald-600",children:[a,"%"]})," dari total peserta"]}),e.jsxs(be,{delay:100,label:"Belum Hadir",value:y.belum,icon:G.clock,children:[e.jsxs("span",{className:"font-bold text-rose-500",children:[y.total>0?100-a:0,"%"]})," belum tercatat"]}),e.jsx(be,{delay:150,label:"Persentase Kehadiran",value:`${a}%`,icon:G.chart,children:e.jsx("span",{className:"mt-1.5 block h-1 overflow-hidden rounded-full bg-neutral-200",children:e.jsx("span",{className:"block h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000 ease-out",style:{width:`${a}%`}})})})]}),e.jsxs("section",{className:"card-soft mt-4 flex min-h-0 flex-1 flex-col overflow-hidden","data-aos":"fade-up","data-aos-delay":"100",children:[e.jsxs("div",{className:"flex flex-col gap-3 p-4 pb-3 lg:flex-row lg:items-center lg:justify-between",children:[e.jsxs("div",{children:[e.jsx("h6",{className:"text-base font-semibold text-neutral-800",children:L?"Rekap Presensi Harian":"Daftar Kehadiran"}),e.jsxs("p",{className:"mt-0.5 flex items-center gap-1 text-sm text-neutral-500",children:[e.jsx("span",{className:"h-4 w-4 text-emerald-500",children:G.check}),e.jsx("span",{className:"font-bold text-neutral-700",children:R.length})," baris ditampilkan"]})]}),e.jsxs("div",{className:"flex flex-col gap-2 sm:flex-row",children:[e.jsxs("div",{className:"relative sm:w-72",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:2,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"})}),e.jsx("input",{type:"search",placeholder:"Cari nama atau NIP…",value:te,onChange:t=>q(t.target.value),className:"input-soft pl-9"})]}),e.jsxs("select",{value:P,onChange:t=>N(t.target.value),className:"input-soft sm:w-48","aria-label":"Filter status pegawai",children:[e.jsx("option",{value:"",children:"Semua status pegawai"}),F.map((t,n)=>e.jsx("option",{value:t,children:t},n))]})]})]}),e.jsx("ul",{className:"divide-y divide-neutral-100 border-t border-neutral-200 sm:hidden",children:R.length===0?e.jsx("li",{className:"px-4 py-10 text-center text-sm text-neutral-400",children:"Belum ada data kehadiran."}):ke.map((t,n)=>e.jsxs("li",{className:"space-y-3 px-4 py-3",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(Ae,{name:t.nama}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("p",{className:"truncate text-sm font-semibold text-neutral-800",children:t.nama}),e.jsxs("p",{className:"truncate text-xs text-neutral-500",children:[t.nis_nip||"-"," · ",t.status_pegawai||"-"]})]})]}),L?e.jsxs("div",{className:"grid grid-cols-4 gap-2 text-center",children:[e.jsx(je,{label:"Alpha",value:t.total_alpha||0,tone:"text-rose-600"}),e.jsx(je,{label:"Izin",value:t.total_izin||0,tone:"text-amber-600"}),e.jsx(je,{label:"Sakit",value:t.total_sakit||0,tone:"text-sky-600"}),e.jsx(je,{label:"Telat",value:t.total_menit_terlambat?`${t.total_menit_terlambat}m`:0,tone:"text-orange-600"})]}):e.jsxs("div",{className:"flex items-center justify-between gap-3",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-xs font-bold tabular-nums text-neutral-800",children:t.status!=="libur"?t.waktu_hadir:"-"}),C(t.status)]}),e.jsx(Te,{attendance:t,onOpen:()=>_(t)})]}),e.jsx("div",{className:"flex flex-wrap gap-1",children:L?e.jsxs("button",{type:"button",onClick:()=>w(t),className:T,children:[e.jsx(Be,{}),"Detail"]}):e.jsx("button",{type:"button",onClick:()=>o(t,t.nama),className:T,children:"Edit presensi"})})]},t.id||t.participant_id||n))}),e.jsx("div",{className:"hidden min-h-0 flex-1 overflow-auto sm:block sm:max-h-[474px] xl:max-h-none",children:e.jsxs("table",{className:"w-full min-w-full text-left",children:[e.jsx("thead",{className:"sticky top-0 z-10 bg-white",children:e.jsxs("tr",{className:"border-y border-neutral-200 text-xs font-semibold uppercase text-neutral-500 [&>th]:opacity-70",children:[e.jsx("th",{className:"w-12 px-4 py-3 text-center",children:"No"}),e.jsx("th",{className:"px-4 py-3",children:"Peserta"}),e.jsx("th",{className:"px-4 py-3",children:"Status Pegawai"}),L?e.jsxs(e.Fragment,{children:[e.jsx("th",{className:"px-2 py-3 text-center",children:"Alpha"}),e.jsx("th",{className:"px-2 py-3 text-center",children:"Izin"}),e.jsx("th",{className:"px-2 py-3 text-center",children:"Sakit"}),e.jsx("th",{className:"px-2 py-3 text-center",children:"Lupa Absen"}),e.jsx("th",{className:"px-2 py-3 text-center",children:"Terlambat"}),e.jsx("th",{className:"px-4 py-3 text-right",children:"Aksi"})]}):e.jsxs(e.Fragment,{children:[e.jsx("th",{className:"px-4 py-3",children:"Waktu Hadir"}),e.jsx("th",{className:"px-3 py-3 text-center",children:"Status"}),e.jsx("th",{className:"px-3 py-3 text-center",children:"Metode & Bukti"}),e.jsx("th",{className:"px-4 py-3 text-right",children:"Aksi"})]})]})}),e.jsx("tbody",{children:R.length===0?e.jsx("tr",{children:e.jsxs("td",{colSpan:L?9:7,className:"px-4 py-16 text-center",children:[e.jsx("p",{className:"text-sm font-medium text-neutral-600",children:"Belum ada peserta yang hadir"}),e.jsx("p",{className:"mt-0.5 text-xs text-neutral-400",children:"Data kehadiran pada workcode ini masih kosong."})]})}):R.map((t,n)=>e.jsxs("tr",{className:"border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50",children:[e.jsx("td",{className:"px-4 py-2.5 text-center text-xs font-medium tabular-nums text-neutral-500",children:n+1}),e.jsx("td",{className:"px-4 py-2.5",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(Ae,{name:t.nama}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("p",{className:"text-sm font-semibold leading-snug text-neutral-800",children:t.nama}),e.jsx("p",{className:"text-xs text-neutral-500",children:t.nis_nip||"-"})]})]})}),e.jsx("td",{className:"px-4 py-2.5 text-xs font-medium text-neutral-600",children:t.status_pegawai||"-"}),L?e.jsxs(e.Fragment,{children:[e.jsx("td",{className:"px-2 py-2.5 text-center text-xs font-bold tabular-nums text-rose-600",children:t.total_alpha||0}),e.jsx("td",{className:"px-2 py-2.5 text-center text-xs font-bold tabular-nums text-amber-600",children:t.total_izin||0}),e.jsx("td",{className:"px-2 py-2.5 text-center text-xs font-bold tabular-nums text-sky-600",children:t.total_sakit||0}),e.jsx("td",{className:"px-2 py-2.5 text-center text-xs font-bold tabular-nums text-neutral-600",children:t.total_lupa_absen||0}),e.jsxs("td",{className:"px-2 py-2.5 text-center text-xs font-bold tabular-nums text-orange-600",children:[t.total_menit_terlambat||0," mnt"]}),e.jsx("td",{className:"px-4 py-2.5",children:e.jsx("div",{className:"flex items-center justify-end",children:e.jsxs("button",{type:"button",onClick:()=>w(t),className:T,title:"Kalender, log foto wajah & cetak rekap",children:[e.jsx(Be,{}),"Detail"]})})})]}):e.jsxs(e.Fragment,{children:[e.jsx("td",{className:"px-4 py-2.5 text-xs font-bold tabular-nums text-neutral-800",children:t.status==="libur"?"-":t.waktu_hadir}),e.jsx("td",{className:"px-3 py-2.5 text-center",children:C(t.status)}),e.jsx("td",{className:"px-3 py-2 text-center",children:e.jsxs("div",{className:"flex flex-col items-center gap-1",children:[e.jsx("span",{className:"text-[11px] font-bold uppercase text-neutral-600",children:t.attendance_method||"—"}),e.jsx(Te,{attendance:t,onOpen:()=>_(t)})]})}),e.jsx("td",{className:"px-4 py-2.5",children:e.jsxs("div",{className:"flex items-center justify-end gap-1",children:[e.jsx("button",{type:"button",onClick:()=>o(t,t.nama),className:T,title:"Edit presensi",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:1.75,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"})})}),e.jsx("button",{type:"button",onClick:()=>X(t.id,t.nama,t.waktu_hadir),className:`${T} hover:!bg-rose-50 hover:!text-rose-600`,title:"Hapus presensi",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:1.75,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"})})})]})})]})]},t.id||t.participant_id||n))})]})})]})]}),e.jsx(ie,{show:!!f,onClose:()=>_(null),maxWidth:"lg",children:f&&e.jsxs("div",{className:"p-5 sm:p-6",children:[e.jsxs("div",{className:"flex items-start justify-between gap-4 border-b border-slate-100 pb-4",children:[e.jsxs("div",{className:"flex min-w-0 items-center gap-3",children:[e.jsx("div",{className:"flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 12.75 11.25 15 15 9.75M12 3C7.03 3 3 5.015 3 7.5c0 1.381 1.244 2.617 3.2 3.442L5.25 15l4.307-2.154C10.337 12.946 11.156 13 12 13c4.97 0 9-2.015 9-4.5S16.97 3 12 3Z"})})}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("h3",{className:"truncate text-base font-bold text-slate-800",children:"Detail Presensi"}),e.jsx("p",{className:"truncate text-xs font-medium text-slate-500",children:r?.nama_workcode||"Workcode"})]})]}),e.jsx("button",{type:"button",onClick:()=>_(null),className:"rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600","aria-label":"Tutup detail presensi",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18 18 6M6 6l12 12"})})})]}),e.jsxs("div",{className:"mt-5 rounded-lg border border-neutral-200 bg-neutral-100 p-4 text-center",children:[e.jsx("p",{className:"text-[10px] font-bold uppercase tracking-wider text-neutral-800",children:f.face_capture_url?"Foto Presensi Wajah":"Tanda Tangan Digital"}),e.jsx("img",{src:f.face_capture_url||f.signature_url,alt:`${f.face_capture_url?"Foto presensi wajah":"Tanda tangan"} ${f.nama}`,className:`mx-auto mt-2 h-32 w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-inner ${f.face_capture_url?"object-cover":"object-contain p-2"}`})]}),e.jsxs("div",{className:"mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2",children:[e.jsxs("div",{className:"rounded-lg border border-neutral-200 bg-white p-3 sm:col-span-2 shadow-soft",children:[e.jsx("p",{className:"text-[10px] font-bold uppercase tracking-wider text-slate-400",children:"Peserta"}),e.jsx("p",{className:"mt-1 text-sm font-bold text-slate-800",children:f.nama}),e.jsxs("p",{className:"text-xs font-medium text-slate-500",children:[f.nis_nip||"Tanpa NIP"," · ",f.status_pegawai||"-"]})]}),e.jsxs("div",{className:"rounded-lg border border-slate-200 bg-slate-50 p-3",children:[e.jsx("p",{className:"text-[10px] font-bold uppercase tracking-wider text-slate-400",children:"Tanggal Presensi"}),e.jsx("p",{className:"mt-1 text-xs font-bold text-slate-800",children:b(f.tanggal)})]}),e.jsxs("div",{className:"rounded-lg border border-slate-200 bg-slate-50 p-3",children:[e.jsx("p",{className:"text-[10px] font-bold uppercase tracking-wider text-slate-400",children:"Waktu Hadir"}),e.jsx("p",{className:"mt-1 font-mono text-xs font-bold text-slate-800",children:f.waktu_hadir!=="-"?`${f.waktu_hadir} WIB`:"-"})]}),e.jsxs("div",{className:"rounded-lg border border-slate-200 bg-slate-50 p-3",children:[e.jsx("p",{className:"text-[10px] font-bold uppercase tracking-wider text-slate-400",children:"Waktu Pulang"}),e.jsx("p",{className:"mt-1 font-mono text-xs font-bold text-slate-800",children:f.waktu_pulang!=="-"?`${f.waktu_pulang} WIB`:"-"})]}),e.jsxs("div",{className:"rounded-lg border border-slate-200 bg-slate-50 p-3",children:[e.jsx("p",{className:"text-[10px] font-bold uppercase tracking-wider text-slate-400",children:"Status Kehadiran"}),e.jsx("div",{className:"mt-1",children:C(f.status)})]}),e.jsxs("div",{className:"rounded-lg border border-slate-200 bg-slate-50 p-3",children:[e.jsx("p",{className:"text-[10px] font-bold uppercase tracking-wider text-slate-400",children:"Metode Presensi"}),e.jsx("p",{className:"mt-1 text-xs font-bold text-slate-800",children:f.attendance_method||"-"})]})]}),r?.latitude&&r?.longitude&&e.jsxs("div",{className:"mt-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3",children:[e.jsx("p",{className:"text-[10px] font-bold uppercase tracking-wider text-emerald-700",children:"Lokasi Workcode"}),e.jsxs("p",{className:"mt-1 text-xs font-semibold text-emerald-950",children:["Radius presensi ",r.radius_meters||100," meter"]}),e.jsxs("p",{className:"mt-0.5 font-mono text-[10px] text-emerald-700",children:[Number(r.latitude).toFixed(6),", ",Number(r.longitude).toFixed(6)]})]}),e.jsx("div",{className:"mt-5 flex justify-end border-t border-slate-100 pt-4",children:e.jsx(we,{onClick:()=>_(null),children:"Tutup"})})]})}),e.jsx(ie,{show:!!k,onClose:()=>w(null),maxWidth:"md",children:k&&e.jsxs("div",{className:"p-5 sm:p-6",children:[e.jsxs("div",{className:"flex items-start justify-between gap-4 border-b border-slate-100 pb-4",children:[e.jsxs("div",{className:"flex min-w-0 items-center gap-3",children:[e.jsx(Ae,{name:k.nama}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("h3",{className:"truncate text-base font-bold text-slate-800",children:k.nama}),e.jsxs("p",{className:"truncate text-xs font-medium text-slate-500",children:[k.nis_nip||"Tanpa NIP"," · ",k.status_pegawai||"-"]})]})]}),e.jsx("button",{type:"button",onClick:()=>w(null),className:"rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600","aria-label":"Tutup detail peserta",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18 18 6M6 6l12 12"})})})]}),e.jsxs("div",{className:"mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3",children:[e.jsx(Pe,{icon:e.jsx("span",{className:"h-5 w-5",children:G.calendar}),label:"Kalender",desc:"Kalender 1 bulan & kelola presensi",onClick:()=>{const t=k;w(null),_e(t)}}),e.jsx(Pe,{icon:e.jsx("span",{className:"h-5 w-5",children:G.document}),label:"Log",desc:"Riwayat presensi & foto wajah hasil scan",onClick:()=>{const t=k;w(null),B(t.participant_id,t.nama,t.nis_nip,t.status_pegawai)}}),e.jsx(Pe,{icon:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:1.75,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"})}),label:"Cetak",desc:"Cetak rekap individu",onClick:()=>{const t=k;w(null),W(t.participant_id,t.nama)}})]})]})}),e.jsx(ie,{show:Q,onClose:()=>x(!1),maxWidth:"md",children:e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-slate-100 pb-4",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"})})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-base font-bold text-slate-800",children:"Edit Log Presensi"}),e.jsx("p",{className:"text-xs text-slate-500 font-medium",children:xe})]})]}),e.jsx("button",{type:"button",onClick:()=>x(!1),className:"rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]}),e.jsxs("form",{onSubmit:ne,className:"mt-5 space-y-4",children:[e.jsxs("div",{children:[e.jsx(fe,{htmlFor:"edit_tanggal",value:"Tanggal Presensi",className:"text-xs font-bold text-slate-700"}),e.jsx(Ce,{id:"edit_tanggal",type:"date",value:j.data.tanggal,onChange:t=>j.setData("tanggal",t.target.value),className:"mt-1 w-full text-xs font-medium",required:!0}),e.jsx(Y,{message:j.errors.tanggal,className:"mt-1 text-xs"})]}),e.jsxs("div",{children:[e.jsx(fe,{htmlFor:"edit_status",value:"Status Kehadiran",className:"text-xs font-bold text-slate-700"}),e.jsxs("select",{id:"edit_status",value:j.data.status,onChange:t=>j.setData("status",t.target.value),className:"mt-1 w-full rounded-md border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20",required:!0,children:[e.jsx("option",{value:"hadir",children:"Hadir"}),e.jsx("option",{value:"izin",children:"Izin"}),e.jsx("option",{value:"sakit",children:"Sakit"}),e.jsx("option",{value:"lupa_absen",children:"Lupa Absen"}),e.jsx("option",{value:"alpha",children:"Alpha"})]}),e.jsx(Y,{message:j.errors.status,className:"mt-1 text-xs"})]}),j.data.status!=="alpha"&&e.jsxs("div",{className:`grid grid-cols-1 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 ${s?"":"sm:grid-cols-2"}`,children:[e.jsxs("div",{children:[e.jsx(fe,{htmlFor:"edit_jam_masuk",value:s?"Jam Absen":"Jam Datang",className:"text-xs font-bold text-slate-600"}),e.jsx(Ce,{id:"edit_jam_masuk",type:"time",value:j.data.jam_masuk,onChange:t=>j.setData("jam_masuk",t.target.value),className:"mt-1 w-full text-xs"}),e.jsx(Y,{message:j.errors.jam_masuk,className:"mt-1 text-xs"})]}),!s&&e.jsxs("div",{children:[e.jsx(fe,{htmlFor:"edit_jam_pulang",value:"Jam Pulang",className:"text-xs font-bold text-slate-600"}),e.jsx(Ce,{id:"edit_jam_pulang",type:"time",value:j.data.jam_pulang,onChange:t=>j.setData("jam_pulang",t.target.value),className:"mt-1 w-full text-xs"}),e.jsx(Y,{message:j.errors.jam_pulang,className:"mt-1 text-xs"})]})]}),e.jsxs("div",{className:"mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4",children:[e.jsx(we,{type:"button",onClick:()=>x(!1),children:"Batal"}),e.jsx(Xe,{type:"submit",disabled:j.processing,className:"bg-neutral-600 hover:bg-neutral-700",children:j.processing?"Menyimpan...":"Perbarui Presensi"})]})]})]})}),e.jsx(ie,{show:D,onClose:()=>{$(!1),I(null)},maxWidth:"3xl",children:e.jsxs("div",{className:"relative p-6",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-slate-100 pb-4",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"})})}),e.jsxs("div",{children:[e.jsxs("h3",{className:"text-base font-bold text-slate-800",children:["Log Presensi: ",m?.nama]}),e.jsxs("p",{className:"text-xs text-slate-500 font-medium",children:["NIP: ",e.jsx("span",{className:"font-mono",children:m?.nis_nip||"-"})," • ",m?.status_pegawai||"-"]})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("button",{type:"button",onClick:()=>{H(m),Z(!0),$(!1)},className:"inline-flex items-center gap-1 rounded-md bg-brand-gradient hover:bg-brand-gradient px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3.5 w-3.5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"})}),"Buka Kalender"]}),e.jsx("button",{type:"button",onClick:()=>$(!1),className:"rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]})]}),e.jsx("div",{className:"mt-4",children:me?e.jsx("div",{className:"py-12 text-center text-slate-500 text-xs font-semibold",children:"Memuat data riwayat presensi..."}):m?.attendances?.length===0?e.jsxs("div",{className:"py-12 text-center text-slate-500",children:[e.jsx("p",{className:"text-xs font-semibold",children:"Belum ada riwayat rekaman presensi untuk peserta ini."}),e.jsx("button",{type:"button",onClick:()=>{H(m),Z(!0),$(!1)},className:"mt-3 inline-flex items-center gap-1 text-xs font-bold text-neutral-800 hover:underline",children:"📅 Buka kalender presensi sekarang"})]}):e.jsx("div",{className:"overflow-x-auto max-h-[350px] overflow-y-auto rounded-lg border border-slate-200",children:e.jsxs("table",{className:"min-w-full divide-y divide-slate-200 text-xs",children:[e.jsx("thead",{className:"bg-slate-50 sticky top-0 z-10",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-4 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wider",children:"No"}),e.jsx("th",{className:"px-4 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wider",children:"Tanggal"}),e.jsx("th",{className:"px-4 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wider",children:"Jam Datang"}),e.jsx("th",{className:"px-4 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wider",children:"Jam Pulang"}),e.jsx("th",{className:"px-4 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wider",children:"Status"}),e.jsx("th",{className:"px-4 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wider",children:"Foto Wajah"}),e.jsx("th",{className:"px-4 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wider",children:"Aksi"})]})}),e.jsx("tbody",{className:"divide-y divide-slate-100 bg-white",children:m?.attendances?.map((t,n)=>e.jsxs("tr",{className:"hover:bg-slate-50/60 transition-colors",children:[e.jsx("td",{className:"px-4 py-2.5 text-slate-500 font-semibold",children:n+1}),e.jsx("td",{className:"px-4 py-2.5 font-bold text-slate-800",children:t.tanggal_formatted||t.tanggal||"-"}),e.jsx("td",{className:"px-4 py-2.5 text-center font-mono font-medium text-slate-700",children:t.status==="libur"?"-":t.jam_masuk?`${t.jam_masuk} WIB`:t.waktu_hadir!=="-"?t.waktu_hadir:"-"}),e.jsx("td",{className:"px-4 py-2.5 text-center font-mono font-medium text-slate-700",children:t.status==="libur"?"-":t.jam_pulang?`${t.jam_pulang} WIB`:t.waktu_pulang!=="-"?t.waktu_pulang:"-"}),e.jsx("td",{className:"px-4 py-2.5 text-center",children:C(t.status)}),e.jsx("td",{className:"px-4 py-2",children:t.face_capture_url||t.face_capture_pulang_url?e.jsx("div",{className:"flex items-center justify-center gap-1.5",children:[{url:t.face_capture_url,label:"Datang",time:t.jam_masuk},{url:t.face_capture_pulang_url,label:"Pulang",time:t.jam_pulang}].map(d=>e.jsx(at,{url:d.url,label:d.label,expired:t.media_expired,onOpen:()=>I({...d,tanggal:t.tanggal_formatted||t.tanggal})},d.label))}):e.jsx("p",{className:"text-center text-slate-400",children:"-"})}),e.jsx("td",{className:"px-4 py-2.5 text-center",children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[e.jsx("button",{type:"button",onClick:()=>o(t,m.nama),className:"p-1 rounded-lg text-neutral-800 hover:bg-neutral-100 transition-colors",title:"Edit Log Presensi Ini",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"})})}),e.jsx("button",{type:"button",onClick:()=>X(t.id,m.nama,t.tanggal_formatted||t.tanggal),className:"p-1 rounded-lg text-red-600 hover:bg-red-50 transition-colors",title:"Hapus Log Presensi Ini (Reset Status)",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"})})})]})})]},t.id||n))})]})})}),e.jsx("div",{className:"mt-5 flex justify-end border-t border-slate-100 pt-3",children:e.jsx(we,{onClick:()=>{$(!1),I(null)},children:"Tutup"})}),S&&e.jsx("div",{className:"absolute inset-0 z-20 flex items-center justify-center bg-slate-900/70 p-4",onClick:()=>I(null),children:e.jsxs("div",{className:"w-full max-w-sm rounded-xl bg-white p-4 shadow-soft-lg",onClick:t=>t.stopPropagation(),children:[e.jsxs("div",{className:"flex items-start justify-between gap-3",children:[e.jsxs("div",{className:"min-w-0",children:[e.jsxs("p",{className:"text-[10px] font-bold uppercase tracking-wider text-slate-400",children:["Foto Wajah ",S.label]}),e.jsx("p",{className:"truncate text-sm font-bold text-slate-800",children:m?.nama}),e.jsxs("p",{className:"text-xs font-medium text-slate-500",children:[S.tanggal||"-",S.time?` · ${S.time} WIB`:""]})]}),e.jsx("button",{type:"button",onClick:()=>I(null),className:"rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600","aria-label":"Tutup pratinjau foto",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18 18 6M6 6l12 12"})})})]}),e.jsx("img",{src:S.url,alt:`Foto wajah ${S.label.toLowerCase()} ${m?.nama||""}`,className:"mt-3 aspect-[3/4] w-full rounded-lg border border-slate-200 bg-slate-100 object-cover"})]})})]})}),e.jsx(tt,{show:de,onClose:()=>{Z(!1),H(null),ge.reload({only:["stats","attendances"],preserveScroll:!0,preserveState:!0})},workcode:r,participants:A,initialParticipant:ce,onAttendanceChanged:()=>{ge.reload({only:["stats","attendances"],preserveScroll:!0,preserveState:!0})}})]})}function Ae({name:p}){return e.jsx("span",{className:"flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-gradient text-xs font-semibold text-white",children:(p||"P").charAt(0).toUpperCase()})}function je({label:p,value:v,tone:h}){return e.jsxs("div",{className:"rounded-md border border-neutral-200 px-1 py-1.5",children:[e.jsx("p",{className:"text-[10px] font-medium uppercase text-neutral-500",children:p}),e.jsx("p",{className:`text-sm font-bold tabular-nums ${h}`,children:v})]})}function Be(){return e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:1.75,children:[e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"}),e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M15 12a3 3 0 11-6 0 3 3 0 016 0z"})]})}function Pe({icon:p,label:v,desc:h,onClick:r}){return e.jsxs("button",{type:"button",onClick:r,className:"flex items-center gap-3 rounded-lg border border-neutral-200 p-3 text-left transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 sm:flex-col sm:items-center sm:text-center",children:[e.jsx("span",{className:"flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800",children:p}),e.jsxs("span",{className:"min-w-0",children:[e.jsx("span",{className:"block text-sm font-bold text-neutral-800",children:v}),e.jsx("span",{className:"block text-[11px] leading-snug text-neutral-500",children:h})]})]})}function at({url:p,label:v,expired:h=!1,onOpen:r}){const[y,O]=l.useState(!1),{mediaRetentionDays:A=30}=$e().props;return!p||y?e.jsxs("span",{className:"flex h-12 w-10 flex-col items-center justify-center rounded-md border border-dashed border-slate-200 text-center text-[8px] font-semibold uppercase leading-3 text-slate-300",title:y?`File foto ${v.toLowerCase()} tidak ditemukan`:h?`Foto presensi hanya disimpan ${A} hari`:`Tidak ada foto ${v.toLowerCase()}`,children:[v,y&&e.jsx("span",{className:"normal-case text-rose-300",children:"hilang"}),!y&&h&&e.jsx("span",{className:"normal-case text-amber-400",children:"kedaluwarsa"})]}):e.jsxs("button",{type:"button",onClick:r,title:`Lihat foto wajah ${v.toLowerCase()}`,className:"group relative overflow-hidden rounded-md border border-slate-200 transition-shadow hover:shadow-soft-lg focus:outline-none focus:ring-2 focus:ring-brand-500",children:[e.jsx("img",{src:p,alt:"",loading:"lazy",onError:()=>O(!0),className:"h-12 w-10 bg-slate-100 object-cover"}),e.jsx("span",{className:"absolute inset-x-0 bottom-0 bg-slate-900/60 text-center text-[8px] font-bold uppercase leading-3 text-white",children:v})]})}function Te({attendance:p,onOpen:v}){const{mediaRetentionDays:h=30}=$e().props;return!p.signature_url&&!p.face_capture_url?p.media_expired?e.jsx("span",{className:"text-[10px] font-semibold text-amber-500",title:`Foto & tanda tangan presensi hanya disimpan ${h} hari`,children:"Bukti kedaluwarsa"}):null:e.jsx("button",{type:"button",onClick:v,title:"Lihat detail presensi dan bukti kehadiran",className:"inline-flex rounded-md border border-neutral-200 transition-shadow hover:shadow-soft-lg focus:outline-none focus:ring-2 focus:ring-brand-500",children:e.jsx("img",{src:p.face_capture_url||p.signature_url,alt:`Bukti presensi ${p.nama}`,loading:"lazy",decoding:"async",className:"h-9 w-24 rounded-md bg-white object-contain"})})}export{gt as default};
