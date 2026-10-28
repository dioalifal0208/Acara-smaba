<?php

namespace App\Http\Controllers;

use App\Support\Holidays;

class HolidayController extends Controller
{
    /**
     * Get Indonesian public holidays from Google Calendar API (ICS format).
     */
    public function index()
    {
        return response()->json(Holidays::all());
    }
}
