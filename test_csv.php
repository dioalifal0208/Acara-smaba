<?php
require 'vendor/autoload.php';
file_put_contents('test_nip.csv', "Nama,NIP\nWiwit,198211152010012001\nAnik,198012102014062002");
$loaded = PhpOffice\PhpSpreadsheet\IOFactory::load('test_nip.csv');
var_dump($loaded->getActiveSheet()->toArray(null, true, true, true));
