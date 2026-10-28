import{f as At,c as Dt,u as Pt,r as d,l as it,j as t,D as Y,o as Bt,I as X,X as Ft,g as R,B as P,p as Rt,h as kt,F as mt,e as gt,S as wt,q as zt,d as Ht,H as Ot,b as ut,i as Kt}from"./app-CJlT8Tf6.js";import{a as Q,S as Jt,A as Ut,d as qt}from"./AuthenticatedLayout-KR8dg-ws.js";import{C as Yt}from"./chevron-left-D8lCyLRI.js";import{C as Tt}from"./chevron-right-V56Ar9lp.js";import{T as Nt}from"./trash-2-SE-dH3_B.js";import{C as It}from"./calendar-days-CRtDj5SS.js";import{P as Lt,I as Vt}from"./printer-Cw3X5eyX.js";import{P as yt}from"./pencil-BHDqg6WZ.js";import{j as Gt,b as Qt}from"./backgroundReload-BhPZ08HF.js";import{P as Zt,C as Xt,E as _t,S as Wt}from"./Layout-CkpDj1oc.js";import{D as te}from"./DataTable-DOE7inTX.js";import{A as ee}from"./AttendanceBoard-BAlGjWg_.js";import"./calendar-clock-D3FwxFTD.js";import"./qr-code-Dr-onvYo.js";import"./smartphone-NAIgA5My.js";import"./hourglass-CSsZUUDV.js";import"./clock-CnH_hGiJ.js";const ae=At("ClipboardList",[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"M12 11h4",key:"1jrz19"}],["path",{d:"M12 16h4",key:"n85exb"}],["path",{d:"M8 11h.01",key:"1dfujw"}],["path",{d:"M8 16h.01",key:"18s6g9"}]]);const se=At("FileDown",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M12 18v-6",key:"17g6i2"}],["path",{d:"m9 15 3 3 3-3",key:"1npd3o"}]]),St=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"],ne=["Sen","Sel","Rab","Kam","Jum","Sab","Min"],ft={hadir:"bg-status-hadir-soft text-status-hadir",izin:"bg-status-izin-soft text-status-izin",sakit:"bg-status-izin-soft text-status-izin",alpha:"bg-status-alpha-soft text-status-alpha",lupa_absen:"bg-status-telat-soft text-status-telat",libur:"bg-surface-2 text-ink-2"},bt=["hadir","izin","sakit","lupa_absen","alpha","libur"],jt=s=>String(s).padStart(2,"0");function ie({show:s=!1,onClose:l=()=>{},workcode:i=null,participants:c=[],initialParticipant:j=null,onAttendanceChanged:w=()=>{}}){const{toast:h}=Dt(),x=Pt(),[p,_]=d.useState(null),[b,u]=d.useState(""),[$,N]=d.useState(!1),k=new Date,[g,o]=d.useState(k.getFullYear()),[m,r]=d.useState(k.getMonth()),[L,A]=d.useState([]),[M,B]=d.useState(!1),[D,z]=d.useState({});d.useEffect(()=>{it.get("/api/holidays").then(a=>z(a.data||{})).catch(()=>{})},[]);const[S,T]=d.useState(null),[y,V]=d.useState({id:null,workcode_id:i?.id||"",participant_id:"",tanggal:"",jam_masuk:"07:00",jam_pulang:"15:30",status:"hadir"}),[lt,W]=d.useState(!1),[rt,G]=d.useState({});d.useEffect(()=>{s&&(j?(_(j),u("")):c.length>0&&!p&&_(c[0]))},[s,j]);const tt=async a=>{if(!(!i||!a)){B(!0);try{const n=await it.get(`/report/individual/${i.id}/${a}`);A(n.data.attendances||[])}catch{h.error("Data presensi gagal dimuat. Periksa koneksi lalu coba lagi.")}finally{B(!1)}}};d.useEffect(()=>{s&&p&&i&&tt(p.id)},[s,p?.id,i?.id]);const et=d.useMemo(()=>{const a=b.trim().toLowerCase();return a?c.filter(n=>(n.nama||"").toLowerCase().includes(a)||(n.nis_nip||"").toLowerCase().includes(a)):c},[c,b]),F=d.useMemo(()=>Object.fromEntries(L.filter(a=>a.tanggal).map(a=>[a.tanggal,a])),[L]),J=a=>{const n=new Date(g,m+a,1);o(n.getFullYear()),r(n.getMonth())},at=()=>{o(k.getFullYear()),r(k.getMonth())},ot=d.useMemo(()=>{const a=(new Date(g,m,1).getDay()+6)%7,n=new Date(g,m+1,0).getDate(),f=Array.from({length:a},(I,O)=>({key:`pad-${O}`,empty:!0}));for(let I=1;I<=n;I++){const O=`${g}-${jt(m+1)}-${jt(I)}`,q=new Date(g,m,I).getDay();f.push({key:O,dayNumber:I,dateStr:O,isWeekend:q===0||q===6,holidayName:D[O]||null,isToday:k.getFullYear()===g&&k.getMonth()===m&&k.getDate()===I,attendance:F[O]||null})}return f},[g,m,F,D]),ht=d.useMemo(()=>{const a=`${g}-${jt(m+1)}`,n=Object.fromEntries(bt.map(f=>[f,0]));return L.forEach(f=>{f.tanggal?.startsWith(a)&&n[f.status]!==void 0&&n[f.status]++}),n},[L,g,m]),U=a=>new Date(`${a}T00:00:00`).toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"}),st=a=>{const n=a.attendance;V({id:n?.id??null,workcode_id:i.id,participant_id:p.id,tanggal:a.dateStr,jam_masuk:n?n.jam_masuk||"":"07:00",jam_pulang:n?n.jam_pulang||"":"15:30",status:n?.status||"hadir"}),G({}),T({dateStr:a.dateStr,dateFormatted:U(a.dateStr),existingAttendance:n})},dt=async a=>{a.preventDefault(),W(!0),G({});try{const n=y.id?await it.put(route("admin.attendances.update",y.id),y):await it.post(route("admin.attendances.store"),y);h.success(n.data?.message||(y.id?"Presensi diperbarui.":"Presensi disimpan.")),T(null),await tt(p.id),w()}catch(n){n.response?.data?.errors&&G(n.response.data.errors),h.error(n.response?.data?.message||"Presensi gagal disimpan. Periksa isian lalu coba lagi.")}finally{W(!1)}},ct=async()=>{if(!(!S?.existingAttendance||!await x({title:"Hapus catatan presensi?",message:`Catatan presensi ${p?.nama} pada ${S.dateFormatted} dihapus, dan status hari itu kembali kosong.`,confirmText:"Hapus catatan"})))try{const n=await it.delete(route("admin.attendances.destroy",S.existingAttendance.id));h.success(n.data?.message||"Presensi dihapus."),T(null),await tt(p.id),w()}catch(n){h.error(n.response?.data?.message||"Presensi gagal dihapus. Coba lagi.")}},H=a=>{const n=rt[a];return Array.isArray(n)?n[0]:n},nt=a=>{const n=[U(a.dateStr)];a.holidayName&&n.push(`libur ${a.holidayName}`);const f=a.attendance;return f?(n.push(Q[f.status]?.label??f.status),(f.jam_masuk||f.jam_pulang)&&n.push(`${f.jam_masuk||"–"} sampai ${f.jam_pulang||"–"}`)):n.push("belum ada catatan, tekan untuk menambah"),n.join(", ")};return t.jsxs(Y,{open:s,onClose:l,title:"Kalender presensi",description:i?`${i.nama_workcode} · tekan tanggal untuk menambah, mengubah, atau menghapus presensi`:void 0,size:"4xl",children:[t.jsxs("div",{className:"space-y-4",children:[t.jsxs("div",{className:"flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between",children:[t.jsx("div",{className:"relative lg:w-96",children:p&&!$?t.jsxs("button",{type:"button",onClick:()=>N(!0),className:"flex h-12 w-full items-center gap-3 rounded-lg border border-line-strong bg-surface px-3 text-left hover:bg-surface-2/60","aria-label":`Peserta: ${p.nama}. Ganti peserta`,children:[t.jsxs("span",{className:"min-w-0 flex-1",children:[t.jsx("span",{className:"block truncate text-sm font-medium text-ink",children:p.nama}),t.jsxs("span",{className:"block truncate text-xs tabular-nums text-ink-2",children:[p.nis_nip||"Tanpa NIP"," · ",p.status||"–"]})]}),t.jsx("span",{className:"text-sm font-medium text-accent",children:"Ganti"})]}):t.jsxs(t.Fragment,{children:[t.jsx(Bt,{className:"pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3","aria-hidden":"true"}),t.jsx("input",{type:"text",value:b,onChange:a=>u(a.target.value),placeholder:"Cari nama atau NIP peserta…","aria-label":"Cari peserta",autoFocus:!0,className:"h-12 w-full rounded-lg border border-line-strong bg-surface pl-9 pr-10 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"}),p&&t.jsx(X,{icon:Ft,size:"sm",label:"Batal ganti peserta",onClick:()=>{N(!1),u("")},className:"absolute right-2 top-1/2 -translate-y-1/2"}),t.jsx("ul",{className:"absolute inset-x-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-line bg-surface py-1 shadow-xl",role:"listbox","aria-label":"Peserta",children:et.length===0?t.jsx("li",{className:"px-4 py-3 text-center text-sm text-ink-2",children:"Peserta tidak ditemukan."}):et.map(a=>t.jsx("li",{children:t.jsxs("button",{type:"button",role:"option","aria-selected":p?.id===a.id,onClick:()=>{_(a),u(""),N(!1)},className:R("flex min-h-11 w-full flex-col justify-center px-3 py-1.5 text-left hover:bg-surface-2",p?.id===a.id&&"bg-accent-soft"),children:[t.jsx("span",{className:"text-sm font-medium text-ink",children:a.nama}),t.jsxs("span",{className:"text-xs tabular-nums text-ink-2",children:[a.nis_nip||"Tanpa NIP"," · ",a.status||"–"]})]})},a.id))})]})}),t.jsxs("div",{className:"flex items-center gap-1",children:[t.jsx(X,{icon:Yt,label:"Bulan sebelumnya",onClick:()=>J(-1)}),t.jsxs("h3",{className:"min-w-36 text-center text-base font-semibold tabular-nums text-ink","aria-live":"polite",children:[St[m]," ",g]}),t.jsx(X,{icon:Tt,label:"Bulan berikutnya",onClick:()=>J(1)}),t.jsx(P,{size:"sm",variant:"ghost",onClick:at,className:"ml-1",children:"Bulan ini"})]})]}),t.jsxs("div",{className:"rounded-xl border border-line p-2",children:[t.jsx("div",{className:"mb-1 grid grid-cols-7 gap-1 text-center","aria-hidden":"true",children:ne.map((a,n)=>t.jsx("div",{className:R("py-1 text-xs font-medium",n>=5?"text-status-alpha":"text-ink-2"),children:a},a))}),M?t.jsxs("p",{className:"flex items-center justify-center gap-2 py-20 text-sm text-ink-2",children:[t.jsx(Rt,{className:"h-4 w-4"}),"Memuat presensi…"]}):t.jsx("div",{className:"grid grid-cols-7 gap-1",children:ot.map(a=>{if(a.empty)return t.jsx("div",{"aria-hidden":"true"},a.key);const n=a.attendance,f=n?Q[n.status]:null,I=f?.icon;return t.jsxs("button",{type:"button",onClick:()=>st(a),disabled:!p,"aria-label":nt(a),title:a.holidayName||void 0,className:R("flex min-h-14 flex-col rounded-lg border p-1 text-left transition-colors sm:min-h-20 sm:p-1.5",a.isToday?"border-accent":"border-line hover:border-line-strong",n?ft[n.status]??"bg-surface":"bg-surface hover:bg-surface-2/60"),children:[t.jsx("span",{className:R("flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums",a.isToday?"bg-accent text-accent-ink":a.isWeekend||a.holidayName?"text-status-alpha":"text-ink"),children:a.dayNumber}),a.holidayName&&t.jsx("span",{className:"hidden truncate text-xs text-status-alpha sm:block",children:a.holidayName}),n&&t.jsxs("span",{className:"mt-auto flex items-center gap-1",children:[I&&t.jsx(I,{className:"h-3.5 w-3.5 shrink-0","aria-hidden":"true"}),t.jsx("span",{className:"hidden truncate text-xs font-medium sm:inline",children:f?.label??n.status})]}),n?.status==="hadir"&&(n.jam_masuk||n.jam_pulang)&&t.jsxs("span",{className:"hidden text-xs tabular-nums opacity-90 md:block",children:[n.jam_masuk||"–","–",n.jam_pulang||"–"]})]},a.key)})})]}),t.jsxs("dl",{className:"flex flex-wrap gap-x-5 gap-y-2 text-sm",children:[t.jsxs("dt",{className:"sr-only",children:["Rekap ",St[m]]}),bt.map(a=>{const n=Q[a].icon;return t.jsxs("div",{className:"flex items-center gap-1.5",children:[t.jsx(n,{className:R("h-4 w-4",ft[a].split(" ")[1]),"aria-hidden":"true"}),t.jsx("dt",{className:"text-ink-2",children:Q[a].label}),t.jsx("dd",{className:"font-semibold tabular-nums text-ink",children:ht[a]})]},a)})]})]}),t.jsx(Y,{open:!!S,onClose:()=>T(null),title:S?.existingAttendance?"Ubah presensi":"Tambah presensi",description:S?`${p?.nama} · ${S.dateFormatted}`:void 0,size:"md",footer:t.jsxs(t.Fragment,{children:[S?.existingAttendance&&t.jsx(P,{variant:"ghost",icon:Nt,onClick:ct,disabled:lt,className:"text-danger hover:text-danger sm:mr-auto",children:"Hapus"}),t.jsx(P,{onClick:()=>T(null),children:"Batal"}),t.jsx(P,{variant:"primary",type:"submit",form:"calendar-day",loading:lt,children:S?.existingAttendance?"Simpan perubahan":"Simpan"})]}),children:t.jsxs("form",{id:"calendar-day",onSubmit:dt,className:"space-y-4",children:[t.jsxs("fieldset",{children:[t.jsx("legend",{className:"mb-2 text-sm font-medium text-ink",children:"Status"}),t.jsx("div",{className:"grid grid-cols-2 gap-2 sm:grid-cols-3",role:"radiogroup",children:bt.map(a=>{const n=Q[a].icon,f=y.status===a;return t.jsxs("button",{type:"button",role:"radio","aria-checked":f,onClick:()=>V({...y,status:a}),className:R("flex h-11 items-center gap-2 rounded-lg border px-3 text-sm transition-colors",f?R("border-current font-semibold",ft[a]):"border-line-strong text-ink hover:bg-surface-2"),children:[t.jsx(n,{className:"h-4 w-4 shrink-0","aria-hidden":"true"}),Q[a].label]},a)})}),H("status")&&t.jsx("p",{className:"mt-1.5 text-xs font-medium text-danger",children:H("status")})]}),!["alpha","libur"].includes(y.status)&&t.jsxs("fieldset",{children:[t.jsxs("div",{className:"mb-2 flex items-center justify-between gap-3",children:[t.jsx("legend",{className:"text-sm font-medium text-ink",children:"Jam"}),t.jsx(P,{size:"sm",variant:"ghost",onClick:()=>V({...y,jam_masuk:"07:00",jam_pulang:"15:30"}),className:"-mr-3",children:"Isi jam normal (07:00–15:30)"})]}),t.jsx("div",{className:"grid grid-cols-2 gap-3",children:[["jam_masuk","Datang"],["jam_pulang","Pulang"]].map(([a,n])=>t.jsxs("div",{children:[t.jsx("label",{htmlFor:`cal-${a}`,className:"mb-1.5 block text-sm text-ink-2",children:n}),t.jsx("input",{id:`cal-${a}`,type:"time",value:y[a],onChange:f=>V({...y,[a]:f.target.value}),"aria-invalid":H(a)?!0:void 0,className:"h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm tabular-nums text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"}),H(a)&&t.jsx("p",{className:"mt-1 text-xs font-medium text-danger",children:H(a)})]},a))})]})]})})]})}const le=s=>s?new Intl.DateTimeFormat("id-ID",{day:"numeric",month:"long",year:"numeric"}).format(new Date(`${s}T00:00:00`)):"–";function xt({status:s,late:l=!1}){return s?t.jsx(Jt,{status:s==="hadir"&&l?"terlambat":s}):t.jsx("span",{className:"text-ink-3",children:"–"})}function re({attendance:s,workcode:l,onClose:i}){const c=!!s?.face_capture_url;return t.jsx(Y,{open:!!s,onClose:i,title:"Detail presensi",description:l?.nama_workcode,size:"lg",children:s&&t.jsxs("div",{className:"space-y-4",children:[(s.face_capture_url||s.signature_url)&&t.jsxs("figure",{className:"rounded-xl border border-line bg-surface-2 p-3 text-center",children:[t.jsx("img",{src:s.face_capture_url||s.signature_url,alt:`${c?"Foto presensi wajah":"Tanda tangan"} ${s.nama}`,className:R("mx-auto max-h-56 w-full max-w-md rounded-lg border border-line bg-white",c?"object-cover":"object-contain p-2")}),t.jsx("figcaption",{className:"mt-2 text-xs text-ink-2",children:c?"Foto presensi wajah":"Tanda tangan digital"})]}),t.jsxs("div",{children:[t.jsx("p",{className:"text-base font-semibold text-ink",children:s.nama}),t.jsxs("p",{className:"text-sm tabular-nums text-ink-2",children:[s.nis_nip||"Tanpa NIP"," · ",s.status_pegawai||"–"]})]}),t.jsxs("dl",{className:"grid grid-cols-2 gap-x-4 gap-y-3 text-sm",children:[t.jsx(Z,{label:"Tanggal",children:le(s.tanggal)}),t.jsx(Z,{label:"Status",children:t.jsx(xt,{status:s.status})}),t.jsx(Z,{label:"Waktu hadir",children:s.waktu_hadir!=="-"?`${s.waktu_hadir} WIB`:"–"}),t.jsx(Z,{label:"Waktu pulang",children:s.waktu_pulang&&s.waktu_pulang!=="-"?`${s.waktu_pulang} WIB`:"–"}),t.jsx(Z,{label:"Metode",children:s.attendance_method||"–"}),l?.latitude&&l?.longitude&&t.jsxs(Z,{label:"Radius lokasi",children:[l.radius_meters||100," m"]})]})]})})}function oe({attendance:s,onClose:l,onCalendar:i,onLogs:c,onPrint:j}){const w=[{icon:It,label:"Kalender",desc:"Kalender sebulan, tambah atau ubah presensi",onClick:i},{icon:ae,label:"Log presensi",desc:"Riwayat presensi dan foto wajah hasil scan",onClick:c},{icon:Lt,label:"Cetak rekap",desc:"Rekap individu bulan ini, bertanda tangan",onClick:j}];return t.jsx(Y,{open:!!s,onClose:l,title:s?.nama??"",description:s?`${s.nis_nip||"Tanpa NIP"} · ${s.status_pegawai||"–"}`:void 0,size:"md",children:t.jsx("ul",{className:"divide-y divide-line overflow-hidden rounded-xl border border-line",children:w.map(({icon:h,label:x,desc:p,onClick:_})=>t.jsx("li",{children:t.jsxs("button",{type:"button",onClick:()=>_(s),className:"flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2/60",children:[t.jsx("span",{className:"flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink-2",children:t.jsx(h,{className:"h-5 w-5","aria-hidden":"true"})}),t.jsxs("span",{className:"min-w-0",children:[t.jsx("span",{className:"block text-sm font-medium text-ink",children:x}),t.jsx("span",{className:"block text-sm text-ink-2",children:p})]})]})},x))})})}function de({open:s,onClose:l,form:i,participantName:c,singleAttendance:j,onSubmit:w}){const{data:h,setData:x,errors:p,processing:_}=i;return t.jsx(Y,{open:s,onClose:l,title:"Ubah presensi",description:c,size:"md",footer:t.jsxs(t.Fragment,{children:[t.jsx(P,{onClick:l,children:"Batal"}),t.jsx(P,{variant:"primary",type:"submit",form:"manual-edit",loading:_,children:"Simpan perubahan"})]}),children:t.jsxs("form",{id:"manual-edit",onSubmit:w,className:"space-y-4",children:[t.jsxs("div",{className:"grid gap-4 sm:grid-cols-2",children:[t.jsx(mt,{label:"Tanggal",required:!0,error:p.tanggal,children:t.jsx(gt,{type:"date",value:h.tanggal,onChange:b=>x("tanggal",b.target.value)})}),t.jsx(mt,{label:"Status",required:!0,error:p.status,children:t.jsxs(wt,{value:h.status,onChange:b=>x("status",b.target.value),children:[t.jsx("option",{value:"hadir",children:"Hadir"}),t.jsx("option",{value:"izin",children:"Izin"}),t.jsx("option",{value:"sakit",children:"Sakit"}),t.jsx("option",{value:"lupa_absen",children:"Lupa absen"}),t.jsx("option",{value:"alpha",children:"Alpha"})]})})]}),h.status!=="alpha"&&t.jsxs("div",{className:"grid gap-4 sm:grid-cols-2",children:[t.jsx(mt,{label:j?"Jam presensi":"Jam datang",error:p.jam_masuk,children:t.jsx(gt,{type:"time",value:h.jam_masuk,onChange:b=>x("jam_masuk",b.target.value)})}),!j&&t.jsx(mt,{label:"Jam pulang",error:p.jam_pulang,children:t.jsx(gt,{type:"time",value:h.jam_pulang,onChange:b=>x("jam_pulang",b.target.value)})})]})]})})}function ce({open:s,onClose:l,participant:i,loading:c,onOpenCalendar:j,onEdit:w,onDelete:h}){const[x,p]=d.useState(null),_=i?.attendances??[],b=()=>{p(null),l()};return t.jsxs(Y,{open:s,onClose:b,title:i?`Log presensi ${i.nama}`:"Log presensi",description:i?`${i.nis_nip||"Tanpa NIP"} · ${i.status_pegawai||"–"}`:void 0,size:"4xl",footer:t.jsxs(t.Fragment,{children:[t.jsx(P,{icon:It,onClick:j,className:"sm:mr-auto",children:"Buka kalender"}),t.jsx(P,{variant:"primary",onClick:b,children:"Tutup"})]}),children:[c?t.jsx("p",{className:"py-12 text-center text-sm text-ink-2",children:"Memuat riwayat presensi…"}):_.length===0?t.jsx("p",{className:"py-12 text-center text-sm text-ink-2",children:"Belum ada catatan presensi. Tambahkan lewat kalender."}):t.jsx("div",{className:"overflow-x-auto rounded-xl border border-line",children:t.jsxs("table",{className:"w-full text-left text-sm",children:[t.jsx("thead",{className:"bg-surface-2/60 text-xs text-ink-2",children:t.jsxs("tr",{children:[t.jsx("th",{scope:"col",className:"px-4 py-2.5 font-medium",children:"Tanggal"}),t.jsx("th",{scope:"col",className:"px-4 py-2.5 font-medium",children:"Datang"}),t.jsx("th",{scope:"col",className:"px-4 py-2.5 font-medium",children:"Pulang"}),t.jsx("th",{scope:"col",className:"px-4 py-2.5 font-medium",children:"Status"}),t.jsx("th",{scope:"col",className:"px-4 py-2.5 font-medium",children:"Foto wajah"}),t.jsx("th",{scope:"col",className:"px-4 py-2.5 text-right font-medium",children:t.jsx("span",{className:"sr-only",children:"Aksi"})})]})}),t.jsx("tbody",{className:"divide-y divide-line",children:_.map((u,$)=>{const N=u.tanggal_formatted||u.tanggal||"–",k=(g,o)=>u.status==="libur"?"–":g||(o&&o!=="-"?o:"–");return t.jsxs("tr",{children:[t.jsx("td",{className:"whitespace-nowrap px-4 py-2.5 font-medium text-ink",children:N}),t.jsx("td",{className:"px-4 py-2.5 tabular-nums text-ink",children:k(u.jam_masuk,u.waktu_hadir)}),t.jsx("td",{className:"px-4 py-2.5 tabular-nums text-ink",children:k(u.jam_pulang,u.waktu_pulang)}),t.jsx("td",{className:"px-4 py-2.5",children:t.jsx(xt,{status:u.status,late:u.is_late})}),t.jsx("td",{className:"px-4 py-2",children:t.jsx("div",{className:"flex gap-1.5",children:[{url:u.face_capture_url,label:"Datang",time:u.jam_masuk},{url:u.face_capture_pulang_url,label:"Pulang",time:u.jam_pulang}].map(g=>t.jsx(pe,{...g,expired:u.media_expired,onOpen:()=>p({...g,tanggal:N})},g.label))})}),t.jsx("td",{className:"px-4 py-2",children:t.jsxs("div",{className:"flex justify-end gap-1",children:[t.jsx(Ct,{icon:yt,label:`Ubah presensi ${N}`,onClick:()=>w(u)}),t.jsx(Ct,{icon:Nt,label:`Hapus presensi ${N}`,onClick:()=>h(u,N),danger:!0})]})})]},u.id||$)})})]})}),t.jsx(Y,{open:!!x,onClose:()=>p(null),title:x?`Foto wajah ${x.label.toLowerCase()}`:"",description:x?`${i?.nama??""} · ${x.tanggal}${x.time?` · ${x.time} WIB`:""}`:void 0,size:"sm",children:x&&t.jsx("img",{src:x.url,alt:`Foto wajah ${x.label.toLowerCase()} ${i?.nama??""}`,className:"aspect-[3/4] w-full rounded-lg border border-line bg-surface-2 object-cover"})})]})}function $t({attendance:s,onOpen:l}){const{mediaRetentionDays:i=30}=kt().props,c=s.face_capture_url||s.signature_url;return c?t.jsx("button",{type:"button",onClick:l,"aria-label":`Lihat bukti presensi ${s.nama}`,className:"inline-flex rounded-md border border-line bg-white",children:t.jsx("img",{src:c,alt:"",loading:"lazy",decoding:"async",className:"h-9 w-20 rounded-md object-contain"})}):s.media_expired?t.jsx("span",{className:"text-xs text-ink-2",title:`Foto & tanda tangan presensi hanya disimpan ${i} hari`,children:"Bukti kedaluwarsa"}):t.jsx("span",{className:"text-ink-3",children:"–"})}function pe({url:s,label:l,expired:i=!1,onOpen:c}){const[j,w]=d.useState(!1),{mediaRetentionDays:h=30}=kt().props;if(!s||j){const x=j?"File hilang":i?`Lewat ${h} hari`:"Tidak ada";return t.jsxs("span",{className:"flex h-12 w-12 flex-col items-center justify-center rounded-md border border-dashed border-line-strong text-center text-xs leading-tight text-ink-2",title:`Foto ${l.toLowerCase()}: ${x.toLowerCase()}`,children:[j||i?t.jsx(Vt,{className:"h-4 w-4","aria-hidden":"true"}):l,t.jsxs("span",{className:"sr-only",children:["Foto ",l.toLowerCase(),": ",x]})]})}return t.jsxs("button",{type:"button",onClick:c,"aria-label":`Lihat foto wajah ${l.toLowerCase()}`,className:"relative overflow-hidden rounded-md border border-line",children:[t.jsx("img",{src:s,alt:"",loading:"lazy",onError:()=>w(!0),className:"h-12 w-12 bg-surface-2 object-cover"}),t.jsx("span",{className:"absolute inset-x-0 bottom-0 bg-black/60 text-center text-xs font-medium leading-4 text-white","aria-hidden":"true",children:l})]})}function Ct({icon:s,label:l,onClick:i,danger:c=!1}){return t.jsx("button",{type:"button",onClick:i,"aria-label":l,title:l,className:R("inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors",c?"text-ink-2 hover:bg-danger-soft hover:text-danger":"text-ink-2 hover:bg-surface-2 hover:text-ink"),children:t.jsx(s,{className:"h-4 w-4","aria-hidden":"true"})})}function Z({label:s,children:l}){return t.jsxs("div",{children:[t.jsx("dt",{className:"text-ink-2",children:s}),t.jsx("dd",{className:"mt-0.5 font-medium text-ink",children:l})]})}const C=s=>String(s??"").replace(/[&<>"']/g,l=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[l]);function me({workcode:s,attendances:l,period:i=null,kepalaSekolahNama:c,kepalaSekolahNip:j}){const w=window.open("","_blank","width=800,height=900"),h=["pns","pppk","pppk paruh waktu"],x=o=>{const m=h.indexOf((o||"").trim().toLowerCase().replace(/\s+/g," "));return m===-1?h.length:m},_=[...l].sort((o,m)=>x(o.status_pegawai)-x(m.status_pegawai)||o.nama.localeCompare(m.nama,"id",{sensitivity:"base"})).map((o,m)=>`
        <tr>
            <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${m+1}</td>
            <td style="padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px;">${C(o.nama)}</td>
            <td style="text-align: center; padding: 7px 6px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 10.5px; white-space: nowrap;">${C(o.nis_nip&&o.nis_nip!=="null"?o.nis_nip:"-")}</td>
            <td style="padding: 7px 6px; border: 1px solid #cbd5e1; font-size: 11px; white-space: nowrap;">${C(o.status_pegawai||"-")}</td>
            ${s.kategori==="harian"?`
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
    `).join(""),b=s.kategori==="harian"?`
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
        `,u=s.kategori==="harian"?9:6,$=(o,m={weekday:"long",day:"numeric",month:"long",year:"numeric"})=>new Date(`${String(o).slice(0,10)}T00:00:00`).toLocaleDateString("id-ID",m),N=["","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"];let k="-",g=new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"});if(s.kategori==="harian")if(i?.label)k=i.label;else{const o=[...s.hari_aktif||[]].map(Number).sort((m,r)=>m-r);o.length&&(k=`Setiap ${o.map(m=>N[m]).join(", ")}`)}else{const o=l.map(r=>r.tanggal).filter(Boolean).sort()[0],m=s.tanggal||o;m&&(k=$(m),g=$(m,{day:"numeric",month:"long",year:"numeric"}))}w.document.write(`
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
                        ${b}
                    </tr>
                </thead>
                <tbody>
                    ${_||`<tr><td colspan="${u}" style="text-align:center; padding: 10px;">Belum ada data kehadiran</td></tr>`}
                </tbody>
            </table>

            <div class="ttd-section">
                <div class="ttd-box">
                    <p>Babat, ${g}</p>
                    <p style="margin-bottom: 5px;">Kepala Sekolah,</p>
                    <div class="ttd-qr-wrap" style="display: flex; justify-content: center; margin: 10px 0;">
                        <img src="${window.location.origin}/workcodes/${s.id}/qr-signature?logo=1" style="width: 90px; height: 90px;" alt="QR TTD" />
                    </div>
                    <p style="font-weight: bold; text-decoration: underline; font-size: 13px;">${C(c)}</p>
                    <p style="font-size: 11px; color: #475569; font-family: Arial, sans-serif;">NIP. ${C(j)}</p>
                </div>
            </div>

            <script>
                window.onload = function() {
                    setTimeout(function() { window.focus(); window.print(); }, 600);
                };
            <\/script>
        </body>
        </html>
    `),w.document.close()}async function ue({workcode:s,participantId:l,participantName:i,kepalaSekolahNama:c,kepalaSekolahNip:j}){const w=new Date,h=w.getFullYear(),x=w.getMonth()+1,p=w.toLocaleDateString("id-ID",{month:"long",year:"numeric"}),b=await(await fetch(zt(`report/individual/${s.id}/${l}?year=${h}&month=${x}`))).json(),u=window.open("","_blank","width=800,height=900"),$=(b.attendances||[]).slice().sort((r,L)=>{const A=r.tanggal||"",M=L.tanggal||"";return A.localeCompare(M)}),N=$.map((r,L)=>{let A="-";if(r.tanggal){const[S,T,y]=r.tanggal.split("-").map(Number);A=new Date(S,T-1,y).toLocaleDateString("id-ID",{weekday:"long",day:"2-digit",month:"long",year:"numeric"})}let M=r.jam_masuk||(r.waktu_hadir!=="-"?r.waktu_hadir:"-"),B=r.jam_pulang||(r.waktu_pulang!=="-"?r.waktu_pulang:"-");r.status==="libur"&&(M="-",B="-");let D=(r.status||"hadir").toUpperCase(),z="#0f172a";return r.status==="hadir"||!r.status?r.is_late?(D="TERLAMBAT",z="#b91c1c"):(D="HADIR",z="#15803d"):r.status==="terlambat"?(D="TERLAMBAT",z="#b91c1c"):r.status==="izin"?(D="IZIN",z="#b45309"):r.status==="sakit"?(D="SAKIT",z="#1d4ed8"):r.status==="alpha"?(D="ALPHA",z="#b91c1c"):r.status==="lupa_absen"&&(D="LUPA ABSEN",z="#475569"),`
            <tr>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${L+1}</td>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${A}</td>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${M}</td>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${B}</td>
                <td style="text-align: center; padding: 7px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 11px; color: ${z};">${D}</td>
            </tr>
        `}).join(""),k=$.filter(r=>r.status==="alpha").length,g=$.filter(r=>r.status==="izin").length,o=$.filter(r=>r.status==="sakit").length,m=$.filter(r=>r.status==="lupa_absen").length;u.document.write(`
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
                        <td style="font-family: monospace;">${C(b.participant.nis_nip||"-")}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">Status Kepegawaian</td>
                        <td>:</td>
                        <td>${C(b.participant.status||"-")}</td>
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
                        <td style="width: 25%; color: #b45309;">${g} Hari</td>
                        <td style="width: 25%; color: #1d4ed8;">${o} Hari</td>
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
                    ${N||'<tr><td colspan="5" style="text-align:center; padding: 10px;">Belum ada data kehadiran</td></tr>'}
                </tbody>
            </table>

            <div class="ttd-section">
                <div class="ttd-box">
                    <p>Babat, ${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</p>
                    <p style="margin-bottom: 5px;">Kepala Sekolah,</p>
                    <div class="ttd-qr-wrap" style="display: flex; justify-content: center; margin: 10px 0;">
                        <img src="${window.location.origin}/workcodes/${s.id}/qr-signature?logo=1" style="width: 90px; height: 90px;" alt="QR TTD" />
                    </div>
                    <p style="font-weight: bold; text-decoration: underline; font-size: 13px;">${C(c)}</p>
                    <p style="font-size: 11px; color: #475569; font-family: Arial, sans-serif;">NIP. ${C(j)}</p>
                </div>
            </div>

            <script>
                window.onload = function() {
                    setTimeout(function() { window.focus(); window.print(); }, 600);
                };
            <\/script>
        </body>
        </html>
    `),u.document.close()}const xe=["PNS","PPPK","PPPK Paruh Waktu","GTT","PTT"];function Te({workcodes:s=[],activeWorkcodes:l=[],selectedWorkcodeId:i,selectedWorkcode:c,stats:j,period:w=null,attendances:h=[],participants:x=[],kepalaSekolahNama:p="Muhtarom, S.Pd., M.Si.",kepalaSekolahNip:_="197205172006041015"}){const{flash:b}=kt().props,{toast:u}=Dt(),$=Pt(),[N,k]=d.useState(""),[g,o]=d.useState(""),[m,r]=d.useState(null),[L,A]=d.useState(null),[M,B]=d.useState(!1),[D,z]=d.useState(""),[S,T]=d.useState(!1),[y,V]=d.useState(null),[lt,W]=d.useState(!1),[rt,G]=d.useState(!1),[tt,et]=d.useState(null),F=Ht({id:null,tanggal:"",jam_masuk:"",jam_pulang:"",status:"hadir"}),J=c?.kategori==="harian",at=c?.kategori==="workcode",ot=M||S||rt||m!==null||L!==null;d.useEffect(()=>{if(ot)return;const e=()=>Qt({only:["stats","attendances","participants","activeWorkcodes"],preserveScroll:!0,preserveState:!0}),v=window.setInterval(e,Gt(2e4)),E=()=>document.visibilityState==="visible"&&e();return document.addEventListener("visibilitychange",E),()=>{window.clearInterval(v),document.removeEventListener("visibilitychange",E)}},[ot]),d.useEffect(()=>{b?.success?u.success(b.success):b?.error&&u.error(b.error)},[b]);const ht=d.useMemo(()=>[...new Set([...xe,...h.map(e=>e.status_pegawai).filter(Boolean).sort()])],[h]),U=d.useMemo(()=>{const e=N.trim().toLowerCase();return h.filter(v=>(!e||(v.nama||"").toLowerCase().includes(e)||(v.nis_nip||"").toLowerCase().includes(e))&&(!g||v.status_pegawai===g))},[h,N,g]),st=!!(N||g),dt={kepalaSekolahNama:p,kepalaSekolahNip:_},ct=async({id:e,nama:v,nis_nip:E,status_pegawai:vt})=>{if(c){W(!0),T(!0);try{const pt=await(await fetch(zt(`report/individual/${c.id}/${e}`))).json();V({id:e,nama:v||pt.participant.nama,nis_nip:E||pt.participant.nis_nip,status_pegawai:vt||pt.participant.status,attendances:pt.attendances||[]})}catch{T(!1),u.error("Riwayat presensi gagal dimuat. Periksa koneksi lalu coba lagi.")}finally{W(!1)}}},H=()=>S&&y&&ct(y),nt=(e,v)=>{const E=e.waktu_hadir&&e.waktu_hadir!=="-"?String(e.waktu_hadir):"";F.setData({id:e.id,tanggal:e.tanggal||E.match(/^(\d{4}-\d{2}-\d{2})/)?.[1]||new Date().toISOString().split("T")[0],jam_masuk:e.jam_masuk||E.match(/(\d{2}:\d{2})(?::\d{2})?$/)?.[1]||"",jam_pulang:at?"":e.jam_pulang||"",status:e.status||"hadir"}),F.clearErrors(),z(v||e.nama||"Peserta"),B(!0)},a=e=>{e.preventDefault(),F.put(route("admin.attendances.update",F.data.id),{preserveScroll:!0,onSuccess:()=>{B(!1),F.reset(),H()}})},n=async(e,v,E)=>{await $({title:"Hapus catatan presensi?",message:`Catatan presensi ${v}${E?` tanggal ${E}`:""} dihapus, termasuk status hadir, izin, atau alpha di hari itu.`,confirmText:"Hapus catatan"})&&ut.delete(route("admin.attendances.destroy",e),{preserveScroll:!0,onSuccess:H})},f=e=>{et(x.find(v=>v.id===e.participant_id)||{id:e.participant_id,nama:e.nama,nis_nip:e.nis_nip,status:e.status_pegawai}),G(!0)},I=async e=>{try{await ue({workcode:c,participantId:e.participant_id,participantName:e.nama,...dt})}catch{u.error("Rekap individu gagal dimuat. Periksa koneksi lalu coba lagi.")}},O=e=>e.nis_nip&&e.nis_nip!=="-"?e.nis_nip:null,q=e=>t.jsxs("div",{className:"min-w-0",children:[t.jsx("p",{className:"font-medium text-ink",children:e.nama}),t.jsxs("p",{className:"text-xs tabular-nums text-ink-2",children:[O(e)??"Tanpa NIP",e.status_pegawai?` · ${e.status_pegawai}`:""]})]}),K=(e,v)=>t.jsx("span",{className:e>0?`font-semibold tabular-nums ${v}`:"tabular-nums text-ink-3",children:e||0}),Et=[{key:"nama",header:"Peserta",cell:q},{key:"alpha",header:"Alpha",align:"right",cell:e=>K(e.total_alpha,"text-status-alpha")},{key:"izin",header:"Izin",align:"right",hideBelow:"md",cell:e=>K(e.total_izin,"text-ink")},{key:"sakit",header:"Sakit",align:"right",hideBelow:"md",cell:e=>K(e.total_sakit,"text-ink")},{key:"lupa",header:"Lupa absen",align:"right",hideBelow:"lg",cell:e=>K(e.total_lupa_absen,"text-ink")},{key:"telat",header:"Terlambat",align:"right",cell:e=>e.total_menit_terlambat?t.jsxs("span",{className:"font-semibold tabular-nums text-status-telat",children:[e.total_menit_terlambat," mnt"]}):t.jsx("span",{className:"tabular-nums text-ink-3",children:"0"})},{key:"buka",header:t.jsx("span",{className:"sr-only",children:"Pilihan"}),align:"right",cell:e=>t.jsx(X,{icon:Tt,size:"sm",label:`Pilihan untuk ${e.nama}`,onClick:()=>A(e)})}],Mt=[{key:"nama",header:"Peserta",cell:q},{key:"waktu",header:"Waktu hadir",cell:e=>t.jsx("span",{className:"tabular-nums",children:e.status==="libur"||e.waktu_hadir==="-"?"–":e.waktu_hadir})},{key:"status",header:"Status",cell:e=>t.jsx(xt,{status:e.status})},{key:"metode",header:"Metode",hideBelow:"lg",className:"text-ink-2",cell:e=>e.attendance_method||"–"},{key:"bukti",header:"Bukti",hideBelow:"md",cell:e=>t.jsx($t,{attendance:e,onOpen:()=>r(e)})},{key:"aksi",header:t.jsx("span",{className:"sr-only",children:"Aksi"}),align:"right",cell:e=>t.jsxs("div",{className:"flex justify-end gap-1",children:[t.jsx(X,{icon:yt,size:"sm",label:`Ubah presensi ${e.nama}`,onClick:()=>nt(e,e.nama),disabled:!e.id}),t.jsx(X,{icon:Nt,size:"sm",label:`Hapus presensi ${e.nama}`,onClick:()=>n(e.id,e.nama,e.waktu_hadir),disabled:!e.id,className:"hover:bg-danger-soft hover:text-danger"})]})}];return t.jsxs(Ut,{children:[t.jsx(Ot,{title:"Laporan"}),t.jsxs("div",{className:"mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6",children:[t.jsx(Zt,{title:"Laporan",description:l.length>1?`${l.length} workcode aktif bersamaan: ${l.map(e=>e.nama_workcode).join(" · ")}`:"Rekap kehadiran per workcode, lengkap dengan bukti presensi.",actions:i&&t.jsxs(t.Fragment,{children:[t.jsx(P,{icon:se,href:route("workcodes.export",{workcode:i,...w?{bulan:w.month}:{}}),external:!0,children:"Ekspor Excel"}),t.jsxs(P,{variant:"primary",icon:Lt,onClick:()=>me({workcode:c,attendances:U,period:w,...dt}),children:["Cetak",st?` (${U.length})`:""]})]})}),s.length===0?t.jsx(Xt,{children:t.jsx(_t,{icon:qt,title:"Belum ada workcode",description:"Laporan tersedia setelah ada workcode dan presensi yang tercatat.",action:t.jsx(P,{variant:"primary",href:route("workcodes.index"),children:"Atur workcode"})})}):t.jsx(Wt,{flush:!0,children:t.jsx(te,{caption:J?"Rekap presensi harian per peserta":"Daftar kehadiran",rows:U,rowKey:e=>e.participant_id??e.id,filtered:st,onClearFilters:()=>{k(""),o("")},empty:t.jsx(_t,{title:"Belum ada data kehadiran",description:"Presensi di workcode ini akan muncul di sini."}),toolbar:t.jsxs("div",{className:"space-y-3 px-5 py-4",children:[t.jsxs("div",{className:"flex flex-col gap-3 md:flex-row md:items-end md:justify-between",children:[t.jsxs("div",{className:"min-w-0",children:[t.jsx("label",{htmlFor:"report-workcode",className:"mb-1.5 block text-sm font-medium text-ink",children:"Workcode"}),t.jsx(wt,{id:"report-workcode",value:i||"",onChange:e=>ut.get(route("report"),{workcode_id:e.target.value},{preserveState:!0,preserveScroll:!0}),className:"md:w-80",children:s.map(e=>t.jsxs("option",{value:e.id,children:[e.is_active?"● ":"",e.nama_workcode," (",e.attendances_count," hadir)"]},e.id))})]}),at&&j&&t.jsx(ee,{compact:!0,counts:{hadir:j.hadir,terlambat:0,izin:0,belum:j.belum},className:"md:w-72"}),J&&t.jsx("p",{className:"text-sm text-ink-2 md:text-right",children:"Rekap per peserta: alpha, izin, sakit, lupa absen, dan total menit terlambat."})]}),t.jsxs("div",{className:"flex flex-col gap-2 sm:flex-row",children:[t.jsx(Kt,{value:N,onChange:k,label:"Cari peserta",placeholder:"Cari nama atau NIP…",className:"sm:flex-1"}),t.jsxs(wt,{value:g,onChange:e=>o(e.target.value),"aria-label":"Filter status pegawai",className:"sm:w-52",children:[t.jsx("option",{value:"",children:"Semua status pegawai"}),ht.map(e=>t.jsx("option",{value:e,children:e},e))]})]}),t.jsx("p",{className:"text-sm text-ink-2","aria-live":"polite",children:st?`${U.length} dari ${h.length} baris cocok dengan filter`:`${h.length} baris`})]}),mobileCard:e=>J?t.jsxs("button",{type:"button",onClick:()=>A(e),className:"w-full text-left",children:[q(e),t.jsxs("p",{className:"mt-1.5 flex flex-wrap gap-x-3 text-sm text-ink-2",children:[t.jsxs("span",{children:["Alpha ",K(e.total_alpha,"text-status-alpha")]}),t.jsxs("span",{children:["Izin ",K(e.total_izin,"text-ink")]}),t.jsxs("span",{children:["Sakit ",K(e.total_sakit,"text-ink")]}),t.jsxs("span",{children:["Telat ",K(e.total_menit_terlambat,"text-status-telat")," mnt"]})]})]}):t.jsxs("div",{className:"space-y-2",children:[q(e),t.jsxs("div",{className:"flex items-center justify-between gap-3",children:[t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsx("span",{className:"text-sm font-semibold tabular-nums text-ink",children:e.status==="libur"||e.waktu_hadir==="-"?"–":e.waktu_hadir}),t.jsx(xt,{status:e.status})]}),t.jsx($t,{attendance:e,onOpen:()=>r(e)})]}),e.id&&t.jsx(P,{size:"sm",variant:"ghost",icon:yt,onClick:()=>nt(e,e.nama),className:"-ml-3",children:"Ubah presensi"})]}),columns:J?Et:Mt})})]}),t.jsx(re,{attendance:m,workcode:c,onClose:()=>r(null)}),t.jsx(oe,{attendance:L,onClose:()=>A(null),onCalendar:e=>{A(null),f(e)},onLogs:e=>{A(null),ct({id:e.participant_id,nama:e.nama,nis_nip:e.nis_nip,status_pegawai:e.status_pegawai})},onPrint:e=>{A(null),I(e)}}),t.jsx(de,{open:M,onClose:()=>B(!1),form:F,participantName:D,singleAttendance:at,onSubmit:a}),t.jsx(ce,{open:S,onClose:()=>T(!1),participant:y,loading:lt,onOpenCalendar:()=>{T(!1),f({participant_id:y.id,...y})},onEdit:e=>nt(e,y?.nama),onDelete:(e,v)=>n(e.id,y?.nama,v)}),t.jsx(ie,{show:rt,onClose:()=>{G(!1),et(null),ut.reload({only:["stats","attendances"],preserveScroll:!0,preserveState:!0})},workcode:c,participants:x,initialParticipant:tt,onAttendanceChanged:()=>ut.reload({only:["stats","attendances"],preserveScroll:!0,preserveState:!0})})]})}export{Te as default};
