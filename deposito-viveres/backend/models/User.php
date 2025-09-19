<?php
require_once 'Database.php';

class User {
    private $db;
    
    public function __construct() {
        $this->db = new Database();
    }
    
    public function authenticate($username, $password) {
        $sql = "SELECT id, username, password, role, casa_name, is_active 
                FROM users WHERE username = ? AND is_active = 1";
        
        $user = $this->db->fetch($sql, [$username]);
        
        if ($user && password_verify($password, $user['password'])) {
            $this->updateLastLogin($user['id']);
            
            $this->db->logActivity($user['id'], 'LOGIN', 'user', $user['id'], 'Usuario logueado exitosamente');
            
            return [
                'id' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role'],
                'casa_name' => $user['casa_name']
            ];
        }
        
        return false;
    }
    
    public function updateLastLogin($userId) {
        $this->db->update('users', 
            ['last_login' => date('Y-m-d H:i:s')], 
            'id = ?', 
            [$userId]
        );
    }
}
?>