import { Button, Dialog } from '@/ui';
import { Download } from 'lucide-react';

/** QR presensi pribadi peserta: hanya pemilik/admin yang bisa memuat gambarnya. */
export default function MyQrDialog({ open, onClose, participantId, name }) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            title="QR presensi saya"
            description={name}
            size="sm"
            footer={
                <>
                    <Button onClick={onClose}>Tutup</Button>
                    <Button variant="primary" icon={Download} href={route('participants.download.png', participantId)} external>Unduh</Button>
                </>
            }
        >
            {/* QR selalu di atas putih agar terbaca kamera di mode gelap. */}
            <div className="mx-auto w-fit rounded-xl bg-white p-4">
                <img src={route('participants.qr', participantId)} alt="QR presensi" className="h-52 w-52" />
            </div>
            <p className="mt-4 text-sm text-ink-2">
                Tunjukkan QR ini ke petugas scanner. <span className="font-medium text-ink">Jangan dibagikan</span>: siapa pun yang memegang QR ini bisa dipresensikan atas nama Anda.
            </p>
        </Dialog>
    );
}
