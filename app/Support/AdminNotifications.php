<?php

namespace App\Support;

use App\Models\DeviceChangeRequest;
use App\Models\LeaveRequest;
use App\Models\Participant;
use App\Models\PhotoChangeRequest;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Notifikasi admin = daftar pekerjaan yang menunggu tindakan admin, dihitung langsung dari data
 * berstatus pending. Tidak ada tabel notifikasi: item hilang sendiri setelah diproses, sehingga
 * jumlahnya selalu sama dengan pekerjaan yang benar-benar tersisa.
 */
final class AdminNotifications
{
    /** Jumlah item terbaru yang ditampilkan di daftar notifikasi. */
    public const RECENT_LIMIT = 8;

    /**
     * @return array{total: int, groups: list<array>, items: list<array>, generated_at: string}
     */
    public static function summary(): array
    {
        $sources = [
            self::photoChangeSource(),
            self::faceRegistrationSource(),
            self::leaveSource(),
        ];

        // Kunci perangkat dikembangkan terpisah; lewati bila modelnya belum ada di build ini.
        if (class_exists(DeviceChangeRequest::class)) {
            $sources[] = self::deviceChangeSource();
        }

        $groups = collect($sources)->map(fn (array $source) => [
            'type' => $source['type'],
            'label' => $source['label'],
            'count' => $source['count'],
            'url' => $source['url'],
        ])->values();

        $items = collect($sources)
            ->flatMap(fn (array $source) => $source['items'])
            ->sortByDesc('created_at')
            ->take(self::RECENT_LIMIT)
            ->values();

        return [
            'total' => $groups->sum('count'),
            'groups' => $groups->all(),
            'items' => $items->all(),
            'generated_at' => now()->toIso8601String(),
        ];
    }

    private static function photoChangeSource(): array
    {
        $query = PhotoChangeRequest::where('status', 'pending');

        return self::source(
            'photo_change',
            'Pengajuan ganti foto',
            (clone $query)->count(),
            route('participants.index', ['review' => 'pending']),
            (clone $query)->with('participant:id,nama')->latest()->orderByDesc('id')->limit(self::RECENT_LIMIT)->get()
                ->map(fn (PhotoChangeRequest $request) => self::item(
                    "photo_change:{$request->id}",
                    'photo_change',
                    'Pengajuan ganti foto',
                    ($request->participant?->nama ?? 'Peserta').' mengajukan foto wajah baru.',
                    $request->created_at,
                    route('participants.index', ['review' => 'photo', 'participant' => $request->participant_id]),
                )),
        );
    }

    private static function faceRegistrationSource(): array
    {
        $query = Participant::where('face_status', 'pending');

        return self::source(
            'face_registration',
            'Pendaftaran wajah',
            (clone $query)->count(),
            route('participants.index', ['review' => 'pending']),
            (clone $query)->latest('updated_at')->orderByDesc('id')->limit(self::RECENT_LIMIT)->get(['id', 'nama', 'updated_at'])
                ->map(fn (Participant $participant) => self::item(
                    "face_registration:{$participant->id}",
                    'face_registration',
                    'Pendaftaran wajah',
                    "{$participant->nama} mendaftarkan wajah dan menunggu persetujuan.",
                    $participant->updated_at,
                    route('participants.index', ['review' => 'face', 'participant' => $participant->id]),
                )),
        );
    }

    private static function leaveSource(): array
    {
        $query = LeaveRequest::where('status_approval', 'pending');

        return self::source(
            'leave',
            'Pengajuan izin',
            (clone $query)->count(),
            route('admin.leave.index'),
            (clone $query)->with('participant:id,nama')->latest()->orderByDesc('id')->limit(self::RECENT_LIMIT)->get()
                ->map(fn (LeaveRequest $leave) => self::item(
                    "leave:{$leave->id}",
                    'leave',
                    'Pengajuan izin',
                    ($leave->participant?->nama ?? 'Peserta').' mengajukan izin '.self::leaveDate($leave).'.',
                    $leave->created_at,
                    route('admin.leave.index'),
                )),
        );
    }

    private static function deviceChangeSource(): array
    {
        $query = DeviceChangeRequest::where('status', 'pending');

        return self::source(
            'device_change',
            'Pengajuan pindah perangkat',
            (clone $query)->count(),
            route('admin.devices.index'),
            (clone $query)->with('user.participant:id,nama')->latest()->orderByDesc('id')->limit(self::RECENT_LIMIT)->get()
                ->map(fn (DeviceChangeRequest $request) => self::item(
                    "device_change:{$request->id}",
                    'device_change',
                    'Pengajuan pindah perangkat',
                    ($request->user?->participant?->nama ?? $request->user?->name ?? 'Peserta').' ingin memakai HP baru.',
                    $request->created_at,
                    route('admin.devices.index'),
                )),
        );
    }

    private static function leaveDate(LeaveRequest $leave): string
    {
        $start = $leave->tanggal?->translatedFormat('d M Y');
        $end = $leave->tanggal_selesai?->translatedFormat('d M Y');

        return $end && $end !== $start ? "{$start} – {$end}" : "tanggal {$start}";
    }

    private static function source(string $type, string $label, int $count, string $url, Collection $items): array
    {
        return ['type' => $type, 'label' => $label, 'count' => $count, 'url' => $url, 'items' => $items->all()];
    }

    private static function item(string $id, string $type, string $title, string $body, ?Carbon $createdAt, string $url): array
    {
        return [
            'id' => $id,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'created_at' => $createdAt?->toIso8601String(),
            'url' => $url,
        ];
    }
}
