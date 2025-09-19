<?php
// Usar ruta absoluta
$configPath = dirname(__DIR__) . '/config/database.php';
if (file_exists($configPath)) {
    require_once $configPath;
} else {
    // Definir constantes por defecto si no encuentra el archivo
    define('JWT_EXPIRATION', 3600);
}

class JWT {
    public static function createToken($userId, $username, $role) {
        $payload = [
            'user_id' => $userId,
            'username' => $username,
            'role' => $role,
            'iat' => time(),
            'exp' => time() + (defined('JWT_EXPIRATION') ? JWT_EXPIRATION : 3600)
        ];
        
        return base64_encode(json_encode($payload));
    }
    
    public static function validateToken($token) {
        try {
            $payload = json_decode(base64_decode($token), true);
            
            if (isset($payload['exp']) && $payload['exp'] < time()) {
                return false;
            }
            
            return $payload;
        } catch (Exception $e) {
            return false;
        }
    }
}
?>