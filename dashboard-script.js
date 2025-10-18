// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard loaded successfully');
    
    // Initialize dashboard
    initializeDashboard();
    
    // Setup navigation
    setupNavigation();
    
    // Setup user interactions
    setupUserInteractions();
});

// Initialize dashboard
function initializeDashboard() {
    // Check if user is logged in
    const isLoggedIn = checkAuthStatus();
    
    if (!isLoggedIn) {
        // Redirect to login if not authenticated
        window.location.href = 'index.html';
        return;
    }
    
    // Load user data
    loadUserData();
    
    // Load dashboard data
    loadDashboardData();
}

// Check authentication status
function checkAuthStatus() {
    // In a real app, this would check Firebase auth
    // For now, we'll use localStorage to simulate login
    const user = localStorage.getItem('user');
    return user !== null;
}

// Load user data
function loadUserData() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Update user info in header
    const userName = document.querySelector('.user-name');
    const userEmail = document.querySelector('.user-email');
    const userAvatar = document.querySelector('.user-avatar');
    
    if (userName) userName.textContent = user.name || 'Cliente';
    if (userEmail) userEmail.textContent = user.email || 'cliente@ejemplo.com';
    
    // Update avatar if user has Google photo
    if (userAvatar && user.photoURL) {
        userAvatar.innerHTML = `<img src="${user.photoURL}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    }
    
    // Check admin access and add admin button
    checkAdminAccess(user.email);
}

// Load dashboard data
function loadDashboardData() {
    // Simulate loading data
    console.log('Loading dashboard data...');
    
    // Animate stats cards
    animateStatsCards();
    
    // Load projects
    loadProjects();
    
    // Load messages
    loadMessages();
    
    // Load files
    loadFiles();
}

// Setup navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.dashboard-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get section name
            const sectionName = this.getAttribute('data-section');
            
            // Hide all sections
            sections.forEach(section => section.classList.remove('active'));
            
            // Show selected section
            const targetSection = document.getElementById(sectionName);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

// Setup user interactions
function setupUserInteractions() {
    // Logout button
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // New project button
    const newProjectBtn = document.querySelector('[data-section="projects"] .btn-primary');
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', createNewProject);
    }
    
    // New message button
    const newMessageBtn = document.querySelector('[data-section="messages"] .btn-primary');
    if (newMessageBtn) {
        newMessageBtn.addEventListener('click', createNewMessage);
    }
    
    // Upload file button
    const uploadFileBtn = document.querySelector('[data-section="files"] .btn-primary');
    if (uploadFileBtn) {
        uploadFileBtn.addEventListener('click', uploadFile);
    }
    
    // Save settings button
    const saveSettingsBtn = document.querySelector('#settings .btn-primary');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettings);
    }
    
    // Gallery upload button
    const uploadGalleryBtn = document.querySelector('[data-section="gallery"] .btn-primary');
    if (uploadGalleryBtn) {
        uploadGalleryBtn.addEventListener('click', uploadGalleryImage);
    }
    
    // Gallery filters
    setupGalleryFilters();
}

// Animate stats cards
function animateStatsCards() {
    const statCards = document.querySelectorAll('.stat-card');
    
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Load projects
function loadProjects() {
    // Simulate loading projects
    console.log('Loading projects...');
    
    // Add click handlers to project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('click', function() {
            const projectName = this.querySelector('h3').textContent;
            showProjectDetails(projectName);
        });
    });
}

// Load messages
function loadMessages() {
    // Simulate loading messages
    console.log('Loading messages...');
    
    // Add click handlers to message items
    const messageItems = document.querySelectorAll('.message-item');
    messageItems.forEach(item => {
        item.addEventListener('click', function() {
            const sender = this.querySelector('h4').textContent;
            const message = this.querySelector('p').textContent;
            showMessageDetails(sender, message);
        });
    });
}

// Load files
function loadFiles() {
    // Simulate loading files
    console.log('Loading files...');
    
    // Add click handlers to file items
    const fileItems = document.querySelectorAll('.file-item');
    fileItems.forEach(item => {
        const downloadBtn = item.querySelector('.btn-download');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const fileName = item.querySelector('h4').textContent;
                downloadFile(fileName);
            });
        }
    });
}

// Logout function
function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        // Clear user data
        localStorage.removeItem('user');
        
        // Show notification
        showNotification('Sesión cerrada exitosamente', 'success');
        
        // Redirect to main page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Create new project
function createNewProject() {
    const projectName = prompt('Nombre del nuevo proyecto:');
    if (projectName) {
        showNotification(`Proyecto "${projectName}" creado exitosamente`, 'success');
        // In a real app, this would make an API call
    }
}

// Create new message
function createNewMessage() {
    const message = prompt('Escribe tu mensaje:');
    if (message) {
        showNotification('Mensaje enviado exitosamente', 'success');
        // In a real app, this would make an API call
    }
}

// Upload file
function uploadFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    
    input.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            showNotification(`${files.length} archivo(s) subido(s) exitosamente`, 'success');
            // In a real app, this would upload to the server
        }
    });
    
    input.click();
}

// Save settings
function saveSettings() {
    const userName = document.getElementById('userName').value;
    const userEmail = document.getElementById('userEmail').value;
    const userPhone = document.getElementById('userPhone').value;
    
    // Update user data
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.name = userName;
    user.email = userEmail;
    user.phone = userPhone;
    
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update header
    loadUserData();
    
    showNotification('Configuración guardada exitosamente', 'success');
}

// Show project details
function showProjectDetails(projectName) {
    alert(`Detalles del proyecto: ${projectName}\n\nEn una aplicación real, esto abriría un modal con información detallada del proyecto.`);
}

// Show message details
function showMessageDetails(sender, message) {
    alert(`Mensaje de: ${sender}\n\n${message}\n\nEn una aplicación real, esto abriría un modal con el mensaje completo.`);
}

// Download file
function downloadFile(fileName) {
    showNotification(`Descargando ${fileName}...`, 'info');
    // In a real app, this would trigger the actual download
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        z-index: 3000;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Gallery Functions
function setupGalleryFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter gallery items
            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeInUp 0.5s ease-out';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

function openImageModal(button) {
    const galleryItem = button.closest('.gallery-item');
    const img = galleryItem.querySelector('img');
    const title = galleryItem.querySelector('h4').textContent;
    const description = galleryItem.querySelector('p').textContent;
    
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    
    modalImg.src = img.src;
    modalImg.alt = img.alt;
    modalTitle.textContent = title;
    modalDescription.textContent = description;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function downloadImage(button) {
    const galleryItem = button.closest('.gallery-item');
    const img = galleryItem.querySelector('img');
    const title = galleryItem.querySelector('h4').textContent;
    
    // Create download link
    const link = document.createElement('a');
    link.href = img.src;
    link.download = `${title}.jpg`;
    link.click();
    
    showNotification(`Descargando ${title}...`, 'info');
}

function downloadCurrentImage() {
    const modalImg = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle').textContent;
    
    const link = document.createElement('a');
    link.href = modalImg.src;
    link.download = `${modalTitle}.jpg`;
    link.click();
    
    showNotification(`Descargando ${modalTitle}...`, 'info');
}

function shareImage() {
    const modalImg = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle').textContent;
    
    if (navigator.share) {
        navigator.share({
            title: modalTitle,
            text: `Mira esta captura del proyecto: ${modalTitle}`,
            url: modalImg.src
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(modalImg.src).then(() => {
            showNotification('Enlace copiado al portapapeles', 'success');
        });
    }
}

function uploadGalleryImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            showNotification(`${files.length} imagen(es) subida(s) exitosamente`, 'success');
            // In a real app, this would upload to the server
        }
    });
    
    input.click();
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('imageModal');
    if (e.target === modal) {
        closeImageModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeImageModal();
    }
});

// File Upload Modal Functions
let selectedFile = null;
let currentUploadType = 'photo';

function openFileUploadModal() {
    const modal = document.getElementById('fileUploadModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Reset form
    resetFileUploadForm();
}

function closeFileUploadModal() {
    const modal = document.getElementById('fileUploadModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Reset form
    resetFileUploadForm();
}

function resetFileUploadForm() {
    selectedFile = null;
    currentUploadType = 'photo';
    
    // Reset file inputs
    document.getElementById('photoInput').value = '';
    document.getElementById('fileInput').value = '';
    document.getElementById('audioInput').value = '';
    
    // Reset form fields
    document.getElementById('fileName').value = '';
    document.getElementById('fileDescription').value = '';
    document.getElementById('fileCategory').value = 'general';
    
    // Reset previews
    document.getElementById('photoPreview').innerHTML = '';
    document.getElementById('photoPreview').classList.remove('active');
    document.getElementById('filePreview').innerHTML = '';
    document.getElementById('filePreview').classList.remove('active');
    document.getElementById('audioPreview').innerHTML = '';
    document.getElementById('audioPreview').classList.remove('active');
    
    // Reset tabs
    switchUploadTab('photo');
    
    // Disable upload button
    document.getElementById('uploadBtn').disabled = true;
}

function switchUploadTab(type) {
    currentUploadType = type;
    
    // Update tabs
    document.querySelectorAll('.upload-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`[onclick="switchUploadTab('${type}')"]`).classList.add('active');
    
    // Update sections
    document.querySelectorAll('.upload-section').forEach(section => section.classList.remove('active'));
    document.getElementById(`${type}Upload`).classList.add('active');
    
    // Clear previews
    document.querySelectorAll('.file-preview').forEach(preview => {
        preview.innerHTML = '';
        preview.classList.remove('active');
    });
    
    // Reset selected file
    selectedFile = null;
    document.getElementById('uploadBtn').disabled = true;
}

function handleFileSelect(input, type) {
    const file = input.files[0];
    if (!file) return;
    
    // Validate file type and size
    if (!validateFile(file, type)) return;
    
    selectedFile = file;
    
    // Show preview
    showFilePreview(file, type);
    
    // Auto-fill filename if empty
    if (!document.getElementById('fileName').value) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        document.getElementById('fileName').value = nameWithoutExt;
    }
    
    // Enable upload button
    document.getElementById('uploadBtn').disabled = false;
}

function validateFile(file, type) {
    const maxSizes = {
        photo: 10 * 1024 * 1024, // 10MB
        file: 50 * 1024 * 1024,  // 50MB
        audio: 100 * 1024 * 1024 // 100MB
    };
    
    if (file.size > maxSizes[type]) {
        showNotification(`El archivo es demasiado grande. Máximo ${maxSizes[type] / (1024 * 1024)}MB`, 'error');
        return false;
    }
    
    return true;
}

function showFilePreview(file, type) {
    const previewContainer = document.getElementById(`${type}Preview`);
    const fileSize = formatFileSize(file.size);
    
    let iconClass = 'fas fa-file';
    if (type === 'photo') iconClass = 'fas fa-image';
    else if (type === 'audio') iconClass = 'fas fa-music';
    
    previewContainer.innerHTML = `
        <div class="file-preview-item">
            <div class="file-preview-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="file-preview-info">
                <div class="file-preview-name">${file.name}</div>
                <div class="file-preview-size">${fileSize}</div>
            </div>
            <button class="file-preview-remove" onclick="removeFilePreview('${type}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    previewContainer.classList.add('active');
}

function removeFilePreview(type) {
    selectedFile = null;
    document.getElementById(`${type}Preview`).innerHTML = '';
    document.getElementById(`${type}Preview`).classList.remove('active');
    document.getElementById(`${type}Input`).value = '';
    document.getElementById('uploadBtn').disabled = true;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function uploadFile() {
    if (!selectedFile) {
        showNotification('Por favor selecciona un archivo', 'error');
        return;
    }
    
    const fileName = document.getElementById('fileName').value.trim();
    const description = document.getElementById('fileDescription').value.trim();
    const category = document.getElementById('fileCategory').value;
    
    if (!fileName) {
        showNotification('Por favor ingresa un nombre para el archivo', 'error');
        return;
    }
    
    try {
        // Show loading state
        const uploadBtn = document.getElementById('uploadBtn');
        const originalText = uploadBtn.innerHTML;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo...';
        uploadBtn.disabled = true;
        
        // Get current user
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.email || 'anonymous';
        
        // Upload to Backblaze B2
        const fileData = await uploadFileToB2(selectedFile, userId);
        
        // Save metadata to Firestore
        await saveFileMetadata({
            id: Date.now().toString(),
            name: fileName,
            originalName: selectedFile.name,
            description: description,
            category: category,
            type: currentUploadType,
            size: selectedFile.size,
            mimeType: selectedFile.type,
            url: fileData.url,
            b2Key: fileData.key,
            userId: userId,
            uploadedBy: user.name || 'Usuario',
            uploadedAt: new Date().toISOString(),
            status: 'active'
        });
        
        showNotification('Archivo subido exitosamente', 'success');
        closeFileUploadModal();
        
        // Reload files section
        loadFiles();
        
    } catch (error) {
        console.error('Upload error:', error);
        showNotification('Error al subir archivo: ' + error.message, 'error');
        
        // Reset button
        const uploadBtn = document.getElementById('uploadBtn');
        uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Subir Archivo';
        uploadBtn.disabled = false;
    }
}

async function uploadFileToB2(file, userId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('type', currentUploadType);
    
    const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        throw new Error('Error al subir archivo a B2');
    }
    
    return await response.json();
}

async function saveFileMetadata(fileData) {
    const { addDoc, collection } = await import('firebase/firestore');
    const { db } = await import('./firebase-config.js');
    
    await addDoc(collection(db, 'files'), fileData);
}

async function loadFiles() {
    try {
        const { getDocs, collection, query, where } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        const filesQuery = query(
            collection(db, 'files'),
            where('userId', '==', user.email || 'anonymous')
        );
        
        const filesSnapshot = await getDocs(filesQuery);
        const filesContainer = document.querySelector('.files-grid');
        
        if (filesContainer) {
            filesContainer.innerHTML = '';
            
            if (filesSnapshot.empty) {
                filesContainer.innerHTML = `
                    <div class="no-files">
                        <i class="fas fa-folder-open"></i>
                        <p>No hay archivos subidos aún</p>
                        <button class="btn-primary" onclick="openFileUploadModal()">
                            <i class="fas fa-upload"></i>
                            Subir Primer Archivo
                        </button>
                    </div>
                `;
            } else {
                filesSnapshot.forEach(doc => {
                    const file = doc.data();
                    const fileItem = createFileItem(file);
                    filesContainer.appendChild(fileItem);
                });
            }
        }
    } catch (error) {
        console.error('Error loading files:', error);
    }
}

function createFileItem(file) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    let iconClass = 'fas fa-file';
    if (file.type === 'photo') iconClass = 'fas fa-image';
    else if (file.type === 'audio') iconClass = 'fas fa-music';
    
    const uploadDate = new Date(file.uploadedAt).toLocaleDateString('es-ES');
    const fileSize = formatFileSize(file.size);
    
    fileItem.innerHTML = `
        <div class="file-icon">
            <i class="${iconClass}"></i>
        </div>
        <div class="file-info">
            <h3>${file.name}</h3>
            <p>${file.description || 'Sin descripción'}</p>
            <div class="file-meta">
                <span class="file-size">${fileSize}</span>
                <span class="file-date">${uploadDate}</span>
                <span class="file-category">${file.category}</span>
            </div>
        </div>
        <div class="file-actions">
            <button class="btn-secondary" onclick="downloadFile('${file.url}', '${file.originalName}')">
                <i class="fas fa-download"></i>
            </button>
            <button class="btn-danger" onclick="deleteFile('${file.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return fileItem;
}

async function downloadFile(url, filename) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        
        showNotification('Archivo descargado exitosamente', 'success');
    } catch (error) {
        console.error('Download error:', error);
        showNotification('Error al descargar archivo', 'error');
    }
}

async function deleteFile(fileId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
        return;
    }
    
    try {
        const { deleteDoc, doc } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');
        
        await deleteDoc(doc(db, 'files', fileId));
        showNotification('Archivo eliminado exitosamente', 'success');
        loadFiles(); // Reload files
    } catch (error) {
        console.error('Delete error:', error);
        showNotification('Error al eliminar archivo', 'error');
    }
}

// Admin Functions
function checkAdminAccess(userEmail) {
    const adminEmail = 'ueservicesllc1@gmail.com';
    
    if (userEmail === adminEmail) {
        // Add admin button to header
        addAdminButton();
    }
}

// Add admin button
function addAdminButton() {
    const authButtons = document.querySelector('.auth-buttons-container');
    
    if (authButtons && !document.querySelector('.admin-btn')) {
        const adminBtn = document.createElement('button');
        adminBtn.className = 'admin-btn';
        adminBtn.innerHTML = '<i class="fas fa-cog"></i> Admin';
        adminBtn.onclick = () => window.location.href = 'admin-dashboard.html';
        
        authButtons.appendChild(adminBtn);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .admin-btn {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 30px;
        font-weight: 600;
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
        backdrop-filter: blur(10px);
    }

    .admin-btn:hover {
        background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
    }
`;
document.head.appendChild(style);
