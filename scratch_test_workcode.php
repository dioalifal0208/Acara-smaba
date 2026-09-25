$user = App\Models\User::where('role', 'participant')->whereNotNull('participant_id')->first();
if (!$user) { echo "No participant user found.\n"; return; }
$token = $user->createToken('test', ['role:participant'])->plainTextToken;

$ch = curl_init('https://presensi.smanegeri1babatlmg.sch.id/api/v1/workcodes/active');
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json', 'Authorization: Bearer ' . $token]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$res = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$user->tokens()->where('name', 'test')->delete();

$json = json_decode($res, true);
if (isset($json['data']) && is_array($json['data'])) {
    if (isset($json['data']['nama_workcode'])) $json['data']['nama_workcode'] = '***';
    if (isset($json['data']['id'])) $json['data']['id'] = 999;
    if (isset($json['data']['latitude'])) $json['data']['latitude'] = -7.000;
    if (isset($json['data']['longitude'])) $json['data']['longitude'] = 112.000;
}

echo "HTTP $status\n";
echo json_encode($json, JSON_PRETTY_PRINT);
