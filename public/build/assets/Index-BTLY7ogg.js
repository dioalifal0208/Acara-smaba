import{d as ge,a as be,r as d,j as e,e as ae,b as we,u as je,H as ve,f as se}from"./app-4mXshCl9.js";import{A as ye}from"./AuthenticatedLayout-oJv0KU5K.js";import{M as pe}from"./Modal-N3lZyOw0.js";import{S as me}from"./SecondaryButton-BhQvT_0-.js";import{I as T}from"./InputError-DmVZaZ7E.js";import{P as ke}from"./PrimaryButton-CC27sSmm.js";import{I as ne}from"./InputLabel-DMO7yR56.js";import{T as ce}from"./TextInput-ID1E-CEo.js";import"./transition-BVUFXks3.js";const ue=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"],Ne=["Min","Sen","Sel","Rab","Kam","Jum","Sab"];function _e({show:k=!1,onClose:z=()=>{},workcode:o=null,participants:g=[],initialParticipant:E=null,onAttendanceChanged:K=()=>{}}){const{toast:j}=ge(),Q=be(),[c,N]=d.useState(null),[$,_]=d.useState(""),[re,S]=d.useState(!1),v=new Date,[h,y]=d.useState(v.getFullYear()),[p,b]=d.useState(v.getMonth()),[F,R]=d.useState([]),[ie,D]=d.useState(!1),[f,B]=d.useState(null),[r,L]=d.useState({id:null,workcode_id:o?.id||"",participant_id:"",tanggal:"",jam_masuk:"07:00",jam_pulang:"15:30",status:"hadir"}),[V,J]=d.useState(!1),[x,G]=d.useState({});d.useEffect(()=>{k&&(E?(N(E),_("")):g.length>0&&!c&&N(g[0]))},[k,E]);const O=async a=>{if(!(!o||!a)){D(!0);try{const s=await ae.get(`/report/individual/${o.id}/${a}`);R(s.data.attendances||[])}catch(s){console.error("Gagal mengambil data presensi:",s),j.error("Gagal memuat data presensi kalender.")}finally{D(!1)}}};d.useEffect(()=>{k&&c&&o&&O(c.id)},[k,c?.id,o?.id]);const W=d.useMemo(()=>{if(!$.trim())return g;const a=$.toLowerCase();return g.filter(s=>(s.nama||"").toLowerCase().includes(a)||s.nis_nip&&s.nis_nip.toLowerCase().includes(a))},[g,$]),Y=d.useMemo(()=>{const a={};return F.forEach(s=>{s.tanggal&&(a[s.tanggal]=s)}),a},[F]),Z=()=>{p===0?(b(11),y(a=>a-1)):b(a=>a-1)},U=()=>{p===11?(b(0),y(a=>a+1)):b(a=>a+1)},le=()=>{y(v.getFullYear()),b(v.getMonth())},X=d.useMemo(()=>{const a=new Date(h,p,1).getDay(),s=new Date(h,p+1,0).getDate(),n=new Date(h,p,0).getDate(),l=[];for(let m=a-1;m>=0;m--){const A=n-m,H=p===0?11:p-1,i=`${p===0?h-1:h}-${String(H+1).padStart(2,"0")}-${String(A).padStart(2,"0")}`;l.push({dayNumber:A,dateStr:i,isCurrentMonth:!1,isWeekend:!1})}for(let m=1;m<=s;m++){const A=new Date(h,p,m),H=`${h}-${String(p+1).padStart(2,"0")}-${String(m).padStart(2,"0")}`,M=A.getDay(),i=M===0||M===6,q=v.getFullYear()===h&&v.getMonth()===p&&v.getDate()===m;l.push({dayNumber:m,dateStr:H,isCurrentMonth:!0,isWeekend:i,isToday:q,dayOfWeek:M,attendance:Y[H]||null})}const u=l.length,w=(u<=35?35:42)-u;for(let m=1;m<=w;m++){const A=p===11?0:p+1,M=`${p===11?h+1:h}-${String(A+1).padStart(2,"0")}-${String(m).padStart(2,"0")}`;l.push({dayNumber:m,dateStr:M,isCurrentMonth:!1,isWeekend:!1})}return l},[h,p,Y]),I=d.useMemo(()=>{let a=0,s=0,n=0,l=0,u=0;const te=`${h}-${String(p+1).padStart(2,"0")}`;return F.forEach(w=>{w.tanggal&&w.tanggal.startsWith(te)&&(w.status==="hadir"?a++:w.status==="izin"?s++:w.status==="sakit"?n++:w.status==="alpha"?l++:w.status==="lupa_absen"&&u++)}),{hadir:a,izin:s,sakit:n,alpha:l,lupaAbsen:u}},[F,h,p]),oe=a=>{if(!a.isCurrentMonth)return;const n=new Date(a.dateStr).toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"}),l=a.attendance;L(l?{id:l.id,workcode_id:o.id,participant_id:c.id,tanggal:a.dateStr,jam_masuk:l.jam_masuk||"",jam_pulang:l.jam_pulang||"",status:l.status||"hadir"}:{id:null,workcode_id:o.id,participant_id:c.id,tanggal:a.dateStr,jam_masuk:"07:00",jam_pulang:"15:30",status:"hadir"}),G({}),B({dateStr:a.dateStr,dateFormatted:n,existingAttendance:l})},ee=async a=>{a.preventDefault(),J(!0),G({});try{if(r.id){const s=await ae.put(route("admin.attendances.update",r.id),r);j.success(s.data?.message||"Presensi berhasil diperbarui.")}else{const s=await ae.post(route("admin.attendances.store"),r);j.success(s.data?.message||"Presensi berhasil disimpan.")}B(null),await O(c.id),K()}catch(s){console.error("Gagal menyimpan presensi:",s),s.response?.data?.errors&&G(s.response.data.errors),j.error(s.response?.data?.message||"Gagal menyimpan data presensi.")}finally{J(!1)}},t=async()=>{if(!f?.existingAttendance)return;if(await Q({title:"Hapus Log Presensi",message:`Apakah Anda yakin ingin menghapus catatan presensi untuk ${c?.nama} pada tanggal ${f.dateFormatted}? Status hari tersebut akan direset.`,type:"danger",confirmText:"Ya, Hapus Data",cancelText:"Batal"}))try{const s=await ae.delete(route("admin.attendances.destroy",f.existingAttendance.id));j.success(s.data?.message||"Presensi berhasil dihapus."),B(null),await O(c.id),K()}catch(s){console.error("Gagal menghapus presensi:",s),j.error(s.response?.data?.message||"Gagal menghapus data presensi.")}};return e.jsxs(pe,{show:k,onClose:z,maxWidth:"5xl",children:[e.jsxs("div",{className:"p-5 sm:p-7 flex flex-col max-h-[92vh] overflow-y-auto",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-slate-100 pb-3",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"})})}),e.jsxs("div",{children:[e.jsxs("h3",{className:"text-base font-extrabold text-slate-800 flex items-center gap-2",children:["Kalender Presensi Peserta",o&&e.jsx("span",{className:"text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100",children:o.nama_workcode})]}),e.jsx("p",{className:"text-xs text-slate-500 font-medium",children:"Klik kotak tanggal pada kalender untuk menambah, mengedit, atau menghapus presensi."})]})]}),e.jsx("button",{type:"button",onClick:z,className:"rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]}),e.jsxs("div",{className:"mt-3.5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center flex-1",children:[e.jsxs("div",{className:"relative flex-1 sm:max-w-xs",children:[e.jsxs("div",{className:"relative",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"})}),e.jsx("input",{type:"text",placeholder:"Cari nama peserta / NIP...",value:$,onChange:a=>{_(a.target.value),S(!0)},onFocus:()=>S(!0),className:"w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-7 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium shadow-xs"}),$&&e.jsx("button",{type:"button",onClick:()=>_(""),className:"absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs",children:"✕"})]}),re&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"fixed inset-0 z-20",onClick:()=>S(!1)}),e.jsx("div",{className:"absolute left-0 right-0 top-full mt-1.5 z-30 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl py-1",children:W.length===0?e.jsx("div",{className:"px-4 py-3 text-xs text-slate-500 text-center font-medium",children:"Tidak ada peserta ditemukan."}):W.map(a=>e.jsxs("button",{type:"button",onClick:()=>{N(a),_(""),S(!1)},className:`w-full px-3.5 py-1.5 text-left text-xs flex items-center justify-between hover:bg-indigo-50/70 transition-colors ${c?.id===a.id?"bg-indigo-50 text-indigo-700 font-bold":"text-slate-700"}`,children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700",children:(a.nama||"").charAt(0).toUpperCase()}),e.jsxs("div",{children:[e.jsx("p",{className:"font-bold text-slate-800 leading-tight",children:a.nama}),e.jsxs("p",{className:"text-[9px] text-slate-500 font-mono",children:["NIP: ",a.nis_nip||"-"]})]})]}),e.jsx("span",{className:"text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold",children:a.status||"-"})]},a.id))})]})]}),c&&e.jsxs("div",{className:"flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200/90 shadow-xs shrink-0",children:[e.jsx("div",{className:"flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-extrabold text-white",children:(c.nama||"").charAt(0).toUpperCase()}),e.jsxs("div",{className:"leading-tight",children:[e.jsx("p",{className:"text-xs font-extrabold text-slate-800",children:c.nama}),e.jsxs("p",{className:"text-[10px] text-slate-500 font-medium",children:["NIP: ",e.jsx("span",{className:"font-mono",children:c.nis_nip||"-"})," • ",c.status||"-"]})]})]})]}),e.jsxs("div",{className:"flex items-center justify-between sm:justify-end gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200/90 shadow-xs shrink-0",children:[e.jsx("button",{type:"button",onClick:Z,className:"flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors",title:"Bulan Sebelumnya",children:"❮"}),e.jsxs("h4",{className:"text-xs font-extrabold text-slate-800 px-2 min-w-[130px] text-center",children:[ue[p]," ",h]}),e.jsx("button",{type:"button",onClick:U,className:"flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors",title:"Bulan Berikutnya",children:"❯"}),e.jsx("button",{type:"button",onClick:le,className:"ml-1 px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors",children:"Bulan Ini"})]})]}),e.jsxs("div",{className:"mt-3 bg-white rounded-2xl border border-slate-200 p-2.5 shadow-xs",children:[e.jsx("div",{className:"grid grid-cols-7 gap-1.5 mb-1.5 text-center",children:Ne.map((a,s)=>e.jsx("div",{className:`py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-lg ${s===0||s===6?"text-red-500 bg-red-50/60":"text-slate-500 bg-slate-50"}`,children:a},s))}),ie?e.jsxs("div",{className:"py-16 text-center text-xs font-semibold text-slate-500 flex flex-col items-center gap-2",children:[e.jsx("div",{className:"h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"}),"Memuat data kalender presensi..."]}):e.jsx("div",{className:"grid grid-cols-7 gap-1.5",children:X.map((a,s)=>{const n=a.attendance,l=a.isCurrentMonth;return e.jsxs("div",{onClick:()=>l&&oe(a),className:`group min-h-[58px] sm:min-h-[64px] rounded-xl p-1.5 flex flex-col justify-between transition-all select-none ${l?"border border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer "+(a.isToday?"bg-indigo-50/20 ring-2 ring-indigo-500/30":"bg-white hover:bg-slate-50/50"):"bg-slate-50/40 text-slate-300 border border-transparent cursor-not-allowed opacity-30"}`,children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:`text-xs font-bold leading-none ${l?a.isToday?"flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white font-black text-[10px]":a.isWeekend?"text-red-500":"text-slate-700":"text-slate-300"}`,children:a.dayNumber}),l&&!n&&e.jsx("span",{className:"text-[10px] text-slate-300 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold",children:"+"})]}),l&&n&&e.jsxs("div",{className:"mt-1 flex flex-col gap-0.5",children:[n.status==="hadir"&&e.jsxs("div",{className:"rounded-md bg-emerald-50 border border-emerald-200 px-1 py-0.5 text-center",children:[e.jsx("span",{className:"text-[9px] font-black text-emerald-700 block leading-tight",children:"✓ HADIR"}),(n.jam_masuk||n.jam_pulang)&&e.jsxs("span",{className:"text-[8px] font-medium text-emerald-600 block leading-tight font-mono",children:[n.jam_masuk||"–"," - ",n.jam_pulang||"–"]})]}),n.status==="alpha"&&e.jsx("div",{className:"rounded-md bg-red-50 border border-red-200 px-1 py-0.5 text-center",children:e.jsx("span",{className:"text-[9px] font-black text-red-700 block leading-tight",children:"✗ ALPHA"})}),n.status==="izin"&&e.jsx("div",{className:"rounded-md bg-amber-50 border border-amber-200 px-1 py-0.5 text-center",children:e.jsx("span",{className:"text-[9px] font-black text-amber-700 block leading-tight",children:"! IZIN"})}),n.status==="sakit"&&e.jsx("div",{className:"rounded-md bg-blue-50 border border-blue-200 px-1 py-0.5 text-center",children:e.jsx("span",{className:"text-[9px] font-black text-blue-700 block leading-tight",children:"+ SAKIT"})}),n.status==="lupa_absen"&&e.jsx("div",{className:"rounded-md bg-slate-100 border border-slate-300 px-1 py-0.5 text-center",children:e.jsx("span",{className:"text-[9px] font-black text-slate-700 block leading-tight",children:"? LUPA ABSEN"})})]}),l&&!n&&e.jsx("div",{className:"h-3 flex items-center justify-center",children:e.jsx("span",{className:"text-[9px] text-slate-300 font-medium group-hover:hidden",children:"-"})})]},s)})})]}),e.jsxs("div",{className:"mt-3.5 flex flex-wrap items-center justify-between gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200",children:[e.jsxs("div",{className:"flex flex-wrap items-center gap-3 sm:gap-5 text-xs",children:[e.jsxs("span",{className:"text-[11px] font-bold text-slate-500 uppercase tracking-wider",children:["Rekap ",ue[p],":"]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-emerald-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-emerald-500"})," Hadir: ",I.hadir]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-amber-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-amber-500"})," Izin: ",I.izin]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-blue-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-blue-500"})," Sakit: ",I.sakit]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-red-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-red-500"})," Alpha: ",I.alpha]}),e.jsxs("span",{className:"inline-flex items-center gap-1.5 font-bold text-slate-700",children:[e.jsx("span",{className:"h-2 w-2 rounded-full bg-slate-400"})," Lupa Absen: ",I.lupaAbsen]})]}),e.jsx(me,{onClick:z,className:"text-xs",children:"Tutup"})]})]}),f&&e.jsx("div",{className:"fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]",children:e.jsxs("div",{className:"relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150",onClick:a=>a.stopPropagation(),children:[e.jsxs("div",{className:"flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100/70 text-indigo-600 shadow-xs",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"})})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-sm font-black text-slate-800",children:f.existingAttendance?"Edit Data Presensi":"Input Presensi Manual"}),e.jsx("p",{className:"text-xs font-bold text-indigo-600",children:f.dateFormatted})]})]}),e.jsx("button",{type:"button",onClick:()=>B(null),className:"rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition-colors",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]}),e.jsxs("form",{onSubmit:ee,className:"p-6 space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80",children:[e.jsx("div",{className:"flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shrink-0",children:(c?.nama||"P").charAt(0).toUpperCase()}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("p",{className:"text-xs font-extrabold text-slate-800 truncate leading-tight",children:c?.nama}),e.jsxs("p",{className:"text-[10px] text-slate-500 font-mono leading-tight",children:["NIP: ",c?.nis_nip||"-"," • ",c?.status||"-"]})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-xs font-extrabold text-slate-700 mb-2",children:"Pilih Status Kehadiran:"}),e.jsx("div",{className:"grid grid-cols-3 gap-2",children:[{key:"hadir",label:"Hadir",icon:"✓",activeBg:"bg-emerald-600 text-white border-emerald-600 shadow-emerald-200 shadow-md"},{key:"izin",label:"Izin",icon:"!",activeBg:"bg-amber-500 text-white border-amber-500 shadow-amber-200 shadow-md"},{key:"sakit",label:"Sakit",icon:"+",activeBg:"bg-blue-600 text-white border-blue-600 shadow-blue-200 shadow-md"},{key:"lupa_absen",label:"Lupa Absen",icon:"?",activeBg:"bg-slate-700 text-white border-slate-700 shadow-slate-200 shadow-md"},{key:"alpha",label:"Alpha",icon:"✗",activeBg:"bg-red-600 text-white border-red-600 shadow-red-200 shadow-md"}].map(a=>{const s=r.status===a.key;return e.jsxs("button",{type:"button",onClick:()=>L({...r,status:a.key}),className:`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 select-none ${s?a.activeBg:"bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"}`,children:[e.jsx("span",{className:"font-mono text-xs",children:a.icon}),e.jsx("span",{children:a.label})]},a.key)})}),e.jsx(T,{message:x.status?.[0]||x.status,className:"mt-1 text-xs"})]}),r.status!=="alpha"&&e.jsxs("div",{className:"p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-[11px] font-extrabold text-slate-600 uppercase tracking-wider",children:"Jam Kehadiran"}),e.jsx("div",{className:"flex items-center gap-1.5 text-[10px]",children:e.jsx("button",{type:"button",onClick:()=>{L({...r,jam_masuk:"07:00",jam_pulang:"15:30"})},className:"px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 font-semibold transition-colors",children:"Preset Normal (07:00 - 15:30)"})})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{children:[e.jsx("label",{htmlFor:"modal_jam_masuk",className:"block text-[11px] font-bold text-slate-600 mb-1",children:"Jam Datang"}),e.jsx("input",{id:"modal_jam_masuk",type:"time",value:r.jam_masuk,onChange:a=>L({...r,jam_masuk:a.target.value}),className:"w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-mono font-bold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-xs"}),e.jsx(T,{message:x.jam_masuk?.[0]||x.jam_masuk,className:"mt-0.5 text-[10px]"})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"modal_jam_pulang",className:"block text-[11px] font-bold text-slate-600 mb-1",children:"Jam Pulang"}),e.jsx("input",{id:"modal_jam_pulang",type:"time",value:r.jam_pulang,onChange:a=>L({...r,jam_pulang:a.target.value}),className:"w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-mono font-bold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-xs"}),e.jsx(T,{message:x.jam_pulang?.[0]||x.jam_pulang,className:"mt-0.5 text-[10px]"})]})]})]}),e.jsxs("div",{className:"pt-3 border-t border-slate-100 flex items-center justify-between gap-3",children:[e.jsx("div",{children:f.existingAttendance&&e.jsxs("button",{type:"button",onClick:t,disabled:V,className:"inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 border border-red-200/80 rounded-xl transition-all active:scale-95 shadow-xs disabled:opacity-50",title:"Hapus presensi dan reset status pada tanggal ini",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3.5 w-3.5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"})}),"Hapus Presensi"]})}),e.jsxs("div",{className:"flex items-center gap-2 ml-auto",children:[e.jsx("button",{type:"button",onClick:()=>B(null),className:"px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors",children:"Batal"}),e.jsxs("button",{type:"submit",disabled:V,className:`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 ${f.existingAttendance?"bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-200":"bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-200"}`,children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3.5 w-3.5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2.5,d:"M5 13l4 4L19 7"})}),V?"Menyimpan...":f.existingAttendance?"Perbarui Presensi":"Simpan Presensi"]})]})]})]})]})})]})}function Be({workcodes:k=[],selectedWorkcodeId:z,selectedWorkcode:o,stats:g,attendances:E=[],participants:K=[],kepalaSekolahNama:j="Muhtarom, S.Pd., M.Si.",kepalaSekolahNip:Q="197205172006041015"}){const{flash:c}=we().props,{toast:N}=ge(),$=be(),[_,re]=d.useState(""),[S,v]=d.useState(""),[h,y]=d.useState(!1),[p,b]=d.useState(!1),[F,R]=d.useState(!1),[ie,D]=d.useState(null),[f,B]=d.useState(""),[r,L]=d.useState(null),[V,J]=d.useState(!1),x=je({id:null,tanggal:"",jam_masuk:"",jam_pulang:"",status:"hadir"});d.useEffect(()=>{c?.success?N.success(c.success):c?.error&&N.error(c.error)},[c]);const G=[...new Set(E.map(t=>t.status_pegawai).filter(Boolean))].sort(),O=t=>{se.get(route("report"),{workcode_id:t},{preserveState:!0,preserveScroll:!0})},W=E.filter(t=>{const a=(t.nama||"").toLowerCase().includes(_.toLowerCase())||(t.nis_nip||"").toLowerCase().includes(_.toLowerCase()),s=S===""||t.status_pegawai===S;return a&&s}),Y=g&&g.total>0?Math.round(g.hadir/g.total*100):0,Z=(t,a="")=>{B(a||t.nama||"Peserta"),x.setData({id:t.id,tanggal:t.tanggal||(t.waktu_hadir?t.waktu_hadir.split(" ")[0]:new Date().toISOString().split("T")[0]),jam_masuk:t.jam_masuk||"",jam_pulang:t.jam_pulang||"",status:t.status||"hadir"}),y(!0)},U=async(t,a,s,n)=>{if(o){J(!0);try{const u=await(await fetch(`/report/individual/${o.id}/${t}`)).json();L({id:t,nama:a||u.participant.nama,nis_nip:s||u.participant.nis_nip,status_pegawai:n||u.participant.status,attendances:u.attendances||[]}),b(!0)}catch(l){console.error("Gagal mengambil data riwayat:",l),N.error("Gagal memuat riwayat presensi.")}finally{J(!1)}}},le=t=>{t.preventDefault(),x.put(route("admin.attendances.update",x.data.id),{preserveScroll:!0,onSuccess:()=>{y(!1),x.reset(),p&&r&&U(r.id,r.nama,r.nis_nip,r.status_pegawai)}})},X=async(t,a,s)=>{await $({title:"Hapus Log Presensi",message:`Apakah Anda yakin ingin menghapus catatan presensi ${a?`untuk "${a}"`:""} ${s?`tanggal ${s}`:""}? Tindakan ini akan menghapus data kehadiran/alpha/izin hari tersebut.`,type:"danger",confirmText:"Ya, Hapus Data",cancelText:"Batal"})&&se.delete(route("admin.attendances.destroy",t),{preserveScroll:!0,onSuccess:()=>{p&&r&&U(r.id,r.nama,r.nis_nip,r.status_pegawai)}})},I=()=>{if(!o)return;const t=window.open("","_blank","width=800,height=900"),a=W.map((n,l)=>`
            <tr>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${l+1}</td>
                <td style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px;">${n.nama}</td>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 11px;">${n.nis_nip}</td>
                <td style="padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${n.status_pegawai||"-"}</td>
                ${o.kategori==="harian"?`
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${n.total_alpha||"0"}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${n.total_izin||"0"}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${n.total_sakit||"0"}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${n.total_lupa_absen||"0"}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${n.total_menit_terlambat?n.total_menit_terlambat+" Menit":"0 Menit"}</td>
                    `:`
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${n.waktu_hadir}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px;">${n.status?n.status.replace("_"," ").toUpperCase():"-"}</td>
                    `}
            </tr>
        `).join(""),s=o.kategori==="harian"?`
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
                <title>Rekap Presensi - ${o.nama_workcode}</title>
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
                            <td>${o.nama_workcode}</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold;">Kategori Presensi</td>
                            <td>:</td>
                            <td style="text-transform: capitalize;">${o.kategori==="harian"?"Presensi Harian":"Presensi Sekali / Event"}</td>
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
                            ${s}
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
                            <img src="${window.location.origin}/workcodes/${o.id}/qr-signature" style="width: 80px; height: 80px;" alt="QR TTD" />
                        </div>
                        <p style="font-weight: bold; text-decoration: underline; font-size: 13px;">${j}</p>
                        <p style="font-size: 11px; color: #475569; font-family: Arial, sans-serif;">NIP. ${Q}</p>
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        setTimeout(function() { window.focus(); window.print(); }, 600);
                    };
                <\/script>
            </body>
            </html>
        `),t.document.close()},oe=async(t,a)=>{if(o)try{const n=await(await fetch(`/report/individual/${o.id}/${t}`)).json(),l=window.open("","_blank","width=800,height=900"),u=(n.attendances||[]).slice().sort((i,q)=>{const de=i.tanggal||"",xe=q.tanggal||"";return de.localeCompare(xe)}),te=n.workcode&&n.workcode.jam_datang_selesai?n.workcode.jam_datang_selesai.slice(0,5):"07:00",w=u.map((i,q)=>{let de=i.tanggal_formatted||i.tanggal||"-",xe=i.jam_masuk||(i.waktu_hadir!=="-"?i.waktu_hadir:"-"),fe=i.jam_pulang||(i.waktu_pulang!=="-"?i.waktu_pulang:"-"),C=(i.status||"hadir").toUpperCase(),P="#0f172a";if(i.status==="hadir"||!i.status){const he=(i.jam_masuk||"").trim().slice(0,5);he&&he>te?(C="TERLAMBAT",P="#b91c1c"):(C="HADIR",P="#15803d")}else i.status==="terlambat"?(C="TERLAMBAT",P="#b91c1c"):i.status==="izin"?(C="IZIN",P="#b45309"):i.status==="sakit"?(C="SAKIT",P="#1d4ed8"):i.status==="alpha"?(C="ALPHA",P="#b91c1c"):i.status==="lupa_absen"&&(C="LUPA ABSEN",P="#475569");return`
                    <tr>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${q+1}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${de}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${xe}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${fe}</td>
                        <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px; color: ${P};">${C}</td>
                    </tr>
                `}).join(""),m=u.filter(i=>i.status==="alpha").length,A=u.filter(i=>i.status==="izin").length,H=u.filter(i=>i.status==="sakit").length,M=u.filter(i=>i.status==="lupa_absen").length;l.document.write(`
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
                                <td style="font-family: monospace;">${n.participant.nis_nip||"-"}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">Status Kepegawaian</td>
                                <td>:</td>
                                <td>${n.participant.status||"-"}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold;">WorkCode</td>
                                <td>:</td>
                                <td>${o.nama_workcode}</td>
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
                                <td style="width: 25%; color: #b91c1c;">${m} Hari</td>
                                <td style="width: 25%; color: #b45309;">${A} Hari</td>
                                <td style="width: 25%; color: #1d4ed8;">${H} Hari</td>
                                <td style="width: 25%; color: #475569;">${M} Hari</td>
                            </tr>
                        </tbody>
                    </table>

                    <table class="data-table">
                        <thead>
                            <tr>
                                <th style="width: 35px;">No</th>
                                <th>Tanggal</th>
                                <th>Jam Datang</th>
                                <th>Jam Pulang</th>
                                <th style="width: 100px;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${w||'<tr><td colspan="5" style="text-align:center; padding: 10px;">Belum ada data kehadiran</td></tr>'}
                        </tbody>
                    </table>

                    <div class="ttd-section">
                        <div class="ttd-box">
                            <p>Babat, ${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</p>
                            <p style="margin-bottom: 5px;">Kepala Sekolah,</p>
                            <div class="ttd-qr-wrap" style="display: flex; justify-content: center; margin: 10px 0;">
                                <img src="${window.location.origin}/workcodes/${o.id}/qr-signature" style="width: 80px; height: 80px;" alt="QR TTD" />
                            </div>
                            <p style="font-weight: bold; text-decoration: underline; font-size: 13px;">${j}</p>
                            <p style="font-size: 11px; color: #475569; font-family: Arial, sans-serif;">NIP. ${Q}</p>
                        </div>
                    </div>

                    <script>
                        window.onload = function() {
                            setTimeout(function() { window.focus(); window.print(); }, 600);
                        };
                    <\/script>
                </body>
                </html>
            `),l.document.close()}catch(s){console.error("Gagal mengambil data rekap:",s),N.error("Terjadi kesalahan saat memuat rekap individu.")}},ee=t=>{switch(t){case"hadir":return e.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700",children:"✓ Hadir"});case"alpha":return e.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-bold text-red-700",children:"✗ Alpha"});case"izin":return e.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-700",children:"! Izin"});case"sakit":return e.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-bold text-blue-700",children:"+ Sakit"});case"lupa_absen":return e.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-300 px-2.5 py-0.5 text-xs font-bold text-slate-700",children:"? Lupa Absen"});default:return e.jsx("span",{className:"inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600",children:"-"})}};return e.jsxs(ye,{header:e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-4","data-aos":"fade-down",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-xl font-extrabold leading-tight text-slate-800",children:"Laporan Kehadiran"}),e.jsx("p",{className:"text-xs text-slate-500 font-medium mt-0.5",children:o?`Menampilkan laporan untuk: ${o.nama_workcode}`:"Pilih workcode untuk melihat data"})]}),e.jsxs("div",{className:"flex flex-wrap items-center gap-2.5",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("label",{htmlFor:"workcode-filter",className:"text-xs font-bold text-slate-600 shrink-0",children:"Workcode:"}),e.jsxs("select",{id:"workcode-filter",value:z||"",onChange:t=>O(t.target.value),className:"rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-indigo-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer min-w-[170px]",children:[k.length===0&&e.jsx("option",{value:"",children:"Belum Ada Workcode"}),k.map(t=>e.jsxs("option",{value:t.id,children:[t.is_active?"🟢 ":"",t.nama_workcode," (",t.attendances_count," hadir)"]},t.id))]})]}),z&&e.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[e.jsxs("a",{href:route("workcodes.export",z),className:"inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 shadow-sm transition-all active:scale-95",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4 text-emerald-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"})}),"Export Excel (.xlsx)"]}),e.jsxs("button",{type:"button",onClick:I,className:"inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-95",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"})}),"Cetak Bukti Hadir"]})]})]})]}),children:[e.jsx(ve,{title:"Laporan Kehadiran"}),e.jsx("div",{className:"py-4 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col overflow-hidden justify-between max-h-[580px]",children:e.jsxs("div",{className:"mx-auto max-w-7xl w-full flex-1 flex flex-col overflow-hidden space-y-3.5",children:[e.jsxs("div",{className:"grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 flex-none","data-aos":"fade-up",children:[e.jsx("div",{className:"overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm",children:e.jsxs("div",{className:"flex items-center gap-3.5",children:[e.jsx("div",{className:"rounded-xl bg-indigo-50 border border-indigo-100 p-2.5",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6 text-indigo-700",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"})})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] font-bold text-slate-400 uppercase tracking-wider",children:"Total Peserta"}),e.jsx("p",{className:"text-xl font-extrabold text-slate-800 mt-0.5",children:g.total})]})]})}),e.jsx("div",{className:"overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm",children:e.jsxs("div",{className:"flex items-center gap-3.5",children:[e.jsx("div",{className:"rounded-xl bg-emerald-50 border border-emerald-100 p-2.5",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6 text-emerald-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"})})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] font-bold text-slate-400 uppercase tracking-wider",children:"Hadir"}),e.jsx("p",{className:"text-xl font-extrabold text-emerald-600 mt-0.5",children:g.hadir})]})]})}),e.jsx("div",{className:"overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm",children:e.jsxs("div",{className:"flex items-center gap-3.5",children:[e.jsx("div",{className:"rounded-xl bg-amber-50 border border-amber-100 p-2.5",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6 text-amber-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"})})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] font-bold text-slate-400 uppercase tracking-wider",children:"Belum Hadir"}),e.jsx("p",{className:"text-xl font-extrabold text-amber-600 mt-0.5",children:g.belum})]})]})}),e.jsx("div",{className:"overflow-hidden rounded-2xl bg-white border border-slate-200 p-4 shadow-sm",children:e.jsxs("div",{className:"flex items-center gap-3.5",children:[e.jsx("div",{className:"rounded-xl bg-purple-50 border border-purple-100 p-2.5",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6 text-purple-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:[e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"}),e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"})]})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] font-bold text-slate-400 uppercase tracking-wider",children:"Persentase"}),e.jsxs("p",{className:"text-xl font-extrabold text-purple-600 mt-0.5",children:[Y,"%"]})]})]})})]}),e.jsxs("div",{className:"overflow-hidden rounded-2xl bg-white border border-slate-200 p-3.5 shadow-sm flex-none","data-aos":"fade-up","data-aos-delay":"100",children:[e.jsxs("div",{className:"mb-1.5 flex items-center justify-between",children:[e.jsx("span",{className:"text-xs font-bold text-slate-700",children:"Progress Kehadiran"}),e.jsxs("span",{className:"text-xs font-extrabold text-indigo-600",children:[g.hadir," / ",g.total]})]}),e.jsx("div",{className:"h-2 w-full overflow-hidden rounded-full bg-slate-100",children:e.jsx("div",{className:"h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-700 transition-all duration-1000 ease-out",style:{width:`${Y}%`}})})]}),e.jsxs("div",{className:"flex flex-col sm:flex-row gap-3 flex-none","data-aos":"fade-up","data-aos-delay":"150",children:[e.jsxs("div",{className:"relative flex-1",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2.5,d:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"})}),e.jsx("input",{type:"text",placeholder:"Cari data kehadiran berdasarkan nama atau NIP...",value:_,onChange:t=>re(t.target.value),className:"w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-sm font-medium"})]}),e.jsx("div",{className:"sm:w-64",children:e.jsxs("select",{value:S,onChange:t=>v(t.target.value),className:"w-full rounded-xl border border-slate-200 bg-white py-2 px-3.5 text-xs sm:text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium cursor-pointer",children:[e.jsx("option",{value:"",children:"Semua Status Pegawai"}),G.map((t,a)=>e.jsx("option",{value:t,children:t},a))]})})]}),e.jsx("div",{className:"overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm flex-1 flex flex-col min-h-0","data-aos":"fade-up","data-aos-delay":"200",children:e.jsx("div",{className:"flex-1 overflow-y-auto max-h-[300px]",children:e.jsxs("table",{className:"w-full min-w-full divide-y divide-slate-200 text-xs",children:[e.jsx("thead",{className:"bg-slate-50 sticky top-0 z-10 shadow-xs",children:e.jsxs("tr",{children:[e.jsx("th",{className:"w-12 px-3 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"No"}),e.jsx("th",{className:"px-4 py-3 text-left font-extrabold uppercase tracking-wider text-slate-500",children:"Nama Lengkap"}),e.jsx("th",{className:"w-44 px-3 py-3 text-left font-extrabold uppercase tracking-wider text-slate-500",children:"NIP"}),e.jsx("th",{className:"w-28 px-3 py-3 text-left font-extrabold uppercase tracking-wider text-slate-500",children:"Status Pegawai"}),o?.kategori==="harian"?e.jsxs(e.Fragment,{children:[e.jsx("th",{className:"w-16 px-2 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"Alpha"}),e.jsx("th",{className:"w-16 px-2 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"Izin"}),e.jsx("th",{className:"w-16 px-2 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"Sakit"}),e.jsx("th",{className:"w-24 px-2 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"Lupa Absen"}),e.jsx("th",{className:"w-28 px-2 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"Total Terlambat"}),e.jsx("th",{className:"w-60 px-3 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"Aksi"})]}):e.jsxs(e.Fragment,{children:[e.jsx("th",{className:"px-4 py-3 text-left font-extrabold uppercase tracking-wider text-slate-500",children:"Waktu Hadir"}),e.jsx("th",{className:"w-28 px-3 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"Status"}),e.jsx("th",{className:"w-40 px-3 py-3 text-center font-extrabold uppercase tracking-wider text-slate-500",children:"Aksi"})]})]})}),e.jsx("tbody",{className:"divide-y divide-slate-100 bg-white",children:W.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:o?.kategori==="harian"?10:7,className:"px-4 py-16 text-center align-middle bg-white",children:e.jsxs("div",{className:"flex flex-col items-center justify-center text-center mx-auto w-full",children:[e.jsx("div",{className:"flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200/80 mb-2.5 shadow-2xs",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-6 w-6 text-slate-400",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:1.5,d:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"})})}),e.jsx("p",{className:"text-sm font-bold text-slate-700",children:"Belum ada peserta yang hadir"}),e.jsx("p",{className:"text-xs text-slate-400 mt-0.5",children:"Data kehadiran peserta pada workcode ini masih kosong."})]})})}):W.map((t,a)=>e.jsxs("tr",{className:"transition-colors hover:bg-slate-50/70",children:[e.jsx("td",{className:"px-3 py-2.5 text-center text-xs text-slate-400 font-semibold",children:a+1}),e.jsx("td",{className:"px-4 py-2.5",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600 shrink-0",children:(t.nama||"P").charAt(0).toUpperCase()}),e.jsx("span",{className:"text-xs sm:text-sm font-bold text-slate-800 leading-snug",children:t.nama})]})}),e.jsx("td",{className:"px-3 py-2.5 text-xs text-slate-600 font-semibold font-mono",children:t.nis_nip||"-"}),e.jsx("td",{className:"px-3 py-2.5 text-xs text-slate-600 font-medium",children:t.status_pegawai||"-"}),o?.kategori==="harian"?e.jsxs(e.Fragment,{children:[e.jsx("td",{className:"px-2 py-2.5 text-xs text-red-600 font-bold text-center",children:t.total_alpha||"0"}),e.jsx("td",{className:"px-2 py-2.5 text-xs text-amber-600 font-bold text-center",children:t.total_izin||"0"}),e.jsx("td",{className:"px-2 py-2.5 text-xs text-blue-600 font-bold text-center",children:t.total_sakit||"0"}),e.jsx("td",{className:"px-2 py-2.5 text-xs text-slate-600 font-bold text-center",children:t.total_lupa_absen||"0"}),e.jsx("td",{className:"px-2 py-2.5 text-xs text-orange-600 font-bold text-center",children:t.total_menit_terlambat?t.total_menit_terlambat+" Menit":"0 Menit"}),e.jsx("td",{className:"px-3 py-2.5 text-center",children:e.jsxs("div",{className:"flex items-center justify-center gap-1.5",children:[e.jsxs("button",{onClick:()=>{const s=K.find(n=>n.id===t.participant_id)||{id:t.participant_id,nama:t.nama,nis_nip:t.nis_nip,status:t.status_pegawai};D(s),R(!0)},className:"inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-2xs shrink-0",title:"Buka Kalender 1 Bulan & Kelola Presensi",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3.5 w-3.5 text-emerald-600 shrink-0",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"})}),e.jsx("span",{children:"Kalender"})]}),e.jsx("button",{onClick:()=>U(t.participant_id,t.nama,t.nis_nip,t.status_pegawai),className:"inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-slate-100 border border-slate-200 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors shadow-2xs shrink-0",title:"Daftar Log Presensi",children:e.jsx("span",{children:"Log"})}),e.jsxs("button",{onClick:()=>oe(t.participant_id,t.nama),className:"inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors shadow-2xs shrink-0",title:"Cetak Surat Bukti Rekap Individu",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3.5 w-3.5 text-slate-600 shrink-0",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"})}),e.jsx("span",{children:"Cetak"})]})]})})]}):e.jsxs(e.Fragment,{children:[e.jsx("td",{className:"px-4 py-2.5 text-xs text-slate-700 font-mono font-semibold",children:t.waktu_hadir}),e.jsx("td",{className:"px-3 py-2.5 text-center",children:ee(t.status)}),e.jsx("td",{className:"px-3 py-2.5 text-center",children:e.jsxs("div",{className:"flex items-center justify-center gap-1.5",children:[e.jsx("button",{onClick:()=>Z(t,t.nama),className:"p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-colors",title:"Edit Presensi",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"})})}),e.jsx("button",{onClick:()=>X(t.id,t.nama,t.waktu_hadir),className:"p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors",title:"Hapus Presensi",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"})})})]})})]})]},t.id||t.participant_id||a))})]})})})]})}),e.jsx(pe,{show:h,onClose:()=>y(!1),maxWidth:"md",children:e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-slate-100 pb-4",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"})})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-base font-extrabold text-slate-800",children:"Edit Log Presensi"}),e.jsx("p",{className:"text-xs text-slate-500 font-medium",children:f})]})]}),e.jsx("button",{type:"button",onClick:()=>y(!1),className:"rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]}),e.jsxs("form",{onSubmit:le,className:"mt-5 space-y-4",children:[e.jsxs("div",{children:[e.jsx(ne,{htmlFor:"edit_tanggal",value:"Tanggal Presensi",className:"text-xs font-bold text-slate-700"}),e.jsx(ce,{id:"edit_tanggal",type:"date",value:x.data.tanggal,onChange:t=>x.setData("tanggal",t.target.value),className:"mt-1 w-full text-xs font-medium",required:!0}),e.jsx(T,{message:x.errors.tanggal,className:"mt-1 text-xs"})]}),e.jsxs("div",{children:[e.jsx(ne,{htmlFor:"edit_status",value:"Status Kehadiran",className:"text-xs font-bold text-slate-700"}),e.jsxs("select",{id:"edit_status",value:x.data.status,onChange:t=>x.setData("status",t.target.value),className:"mt-1 w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10",required:!0,children:[e.jsx("option",{value:"hadir",children:"Hadir"}),e.jsx("option",{value:"izin",children:"Izin"}),e.jsx("option",{value:"sakit",children:"Sakit"}),e.jsx("option",{value:"lupa_absen",children:"Lupa Absen"}),e.jsx("option",{value:"alpha",children:"Alpha"})]}),e.jsx(T,{message:x.errors.status,className:"mt-1 text-xs"})]}),x.data.status!=="alpha"&&e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100",children:[e.jsxs("div",{children:[e.jsx(ne,{htmlFor:"edit_jam_masuk",value:"Jam Datang",className:"text-xs font-bold text-slate-600"}),e.jsx(ce,{id:"edit_jam_masuk",type:"time",value:x.data.jam_masuk,onChange:t=>x.setData("jam_masuk",t.target.value),className:"mt-1 w-full text-xs"}),e.jsx(T,{message:x.errors.jam_masuk,className:"mt-1 text-xs"})]}),e.jsxs("div",{children:[e.jsx(ne,{htmlFor:"edit_jam_pulang",value:"Jam Pulang",className:"text-xs font-bold text-slate-600"}),e.jsx(ce,{id:"edit_jam_pulang",type:"time",value:x.data.jam_pulang,onChange:t=>x.setData("jam_pulang",t.target.value),className:"mt-1 w-full text-xs"}),e.jsx(T,{message:x.errors.jam_pulang,className:"mt-1 text-xs"})]})]}),e.jsxs("div",{className:"mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4",children:[e.jsx(me,{type:"button",onClick:()=>y(!1),children:"Batal"}),e.jsx(ke,{type:"submit",disabled:x.processing,className:"bg-indigo-600 hover:bg-indigo-700",children:x.processing?"Menyimpan...":"Perbarui Presensi"})]})]})]})}),e.jsx(pe,{show:p,onClose:()=>b(!1),maxWidth:"2xl",children:e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-slate-100 pb-4",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"})})}),e.jsxs("div",{children:[e.jsxs("h3",{className:"text-base font-extrabold text-slate-800",children:["Riwayat Presensi: ",r?.nama]}),e.jsxs("p",{className:"text-xs text-slate-500 font-medium",children:["NIP: ",e.jsx("span",{className:"font-mono",children:r?.nis_nip||"-"})," • ",r?.status_pegawai||"-"]})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("button",{type:"button",onClick:()=>{D(r),R(!0),b(!1)},className:"inline-flex items-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-3.5 w-3.5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"})}),"Buka Kalender"]}),e.jsx("button",{type:"button",onClick:()=>b(!1),className:"rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]})]}),e.jsx("div",{className:"mt-4",children:V?e.jsx("div",{className:"py-12 text-center text-slate-500 text-xs font-semibold",children:"Memuat data riwayat presensi..."}):r?.attendances?.length===0?e.jsxs("div",{className:"py-12 text-center text-slate-500",children:[e.jsx("p",{className:"text-xs font-semibold",children:"Belum ada riwayat rekaman presensi untuk peserta ini."}),e.jsx("button",{type:"button",onClick:()=>{D(r),R(!0),b(!1)},className:"mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline",children:"📅 Buka kalender presensi sekarang"})]}):e.jsx("div",{className:"overflow-x-auto max-h-[350px] overflow-y-auto rounded-xl border border-slate-200",children:e.jsxs("table",{className:"min-w-full divide-y divide-slate-200 text-xs",children:[e.jsx("thead",{className:"bg-slate-50 sticky top-0 z-10",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-4 py-2.5 text-left font-extrabold text-slate-500 uppercase tracking-wider",children:"No"}),e.jsx("th",{className:"px-4 py-2.5 text-left font-extrabold text-slate-500 uppercase tracking-wider",children:"Tanggal"}),e.jsx("th",{className:"px-4 py-2.5 text-center font-extrabold text-slate-500 uppercase tracking-wider",children:"Jam Datang"}),e.jsx("th",{className:"px-4 py-2.5 text-center font-extrabold text-slate-500 uppercase tracking-wider",children:"Jam Pulang"}),e.jsx("th",{className:"px-4 py-2.5 text-center font-extrabold text-slate-500 uppercase tracking-wider",children:"Status"}),e.jsx("th",{className:"px-4 py-2.5 text-center font-extrabold text-slate-500 uppercase tracking-wider",children:"Aksi"})]})}),e.jsx("tbody",{className:"divide-y divide-slate-100 bg-white",children:r?.attendances?.map((t,a)=>e.jsxs("tr",{className:"hover:bg-slate-50/60 transition-colors",children:[e.jsx("td",{className:"px-4 py-2.5 text-slate-500 font-semibold",children:a+1}),e.jsx("td",{className:"px-4 py-2.5 font-bold text-slate-800",children:t.tanggal_formatted||t.tanggal||"-"}),e.jsx("td",{className:"px-4 py-2.5 text-center font-mono font-medium text-slate-700",children:t.jam_masuk?`${t.jam_masuk} WIB`:t.waktu_hadir!=="-"?t.waktu_hadir:"-"}),e.jsx("td",{className:"px-4 py-2.5 text-center font-mono font-medium text-slate-700",children:t.jam_pulang?`${t.jam_pulang} WIB`:t.waktu_pulang!=="-"?t.waktu_pulang:"-"}),e.jsx("td",{className:"px-4 py-2.5 text-center",children:ee(t.status)}),e.jsx("td",{className:"px-4 py-2.5 text-center",children:e.jsxs("div",{className:"flex items-center justify-center gap-1",children:[e.jsx("button",{type:"button",onClick:()=>Z(t,r.nama),className:"p-1 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors",title:"Edit Log Presensi Ini",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"})})}),e.jsx("button",{type:"button",onClick:()=>X(t.id,r.nama,t.tanggal_formatted||t.tanggal),className:"p-1 rounded-lg text-red-600 hover:bg-red-50 transition-colors",title:"Hapus Log Presensi Ini (Reset Status)",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"})})})]})})]},t.id||a))})]})})}),e.jsx("div",{className:"mt-5 flex justify-end border-t border-slate-100 pt-3",children:e.jsx(me,{onClick:()=>b(!1),children:"Tutup"})})]})}),e.jsx(_e,{show:F,onClose:()=>{R(!1),D(null),se.reload({only:["stats","attendances"],preserveScroll:!0,preserveState:!0})},workcode:o,participants:K,initialParticipant:ie,onAttendanceChanged:()=>{se.reload({only:["stats","attendances"],preserveScroll:!0,preserveState:!0})}})]})}export{Be as default};
