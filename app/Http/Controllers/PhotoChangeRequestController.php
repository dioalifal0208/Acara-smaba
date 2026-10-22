<?php

namespace App\Http\Controllers;

use App\Models\FaceHistory;
use App\Models\Participant;
use App\Models\PhotoChangeRequest;
use App\Services\FcmService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PhotoChangeRequestController extends Controller
{
    public function approve(PhotoChangeRequest $photoChangeRequest): RedirectResponse
    {
        $oldPhotoPath = null;
        $faceChanged = false;
        $approvedRequest = DB::transaction(function () use ($photoChangeRequest, &$oldPhotoPath, &$faceChanged) {
            $changeRequest = PhotoChangeRequest::lockForUpdate()->findOrFail($photoChangeRequest->id);
            if ($changeRequest->status !== 'pending') {
                return null;
            }

            $participant = Participant::lockForUpdate()->findOrFail($changeRequest->participant_id);
            $oldPhotoPath = $participant->photo_path;

            $faceChanged = $changeRequest->applyApprovalTo($participant);
            $participant->save();

            $changeRequest->update([
                'status' => 'approved',
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
                'rejection_reason' => null,
            ]);
            FaceHistory::record($participant, 'photo_change', auth()->id());

            return $changeRequest->fresh();
        });

        if (! $approvedRequest) {
            return back()->with('error', 'Pengajuan foto ini sudah diproses.');
        }

        // Foto lama yang tercatat di riwayat wajah tetap disimpan.
        if ($oldPhotoPath && $oldPhotoPath !== $approvedRequest->photo_path) {
            FaceHistory::deleteFileUnlessReferenced($oldPhotoPath);
        }

        $this->notifyParticipant($approvedRequest, $faceChanged);

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
            Storage::disk('private')->delete($candidatePath);
        }

        $this->notifyParticipant($rejectedRequest, false);

        return back()->with('success', 'Pengajuan perubahan foto ditolak.');
    }

    /** Push FCM ke HP peserta: hasil pengajuan foto (dan status wajah bila ikut berubah). */
    private function notifyParticipant(PhotoChangeRequest $changeRequest, bool $faceChanged): void
    {
        $participant = Participant::find($changeRequest->participant_id);
        if (! $participant) {
            return;
        }

        $fcm = app(FcmService::class);
        $fcm->sendStateChanged($participant, 'photo');
        if ($faceChanged) {
            $fcm->sendStateChanged($participant, 'face');
        }
    }
}
