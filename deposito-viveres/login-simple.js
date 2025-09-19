console.log('🔍 Login script cargado');

// Variables globales
const API_BASE_URL = '/deposito-viveres/backend/api';
let currentUser = null;
let authToken = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 DOM cargado, iniciando login');
    
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.error('❌ No se encontró el formulario de login');
        return;
    }
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('🔍 Formulario enviado');
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        console.log('🔍 Datos:', {username, password: '***'});
        
        if (!username || !password) {
            alert('Por favor ingresa usuario y contraseña');
            return;
        }
        
        try {
            console.log('🔍 Enviando request a API...');
            
            const response = await fetch('/deposito-viveres/backend/api/auth/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });
            
            console.log('🔍 Response status:', response.status);
            
            const data = await response.json();
            console.log('🔍 Response data:', data);
            
            if (data.success) {
                console.log('✅ Login exitoso');
                
                // Guardar datos
                localStorage.setItem('userData', JSON.stringify(data.data.user));
                localStorage.setItem('authToken', data.data.token);
                
                // Redirigir
                if (data.data.user.role === 'encargado') {
                    console.log('🔍 Redirigiendo a dashboard...');
                    window.location.href = '/deposito-viveres/frontend/pages/dashboard.html';
                } else {
                    console.log('🔍 Redirigiendo a casa portal...');
                    window.location.href = '/deposito-viveres/frontend/pages/casa-portal.html';
                }
            } else {
                console.error('❌ Login falló:', data.message);
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('❌ Error en login:', error);
            alert('Error de conexión: ' + error.message);
        }
    });
    
    console.log('✅ Event listener agregado al formulario');
});

// Función de utilidad
function showNotification(message, type = 'success') {
    alert(message); // Versión simple
}