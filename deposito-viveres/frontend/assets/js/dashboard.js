let products = [];
let categories = [];
let orders = [];

// Inicializar dashboard
function initDashboard() {
    if (!currentUser || currentUser.role !== 'encargado') {
        redirectToLogin();
        return;
    }
    
    // Mostrar nombre del usuario
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
        usernameDisplay.textContent = currentUser.username;
    }
    
    // Configurar navegación
    setupNavigation();
    
    // Cargar datos iniciales
    loadDashboardData();
    
    // Configurar formularios
    setupForms();
}

// Configurar navegación
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            showPage(page);
            
            // Actualizar estado activo
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

// Mostrar página específica
function showPage(page) {
    // Ocultar todas las páginas
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(p => p.style.display = 'none');
    
    // Mostrar página seleccionada
    const targetPage = document.getElementById(`${page}-content`);
    if (targetPage) {
        targetPage.style.display = 'block';
    }
    
    // Actualizar título
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        pageTitle.textContent = getPageTitle(page);
    }
    
    // Cargar datos específicos de la página
    switch (page) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'inventory':
            loadInventoryData();
            break;
        case 'orders':
            loadOrdersData();
            break;
    }
}

function getPageTitle(page) {
    const titles = {
        'dashboard': 'Dashboard',
        'inventory': 'Gestión de Inventario',
        'orders': 'Gestión de Pedidos',
        'scanner': 'Escáner de Códigos'
    };
    return titles[page] || 'Dashboard';
}

// Cargar datos del dashboard
async function loadDashboardData() {
    try {
        // Cargar productos
        const productsResponse = await apiCall('inventory/products');
        if (productsResponse.success) {
            products = productsResponse.data;
            updateDashboardStats();
        }
        
        // Cargar productos con stock bajo
        loadLowStockProducts();
        
        // Cargar pedidos recientes
        loadRecentOrders();
        
        // Actualizar timestamp
        updateLastUpdate();
        
    } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
        showNotification('Error al cargar los datos', 'error');
    }
}

// Actualizar estadísticas del dashboard
function updateDashboardStats() {
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stock_status === 'BAJO' || p.stock_status === 'ALERTA').length;
    
    document.getElementById('total-products').textContent = totalProducts;
    document.getElementById('low-stock-count').textContent = lowStockProducts;
    
    // Cargar pedidos de hoy
    loadTodayOrdersCount();
}

// Cargar contador de pedidos de hoy
async function loadTodayOrdersCount() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await apiCall(`orders/list?date=${today}`);
        if (response.success) {
            document.getElementById('today-orders').textContent = response.data.length;
        }
    } catch (error) {
        console.error('Error cargando pedidos de hoy:', error);
    }
}

// Cargar productos con stock bajo
async function loadLowStockProducts() {
    try {
        const response = await apiCall('inventory/low-stock');
        if (response.success) {
            const container = document.getElementById('low-stock-products');
            if (container) {
                container.innerHTML = renderLowStockTable(response.data);
            }
        }
    } catch (error) {
        console.error('Error cargando productos con stock bajo:', error);
    }
}

// Renderizar tabla de productos con stock bajo
function renderLowStockTable(products) {
    if (products.length === 0) {
        return '<p class="text-center" style="color: #6b7280;">No hay productos con stock bajo</p>';
    }
    
    return `
        <table class="table">
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Stock Actual</th>
                    <th>Stock Mínimo</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(product => `
                    <tr>
                        <td>${product.name}</td>
                        <td>${product.current_stock} ${product.unit}</td>
                        <td>${product.min_stock} ${product.unit}</td>
                        <td>
                            <span class="badge ${product.stock_status === 'BAJO' ? 'badge-danger' : 'badge-warning'}">
                                ${product.stock_status}
                            </span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Cargar pedidos recientes
async function loadRecentOrders() {
    try {
        const response = await apiCall('orders/list');
        if (response.success) {
            const recentOrders = response.data.slice(0, 5);
            const container = document.getElementById('recent-orders');
            if (container) {
                container.innerHTML = renderRecentOrdersTable(recentOrders);
            }
        }
    } catch (error) {
        console.error('Error cargando pedidos recientes:', error);
    }
}

// Renderizar tabla de pedidos recientes
function renderRecentOrdersTable(orders) {
    if (orders.length === 0) {
        return '<p class="text-center" style="color: #6b7280;">No hay pedidos recientes</p>';
    }
    
    return `
        <table class="table">
            <thead>
                <tr>
                    <th>Número</th>
                    <th>Casa</th>
                    <th>Items</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                ${orders.map(order => `
                    <tr>
                        <td>${order.order_number}</td>
                        <td>${order.casa_name}</td>
                        <td>${order.total_items}</td>
                        <td>
                            <span class="badge ${getStatusBadgeClass(order.status)}">
                                ${order.status.toUpperCase()}
                            </span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Cargar datos del inventario
async function loadInventoryData() {
    try {
        // Cargar productos
        const productsResponse = await apiCall('inventory/products');
        if (productsResponse.success) {
            products = productsResponse.data;
            renderProductsTable();
        }
        
        // Cargar categorías
        const categoriesResponse = await apiCall('inventory/categories');
        if (categoriesResponse.success) {
            categories = categoriesResponse.data;
            populateCategorySelects();
        }
        
    } catch (error) {
        console.error('Error cargando datos del inventario:', error);
        showNotification('Error al cargar el inventario', 'error');
    }
}

// Renderizar tabla de productos
function renderProductsTable() {
    const container = document.getElementById('products-table');
    if (!container) return;
    
    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Stock</th>
                    <th>Unidad</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(product => `
                    <tr>
                        <td>
                            <strong>${product.name}</strong>
                            ${product.barcode ? `<br><small>Código: ${product.barcode}</small>` : ''}
                        </td>
                        <td>${product.category_name || 'Sin categoría'}</td>
                        <td>
                            <span style="color: ${product.stock_status === 'BAJO' ? '#ef4444' : '#333'}">
                                ${product.current_stock}
                            </span>
                        </td>
                        <td>${product.unit}</td>
                        <td>
                            <span class="badge ${product.stock_status === 'BAJO' ? 'badge-danger' : product.stock_status === 'ALERTA' ? 'badge-warning' : 'badge-success'}">
                                ${product.stock_status}
                            </span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Cargar datos de pedidos
async function loadOrdersData() {
    try {
        const response = await apiCall('orders/list');
        if (response.success) {
            orders = response.data;
            renderOrdersTable();
        }
    } catch (error) {
        console.error('Error cargando pedidos:', error);
        showNotification('Error al cargar pedidos', 'error');
    }
}

// Renderizar tabla de pedidos
function renderOrdersTable() {
    const container = document.getElementById('orders-table');
    if (!container) return;
    
    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Número</th>
                    <th>Casa</th>
                    <th>Usuario</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${orders.map(order => `
                    <tr>
                        <td><strong>${order.order_number}</strong></td>
                        <td>${order.casa_name}</td>
                        <td>${order.username}</td>
                        <td>${order.total_items}</td>
                        <td>${formatCurrency(order.total_amount)}</td>
                        <td>
                            <span class="badge ${getStatusBadgeClass(order.status)}">
                                ${order.status.toUpperCase()}
                            </span>
                        </td>
                        <td>${formatDate(order.created_at)}</td>
                        <td>
                            <button class="btn btn-sm btn-success" onclick="generateOrderPDF(${order.id})">
                                <i class="fas fa-file-pdf"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Obtener clase CSS para badge de estado
function getStatusBadgeClass(status) {
    const classes = {
        'pendiente': 'badge-warning',
        'procesando': 'badge-info',
        'completado': 'badge-success',
        'cancelado': 'badge-danger'
    };
    return classes[status] || 'badge-info';
}

// Configurar formularios
function setupForms() {
    // Formulario de agregar producto
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }
    
    // Formulario de actualizar stock
    const stockUpdateForm = document.getElementById('stock-update-form');
    if (stockUpdateForm) {
        stockUpdateForm.addEventListener('submit', handleStockUpdate);
    }
    
    // Select de producto en form de stock
    const stockProductSelect = document.getElementById('stock-product');
    if (stockProductSelect) {
        stockProductSelect.addEventListener('change', handleProductSelectChange);
    }
}

// Manejar agregar producto
async function handleAddProduct(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const productData = Object.fromEntries(formData);
    
    try {
        const response = await apiCall('inventory/products', 'POST', productData);
        if (response.success) {
            showNotification('Producto agregado exitosamente');
            closeModal('add-product-modal');
            loadInventoryData();
            e.target.reset();
        } else {
            showNotification(response.message || 'Error al agregar producto', 'error');
        }
    } catch (error) {
        console.error('Error agregando producto:', error);
        showNotification('Error al agregar producto', 'error');
    }
}

// Manejar actualización de stock
async function handleStockUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const stockData = Object.fromEntries(formData);
    
    try {
        const response = await apiCall('inventory/stock', 'POST', stockData);
        if (response.success) {
            showNotification('Stock actualizado exitosamente');
            closeModal('stock-update-modal');
            loadInventoryData();
            e.target.reset();
            document.getElementById('current-stock-display').style.display = 'none';
        } else {
            showNotification(response.message || 'Error al actualizar stock', 'error');
        }
    } catch (error) {
        console.error('Error actualizando stock:', error);
        showNotification('Error al actualizar stock', 'error');
    }
}

// Manejar cambio en select de producto
function handleProductSelectChange(e) {
    const productId = e.target.value;
    const display = document.getElementById('current-stock-display');
    const stockValue = document.getElementById('current-stock-value');
    
    if (productId) {
        const product = products.find(p => p.id == productId);
        if (product) {
            stockValue.textContent = `${product.current_stock} ${product.unit}`;
            display.style.display = 'block';
        }
    } else {
        display.style.display = 'none';
    }
}

// Poblar selects de categorías
function populateCategorySelects() {
    const categorySelect = document.getElementById('product-category');
    if (categorySelect && categories.length > 0) {
        // Limpiar opciones existentes (excepto la primera)
        while (categorySelect.children.length > 1) {
            categorySelect.removeChild(categorySelect.lastChild);
        }
        
        // Agregar categorías
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }
}

// Funciones auxiliares
function showAddProductModal() {
    populateProductSelect();
    showModal('add-product-modal');
}

function showStockUpdateModal() {
    populateProductSelect();
    showModal('stock-update-modal');
}

function populateProductSelect() {
    const select = document.getElementById('stock-product');
    if (select && products.length > 0) {
        // Limpiar opciones existentes (excepto la primera)
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        // Agregar productos
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (Stock: ${product.current_stock} ${product.unit})`;
            select.appendChild(option);
        });
    }
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// Generar PDF de pedido
async function generateOrderPDF(orderId) {
    try {
        const response = await apiCall('orders/pdf', 'POST', { order_id: orderId });
        if (response.success) {
            window.open(response.data.download_url, '_blank');
            showNotification('PDF generado exitosamente');
        } else {
            showNotification('Error al generar PDF', 'error');
        }
    } catch (error) {
        console.error('Error generando PDF:', error);
        showNotification('Error al generar PDF', 'error');
    }
}

// Generar reporte consolidado
async function generateConsolidatedReport() {
    const dateInput = document.getElementById('orders-date');
    const date = dateInput.value || new Date().toISOString().split('T')[0];
    
    try {
        const response = await apiCall('reports/consolidated', 'POST', { date: date });
        if (response.success) {
            window.open(response.data.download_url, '_blank');
            showNotification('Reporte consolidado generado exitosamente');
        } else {
            showNotification(response.message || 'Error al generar reporte', 'error');
        }
    } catch (error) {
        console.error('Error generando reporte:', error);
        showNotification('Error al generar reporte', 'error');
    }
}

// Cargar pedidos por fecha
async function loadOrdersByDate() {
    const dateInput = document.getElementById('orders-date');
    const date = dateInput.value;
    
    if (!date) return;
    
    try {
        const response = await apiCall(`orders/list?date=${date}`);
        if (response.success) {
            orders = response.data;
            renderOrdersTable();
        }
    } catch (error) {
        console.error('Error cargando pedidos por fecha:', error);
        showNotification('Error al cargar pedidos', 'error');
    }
}

// Refrescar datos
function refreshData() {
    const currentPage = document.querySelector('.nav-item.active').dataset.page;
    showPage(currentPage);
    updateLastUpdate();
    showNotification('Datos actualizados');
}

function updateLastUpdate() {
    const timestamp = document.getElementById('last-update');
    if (timestamp) {
        timestamp.textContent = `Última actualización: ${new Date().toLocaleTimeString()}`;
    }
}