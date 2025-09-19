<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';
require_once '../../models/User.php';
require_once '../../utils/JWT.php';
require_once '../../utils/Response.php';

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Método no permitido', 405);
}

// Leer JSON del body
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['username']) || !isset($input['password'])) {
    Response::error('Usuario y contraseña son requeridos', 400);
}

// Autenticar usuario
$userModel = new User();
$user = $userModel->authenticate($input['username'], $input['password']);

if ($user) {
    // Generar token JWT
    $token = JWT::createToken($user['id'], $user['username'], $user['role']);

    Response::success([
        'token' => $token,
        'user' => $user
    ], 'Login exitoso');
} else {
    Response::error('Credenciales inválidas', 401);
}
