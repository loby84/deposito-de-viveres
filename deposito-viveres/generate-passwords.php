<?php
echo "<h2>Generador de Contraseñas para Sistema Depósito</h2>";

$passwords = [
    'admin123' => password_hash('admin123', PASSWORD_DEFAULT),
    'casa123' => password_hash('casa123', PASSWORD_DEFAULT),
    'test123' => password_hash('test123', PASSWORD_DEFAULT),
    'encargado123' => password_hash('encargado123', PASSWORD_DEFAULT)
];

echo "<style>
body { font-family: Arial, sans-serif; margin: 20px; }
.password-block { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
code { background: #e8e8e8; padding: 5px; font-family: monospace; display: block; margin: 5px 0; }
</style>";

foreach ($passwords as $plain => $hash) {
    echo "<div class='password-block'>";
    echo "<h3>🔑 Contraseña: <strong>{$plain}</strong></h3>";
    echo "<p><strong>Hash:</strong> <code>{$hash}</code></p>";
    echo "<p><strong>SQL para encargado:</strong></p>";
    echo "<code>UPDATE users SET password = '{$hash}' WHERE username = 'encargado';</code>";
    echo "<p><strong>SQL para todas las casas:</strong></p>";
    echo "<code>UPDATE users SET password = '{$hash}' WHERE role = 'casa';</code>";
    echo "</div>";
}

echo "<h3>📋 Script SQL Completo Recomendado:</h3>";
$admin_hash = password_hash('admin123', PASSWORD_DEFAULT);
$casa_hash = password_hash('casa123', PASSWORD_DEFAULT);

echo "<div class='password-block'>";
echo "<code>
-- Actualizar contraseña del encargado<br>
UPDATE users SET password = '{$admin_hash}' WHERE username = 'encargado';<br><br>
-- Actualizar contraseñas de todas las casas<br>
UPDATE users SET password = '{$casa_hash}' WHERE role = 'casa';
</code>";
echo "</div>";
?>