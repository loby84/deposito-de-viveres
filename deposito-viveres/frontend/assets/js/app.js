// Función para realizar llamadas a la API
async function apiCall(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE_URL}/${endpoint}${endpoint.includes('?') ? '' : '.php'}`;
    
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    if (authToken) {
        options.headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
        console.log(`[API CALL] Enviando datos a ${endpoint}:`, data); // <<-- LOG
    }

    const response = await fetch(url, options);

    console.log(`[API CALL] Código HTTP de ${endpoint}:`, response.status); // <<-- LOG

    // Siempre intentar parsear JSON
    let jsonData;
    try {
        jsonData = await response.json();
        console.log(`[API CALL] JSON recibido de ${endpoint}:`, jsonData); // <<-- LOG
    } catch (err) {
        console.error(`[API CALL] Error parseando JSON de ${endpoint}:`, err); // <<-- LOG
        jsonData = { success: false, message: "Respuesta inválida del servidor" };
    }

    // Manejo especial para 401
    if (response.status === 401) {
        clearAuthData();
        redirectToLogin();
        return jsonData;
    }

    return jsonData;
}

// Login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error-message');

    console.log("[LOGIN] Intentando login con usuario:", username); // <<-- LOG
    
    try {
        const response = await apiCall('auth/login', 'POST', {
            username: username,
            password: password
        });
        
        console.log("[LOGIN] Respuesta completa del backend:", response); // <<-- LOG

        if (response.success) {
            saveAuthData(response.data.user, response.data.token);
            
            // Redirigir según el rol
            if (response.data.user.role === 'encargado') {
                window.location.href = 'frontend/pages/dashboard.html';
            } else {
                window.location.href = 'frontend/pages/casa-portal.html';
            }
        } else {
            showError(errorDiv, response.message);
        }
    } catch (error) {
        showError(errorDiv, 'Error de conexión. Intenta nuevamente.');
        console.error('[LOGIN] Error atrapado en try/catch:', error);
    }
}
