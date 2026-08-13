<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            // Redirect to landing page with flash message, or abort
            if ($request->expectsJson()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Hanya Administrator/Panitia yang dapat melakukan tindakan ini.',
                ], 403);
            }

            return redirect('/')->with('error', 'Hanya Administrator/Panitia yang dapat mengakses halaman tersebut.');
        }

        return $next($request);
    }
}
