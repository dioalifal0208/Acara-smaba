<?php

namespace App\Http\Controllers;

use App\Models\Participant;
use App\Models\PhotoChangeRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PhotoChangeRequestController extends Controller
{
    public function approve(PhotoChangeRequest $photoChangeRequest): RedirectResponse
    {
        $oldPhotoPath = null;
        $approvedRequest = DB::transaction(function () use ($photoChangeRequest, &$oldPhotoPath) {
            $changeRequest = PhotoChangeRequest::lockForUpdate()->findOrFail($photoChangeRequest->id);
            if ($changeRequest->status !== 'pending') {
                return null;
            }

            $participant = Participant::lockForUpdate()->findOrFail($changeRequest->participant_id);
            $oldPhotoPath = $participant->photo_path;

            $participant->photo_path = $changeRequest->photo_path;
            if ($changeRequest->face_descriptor !== null) {
                $participant->face_descriptor = $changeRequest->face_descriptor;
            }
            $participant->face_status = 'approved';
            $participant->save();

            $changeRequest->update([
                'status' => 'approved',
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
                'rejection_reason' => null,
            ]);

            return $changeRequest->fresh();
        });

        if (! $approvedRequest) {
            return back()->with('error', 'Pengajuan foto ini sudah diproses.');
        }

        if ($oldPhotoPath && $oldPhotoPath !== $approvedRequest->photo_path) {
            Storage::disk('public')->delete($oldPhotoPath);
        }

        return back()->with('success', 'Foto baru peserta telah disetujui dan diaktifkan.');
    }

    public function reject(Request $request, PhotoChangeRequest $photoChangeRequest): RedirectResponse
    {
        $validated = $request->validate([
            'rejection_reason' => 'nullable|string|max:500',
        ]);
        $candidatePath = null;

        $rejectedRequest = DB::transaction(function () use ($photoChangeRequest, $validated, &$candidatePath) {
            $changeRequest = PhotoChangeRequest::lockForUpdate()->findOrFail($photoChangeRequest->id);
            if ($changeRequest->status !== 'pending') {
                return null;
            }

            $candidatePath = $changeRequest->photo_path;
            $changeRequest->update([
                'status' => 'rejected',
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
                'rejection_reason' => $validated['rejection_reason'] ?? null,
            ]);

            return $changeRequest;
        });

        if (! $rejectedRequest) {
            return back()->with('error', 'Pengajuan foto ini sudah diproses.');
        }

        if ($candidatePath) {
            Storage::disk('public')->delete($candidatePath);
        }

        return back()->with('success', 'Pengajuan perubahan foto ditolak.');
    }
}
