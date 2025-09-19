<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$apiInfo = [
    'name' => 'API Sistema Depósito de Víveres',
    'version' => '1.0.0',
    'description' => 'API REST para gestión de inventario y pedidos',
    'status' => 'active',
    'endpoints' => [
        'auth' => [
            'POST /api/auth/login' => 'Iniciar sesión',
            'GET /api/auth/verify' => 'Verificar token'
        ],
        'inventory' => [
            'GET /api/inventory/products' => 'Listar productos',
            'POST /api/inventory/products' => 'Crear producto',
            'GET /api/inventory/categories' => 'Listar categorías',
            'POST /api/inventory/stock' => 'Actualizar stock',
            'GET /api/inventory/stock' => 'Historial de movimientos',
            'POST /api/inventory/barcode' => 'Procesar código de barras',
            'POST /api/inventory/casa-access' => 'Gestionar acceso de casas',
            'GET /api/inventory/low-stock' => 'Productos con stock bajo'
        ],
        'orders' => [
            'GET /api/orders/list' => 'Listar pedidos',
            'POST /api/orders/create' => 'Crear pedido',
            'PUT /api/orders/list' => 'Actualizar estado',
            'DELETE /api/orders/list' => 'Eliminar pedido',
            'POST /api/orders/pdf' => 'Generar PDF de pedido'
        ],
        'reports' => [
            'POST /api/reports/consolidated' => 'Reporte consolidado'
        ]
    ],
    'authentication' => 'Bearer Token (JWT)',
    'timestamp' => date('Y-m-d H:i:s')
];

echo json_encode($apiInfo, JSON_PRETTY_PRINT);
