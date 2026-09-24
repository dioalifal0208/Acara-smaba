<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\UserResource;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user's profile.
     */
    public function me(Request $request)
    {
        $user = $request->user();
        
        // Eager load the participant relation only
        $user->load('participant');

        return response()->json([
            'status' => 'success',
            'data' => [
                'user' => new UserResource($user),
            ],
        ]);
    }
}
