let availableProducts = [];
let cart = [];
let userOrders = [];

// Inicializar portal de casa
function initCasaPortal() {
    if (!currentUser || currentUser.role !== 'casa') {
        redirectToLogin();
        return;
    }
    
    // Mostrar nombre de la casa
    const casaNameElement = document.getElementById('casa-name');
    if (casaNameElement) {
        casaNameElement.textContent = currentUser.casa_name || currentUser.username;
    }
    
    // Cargar datos iniciales
    loadCasaData();
    
    // Configurar eventos
    setupCasaEvents();
}

// Configurar eventos del portal de casa
function setupCasaEvents() {
    // Configurar búsqueda de productos
    const searchInput = document.getElementById('product-search');
    if (searchInput) {
        searchInput.addEventListener('input', filterCasaProducts);
    }
    
    // Configurar filtro de categoría
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterCasaProducts);
    }
}

// Cargar datos específicos de la casa
async function loadCasaData() {
    try {
        // Cargar productos disponibles para esta casa
        const productsResponse = await apiCall('inventory/products');
        if (productsResponse.success) {
            availableProducts = productsResponse.data;
            renderProductsGrid();
            loadCasaCategories();
        }
        
        // Cargar historial de pedidos
        loadOrderHistory();
        
    } catch (error) {
        console.error('Error cargando datos de la casa:', error);
        showNotification('Error al cargar los datos', 'error');
    }
}

// Cargar categorías disponibles
function loadCasaCategories() {
    const categoryFilter = document.getElementById('category-filter');
    if (!categoryFilter) return;
    
    // Obtener categorías únicas de los productos disponibles
    const categories = [...new Set(availableProducts.map(p => p.category_name).filter(Boolean))];
    
    // Limpiar opciones existentes (excepto "Todas las categorías")
    while (categoryFilter.children.length > 1) {
        categoryFilter.removeChild(categoryFilter.lastChild);
    }
    
    // Agregar categorías
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Renderizar grid de productos
function renderProductsGrid() {
    const container = document.getElementById('products-grid');
    if (!container) return;
    
    if (availableProducts.length === 0) {
        container.innerHTML = `
            <div class="text-center" style="grid-column: 1 / -1; padding: 40px;">
                <i class="fas fa-box-open" style="font-size: 3rem; color: #9ca3af; margin-bottom: 16px;"></i>
                <p style="color: #6b7280;">No hay productos disponibles para tu casa</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = availableProducts.map(product => `
        <div class="product-card">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description || ''}</p>
                <div class="product-meta">
                    <span class="product-price">${formatCurrency(product.unit_price)}</span>
                    <span class="product-stock">Stock: ${product.current_stock} ${product.unit}</span>
                </div>
                <div class="product-actions">
                    <input type="number" 
                           class="quantity-input" 
                           id="qty-${product.id}" 
                           min="1" 
                           max="${product.current_stock}" 
                           value="1">
                    <button class="btn btn-primary" 
                            onclick="addToCart(${product.id})"
                            ${product.current_stock <= 0 ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus"></i>
                        ${product.current_stock <= 0 ? 'Sin Stock' : 'Agregar'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');}
// Filtrar productos
function filterCasaProducts() {
const search = document.getElementById('product-search').value.toLowerCase();
const categoryFilter = document.getElementById('category-filter').value;
let filteredProducts = availableProducts;

// Filtrar por búsqueda
if (search) {
    filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(search) ||
        (product.description && product.description.toLowerCase().includes(search))
    );
}

// Filtrar por categoría
if (categoryFilter) {
    filteredProducts = filteredProducts.filter(product => 
        product.category_name === categoryFilter
    );
}

// Renderizar productos filtrados
const originalProducts = availableProducts;
availableProducts = filteredProducts;
renderProductsGrid();
availableProducts = originalProducts;
}
// Agregar producto al carrito
function addToCart(productId) {
const product = availableProducts.find(p => p.id === productId);
if (!product) return;
const quantityInput = document.getElementById(`qty-${productId}`);
const quantity = parseInt(quantityInput.value) || 1;

// Verificar stock disponible
if (quantity > product.current_stock) {
    showNotification('Cantidad solicitada excede el stock disponible', 'error');
    return;
}

// Verificar si el producto ya está en el carrito
const existingItem = cart.find(item => item.product_id === productId);

if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > product.current_stock) {
        showNotification('No puedes agregar más de este producto', 'error');
        return;
    }
    existingItem.quantity = newQuantity;
} else {
    cart.push({
        product_id: productId,
        product_name: product.name,
        unit_price: product.unit_price,
        unit: product.unit,
        quantity: quantity,
        max_stock: product.current_stock
    });
}

updateCartDisplay();
showNotification(`${product.name} agregado al carrito`);

// Resetear cantidad a 1
quantityInput.value = 1;
}
// Actualizar display del carrito
function updateCartDisplay() {
// Actualizar contador
const cartCount = document.getElementById('cart-count');
if (cartCount) {
cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
}
// Actualizar items del carrito
const cartItems = document.getElementById('cart-items');
if (cartItems) {
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-center" style="color: #6b7280;">Tu carrito está vacío</p>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <strong>${item.product_name}</strong><br>
                    <small>${formatCurrency(item.unit_price)} x ${item.quantity} ${item.unit}</small>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-controls">
                        <button class="btn btn-sm" onclick="updateCartItemQuantity(${item.product_id}, -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span>${item.quantity}</span>
                        <button class="btn btn-sm" onclick="updateCartItemQuantity(${item.product_id}, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.product_id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Actualizar resumen
updateCartSummary();
}
// Actualizar cantidad de item en carrito
function updateCartItemQuantity(productId, change) {
const item = cart.find(item => item.product_id === productId);
if (!item) return;
const newQuantity = item.quantity + change;

if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
}

if (newQuantity > item.max_stock) {
    showNotification('Cantidad excede el stock disponible', 'error');
    return;
}

item.quantity = newQuantity;
updateCartDisplay();
}
// Remover producto del carrito
function removeFromCart(productId) {
cart = cart.filter(item => item.product_id !== productId);
updateCartDisplay();
showNotification('Producto removido del carrito');
}
// Actualizar resumen del carrito
function updateCartSummary() {
const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
const totalAmount = cart.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
const totalItemsElement = document.getElementById('total-items');
const totalAmountElement = document.getElementById('total-amount');

if (totalItemsElement) {
    totalItemsElement.textContent = totalItems;
}

if (totalAmountElement) {
    totalAmountElement.textContent = formatCurrency(totalAmount);
}

// Habilitar/deshabilitar botón de confirmar
const confirmButton = document.getElementById('confirm-order-btn');
if (confirmButton) {
    confirmButton.disabled = cart.length === 0;
}
}
// Limpiar carrito
function clearCart() {
cart = [];
updateCartDisplay();
showNotification('Carrito limpiado');
}
// Mostrar/ocultar carrito
function toggleCart() {
const cartSidebar = document.getElementById('cart-sidebar');
if (cartSidebar) {
cartSidebar.classList.toggle('open');
}
}
// Confirmar pedido
async function confirmOrder() {
if (cart.length === 0) {
showNotification('Tu carrito está vacío', 'error');
return;
}
const notes = document.getElementById('order-notes').value;

const orderData = {
    items: cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
    })),
    notes: notes || null
};

try {
    const response = await apiCall('orders/create', 'POST', orderData);
    if (response.success) {
        // Mostrar modal de confirmación
        showOrderConfirmation(response.data);
        
        // Limpiar carrito
        clearCart();
        toggleCart();
        
        // Recargar productos (stock actualizado)
        loadCasaData();
        
    } else {
        showNotification(response.message || 'Error al crear el pedido', 'error');
    }
} catch (error) {
    console.error('Error creando pedido:', error);
    showNotification('Error al crear el pedido', 'error');
}
}
// Mostrar confirmación de pedido
function showOrderConfirmation(orderData) {
document.getElementById('confirmed-order-number').textContent = orderData.order_number;
document.getElementById('confirmed-total-items').textContent = orderData.total_items;
document.getElementById('confirmed-total-amount').textContent = formatCurrency(orderData.total_amount);
// Guardar ID del pedido para descargar PDF
window.lastOrderId = orderData.order_id;

showModal('order-confirmation-modal');
}
// Descargar PDF del pedido
async function downloadOrderPDF() {
if (!window.lastOrderId) {
showNotification('Error: ID de pedido no encontrado', 'error');
return;
}
try {
    const response = await apiCall('orders/pdf', 'POST', { order_id: window.lastOrderId });
    if (response.success) {
        window.open(response.data.download_url, '_blank');
        showNotification('PDF descargado exitosamente');
    } else {
        showNotification('Error al generar PDF', 'error');
    }
} catch (error) {
    console.error('Error descargando PDF:', error);
    showNotification('Error al descargar PDF', 'error');
}
}
// Cargar historial de pedidos
async function loadOrderHistory() {
try {
const response = await apiCall('orders/list');
if (response.success) {
userOrders = response.data;
renderOrderHistory();
}
} catch (error) {
console.error('Error cargando historial de pedidos:', error);
showNotification('Error al cargar historial', 'error');
}
}
// Renderizar historial de pedidos
function renderOrderHistory() {
const container = document.getElementById('order-history');
if (!container) return;
if (userOrders.length === 0) {
    container.innerHTML = `
        <div class="text-center" style="padding: 40px;">
            <i class="fas fa-clipboard-list" style="font-size: 3rem; color: #9ca3af; margin-bottom: 16px;"></i>
            <p style="color: #6b7280;">No tienes pedidos aún</p>
        </div>
    `;
    return;
}

container.innerHTML = userOrders.map(order => `
    <div class="order-card">
        <div class="order-header">
            <div>
                <span class="order-number">#${order.order_number}</span>
                <span class="badge ${getStatusBadgeClass(order.status)}">${order.status.toUpperCase()}</span>
            </div>
            <span class="order-date">${formatDate(order.created_at)}</span>
        </div>
        <div class="order-summary">
            <span>${order.total_items} items</span>
            <span><strong>${formatCurrency(order.total_amount)}</strong></span>
            <button class="btn btn-sm btn-primary" onclick="downloadOrderPDFById(${order.id})">
                <i class="fas fa-download"></i> PDF
            </button>
        </div>
    </div>
`).join('');
}
// Descargar PDF por ID de pedido
async function downloadOrderPDFById(orderId) {
try {
const response = await apiCall('orders/pdf', 'POST', { order_id: orderId });
if (response.success) {
window.open(response.data.download_url, '_blank');
} else {
showNotification('Error al generar PDF', 'error');
}
} catch (error) {
console.error('Error descargando PDF:', error);
showNotification('Error al descargar PDF', 'error');
}
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
// Refrescar productos
function refreshProducts() {
loadCasaData();
showNotification('Productos actualizados');
}
// Refrescar historial de pedidos
function refreshOrderHistory() {
loadOrderHistory();
showNotification('Historial actualizado');
}
// Mostrar modal
function showModal(modalId) {
const modal = document.getElementById(modalId);
if (modal) {
modal.classList.add('show');
}
}
// Cerrar modal
function closeModal(modalId) {
const modal = document.getElementById(modalId);
if (modal) {
modal.classList.remove('show');
}
}