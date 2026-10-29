import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ApproveFaceModal from '@/Components/ApproveFaceModal';
import ApprovePhotoChangeRequestModal from '@/Components/ApprovePhotoChangeRequestModal';
import FaceHistoryPanel from '@/Components/FaceHistoryPanel';
import FaceRegistrationModal from '@/Components/FaceRegistrationModal';
import {
    EMPLOYMENT_STATUSES, FaceStatus, ParticipantAvatar, isNonPermanentStatus, nipLabel, formNip, STAFF_ID_HINT,
} from '@/Components/ParticipantBits';
import { Button, Card, Checkbox, Field, Input, Section, Select, useConfirm, useToast } from '@/ui';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, ChevronLeft, Download, Printer, RotateCcw, ScanFace, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const normalizeStatus = (status) => EMPLOYMENT_STATUSES.find((s) => s.toLowerCase() === (status || '').trim().toLowerCase()) ?? (status || '');

export default function ParticipantShow({ participant }) {
    const { props: { flash }, url: pageUrl } = usePage();
    const { toast } = useToast();
    const confirm = useConfirm();
    const [faceRegistrationOpen, setFaceRegistrationOpen] = useState(false);
    const [approveFaceOpen, setApproveFaceOpen] = useState(false);
    const [approvePhotoOpen, setApprovePhotoOpen] = useState(false);
    const [historyKey, setHistoryKey] = useState(0);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        else if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // Tautan dari notifikasi admin: ?review=photo|face langsung membuka dialog verifikasi.
    useEffect(() => {
        const review = new URLSearchParams(pageUrl.split('?')[1] ?? '').get('review');
        if (review === 'photo' && participant.pending_photo_change_request) {
            setApprovePhotoOpen(true);
        } else if (review === 'face' && participant.face_status === 'pending') {
            setApproveFaceOpen(true);
        } else if (review === 'photo' || review === 'face') {
            toast.info(`Pengajuan ${participant.nama} sudah diproses.`);
        }
    }, []);

    const reloadParticipant = () => {
        router.reload({ only: ['participant'] });
        setHistoryKey((key) => key + 1);
    };

    const handleResetQr = async () => {
        const confirmed = await confirm({
            title: 'Buat QR baru?',
            message: `QR lama milik ${participant.nama} tidak berlaku lagi di scanner. Gunakan bila QR diduga dipakai orang lain.`,
            confirmText: 'Buat QR baru',
        });
        if (confirmed) router.post(route('participants.qr.regenerate', participant.id), {}, { preserveScroll: true });
    };

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: `Hapus ${participant.nama}?`,
            message: participant.attendances_count > 0
                ? `Akun login, foto, dan ${participant.attendances_count} data presensinya ikut terhapus permanen dan tidak bisa dikembalikan.`
                : 'Akun login dan fotonya ikut terhapus permanen dan tidak bisa dikembalikan.',
            confirmText: 'Hapus peserta',
            requireText: participant.attendances_count > 0 ? participant.nama : undefined,
        });
        if (confirmed) router.delete(route('participants.destroy', participant.id));
    };

    const pendingPhoto = Boolean(participant.pending_photo_change_request);
    const pendingFace = participant.face_status === 'pending';

    return (
        <AuthenticatedLayout>
            <Head title={`${participant.nama} · Data Peserta`} />

            <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
                <div>
                    <Link href={route('participants.index')} className="-ml-1 inline-flex min-h-8 items-center gap-1 rounded-md pr-2 text-sm text-ink-2 hover:text-ink">
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        Data Peserta
                    </Link>
                    <header className="mt-2 flex items-center gap-4">
                        <ParticipantAvatar participant={participant} size="lg" />
                        <div className="min-w-0">
                            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">{participant.nama}</h1>
                            <p className="mt-0.5 text-sm tabular-nums text-ink-2">
                                {participant.nis_nip}{participant.status ? ` · ${participant.status}` : ''}
                            </p>
                            <FaceStatus participant={participant} className="mt-2" />
                        </div>
                    </header>
                </div>

                {(pendingPhoto || pendingFace) && (
                    <div className="flex flex-col gap-3 rounded-xl border border-status-telat/30 bg-status-telat-soft p-4 sm:flex-row sm:items-center" role="status">
                        <AlertTriangle className="hidden h-5 w-5 shrink-0 text-status-telat sm:block" aria-hidden="true" />
                        <p className="flex-1 text-sm text-ink">
                            {pendingPhoto ? <><span className="font-semibold">Foto wajah baru</span> menunggu verifikasi.</> : <><span className="font-semibold">Pendaftaran wajah</span> menunggu persetujuan.</>}
                        </p>
                        <div className="flex gap-2">
                            {pendingPhoto && <Button size="sm" variant="primary" onClick={() => setApprovePhotoOpen(true)}>Verifikasi foto</Button>}
                            {pendingFace && <Button size="sm" variant="primary" onClick={() => setApproveFaceOpen(true)}>Tinjau wajah</Button>}
                        </div>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6">
                        <Section title="Ringkasan">
                            <dl className="space-y-3 text-sm">
                                <InfoRow label="Total presensi"><span className="tabular-nums">{participant.attendances_count}</span> kali</InfoRow>
                                <InfoRow label="Akun login">{participant.account?.username ?? 'Tidak ada'}</InfoRow>
                                <InfoRow label="Perangkat">{participant.account?.device_model ?? 'Belum terkunci'}</InfoRow>
                                <InfoRow label="Didaftarkan">{participant.created_at}</InfoRow>
                            </dl>
                        </Section>

                        <QrSection participant={participant} onReset={handleResetQr} />
                    </div>

                    <div className="space-y-6 lg:col-span-2">
                        <EditSection participant={participant} />

                        <Section
                            title="Wajah"
                            description="Riwayat wajah yang pernah disetujui, terbaru di atas."
                            actions={!pendingFace && (
                                <Button size="sm" icon={ScanFace} onClick={() => setFaceRegistrationOpen(true)}>
                                    {participant.face_status === 'approved' ? 'Perbarui wajah' : 'Daftarkan wajah'}
                                </Button>
                            )}
                        >
                            <div className="max-h-[420px] overflow-y-auto border-t border-line pt-4">
                                <FaceHistoryPanel participant={participant} reloadKey={historyKey} />
                            </div>
                        </Section>

                        <PasswordSection participant={participant} />

                        <Card as="section" className="border-danger/30 p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-base font-semibold text-ink">Hapus peserta</h2>
                                    <p className="mt-0.5 text-sm text-ink-2">Akun login, foto, dan riwayat presensi ikut terhapus permanen.</p>
                                </div>
                                <Button variant="danger" icon={Trash2} onClick={handleDelete}>Hapus peserta</Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {faceRegistrationOpen && (
                <FaceRegistrationModal
                    participant={participant}
                    onClose={() => setFaceRegistrationOpen(false)}
                    onSuccess={() => {
                        setFaceRegistrationOpen(false);
                        reloadParticipant();
                    }}
                />
            )}

            {approveFaceOpen && (
                <ApproveFaceModal
                    participant={participant}
                    onClose={() => setApproveFaceOpen(false)}
                    onSuccess={() => {
                        setApproveFaceOpen(false);
                        reloadParticipant();
                    }}
                />
            )}

            {approvePhotoOpen && pendingPhoto && (
                <ApprovePhotoChangeRequestModal
                    participant={participant}
                    onClose={() => setApprovePhotoOpen(false)}
                    onSuccess={() => {
                        setApprovePhotoOpen(false);
                        reloadParticipant();
                    }}
                />
            )}
        </AuthenticatedLayout>
    );
}

function QrSection({ participant, onReset }) {
    const qrUrl = `${route('participants.qr', participant.id)}?v=${encodeURIComponent(participant.qr_token ?? '')}`;

    // Jendela cetak terpisah berisi satu kartu QR; tertutup sendiri setelah dialog cetak.
    const handlePrint = () => {
        const escape = (text) => String(text ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
        const printWindow = window.open('', '_blank', 'width=500,height=600');
        printWindow.document.write(`<!DOCTYPE html><html><head><title>QR Code - ${escape(participant.nama)}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: -apple-system, BlinkMacSystemFont, Inter, 'Segoe UI', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                .card { text-align: center; padding: 40px; border: 1px solid #dfe3df; border-radius: 16px; max-width: 400px; }
                h2 { font-size: 20px; color: #1b1f1c; margin-bottom: 4px; }
                p { font-size: 14px; color: #4b544e; margin-bottom: 20px; }
                img { width: 280px; height: 280px; margin: 0 auto 16px; display: block; }
                .school { font-size: 12px; color: #69716b; margin-top: 12px; }
                @media print { .card { border: none; } }
            </style></head><body>
            <div class="card"><h2>${escape(participant.nama)}</h2><p>${escape(participant.nis_nip)}</p>
            <img src="${route('participants.qr', participant.id)}" alt="QR Code" />
            <div class="school">E-Presensi SMABA · SMA Negeri 1 Babat</div></div>
            <script>window.onload = function () { setTimeout(function () { window.close(); }, 1500); window.print(); };<\/script>
            </body></html>`);
        printWindow.document.close();
    };

    return (
        <Section title="QR presensi" description="Dipindai di Scanner admin.">
            {/* QR selalu di atas putih agar tetap terbaca kamera di mode gelap. */}
            <img src={qrUrl} alt={`QR presensi ${participant.nama}`} className="mx-auto h-48 w-48 rounded-lg border border-line bg-white p-2" />
            <div className="mt-4 grid grid-cols-2 gap-2">
                <Button icon={Download} onClick={() => window.open(route('participants.download.svg', participant.id), '_blank')}>Unduh</Button>
                <Button icon={Printer} onClick={handlePrint}>Cetak</Button>
            </div>
            <Button variant="danger-outline" icon={RotateCcw} onClick={onReset} className="mt-2 w-full">
                Buat QR baru
            </Button>
        </Section>
    );
}

function EditSection({ participant }) {
    const savedStatus = normalizeStatus(participant.status);
    const savedNonPermanent = isNonPermanentStatus(savedStatus);
    const form = useForm({
        nama: participant.nama,
        nis_nip: formNip(participant.nis_nip),
        status: savedStatus,
        tanggal_lahir: participant.tanggal_lahir ?? '',
        jenis_kelamin: participant.jenis_kelamin ?? '',
    });
    const nonPermanent = isNonPermanentStatus(form.data.status);

    // Isian NIP mengikuti status: GTT/PTT menampilkan ID tersimpan (atau kosong = dibuat saat disimpan);
    // pegawai tetap memakai NIP tersimpan, atau kosong bila sebelumnya GTT/PTT (ID lama bukan NIP).
    const changeStatus = (status) => {
        let nis_nip = form.data.nis_nip; // pegawai tetap → pegawai tetap: isian tidak berubah
        if (isNonPermanentStatus(status)) {
            nis_nip = savedNonPermanent ? formNip(participant.nis_nip) : '';
        } else if (nonPermanent) {
            nis_nip = savedNonPermanent ? '' : formNip(participant.nis_nip);
        }

        form.setData({ ...form.data, status, nis_nip });
    };

    const submit = (e) => {
        e.preventDefault();
        form.put(route('participants.update', participant.id), { preserveScroll: true, onSuccess: () => form.setDefaults() });
    };

    return (
        <Section title="Data peserta">
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                <Field label="Nama lengkap" required error={form.errors.nama} className="sm:col-span-2">
                    <Input value={form.data.nama} onChange={(e) => form.setData('nama', e.target.value)} autoComplete="off" />
                </Field>
                <Field label="Status pegawai" error={form.errors.status}>
                    <Select value={form.data.status} onChange={(e) => changeStatus(e.target.value)}>
                        <option value="">Pilih status</option>
                        {EMPLOYMENT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                    </Select>
                </Field>
                <Field label={nipLabel(form.data.status)} required={!nonPermanent} error={form.errors.nis_nip} hint={nonPermanent ? STAFF_ID_HINT : undefined}>
                    <Input
                        value={form.data.nis_nip}
                        onChange={(e) => form.setData('nis_nip', e.target.value)}
                        readOnly={nonPermanent}
                        placeholder={nonPermanent ? 'Dibuat otomatis saat disimpan' : undefined}
                        inputMode="numeric"
                        autoComplete="off"
                    />
                </Field>
                {nonPermanent && (
                    <>
                        {/* Bahan ID pengganti NIP untuk GTT/PTT (dibuat server). */}
                        <Field label="Tanggal lahir" required error={form.errors.tanggal_lahir}>
                            <Input type="date" value={form.data.tanggal_lahir} onChange={(e) => form.setData('tanggal_lahir', e.target.value)} />
                        </Field>
                        <Field label="Jenis kelamin" required error={form.errors.jenis_kelamin}>
                            <Select value={form.data.jenis_kelamin} onChange={(e) => form.setData('jenis_kelamin', e.target.value)}>
                                <option value="">Pilih</option>
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                            </Select>
                        </Field>
                    </>
                )}
                <div className="flex justify-end gap-2 sm:col-span-2">
                    <Button disabled={!form.isDirty || form.processing} onClick={() => { form.reset(); form.clearErrors(); }}>Batalkan</Button>
                    <Button variant="primary" type="submit" disabled={!form.isDirty} loading={form.processing}>Simpan perubahan</Button>
                </div>
            </form>
        </Section>
    );
}

// Kata sandi akun login peserta: kembalikan ke NIS/NIP atau atur yang baru (tidak ada reset lewat email).
function PasswordSection({ participant }) {
    const confirm = useConfirm();
    const form = useForm({ mode: 'custom', password: '', password_confirmation: '', logout_sessions: false });

    if (!participant.account) {
        return (
            <Section title="Kata sandi akun">
                <p className="text-sm text-ink-2">
                    {isNonPermanentStatus(participant.status)
                        ? 'Peserta ini belum punya akun login. Lengkapi tanggal lahir dan jenis kelamin di Data peserta, lalu simpan: ID pengganti NIP dan akunnya dibuat otomatis.'
                        : 'Peserta ini tidak punya akun login. Akun dibuat otomatis dari NIP saat data disimpan.'}
                </p>
            </Section>
        );
    }

    const submit = (mode) => form.transform((data) => ({ ...data, mode })).put(route('participants.password.update', participant.id), {
        preserveScroll: true,
        onSuccess: () => form.reset(),
    });

    // GTT/PTT: kata sandi awal = ID pengganti NIP (server memakai nis_nip untuk keduanya).
    const idName = isNonPermanentStatus(participant.status) ? 'ID' : 'NIP';

    const handleReset = async () => {
        const confirmed = await confirm({
            title: `Kembalikan kata sandi ke ${idName}?`,
            message: `Kata sandi akun ${participant.account.username} menjadi ${idName}-nya (${participant.nis_nip}).`,
            type: 'warning',
            confirmText: `Kembalikan ke ${idName}`,
        });
        if (confirmed) submit('reset');
    };

    return (
        <Section
            title="Kata sandi akun"
            description={<>Akun login <span className="font-medium text-ink">{participant.account.username}</span>. Kata sandi tidak bisa dilihat, hanya diganti.</>}
            actions={<Button size="sm" icon={RotateCcw} onClick={handleReset} disabled={form.processing}>Kembalikan ke {idName}</Button>}
        >
            <form onSubmit={(e) => { e.preventDefault(); submit('custom'); }} className="grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
                <Field label="Kata sandi baru" required error={form.errors.password} hint="Minimal 8 karakter.">
                    <Input type="password" autoComplete="new-password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} />
                </Field>
                <Field label="Ulangi kata sandi baru" required>
                    <Input type="password" autoComplete="new-password" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} />
                </Field>
                <Checkbox checked={form.data.logout_sessions} onChange={(e) => form.setData('logout_sessions', e.target.checked)} className="sm:col-span-2">
                    Sekaligus keluarkan dari aplikasi Android dan website, jadi peserta wajib login ulang. Disarankan bila akun diduga dipakai orang lain.
                </Checkbox>
                <div className="flex justify-end sm:col-span-2">
                    <Button variant="primary" type="submit" disabled={!form.data.password} loading={form.processing}>Simpan kata sandi</Button>
                </div>
            </form>
        </Section>
    );
}

function InfoRow({ label, children }) {
    return (
        <div className="flex items-start justify-between gap-3">
            <dt className="shrink-0 text-ink-2">{label}</dt>
            <dd className="min-w-0 text-right font-medium text-ink">{children}</dd>
        </div>
    );
}
