<?php

namespace App\Http\Resources\Api\V1;

use App\Support\PrivateFile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'username' => $this->username ?? $this->name, // fallback for name if username is missing, but user table usually has username or name
            'email' => $this->email,
            'role' => $this->role,
        ];

        // Ensure name is mapped if it exists and username is empty
        if (isset($this->name)) {
            $data['name'] = $this->name;
        }

        if ($this->relationLoaded('participant') && $this->participant) {
            $participant = $this->participant;
            $participantData = [
                'nis_nip' => $participant->nis_nip,
                'nama' => $participant->nama,
                'face_status' => $participant->face_status,
                // Objek status wajah yang sama dengan GET /api/v1/me/state (tanpa descriptor).
                'face' => $participant->faceState(),
            ];

            if ($participant->face_status === 'approved' && $participant->photo_path && Storage::disk('private')->exists($participant->photo_path)) {
                $participantData['photo_url'] = PrivateFile::url('participant-photo', $participant);
            } else {
                $participantData['photo_url'] = null;
            }

            $data['participant'] = $participantData;
        }

        return $data;
    }
}
