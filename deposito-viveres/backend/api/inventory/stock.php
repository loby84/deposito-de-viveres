<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../controllers/InventoryController.php';

$inventoryController = new InventoryController();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        $inventoryController->updateStock();
        break;
        
    case 'GET':
        if (isset($_GET['product_id'])) {
            $inventoryController->getStockMovements($_GET['product_id']);
        } else {
            $inventoryController->getStockMovements();
        }
        break;
        
    default:
        Response::error('Método no permitido', 405);
}
