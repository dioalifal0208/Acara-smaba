<?php
require 'vendor/autoload.php';
$loaded = PhpOffice\PhpSpreadsheet\IOFactory::load('test_nip.xlsx');
var_dump($loaded->getActiveSheet()->toArray(null, true, true, true));
