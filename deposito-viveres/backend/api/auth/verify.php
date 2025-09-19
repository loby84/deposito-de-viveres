<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../utils/Auth.php';
require_once '../../models/User.php';
require_once '../../utils/Response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Método no permitido', 405);
}

$user = Auth::checkAuth();
$userModel = new User();
$userData = $userModel->getUserById($user['user_id']);

Response::success([
    'user' => [
        'id' => $userData['id'],
        'username' => $userData['username'],
        'role' => $userData['role'],
        'casa_name' => $userData['casa_name']
    ]
], 'Token válido');
