echo json_encode(App\Models\User::where('username', 'admin')->get(['password'])->map(function($u) {
    return [
        'is_password' => Hash::check('password', $u->password),
        'is_admin123' => Hash::check('admin123', $u->password),
    ];
})->toArray(), JSON_PRETTY_PRINT);
