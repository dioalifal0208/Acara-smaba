import{f as Dt,c as At,u as Pt,r as c,m as it,j as t,D as q,q as Ft,I as X,X as Bt,g as R,B as P,o as Rt,h as kt,F as ut,e as ft,S as ht,s as zt,d as Ht,H as Ot,b as lt,i as Kt}from"./app-D0Hq7nrp.js";import{a as Q,S as Jt,A as Ut,e as Yt}from"./AuthenticatedLayout-DQTZnEkO.js";import{C as qt}from"./chevron-left-Bh6ej0KR.js";import{C as Tt}from"./chevron-right-D8N8bdUo.js";import{T as vt}from"./trash-2-CZVVW9NQ.js";import{C as It}from"./calendar-days-CyBm77nI.js";import{P as Lt,I as Vt}from"./printer-DIxl0tWC.js";import{P as yt}from"./pencil-B7sSn21t.js";import{j as Gt,b as Qt}from"./backgroundReload-Dvu-KiWO.js";import{P as Zt,C as Xt,E as _t,S as Wt}from"./Layout-BYN_gjGH.js";import{D as te}from"./DataTable-B0H-z0eu.js";import{A as ee}from"./AttendanceBoard-eP42pt3x.js";import"./calendar-clock-nQcDPVen.js";import"./qr-code-BlE5LjuZ.js";import"./smartphone-CNiTwECQ.js";import"./hourglass-DDQfUn3f.js";import"./clock-C4OvHItQ.js";import"./download-C73a7ObA.js";const ae=Dt("ClipboardList",[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"M12 11h4",key:"1jrz19"}],["path",{d:"M12 16h4",key:"n85exb"}],["path",{d:"M8 11h.01",key:"1dfujw"}],["path",{d:"M8 16h.01",key:"18s6g9"}]]);const se=Dt("FileDown",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M12 18v-6",key:"17g6i2"}],["path",{d:"m9 15 3 3 3-3",key:"1npd3o"}]]),St=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"],ne=["Sen","Sel","Rab","Kam","Jum","Sab","Min"],bt={hadir:"bg-status-hadir-soft text-status-hadir",izin:"bg-status-izin-soft text-status-izin",sakit:"bg-status-izin-soft text-status-izin",alpha:"bg-status-alpha-soft text-status-alpha",lupa_absen:"bg-status-telat-soft text-status-telat",libur:"bg-surface-2 text-ink-2"},jt=["hadir","izin","sakit","lupa_absen","alpha","libur"],wt=s=>String(s).padStart(2,"0");function ie({show:s=!1,onClose:l=()=>{},workcode:i=null,participants:r=[],initialParticipant:b=null,onAttendanceChanged:x=()=>{}}){const{toast:g}=At(),h=Pt(),[p,_]=c.useState(null),[w,u]=c.useState(""),[$,v]=c.useState(!1),k=new Date,[f,d]=c.useState(k.getFullYear()),[m,o]=c.useState(k.getMonth()),[L,D]=c.useState([]),[M,F]=c.useState(!1),[A,z]=c.useState({});c.useEffect(()=>{it.get("/api/holidays").then(a=>z(a.data||{})).catch(()=>{})},[]);const[S,T]=c.useState(null),[y,V]=c.useState({id:null,workcode_id:i?.id||"",participant_id:"",tanggal:"",jam_masuk:"07:00",jam_pulang:"15:30",status:"hadir"}),[rt,W]=c.useState(!1),[ot,G]=c.useState({});c.useEffect(()=>{s&&(b?(_(b),u("")):r.length>0&&!p&&_(r[0]))},[s,b]);const tt=async a=>{if(!(!i||!a)){F(!0);try{const n=await it.get(`/report/individual/${i.id}/${a}`);D(n.data.attendances||[])}catch{g.error("Data presensi gagal dimuat. Periksa koneksi lalu coba lagi.")}finally{F(!1)}}};c.useEffect(()=>{s&&p&&i&&tt(p.id)},[s,p?.id,i?.id]);const et=c.useMemo(()=>{const a=w.trim().toLowerCase();return a?r.filter(n=>(n.nama||"").toLowerCase().includes(a)||(n.nis_nip||"").toLowerCase().includes(a)):r},[r,w]),B=c.useMemo(()=>Object.fromEntries(L.filter(a=>a.tanggal).map(a=>[a.tanggal,a])),[L]),H=a=>{const n=new Date(f,m+a,1);d(n.getFullYear()),o(n.getMonth())},at=()=>{d(k.getFullYear()),o(k.getMonth())},dt=c.useMemo(()=>{const a=(new Date(f,m,1).getDay()+6)%7,n=new Date(f,m+1,0).getDate(),j=Array.from({length:a},(I,K)=>({key:`pad-${K}`,empty:!0}));for(let I=1;I<=n;I++){const K=`${f}-${wt(m+1)}-${wt(I)}`,Y=new Date(f,m,I).getDay();j.push({key:K,dayNumber:I,dateStr:K,isWeekend:Y===0||Y===6,holidayName:A[K]||null,isToday:k.getFullYear()===f&&k.getMonth()===m&&k.getDate()===I,attendance:B[K]||null})}return j},[f,m,B,A]),gt=c.useMemo(()=>{const a=`${f}-${wt(m+1)}`,n=Object.fromEntries(jt.map(j=>[j,0]));return L.forEach(j=>{j.tanggal?.startsWith(a)&&n[j.status]!==void 0&&n[j.status]++}),n},[L,f,m]),U=a=>new Date(`${a}T00:00:00`).toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"}),st=a=>{const n=a.attendance;V({id:n?.id??null,workcode_id:i.id,participant_id:p.id,tanggal:a.dateStr,jam_masuk:n?n.jam_masuk||"":"07:00",jam_pulang:n?n.jam_pulang||"":"15:30",status:n?.status||"hadir"}),G({}),T({dateStr:a.dateStr,dateFormatted:U(a.dateStr),existingAttendance:n})},ct=async a=>{a.preventDefault(),W(!0),G({});try{const n=y.id?await it.put(route("admin.attendances.update",y.id),y):await it.post(route("admin.attendances.store"),y);g.success(n.data?.message||(y.id?"Presensi diperbarui.":"Presensi disimpan.")),T(null),await tt(p.id),x()}catch(n){n.response?.data?.errors&&G(n.response.data.errors),g.error(n.response?.data?.message||"Presensi gagal disimpan. Periksa isian lalu coba lagi.")}finally{W(!1)}},pt=async()=>{if(!(!S?.existingAttendance||!await h({title:"Hapus catatan presensi?",message:`Catatan presensi ${p?.nama} pada ${S.dateFormatted} dihapus, dan status hari itu kembali kosong.`,confirmText:"Hapus catatan"})))try{const n=await it.delete(route("admin.attendances.destroy",S.existingAttendance.id));g.success(n.data?.message||"Presensi dihapus."),T(null),await tt(p.id),x()}catch(n){g.error(n.response?.data?.message||"Presensi gagal dihapus. Coba lagi.")}},O=a=>{const n=ot[a];return Array.isArray(n)?n[0]:n},nt=a=>{const n=[U(a.dateStr)];a.holidayName&&n.push(`libur ${a.holidayName}`);const j=a.attendance;return j?(n.push(Q[j.status]?.label??j.status),(j.jam_masuk||j.jam_pulang)&&n.push(`${j.jam_masuk||"–"} sampai ${j.jam_pulang||"–"}`)):n.push("belum ada catatan, tekan untuk menambah"),n.join(", ")};return t.jsxs(q,{open:s,onClose:l,title:"Kalender presensi",description:i?`${i.nama_workcode} · tekan tanggal untuk menambah, mengubah, atau menghapus presensi`:void 0,size:"4xl",children:[t.jsxs("div",{className:"space-y-4",children:[t.jsxs("div",{className:"flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between",children:[t.jsx("div",{className:"relative lg:w-96",children:p&&!$?t.jsxs("button",{type:"button",onClick:()=>v(!0),className:"flex h-12 w-full items-center gap-3 rounded-lg border border-line-strong bg-surface px-3 text-left hover:bg-surface-2/60","aria-label":`Peserta: ${p.nama}. Ganti peserta`,children:[t.jsxs("span",{className:"min-w-0 flex-1",children:[t.jsx("span",{className:"block truncate text-sm font-medium text-ink",children:p.nama}),t.jsxs("span",{className:"block truncate text-xs tabular-nums text-ink-2",children:[p.nis_nip||"Tanpa NIP"," · ",p.status||"–"]})]}),t.jsx("span",{className:"text-sm font-medium text-accent",children:"Ganti"})]}):t.jsxs(t.Fragment,{children:[t.jsx(Ft,{className:"pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3","aria-hidden":"true"}),t.jsx("input",{type:"text",value:w,onChange:a=>u(a.target.value),placeholder:"Cari nama atau NIP peserta…","aria-label":"Cari peserta",autoFocus:!0,className:"h-12 w-full rounded-lg border border-line-strong bg-surface pl-9 pr-10 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"}),p&&t.jsx(X,{icon:Bt,size:"sm",label:"Batal ganti peserta",onClick:()=>{v(!1),u("")},className:"absolute right-2 top-1/2 -translate-y-1/2"}),t.jsx("ul",{className:"absolute inset-x-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-line bg-surface py-1 shadow-xl",role:"listbox","aria-label":"Peserta",children:et.length===0?t.jsx("li",{className:"px-4 py-3 text-center text-sm text-ink-2",children:"Peserta tidak ditemukan."}):et.map(a=>t.jsx("li",{children:t.jsxs("button",{type:"button",role:"option","aria-selected":p?.id===a.id,onClick:()=>{_(a),u(""),v(!1)},className:R("flex min-h-11 w-full flex-col justify-center px-3 py-1.5 text-left hover:bg-surface-2",p?.id===a.id&&"bg-accent-soft"),children:[t.jsx("span",{className:"text-sm font-medium text-ink",children:a.nama}),t.jsxs("span",{className:"text-xs tabular-nums text-ink-2",children:[a.nis_nip||"Tanpa NIP"," · ",a.status||"–"]})]})},a.id))})]})}),t.jsxs("div",{className:"flex items-center gap-1",children:[t.jsx(X,{icon:qt,label:"Bulan sebelumnya",onClick:()=>H(-1)}),t.jsxs("h3",{className:"min-w-36 text-center text-base font-semibold tabular-nums text-ink","aria-live":"polite",children:[St[m]," ",f]}),t.jsx(X,{icon:Tt,label:"Bulan berikutnya",onClick:()=>H(1)}),t.jsx(P,{size:"sm",variant:"ghost",onClick:at,className:"ml-1",children:"Bulan ini"})]})]}),t.jsxs("div",{className:"rounded-xl border border-line p-2",children:[t.jsx("div",{className:"mb-1 grid grid-cols-7 gap-1 text-center","aria-hidden":"true",children:ne.map((a,n)=>t.jsx("div",{className:R("py-1 text-xs font-medium",n>=5?"text-status-alpha":"text-ink-2"),children:a},a))}),M?t.jsxs("p",{className:"flex items-center justify-center gap-2 py-20 text-sm text-ink-2",children:[t.jsx(Rt,{className:"h-4 w-4"}),"Memuat presensi…"]}):t.jsx("div",{className:"grid grid-cols-7 gap-1",children:dt.map(a=>{if(a.empty)return t.jsx("div",{"aria-hidden":"true"},a.key);const n=a.attendance,j=n?Q[n.status]:null,I=j?.icon;return t.jsxs("button",{type:"button",onClick:()=>st(a),disabled:!p,"aria-label":nt(a),title:a.holidayName||void 0,className:R("flex min-h-14 flex-col rounded-lg border p-1 text-left transition-colors sm:min-h-20 sm:p-1.5",a.isToday?"border-accent":"border-line hover:border-line-strong",n?bt[n.status]??"bg-surface":"bg-surface hover:bg-surface-2/60"),children:[t.jsx("span",{className:R("flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums",a.isToday?"bg-accent text-accent-ink":a.isWeekend||a.holidayName?"text-status-alpha":"text-ink"),children:a.dayNumber}),a.holidayName&&t.jsx("span",{className:"hidden truncate text-xs text-status-alpha sm:block",children:a.holidayName}),n&&t.jsxs("span",{className:"mt-auto flex items-center gap-1",children:[I&&t.jsx(I,{className:"h-3.5 w-3.5 shrink-0","aria-hidden":"true"}),t.jsx("span",{className:"hidden truncate text-xs font-medium sm:inline",children:j?.label??n.status})]}),n?.status==="hadir"&&(n.jam_masuk||n.jam_pulang)&&t.jsxs("span",{className:"hidden text-xs tabular-nums opacity-90 md:block",children:[n.jam_masuk||"–","–",n.jam_pulang||"–"]})]},a.key)})})]}),t.jsxs("dl",{className:"flex flex-wrap gap-x-5 gap-y-2 text-sm",children:[t.jsxs("dt",{className:"sr-only",children:["Rekap ",St[m]]}),jt.map(a=>{const n=Q[a].icon;return t.jsxs("div",{className:"flex items-center gap-1.5",children:[t.jsx(n,{className:R("h-4 w-4",bt[a].split(" ")[1]),"aria-hidden":"true"}),t.jsx("dt",{className:"text-ink-2",children:Q[a].label}),t.jsx("dd",{className:"font-semibold tabular-nums text-ink",children:gt[a]})]},a)})]})]}),t.jsx(q,{open:!!S,onClose:()=>T(null),title:S?.existingAttendance?"Ubah presensi":"Tambah presensi",description:S?`${p?.nama} · ${S.dateFormatted}`:void 0,size:"md",footer:t.jsxs(t.Fragment,{children:[S?.existingAttendance&&t.jsx(P,{variant:"ghost",icon:vt,onClick:pt,disabled:rt,className:"text-danger hover:text-danger sm:mr-auto",children:"Hapus"}),t.jsx(P,{onClick:()=>T(null),children:"Batal"}),t.jsx(P,{variant:"primary",type:"submit",form:"calendar-day",loading:rt,children:S?.existingAttendance?"Simpan perubahan":"Simpan"})]}),children:t.jsxs("form",{id:"calendar-day",onSubmit:ct,className:"space-y-4",children:[t.jsxs("fieldset",{children:[t.jsx("legend",{className:"mb-2 text-sm font-medium text-ink",children:"Status"}),t.jsx("div",{className:"grid grid-cols-2 gap-2 sm:grid-cols-3",role:"radiogroup",children:jt.map(a=>{const n=Q[a].icon,j=y.status===a;return t.jsxs("button",{type:"button",role:"radio","aria-checked":j,onClick:()=>V({...y,status:a}),className:R("flex h-11 items-center gap-2 rounded-lg border px-3 text-sm transition-colors",j?R("border-current font-semibold",bt[a]):"border-line-strong text-ink hover:bg-surface-2"),children:[t.jsx(n,{className:"h-4 w-4 shrink-0","aria-hidden":"true"}),Q[a].label]},a)})}),O("status")&&t.jsx("p",{className:"mt-1.5 text-xs font-medium text-danger",children:O("status")})]}),!["alpha","libur"].includes(y.status)&&t.jsxs("fieldset",{children:[t.jsxs("div",{className:"mb-2 flex items-center justify-between gap-3",children:[t.jsx("legend",{className:"text-sm font-medium text-ink",children:"Jam"}),t.jsx(P,{size:"sm",variant:"ghost",onClick:()=>V({...y,jam_masuk:"07:00",jam_pulang:"15:30"}),className:"-mr-3",children:"Isi jam normal (07:00–15:30)"})]}),t.jsx("div",{className:"grid grid-cols-2 gap-3",children:[["jam_masuk","Datang"],["jam_pulang","Pulang"]].map(([a,n])=>t.jsxs("div",{children:[t.jsx("label",{htmlFor:`cal-${a}`,className:"mb-1.5 block text-sm text-ink-2",children:n}),t.jsx("input",{id:`cal-${a}`,type:"time",value:y[a],onChange:j=>V({...y,[a]:j.target.value}),"aria-invalid":O(a)?!0:void 0,className:"h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm tabular-nums text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"}),O(a)&&t.jsx("p",{className:"mt-1 text-xs font-medium text-danger",children:O(a)})]},a))})]})]})})]})}const le=s=>s?new Intl.DateTimeFormat("id-ID",{day:"numeric",month:"long",year:"numeric"}).format(new Date(`${s}T00:00:00`)):"–";function xt({status:s,late:l=!1}){return s?t.jsx(Jt,{status:s==="hadir"&&l?"terlambat":s}):t.jsx("span",{className:"text-ink-3",children:"–"})}function re({attendance:s,workcode:l,onClose:i}){const r=!!s?.face_capture_url;return t.jsx(q,{open:!!s,onClose:i,title:"Detail presensi",description:l?.nama_workcode,size:"lg",children:s&&t.jsxs("div",{className:"space-y-4",children:[(s.face_capture_url||s.signature_url)&&t.jsxs("figure",{className:"rounded-xl border border-line bg-surface-2 p-3 text-center",children:[t.jsx("img",{src:s.face_capture_url||s.signature_url,alt:`${r?"Foto presensi wajah":"Tanda tangan"} ${s.nama}`,className:R("mx-auto max-h-56 w-full max-w-md rounded-lg border border-line bg-white",r?"object-cover":"object-contain p-2")}),t.jsx("figcaption",{className:"mt-2 text-xs text-ink-2",children:r?"Foto presensi wajah":"Tanda tangan digital"})]}),t.jsxs("div",{children:[t.jsx("p",{className:"text-base font-semibold text-ink",children:s.nama}),t.jsxs("p",{className:"text-sm tabular-nums text-ink-2",children:[s.nis_nip||"Tanpa NIP"," · ",s.status_pegawai||"–"]})]}),t.jsxs("dl",{className:"grid grid-cols-2 gap-x-4 gap-y-3 text-sm",children:[t.jsx(Z,{label:"Tanggal",children:le(s.tanggal)}),t.jsx(Z,{label:"Status",children:t.jsx(xt,{status:s.status})}),t.jsx(Z,{label:"Waktu hadir",children:s.waktu_hadir!=="-"?`${s.waktu_hadir} WIB`:"–"}),t.jsx(Z,{label:"Waktu pulang",children:s.waktu_pulang&&s.waktu_pulang!=="-"?`${s.waktu_pulang} WIB`:"–"}),t.jsx(Z,{label:"Metode",children:s.attendance_method||"–"}),l?.latitude&&l?.longitude&&t.jsxs(Z,{label:"Radius lokasi",children:[l.radius_meters||100," m"]})]})]})})}function oe({attendance:s,onClose:l,onCalendar:i,onLogs:r,onPrint:b}){const x=[{icon:It,label:"Kalender",desc:"Kalender sebulan, tambah atau ubah presensi",onClick:i},{icon:ae,label:"Log presensi",desc:"Riwayat presensi dan foto wajah hasil scan",onClick:r},{icon:Lt,label:"Cetak rekap",desc:"Rekap individu bulan ini, bertanda tangan",onClick:b}];return t.jsx(q,{open:!!s,onClose:l,title:s?.nama??"",description:s?`${s.nis_nip||"Tanpa NIP"} · ${s.status_pegawai||"–"}`:void 0,size:"md",children:t.jsx("ul",{className:"divide-y divide-line overflow-hidden rounded-xl border border-line",children:x.map(({icon:g,label:h,desc:p,onClick:_})=>t.jsx("li",{children:t.jsxs("button",{type:"button",onClick:()=>_(s),className:"flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2/60",children:[t.jsx("span",{className:"flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink-2",children:t.jsx(g,{className:"h-5 w-5","aria-hidden":"true"})}),t.jsxs("span",{className:"min-w-0",children:[t.jsx("span",{className:"block text-sm font-medium text-ink",children:h}),t.jsx("span",{className:"block text-sm text-ink-2",children:p})]})]})},h))})})}function de({open:s,onClose:l,form:i,participantName:r,singleAttendance:b,onSubmit:x}){const{data:g,setData:h,errors:p,processing:_}=i;return t.jsx(q,{open:s,onClose:l,title:"Ubah presensi",description:r,size:"md",footer:t.jsxs(t.Fragment,{children:[t.jsx(P,{onClick:l,children:"Batal"}),t.jsx(P,{variant:"primary",type:"submit",form:"manual-edit",loading:_,children:"Simpan perubahan"})]}),children:t.jsxs("form",{id:"manual-edit",onSubmit:x,className:"space-y-4",children:[t.jsxs("div",{className:"grid gap-4 sm:grid-cols-2",children:[t.jsx(ut,{label:"Tanggal",required:!0,error:p.tanggal,children:t.jsx(ft,{type:"date",value:g.tanggal,onChange:w=>h("tanggal",w.target.value)})}),t.jsx(ut,{label:"Status",required:!0,error:p.status,children:t.jsxs(ht,{value:g.status,onChange:w=>h("status",w.target.value),children:[t.jsx("option",{value:"hadir",children:"Hadir"}),t.jsx("option",{value:"izin",children:"Izin"}),t.jsx("option",{value:"sakit",children:"Sakit"}),t.jsx("option",{value:"lupa_absen",children:"Lupa absen"}),t.jsx("option",{value:"alpha",children:"Alpha"})]})})]}),g.status!=="alpha"&&t.jsxs("div",{className:"grid gap-4 sm:grid-cols-2",children:[t.jsx(ut,{label:b?"Jam presensi":"Jam datang",error:p.jam_masuk,children:t.jsx(ft,{type:"time",value:g.jam_masuk,onChange:w=>h("jam_masuk",w.target.value)})}),!b&&t.jsx(ut,{label:"Jam pulang",error:p.jam_pulang,children:t.jsx(ft,{type:"time",value:g.jam_pulang,onChange:w=>h("jam_pulang",w.target.value)})})]})]})})}function ce({open:s,onClose:l,participant:i,loading:r,onOpenCalendar:b,onEdit:x,onDelete:g}){const[h,p]=c.useState(null),_=i?.attendances??[],w=()=>{p(null),l()};return t.jsxs(q,{open:s,onClose:w,title:i?`Log presensi ${i.nama}`:"Log presensi",description:i?`${i.nis_nip||"Tanpa NIP"} · ${i.status_pegawai||"–"}`:void 0,size:"4xl",footer:t.jsxs(t.Fragment,{children:[t.jsx(P,{icon:It,onClick:b,className:"sm:mr-auto",children:"Buka kalender"}),t.jsx(P,{variant:"primary",onClick:w,children:"Tutup"})]}),children:[r?t.jsx("p",{className:"py-12 text-center text-sm text-ink-2",children:"Memuat riwayat presensi…"}):_.length===0?t.jsx("p",{className:"py-12 text-center text-sm text-ink-2",children:"Belum ada catatan presensi. Tambahkan lewat kalender."}):t.jsx("div",{className:"overflow-x-auto rounded-xl border border-line",children:t.jsxs("table",{className:"w-full text-left text-sm",children:[t.jsx("thead",{className:"bg-surface-2/60 text-xs text-ink-2",children:t.jsxs("tr",{children:[t.jsx("th",{scope:"col",className:"px-4 py-2.5 font-medium",children:"Tanggal"}),t.jsx("th",{scope:"col",className:"px-4 py-2.5 font-medium",children:"Datang"}),t.jsx("th",{scope:"col",className:"px-4 py-2.5 font-medium",children:"Pulang"}),t.jsx("th",{scope:"col",className:"px-4 py-2.5 font-medium",children:"Status"}),t.jsx("th",{scope:"col",className:"px-4 py-2.5 font-medium",children:"Foto wajah"}),t.jsx("th",{scope:"col",className:"px-4 py-2.5 text-right font-medium",children:t.jsx("span",{className:"sr-only",children:"Aksi"})})]})}),t.jsx("tbody",{className:"divide-y divide-line",children:_.map((u,$)=>{const v=u.tanggal_formatted||u.tanggal||"–",k=(f,d)=>u.status==="libur"?"–":f||(d&&d!=="-"?d:"–");return t.jsxs("tr",{children:[t.jsx("td",{className:"whitespace-nowrap px-4 py-2.5 font-medium text-ink",children:v}),t.jsx("td",{className:"px-4 py-2.5 tabular-nums text-ink",children:k(u.jam_masuk,u.waktu_hadir)}),t.jsx("td",{className:"px-4 py-2.5 tabular-nums text-ink",children:k(u.jam_pulang,u.waktu_pulang)}),t.jsx("td",{className:"px-4 py-2.5",children:t.jsx(xt,{status:u.status,late:u.is_late})}),t.jsx("td",{className:"px-4 py-2",children:t.jsx("div",{className:"flex gap-1.5",children:[{url:u.face_capture_url,label:"Datang",time:u.jam_masuk},{url:u.face_capture_pulang_url,label:"Pulang",time:u.jam_pulang}].map(f=>t.jsx(pe,{...f,expired:u.media_expired,onOpen:()=>p({...f,tanggal:v})},f.label))})}),t.jsx("td",{className:"px-4 py-2",children:t.jsxs("div",{className:"flex justify-end gap-1",children:[t.jsx(Ct,{icon:yt,label:`Ubah presensi ${v}`,onClick:()=>x(u)}),t.jsx(Ct,{icon:vt,label:`Hapus presensi ${v}`,onClick:()=>g(u,v),danger:!0})]})})]},u.id||$)})})]})}),t.jsx(q,{open:!!h,onClose:()=>p(null),title:h?`Foto wajah ${h.label.toLowerCase()}`:"",description:h?`${i?.nama??""} · ${h.tanggal}${h.time?` · ${h.time} WIB`:""}`:void 0,size:"sm",children:h&&t.jsx("img",{src:h.url,alt:`Foto wajah ${h.label.toLowerCase()} ${i?.nama??""}`,className:"aspect-[3/4] w-full rounded-lg border border-line bg-surface-2 object-cover"})})]})}function $t({attendance:s,onOpen:l}){const{mediaRetentionDays:i=30}=kt().props,r=s.face_capture_url||s.signature_url;return r?t.jsx("button",{type:"button",onClick:l,"aria-label":`Lihat bukti presensi ${s.nama}`,className:"inline-flex rounded-md border border-line bg-white",children:t.jsx("img",{src:r,alt:"",loading:"lazy",decoding:"async",className:"h-9 w-20 rounded-md object-contain"})}):s.media_expired?t.jsx("span",{className:"text-xs text-ink-2",title:`Foto & tanda tangan presensi hanya disimpan ${i} hari`,children:"Bukti kedaluwarsa"}):t.jsx("span",{className:"text-ink-3",children:"–"})}function pe({url:s,label:l,expired:i=!1,onOpen:r}){const[b,x]=c.useState(!1),{mediaRetentionDays:g=30}=kt().props;if(!s||b){const h=b?"File hilang":i?`Lewat ${g} hari`:"Tidak ada";return t.jsxs("span",{className:"flex h-12 w-12 flex-col items-center justify-center rounded-md border border-dashed border-line-strong text-center text-xs leading-tight text-ink-2",title:`Foto ${l.toLowerCase()}: ${h.toLowerCase()}`,children:[b||i?t.jsx(Vt,{className:"h-4 w-4","aria-hidden":"true"}):l,t.jsxs("span",{className:"sr-only",children:["Foto ",l.toLowerCase(),": ",h]})]})}return t.jsxs("button",{type:"button",onClick:r,"aria-label":`Lihat foto wajah ${l.toLowerCase()}`,className:"relative overflow-hidden rounded-md border border-line",children:[t.jsx("img",{src:s,alt:"",loading:"lazy",onError:()=>x(!0),className:"h-12 w-12 bg-surface-2 object-cover"}),t.jsx("span",{className:"absolute inset-x-0 bottom-0 bg-black/60 text-center text-xs font-medium leading-4 text-white","aria-hidden":"true",children:l})]})}function Ct({icon:s,label:l,onClick:i,danger:r=!1}){return t.jsx("button",{type:"button",onClick:i,"aria-label":l,title:l,className:R("inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors",r?"text-ink-2 hover:bg-danger-soft hover:text-danger":"text-ink-2 hover:bg-surface-2 hover:text-ink"),children:t.jsx(s,{className:"h-4 w-4","aria-hidden":"true"})})}function Z({label:s,children:l}){return t.jsxs("div",{children:[t.jsx("dt",{className:"text-ink-2",children:s}),t.jsx("dd",{className:"mt-0.5 font-medium text-ink",children:l})]})}const C=s=>String(s??"").replace(/[&<>"']/g,l=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[l]);function me({workcode:s,attendances:l,period:i=null,kepalaSekolahNama:r,kepalaSekolahNip:b}){const x=window.open("","_blank","width=800,height=900"),g=["pns","pppk","pppk paruh waktu"],h=d=>{const m=g.indexOf((d||"").trim().toLowerCase().replace(/\s+/g," "));return m===-1?g.length:m},_=[...l].sort((d,m)=>h(d.status_pegawai)-h(m.status_pegawai)||d.nama.localeCompare(m.nama,"id",{sensitivity:"base"})).map((d,m)=>`
        <tr>
            <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${m+1}</td>
            <td style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px;">${C(d.nama)}</td>
            <td style="text-align: center; padding: 7px 6px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 10.5px; white-space: nowrap;">${C(d.nis_nip&&d.nis_nip!=="null"?d.nis_nip:"-")}</td>
            <td style="padding: 7px 6px; border: 1px solid #cbd5e1; font-size: 11px; white-space: nowrap;">${C(d.status_pegawai||"-")}</td>
            ${s.kategori==="harian"?`
                    <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${d.total_alpha||"0"}</td>
                    <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${d.total_izin||"0"}</td>
                    <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${d.total_sakit||"0"}</td>
                    <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${d.total_lupa_absen||"0"}</td>
                    <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${d.total_menit_terlambat?d.total_menit_terlambat+" Menit":"0 Menit"}</td>
                `:`
                    <td style="text-align: center; padding: 7px 6px; border: 1px solid #cbd5e1; font-size: 11px; white-space: nowrap;">${d.waktu_hadir}</td>
                    <td style="text-align: center; padding: 7px 6px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px; white-space: nowrap;">${d.status?d.status.replace("_"," ").toUpperCase():"-"}</td>
                `}
        </tr>
    `).join(""),w=s.kategori==="harian"?`
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
        `,u=s.kategori==="harian"?9:6,$=(d,m={weekday:"long",day:"numeric",month:"long",year:"numeric"})=>new Date(`${String(d).slice(0,10)}T00:00:00`).toLocaleDateString("id-ID",m),v=["","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"];let k="-",f=new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"});if(s.kategori==="harian")if(i?.label)k=i.label;else{const d=[...s.hari_aktif||[]].map(Number).sort((m,o)=>m-o);d.length&&(k=`Setiap ${d.map(m=>v[m]).join(", ")}`)}else{const d=l.map(o=>o.tanggal).filter(Boolean).sort()[0],m=s.tanggal||d;m&&(k=$(m),f=$(m,{day:"numeric",month:"long",year:"numeric"}))}x.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Rekap Presensi - ${C(s.nama_workcode)}</title>
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
                        <td>${C(s.nama_workcode)}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">Kategori Presensi</td>
                        <td>:</td>
                        <td style="text-transform: capitalize;">${s.kategori==="harian"?"Presensi Harian":"Presensi Sekali / Event"}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">Tanggal Kegiatan</td>
                        <td>:</td>
                        <td>${k}</td>
                    </tr>
                </table>
            </div>

            <table class="data-table"${s.kategori==="harian"?"":' style="table-layout: fixed;"'}>
                <thead>
                    <tr>
                        ${w}
                    </tr>
                </thead>
                <tbody>
                    ${_||`<tr><td colspan="${u}" style="text-align:center; padding: 10px;">Belum ada data kehadiran</td></tr>`}
                </tbody>
            </table>

            <div class="ttd-section">
                <div class="ttd-box">
                    <p>Babat, ${f}</p>
                    <p style="margin-bottom: 5px;">Kepala Sekolah,</p>
                    <div class="ttd-qr-wrap" style="display: flex; justify-content: center; margin: 10px 0;">
                        <img src="${window.location.origin}/workcodes/${s.id}/qr-signature?logo=1" style="width: 90px; height: 90px;" alt="QR TTD" />
                    </div>
                    <p style="font-weight: bold; text-decoration: underline; font-size: 13px;">${C(r)}</p>
                    <p style="font-size: 11px; color: #475569; font-family: Arial, sans-serif;">NIP. ${C(b)}</p>
                </div>
            </div>

            <script>
                window.onload = function() {
                    setTimeout(function() { window.focus(); window.print(); }, 600);
                };
            <\/script>
        </body>
        </html>
    `),x.document.close()}async function ue({workcode:s,participantId:l,participantName:i,kepalaSekolahNama:r,kepalaSekolahNip:b}){const x=new Date,g=x.getFullYear(),h=x.getMonth()+1,p=x.toLocaleDateString("id-ID",{month:"long",year:"numeric"}),w=await(await fetch(zt(`report/individual/${s.id}/${l}?year=${g}&month=${h}`))).json(),u=window.open("","_blank","width=800,height=900"),$=(w.attendances||[]).slice().sort((o,L)=>{const D=o.tanggal||"",M=L.tanggal||"";return D.localeCompare(M)}),v=$.map((o,L)=>{let D="-";if(o.tanggal){const[S,T,y]=o.tanggal.split("-").map(Number);D=new Date(S,T-1,y).toLocaleDateString("id-ID",{weekday:"long",day:"2-digit",month:"long",year:"numeric"})}let M=o.jam_masuk||(o.waktu_hadir!=="-"?o.waktu_hadir:"-"),F=o.jam_pulang||(o.waktu_pulang!=="-"?o.waktu_pulang:"-");o.status==="libur"&&(M="-",F="-");let A=(o.status||"hadir").toUpperCase(),z="#0f172a";return o.status==="hadir"||!o.status?o.is_late?(A="TERLAMBAT",z="#b91c1c"):(A="HADIR",z="#15803d"):o.status==="terlambat"?(A="TERLAMBAT",z="#b91c1c"):o.status==="izin"?(A="IZIN",z="#b45309"):o.status==="sakit"?(A="SAKIT",z="#1d4ed8"):o.status==="alpha"?(A="ALPHA",z="#b91c1c"):o.status==="lupa_absen"&&(A="LUPA ABSEN",z="#475569"),`
            <tr>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${L+1}</td>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${D}</td>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${M}</td>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${F}</td>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px; color: ${z};">${A}</td>
            </tr>
        `}).join(""),k=$.filter(o=>o.status==="alpha").length,f=$.filter(o=>o.status==="izin").length,d=$.filter(o=>o.status==="sakit").length,m=$.filter(o=>o.status==="lupa_absen").length;u.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Rekap Kehadiran - ${C(i)}</title>
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
                        <td style="font-weight: bold;">${C(i)}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">NIP</td>
                        <td>:</td>
                        <td style="font-family: monospace;">${C(w.participant.nis_nip||"-")}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">Status Kepegawaian</td>
                        <td>:</td>
                        <td>${C(w.participant.status||"-")}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">WorkCode</td>
                        <td>:</td>
                        <td>${C(s.nama_workcode)}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">Periode Bulan</td>
                        <td>:</td>
                        <td>${p}</td>
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
                        <td style="width: 25%; color: #b91c1c;">${k} Hari</td>
                        <td style="width: 25%; color: #b45309;">${f} Hari</td>
                        <td style="width: 25%; color: #1d4ed8;">${d} Hari</td>
                        <td style="width: 25%; color: #475569;">${m} Hari</td>
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
                    ${v||'<tr><td colspan="5" style="text-align:center; padding: 10px;">Belum ada data kehadiran</td></tr>'}
                </tbody>
            </table>

            <div class="ttd-section">
                <div class="ttd-box">
                    <p>Babat, ${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</p>
                    <p style="margin-bottom: 5px;">Kepala Sekolah,</p>
                    <div class="ttd-qr-wrap" style="display: flex; justify-content: center; margin: 10px 0;">
                        <img src="${window.location.origin}/workcodes/${s.id}/qr-signature?logo=1" style="width: 90px; height: 90px;" alt="QR TTD" />
                    </div>
                    <p style="font-weight: bold; text-decoration: underline; font-size: 13px;">${C(r)}</p>
                    <p style="font-size: 11px; color: #475569; font-family: Arial, sans-serif;">NIP. ${C(b)}</p>
                </div>
            </div>

            <script>
                window.onload = function() {
                    setTimeout(function() { window.focus(); window.print(); }, 600);
                };
            <\/script>
        </body>
        </html>
    `),u.document.close()}const he=["PNS","PPPK","PPPK Paruh Waktu","GTT","PTT"];function xe(s){const l=new Date,i=Array.from({length:12},(r,b)=>{const x=new Date(l.getFullYear(),l.getMonth()-b,1);return`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}`});return s&&!i.includes(s)&&i.push(s),i.map(r=>{const[b,x]=r.split("-").map(Number);return{value:r,label:new Date(b,x-1,1).toLocaleDateString("id-ID",{month:"long",year:"numeric"})}})}function Le({workcodes:s=[],activeWorkcodes:l=[],selectedWorkcodeId:i,selectedWorkcode:r,stats:b,period:x=null,attendances:g=[],participants:h=[],kepalaSekolahNama:p="",kepalaSekolahNip:_=""}){const{flash:w}=kt().props,{toast:u}=At(),$=Pt(),[v,k]=c.useState(""),[f,d]=c.useState(""),[m,o]=c.useState(null),[L,D]=c.useState(null),[M,F]=c.useState(!1),[A,z]=c.useState(""),[S,T]=c.useState(!1),[y,V]=c.useState(null),[rt,W]=c.useState(!1),[ot,G]=c.useState(!1),[tt,et]=c.useState(null),B=Ht({id:null,tanggal:"",jam_masuk:"",jam_pulang:"",status:"hadir"}),H=r?.kategori==="harian",at=r?.kategori==="workcode",dt=M||S||ot||m!==null||L!==null;c.useEffect(()=>{if(dt)return;const e=()=>Qt({only:["stats","attendances","participants","activeWorkcodes"],preserveScroll:!0,preserveState:!0}),N=window.setInterval(e,Gt(2e4)),E=()=>document.visibilityState==="visible"&&e();return document.addEventListener("visibilitychange",E),()=>{window.clearInterval(N),document.removeEventListener("visibilitychange",E)}},[dt]),c.useEffect(()=>{w?.success?u.success(w.success):w?.error&&u.error(w.error)},[w]);const gt=c.useMemo(()=>[...new Set([...he,...g.map(e=>e.status_pegawai).filter(Boolean).sort()])],[g]),U=c.useMemo(()=>{const e=v.trim().toLowerCase();return g.filter(N=>(!e||(N.nama||"").toLowerCase().includes(e)||(N.nis_nip||"").toLowerCase().includes(e))&&(!f||N.status_pegawai===f))},[g,v,f]),st=!!(v||f),ct={kepalaSekolahNama:p,kepalaSekolahNip:_},pt=async({id:e,nama:N,nis_nip:E,status_pegawai:Nt})=>{if(r){W(!0),T(!0);try{const mt=await(await fetch(zt(`report/individual/${r.id}/${e}`))).json();V({id:e,nama:N||mt.participant.nama,nis_nip:E||mt.participant.nis_nip,status_pegawai:Nt||mt.participant.status,attendances:mt.attendances||[]})}catch{T(!1),u.error("Riwayat presensi gagal dimuat. Periksa koneksi lalu coba lagi.")}finally{W(!1)}}},O=()=>S&&y&&pt(y),nt=(e,N)=>{const E=e.waktu_hadir&&e.waktu_hadir!=="-"?String(e.waktu_hadir):"";B.setData({id:e.id,tanggal:e.tanggal||E.match(/^(\d{4}-\d{2}-\d{2})/)?.[1]||new Date().toISOString().split("T")[0],jam_masuk:e.jam_masuk||E.match(/(\d{2}:\d{2})(?::\d{2})?$/)?.[1]||"",jam_pulang:at?"":e.jam_pulang||"",status:e.status||"hadir"}),B.clearErrors(),z(N||e.nama||"Peserta"),F(!0)},a=e=>{e.preventDefault(),B.put(route("admin.attendances.update",B.data.id),{preserveScroll:!0,onSuccess:()=>{F(!1),B.reset(),O()}})},n=async(e,N,E)=>{await $({title:"Hapus catatan presensi?",message:`Catatan presensi ${N}${E?` tanggal ${E}`:""} dihapus, termasuk status hadir, izin, atau alpha di hari itu.`,confirmText:"Hapus catatan"})&&lt.delete(route("admin.attendances.destroy",e),{preserveScroll:!0,onSuccess:O})},j=e=>{et(h.find(N=>N.id===e.participant_id)||{id:e.participant_id,nama:e.nama,nis_nip:e.nis_nip,status:e.status_pegawai}),G(!0)},I=async e=>{try{await ue({workcode:r,participantId:e.participant_id,participantName:e.nama,...ct})}catch{u.error("Rekap individu gagal dimuat. Periksa koneksi lalu coba lagi.")}},K=e=>e.nis_nip&&e.nis_nip!=="-"?e.nis_nip:null,Y=e=>t.jsxs("div",{className:"min-w-0",children:[t.jsx("p",{className:"font-medium text-ink",children:e.nama}),t.jsxs("p",{className:"text-xs tabular-nums text-ink-2",children:[K(e)??"Tanpa NIP",e.status_pegawai?` · ${e.status_pegawai}`:""]})]}),J=(e,N)=>t.jsx("span",{className:e>0?`font-semibold tabular-nums ${N}`:"tabular-nums text-ink-3",children:e||0}),Et=[{key:"nama",header:"Peserta",cell:Y},{key:"alpha",header:"Alpha",align:"right",cell:e=>J(e.total_alpha,"text-status-alpha")},{key:"izin",header:"Izin",align:"right",hideBelow:"md",cell:e=>J(e.total_izin,"text-ink")},{key:"sakit",header:"Sakit",align:"right",hideBelow:"md",cell:e=>J(e.total_sakit,"text-ink")},{key:"lupa",header:"Lupa absen",align:"right",hideBelow:"lg",cell:e=>J(e.total_lupa_absen,"text-ink")},{key:"telat",header:"Terlambat",align:"right",cell:e=>e.total_menit_terlambat?t.jsxs("span",{className:"font-semibold tabular-nums text-status-telat",children:[e.total_menit_terlambat," mnt"]}):t.jsx("span",{className:"tabular-nums text-ink-3",children:"0"})},{key:"buka",header:t.jsx("span",{className:"sr-only",children:"Pilihan"}),align:"right",cell:e=>t.jsx(X,{icon:Tt,size:"sm",label:`Pilihan untuk ${e.nama}`,onClick:()=>D(e)})}],Mt=[{key:"nama",header:"Peserta",cell:Y},{key:"waktu",header:"Waktu hadir",cell:e=>t.jsx("span",{className:"tabular-nums",children:e.status==="libur"||e.waktu_hadir==="-"?"–":e.waktu_hadir})},{key:"status",header:"Status",cell:e=>t.jsx(xt,{status:e.status})},{key:"metode",header:"Metode",hideBelow:"lg",className:"text-ink-2",cell:e=>e.attendance_method||"–"},{key:"bukti",header:"Bukti",hideBelow:"md",cell:e=>t.jsx($t,{attendance:e,onOpen:()=>o(e)})},{key:"aksi",header:t.jsx("span",{className:"sr-only",children:"Aksi"}),align:"right",cell:e=>t.jsxs("div",{className:"flex justify-end gap-1",children:[t.jsx(X,{icon:yt,size:"sm",label:`Ubah presensi ${e.nama}`,onClick:()=>nt(e,e.nama),disabled:!e.id}),t.jsx(X,{icon:vt,size:"sm",label:`Hapus presensi ${e.nama}`,onClick:()=>n(e.id,e.nama,e.waktu_hadir),disabled:!e.id,className:"hover:bg-danger-soft hover:text-danger"})]})}];return t.jsxs(Ut,{children:[t.jsx(Ot,{title:"Laporan"}),t.jsxs("div",{className:"mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6",children:[t.jsx(Zt,{title:"Laporan",description:l.length>1?`${l.length} workcode aktif bersamaan: ${l.map(e=>e.nama_workcode).join(" · ")}`:"Rekap kehadiran per workcode, lengkap dengan bukti presensi.",actions:i&&t.jsxs(t.Fragment,{children:[t.jsx(P,{icon:se,href:route("workcodes.export",{workcode:i,...x?{bulan:x.month}:{}}),external:!0,children:"Ekspor Excel"}),t.jsxs(P,{variant:"primary",icon:Lt,onClick:()=>me({workcode:r,attendances:U,period:x,...ct}),children:["Cetak",st?` (${U.length})`:""]})]})}),s.length===0?t.jsx(Xt,{children:t.jsx(_t,{icon:Yt,title:"Belum ada workcode",description:"Laporan tersedia setelah ada workcode dan presensi yang tercatat.",action:t.jsx(P,{variant:"primary",href:route("workcodes.index"),children:"Atur workcode"})})}):t.jsx(Wt,{flush:!0,children:t.jsx(te,{caption:H?"Rekap presensi harian per peserta":"Daftar kehadiran",rows:U,rowKey:e=>e.participant_id??e.id,filtered:st,onClearFilters:()=>{k(""),d("")},empty:t.jsx(_t,{title:"Belum ada data kehadiran",description:"Presensi di workcode ini akan muncul di sini."}),toolbar:t.jsxs("div",{className:"space-y-3 px-5 py-4",children:[t.jsxs("div",{className:"flex flex-col gap-3 md:flex-row md:items-end md:justify-between",children:[t.jsxs("div",{className:"min-w-0",children:[t.jsx("label",{htmlFor:"report-workcode",className:"mb-1.5 block text-sm font-medium text-ink",children:"Workcode"}),t.jsx(ht,{id:"report-workcode",value:i||"",onChange:e=>lt.get(route("report"),{workcode_id:e.target.value},{preserveState:!0,preserveScroll:!0}),className:"md:w-80",children:s.map(e=>t.jsxs("option",{value:e.id,children:[e.is_active?"● ":"",e.nama_workcode," (",e.attendances_count," hadir)"]},e.id))})]}),at&&b&&t.jsx(ee,{compact:!0,counts:{hadir:b.hadir,izin:b.izin??0,belum:b.belum},className:"md:w-72"}),H&&x&&t.jsxs("div",{className:"md:text-right",children:[t.jsx("label",{htmlFor:"report-month",className:"mb-1.5 block text-sm font-medium text-ink",children:"Bulan rekap"}),t.jsx(ht,{id:"report-month",value:x.month,onChange:e=>lt.get(route("report"),{workcode_id:i,bulan:e.target.value},{preserveState:!0,preserveScroll:!0}),className:"md:w-56",children:xe(x.month).map(e=>t.jsx("option",{value:e.value,children:e.label},e.value))})]})]}),t.jsxs("div",{className:"flex flex-col gap-2 sm:flex-row",children:[t.jsx(Kt,{value:v,onChange:k,label:"Cari peserta",placeholder:"Cari nama atau NIP…",className:"sm:flex-1"}),t.jsxs(ht,{value:f,onChange:e=>d(e.target.value),"aria-label":"Filter status pegawai",className:"sm:w-52",children:[t.jsx("option",{value:"",children:"Semua status pegawai"}),gt.map(e=>t.jsx("option",{value:e,children:e},e))]})]}),t.jsxs("p",{className:"text-sm text-ink-2","aria-live":"polite",children:[st?`${U.length} dari ${g.length} baris cocok dengan filter`:`${g.length} baris`,H&&" · alpha, izin, sakit, lupa absen, dan total menit terlambat per peserta"]})]}),mobileCard:e=>H?t.jsxs("button",{type:"button",onClick:()=>D(e),className:"w-full text-left",children:[Y(e),t.jsxs("p",{className:"mt-1.5 flex flex-wrap gap-x-3 text-sm text-ink-2",children:[t.jsxs("span",{children:["Alpha ",J(e.total_alpha,"text-status-alpha")]}),t.jsxs("span",{children:["Izin ",J(e.total_izin,"text-ink")]}),t.jsxs("span",{children:["Sakit ",J(e.total_sakit,"text-ink")]}),t.jsxs("span",{children:["Telat ",J(e.total_menit_terlambat,"text-status-telat")," mnt"]})]})]}):t.jsxs("div",{className:"space-y-2",children:[Y(e),t.jsxs("div",{className:"flex items-center justify-between gap-3",children:[t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsx("span",{className:"text-sm font-semibold tabular-nums text-ink",children:e.status==="libur"||e.waktu_hadir==="-"?"–":e.waktu_hadir}),t.jsx(xt,{status:e.status})]}),t.jsx($t,{attendance:e,onOpen:()=>o(e)})]}),e.id&&t.jsx(P,{size:"sm",variant:"ghost",icon:yt,onClick:()=>nt(e,e.nama),className:"-ml-3",children:"Ubah presensi"})]}),columns:H?Et:Mt})})]}),t.jsx(re,{attendance:m,workcode:r,onClose:()=>o(null)}),t.jsx(oe,{attendance:L,onClose:()=>D(null),onCalendar:e=>{D(null),j(e)},onLogs:e=>{D(null),pt({id:e.participant_id,nama:e.nama,nis_nip:e.nis_nip,status_pegawai:e.status_pegawai})},onPrint:e=>{D(null),I(e)}}),t.jsx(de,{open:M,onClose:()=>F(!1),form:B,participantName:A,singleAttendance:at,onSubmit:a}),t.jsx(ce,{open:S,onClose:()=>T(!1),participant:y,loading:rt,onOpenCalendar:()=>{T(!1),j({participant_id:y.id,...y})},onEdit:e=>nt(e,y?.nama),onDelete:(e,N)=>n(e.id,y?.nama,N)}),t.jsx(ie,{show:ot,onClose:()=>{G(!1),et(null),lt.reload({only:["stats","attendances"],preserveScroll:!0,preserveState:!0})},workcode:r,participants:h,initialParticipant:tt,onAttendanceChanged:()=>lt.reload({only:["stats","attendances"],preserveScroll:!0,preserveState:!0})})]})}export{Le as default};
