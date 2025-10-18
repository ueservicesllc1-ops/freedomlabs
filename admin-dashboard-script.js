// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Dashboard loaded successfully');
    
    // Check admin access
    checkAdminAccess();
    
    // Initialize dashboard
    initializeAdminDashboard();
    
    // Setup navigation
    setupAdminNavigation();
    
    // Setup interactions
    setupAdminInteractions();
    
    // Load data
    loadAdminData();
});

// Check admin access
function checkAdminAccess() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const adminEmail = 'ueservicesllc1@gmail.com';
    
    if (user.email !== adminEmail) {
        // Redirect to main page if not admin
        window.location.href = 'index.html';
        return;
    }
    
    console.log('Admin access granted');
}

// Initialize admin dashboard
function initializeAdminDashboard() {
    // Load admin data
    loadAdminData();
    
    // Setup real-time updates
    setupRealTimeUpdates();
}

// Setup navigation
function setupAdminNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.admin-section');
    
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

// Setup admin interactions
function setupAdminInteractions() {
    // Logout button
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // User search
    const userSearch = document.getElementById('userSearch');
    if (userSearch) {
        userSearch.addEventListener('input', filterUsers);
    }
    
    // Chat search
    const chatSearch = document.getElementById('chatSearch');
    if (chatSearch) {
        chatSearch.addEventListener('input', filterChats);
    }
    
    // Message input
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Chat items
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
        item.addEventListener('click', function() {
            const userId = this.getAttribute('data-user');
            openChat(userId);
        });
    });
}

// Load admin data
function loadAdminData() {
    // Load stats
    loadStats();
    
    // Load users
    loadUsers();
    
    // Load projects
    loadProjects();
    
    // Load files
    loadFiles();
    
    // Load messages
    loadMessages();
    
    // Load recent activity
    loadRecentActivity();
}

// Load stats
function loadStats() {
    // Simulate loading stats
    const stats = {
        users: 25,
        projects: 12,
        files: 48,
        messages: 8
    };
    
    document.getElementById('totalUsers').textContent = stats.users;
    document.getElementById('totalProjects').textContent = stats.projects;
    document.getElementById('totalFiles').textContent = stats.files;
    document.getElementById('totalMessages').textContent = stats.messages;
    
    // Update badges
    document.getElementById('usersBadge').textContent = stats.users;
    document.getElementById('projectsBadge').textContent = stats.projects;
    document.getElementById('filesBadge').textContent = stats.files;
    document.getElementById('messagesBadge').textContent = stats.messages;
}

// Load users
function loadUsers() {
    const users = [
        {
            id: 1,
            name: 'Juan Pérez',
            email: 'juan@ejemplo.com',
            projects: 3,
            lastActivity: 'Hace 2 horas',
            status: 'active'
        },
        {
            id: 2,
            name: 'María García',
            email: 'maria@ejemplo.com',
            projects: 2,
            lastActivity: 'Hace 1 día',
            status: 'active'
        },
        {
            id: 3,
            name: 'Carlos López',
            email: 'carlos@ejemplo.com',
            projects: 1,
            lastActivity: 'Hace 3 días',
            status: 'inactive'
        }
    ];
    
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="user-info">
                    <div class="user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <div class="user-name">${user.name}</div>
                    </div>
                </div>
            </td>
            <td>${user.email}</td>
            <td>${user.projects}</td>
            <td>${user.lastActivity}</td>
            <td>
                <span class="status-badge ${user.status}">${user.status === 'active' ? 'Activo' : 'Inactivo'}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-secondary" onclick="viewUser(${user.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-primary" onclick="editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load projects
function loadProjects() {
    // Projects are already in HTML, just add event listeners
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('click', function() {
            const projectId = this.getAttribute('data-project-id') || '1';
            viewProject(projectId);
        });
    });
}

// Load files from Firestore
async function loadFiles() {
    try {
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');
        
        const filesQuery = collection(db, 'files');
        const filesSnapshot = await getDocs(filesQuery);
        const filesContainer = document.getElementById('files-grid');
        
        if (!filesContainer) {
            console.warn('Files container not found, skipping files load');
            return;
        }
        
        filesContainer.innerHTML = '';
        
        if (filesSnapshot.empty) {
            filesContainer.innerHTML = `
                <div class="no-files">
                    <i class="fas fa-folder-open"></i>
                    <p>No hay archivos subidos aún</p>
                </div>
            `;
        } else {
            // Sort files by upload date (newest first)
            const files = [];
            filesSnapshot.forEach(doc => {
                const fileData = doc.data();
                fileData.id = doc.id;
                files.push(fileData);
            });
            
            files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
            
            files.forEach(file => {
                const fileDiv = document.createElement('div');
                fileDiv.className = 'file-item';
                
                const uploadDate = new Date(file.uploadedAt).toLocaleDateString('es-ES');
                const fileSize = formatFileSize(file.size);
                
                fileDiv.innerHTML = `
                    <div class="file-icon">
                        <i class="fas fa-${getFileIcon(file.type)}"></i>
                    </div>
                    <div class="file-content">
                        <h4>${file.name}</h4>
                        <p>Subido por: ${file.uploadedBy} (${file.userId})</p>
                        <p>Descripción: ${file.description || 'Sin descripción'}</p>
                        <span class="file-meta">${fileSize} • ${uploadDate} • ${file.category}</span>
                        <div class="file-actions">
                            <button class="btn-secondary" onclick="downloadFileFromAdmin('${file.url}', '${file.originalName}')">
                                <i class="fas fa-download"></i>
                                Descargar
                            </button>
                            <button class="btn-danger" onclick="deleteFileFromAdmin('${file.id}')">
                                <i class="fas fa-trash"></i>
                                Eliminar
                            </button>
                        </div>
                    </div>
                `;
                filesContainer.appendChild(fileDiv);
            });
        }
    } catch (error) {
        console.error('Error loading files:', error);
        showNotification('Error al cargar archivos', 'error');
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function downloadFileFromAdmin(url, filename) {
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

async function deleteFileFromAdmin(fileId) {
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

// Load messages
function loadMessages() {
    // Messages are already in HTML, just add event listeners
    const messageItems = document.querySelectorAll('.message-item');
    messageItems.forEach(item => {
        const replyBtn = item.querySelector('.btn-primary');
        if (replyBtn) {
            replyBtn.addEventListener('click', function() {
                const messageId = item.getAttribute('data-message-id') || '1';
                replyMessage(messageId);
            });
        }
    });
}

// Load recent activity
function loadRecentActivity() {
    const activities = [
        {
            icon: 'fas fa-user-plus',
            title: 'Nuevo usuario registrado',
            description: 'María García se registró en el sistema',
            time: 'Hace 1 hora'
        },
        {
            icon: 'fas fa-file-upload',
            title: 'Archivo subido',
            description: 'Juan Pérez subió un nuevo archivo al proyecto',
            time: 'Hace 2 horas'
        },
        {
            icon: 'fas fa-envelope',
            title: 'Nuevo mensaje',
            description: 'Carlos López envió un mensaje',
            time: 'Hace 3 horas'
        }
    ];
    
    const activityList = document.getElementById('recentActivity');
    activityList.innerHTML = '';
    
    activities.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div class="activity-icon">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
                <span class="activity-time">${activity.time}</span>
            </div>
        `;
        activityList.appendChild(item);
    });
}

// Setup real-time updates
function setupRealTimeUpdates() {
    // Simulate real-time updates
    setInterval(() => {
        updateNotifications();
    }, 30000); // Update every 30 seconds
}

// Update notifications
function updateNotifications() {
    // Simulate new notifications
    const badges = document.querySelectorAll('.notification-badge');
    badges.forEach(badge => {
        const currentCount = parseInt(badge.textContent) || 0;
        if (Math.random() > 0.7) { // 30% chance of new notification
            badge.textContent = currentCount + 1;
            badge.style.animation = 'pulse 0.5s ease-in-out';
        }
    });
}

// Filter users
function filterUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#usersTableBody tr');
    
    rows.forEach(row => {
        const userName = row.querySelector('.user-name').textContent.toLowerCase();
        const userEmail = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        
        if (userName.includes(searchTerm) || userEmail.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Filter chats
function filterChats() {
    const searchTerm = document.getElementById('chatSearch').value.toLowerCase();
    const chatItems = document.querySelectorAll('.chat-item');
    
    chatItems.forEach(item => {
        const userName = item.querySelector('h4').textContent.toLowerCase();
        const lastMessage = item.querySelector('p').textContent.toLowerCase();
        
        if (userName.includes(searchTerm) || lastMessage.includes(searchTerm)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

// Open chat
function openChat(userId) {
    // Remove active class from all chat items
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to selected chat
    const selectedChat = document.querySelector(`[data-user="${userId}"]`);
    if (selectedChat) {
        selectedChat.classList.add('active');
    }
    
    // Update chat header
    const chatHeader = document.querySelector('.chat-header');
    const chatDetails = chatHeader.querySelector('.chat-details');
    const userName = selectedChat.querySelector('h4').textContent;
    
    chatDetails.querySelector('h4').textContent = userName;
    
    // Load chat messages (simulate)
    loadChatMessages(userId);
}

// Load chat messages
function loadChatMessages(userId) {
    const chatMessages = document.getElementById('chatMessages');
    
    // Simulate loading messages
    const messages = [
        {
            type: 'received',
            content: 'Hola, necesito una actualización sobre el progreso del proyecto.',
            time: '14:30'
        },
        {
            type: 'sent',
            content: 'Hola Juan, el proyecto va muy bien. Estamos al 75% de completado.',
            time: '14:32'
        }
    ];
    
    chatMessages.innerHTML = '';
    
    messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${message.content}</p>
                <span class="message-time">${message.time}</span>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
    });
}

// Send message
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (message) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message sent';
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${message}</p>
                <span class="message-time">${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        
        // Clear input
        messageInput.value = '';
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Show notification
        showNotification('Mensaje enviado', 'success');
    }
}

// User management functions
function addUser() {
    const userName = prompt('Nombre del usuario:');
    const userEmail = prompt('Email del usuario:');
    
    if (userName && userEmail) {
        showNotification(`Usuario ${userName} agregado exitosamente`, 'success');
        loadUsers(); // Reload users
    }
}

function viewUser(userId) {
    showNotification(`Viendo usuario ${userId}`, 'info');
}

function editUser(userId) {
    showNotification(`Editando usuario ${userId}`, 'info');
}

function deleteUser(userId) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
        showNotification(`Usuario ${userId} eliminado`, 'success');
        loadUsers(); // Reload users
    }
}

// Project management functions
function addProject() {
    const projectName = prompt('Nombre del proyecto:');
    const clientName = prompt('Nombre del cliente:');
    
    if (projectName && clientName) {
        showNotification(`Proyecto ${projectName} creado exitosamente`, 'success');
    }
}

function viewProject(projectId) {
    showNotification(`Viendo proyecto ${projectId}`, 'info');
}

function editProject(projectId) {
    showNotification(`Editando proyecto ${projectId}`, 'info');
}

// File management functions
function uploadFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif';
    
    input.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            showNotification(`${files.length} archivo(s) subido(s) exitosamente`, 'success');
            loadFiles(); // Reload files
        }
    });
    
    input.click();
}

function downloadFile(fileName) {
    showNotification(`Descargando ${fileName}...`, 'info');
}

function deleteFile(fileName) {
    if (confirm(`¿Estás seguro de que quieres eliminar ${fileName}?`)) {
        showNotification(`${fileName} eliminado exitosamente`, 'success');
        loadFiles(); // Reload files
    }
}

// Get messages data
function getMessages() {
    return [
        {
            id: 1,
            name: 'Juan Pérez',
            email: 'juan@ejemplo.com',
            subject: 'Consulta sobre proyecto web',
            message: 'Hola, me gustaría saber el progreso del proyecto.',
            time: '2 min ago',
            status: 'new'
        },
        {
            id: 2,
            name: 'María García',
            email: 'maria@ejemplo.com',
            subject: 'Actualización de requerimientos',
            message: 'Necesito agregar una nueva funcionalidad al sistema.',
            time: '5 min ago',
            status: 'read'
        },
        {
            id: 3,
            name: 'Carlos López',
            email: 'carlos@ejemplo.com',
            subject: 'Problema con la aplicación',
            message: 'La aplicación no está funcionando correctamente.',
            time: '10 min ago',
            status: 'new'
        }
    ];
}

// Message management functions
function replyMessage(messageId) {
    // Get message data - try different selectors
    let messageItem = document.querySelector(`[data-message-id="${messageId}"]`);
    
    if (!messageItem) {
        // Try to find by message ID in the messages list
        messageItem = document.querySelector(`.message-item[onclick*="${messageId}"]`);
    }
    
    if (!messageItem) {
        // Fallback: get from the messages array
        const messages = getMessages();
        const message = messages.find(m => m.id === messageId);
        if (message) {
            openChatPopup(message.name, messageId);
            return;
        }
    }
    
    if (messageItem) {
        const userName = messageItem.querySelector('h4')?.textContent || 'Cliente';
        openChatPopup(userName, messageId);
    } else {
        // Fallback with default values
        openChatPopup('Cliente', messageId);
    }
}

// Chat Popup Functions
function openChatPopup(userName, messageId) {
    const popup = document.getElementById('chatPopup');
    const popupUserName = document.getElementById('popupUserName');
    const popupUserStatus = document.getElementById('popupUserStatus');
    const popupChatMessages = document.getElementById('popupChatMessages');
    
    // Update popup header
    popupUserName.textContent = userName;
    popupUserStatus.textContent = 'En línea';
    
    // Load chat messages
    loadPopupChatMessages(userName, messageId);
    
    // Show popup
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus on input
    setTimeout(() => {
        document.getElementById('popupMessageInput').focus();
    }, 300);
}

function closeChatPopup() {
    const popup = document.getElementById('chatPopup');
    popup.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function loadPopupChatMessages(userName, messageId) {
    const popupChatMessages = document.getElementById('popupChatMessages');
    
    // Simulate loading chat history
    const messages = [
        {
            type: 'received',
            content: 'Hola, necesito una actualización sobre el progreso del proyecto.',
            time: '14:30'
        },
        {
            type: 'sent',
            content: 'Hola, el proyecto va muy bien. Estamos al 75% de completado.',
            time: '14:32'
        },
        {
            type: 'received',
            content: 'Perfecto, ¿cuándo estiman que estará listo?',
            time: '14:35'
        }
    ];
    
    popupChatMessages.innerHTML = '';
    
    messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${message.content}</p>
                <span class="message-time">${message.time}</span>
            </div>
        `;
        popupChatMessages.appendChild(messageDiv);
    });
    
    // Scroll to bottom
    popupChatMessages.scrollTop = popupChatMessages.scrollHeight;
}

function sendPopupMessage() {
    const messageInput = document.getElementById('popupMessageInput');
    const message = messageInput.value.trim();
    
    if (message) {
        const popupChatMessages = document.getElementById('popupChatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message sent';
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${message}</p>
                <span class="message-time">${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        `;
        popupChatMessages.appendChild(messageDiv);
        
        // Clear input
        messageInput.value = '';
        
        // Scroll to bottom
        popupChatMessages.scrollTop = popupChatMessages.scrollHeight;
        
        // Show notification
        showNotification('Mensaje enviado', 'success');
        
        // Simulate client response after 2 seconds
        setTimeout(() => {
            simulateClientResponse(popupChatMessages);
        }, 2000);
    }
}

function simulateClientResponse(chatMessages) {
    const responses = [
        'Gracias por la información',
        'Perfecto, me parece bien',
        '¿Podrías enviarme más detalles?',
        'Excelente, continuemos así',
        '¿Hay algo más que deba saber?'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message received';
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${randomResponse}</p>
            <span class="message-time">${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Show typing indicator
    showTypingIndicator(chatMessages);
}

function showTypingIndicator(chatMessages) {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message received typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Remove typing indicator after 1.5 seconds
    setTimeout(() => {
        if (typingDiv.parentNode) {
            typingDiv.parentNode.removeChild(typingDiv);
        }
    }, 1500);
}

// Setup popup message input
document.addEventListener('DOMContentLoaded', function() {
    const popupMessageInput = document.getElementById('popupMessageInput');
    if (popupMessageInput) {
        popupMessageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendPopupMessage();
            }
        });
    }
    
    // Close popup when clicking outside
    document.addEventListener('click', function(e) {
        const popup = document.getElementById('chatPopup');
        if (e.target === popup) {
            closeChatPopup();
        }
    });
    
    // Close popup with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeChatPopup();
        }
    });
});

// Project Upload Modal Functions
let selectedProjectImage = null;
let selectedEditProjectImage = null;
let currentEditingProjectId = null;

function openProjectUploadModal() {
    const modal = document.getElementById('projectUploadModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Reset form
    resetProjectUploadForm();
}

function closeProjectUploadModal() {
    const modal = document.getElementById('projectUploadModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Reset form
    resetProjectUploadForm();
}

function resetProjectUploadForm() {
    selectedProjectImage = null;
    
    // Reset form fields
    document.getElementById('projectTitle').value = '';
    document.getElementById('projectDescription').value = '';
    document.getElementById('projectCategory').value = '';
    document.getElementById('projectDemoUrl').value = '';
    document.getElementById('projectGithubUrl').value = '';
    document.getElementById('projectTechnologies').value = '';
    document.getElementById('projectStatus').value = 'completed';
    
    // Reset image
    document.getElementById('projectImageInput').value = '';
    document.getElementById('projectImagePreview').innerHTML = '';
    document.getElementById('projectImagePreview').classList.remove('active');
    
    // Disable upload button
    document.getElementById('uploadProjectBtn').disabled = true;
}

function handleProjectImageSelect(input) {
    const file = input.files[0];
    if (!file) return;
    
    // Validate file type and size
    if (!validateProjectImage(file)) return;
    
    selectedProjectImage = file;
    
    // Show preview
    showProjectImagePreview(file);
    
    // Enable upload button
    document.getElementById('uploadProjectBtn').disabled = false;
}

function validateProjectImage(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
        showNotification('La imagen es demasiado grande. Máximo 5MB', 'error');
        return false;
    }
    
    if (!file.type.startsWith('image/')) {
        showNotification('Por favor selecciona una imagen válida', 'error');
        return false;
    }
    
    return true;
}

function showProjectImagePreview(file) {
    const previewContainer = document.getElementById('projectImagePreview');
    const fileSize = formatFileSize(file.size);
    
    const reader = new FileReader();
    reader.onload = function(e) {
        previewContainer.innerHTML = `
            <div class="image-preview-item">
                <img src="${e.target.result}" alt="Preview" class="image-preview-thumbnail">
                <div class="image-preview-info">
                    <div class="image-preview-name">${file.name}</div>
                    <div class="image-preview-size">${fileSize}</div>
                </div>
                <button class="image-preview-remove" onclick="removeProjectImagePreview()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        previewContainer.classList.add('active');
    };
    reader.readAsDataURL(file);
}

function removeProjectImagePreview() {
    selectedProjectImage = null;
    document.getElementById('projectImagePreview').innerHTML = '';
    document.getElementById('projectImagePreview').classList.remove('active');
    document.getElementById('projectImageInput').value = '';
    document.getElementById('uploadProjectBtn').disabled = true;
}

async function uploadProject() {
    const title = document.getElementById('projectTitle').value.trim();
    const description = document.getElementById('projectDescription').value.trim();
    const category = document.getElementById('projectCategory').value;
    const demoUrl = document.getElementById('projectDemoUrl').value.trim();
    const githubUrl = document.getElementById('projectGithubUrl').value.trim();
    const technologies = document.getElementById('projectTechnologies').value.trim();
    const status = document.getElementById('projectStatus').value;
    
    if (!title || !description || !category) {
        showNotification('Por favor completa todos los campos requeridos', 'error');
        return;
    }
    
    if (!selectedProjectImage) {
        showNotification('Por favor selecciona una imagen para el proyecto', 'error');
        return;
    }
    
    try {
        // Show loading state
        const uploadBtn = document.getElementById('uploadProjectBtn');
        const originalText = uploadBtn.innerHTML;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo...';
        uploadBtn.disabled = true;
        
        // Upload image to Backblaze B2
        const imageData = await uploadProjectImageToB2(selectedProjectImage);
        
        // Save project to Firestore
        await saveProjectToFirestore({
            id: Date.now().toString(),
            title: title,
            description: description,
            category: category,
            demoUrl: demoUrl,
            githubUrl: githubUrl,
            technologies: technologies.split(',').map(tech => tech.trim()).filter(tech => tech),
            imageUrl: imageData.url,
            imageKey: imageData.key,
            status: status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            featured: false
        });
        
        showNotification('Proyecto subido exitosamente', 'success');
        closeProjectUploadModal();
        loadProjects(); // Reload projects list
        
    } catch (error) {
        console.error('Upload error:', error);
        showNotification('Error al subir proyecto: ' + error.message, 'error');
        
        // Reset button
        const uploadBtn = document.getElementById('uploadProjectBtn');
        uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Subir Proyecto';
        uploadBtn.disabled = false;
    }
}

async function uploadProjectImageToB2(imageFile) {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('userId', 'admin');
    formData.append('type', 'project-image');
    
    const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        throw new Error('Error al subir imagen a B2');
    }
    
    return await response.json();
}

async function saveProjectToFirestore(projectData) {
    const { addDoc, collection } = await import('firebase/firestore');
    const { db } = await import('./firebase-config.js');
    
    await addDoc(collection(db, 'projects'), projectData);
}

async function loadProjects() {
    try {
        const { getDocs, collection, orderBy } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');
        
        const projectsQuery = collection(db, 'projects');
        const projectsSnapshot = await getDocs(projectsQuery);
        const projectsContainer = document.querySelector('.projects-grid');
        
        if (projectsContainer) {
            projectsContainer.innerHTML = '';
            
            if (projectsSnapshot.empty) {
                projectsContainer.innerHTML = `
                    <div class="no-projects">
                        <i class="fas fa-folder-open"></i>
                        <p>No hay proyectos subidos aún</p>
                        <button class="btn-primary" onclick="openProjectUploadModal()">
                            <i class="fas fa-upload"></i>
                            Subir Primer Proyecto
                        </button>
                    </div>
                `;
            } else {
                // Sort projects by creation date (newest first)
                const projects = [];
                projectsSnapshot.forEach(doc => {
                    const projectData = doc.data();
                    projectData.id = doc.id;
                    projects.push(projectData);
                });
                
                projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                projects.forEach(project => {
                    const projectCard = createProjectCard(project);
                    projectsContainer.appendChild(projectCard);
                });
            }
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        showNotification('Error al cargar proyectos', 'error');
    }
}

function createProjectCard(project) {
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card';
    
    const createdDate = new Date(project.createdAt).toLocaleDateString('es-ES');
    const statusClass = project.status === 'completed' ? 'status-completed' : 
                       project.status === 'in-progress' ? 'status-progress' : 'status-planned';
    const statusText = project.status === 'completed' ? 'Completado' : 
                      project.status === 'in-progress' ? 'En Progreso' : 'Planificado';
    
    projectCard.innerHTML = `
        <div class="project-header">
            <h3>${project.title}</h3>
            <span class="project-status ${statusClass}">${statusText}</span>
        </div>
        <div class="project-image">
            <img src="${project.imageUrl}" alt="${project.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
        </div>
        <div class="project-content">
            <p>${project.description}</p>
            <div class="project-tech">
                ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
            </div>
            <div class="project-meta">
                <span>Categoría: ${project.category}</span>
                <span>Fecha: ${createdDate}</span>
            </div>
        </div>
        <div class="project-actions">
            <button class="btn-primary" onclick="editProject('${project.id}')">
                <i class="fas fa-edit"></i>
                Editar
            </button>
            ${project.demoUrl ? `<a href="${project.demoUrl}" target="_blank" class="btn-secondary">Ver Demo</a>` : ''}
            ${project.githubUrl ? `<a href="${project.githubUrl}" target="_blank" class="btn-secondary">GitHub</a>` : ''}
            <button class="btn-danger" onclick="deleteProject('${project.id}')">
                <i class="fas fa-trash"></i>
                Eliminar
            </button>
        </div>
    `;
    
    return projectCard;
}

async function deleteProject(projectId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
        return;
    }
    
    try {
        const { deleteDoc, doc } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');
        
        await deleteDoc(doc(db, 'projects', projectId));
        showNotification('Proyecto eliminado exitosamente', 'success');
        loadProjects(); // Reload projects
    } catch (error) {
        console.error('Delete error:', error);
        showNotification('Error al eliminar proyecto', 'error');
    }
}

// Project Edit Functions
async function editProject(projectId) {
    try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');
        
        const projectDoc = await getDoc(doc(db, 'projects', projectId));
        if (!projectDoc.exists()) {
            showNotification('Proyecto no encontrado', 'error');
            return;
        }
        
        const project = projectDoc.data();
        currentEditingProjectId = projectId;
        
        // Fill form with current project data
        document.getElementById('editProjectTitle').value = project.title || '';
        document.getElementById('editProjectDescription').value = project.description || '';
        document.getElementById('editProjectCategory').value = project.category || '';
        document.getElementById('editProjectDemoUrl').value = project.demoUrl || '';
        document.getElementById('editProjectGithubUrl').value = project.githubUrl || '';
        document.getElementById('editProjectTechnologies').value = project.technologies ? project.technologies.join(', ') : '';
        document.getElementById('editProjectStatus').value = project.status || 'completed';
        
        // Show current image
        if (project.imageUrl) {
            document.getElementById('editProjectImagePreview').innerHTML = `
                <div class="image-preview-item">
                    <img src="${project.imageUrl}" alt="Current image" class="image-preview-thumbnail">
                    <div class="image-preview-info">
                        <div class="image-preview-name">Imagen actual</div>
                        <div class="image-preview-size">Haz clic arriba para cambiar</div>
                    </div>
                </div>
            `;
            document.getElementById('editProjectImagePreview').classList.add('active');
            document.getElementById('editProjectImageActions').style.display = 'flex';
        }
        
        // Open edit modal
        const modal = document.getElementById('projectEditModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('Error loading project for edit:', error);
        showNotification('Error al cargar proyecto para editar', 'error');
    }
}

function closeProjectEditModal() {
    const modal = document.getElementById('projectEditModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Reset form
    resetProjectEditForm();
}

function resetProjectEditForm() {
    selectedEditProjectImage = null;
    currentEditingProjectId = null;
    
    // Reset form fields
    document.getElementById('editProjectTitle').value = '';
    document.getElementById('editProjectDescription').value = '';
    document.getElementById('editProjectCategory').value = '';
    document.getElementById('editProjectDemoUrl').value = '';
    document.getElementById('editProjectGithubUrl').value = '';
    document.getElementById('editProjectTechnologies').value = '';
    document.getElementById('editProjectStatus').value = 'completed';
    
    // Reset image
    document.getElementById('editProjectImageInput').value = '';
    document.getElementById('editProjectImagePreview').innerHTML = '';
    document.getElementById('editProjectImagePreview').classList.remove('active');
    document.getElementById('editProjectImageActions').style.display = 'none';
}

function handleEditProjectImageSelect(input) {
    const file = input.files[0];
    if (!file) return;
    
    // Validate file type and size
    if (!validateProjectImage(file)) return;
    
    selectedEditProjectImage = file;
    
    // Show preview
    showEditProjectImagePreview(file);
}

function showEditProjectImagePreview(file) {
    const previewContainer = document.getElementById('editProjectImagePreview');
    const fileSize = formatFileSize(file.size);
    
    const reader = new FileReader();
    reader.onload = function(e) {
        previewContainer.innerHTML = `
            <div class="image-preview-item">
                <img src="${e.target.result}" alt="New preview" class="image-preview-thumbnail">
                <div class="image-preview-info">
                    <div class="image-preview-name">${file.name} (Nueva)</div>
                    <div class="image-preview-size">${fileSize}</div>
                </div>
                <button class="image-preview-remove" onclick="removeEditProjectImagePreview()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        previewContainer.classList.add('active');
        // Hide action buttons when new image is selected
        document.getElementById('editProjectImageActions').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function removeEditProjectImagePreview() {
    selectedEditProjectImage = null;
    document.getElementById('editProjectImagePreview').innerHTML = '';
    document.getElementById('editProjectImagePreview').classList.remove('active');
    document.getElementById('editProjectImageInput').value = '';
}

async function updateProject() {
    const title = document.getElementById('editProjectTitle').value.trim();
    const description = document.getElementById('editProjectDescription').value.trim();
    const category = document.getElementById('editProjectCategory').value;
    const demoUrl = document.getElementById('editProjectDemoUrl').value.trim();
    const githubUrl = document.getElementById('editProjectGithubUrl').value.trim();
    const technologies = document.getElementById('editProjectTechnologies').value.trim();
    const status = document.getElementById('editProjectStatus').value;
    
    if (!title || !description || !category) {
        showNotification('Por favor completa todos los campos requeridos', 'error');
        return;
    }
    
    try {
        // Show loading state
        const updateBtn = document.getElementById('updateProjectBtn');
        const originalText = updateBtn.innerHTML;
        updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        updateBtn.disabled = true;
        
        let imageData = null;
        let removeImage = false;
        
        // Handle image changes
        if (selectedEditProjectImage === 'REMOVE_IMAGE') {
            removeImage = true;
        } else if (selectedEditProjectImage) {
            imageData = await uploadProjectImageToB2(selectedEditProjectImage);
        }
        
        // Prepare update data
        const updateData = {
            title: title,
            description: description,
            category: category,
            demoUrl: demoUrl,
            githubUrl: githubUrl,
            technologies: technologies.split(',').map(tech => tech.trim()).filter(tech => tech),
            status: status,
            updatedAt: new Date().toISOString()
        };
        
        // Handle image updates
        if (removeImage) {
            updateData.imageUrl = null;
            updateData.imageKey = null;
        } else if (imageData) {
            updateData.imageUrl = imageData.url;
            updateData.imageKey = imageData.key;
        }
        
        // Update project in Firestore
        await updateProjectInFirestore(currentEditingProjectId, updateData);
        
        showNotification('Proyecto actualizado exitosamente', 'success');
        closeProjectEditModal();
        loadProjects(); // Reload projects list
        
    } catch (error) {
        console.error('Update error:', error);
        showNotification('Error al actualizar proyecto: ' + error.message, 'error');
        
        // Reset button
        const updateBtn = document.getElementById('updateProjectBtn');
        updateBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
        updateBtn.disabled = false;
    }
}

async function updateProjectInFirestore(projectId, updateData) {
    const { updateDoc, doc } = await import('firebase/firestore');
    const { db } = await import('./firebase-config.js');
    
    await updateDoc(doc(db, 'projects', projectId), updateData);
}

// Image management functions
function replaceProjectImage() {
    document.getElementById('editProjectImageInput').click();
}

async function removeProjectImage() {
    if (!confirm('¿Estás seguro de que quieres eliminar la imagen actual del proyecto?')) {
        return;
    }
    
    try {
        // Get current project data to find image key
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');
        
        const projectDoc = await getDoc(doc(db, 'projects', currentEditingProjectId));
        if (!projectDoc.exists()) {
            showNotification('Proyecto no encontrado', 'error');
            return;
        }
        
        const project = projectDoc.data();
        
        // Delete image from B2 if it exists
        if (project.imageKey) {
            try {
                await fetch(`http://localhost:3001/api/delete/${project.imageKey}`, {
                    method: 'DELETE'
                });
            } catch (error) {
                console.warn('Error deleting image from B2:', error);
            }
        }
        
        // Remove image from preview
        document.getElementById('editProjectImagePreview').innerHTML = '';
        document.getElementById('editProjectImagePreview').classList.remove('active');
        document.getElementById('editProjectImageActions').style.display = 'none';
        
        // Mark image for removal
        selectedEditProjectImage = 'REMOVE_IMAGE';
        
        showNotification('Imagen marcada para eliminación. Guarda los cambios para confirmar.', 'info');
        
    } catch (error) {
        console.error('Error removing image:', error);
        showNotification('Error al eliminar imagen', 'error');
    }
}

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
            uploadedBy: user.name || 'Admin',
            uploadedAt: new Date().toISOString(),
            status: 'active'
        });
        
        showNotification('Archivo subido exitosamente', 'success');
        closeFileUploadModal();
        loadFiles(); // Reload files list
        
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

// Chat functions
function callUser(userId) {
    showNotification(`Llamando a usuario ${userId}...`, 'info');
}

function videoCall(userId) {
    showNotification(`Iniciando videollamada con usuario ${userId}...`, 'info');
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
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    .user-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .user-avatar {
        width: 35px;
        height: 35px;
        background: var(--primary-color);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 0.9rem;
    }
    
    .user-name {
        font-weight: 600;
        color: var(--text-primary);
    }
    
    .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .status-badge.active {
        background: #dcfce7;
        color: #166534;
    }
    
    .status-badge.inactive {
        background: #fef3c7;
        color: #92400e;
    }
    
    .action-buttons {
        display: flex;
        gap: 0.5rem;
    }
    
    .btn-delete {
        background: var(--error-color);
        color: white;
        border: none;
        padding: 0.5rem;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        width: 35px;
        height: 35px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .btn-delete:hover {
        background: #dc2626;
    }
`;
document.head.appendChild(style);
