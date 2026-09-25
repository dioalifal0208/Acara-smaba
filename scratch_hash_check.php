echo json_encode(App\Models\User::where('username', '199708022025041005')->orWhere('username', 'admin')->get(['username', 'password'])->map(function($u) {
    return [
        'username' => $u->username,
        'matches_username' => Hash::check($u->username, $u->password),
        'matches_admin' => Hash::check('admin', $u->password),
    ];
})->toArray(), JSON_PRETTY_PRINT);
