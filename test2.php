<?php
function euclidean(array $v1, array $v2) {
    if (count($v1) !== count($v2)) return INF;
    $sum = 0;
    for ($i=0; $i<128; $i++) {
        if (!isset($v1[$i]) || !isset($v2[$i])) return INF;
        $sum += pow((float)$v1[$i] - (float)$v2[$i], 2);
    }
    return sqrt($sum);
}

$a = array_fill(0, 128, 0.5);
$b = array_fill(0, 128, 0.4);
echo "Distance 0.5 vs 0.4: " . euclidean($a, $b) . "\n";

$a = array_fill(0, 128, 0.5);
$b = array_fill(0, 128, 0.5);
echo "Distance 0.5 vs 0.5: " . euclidean($a, $b) . "\n";
