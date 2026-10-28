import {
    CalendarClock, Camera, FileBarChart, FileCheck, LayoutDashboard, MapPinOff, QrCode, Settings, Smartphone, UserRound, Users,
} from 'lucide-react';

/**
 * Menu admin berkelompok. `badge(props)` mengembalikan jumlah pekerjaan menunggu dari prop
 * bersama `adminNotifications` (selalu tersedia di halaman admin).
 */
const pending = (props, ...types) =>
    (props.adminNotifications?.groups ?? []).filter((g) => types.includes(g.type)).reduce((sum, g) => sum + g.count, 0);

export const adminNavigation = [
    {
        label: 'Hari ini',
        items: [
            { route: 'dashboard', match: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { route: 'scanner', match: 'scanner', label: 'Scanner', icon: Camera },
        ],
    },
    {
        label: 'Data',
        items: [
            { route: 'participants.index', match: 'participants.*', label: 'Data Peserta', icon: Users, badge: (p) => pending(p, 'photo_change', 'face_registration') },
            { route: 'workcodes.index', match: 'workcodes.*', label: 'Workcode', icon: CalendarClock },
            { route: 'report', match: 'report*', label: 'Laporan', icon: FileBarChart },
            { route: 'admin.master-qr', match: 'admin.master-qr', label: 'Master QR', icon: QrCode },
        ],
    },
    {
        label: 'Pengawasan',
        items: [
            { route: 'admin.leave.index', match: 'admin.leave.*', label: 'Perizinan', icon: FileCheck, badge: (p) => pending(p, 'leave') },
            { route: 'admin.devices.index', match: 'admin.devices.*', label: 'Perangkat', icon: Smartphone },
            { route: 'admin.fake-gps.index', match: 'admin.fake-gps.*', label: 'Fake GPS', icon: MapPinOff },
        ],
    },
    {
        label: 'Akun',
        items: [
            { route: 'profile.edit', match: 'profile.*', label: 'Profil', icon: UserRound },
            { route: 'admin.settings', match: 'admin.settings', label: 'Pengaturan', icon: Settings },
        ],
    },
];

/** Item menu untuk halaman yang sedang dibuka (judul tab & bilah atas di HP). */
export function currentNavItem() {
    return adminNavigation.flatMap((group) => group.items).find((item) => route().current(item.match));
}
