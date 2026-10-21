// Menu admin dipakai bersama oleh sidebar (AuthenticatedLayout) dan dashboard.

const svg = (paths) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        {paths.map((d) => <path key={d} d={d} />)}
    </svg>
);

export const icons = {
    dashboard: svg(['M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z']),
    camera: svg(['M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z', 'M15 13a3 3 0 11-6 0 3 3 0 016 0z']),
    qr: svg(['M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z']),
    users: svg(['M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z']),
    calendar: svg(['M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z']),
    chart: svg(['M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z']),
    document: svg(['M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z']),
    phone: svg(['M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z']),
    gpsOff: svg(['M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', 'M4 4l16 16']),
    user: svg(['M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z']),
    pen: svg(['M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z']),
    logout: svg(['M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1']),
    menu: svg(['M4 6h16M4 12h16M4 18h16']),
    bolt: svg(['M13 10V3L4 14h7v7l9-11h-7z']),
    close: svg(['M6 18L18 6M6 6l12 12']),
    clock: svg(['M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z']),
    check: svg(['M5 13l4 4L19 7']),
    chevron: svg(['M9 5l7 7-7 7']),
};

/** Menu utama. `badge` adalah nama prop halaman yang berisi jumlah item menunggu (bila tersedia). */
export const adminMenu = [
    { route: 'dashboard', match: 'dashboard', label: 'Dashboard', icon: icons.dashboard },
    { route: 'scanner', match: 'scanner', label: 'Scanner', desc: 'Presensi QR & wajah', icon: icons.camera },
    { route: 'participants.index', match: 'participants.*', label: 'Data Peserta', desc: 'Kelola & cetak QR', icon: icons.users },
    { route: 'workcodes.index', match: 'workcodes.*', label: 'Workcode', desc: 'Jadwal presensi', icon: icons.calendar },
    { route: 'report', match: 'report*', label: 'Laporan', desc: 'Rekap & ekspor', icon: icons.chart },
    { route: 'admin.master-qr', match: 'admin.master-qr', label: 'Master QR', desc: 'Self check-in', icon: icons.qr },
    { route: 'admin.leave.index', match: 'admin.leave.*', label: 'Perizinan', desc: 'Riwayat & verifikasi', icon: icons.document, badge: 'pendingLeaveCount' },
    { route: 'admin.devices.index', match: 'admin.devices.*', label: 'Perangkat', desc: 'Pindah HP peserta', icon: icons.phone, badge: 'pendingDeviceCount' },
    { route: 'admin.fake-gps.index', match: 'admin.fake-gps.*', label: 'Fake GPS', desc: 'Catatan lokasi palsu', icon: icons.gpsOff, badge: 'fakeGpsBlockedToday' },
];

export const accountMenu = [
    { route: 'profile.edit', match: 'profile.*', label: 'Profil', icon: icons.user },
    { route: 'admin.settings', match: 'admin.settings', label: 'Pengaturan TTD', icon: icons.pen },
];

export function currentMenuLabel() {
    const found = [...adminMenu, ...accountMenu].find((item) => route().current(item.match));
    return found?.label ?? 'Dashboard';
}
