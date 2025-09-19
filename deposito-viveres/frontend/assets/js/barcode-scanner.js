
// Procesar código manual
async function processManualBarcode() {
    const input = document.getElementById('manual-barcode');
    const barcode = input.value.trim();
    
    if (!barcode) {
        showNotification('Ingresa un código válido', 'error');
        return;
    }
    
    await processBarcode(barcode);
    input.value = ''; // Limpiar input
}

// Procesar código de barras
async function processBarcode(barcode) {
    try {
        const response = await apiCall('inventory/barcode', 'POST', { barcode: barcode });
        
        if (response.success) {
            displayScannedProduct(response.data);
            showNotification('Producto encontrado');
        } else {
            showNotification('Producto no encontrado', 'error');
        }
    } catch (error) {
        console.error('Error procesando código:', error);
        showNotification('Error al procesar el código', 'error');
    }
}

// Mostrar producto escaneado
function displayScannedProduct(product) {
    const container = document.getElementById('scanned-product');
    const details = document.getElementById('scanned-product-details');
    
    if (!container || !details) return;
    
    details.innerHTML = `
        <div class="product-details">
            <h4>${product.name}</h4>
            <p><strong>Código:</strong> ${product.barcode || product.qr_code || 'N/A'}</p>
            <p><strong>Categoría:</strong> ${product.category_name || 'Sin categoría'}</p>
            <p><strong>Stock Actual:</strong> ${product.current_stock} ${product.unit}</p>
            <p><strong>Precio:</strong> ${formatCurrency(product.unit_price)}</p>
            
            <div class="product-actions" style="margin-top: 20px;">
                <button class="btn btn-primary" onclick="quickStockUpdate(${product.id})">
                    <i class="fas fa-edit"></i>
                    Actualizar Stock
                </button>
                <button class="btn btn-secondary" onclick="hideScannedProduct()">
                    <i class="fas fa-times"></i>
                    Cerrar
                </button>
            </div>
        </div>
    `;
    
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });
}

// Ocultar producto escaneado
function hideScannedProduct() {
    const container = document.getElementById('scanned-product');
    if (container) {
        container.style.display = 'none';
    }
}

// Actualización rápida de stock
function quickStockUpdate(productId) {
    // Pre-llenar el formulario de stock con el producto escaneado
    const stockProductSelect = document.getElementById('stock-product');
    if (stockProductSelect) {
        stockProductSelect.value = productId;
        
        // Trigger change event para mostrar stock actual
        const event = new Event('change');
        stockProductSelect.dispatchEvent(event);
    }
    
    // Mostrar modal de actualización de stock
    showStockUpdateModal();
    
    // Ocultar producto escaneado
    hideScannedProduct();
}

// Configurar eventos del escáner cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Configurar tecla Enter en input manual
    const manualInput = document.getElementById('manual-barcode');
    if (manualInput) {
        manualInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                processManualBarcode();
            }
        });
    }
});