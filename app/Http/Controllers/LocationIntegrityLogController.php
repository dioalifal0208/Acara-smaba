<?php

namespace App\Http\Controllers;

use App\Models\LocationIntegrityViolation;
use App\Support\LocationIntegrity;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;

/** Panel admin: catatan anti fake GPS dari aplikasi Android (diblokir maupun hanya dicatat). */
class LocationIntegrityLogController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'q' => 'nullable|string|max:100',
            'status' => 'nullable|in:blocked,logged',
            'reason' => ['nullable', 'in:'.implode(',', LocationIntegrity::ALL_REASONS)],
            'date' => 'nullable|date',
        ]);

        $logs = LocationIntegrityViolation::with(['user.participant', 'workcode'])
            ->when($filters['status'] ?? null, fn (Builder $query, $status) => $query->where('blocked', $status === 'blocked'))
            ->when($filters['reason'] ?? null, fn (Builder $query, $reason) => $query->whereJsonContains('reasons', $reason))
            ->when($filters['date'] ?? null, fn (Builder $query, $date) => $query->whereDate('created_at', $date))
            ->when($filters['q'] ?? null, function (Builder $query, $keyword) {
                $like = '%'.$keyword.'%';
                $query->where(fn (Builder $q) => $q
                    ->where('device_model', 'like', $like)
                    ->orWhereHas('user', fn (Builder $user) => $user->where('name', 'like', $like)->orWhere('username', 'like', $like))
                    ->orWhereHas('participant', fn (Builder $p) => $p->where('nama', 'like', $like)->orWhere('nis_nip', 'like', $like)));
            })
            ->latest('id')
            ->paginate(25)
            ->withQueryString()
            ->through(fn (LocationIntegrityViolation $log) => [
                'id' => $log->id,
                'participant_name' => $log->user?->participant?->nama ?? $log->user?->name ?? 'Tidak diketahui',
                'participant_nip' => $log->user?->participant?->nis_nip ?? '-',
                'device_model' => $log->device_model ?: 'Tidak diketahui',
                'workcode_name' => $log->workcode?->nama_workcode,
                'blocked' => $log->blocked,
                'reasons' => collect($log->reasons)->map(fn ($reason) => [
                    'code' => $reason,
                    'label' => LocationIntegrity::label($reason),
                ])->values(),
                'fake_apps' => array_values($log->signals['fake_apps'] ?? []),
                'created_at' => $log->created_at?->format('d M Y H:i'),
            ]);

        $today = LocationIntegrityViolation::whereDate('created_at', today());

        return Inertia::render('FakeGps/Index', [
            'logs' => $logs,
            'filters' => [
                'q' => $filters['q'] ?? '',
                'status' => $filters['status'] ?? '',
                'reason' => $filters['reason'] ?? '',
                'date' => $filters['date'] ?? '',
            ],
            'reasonOptions' => collect(LocationIntegrity::ALL_REASONS)
                ->map(fn ($code) => ['code' => $code, 'label' => LocationIntegrity::label($code)])
                ->values(),
            'stats' => [
                'blocked_today' => (clone $today)->where('blocked', true)->count(),
                'logged_today' => (clone $today)->where('blocked', false)->count(),
                'users_7_days' => LocationIntegrityViolation::where('created_at', '>=', now()->subDays(7))->distinct('user_id')->count('user_id'),
            ],
        ]);
    }
}
