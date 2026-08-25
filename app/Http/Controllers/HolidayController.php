<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class HolidayController extends Controller
{
    /**
     * Get Indonesian public holidays from Google Calendar API (ICS format).
     */
    public function index()
    {
        // Cache the holidays for 7 days to avoid hitting Google's servers too often
        $holidays = Cache::remember('google_holidays_id', now()->addDays(7), function () {
            $url = 'https://calendar.google.com/calendar/ical/id.indonesian%23holiday%40group.v.calendar.google.com/public/basic.ics';
            
            try {
                $response = Http::timeout(10)->get($url);
                
                if (!$response->successful()) {
                    return [];
                }
                
                // Parse the ICS file manually
                $content = str_replace("\r", "", $response->body());
                $lines = explode("\n", $content);
                $holidays = [];
                
                $currentDate = null;
                $currentSummary = null;
                
                foreach ($lines as $line) {
                    $line = trim($line);
                    
                    if (strpos($line, 'DTSTART;VALUE=DATE:') === 0) {
                        $dateStr = substr($line, 19); // Format: YYYYMMDD
                        if (strlen($dateStr) === 8) {
                            $currentDate = substr($dateStr, 0, 4) . '-' . substr($dateStr, 4, 2) . '-' . substr($dateStr, 6, 2);
                        }
                    } elseif (strpos($line, 'SUMMARY:') === 0) {
                        $currentSummary = substr($line, 8);
                    } elseif ($line === 'END:VEVENT') {
                        if ($currentDate && $currentSummary) {
                            // If multiple holidays land on the same day, append them
                            if (isset($holidays[$currentDate])) {
                                $holidays[$currentDate] .= ' / ' . $currentSummary;
                            } else {
                                $holidays[$currentDate] = $currentSummary;
                            }
                        }
                        $currentDate = null;
                        $currentSummary = null;
                    }
                }
                
                return $holidays;
                
            } catch (\Exception $e) {
                // If there's any error fetching, just return empty array so it doesn't break the frontend
                return [];
            }
        });

        return response()->json($holidays);
    }
}
