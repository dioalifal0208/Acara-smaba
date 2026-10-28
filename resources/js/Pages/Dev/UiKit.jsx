import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { FileUp, Plus, RefreshCw, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import {
    AttendanceBoard, Button, Card, Checkbox, DataTable, Dialog, EmptyState, Field, IconButton, Input, PageHeader,
    RowLink, SearchField, Section, Select, Skeleton, STATUS, StatusPill, useConfirm, useToast,
} from '@/ui';

const people = [
    { id: 1, nama: 'Siti Rahmawati', nip: '198503122010012004', status: 'PNS', hadir: 'hadir', waktu: '06:52' },
    { id: 2, nama: 'Ahmad Fauzi', nip: '199001052019031007', status: 'PPPK', hadir: 'terlambat', waktu: '07:18' },
    { id: 3, nama: 'Dewi Lestari', nip: '-', status: 'GTT', hadir: 'izin', waktu: '-' },
    { id: 4, nama: 'Budi Santoso', nip: '198811202014021001', status: 'PNS', hadir: 'belum', waktu: '-' },
];

/**
 * Katalog komponen tampilan baru (hanya lingkungan lokal, rute /_ui). Untuk QA visual: ganti
 * mode terang/gelap lewat pengaturan sistem atau DevTools › Rendering › prefers-color-scheme.
 */
export default function UiKit() {
    const { toast } = useToast();
    const confirm = useConfirm();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState([]);
    const rows = people.filter((p) => p.nama.toLowerCase().includes(query.toLowerCase()));

    return (
        <AuthenticatedLayout>
            <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 sm:px-6">
                <Head title="Katalog UI" />

                <PageHeader
                    title="Katalog UI"
                    description="Komponen dan token tampilan baru E-Presensi SMABA."
                    actions={
                        <>
                            <Button icon={FileUp}>Impor Excel</Button>
                            <Button variant="primary" icon={Plus}>Tambah peserta</Button>
                        </>
                    }
                />

                <AttendanceBoard counts={{ hadir: 182, terlambat: 9, izin: 4, belum: 37 }} hrefFor={() => '#'} />

                <div className="grid gap-4 md:grid-cols-2">
                    <Section title="Tombol" description="Primary hanya untuk satu aksi utama per layar.">
                        <div className="flex flex-wrap items-center gap-2">
                            <Button variant="primary">Simpan</Button>
                            <Button>Batal</Button>
                            <Button variant="ghost">Lainnya</Button>
                            <Button variant="danger" icon={Trash2}>Hapus</Button>
                            <Button variant="primary" loading>Menyimpan</Button>
                            <Button size="sm">Kecil</Button>
                            <IconButton icon={RefreshCw} label="Sinkronkan" />
                        </div>
                    </Section>

                    <Section title="Status" description="Warna, ikon, dan teks sekaligus.">
                        <div className="flex flex-wrap gap-2">
                            {Object.keys(STATUS).map((s) => <StatusPill key={s} status={s} />)}
                        </div>
                    </Section>

                    <Section title="Form">
                        <div className="space-y-4">
                            <Field label="Nama lengkap" required hint="Sesuai data kepegawaian.">
                                <Input placeholder="Contoh: Siti Rahmawati" />
                            </Field>
                            <Field label="NIP" error="NIP ini sudah terdaftar pada Ahmad Fauzi.">
                                <Input defaultValue="199001052019031007" />
                            </Field>
                            <Field label="Status pegawai">
                                <Select defaultValue="">
                                    <option value="">Pilih status</option>
                                    <option>PNS</option>
                                    <option>PPPK</option>
                                </Select>
                            </Field>
                        </div>
                    </Section>

                    <Section title="Umpan balik">
                        <div className="flex flex-wrap gap-2">
                            <Button onClick={() => toast.success('Peserta tersimpan.')}>Toast berhasil</Button>
                            <Button onClick={() => toast.error('Sinkronisasi gagal. Periksa koneksi lalu coba lagi.')}>Toast gagal</Button>
                            <Button onClick={() => setDialogOpen(true)}>Buka dialog</Button>
                            <Button
                                variant="danger"
                                onClick={async () => {
                                    const ok = await confirm({ title: 'Hapus 4 peserta?', message: 'Akun dan riwayat presensi mereka ikut terhapus permanen.', confirmText: 'Hapus 4 peserta' });
                                    toast(ok ? 'Dikonfirmasi.' : 'Dibatalkan.');
                                }}
                            >
                                Konfirmasi hapus
                            </Button>
                        </div>
                        <div className="mt-4 space-y-2">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </Section>
                </div>

                <Section
                    title="Tabel data"
                    description={`${rows.length} dari ${people.length} peserta`}
                    actions={<SearchField value={query} onChange={setQuery} label="Cari peserta" placeholder="Cari nama…" className="w-full sm:w-64" />}
                    flush
                >
                    <DataTable
                        caption="Daftar peserta"
                        rows={rows}
                        filtered={query !== ''}
                        onClearFilters={() => setQuery('')}
                        selection={{ selected, onChange: setSelected, label: (p) => `Pilih ${p.nama}` }}
                        mobileCard={(p) => (
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <RowLink href="#">{p.nama}</RowLink>
                                    <p className="text-sm text-ink-2">{p.nip} · {p.status}</p>
                                </div>
                                <StatusPill status={p.hadir} />
                            </div>
                        )}
                        columns={[
                            { key: 'nama', header: 'Nama', cell: (p) => <RowLink href="#">{p.nama}</RowLink> },
                            { key: 'nip', header: 'NIP', hideBelow: 'md', cell: (p) => <span className="tabular-nums text-ink-2">{p.nip}</span> },
                            { key: 'status', header: 'Status pegawai', hideBelow: 'lg', cell: (p) => p.status },
                            { key: 'waktu', header: 'Masuk', align: 'right', cell: (p) => <span className="tabular-nums">{p.waktu}</span> },
                            { key: 'hadir', header: 'Kehadiran', align: 'right', cell: (p) => <StatusPill status={p.hadir} /> },
                        ]}
                    />
                </Section>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <EmptyState icon={Users} title="Belum ada peserta" description="Tambahkan satu per satu atau impor dari Excel." action={<Button variant="primary" icon={Plus}>Tambah peserta</Button>} />
                    </Card>
                    <Section title="Papan Hadir ringkas" description="Untuk baris workcode.">
                        <div className="space-y-4">
                            <AttendanceBoard compact counts={{ hadir: 40, terlambat: 3, izin: 1, belum: 6 }} />
                            <AttendanceBoard compact counts={{ hadir: 12, terlambat: 0, izin: 0, belum: 30 }} />
                        </div>
                    </Section>
                </div>

                <Dialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    title="Tambah peserta"
                    description="Akun login dibuat otomatis dengan NIP sebagai kata sandi awal."
                    footer={
                        <>
                            <Button onClick={() => setDialogOpen(false)}>Batal</Button>
                            <Button variant="primary" onClick={() => setDialogOpen(false)}>Simpan</Button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <Field label="Nama lengkap" required><Input /></Field>
                        <Field label="NIP" required><Input inputMode="numeric" /></Field>
                    </div>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}
