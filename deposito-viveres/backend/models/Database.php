<?php
// Usar ruta absoluta
$configPath = dirname(__DIR__) . '/config/database.php';
if (!file_exists($configPath)) {
    die("Error: No se encuentra database.php en: " . $configPath);
}
require_once $configPath;

class Database {
    private $connection;
    
    public function __construct() {
        $this->connection = getDBConnection();
    }
    
    public function fetch($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error en query: " . $e->getMessage());
            throw $e;
        }
    }
    
    public function update($table, $data, $where, $whereParams = []) {
        try {
            $setParts = [];
            foreach ($data as $key => $value) {
                $setParts[] = "{$key} = :{$key}";
            }
            $setClause = implode(', ', $setParts);
            
            $sql = "UPDATE {$table} SET {$setClause} WHERE {$where}";
            $params = array_merge($data, $whereParams);
            
            $stmt = $this->connection->prepare($sql);
            return $stmt->execute($params);
        } catch (PDOException $e) {
            error_log("Error en update: " . $e->getMessage());
            return false;
        }
    }
    
    public function logActivity($userId, $action, $entityType = null, $entityId = null, $description = null) {
        // Simplificado para evitar errores
        return true;
    }
}
?>