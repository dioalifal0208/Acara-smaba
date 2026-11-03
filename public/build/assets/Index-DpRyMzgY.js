import{f as It,c as Lt,u as Et,r as h,m as it,j as t,D as U,q as Vt,I as Y,X as Gt,g as H,B as $,o as Qt,h as Nt,F as lt,e as xt,S as gt,d as Mt,i as Ft,k as Dt,s as Bt,H as Zt,b as nt}from"./app-CPfrYqQL.js";import{a as et,S as Xt,A as Wt,e as te}from"./AuthenticatedLayout-9mTBYETW.js";import{C as ee}from"./chevron-left-BP5XUBA2.js";import{C as Rt}from"./chevron-right-Cq4AIBTQ.js";import{T as _t}from"./trash-2-Cvao6-6I.js";import{C as Ht}from"./calendar-days-kTuQFTfd.js";import{P as Ot,I as ae}from"./printer-B012oEAo.js";import{P as vt}from"./pencil-DdseA_UE.js";import{j as se,b as ie}from"./backgroundReload-BjGNpMzm.js";import{P as ne,C as le,E as At,S as re}from"./Layout-m7bGpjTT.js";import{D as oe}from"./DataTable-BkNGyIRI.js";import{A as de}from"./AttendanceBoard-BshM7Rzj.js";import{U as jt}from"./user-check-RSLYDyIB.js";import"./calendar-clock-XT395-zW.js";import"./qr-code-BohYOWYa.js";import"./smartphone-ChucLXTH.js";import"./hourglass-CAJ-7XWg.js";import"./clock-IVFVJe0O.js";import"./download-DcOyaBjp.js";const ce=It("ClipboardList",[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"M12 11h4",key:"1jrz19"}],["path",{d:"M12 16h4",key:"n85exb"}],["path",{d:"M8 11h.01",key:"1dfujw"}],["path",{d:"M8 16h.01",key:"18s6g9"}]]);const pe=It("FileDown",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M12 18v-6",key:"17g6i2"}],["path",{d:"m9 15 3 3 3-3",key:"1npd3o"}]]),Pt=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"],me=["Sen","Sel","Rab","Kam","Jum","Sab","Min"],wt={hadir:"bg-status-hadir-soft text-status-hadir",izin:"bg-status-izin-soft text-status-izin",sakit:"bg-status-izin-soft text-status-izin",alpha:"bg-status-alpha-soft text-status-alpha",lupa_absen:"bg-status-telat-soft text-status-telat",libur:"bg-surface-2 text-ink-2"},yt=["hadir","izin","sakit","lupa_absen","alpha","libur"],kt=s=>String(s).padStart(2,"0");function ue({show:s=!1,onClose:d=()=>{},workcode:r=null,participants:u=[],initialParticipant:f=null,onAttendanceChanged:g=()=>{}}){const{toast:x}=Lt(),l=Et(),[p,N]=h.useState(null),[w,m]=h.useState(""),[k,S]=h.useState(!1),y=new Date,[b,c]=h.useState(y.getFullYear()),[n,o]=h.useState(y.getMonth()),[T,B]=h.useState([]),[A,O]=h.useState(!1),[C,I]=h.useState({});h.useEffect(()=>{it.get("/api/holidays").then(a=>I(a.data||{})).catch(()=>{})},[]);const[P,E]=h.useState(null),[_,L]=h.useState({id:null,workcode_id:r?.id||"",participant_id:"",tanggal:"",jam_masuk:"07:00",jam_pulang:"15:30",status:"hadir"}),[rt,ot]=h.useState(!1),[dt,V]=h.useState({});h.useEffect(()=>{s&&(f?(N(f),m("")):u.length>0&&!p&&N(u[0]))},[s,f]);const G=async a=>{if(!(!r||!a)){O(!0);try{const i=await it.get(`/report/individual/${r.id}/${a}`);B(i.data.attendances||[])}catch{x.error("Data presensi gagal dimuat. Periksa koneksi lalu coba lagi.")}finally{O(!1)}}};h.useEffect(()=>{s&&p&&r&&G(p.id)},[s,p?.id,r?.id]);const ct=h.useMemo(()=>{const a=w.trim().toLowerCase();return a?u.filter(i=>(i.nama||"").toLowerCase().includes(a)||(i.nis_nip||"").toLowerCase().includes(a)):u},[u,w]),st=h.useMemo(()=>Object.fromEntries(T.filter(a=>a.tanggal).map(a=>[a.tanggal,a])),[T]),Q=a=>{const i=new Date(b,n+a,1);c(i.getFullYear()),o(i.getMonth())},Z=()=>{c(y.getFullYear()),o(y.getMonth())},K=h.useMemo(()=>{const a=(new Date(b,n,1).getDay()+6)%7,i=new Date(b,n+1,0).getDate(),j=Array.from({length:a},(z,M)=>({key:`pad-${M}`,empty:!0}));for(let z=1;z<=i;z++){const M=`${b}-${kt(n+1)}-${kt(z)}`,mt=new Date(b,n,z).getDay();j.push({key:M,dayNumber:z,dateStr:M,isWeekend:mt===0||mt===6,holidayName:C[M]||null,isToday:y.getFullYear()===b&&y.getMonth()===n&&y.getDate()===z,attendance:st[M]||null})}return j},[b,n,st,C]),q=h.useMemo(()=>{const a=`${b}-${kt(n+1)}`,i=Object.fromEntries(yt.map(j=>[j,0]));return T.forEach(j=>{j.tanggal?.startsWith(a)&&i[j.status]!==void 0&&i[j.status]++}),i},[T,b,n]),X=a=>new Date(`${a}T00:00:00`).toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"}),pt=a=>{const i=a.attendance;L({id:i?.id??null,workcode_id:r.id,participant_id:p.id,tanggal:a.dateStr,jam_masuk:i?i.jam_masuk||"":"07:00",jam_pulang:i?i.jam_pulang||"":"15:30",status:i?.status||"hadir"}),V({}),E({dateStr:a.dateStr,dateFormatted:X(a.dateStr),existingAttendance:i})},bt=async a=>{a.preventDefault(),ot(!0),V({});try{const i=_.id?await it.put(route("admin.attendances.update",_.id),_):await it.post(route("admin.attendances.store"),_);x.success(i.data?.message||(_.id?"Presensi diperbarui.":"Presensi disimpan.")),E(null),await G(p.id),g()}catch(i){i.response?.data?.errors&&V(i.response.data.errors),x.error(i.response?.data?.message||"Presensi gagal disimpan. Periksa isian lalu coba lagi.")}finally{ot(!1)}},W=async()=>{if(!(!P?.existingAttendance||!await l({title:"Hapus catatan presensi?",message:`Catatan presensi ${p?.nama} pada ${P.dateFormatted} dihapus, dan status hari itu kembali kosong.`,confirmText:"Hapus catatan"})))try{const i=await it.delete(route("admin.attendances.destroy",P.existingAttendance.id));x.success(i.data?.message||"Presensi dihapus."),E(null),await G(p.id),g()}catch(i){x.error(i.response?.data?.message||"Presensi gagal dihapus. Coba lagi.")}},R=a=>{const i=dt[a];return Array.isArray(i)?i[0]:i},tt=a=>{const i=[X(a.dateStr)];a.holidayName&&i.push(`libur ${a.holidayName}`);const j=a.attendance;return j?(i.push(et[j.status]?.label??j.status),(j.jam_masuk||j.jam_pulang)&&i.push(`${j.jam_masuk||"–"} sampai ${j.jam_pulang||"–"}`)):i.push("belum ada catatan, tekan untuk menambah"),i.join(", ")};return t.jsxs(U,{open:s,onClose:d,title:"Kalender presensi",description:r?`${r.nama_workcode} · tekan tanggal untuk menambah, mengubah, atau menghapus presensi`:void 0,size:"4xl",children:[t.jsxs("div",{className:"space-y-4",children:[t.jsxs("div",{className:"flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between",children:[t.jsx("div",{className:"relative lg:w-96",children:p&&!k?t.jsxs("button",{type:"button",onClick:()=>S(!0),className:"flex h-12 w-full items-center gap-3 rounded-lg border border-line-strong bg-surface px-3 text-left hover:bg-surface-2/60","aria-label":`Peserta: ${p.nama}. Ganti peserta`,children:[t.jsxs("span",{className:"min-w-0 flex-1",children:[t.jsx("span",{className:"block truncate text-sm font-medium text-ink",children:p.nama}),t.jsxs("span",{className:"block truncate text-xs tabular-nums text-ink-2",children:[p.nis_nip||"Tanpa NIP"," · ",p.status||"–"]})]}),t.jsx("span",{className:"text-sm font-medium text-accent",children:"Ganti"})]}):t.jsxs(t.Fragment,{children:[t.jsx(Vt,{className:"pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3","aria-hidden":"true"}),t.jsx("input",{type:"text",value:w,onChange:a=>m(a.target.value),placeholder:"Cari nama atau NIP peserta…","aria-label":"Cari peserta",autoFocus:!0,className:"h-12 w-full rounded-lg border border-line-strong bg-surface pl-9 pr-10 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"}),p&&t.jsx(Y,{icon:Gt,size:"sm",label:"Batal ganti peserta",onClick:()=>{S(!1),m("")},className:"absolute right-2 top-1/2 -translate-y-1/2"}),t.jsx("ul",{className:"absolute inset-x-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-line bg-surface py-1 shadow-xl",role:"listbox","aria-label":"Peserta",children:ct.length===0?t.jsx("li",{className:"px-4 py-3 text-center text-sm text-ink-2",children:"Peserta tidak ditemukan."}):ct.map(a=>t.jsx("li",{children:t.jsxs("button",{type:"button",role:"option","aria-selected":p?.id===a.id,onClick:()=>{N(a),m(""),S(!1)},className:H("flex min-h-11 w-full flex-col justify-center px-3 py-1.5 text-left hover:bg-surface-2",p?.id===a.id&&"bg-accent-soft"),children:[t.jsx("span",{className:"text-sm font-medium text-ink",children:a.nama}),t.jsxs("span",{className:"text-xs tabular-nums text-ink-2",children:[a.nis_nip||"Tanpa NIP"," · ",a.status||"–"]})]})},a.id))})]})}),t.jsxs("div",{className:"flex items-center gap-1",children:[t.jsx(Y,{icon:ee,label:"Bulan sebelumnya",onClick:()=>Q(-1)}),t.jsxs("h3",{className:"min-w-36 text-center text-base font-semibold tabular-nums text-ink","aria-live":"polite",children:[Pt[n]," ",b]}),t.jsx(Y,{icon:Rt,label:"Bulan berikutnya",onClick:()=>Q(1)}),t.jsx($,{size:"sm",variant:"ghost",onClick:Z,className:"ml-1",children:"Bulan ini"})]})]}),t.jsxs("div",{className:"rounded-xl border border-line p-2",children:[t.jsx("div",{className:"mb-1 grid grid-cols-7 gap-1 text-center","aria-hidden":"true",children:me.map((a,i)=>t.jsx("div",{className:H("py-1 text-xs font-medium",i>=5?"text-status-alpha":"text-ink-2"),children:a},a))}),A?t.jsxs("p",{className:"flex items-center justify-center gap-2 py-20 text-sm text-ink-2",children:[t.jsx(Qt,{className:"h-4 w-4"}),"Memuat presensi…"]}):t.jsx("div",{className:"grid grid-cols-7 gap-1",children:K.map(a=>{if(a.empty)return t.jsx("div",{"aria-hidden":"true"},a.key);const i=a.attendance,j=i?et[i.status]:null,z=j?.icon;return t.jsxs("button",{type:"button",onClick:()=>pt(a),disabled:!p,"aria-label":tt(a),title:a.holidayName||void 0,className:H("flex min-h-14 flex-col rounded-lg border p-1 text-left transition-colors sm:min-h-20 sm:p-1.5",a.isToday?"border-accent":"border-line hover:border-line-strong",i?wt[i.status]??"bg-surface":"bg-surface hover:bg-surface-2/60"),children:[t.jsx("span",{className:H("flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums",a.isToday?"bg-accent text-accent-ink":a.isWeekend||a.holidayName?"text-status-alpha":"text-ink"),children:a.dayNumber}),a.holidayName&&t.jsx("span",{className:"hidden truncate text-xs text-status-alpha sm:block",children:a.holidayName}),i&&t.jsxs("span",{className:"mt-auto flex items-center gap-1",children:[z&&t.jsx(z,{className:"h-3.5 w-3.5 shrink-0","aria-hidden":"true"}),t.jsx("span",{className:"hidden truncate text-xs font-medium sm:inline",children:j?.label??i.status})]}),i?.status==="hadir"&&(i.jam_masuk||i.jam_pulang)&&t.jsxs("span",{className:"hidden text-xs tabular-nums opacity-90 md:block",children:[i.jam_masuk||"–","–",i.jam_pulang||"–"]})]},a.key)})})]}),t.jsxs("dl",{className:"flex flex-wrap gap-x-5 gap-y-2 text-sm",children:[t.jsxs("dt",{className:"sr-only",children:["Rekap ",Pt[n]]}),yt.map(a=>{const i=et[a].icon;return t.jsxs("div",{className:"flex items-center gap-1.5",children:[t.jsx(i,{className:H("h-4 w-4",wt[a].split(" ")[1]),"aria-hidden":"true"}),t.jsx("dt",{className:"text-ink-2",children:et[a].label}),t.jsx("dd",{className:"font-semibold tabular-nums text-ink",children:q[a]})]},a)})]})]}),t.jsx(U,{open:!!P,onClose:()=>E(null),title:P?.existingAttendance?"Ubah presensi":"Tambah presensi",description:P?`${p?.nama} · ${P.dateFormatted}`:void 0,size:"md",footer:t.jsxs(t.Fragment,{children:[P?.existingAttendance&&t.jsx($,{variant:"ghost",icon:_t,onClick:W,disabled:rt,className:"text-danger hover:text-danger sm:mr-auto",children:"Hapus"}),t.jsx($,{onClick:()=>E(null),children:"Batal"}),t.jsx($,{variant:"primary",type:"submit",form:"calendar-day",loading:rt,children:P?.existingAttendance?"Simpan perubahan":"Simpan"})]}),children:t.jsxs("form",{id:"calendar-day",onSubmit:bt,className:"space-y-4",children:[t.jsxs("fieldset",{children:[t.jsx("legend",{className:"mb-2 text-sm font-medium text-ink",children:"Status"}),t.jsx("div",{className:"grid grid-cols-2 gap-2 sm:grid-cols-3",role:"radiogroup",children:yt.map(a=>{const i=et[a].icon,j=_.status===a;return t.jsxs("button",{type:"button",role:"radio","aria-checked":j,onClick:()=>L({..._,status:a}),className:H("flex h-11 items-center gap-2 rounded-lg border px-3 text-sm transition-colors",j?H("border-current font-semibold",wt[a]):"border-line-strong text-ink hover:bg-surface-2"),children:[t.jsx(i,{className:"h-4 w-4 shrink-0","aria-hidden":"true"}),et[a].label]},a)})}),R("status")&&t.jsx("p",{className:"mt-1.5 text-xs font-medium text-danger",children:R("status")})]}),!["alpha","libur"].includes(_.status)&&t.jsxs("fieldset",{children:[t.jsxs("div",{className:"mb-2 flex items-center justify-between gap-3",children:[t.jsx("legend",{className:"text-sm font-medium text-ink",children:"Jam"}),t.jsx($,{size:"sm",variant:"ghost",onClick:()=>L({..._,jam_masuk:"07:00",jam_pulang:"15:30"}),className:"-mr-3",children:"Isi jam normal (07:00–15:30)"})]}),t.jsx("div",{className:"grid grid-cols-2 gap-3",children:[["jam_masuk","Datang"],["jam_pulang","Pulang"]].map(([a,i])=>t.jsxs("div",{children:[t.jsx("label",{htmlFor:`cal-${a}`,className:"mb-1.5 block text-sm text-ink-2",children:i}),t.jsx("input",{id:`cal-${a}`,type:"time",value:_[a],onChange:j=>L({..._,[a]:j.target.value}),"aria-invalid":R(a)?!0:void 0,className:"h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm tabular-nums text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"}),R(a)&&t.jsx("p",{className:"mt-1 text-xs font-medium text-danger",children:R(a)})]},a))})]})]})})]})}const Kt=s=>s?new Intl.DateTimeFormat("id-ID",{day:"numeric",month:"long",year:"numeric"}).format(new Date(`${s}T00:00:00`)):"–";function ft({status:s,late:d=!1}){return s?t.jsx(Xt,{status:s==="hadir"&&d?"terlambat":s}):t.jsx("span",{className:"text-ink-3",children:"–"})}function he({attendance:s,workcode:d,onClose:r}){const u=!!s?.face_capture_url;return t.jsx(U,{open:!!s,onClose:r,title:"Detail presensi",description:d?.nama_workcode,size:"lg",children:s&&t.jsxs("div",{className:"space-y-4",children:[(s.face_capture_url||s.signature_url)&&t.jsxs("figure",{className:"rounded-xl border border-line bg-surface-2 p-3 text-center",children:[t.jsx("img",{src:s.face_capture_url||s.signature_url,alt:`${u?"Foto presensi wajah":"Tanda tangan"} ${s.nama}`,className:H("mx-auto max-h-56 w-full max-w-md rounded-lg border border-line bg-white",u?"object-cover":"object-contain p-2")}),t.jsx("figcaption",{className:"mt-2 text-xs text-ink-2",children:u?"Foto presensi wajah":"Tanda tangan digital"})]}),t.jsxs("div",{children:[t.jsx("p",{className:"text-base font-semibold text-ink",children:s.nama}),t.jsxs("p",{className:"text-sm tabular-nums text-ink-2",children:[s.nis_nip||"Tanpa NIP"," · ",s.status_pegawai||"–"]})]}),t.jsxs("dl",{className:"grid grid-cols-2 gap-x-4 gap-y-3 text-sm",children:[t.jsx(at,{label:"Tanggal",children:Kt(s.tanggal)}),t.jsx(at,{label:"Status",children:t.jsx(ft,{status:s.status})}),t.jsx(at,{label:"Waktu hadir",children:s.waktu_hadir!=="-"?`${s.waktu_hadir} WIB`:"–"}),t.jsx(at,{label:"Waktu pulang",children:s.waktu_pulang&&s.waktu_pulang!=="-"?`${s.waktu_pulang} WIB`:"–"}),t.jsx(at,{label:"Metode",children:s.attendance_method||"–"}),d?.latitude&&d?.longitude&&t.jsxs(at,{label:"Radius lokasi",children:[d.radius_meters||100," m"]})]})]})})}function xe({attendance:s,onClose:d,onCalendar:r,onLogs:u,onPrint:f}){const g=[{icon:Ht,label:"Kalender",desc:"Kalender sebulan, tambah atau ubah presensi",onClick:r},{icon:ce,label:"Log presensi",desc:"Riwayat presensi dan foto wajah hasil scan",onClick:u},{icon:Ot,label:"Cetak rekap",desc:"Rekap individu bulan ini, bertanda tangan",onClick:f}];return t.jsx(U,{open:!!s,onClose:d,title:s?.nama??"",description:s?`${s.nis_nip||"Tanpa NIP"} · ${s.status_pegawai||"–"}`:void 0,size:"md",children:t.jsx("ul",{className:"divide-y divide-line overflow-hidden rounded-xl border border-line",children:g.map(({icon:x,label:l,desc:p,onClick:N})=>t.jsx("li",{children:t.jsxs("button",{type:"button",onClick:()=>N(s),className:"flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2/60",children:[t.jsx("span",{className:"flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink-2",children:t.jsx(x,{className:"h-5 w-5","aria-hidden":"true"})}),t.jsxs("span",{className:"min-w-0",children:[t.jsx("span",{className:"block text-sm font-medium text-ink",children:l}),t.jsx("span",{className:"block text-sm text-ink-2",children:p})]})]})},l))})})}function ge({open:s,onClose:d,form:r,participantName:u,singleAttendance:f,onSubmit:g}){const{data:x,setData:l,errors:p,processing:N}=r;return t.jsx(U,{open:s,onClose:d,title:"Ubah presensi",description:u,size:"md",footer:t.jsxs(t.Fragment,{children:[t.jsx($,{onClick:d,children:"Batal"}),t.jsx($,{variant:"primary",type:"submit",form:"manual-edit",loading:N,children:"Simpan perubahan"})]}),children:t.jsxs("form",{id:"manual-edit",onSubmit:g,className:"space-y-4",children:[t.jsxs("div",{className:"grid gap-4 sm:grid-cols-2",children:[t.jsx(lt,{label:"Tanggal",required:!0,error:p.tanggal,children:t.jsx(xt,{type:"date",value:x.tanggal,onChange:w=>l("tanggal",w.target.value)})}),t.jsx(lt,{label:"Status",required:!0,error:p.status,children:t.jsxs(gt,{value:x.status,onChange:w=>l("status",w.target.value),children:[t.jsx("option",{value:"hadir",children:"Hadir"}),t.jsx("option",{value:"izin",children:"Izin"}),t.jsx("option",{value:"sakit",children:"Sakit"}),t.jsx("option",{value:"lupa_absen",children:"Lupa absen"}),t.jsx("option",{value:"alpha",children:"Alpha"})]})})]}),x.status!=="alpha"&&t.jsxs("div",{className:"grid gap-4 sm:grid-cols-2",children:[t.jsx(lt,{label:f?"Jam presensi":"Jam datang",error:p.jam_masuk,children:t.jsx(xt,{type:"time",value:x.jam_masuk,onChange:w=>l("jam_masuk",w.target.value)})}),!f&&t.jsx(lt,{label:"Jam pulang",error:p.jam_pulang,children:t.jsx(xt,{type:"time",value:x.jam_pulang,onChange:w=>l("jam_pulang",w.target.value)})})]})]})})}function fe({open:s,onClose:d,workcodeId:r,candidates:u,initialSelected:f,tanggal:g,defaultJam:x}){const l=Mt({participant_ids:[],jam:x||"07:00"}),[p,N]=h.useState("");h.useEffect(()=>{s&&(l.setData({participant_ids:f??[],jam:x||"07:00"}),l.clearErrors(),N(""))},[s]);const w=new Set(l.data.participant_ids),m=h.useMemo(()=>{const n=p.trim().toLowerCase();return u.filter(o=>!n||(o.nama||"").toLowerCase().includes(n)||(o.nis_nip||"").toLowerCase().includes(n))},[u,p]),k=m.filter(n=>w.has(n.participant_id)).length,S=n=>l.setData("participant_ids",w.has(n)?l.data.participant_ids.filter(o=>o!==n):[...l.data.participant_ids,n]),y=()=>{const n=m.map(o=>o.participant_id);l.setData("participant_ids",k===m.length?l.data.participant_ids.filter(o=>!n.includes(o)):[...new Set([...l.data.participant_ids,...n])])},b=n=>{n.preventDefault(),l.post(route("admin.workcodes.mark-present",r),{preserveScroll:!0,onSuccess:d})},c=l.data.participant_ids.length;return t.jsx(U,{open:s,onClose:d,title:"Tandai hadir",description:`Acara ${Kt(g)} · tercatat sebagai presensi manual admin`,size:"lg",footer:t.jsxs(t.Fragment,{children:[t.jsx($,{onClick:d,children:"Batal"}),t.jsx($,{variant:"primary",type:"submit",form:"mark-present",loading:l.processing,disabled:c===0,children:c>0?`Tandai ${c} peserta hadir`:"Pilih peserta"})]}),children:t.jsxs("form",{id:"mark-present",onSubmit:b,className:"space-y-4",children:[t.jsx(lt,{label:"Jam hadir",required:!0,error:l.errors.jam,hint:"Dipakai untuk semua peserta yang dipilih.",children:t.jsx(xt,{type:"time",value:l.data.jam,onChange:n=>l.setData("jam",n.target.value),className:"sm:w-40"})}),t.jsxs("div",{className:"space-y-2",children:[t.jsx(Ft,{value:p,onChange:N,label:"Cari peserta",placeholder:"Cari nama atau NIP…"}),t.jsxs("div",{className:"flex items-center justify-between gap-3 px-1",children:[t.jsxs(Dt,{checked:m.length>0&&k===m.length,indeterminate:k>0&&k<m.length,onChange:y,disabled:m.length===0,children:["Pilih semua",p?" hasil pencarian":""," (",m.length,")"]}),t.jsxs("span",{className:"text-sm tabular-nums text-ink-2","aria-live":"polite",children:[c," dipilih"]})]}),t.jsx("ul",{className:"max-h-[45dvh] divide-y divide-line overflow-y-auto rounded-xl border border-line",children:m.length===0?t.jsx("li",{className:"px-4 py-6 text-center text-sm text-ink-2",children:u.length===0?"Semua peserta sudah tercatat.":"Tidak ada peserta yang cocok."}):m.map(n=>t.jsx("li",{children:t.jsx(Dt,{checked:w.has(n.participant_id),onChange:()=>S(n.participant_id),className:"w-full px-4 hover:bg-surface-2",children:t.jsxs("span",{className:"min-w-0",children:[t.jsx("span",{className:"block font-medium text-ink",children:n.nama}),t.jsxs("span",{className:"block text-xs tabular-nums text-ink-2",children:[n.nis_nip&&n.nis_nip!=="-"?n.nis_nip:"Tanpa NIP",n.status_pegawai?` · ${n.status_pegawai}`:""]})]})})},n.participant_id))}),l.errors.participant_ids&&t.jsx("p",{className:"text-sm text-danger",children:l.errors.participant_ids})]})]})})}function be({open:s,onClose:d,participant:r,loading:u,onOpenCalendar:f,onEdit:g,onDelete:x}){const[l,p]=h.useState(null),N=r?.attendances??[],w=()=>{p(null),d()};return t.jsxs(U,{open:s,onClose:w,title:r?`Log presensi ${r.nama}`:"Log presensi",description:r?`${r.nis_nip||"Tanpa NIP"} · ${r.status_pegawai||"–"}`:void 0,size:"4xl",footer:t.jsxs(t.Fragment,{children:[t.jsx($,{icon:Ht,onClick:f,className:"sm:mr-auto",children:"Buka kalender"}),t.jsx($,{variant:"primary",onClick:w,children:"Tutup"})]}),children:[u?t.jsx("p",{className:"py-12 text-center text-sm text-ink-2",children:"Memuat riwayat presensi…"}):N.length===0?t.jsx("p",{className:"py-12 text-center text-sm text-ink-2",children:"Belum ada catatan presensi. Tambahkan lewat kalender."}):t.jsx("div",{className:"overflow-x-auto rounded-xl border border-line",children:t.jsxs("table",{className:"w-full text-left text-sm",children:[t.jsx("thead",{className:"bg-surface-2/60 text-xs text-ink-2",children:t.jsxs("tr",{children:[t.jsx("th",{scope:"col",className:"px-4 py-2.5 font-medium",children:"Tanggal"}),t.jsx("th",{scope:"col",className:"px-4 py-2.5 font-medium",children:"Datang"}),t.jsx("th",{scope:"col",className:"px-4 py-2.5 font-medium",children:"Pulang"}),t.jsx("th",{scope:"col",className:"px-4 py-2.5 font-medium",children:"Status"}),t.jsx("th",{scope:"col",className:"px-4 py-2.5 font-medium",children:"Foto wajah"}),t.jsx("th",{scope:"col",className:"px-4 py-2.5 text-right font-medium",children:t.jsx("span",{className:"sr-only",children:"Aksi"})})]})}),t.jsx("tbody",{className:"divide-y divide-line",children:N.map((m,k)=>{const S=m.tanggal_formatted||m.tanggal||"–",y=(b,c)=>m.status==="libur"?"–":b||(c&&c!=="-"?c:"–");return t.jsxs("tr",{children:[t.jsx("td",{className:"whitespace-nowrap px-4 py-2.5 font-medium text-ink",children:S}),t.jsx("td",{className:"px-4 py-2.5 tabular-nums text-ink",children:y(m.jam_masuk,m.waktu_hadir)}),t.jsx("td",{className:"px-4 py-2.5 tabular-nums text-ink",children:y(m.jam_pulang,m.waktu_pulang)}),t.jsx("td",{className:"px-4 py-2.5",children:t.jsx(ft,{status:m.status,late:m.is_late})}),t.jsx("td",{className:"px-4 py-2",children:t.jsx("div",{className:"flex gap-1.5",children:[{url:m.face_capture_url,label:"Datang",time:m.jam_masuk},{url:m.face_capture_pulang_url,label:"Pulang",time:m.jam_pulang}].map(b=>t.jsx(je,{...b,expired:m.media_expired,onOpen:()=>p({...b,tanggal:S})},b.label))})}),t.jsx("td",{className:"px-4 py-2",children:t.jsxs("div",{className:"flex justify-end gap-1",children:[t.jsx(Tt,{icon:vt,label:`Ubah presensi ${S}`,onClick:()=>g(m)}),t.jsx(Tt,{icon:_t,label:`Hapus presensi ${S}`,onClick:()=>x(m,S),danger:!0})]})})]},m.id||k)})})]})}),t.jsx(U,{open:!!l,onClose:()=>p(null),title:l?`Foto wajah ${l.label.toLowerCase()}`:"",description:l?`${r?.nama??""} · ${l.tanggal}${l.time?` · ${l.time} WIB`:""}`:void 0,size:"sm",children:l&&t.jsx("img",{src:l.url,alt:`Foto wajah ${l.label.toLowerCase()} ${r?.nama??""}`,className:"aspect-[3/4] w-full rounded-lg border border-line bg-surface-2 object-cover"})})]})}function zt({attendance:s,onOpen:d}){const{mediaRetentionDays:r=30}=Nt().props,u=s.face_capture_url||s.signature_url;return u?t.jsx("button",{type:"button",onClick:d,"aria-label":`Lihat bukti presensi ${s.nama}`,className:"inline-flex rounded-md border border-line bg-white",children:t.jsx("img",{src:u,alt:"",loading:"lazy",decoding:"async",className:"h-9 w-20 rounded-md object-contain"})}):s.media_expired?t.jsx("span",{className:"text-xs text-ink-2",title:`Foto & tanda tangan presensi hanya disimpan ${r} hari`,children:"Bukti kedaluwarsa"}):t.jsx("span",{className:"text-ink-3",children:"–"})}function je({url:s,label:d,expired:r=!1,onOpen:u}){const[f,g]=h.useState(!1),{mediaRetentionDays:x=30}=Nt().props;if(!s||f){const l=f?"File hilang":r?`Lewat ${x} hari`:"Tidak ada";return t.jsxs("span",{className:"flex h-12 w-12 flex-col items-center justify-center rounded-md border border-dashed border-line-strong text-center text-xs leading-tight text-ink-2",title:`Foto ${d.toLowerCase()}: ${l.toLowerCase()}`,children:[f||r?t.jsx(ae,{className:"h-4 w-4","aria-hidden":"true"}):d,t.jsxs("span",{className:"sr-only",children:["Foto ",d.toLowerCase(),": ",l]})]})}return t.jsxs("button",{type:"button",onClick:u,"aria-label":`Lihat foto wajah ${d.toLowerCase()}`,className:"relative overflow-hidden rounded-md border border-line",children:[t.jsx("img",{src:s,alt:"",loading:"lazy",onError:()=>g(!0),className:"h-12 w-12 bg-surface-2 object-cover"}),t.jsx("span",{className:"absolute inset-x-0 bottom-0 bg-black/60 text-center text-xs font-medium leading-4 text-white","aria-hidden":"true",children:d})]})}function Tt({icon:s,label:d,onClick:r,danger:u=!1}){return t.jsx("button",{type:"button",onClick:r,"aria-label":d,title:d,className:H("inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors",u?"text-ink-2 hover:bg-danger-soft hover:text-danger":"text-ink-2 hover:bg-surface-2 hover:text-ink"),children:t.jsx(s,{className:"h-4 w-4","aria-hidden":"true"})})}function at({label:s,children:d}){return t.jsxs("div",{children:[t.jsx("dt",{className:"text-ink-2",children:s}),t.jsx("dd",{className:"mt-0.5 font-medium text-ink",children:d})]})}const D=s=>String(s??"").replace(/[&<>"']/g,d=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[d]);function we({workcode:s,attendances:d,period:r=null,kepalaSekolahNama:u,kepalaSekolahNip:f}){const g=window.open("","_blank","width=800,height=900"),x=["pns","pppk","pppk paruh waktu"],l=c=>{const n=x.indexOf((c||"").trim().toLowerCase().replace(/\s+/g," "));return n===-1?x.length:n},N=[...d].sort((c,n)=>l(c.status_pegawai)-l(n.status_pegawai)||c.nama.localeCompare(n.nama,"id",{sensitivity:"base"})).map((c,n)=>`
        <tr>
            <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${n+1}</td>
            <td style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px;">${D(c.nama)}</td>
            <td style="text-align: center; padding: 7px 6px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 10.5px; white-space: nowrap;">${D(c.nis_nip&&c.nis_nip!=="null"?c.nis_nip:"-")}</td>
            <td style="padding: 7px 6px; border: 1px solid #cbd5e1; font-size: 11px; white-space: nowrap;">${D(c.status_pegawai||"-")}</td>
            ${s.kategori==="harian"?`
                    <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${c.total_alpha||"0"}</td>
                    <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${c.total_izin||"0"}</td>
                    <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${c.total_sakit||"0"}</td>
                    <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${c.total_lupa_absen||"0"}</td>
                    <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${c.total_menit_terlambat?c.total_menit_terlambat+" Menit":"0 Menit"}</td>
                `:`
                    <td style="text-align: center; padding: 7px 6px; border: 1px solid #cbd5e1; font-size: 11px; white-space: nowrap;">${c.waktu_hadir}</td>
                    <td style="text-align: center; padding: 7px 6px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px; white-space: nowrap;">${c.status?c.status.replace("_"," ").toUpperCase():"-"}</td>
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
        `,m=s.kategori==="harian"?9:6,k=(c,n={weekday:"long",day:"numeric",month:"long",year:"numeric"})=>new Date(`${String(c).slice(0,10)}T00:00:00`).toLocaleDateString("id-ID",n),S=["","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"];let y="-",b=new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"});if(s.kategori==="harian")if(r?.label)y=r.label;else{const c=[...s.hari_aktif||[]].map(Number).sort((n,o)=>n-o);c.length&&(y=`Setiap ${c.map(n=>S[n]).join(", ")}`)}else{const c=d.map(o=>o.tanggal).filter(Boolean).sort()[0],n=s.tanggal||c;n&&(y=k(n),b=k(n,{day:"numeric",month:"long",year:"numeric"}))}g.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Rekap Presensi - ${D(s.nama_workcode)}</title>
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
                        <td>${D(s.nama_workcode)}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">Kategori Presensi</td>
                        <td>:</td>
                        <td style="text-transform: capitalize;">${s.kategori==="harian"?"Presensi Work From Office":"Presensi Sekali / Event"}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">Tanggal Acara</td>
                        <td>:</td>
                        <td>${y}</td>
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
                    ${N||`<tr><td colspan="${m}" style="text-align:center; padding: 10px;">Belum ada data kehadiran</td></tr>`}
                </tbody>
            </table>

            <div class="ttd-section">
                <div class="ttd-box">
                    <p>Babat, ${b}</p>
                    <p style="margin-bottom: 5px;">Kepala Sekolah,</p>
                    <div class="ttd-qr-wrap" style="display: flex; justify-content: center; margin: 10px 0;">
                        <img src="${window.location.origin}/workcodes/${s.id}/qr-signature?logo=1" style="width: 90px; height: 90px;" alt="QR TTD" />
                    </div>
                    <p style="font-weight: bold; text-decoration: underline; font-size: 13px;">${D(u)}</p>
                    <p style="font-size: 11px; color: #475569; font-family: Arial, sans-serif;">NIP. ${D(f)}</p>
                </div>
            </div>

            <script>
                window.onload = function() {
                    setTimeout(function() { window.focus(); window.print(); }, 600);
                };
            <\/script>
        </body>
        </html>
    `),g.document.close()}async function ye({workcode:s,participantId:d,participantName:r,kepalaSekolahNama:u,kepalaSekolahNip:f}){const g=new Date,x=g.getFullYear(),l=g.getMonth()+1,p=g.toLocaleDateString("id-ID",{month:"long",year:"numeric"}),w=await(await fetch(Bt(`report/individual/${s.id}/${d}?year=${x}&month=${l}`))).json(),m=window.open("","_blank","width=800,height=900"),k=(w.attendances||[]).slice().sort((o,T)=>{const B=o.tanggal||"",A=T.tanggal||"";return B.localeCompare(A)}),S=k.map((o,T)=>{let B="-";if(o.tanggal){const[P,E,_]=o.tanggal.split("-").map(Number);B=new Date(P,E-1,_).toLocaleDateString("id-ID",{weekday:"long",day:"2-digit",month:"long",year:"numeric"})}let A=o.jam_masuk||(o.waktu_hadir!=="-"?o.waktu_hadir:"-"),O=o.jam_pulang||(o.waktu_pulang!=="-"?o.waktu_pulang:"-");o.status==="libur"&&(A="-",O="-");let C=(o.status||"hadir").toUpperCase(),I="#0f172a";return o.status==="hadir"||!o.status?o.is_late?(C="TERLAMBAT",I="#b91c1c"):(C="HADIR",I="#15803d"):o.status==="terlambat"?(C="TERLAMBAT",I="#b91c1c"):o.status==="izin"?(C="IZIN",I="#b45309"):o.status==="sakit"?(C="SAKIT",I="#1d4ed8"):o.status==="alpha"?(C="ALPHA",I="#b91c1c"):o.status==="lupa_absen"&&(C="LUPA ABSEN",I="#475569"),`
            <tr>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${T+1}</td>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${B}</td>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${A}</td>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${O}</td>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px; color: ${I};">${C}</td>
            </tr>
        `}).join(""),y=k.filter(o=>o.status==="alpha").length,b=k.filter(o=>o.status==="izin").length,c=k.filter(o=>o.status==="sakit").length,n=k.filter(o=>o.status==="lupa_absen").length;m.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Rekap Kehadiran - ${D(r)}</title>
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
                        <td style="font-weight: bold;">${D(r)}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">NIP</td>
                        <td>:</td>
                        <td style="font-family: monospace;">${D(w.participant.nis_nip||"-")}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">Status Kepegawaian</td>
                        <td>:</td>
                        <td>${D(w.participant.status||"-")}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">WorkCode</td>
                        <td>:</td>
                        <td>${D(s.nama_workcode)}</td>
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
                        <td style="width: 25%; color: #b91c1c;">${y} Hari</td>
                        <td style="width: 25%; color: #b45309;">${b} Hari</td>
                        <td style="width: 25%; color: #1d4ed8;">${c} Hari</td>
                        <td style="width: 25%; color: #475569;">${n} Hari</td>
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
                    ${S||'<tr><td colspan="5" style="text-align:center; padding: 10px;">Belum ada data kehadiran</td></tr>'}
                </tbody>
            </table>

            <div class="ttd-section">
                <div class="ttd-box">
                    <p>Babat, ${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</p>
                    <p style="margin-bottom: 5px;">Kepala Sekolah,</p>
                    <div class="ttd-qr-wrap" style="display: flex; justify-content: center; margin: 10px 0;">
                        <img src="${window.location.origin}/workcodes/${s.id}/qr-signature?logo=1" style="width: 90px; height: 90px;" alt="QR TTD" />
                    </div>
                    <p style="font-weight: bold; text-decoration: underline; font-size: 13px;">${D(u)}</p>
                    <p style="font-size: 11px; color: #475569; font-family: Arial, sans-serif;">NIP. ${D(f)}</p>
                </div>
            </div>

            <script>
                window.onload = function() {
                    setTimeout(function() { window.focus(); window.print(); }, 600);
                };
            <\/script>
        </body>
        </html>
    `),m.document.close()}const ke=["PNS","PPPK","PPPK Paruh Waktu","GTT","PTT"];function ve(s){const d=new Date,r=Array.from({length:12},(u,f)=>{const g=new Date(d.getFullYear(),d.getMonth()-f,1);return`${g.getFullYear()}-${String(g.getMonth()+1).padStart(2,"0")}`});return s&&!r.includes(s)&&r.push(s),r.map(u=>{const[f,g]=u.split("-").map(Number);return{value:u,label:new Date(f,g-1,1).toLocaleDateString("id-ID",{month:"long",year:"numeric"})}})}function Je({workcodes:s=[],activeWorkcodes:d=[],selectedWorkcodeId:r,selectedWorkcode:u,stats:f,period:g=null,attendances:x=[],participants:l=[],markPresent:p=null,kepalaSekolahNama:N="",kepalaSekolahNip:w=""}){const{flash:m}=Nt().props,{toast:k}=Lt(),S=Et(),[y,b]=h.useState(""),[c,n]=h.useState(""),[o,T]=h.useState(null),[B,A]=h.useState(null),[O,C]=h.useState(!1),[I,P]=h.useState(""),[E,_]=h.useState(!1),[L,rt]=h.useState(null),[ot,dt]=h.useState(!1),[V,G]=h.useState(!1),[ct,st]=h.useState(null),[Q,Z]=h.useState(null),K=Mt({id:null,tanggal:"",jam_masuk:"",jam_pulang:"",status:"hadir"}),q=u?.kategori==="harian",X=u?.kategori==="workcode",pt=O||E||V||o!==null||B!==null||Q!==null;h.useEffect(()=>{if(pt)return;const e=()=>ie({only:["stats","attendances","participants","activeWorkcodes"],preserveScroll:!0,preserveState:!0}),v=window.setInterval(e,se(2e4)),F=()=>document.visibilityState==="visible"&&e();return document.addEventListener("visibilitychange",F),()=>{window.clearInterval(v),document.removeEventListener("visibilitychange",F)}},[pt]),h.useEffect(()=>{m?.success?k.success(m.success):m?.error&&k.error(m.error)},[m]);const bt=h.useMemo(()=>[...new Set([...ke,...x.map(e=>e.status_pegawai).filter(Boolean).sort()])],[x]),W=h.useMemo(()=>{const e=y.trim().toLowerCase();return x.filter(v=>(!e||(v.nama||"").toLowerCase().includes(e)||(v.nis_nip||"").toLowerCase().includes(e))&&(!c||v.status_pegawai===c))},[x,y,c]),R=!!(y||c),tt=h.useMemo(()=>{if(!p)return[];const e=p.eligible_ids?new Set(p.eligible_ids):null;return x.filter(v=>!v.id&&(!e||e.has(v.participant_id)))},[x,p]),a=e=>tt.some(v=>v.participant_id===e.participant_id),i={kepalaSekolahNama:N,kepalaSekolahNip:w},j=async({id:e,nama:v,nis_nip:F,status_pegawai:Ct})=>{if(u){dt(!0),_(!0);try{const ht=await(await fetch(Bt(`report/individual/${u.id}/${e}`))).json();rt({id:e,nama:v||ht.participant.nama,nis_nip:F||ht.participant.nis_nip,status_pegawai:Ct||ht.participant.status,attendances:ht.attendances||[]})}catch{_(!1),k.error("Riwayat presensi gagal dimuat. Periksa koneksi lalu coba lagi.")}finally{dt(!1)}}},z=()=>E&&L&&j(L),M=(e,v)=>{const F=e.waktu_hadir&&e.waktu_hadir!=="-"?String(e.waktu_hadir):"";K.setData({id:e.id,tanggal:e.tanggal||F.match(/^(\d{4}-\d{2}-\d{2})/)?.[1]||new Date().toISOString().split("T")[0],jam_masuk:e.jam_masuk||F.match(/(\d{2}:\d{2})(?::\d{2})?$/)?.[1]||"",jam_pulang:X?"":e.jam_pulang||"",status:e.status||"hadir"}),K.clearErrors(),P(v||e.nama||"Peserta"),C(!0)},mt=e=>{e.preventDefault(),K.put(route("admin.attendances.update",K.data.id),{preserveScroll:!0,onSuccess:()=>{C(!1),K.reset(),z()}})},St=async(e,v,F)=>{await S({title:"Hapus catatan presensi?",message:`Catatan presensi ${v}${F?` tanggal ${F}`:""} dihapus, termasuk status hadir, izin, atau alpha di hari itu.`,confirmText:"Hapus catatan"})&&nt.delete(route("admin.attendances.destroy",e),{preserveScroll:!0,onSuccess:z})},$t=e=>{st(l.find(v=>v.id===e.participant_id)||{id:e.participant_id,nama:e.nama,nis_nip:e.nis_nip,status:e.status_pegawai}),G(!0)},Jt=async e=>{try{await ye({workcode:u,participantId:e.participant_id,participantName:e.nama,...i})}catch{k.error("Rekap individu gagal dimuat. Periksa koneksi lalu coba lagi.")}},Ut=e=>e.nis_nip&&e.nis_nip!=="-"?e.nis_nip:null,ut=e=>t.jsxs("div",{className:"min-w-0",children:[t.jsx("p",{className:"font-medium text-ink",children:e.nama}),t.jsxs("p",{className:"text-xs tabular-nums text-ink-2",children:[Ut(e)??"Tanpa NIP",e.status_pegawai?` · ${e.status_pegawai}`:""]})]}),J=(e,v)=>t.jsx("span",{className:e>0?`font-semibold tabular-nums ${v}`:"tabular-nums text-ink-3",children:e||0}),qt=[{key:"nama",header:"Peserta",cell:ut},{key:"alpha",header:"Alpha",align:"right",cell:e=>J(e.total_alpha,"text-status-alpha")},{key:"izin",header:"Izin",align:"right",hideBelow:"md",cell:e=>J(e.total_izin,"text-ink")},{key:"sakit",header:"Sakit",align:"right",hideBelow:"md",cell:e=>J(e.total_sakit,"text-ink")},{key:"lupa",header:"Lupa absen",align:"right",hideBelow:"lg",cell:e=>J(e.total_lupa_absen,"text-ink")},{key:"telat",header:"Terlambat",align:"right",cell:e=>e.total_menit_terlambat?t.jsxs("span",{className:"font-semibold tabular-nums text-status-telat",children:[e.total_menit_terlambat," mnt"]}):t.jsx("span",{className:"tabular-nums text-ink-3",children:"0"})},{key:"buka",header:t.jsx("span",{className:"sr-only",children:"Pilihan"}),align:"right",cell:e=>t.jsx(Y,{icon:Rt,size:"sm",label:`Pilihan untuk ${e.nama}`,onClick:()=>A(e)})}],Yt=[{key:"nama",header:"Peserta",cell:ut},{key:"waktu",header:"Waktu hadir",cell:e=>t.jsx("span",{className:"tabular-nums",children:e.status==="libur"||e.waktu_hadir==="-"?"–":e.waktu_hadir})},{key:"status",header:"Status",cell:e=>t.jsx(ft,{status:e.status})},{key:"metode",header:"Metode",hideBelow:"lg",className:"text-ink-2",cell:e=>e.attendance_method||"–"},{key:"bukti",header:"Bukti",hideBelow:"md",cell:e=>t.jsx(zt,{attendance:e,onOpen:()=>T(e)})},{key:"aksi",header:t.jsx("span",{className:"sr-only",children:"Aksi"}),align:"right",cell:e=>t.jsxs("div",{className:"flex justify-end gap-1",children:[a(e)?t.jsx(Y,{icon:jt,size:"sm",label:`Tandai ${e.nama} hadir`,onClick:()=>Z([e.participant_id])}):t.jsx(Y,{icon:vt,size:"sm",label:`Ubah presensi ${e.nama}`,onClick:()=>M(e,e.nama),disabled:!e.id}),t.jsx(Y,{icon:_t,size:"sm",label:`Hapus presensi ${e.nama}`,onClick:()=>St(e.id,e.nama,e.waktu_hadir),disabled:!e.id,className:"hover:bg-danger-soft hover:text-danger"})]})}];return t.jsxs(Wt,{children:[t.jsx(Zt,{title:"Laporan"}),t.jsxs("div",{className:"mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6",children:[t.jsx(ne,{title:"Laporan",description:d.length>1?`${d.length} workcode aktif bersamaan: ${d.map(e=>e.nama_workcode).join(" · ")}`:"Rekap kehadiran per workcode, lengkap dengan bukti presensi.",actions:r&&t.jsxs(t.Fragment,{children:[tt.length>0&&t.jsxs($,{icon:jt,onClick:()=>Z([]),children:["Tandai hadir (",tt.length,")"]}),t.jsx($,{icon:pe,href:route("workcodes.export",{workcode:r,...g?{bulan:g.month}:{}}),external:!0,children:"Ekspor Excel"}),t.jsxs($,{variant:"primary",icon:Ot,onClick:()=>we({workcode:u,attendances:W,period:g,...i}),children:["Cetak",R?` (${W.length})`:""]})]})}),s.length===0?t.jsx(le,{children:t.jsx(At,{icon:te,title:"Belum ada workcode",description:"Laporan tersedia setelah ada workcode dan presensi yang tercatat.",action:t.jsx($,{variant:"primary",href:route("workcodes.index"),children:"Atur workcode"})})}):t.jsx(re,{flush:!0,children:t.jsx(oe,{caption:q?"Rekap presensi Work From Office per peserta":"Daftar kehadiran",rows:W,rowKey:e=>e.participant_id??e.id,filtered:R,onClearFilters:()=>{b(""),n("")},empty:t.jsx(At,{title:"Belum ada data kehadiran",description:"Presensi di workcode ini akan muncul di sini."}),toolbar:t.jsxs("div",{className:"space-y-3 px-5 py-4",children:[t.jsxs("div",{className:"flex flex-col gap-3 md:flex-row md:items-end md:justify-between",children:[t.jsxs("div",{className:"min-w-0",children:[t.jsx("label",{htmlFor:"report-workcode",className:"mb-1.5 block text-sm font-medium text-ink",children:"Workcode"}),t.jsxs(gt,{id:"report-workcode",value:r||"",onChange:e=>nt.get(route("report"),{workcode_id:e.target.value},{preserveState:!0,preserveScroll:!0}),className:"md:w-80",children:[s.filter(e=>!e.archived_at).map(e=>t.jsxs("option",{value:e.id,children:[e.is_active?"● ":"",e.nama_workcode," (",e.attendances_count," hadir)"]},e.id)),s.some(e=>e.archived_at)&&t.jsx("optgroup",{label:"Arsip",children:s.filter(e=>e.archived_at).map(e=>t.jsxs("option",{value:e.id,children:[e.nama_workcode," (",e.attendances_count," hadir)"]},e.id))})]})]}),X&&f&&t.jsx(de,{compact:!0,counts:{hadir:f.hadir,izin:f.izin??0,belum:f.belum},className:"md:w-72"}),q&&g&&t.jsxs("div",{className:"md:text-right",children:[t.jsx("label",{htmlFor:"report-month",className:"mb-1.5 block text-sm font-medium text-ink",children:"Bulan rekap"}),t.jsx(gt,{id:"report-month",value:g.month,onChange:e=>nt.get(route("report"),{workcode_id:r,bulan:e.target.value},{preserveState:!0,preserveScroll:!0}),className:"md:w-56",children:ve(g.month).map(e=>t.jsx("option",{value:e.value,children:e.label},e.value))})]})]}),t.jsxs("div",{className:"flex flex-col gap-2 sm:flex-row",children:[t.jsx(Ft,{value:y,onChange:b,label:"Cari peserta",placeholder:"Cari nama atau NIP…",className:"sm:flex-1"}),t.jsxs(gt,{value:c,onChange:e=>n(e.target.value),"aria-label":"Filter status pegawai",className:"sm:w-52",children:[t.jsx("option",{value:"",children:"Semua status pegawai"}),bt.map(e=>t.jsx("option",{value:e,children:e},e))]})]}),t.jsxs("p",{className:"text-sm text-ink-2","aria-live":"polite",children:[R?`${W.length} dari ${x.length} baris cocok dengan filter`:`${x.length} baris`,q&&" · alpha, izin, sakit, lupa absen, dan total menit terlambat per peserta"]})]}),mobileCard:e=>q?t.jsxs("button",{type:"button",onClick:()=>A(e),className:"w-full text-left",children:[ut(e),t.jsxs("p",{className:"mt-1.5 flex flex-wrap gap-x-3 text-sm text-ink-2",children:[t.jsxs("span",{children:["Alpha ",J(e.total_alpha,"text-status-alpha")]}),t.jsxs("span",{children:["Izin ",J(e.total_izin,"text-ink")]}),t.jsxs("span",{children:["Sakit ",J(e.total_sakit,"text-ink")]}),t.jsxs("span",{children:["Telat ",J(e.total_menit_terlambat,"text-status-telat")," mnt"]})]})]}):t.jsxs("div",{className:"space-y-2",children:[ut(e),t.jsxs("div",{className:"flex items-center justify-between gap-3",children:[t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsx("span",{className:"text-sm font-semibold tabular-nums text-ink",children:e.status==="libur"||e.waktu_hadir==="-"?"–":e.waktu_hadir}),t.jsx(ft,{status:e.status})]}),t.jsx(zt,{attendance:e,onOpen:()=>T(e)})]}),e.id&&t.jsx($,{size:"sm",variant:"ghost",icon:vt,onClick:()=>M(e,e.nama),className:"-ml-3",children:"Ubah presensi"}),a(e)&&t.jsx($,{size:"sm",variant:"ghost",icon:jt,onClick:()=>Z([e.participant_id]),className:"-ml-3",children:"Tandai hadir"})]}),columns:q?qt:Yt})})]}),t.jsx(he,{attendance:o,workcode:u,onClose:()=>T(null)}),t.jsx(xe,{attendance:B,onClose:()=>A(null),onCalendar:e=>{A(null),$t(e)},onLogs:e=>{A(null),j({id:e.participant_id,nama:e.nama,nis_nip:e.nis_nip,status_pegawai:e.status_pegawai})},onPrint:e=>{A(null),Jt(e)}}),t.jsx(ge,{open:O,onClose:()=>C(!1),form:K,participantName:I,singleAttendance:X,onSubmit:mt}),p&&t.jsx(fe,{open:Q!==null,onClose:()=>Z(null),workcodeId:r,candidates:tt,initialSelected:Q,tanggal:p.tanggal,defaultJam:p.jam}),t.jsx(be,{open:E,onClose:()=>_(!1),participant:L,loading:ot,onOpenCalendar:()=>{_(!1),$t({participant_id:L.id,...L})},onEdit:e=>M(e,L?.nama),onDelete:(e,v)=>St(e.id,L?.nama,v)}),t.jsx(ue,{show:V,onClose:()=>{G(!1),st(null),nt.reload({only:["stats","attendances"],preserveScroll:!0,preserveState:!0})},workcode:u,participants:l,initialParticipant:ct,onAttendanceChanged:()=>nt.reload({only:["stats","attendances"],preserveScroll:!0,preserveState:!0})})]})}export{Je as default};
