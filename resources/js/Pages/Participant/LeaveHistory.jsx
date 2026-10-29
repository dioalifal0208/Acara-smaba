import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button, Card, EmptyState, PageHeader, StatusPill } from '@/ui';
import { Head } from '@inertiajs/react';
import { FileClock, FilePlus2 } from 'lucide-react';

const formatLabel = (value) => (value || '–').replaceAll('_', ' ').replace(/^\w/, (letter) => letter.toUpperCase());

export default function LeaveHistory({ leaveRequests }) {
    return (
        <AuthenticatedLayout>
            <Head title="Riwayat izin" />

            <div className="space-y-6">
                <PageHeader title="Riwayat izin" description="Izin baru berlaku setelah disetujui admin." />

                {leaveRequests.length === 0 ? (
                    <Card>
                        <EmptyState icon={FileClock} title="Belum ada pengajuan izin" description="Ajukan izin dari beranda bila Anda berhalangan hadir." />
                    </Card>
                ) : (
                    <ul className="space-y-3">
                        {leaveRequests.map((request) => (
                            <li key={request.id}>
                                <Card className="p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-ink">{formatLabel(request.jenis_izin)}</p>
                                            <p className="mt-0.5 text-sm text-ink-2">
                                                {request.tanggal}{request.tanggal_selesai ? ` s.d. ${request.tanggal_selesai}` : ''} · {request.workcode_name}
                                            </p>
                                        </div>
                                        <StatusPill status={request.status_approval || 'pending'} />
                                    </div>
                                    <p className="mt-3 text-sm leading-relaxed text-ink">{request.keterangan}</p>
                                    {request.status_approval === 'rejected' && request.alasan_penolakan && (
                                        <div className="mt-3 rounded-xl bg-status-alpha-soft p-3">
                                            <p className="text-sm font-medium text-status-alpha">Alasan ditolak</p>
                                            <p className="mt-0.5 text-sm text-ink">{request.alasan_penolakan}</p>
                                            <p className="mt-1 text-sm text-ink-2">Perbaiki sesuai alasan ini, lalu ajukan lagi.</p>
                                            <Button size="sm" variant="primary" icon={FilePlus2} href={route('participant.dashboard', { izin: 1 })} className="mt-3">Ajukan lagi</Button>
                                        </div>
                                    )}
                                    <p className="mt-3 text-xs text-ink-2">{formatLabel(request.tipe_izin)} · diajukan {request.created_at}</p>
                                </Card>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
