<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (! $request->user()) {
            return redirect('/login');
        }

        if ($request->user()->role !== $role && !$request->user()->isAdmin()) {
            // Admin can access everything, but if not admin and role doesn't match:
            if ($request->user()->role === 'participant') {
                return redirect()->route('participant.dashboard');
            }
            return redirect('/');
        }

        return $next($request);
    }
}
