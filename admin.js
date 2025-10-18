// Admin Panel JavaScript
let quotes = JSON.parse(localStorage.getItem('quotes')) || [];
let currentQuoteId = null;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    loadQuotes();
    updateStats();
    setupEventListeners();
});

// Load quotes from localStorage
function loadQuotes() {
    const tbody = document.getElementById('quotesTableBody');
    tbody.innerHTML = '';
    
    quotes.forEach(quote => {
        const row = createQuoteRow(quote);
        tbody.appendChild(row);
    });
}

// Create quote table row
function createQuoteRow(quote) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>#${quote.id}</td>
        <td>
            <div class="client-info">
                <strong>${quote.name}</strong>
                <small>${quote.email}</small>
            </div>
        </td>
        <td>${quote.company || 'N/A'}</td>
        <td>${getProjectTypeLabel(quote.projectType)}</td>
        <td>${getBudgetLabel(quote.budget)}</td>
        <td><span class="status-badge status-${quote.status}">${getStatusLabel(quote.status)}</span></td>
        <td>${formatDate(quote.date)}</td>
        <td>
            <button class="btn-small btn-primary" onclick="viewQuote(${quote.id})">
                <i class="fas fa-eye"></i>
            </button>
            <button class="btn-small btn-secondary" onclick="editQuote(${quote.id})">
                <i class="fas fa-edit"></i>
            </button>
        </td>
    `;
    return row;
}

// Get project type label
function getProjectTypeLabel(type) {
    const labels = {
        'sitio-web': 'Sitio Web',
        'app-movil': 'App Móvil',
        'app-web': 'App Web',
        'ecommerce': 'E-commerce',
        'sistema-empresarial': 'Sistema Empresarial',
        'otro': 'Otro'
    };
    return labels[type] || type;
}

// Get budget label
function getBudgetLabel(budget) {
    const labels = {
        'menos-1000': '< $1,000',
        '1000-5000': '$1,000 - $5,000',
        '5000-10000': '$5,000 - $10,000',
        '10000-25000': '$10,000 - $25,000',
        '25000-50000': '$25,000 - $50,000',
        'mas-50000': '> $50,000',
        'no-seguro': 'No especificado'
    };
    return labels[budget] || budget;
}

// Get status label
function getStatusLabel(status) {
    const labels = {
        'pending': 'Pendiente',
        'in-progress': 'En Proceso',
        'completed': 'Completada',
        'cancelled': 'Cancelada'
    };
    return labels[status] || status;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Update stats
function updateStats() {
    const total = quotes.length;
    const pending = quotes.filter(q => q.status === 'pending').length;
    const completed = quotes.filter(q => q.status === 'completed').length;
    
    document.getElementById('totalQuotes').textContent = total;
    document.getElementById('pendingQuotes').textContent = pending;
    document.getElementById('completedQuotes').textContent = completed;
    
    // Calculate total value (simplified)
    const totalValue = quotes.reduce((sum, quote) => {
        const values = {
            'menos-1000': 500,
            '1000-5000': 3000,
            '5000-10000': 7500,
            '10000-25000': 17500,
            '25000-50000': 37500,
            'mas-50000': 75000
        };
        return sum + (values[quote.budget] || 0);
    }, 0);
    
    document.getElementById('totalValue').textContent = `$${totalValue.toLocaleString()}`;
}

// Setup event listeners
function setupEventListeners() {
    // Status filter
    document.getElementById('statusFilter').addEventListener('change', filterQuotes);
    
    // Type filter
    document.getElementById('typeFilter').addEventListener('change', filterQuotes);
    
    // Search input
    document.getElementById('searchInput').addEventListener('input', filterQuotes);
}

// Filter quotes
function filterQuotes() {
    const statusFilter = document.getElementById('statusFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    const filteredQuotes = quotes.filter(quote => {
        const statusMatch = statusFilter === 'all' || quote.status === statusFilter;
        const typeMatch = typeFilter === 'all' || quote.projectType === typeFilter;
        const searchMatch = searchTerm === '' || 
            quote.name.toLowerCase().includes(searchTerm) ||
            quote.email.toLowerCase().includes(searchTerm) ||
            (quote.company && quote.company.toLowerCase().includes(searchTerm));
        
        return statusMatch && typeMatch && searchMatch;
    });
    
    displayFilteredQuotes(filteredQuotes);
}

// Display filtered quotes
function displayFilteredQuotes(filteredQuotes) {
    const tbody = document.getElementById('quotesTableBody');
    tbody.innerHTML = '';
    
    filteredQuotes.forEach(quote => {
        const row = createQuoteRow(quote);
        tbody.appendChild(row);
    });
}

// View quote details
function viewQuote(id) {
    const quote = quotes.find(q => q.id === id);
    if (!quote) return;
    
    currentQuoteId = id;
    const modal = document.getElementById('quoteDetailModal');
    const body = document.getElementById('quoteDetailBody');
    
    body.innerHTML = `
        <div class="quote-detail-section">
            <h3>Información del Cliente</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Nombre:</label>
                    <span>${quote.name}</span>
                </div>
                <div class="detail-item">
                    <label>Email:</label>
                    <span>${quote.email}</span>
                </div>
                <div class="detail-item">
                    <label>Teléfono:</label>
                    <span>${quote.phone}</span>
                </div>
                <div class="detail-item">
                    <label>Empresa:</label>
                    <span>${quote.company || 'N/A'}</span>
                </div>
            </div>
        </div>
        
        <div class="quote-detail-section">
            <h3>Información de la Empresa</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Tamaño:</label>
                    <span>${getCompanySizeLabel(quote.companySize)}</span>
                </div>
                <div class="detail-item">
                    <label>Industria:</label>
                    <span>${getIndustryLabel(quote.industry)}</span>
                </div>
                <div class="detail-item">
                    <label>Público objetivo:</label>
                    <span>${getTargetAudienceLabel(quote.targetAudience)}</span>
                </div>
            </div>
        </div>
        
        <div class="quote-detail-section">
            <h3>Detalles del Proyecto</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Tipo de proyecto:</label>
                    <span>${getProjectTypeLabel(quote.projectType)}</span>
                </div>
                <div class="detail-item">
                    <label>Presupuesto:</label>
                    <span>${getBudgetLabel(quote.budget)}</span>
                </div>
                <div class="detail-item">
                    <label>Fecha de inicio:</label>
                    <span>${getStartDateLabel(quote.startDate)}</span>
                </div>
                <div class="detail-item">
                    <label>Usuarios esperados:</label>
                    <span>${getUsersLabel(quote.users)}</span>
                </div>
            </div>
        </div>
        
        <div class="quote-detail-section">
            <h3>Objetivos del Proyecto</h3>
            <p class="quote-objectives">${quote.objectives || 'No especificado'}</p>
        </div>
        
        <div class="quote-detail-section">
            <h3>Detalles Adicionales</h3>
            <p class="quote-details">${quote.details || 'No especificado'}</p>
        </div>
        
        <div class="quote-detail-section">
            <h3>Estado Actual</h3>
            <select id="statusSelect" class="form-input">
                <option value="pending" ${quote.status === 'pending' ? 'selected' : ''}>Pendiente</option>
                <option value="in-progress" ${quote.status === 'in-progress' ? 'selected' : ''}>En Proceso</option>
                <option value="completed" ${quote.status === 'completed' ? 'selected' : ''}>Completada</option>
                <option value="cancelled" ${quote.status === 'cancelled' ? 'selected' : ''}>Cancelada</option>
            </select>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Get company size label
function getCompanySizeLabel(size) {
    const labels = {
        'freelancer': 'Freelancer/Independiente',
        '1-10': '1-10 empleados',
        '11-50': '11-50 empleados',
        '51-200': '51-200 empleados',
        '201-500': '201-500 empleados',
        '500+': 'Más de 500 empleados'
    };
    return labels[size] || size;
}

// Get industry label
function getIndustryLabel(industry) {
    const labels = {
        'tecnologia': 'Tecnología',
        'salud': 'Salud/Medicina',
        'finanzas': 'Finanzas/Banca',
        'educacion': 'Educación',
        'retail': 'Retail/Comercio',
        'restaurantes': 'Restaurantes/Gastronomía',
        'inmobiliaria': 'Inmobiliaria',
        'logistica': 'Logística/Transporte',
        'entretenimiento': 'Entretenimiento',
        'gobierno': 'Gobierno',
        'sin-fines-lucro': 'Sin fines de lucro',
        'otro': 'Otro'
    };
    return labels[industry] || industry;
}

// Get target audience label
function getTargetAudienceLabel(audience) {
    const labels = {
        'consumidores': 'Consumidores finales (B2C)',
        'empresas': 'Empresas (B2B)',
        'gobierno': 'Gobierno',
        'educacion': 'Estudiantes/Educación',
        'profesionales': 'Profesionales',
        'mixto': 'Mixto'
    };
    return labels[audience] || audience;
}

// Get start date label
function getStartDateLabel(date) {
    const labels = {
        'inmediato': 'Inmediatamente',
        '1-mes': 'En 1 mes',
        '2-3-meses': 'En 2-3 meses',
        '3-6-meses': 'En 3-6 meses',
        'mas-6-meses': 'Más de 6 meses',
        'no-seguro': 'No estoy seguro'
    };
    return labels[date] || date;
}

// Get users label
function getUsersLabel(users) {
    const labels = {
        'menos-100': 'Menos de 100 usuarios',
        '100-1000': '100 - 1,000 usuarios',
        '1000-10000': '1,000 - 10,000 usuarios',
        '10000-100000': '10,000 - 100,000 usuarios',
        'mas-100000': 'Más de 100,000 usuarios',
        'no-seguro': 'No estoy seguro'
    };
    return labels[users] || users;
}

// Close quote detail modal
function closeQuoteDetail() {
    const modal = document.getElementById('quoteDetailModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentQuoteId = null;
}

// Update quote status
function updateQuoteStatus() {
    if (!currentQuoteId) return;
    
    const newStatus = document.getElementById('statusSelect').value;
    const quoteIndex = quotes.findIndex(q => q.id === currentQuoteId);
    
    if (quoteIndex !== -1) {
        quotes[quoteIndex].status = newStatus;
        localStorage.setItem('quotes', JSON.stringify(quotes));
        loadQuotes();
        updateStats();
        closeQuoteDetail();
    }
}

// Edit quote
function editQuote(id) {
    // Implement edit functionality
    console.log('Edit quote:', id);
}

// Export quotes
function exportQuotes() {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cotizaciones-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Generate CSV content
function generateCSV() {
    const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Empresa', 'Tipo Proyecto', 'Presupuesto', 'Estado', 'Fecha'];
    const rows = quotes.map(quote => [
        quote.id,
        quote.name,
        quote.email,
        quote.phone,
        quote.company || '',
        getProjectTypeLabel(quote.projectType),
        getBudgetLabel(quote.budget),
        getStatusLabel(quote.status),
        formatDate(quote.date)
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}
