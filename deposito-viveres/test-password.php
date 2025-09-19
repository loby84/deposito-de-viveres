<?php
// Test directo de contraseña
$stored_hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
$password = 'admin123';

echo "<h2>Test de Contraseña</h2>";
echo "<p><strong>Hash almacenado:</strong> " . $stored_hash . "</p>";
echo "<p><strong>Contraseña probada:</strong> " . $password . "</p>";

$verify_result = password_verify($password, $stored_hash);
echo "<p><strong>Resultado password_verify():</strong> " . ($verify_result ? 'CORRECTO ✅' : 'INCORRECTO ❌') . "</p>";

// Test adicional - crear hash nuevo
$new_hash = password_hash($password, PASSWORD_DEFAULT);
echo "<p><strong>Hash nuevo generado:</strong> " . $new_hash . "</p>";

$verify_new = password_verify($password, $new_hash);
echo "<p><strong>Verificación hash nuevo:</strong> " . ($verify_new ? 'CORRECTO ✅' : 'INCORRECTO ❌') . "</p>";

// Test de conexión a BD
try {
    $pdo = new PDO('mysql:host=localhost;dbname=deposito_viveres', 'root', '');
    echo "<p><strong>Conexión BD:</strong> CORRECTA ✅</p>";
    
    // Buscar usuario directamente
    $stmt = $pdo->prepare("SELECT id, username, password, role FROM users WHERE username = ?");
    $stmt->execute(['encargado']);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "<p><strong>Usuario encontrado:</strong> SÍ ✅</p>";
        echo "<p><strong>ID:</strong> " . $user['id'] . "</p>";
        echo "<p><strong>Username:</strong> " . $user['username'] . "</p>";
        echo "<p><strong>Role:</strong> " . $user['role'] . "</p>";
        echo "<p><strong>Password hash:</strong> " . $user['password'] . "</p>";
        
        $final_verify = password_verify('admin123', $user['password']);
        echo "<p><strong>Verificación final:</strong> " . ($final_verify ? 'CORRECTO ✅' : 'INCORRECTO ❌') . "</p>";
    } else {
        echo "<p><strong>Usuario encontrado:</strong> NO ❌</p>";
    }
    
} catch (Exception $e) {
    echo "<p><strong>Error BD:</strong> " . $e->getMessage() . " ❌</p>";
}
?>