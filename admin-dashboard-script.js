// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', async function () {
    console.log('Admin Dashboard loaded successfully');

    // Initialize dashboard (this will check admin access)
    await initializeAdminDashboard();

    // Setup navigation
    setupAdminNavigation();

    // Setup interactions
    setupAdminInteractions();
});

// Check admin access
async function checkAdminAccess() {
    try {
        // Import Firebase auth functions
        const { onAuthStateChanged } = await import('firebase/auth');
        const { auth } = await import('./firebase-config.js');

        return new Promise((resolve) => {
            onAuthStateChanged(auth, (user) => {
                if (!user || user.email !== 'ueservicesllc1@gmail.com') {
                    // Clear localStorage and redirect if not authenticated or not admin
                    localStorage.removeItem('user');
                    window.location.href = 'index.html';
                    resolve(false);
                } else {
                    // Update localStorage with current user data
                    localStorage.setItem('user', JSON.stringify({
                        id: user.uid,
                        email: user.email,
                        name: user.displayName || user.email.split('@')[0],
                        isAdmin: true
                    }));
                    console.log('Admin access granted');
                    resolve(true);
                }
            });
        });
    } catch (error) {
        console.error('Error checking admin access:', error);
        // Clear localStorage and redirect on error
        localStorage.removeItem('user');
        window.location.href = 'index.html';
        return false;
    }
}

// Initialize admin dashboard
async function initializeAdminDashboard() {
    // Check admin access first
    const hasAccess = await checkAdminAccess();
    if (!hasAccess) {
        return; // Will redirect if no access
    }

    // Load admin data
    await loadAdminData();

    // Setup real-time updates
    setupRealTimeUpdates();

    // Load users for project creation
    loadUsersForProject();
}

// Setup navigation
function setupAdminNavigation() {
    console.log('Setting up admin navigation...');
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.admin-section');

    console.log('Found nav items:', navItems.length);
    console.log('Found sections:', sections.length);

    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('Navigation clicked:', this.getAttribute('data-section'));

            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));

            // Add active class to clicked item
            this.classList.add('active');

            // Get section name
            const sectionName = this.getAttribute('data-section');
            console.log('Switching to section:', sectionName);

            // Hide all sections
            sections.forEach(section => {
                section.classList.remove('active');
                console.log('Hiding section:', section.id);
            });

            // Show selected section
            const targetSection = document.getElementById(sectionName);
            if (targetSection) {
                targetSection.classList.add('active');
                console.log('Showing section:', sectionName);

                // Load section-specific data
                loadSectionData(sectionName);
            } else {
                console.error('Section not found:', sectionName);
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
        messageInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Chat items
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
        item.addEventListener('click', function () {
            const userId = this.getAttribute('data-user');
            openChat(userId);
        });
    });
}

// Admin data loading state
let isLoadingAdminData = false;

// Load admin data
async function loadAdminData() {
    if (isLoadingAdminData) {
        console.log('Admin data is already loading, skipping...');
        return;
    }

    isLoadingAdminData = true;
    console.log('Loading admin data from Firebase...');

    try {
        // Load data sequentially to avoid conflicts
        console.log('Loading stats...');
        await loadStats();

        console.log('Loading users...');
        await loadUsers();

        console.log('Loading projects...');
        await loadProjects();

        console.log('Loading files...');
        await loadFiles();

        console.log('Loading messages...');
        await loadMessages();

        console.log('Loading recent activity...');
        await loadRecentActivity();

        console.log('Loading requirements...');
        await loadAdminRequirements();

        console.log('Loading costs...');
        await loadAdminCosts();

        console.log('Loading multimedia projects...');
        await loadMultimediaProjects();

        console.log('Admin data loaded successfully');
    } catch (error) {
        console.error('Error loading admin data:', error);
        showNotification('Error al cargar datos del admin', 'error');
    } finally {
        isLoadingAdminData = false;
    }
}

// Load stats with debounce
let statsLoadingTimeout = null;

async function loadStats() {
    // Clear previous timeout
    if (statsLoadingTimeout) {
        clearTimeout(statsLoadingTimeout);
    }

    // Debounce the function
    statsLoadingTimeout = setTimeout(async () => {
        try {
            console.log('Loading stats from Firebase...');
            const { getDocs, collection } = await import('firebase/firestore');
            const { db } = await import('./firebase-config.js');

            // Load users count
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersCount = usersSnapshot.size;
            console.log('Users count from Firebase:', usersCount);

            // Load projects count
            const projectsSnapshot = await getDocs(collection(db, 'projects'));
            const projectsCount = projectsSnapshot.size;
            console.log('Projects count from Firebase:', projectsCount);

            // Load files count
            const filesSnapshot = await getDocs(collection(db, 'files'));
            const filesCount = filesSnapshot.size;
            console.log('Files count from Firebase:', filesCount);

            // Load messages count
            const messagesSnapshot = await getDocs(collection(db, 'messages'));
            const messagesCount = messagesSnapshot.size;
            console.log('Messages count from Firebase:', messagesCount);

            // Update stats
            document.getElementById('totalUsers').textContent = usersCount;
            document.getElementById('totalProjects').textContent = projectsCount;
            document.getElementById('totalFiles').textContent = filesCount;
            document.getElementById('totalMessages').textContent = messagesCount;

            // Update badges
            document.getElementById('usersBadge').textContent = usersCount;
            document.getElementById('projectsBadge').textContent = projectsCount;
            document.getElementById('filesBadge').textContent = filesCount;
            document.getElementById('messagesBadge').textContent = messagesCount;

            console.log('Stats updated successfully');

        } catch (error) {
            console.error('Error loading stats:', error);
            // Set to 0 if error
            document.getElementById('totalUsers').textContent = '0';
            document.getElementById('totalProjects').textContent = '0';
            document.getElementById('totalFiles').textContent = '0';
            document.getElementById('totalMessages').textContent = '0';

            document.getElementById('usersBadge').textContent = '0';
            document.getElementById('projectsBadge').textContent = '0';
            document.getElementById('filesBadge').textContent = '0';
            document.getElementById('messagesBadge').textContent = '0';
        }
    }, 300); // 300ms debounce
}

// Load users
async function loadUsers() {
    console.log('Loading users from Firebase...');
    try {
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');

        const tbody = document.getElementById('usersTableBody');
        if (!tbody) {
            console.error('usersTableBody element not found!');
            return;
        }

        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Cargando usuarios...</td></tr>';

        const usersSnapshot = await getDocs(collection(db, 'users'));
        console.log('Users found:', usersSnapshot.size);
        tbody.innerHTML = '';

        if (usersSnapshot.empty) {
            console.log('No users found in Firebase');
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay usuarios registrados</td></tr>';
            return;
        }

        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            console.log('Creating row for user:', userData.email);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="user-info">
                        <div class="user-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div>
                            <div class="user-name">${userData.name || 'Sin nombre'}</div>
                        </div>
                    </div>
                </td>
                <td>${userData.email || 'Sin email'}</td>
                <td>${userData.projects ? userData.projects.length : 0}</td>
                <td>${userData.lastActivity || 'Nunca'}</td>
                <td>
                    <span class="status-badge ${userData.status || 'inactive'}">${userData.status === 'active' ? 'Activo' : 'Inactivo'}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-secondary" onclick="viewUser('${doc.id}')" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                              <button class="btn-primary" onclick="openUserEditModal('${doc.id}')" title="Editar usuario">
                                  <i class="fas fa-edit"></i>
                              </button>
                        <button class="btn-info" onclick="viewUserPanel('${doc.id}', '${userData.email}')" title="Ver panel de usuario">
                            <i class="fas fa-user-cog"></i>
                        </button>
                        <button class="btn-delete" onclick="deleteUser('${doc.id}')" title="Eliminar usuario">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
            console.log('Row added for user:', userData.email);
        });

        console.log('Users loaded successfully');

    } catch (error) {
        console.error('Error loading users:', error);
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Error al cargar usuarios</td></tr>';
    }
}

// Load projects
// Load projects function removed (duplicate)
// Real implementation is async function loadProjects() below

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
            replyBtn.addEventListener('click', function () {
                const messageId = item.getAttribute('data-message-id') || '1';
                replyMessage(messageId);
            });
        }
    });
}

// Load recent activity
function loadRecentActivity() {
    // Load real activity from Firebase instead of hardcoded data
    const activityList = document.getElementById('recentActivity');
    activityList.innerHTML = '<div class="activity-item"><p>No hay actividades recientes</p></div>';

    // This will be populated by Firebase data
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

    input.addEventListener('change', function (e) {
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
    // Load real messages from Firebase instead of hardcoded data
    return [];
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
document.addEventListener('DOMContentLoaded', function () {
    const popupMessageInput = document.getElementById('popupMessageInput');
    if (popupMessageInput) {
        popupMessageInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendPopupMessage();
            }
        });
    }

    // Close popup when clicking outside
    document.addEventListener('click', function (e) {
        const popup = document.getElementById('chatPopup');
        if (e.target === popup) {
            closeChatPopup();
        }
    });

    // Close popup with Escape key
    document.addEventListener('keydown', function (e) {
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
    reader.onload = function (e) {
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
    const price = parseFloat(document.getElementById('projectPrice').value) || 0;
    const userId = document.getElementById('projectUser').value;
    const status = document.getElementById('projectStatus').value;

    if (!title || !description || !category || price <= 0 || !userId) {
        showNotification('Por favor completa todos los campos requeridos, asegúrate de que el precio sea mayor a 0 y selecciona un usuario', 'error');
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

        // Get user info
        const selectedUser = users.find(user => user.id === userId);

        // Save project to Firestore
        await saveProjectToFirestore({
            id: Date.now().toString(),
            title: title,
            description: description,
            category: category,
            demoUrl: demoUrl,
            githubUrl: githubUrl,
            technologies: technologies.split(',').map(tech => tech.trim()).filter(tech => tech),
            price: price,
            userId: userId,
            userEmail: selectedUser ? selectedUser.email : '',
            userName: selectedUser ? selectedUser.name : '',
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
        // Stats will be reloaded automatically

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
                    console.log('Creating admin project card for:', project.title, 'Demo URL:', project.demoUrl);
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
                <span class="project-price">Precio: $${project.price ? project.price.toFixed(2) : '0.00'}</span>
            </div>
        </div>
        <div class="project-actions">
            <button class="btn-primary" onclick="editProject('${project.id}')">
                <i class="fas fa-edit"></i>
                Editar
            </button>
            ${project.demoUrl ? `<a href="${project.demoUrl.startsWith('http') ? project.demoUrl : 'https://' + project.demoUrl}" target="_blank" class="btn-secondary demo-link" onclick="event.stopPropagation()">Ver Demo</a>` : ''}
            ${project.githubUrl ? `<a href="${project.githubUrl.startsWith('http') ? project.githubUrl : 'https://' + project.githubUrl}" target="_blank" class="btn-secondary" onclick="event.stopPropagation()">GitHub</a>` : ''}
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
    reader.onload = function (e) {
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
        // Stats will be reloaded automatically

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
async function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        try {
            // Import Firebase auth functions
            const { logout: firebaseLogout } = await import('./firebase-config.js');
            await firebaseLogout();

            // Clear user data
            localStorage.removeItem('user');

            // Show notification
            showNotification('Sesión cerrada exitosamente', 'success');

            // Redirect to main page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);

        } catch (error) {
            console.error('Logout error:', error);
            showNotification('Error al cerrar sesión: ' + error.message, 'error');
        }
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

// User Management Functions
let users = [];

// Load users for project creation
async function loadUsersForProject() {
    try {
        // Load users from Firebase Firestore
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');

        const usersQuery = collection(db, 'users');
        const usersSnapshot = await getDocs(usersQuery);

        users = [];
        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            userData.id = doc.id;
            users.push(userData);
        });

        console.log('Loaded users from Firebase:', users);

        const userSelect = document.getElementById('projectUser');
        if (userSelect) {
            // Clear existing options except the first two
            userSelect.innerHTML = `
                <option value="">Selecciona un usuario</option>
                <option value="new">+ Crear nuevo usuario</option>
            `;

            // Add existing users
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.name || user.email} (${user.email})`;
                userSelect.appendChild(option);
            });

            console.log(`Added ${users.length} users to dropdown`);
        }
    } catch (error) {
        console.error('Error loading users from Firebase:', error);
        showNotification('Error al cargar usuarios desde Firebase', 'error');

        // Fallback to localStorage if Firebase fails
        users = JSON.parse(localStorage.getItem('users') || '[]');
        console.log('Using localStorage fallback:', users);
    }
}

// Handle user selection
function handleUserSelection() {
    const userSelect = document.getElementById('projectUser');
    const newUserForm = document.getElementById('newUserForm');

    if (userSelect.value === 'new') {
        newUserForm.style.display = 'block';
    } else {
        newUserForm.style.display = 'none';
    }
}

// Check if user exists
function checkUserExists() {
    const email = document.getElementById('newUserEmail').value;
    const userStatus = document.getElementById('userStatus');

    if (!email) {
        userStatus.innerHTML = '';
        return;
    }

    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
        userStatus.innerHTML = '✅ Usuario ya existe';
        userStatus.className = 'user-status success';
    } else {
        userStatus.innerHTML = '⚠️ Usuario no existe - Se creará uno nuevo';
        userStatus.className = 'user-status warning';
    }
}

// Create new user
async function createNewUser() {
    const email = document.getElementById('newUserEmail').value;
    const name = document.getElementById('newUserName').value;
    const userStatus = document.getElementById('userStatus');

    if (!email) {
        userStatus.innerHTML = '❌ Email es requerido';
        userStatus.className = 'user-status error';
        return;
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        userStatus.innerHTML = '✅ Usuario ya existe';
        userStatus.className = 'user-status success';

        // Update the select to show this user
        const userSelect = document.getElementById('projectUser');
        userSelect.value = existingUser.id;
        document.getElementById('newUserForm').style.display = 'none';
        return;
    }

    // Create new user
    const newUser = {
        email: email.toLowerCase().trim(), // Normalize email
        name: name || email.split('@')[0],
        createdBy: 'admin',
        status: 'pending_registration', // Waiting for user to register
        createdAt: new Date().toISOString(),
        isAdminCreated: true,
        waitingForRegistration: true,
        projects: [] // Array to store project IDs when user registers
    };

    try {
        // Save user to Firebase Firestore
        const { addDoc, collection } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');

        const docRef = await addDoc(collection(db, 'users'), newUser);
        newUser.id = docRef.id; // Get the Firebase document ID

        users.push(newUser);

        userStatus.innerHTML = '✅ Usuario creado exitosamente en Firebase';
        userStatus.className = 'user-status success';

        console.log('User created in Firebase:', newUser);
    } catch (error) {
        console.error('Error creating user in Firebase:', error);

        // Fallback to localStorage if Firebase fails
        newUser.id = Date.now().toString();
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        userStatus.innerHTML = '✅ Usuario creado en modo offline';
        userStatus.className = 'user-status warning';
    }

    // Update the select to show this user
    const userSelect = document.getElementById('projectUser');
    userSelect.innerHTML = `
        <option value="">Selecciona un usuario</option>
        <option value="new">+ Crear nuevo usuario</option>
    `;

    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name || user.email} (${user.email})`;
        userSelect.appendChild(option);
    });

    userSelect.value = newUser.id;
    document.getElementById('newUserForm').style.display = 'none';

    // Clear form
    document.getElementById('newUserEmail').value = '';
    document.getElementById('newUserName').value = '';

    // Reload data
    loadUsers();
    // Stats will be updated automatically
}

// View user panel function
async function viewUserPanel(userId, userEmail) {
    try {
        // Get user data from Firebase to have complete information
        const { getDocs, collection, query, where } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');

        const usersQuery = query(collection(db, 'users'), where('email', '==', userEmail));
        const usersSnapshot = await getDocs(usersQuery);

        let userData = {
            id: userId,
            email: userEmail,
            name: userEmail.split('@')[0],
            isAdmin: false,
            isDeveloper: true, // Mark as developer to show admin features
            createdBy: 'admin',
            status: 'active',
            originalUserId: userId, // Store original user ID
            originalUserEmail: userEmail // Store original user email
        };

        // If user exists in Firebase, use their data
        if (!usersSnapshot.empty) {
            const userDoc = usersSnapshot.docs[0];
            const firebaseUserData = userDoc.data();
            userData = {
                ...userData,
                ...firebaseUserData,
                isDeveloper: true, // Override to show admin features
                originalUserId: userId,
                originalUserEmail: userEmail
            };
        }

        // Store user data in localStorage for the panel
        localStorage.setItem('user', JSON.stringify(userData));

        // Open user panel in new window
        const userPanelUrl = window.location.origin + '/dashboard.html';
        const newWindow = window.open(userPanelUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');

        if (newWindow) {
            newWindow.focus();
            showNotification(`Panel de usuario abierto para ${userEmail}`, 'success');

            // Add a note to the new window about developer mode
            newWindow.addEventListener('load', function () {
                console.log('Panel de usuario abierto en modo desarrollador para:', userEmail);
                console.log('Datos del usuario:', userData);
            });
        } else {
            showNotification('No se pudo abrir el panel de usuario. Verifica que los pop-ups estén habilitados.', 'error');
        }

    } catch (error) {
        console.error('Error opening user panel:', error);
        showNotification('Error al abrir el panel de usuario: ' + error.message, 'error');
    }
}

// Admin Requirements and Costs Management
async function loadAdminRequirements() {
    try {
        const { getDocs, collection, query, orderBy } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');

        const requirementsQuery = query(collection(db, 'requirements'), orderBy('createdAt', 'desc'));
        const requirementsSnapshot = await getDocs(requirementsQuery);
        const requirementsList = document.getElementById('adminRequirementsList');

        if (requirementsList) {
            requirementsList.innerHTML = '';

            if (requirementsSnapshot.empty) {
                requirementsList.innerHTML = `
                    <div class="no-data">
                        <i class="fas fa-clipboard-list"></i>
                        <p>No hay requerimientos de usuarios</p>
                        <small>Los requerimientos aparecerán aquí cuando los usuarios los envíen</small>
                    </div>
                `;
            } else {
                requirementsSnapshot.forEach(doc => {
                    const requirement = doc.data();
                    requirement.id = doc.id;
                    const requirementCard = createAdminRequirementCard(requirement);
                    requirementsList.appendChild(requirementCard);
                });
            }
        }
    } catch (error) {
        console.error('Error loading admin requirements:', error);
        showNotification('Error al cargar requerimientos', 'error');
    }
}

async function loadAdminCosts() {
    try {
        const { getDocs, collection, query, orderBy } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');

        const costsQuery = query(collection(db, 'costs'), orderBy('createdAt', 'desc'));
        const costsSnapshot = await getDocs(costsQuery);
        const costsList = document.getElementById('adminCostsList');

        if (costsList) {
            costsList.innerHTML = '';

            if (costsSnapshot.empty) {
                costsList.innerHTML = `
                    <div class="no-data">
                        <i class="fas fa-dollar-sign"></i>
                        <p>No hay costos adicionales</p>
                        <small>Los costos aparecerán aquí cuando se agreguen</small>
                    </div>
                `;
            } else {
                costsSnapshot.forEach(doc => {
                    const cost = doc.data();
                    cost.id = doc.id;
                    const costCard = createAdminCostCard(cost);
                    costsList.appendChild(costCard);
                });
            }
        }
    } catch (error) {
        console.error('Error loading admin costs:', error);
        showNotification('Error al cargar costos', 'error');
    }
}

// Create admin requirement card
function createAdminRequirementCard(requirement) {
    const card = document.createElement('div');
    card.className = 'admin-requirement-card';

    const priorityClass = {
        'low': 'priority-low',
        'medium': 'priority-medium',
        'high': 'priority-high',
        'urgent': 'priority-urgent'
    }[requirement.priority] || 'priority-medium';

    const statusClass = {
        'pending': 'status-pending',
        'approved': 'status-approved',
        'rejected': 'status-rejected',
        'in-progress': 'status-progress',
        'completed': 'status-completed'
    }[requirement.status] || 'status-pending';

    const statusText = {
        'pending': 'Pendiente',
        'approved': 'Aprobado',
        'rejected': 'Rechazado',
        'in-progress': 'En Progreso',
        'completed': 'Completado'
    }[requirement.status] || 'Pendiente';

    const priorityText = {
        'low': 'Baja',
        'medium': 'Media',
        'high': 'Alta',
        'urgent': 'Urgente'
    }[requirement.priority] || 'Media';

    const createdDate = new Date(requirement.createdAt).toLocaleDateString('es-ES');

    card.innerHTML = `
        <div class="requirement-header">
            <div class="requirement-info">
                <h3>${requirement.title}</h3>
                <p class="requirement-user">Usuario: ${requirement.userEmail}</p>
            </div>
            <div class="requirement-badges">
                <span class="priority-badge ${priorityClass}">${priorityText}</span>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
        </div>
        <div class="requirement-content">
            <p>${requirement.description}</p>
            <div class="requirement-meta">
                <span><i class="fas fa-calendar"></i> ${createdDate}</span>
                ${requirement.projectId ? `<span><i class="fas fa-folder"></i> Proyecto relacionado</span>` : ''}
            </div>
        </div>
        <div class="requirement-actions">
            <button class="btn-primary" onclick="updateRequirementStatus('${requirement.id}', 'approved')">
                <i class="fas fa-check"></i>
                Aprobar
            </button>
            <button class="btn-warning" onclick="updateRequirementStatus('${requirement.id}', 'in-progress')">
                <i class="fas fa-play"></i>
                En Progreso
            </button>
            <button class="btn-success" onclick="updateRequirementStatus('${requirement.id}', 'completed')">
                <i class="fas fa-check-circle"></i>
                Completar
            </button>
            <button class="btn-danger" onclick="updateRequirementStatus('${requirement.id}', 'rejected')">
                <i class="fas fa-times"></i>
                Rechazar
            </button>
        </div>
    `;

    return card;
}

// Create admin cost card
function createAdminCostCard(cost) {
    const card = document.createElement('div');
    card.className = 'admin-cost-card';

    const statusClass = {
        'pending': 'status-pending',
        'approved': 'status-approved',
        'rejected': 'status-rejected'
    }[cost.status] || 'status-pending';

    const statusText = {
        'pending': 'Pendiente',
        'approved': 'Aprobado',
        'rejected': 'Rechazado'
    }[cost.status] || 'Pendiente';

    const priorityClass = {
        'low': 'priority-low',
        'medium': 'priority-medium',
        'high': 'priority-high',
        'urgent': 'priority-urgent'
    }[cost.priority] || 'priority-medium';

    const priorityText = {
        'low': 'Baja',
        'medium': 'Media',
        'high': 'Alta',
        'urgent': 'Urgente'
    }[cost.priority] || 'Media';

    const createdDate = new Date(cost.createdAt).toLocaleDateString('es-ES');

    card.innerHTML = `
        <div class="cost-header">
            <div class="cost-info">
                <h3>${cost.title}</h3>
                <p class="cost-user">Usuario: ${cost.userEmail}</p>
                ${cost.requirementId ? `<p class="cost-requirement"><i class="fas fa-clipboard-list"></i> Basado en requerimiento</p>` : ''}
            </div>
            <div class="cost-amount">$${cost.amount.toFixed(2)}</div>
        </div>
        <div class="cost-content">
            <p>${cost.description}</p>
            <div class="cost-meta">
                <span class="status-badge ${statusClass}">${statusText}</span>
                <span class="priority-badge ${priorityClass}">${priorityText}</span>
                <span><i class="fas fa-calendar"></i> ${createdDate}</span>
                ${cost.projectId ? `<span><i class="fas fa-folder"></i> Proyecto relacionado</span>` : ''}
            </div>
        </div>
        <div class="cost-actions">
            <button class="btn-primary" onclick="updateCostStatus('${cost.id}', 'approved')">
                <i class="fas fa-check"></i>
                Aprobar
            </button>
            <button class="btn-danger" onclick="updateCostStatus('${cost.id}', 'rejected')">
                <i class="fas fa-times"></i>
                Rechazar
            </button>
        </div>
    `;

    return card;
}

// Update requirement status
async function updateRequirementStatus(requirementId, newStatus) {
    try {
        const { updateDoc, doc } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');

        await updateDoc(doc(db, 'requirements', requirementId), {
            status: newStatus,
            updatedAt: new Date().toISOString()
        });

        showNotification('Estado del requerimiento actualizado', 'success');
        loadAdminRequirements();

    } catch (error) {
        console.error('Error updating requirement status:', error);
        showNotification('Error al actualizar estado: ' + error.message, 'error');
    }
}

// Update cost status
async function updateCostStatus(costId, newStatus) {
    try {
        const { updateDoc, doc } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');

        await updateDoc(doc(db, 'costs', costId), {
            status: newStatus,
            updatedAt: new Date().toISOString()
        });

        showNotification('Estado del costo actualizado', 'success');
        loadAdminCosts();

    } catch (error) {
        console.error('Error updating cost status:', error);
        showNotification('Error al actualizar estado: ' + error.message, 'error');
    }
}

// Cost Creation Functions
function openCostCreationModal() {
    const modal = document.getElementById('costCreationModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Load users for the select
    loadUsersForCostCreation();

    // Add event listener manually as backup
    const userSelect = document.getElementById('adminCostUser');
    if (userSelect) {
        userSelect.removeEventListener('change', loadUserProjectsAndRequirements);
        userSelect.addEventListener('change', loadUserProjectsAndRequirements);
        console.log('Event listener added to user select');

        // Test the function
        setTimeout(() => {
            console.log('Testing loadUserProjectsAndRequirements function...');
            // Simulate user selection for testing
            if (userSelect.options.length > 1) {
                userSelect.selectedIndex = 1; // Select first user
                console.log('Simulated user selection:', userSelect.value);
                loadUserProjectsAndRequirements();
            }
        }, 1000);
    }
}

function closeCostCreationModal() {
    const modal = document.getElementById('costCreationModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';

    // Reset form
    document.getElementById('adminCostTitle').value = '';
    document.getElementById('adminCostDescription').value = '';
    document.getElementById('adminCostAmount').value = '';
    document.getElementById('adminCostUser').value = '';
    document.getElementById('adminCostProject').value = '';
    document.getElementById('adminCostRequirement').value = '';
    document.getElementById('adminCostPriority').value = 'medium';
}

// Load users for cost creation
async function loadUsersForCostCreation() {
    try {
        console.log('Loading users for cost creation...');
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');

        const usersSnapshot = await getDocs(collection(db, 'users'));
        console.log('Found users:', usersSnapshot.size);

        const userSelect = document.getElementById('adminCostUser');

        if (userSelect) {
            userSelect.innerHTML = '<option value="">Seleccionar usuario</option>';

            usersSnapshot.forEach((doc, index) => {
                const userData = doc.data();
                console.log(`User ${index + 1}:`, userData.email, 'Name:', userData.name);

                const option = document.createElement('option');
                option.value = userData.email;
                option.textContent = `${userData.name || userData.email} (${userData.email})`;
                userSelect.appendChild(option);
            });

            console.log('Users loaded successfully');
        } else {
            console.error('User select element not found');
        }
    } catch (error) {
        console.error('Error loading users for cost creation:', error);
        showNotification('Error al cargar usuarios', 'error');
    }
}

// Load projects and requirements for selected user
async function loadUserProjectsAndRequirements() {
    console.log('loadUserProjectsAndRequirements called');

    const userSelect = document.getElementById('adminCostUser');
    if (!userSelect) {
        console.error('adminCostUser element not found');
        return;
    }

    const selectedUserEmail = userSelect.value;
    console.log('Loading projects and requirements for user:', selectedUserEmail);

    if (!selectedUserEmail) {
        // Clear projects and requirements
        const projectSelect = document.getElementById('adminCostProject');
        const requirementSelect = document.getElementById('adminCostRequirement');

        if (projectSelect) {
            projectSelect.innerHTML = '<option value="">Seleccionar proyecto</option>';
        }
        if (requirementSelect) {
            requirementSelect.innerHTML = '<option value="">Seleccionar requerimiento</option>';
        }
        return;
    }

    try {
        console.log('Starting to load projects and requirements...');
        const { getDocs, collection, query, where } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');

        console.log('Firebase imported successfully');
        console.log('Loading projects for user:', selectedUserEmail);

        // Load projects for the selected user
        const projectsQuery = query(
            collection(db, 'projects'),
            where('userEmail', '==', selectedUserEmail)
        );

        console.log('Executing projects query...');
        const projectsSnapshot = await getDocs(projectsQuery);
        console.log('Projects query executed. Found projects:', projectsSnapshot.size);

        const projectSelect = document.getElementById('adminCostProject');
        console.log('Project select element found:', !!projectSelect);

        if (projectSelect) {
            projectSelect.innerHTML = '<option value="">Seleccionar proyecto</option>';
            console.log('Cleared project select options');

            if (projectsSnapshot.empty) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No hay proyectos disponibles';
                option.disabled = true;
                projectSelect.appendChild(option);
                console.log('No projects found for user, added disabled option');
            } else {
                console.log('Adding project options...');
                projectsSnapshot.forEach((doc, index) => {
                    const project = doc.data();
                    console.log(`Project ${index + 1}:`, project.title, 'ID:', doc.id);

                    const option = document.createElement('option');
                    option.value = doc.id;
                    option.textContent = project.title;
                    projectSelect.appendChild(option);
                    console.log('Added project option:', project.title);
                });
                console.log('All project options added');
            }
        } else {
            console.error('Project select element not found');
        }

        console.log('Loading requirements for user:', selectedUserEmail);

        // Load requirements for the selected user
        const requirementsQuery = query(
            collection(db, 'requirements'),
            where('userEmail', '==', selectedUserEmail)
        );
        const requirementsSnapshot = await getDocs(requirementsQuery);

        console.log('Found requirements:', requirementsSnapshot.size);

        const requirementSelect = document.getElementById('adminCostRequirement');
        if (requirementSelect) {
            requirementSelect.innerHTML = '<option value="">Seleccionar requerimiento</option>';

            if (requirementsSnapshot.empty) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No hay requerimientos disponibles';
                option.disabled = true;
                requirementSelect.appendChild(option);
                console.log('No requirements found for user');
            } else {
                requirementsSnapshot.forEach(doc => {
                    const requirement = doc.data();
                    const option = document.createElement('option');
                    option.value = doc.id;
                    option.textContent = `${requirement.title} (${requirement.priority})`;
                    requirementSelect.appendChild(option);
                    console.log('Added requirement option:', requirement.title);
                });
            }
        } else {
            console.error('Requirement select element not found');
        }

    } catch (error) {
        console.error('Error loading user projects and requirements:', error);
        showNotification('Error al cargar proyectos y requerimientos: ' + error.message, 'error');
    }
}

// Submit admin cost
async function submitAdminCost() {
    const userEmail = document.getElementById('adminCostUser').value;
    const projectId = document.getElementById('adminCostProject').value;
    const requirementId = document.getElementById('adminCostRequirement').value;
    const title = document.getElementById('adminCostTitle').value.trim();
    const amount = parseFloat(document.getElementById('adminCostAmount').value);
    const priority = document.getElementById('adminCostPriority').value;
    const description = document.getElementById('adminCostDescription').value.trim();

    // Validar campos obligatorios
    if (!userEmail) {
        showNotification('Por favor selecciona un usuario', 'error');
        return;
    }

    if (!title) {
        showNotification('Por favor ingresa el título del costo', 'error');
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        showNotification('Por favor ingresa un monto válido', 'error');
        return;
    }

    try {
        const { addDoc, collection } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');

        const costData = {
            title: title,
            description: description,
            amount: amount,
            userEmail: userEmail,
            projectId: projectId || null,
            requirementId: requirementId || null,
            priority: priority,
            status: 'pending',
            createdBy: 'admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await addDoc(collection(db, 'costs'), costData);

        showNotification('Costo creado exitosamente', 'success');
        closeCostCreationModal();
        loadAdminCosts();

    } catch (error) {
        console.error('Error creating cost:', error);
        showNotification('Error al crear costo: ' + error.message, 'error');
    }
}

// Multimedia Projects Management
function openMultimediaUploadModal() {
    const modal = document.getElementById('multimediaUploadModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Load users for the select
    loadUsersForMultimedia();
}

function closeMultimediaUploadModal() {
    const modal = document.getElementById('multimediaUploadModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';

    // Reset form
    document.getElementById('multimediaUser').value = '';
    document.getElementById('multimediaType').value = '';
    document.getElementById('multimediaTitle').value = '';
    document.getElementById('multimediaDescription').value = '';
    document.getElementById('multimediaFile').value = '';
    document.getElementById('multimediaRelatedProject').value = '';

    // Hide preview
    document.getElementById('multimediaPreview').style.display = 'none';
    document.getElementById('uploadMultimediaBtn').disabled = true;
}

// Load users for multimedia upload
async function loadUsersForMultimedia() {
    try {
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');

        const usersSnapshot = await getDocs(collection(db, 'users'));
        const userSelect = document.getElementById('multimediaUser');

        if (userSelect) {
            userSelect.innerHTML = '<option value="">Seleccionar usuario</option>';

            usersSnapshot.forEach(doc => {
                const userData = doc.data();
                const option = document.createElement('option');
                option.value = userData.email;
                option.textContent = `${userData.name || userData.email} (${userData.email})`;
                userSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading users for multimedia:', error);
        showNotification('Error al cargar usuarios', 'error');
    }
}

// Update file input based on multimedia type
function updateFileInput() {
    const type = document.getElementById('multimediaType').value;
    const fileInput = document.getElementById('multimediaFile');

    if (type === 'video') {
        fileInput.accept = 'video/*';
        fileInput.setAttribute('data-type', 'video');
    } else if (type === 'audio') {
        fileInput.accept = 'audio/*';
        fileInput.setAttribute('data-type', 'audio');
    } else {
        fileInput.accept = 'video/*,audio/*';
        fileInput.removeAttribute('data-type');
    }
}

// Preview multimedia file
function previewMultimedia() {
    const fileInput = document.getElementById('multimediaFile');
    const file = fileInput.files[0];
    const preview = document.getElementById('multimediaPreview');
    const videoPreview = document.getElementById('videoPreview');
    const audioPreview = document.getElementById('audioPreview');

    if (!file) {
        preview.style.display = 'none';
        document.getElementById('uploadMultimediaBtn').disabled = true;
        return;
    }

    // Show preview
    preview.style.display = 'block';

    // Update file info
    const fileName = preview.querySelector('.file-name');
    const fileSize = preview.querySelector('.file-size');

    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);

    // Create preview URL
    const url = URL.createObjectURL(file);

    // Hide both previews first
    videoPreview.style.display = 'none';
    audioPreview.style.display = 'none';

    // Show appropriate preview
    if (file.type.startsWith('video/')) {
        videoPreview.src = url;
        videoPreview.style.display = 'block';
    } else if (file.type.startsWith('audio/')) {
        audioPreview.src = url;
        audioPreview.style.display = 'block';
    }

    // Enable upload button
    document.getElementById('uploadMultimediaBtn').disabled = false;
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Upload multimedia project
async function uploadMultimediaProject() {
    const userEmail = document.getElementById('multimediaUser').value;
    const type = document.getElementById('multimediaType').value;
    const title = document.getElementById('multimediaTitle').value.trim();
    const description = document.getElementById('multimediaDescription').value.trim();
    const fileInput = document.getElementById('multimediaFile');
    const relatedProject = document.getElementById('multimediaRelatedProject').value;

    // Validate required fields
    if (!userEmail || !type || !title || !fileInput.files[0]) {
        showNotification('Por favor completa todos los campos requeridos', 'error');
        return;
    }

    const file = fileInput.files[0];

    // Validate file type
    if (type === 'video' && !file.type.startsWith('video/')) {
        showNotification('Por favor selecciona un archivo de video válido', 'error');
        return;
    }

    if (type === 'audio' && !file.type.startsWith('audio/')) {
        showNotification('Por favor selecciona un archivo de audio válido', 'error');
        return;
    }

    try {
        // Upload file to server
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'multimedia');

        const uploadResponse = await fetch('http://localhost:3001/upload', {
            method: 'POST',
            body: formData
        });

        if (!uploadResponse.ok) {
            throw new Error('Error al subir el archivo');
        }

        const uploadResult = await uploadResponse.json();

        // Save multimedia project data to Firestore
        const { addDoc, collection } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');

        const multimediaData = {
            title: title,
            description: description,
            type: type,
            userEmail: userEmail,
            fileName: file.name,
            fileUrl: uploadResult.url,
            fileSize: file.size,
            mimeType: file.type,
            relatedProject: relatedProject || null,
            uploadedBy: 'admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await addDoc(collection(db, 'multimedia'), multimediaData);

        showNotification('Proyecto multimedia subido exitosamente', 'success');
        closeMultimediaUploadModal();
        loadMultimediaProjects();

    } catch (error) {
        console.error('Error uploading multimedia project:', error);
        showNotification('Error al subir proyecto multimedia: ' + error.message, 'error');
    }
}

// Load multimedia projects
async function loadMultimediaProjects() {
    try {
        const { getDocs, collection, query, orderBy } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');

        const multimediaQuery = query(collection(db, 'multimedia'), orderBy('createdAt', 'desc'));
        const multimediaSnapshot = await getDocs(multimediaQuery);
        const multimediaList = document.getElementById('adminMultimediaList');

        if (multimediaList) {
            multimediaList.innerHTML = '';

            if (multimediaSnapshot.empty) {
                multimediaList.innerHTML = `
                    <div class="no-data">
                        <i class="fas fa-video"></i>
                        <p>No hay proyectos multimedia</p>
                        <small>Los proyectos multimedia aparecerán aquí cuando se suban</small>
                    </div>
                `;
            } else {
                multimediaSnapshot.forEach(doc => {
                    const multimedia = doc.data();
                    multimedia.id = doc.id;
                    const multimediaCard = createAdminMultimediaCard(multimedia);
                    multimediaList.appendChild(multimediaCard);
                });
            }
        }
    } catch (error) {
        console.error('Error loading multimedia projects:', error);
        showNotification('Error al cargar proyectos multimedia', 'error');
    }
}

// Create admin multimedia card
function createAdminMultimediaCard(multimedia) {
    const card = document.createElement('div');
    card.className = 'admin-multimedia-card';

    const typeIcon = multimedia.type === 'video' ? 'fas fa-video' : 'fas fa-music';
    const typeText = multimedia.type === 'video' ? 'Video' : 'Audio';
    const createdDate = new Date(multimedia.createdAt).toLocaleDateString('es-ES');

    card.innerHTML = `
        <div class="multimedia-header">
            <div class="multimedia-info">
                <h3>${multimedia.title}</h3>
                <p class="multimedia-user">Usuario: ${multimedia.userEmail}</p>
                <p class="multimedia-type"><i class="${typeIcon}"></i> ${typeText}</p>
            </div>
            <div class="multimedia-actions">
                <button class="btn-primary" onclick="viewMultimedia('${multimedia.id}')">
                    <i class="fas fa-eye"></i>
                    Ver
                </button>
                <button class="btn-danger" onclick="deleteMultimedia('${multimedia.id}')">
                    <i class="fas fa-trash"></i>
                    Eliminar
                </button>
            </div>
        </div>
        <div class="multimedia-content">
            <p>${multimedia.description}</p>
            <div class="multimedia-meta">
                <span><i class="fas fa-calendar"></i> ${createdDate}</span>
                <span><i class="fas fa-file"></i> ${multimedia.fileName}</span>
                <span><i class="fas fa-weight"></i> ${formatFileSize(multimedia.fileSize)}</span>
                ${multimedia.relatedProject ? `<span><i class="fas fa-folder"></i> Proyecto relacionado</span>` : ''}
            </div>
        </div>
    `;

    return card;
}

// View multimedia
function viewMultimedia(multimediaId) {
    // Open multimedia in new tab or modal
    console.log('View multimedia:', multimediaId);
    // Implementation depends on how you want to display it
}

// Delete multimedia
async function deleteMultimedia(multimediaId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este proyecto multimedia?')) {
        return;
    }

    try {
        const { deleteDoc, doc } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');

        await deleteDoc(doc(db, 'multimedia', multimediaId));

        showNotification('Proyecto multimedia eliminado', 'success');
        loadMultimediaProjects();

    } catch (error) {
        console.error('Error deleting multimedia:', error);
        showNotification('Error al eliminar proyecto multimedia: ' + error.message, 'error');
    }
}

// User Edit Functions
let currentEditingUserId = null;

function openUserEditModal(userId) {
    currentEditingUserId = userId;
    const modal = document.getElementById('userEditModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Load user data
    loadUserDataForEdit(userId);
}

function closeUserEditModal() {
    const modal = document.getElementById('userEditModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentEditingUserId = null;

    // Reset form
    document.getElementById('editUserName').value = '';
    document.getElementById('editUserEmail').value = '';
    document.getElementById('editUserPhone').value = '';
    document.getElementById('editUserStatus').value = 'active';
    document.getElementById('editUserRole').value = 'client';
    document.getElementById('editUserNotes').value = '';
}

async function loadUserDataForEdit(userId) {
    try {
        const { getDoc, doc } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');

        const userDoc = await getDoc(doc(db, 'users', userId));

        if (userDoc.exists()) {
            const userData = userDoc.data();

            // Populate form with user data
            document.getElementById('editUserName').value = userData.name || '';
            document.getElementById('editUserEmail').value = userData.email || '';
            document.getElementById('editUserPhone').value = userData.phone || '';
            document.getElementById('editUserStatus').value = userData.status || 'active';
            document.getElementById('editUserRole').value = userData.role || 'client';
            document.getElementById('editUserNotes').value = userData.notes || '';

            console.log('User data loaded for editing:', userData);
        } else {
            showNotification('Usuario no encontrado', 'error');
            closeUserEditModal();
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        showNotification('Error al cargar datos del usuario: ' + error.message, 'error');
    }
}

async function saveUserChanges() {
    if (!currentEditingUserId) {
        showNotification('Error: No hay usuario seleccionado para editar', 'error');
        return;
    }

    const name = document.getElementById('editUserName').value.trim();
    const email = document.getElementById('editUserEmail').value.trim();
    const phone = document.getElementById('editUserPhone').value.trim();
    const status = document.getElementById('editUserStatus').value;
    const role = document.getElementById('editUserRole').value;
    const notes = document.getElementById('editUserNotes').value.trim();

    if (!name || !email) {
        showNotification('Por favor completa el nombre y correo electrónico', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showNotification('Por favor ingresa un correo electrónico válido', 'error');
        return;
    }

    try {
        const { updateDoc, doc } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');

        const updateData = {
            name: name,
            email: email,
            phone: phone,
            status: status,
            role: role,
            notes: notes,
            updatedAt: new Date().toISOString()
        };

        await updateDoc(doc(db, 'users', currentEditingUserId), updateData);

        showNotification('Usuario actualizado exitosamente', 'success');
        closeUserEditModal();
        loadUsers(); // Reload users list

    } catch (error) {
        console.error('Error updating user:', error);
        showNotification('Error al actualizar usuario: ' + error.message, 'error');
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// User Linking Functions
async function linkPendingUser(userEmail, userId) {
    try {
        console.log('Linking pending user:', userEmail, 'to user ID:', userId);

        const { getDocs, collection, updateDoc, doc, query, where } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');

        // Search for pending user with this email
        const pendingUsersQuery = query(
            collection(db, 'users'),
            where('email', '==', userEmail.toLowerCase().trim()),
            where('waitingForRegistration', '==', true)
        );

        const pendingUsersSnapshot = await getDocs(pendingUsersQuery);

        if (!pendingUsersSnapshot.empty) {
            const pendingUserDoc = pendingUsersSnapshot.docs[0];
            const pendingUserData = pendingUserDoc.data();

            console.log('Found pending user:', pendingUserData);

            // Update the pending user with the new user ID and status
            await updateDoc(doc(db, 'users', pendingUserDoc.id), {
                status: 'active',
                waitingForRegistration: false,
                linkedUserId: userId,
                linkedAt: new Date().toISOString()
            });

            // Also update the new user with admin-created data
            await updateDoc(doc(db, 'users', userId), {
                name: pendingUserData.name,
                createdBy: 'admin',
                isAdminCreated: true,
                adminCreatedAt: pendingUserData.createdAt,
                linkedFromPending: true
            });

            console.log('Successfully linked pending user to new registration');
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error linking pending user:', error);
        return false;
    }
}

// Function to check and link pending users (call this after user registration)
async function checkAndLinkPendingUser(userEmail, userId) {
    const linked = await linkPendingUser(userEmail, userId);
    if (linked) {
        console.log('User successfully linked to pending admin-created account');
        // You can show a notification here if needed
    }
    return linked;
}

// Load section-specific data
function loadSectionData(sectionName) {
    console.log('Loading data for section:', sectionName);

    switch (sectionName) {
        case 'users':
            loadUsersData();
            break;
        case 'projects':
            loadProjects();
            break;
        case 'files':
            loadFilesData();
            break;
        case 'messages':
            loadMessagesData();
            break;
        case 'chat':
            loadChatData();
            break;
        case 'settings':
            loadSettingsData();
            break;
        case 'overview':
            loadOverviewData();
            break;
        default:
            console.log('No specific data loading for section:', sectionName);
    }
}

// Load users data
async function loadUsersData() {
    console.log('Loading users data...');
    try {
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');

        const usersQuery = collection(db, 'users');
        const usersSnapshot = await getDocs(usersQuery);

        const usersContainer = document.getElementById('usersTableBody');
        if (usersContainer) {
            usersContainer.innerHTML = '';

            if (usersSnapshot.empty) {
                usersContainer.innerHTML = `
                    <tr>
                        <td colspan="4" class="no-data">
                            <i class="fas fa-users"></i>
                            <p>No hay usuarios registrados</p>
                        </td>
                    </tr>
                `;
            } else {
                usersSnapshot.forEach(doc => {
                    const userData = doc.data();
                    userData.id = doc.id;
                    const userRow = createUserRow(userData);
                    usersContainer.appendChild(userRow);
                });
            }
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Create user row
function createUserRow(user) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <div class="user-info">
                <div class="user-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div>
                    <div class="user-name">${user.name || 'Sin nombre'}</div>
                </div>
            </div>
        </td>
        <td>${user.email || 'Sin email'}</td>
        <td>${user.projects ? user.projects.length : 0}</td>
        <td>${user.lastActivity || 'Nunca'}</td>
        <td>
            <span class="status-badge ${user.status || 'inactive'}">${user.status === 'active' ? 'Activo' : 'Inactivo'}</span>
        </td>
        <td>
            <div class="action-buttons">
                <button class="btn-secondary" onclick="viewUser('${user.id}')" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
                              <button class="btn-primary" onclick="openUserEditModal('${user.id}')" title="Editar usuario">
                                  <i class="fas fa-edit"></i>
                              </button>
                <button class="btn-info" onclick="viewUserPanel('${user.id}', '${user.email}')" title="Ver panel de usuario">
                    <i class="fas fa-user-cog"></i>
                </button>
                <button class="btn-delete" onclick="deleteUser('${user.id}')" title="Eliminar usuario">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    return row;
}

// Load files data
async function loadFilesData() {
    console.log('Loading files data...');
    // Implementation for files data loading
}

// Load messages data
async function loadMessagesData() {
    console.log('Loading messages data...');
    // Implementation for messages data loading
}

// Load chat data
async function loadChatData() {
    console.log('Loading chat data...');
    // Implementation for chat data loading
}

// Load settings data
async function loadSettingsData() {
    console.log('Loading settings data...');
    // Implementation for settings data loading
}

// Load overview data
async function loadOverviewData() {
    console.log('Loading overview data...');
    // Implementation for overview data loading
}

// Make functions globally available
window.handleUserSelection = handleUserSelection;
window.checkUserExists = checkUserExists;
window.createNewUser = createNewUser;
window.loadSectionData = loadSectionData;
window.checkAndLinkPendingUser = checkAndLinkPendingUser;
