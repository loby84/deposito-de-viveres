<?php
require_once 'JWT.php';
require_once 'Response.php';

class Auth {
    public static function checkAuth() {
        $headers = getallheaders();
        $token = null;
        
        if (isset($headers['Authorization'])) {
            $auth = $headers['Authorization'];
            if (preg_match('/Bearer\s+(.*)$/i', $auth, $matches)) {
                $token = $matches[1];
            }
        }
        
        if (!$token) {
            Response::unauthorized('Token no proporcionado');
        }
        
        $payload = JWT::validateToken($token);
        if (!$payload) {
            Response::unauthorized('Token inválido o expirado');
        }
        
        return $payload;
    }
    
    public static function requireRole($requiredRole) {
        $user = self::checkAuth();
        
        if ($user['role'] !== $requiredRole) {
            Response::forbidden('No tienes permisos para acceder a este recurso');
        }
        
        return $user;
    }
    
    public static function requireRoles($allowedRoles) {
        $user = self::checkAuth();
        
        if (!in_array($user['role'], $allowedRoles)) {
            Response::forbidden('No tienes permisos para acceder a este recurso');
        }
        
        return $user;
    }
}
