<?php
require 'vendor/autoload.php';
$s = new PhpOffice\PhpSpreadsheet\Spreadsheet();
// Set numeric value
$s->getActiveSheet()->setCellValueExplicit('A1', 198211152010012001, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NUMERIC);
// Set string value for comparison
$s->getActiveSheet()->setCellValueExplicit('A2', '198211152010012001', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);

$w = new PhpOffice\PhpSpreadsheet\Writer\Xlsx($s);
$w->save('test_float.xlsx');

$l = PhpOffice\PhpSpreadsheet\IOFactory::load('test_float.xlsx');
var_dump($l->getActiveSheet()->toArray(null, true, true, true));
