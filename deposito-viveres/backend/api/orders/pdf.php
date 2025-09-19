<?php
// ================================================
// backend/api/orders/pdf.php
// ================================================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../utils/PDFGenerator.php';
require_once '../../utils/Auth.php';
require_once '../../utils/Response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Método no permitido', 405);
}

$user = Auth::checkAuth();
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['order_id'])) {
    Response::error('ID del pedido requerido');
}

try {
    $pdfGenerator = new PDFGenerator();
    $filename = $pdfGenerator->generateOrderPDF($input['order_id']);
    
    Response::success([
        'filename' => $filename,
        'download_url' => "/deposito-viveres/backend/pdfs/{$filename}"
    ], 'PDF generado exitosamente');
    
} catch (Exception $e) {
    error_log("Error al generar PDF: " . $e->getMessage());
    Response::serverError('Error al generar el PDF');
}
