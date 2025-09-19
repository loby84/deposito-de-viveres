<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $pdo = new PDO('mysql:host=localhost;dbname=deposito_viveres', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Obtener productos
        $sql = "SELECT p.*, c.name as category_name,
                       CASE 
                           WHEN p.current_stock <= p.min_stock THEN 'BAJO'
                           WHEN p.current_stock <= (p.min_stock * 2) THEN 'ALERTA'
                           ELSE 'OK'
                       END as stock_status
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.is_active = 1
                ORDER BY p.name";
        
        $stmt = $pdo->query($sql);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $products,
            'message' => 'Productos cargados correctamente'
        ]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Agregar nuevo producto
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validaciones básicas
        if (empty($input['name']) || empty($input['category_id']) || empty($input['unit'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Nombre, categoría y unidad son requeridos'
            ]);
            exit;
        }
        
        // Insertar producto
        $sql = "INSERT INTO products (name, description, category_id, barcode, qr_code, unit, current_stock, min_stock, max_stock, unit_price) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $pdo->prepare($sql);
        $success = $stmt->execute([
            $input['name'],
            $input['description'] ?? null,
            $input['category_id'],
            $input['barcode'] ?? null,
            $input['qr_code'] ?? null,
            $input['unit'],
            $input['current_stock'] ?? 0,
            $input['min_stock'] ?? 0,
            $input['max_stock'] ?? 1000,
            $input['unit_price'] ?? 0
        ]);
        
        if ($success) {
            $productId = $pdo->lastInsertId();
            
            // Configurar acceso para todas las casas por defecto
            $casasSql = "INSERT INTO product_casa_access (product_id, casa_name, is_available, created_by)
                         SELECT ?, casa_name, 1, 1 FROM users WHERE role = 'casa' AND casa_name IS NOT NULL";
            $casasStmt = $pdo->prepare($casasSql);
            $casasStmt->execute([$productId]);
            
            echo json_encode([
                'success' => true,
                'data' => ['id' => $productId],
                'message' => 'Producto agregado exitosamente'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al agregar el producto'
            ]);
        }
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>