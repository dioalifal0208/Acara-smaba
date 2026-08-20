<?php
require __DIR__ . '/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;

$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();
$sheet->setCellValue('A1', '198211152010012001'); // Written as number?
$sheet->setCellValueExplicit('B1', '198211152010012001', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);

$writer = new Xlsx($spreadsheet);
$writer->save('test_nip.xlsx');

$loaded = IOFactory::load('test_nip.xlsx');
$loadedSheet = $loaded->getActiveSheet();
$rows = $loadedSheet->toArray(null, true, true, true);

print_r($rows);
