<?php
require 'vendor/autoload.php';
$s = new PhpOffice\PhpSpreadsheet\Spreadsheet();
$s->getActiveSheet()->setCellValueExplicit('A1', 198012102014062002, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NUMERIC);
$w = new PhpOffice\PhpSpreadsheet\Writer\Xlsx($s);
$w->save('test_float2.xlsx');
$l = PhpOffice\PhpSpreadsheet\IOFactory::load('test_float2.xlsx');
var_dump($l->getActiveSheet()->toArray(null, true, true, true));
