import AdminShell from '@/Layouts/AdminShell';
import ParticipantShell from '@/Layouts/ParticipantShell';
import { usePage } from '@inertiajs/react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;

    return auth.user.is_admin
        ? <AdminShell header={header}>{children}</AdminShell>
        : <ParticipantShell header={header}>{children}</ParticipantShell>;
}
