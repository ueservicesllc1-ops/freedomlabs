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
async function loadDashboardData() {
    // Load real data
    console.log('Loading dashboard data...');
    
    // Check if we're in developer mode
    setupDeveloperMode();
    
    // Load projects first
    await loadProjects();
    
    // Load messages
    loadMessages();
    
    // Load files
    loadFiles();
    
    // Load recent activity
    loadRecentActivity();
    
    // Load requirements
    loadRequirements();
    
    // Load costs
    loadCosts();
    
    // Load multimedia projects
    loadMultimediaProjects();
    
    // Preload projects for modals
    preloadProjectsForModals();
    
    // Update stats based on real data
    updateDashboardStats();
    
    // Animate stats cards
    animateStatsCards();
}

// Setup developer mode indicator
function setupDeveloperMode() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isDeveloperMode = user.isDeveloper && user.originalUserEmail;
    
    if (isDeveloperMode) {
        // Add developer mode indicator to header
        const headerContent = document.querySelector('.header-content');
        if (headerContent) {
            const devIndicator = document.createElement('div');
            devIndicator.className = 'developer-indicator';
            devIndicator.innerHTML = `
                <div class="dev-badge">
                    <i class="fas fa-code"></i>
                    <span>Vista de Desarrollador</span>
                </div>
                <div class="dev-user-info">
                    <small>Viendo como: ${user.originalUserEmail}</small>
                </div>
            `;
            devIndicator.style.cssText = `
                background: linear-gradient(135deg, #f59e0b, #d97706);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 8px;
                margin-left: 1rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.875rem;
                font-weight: 500;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            `;
            
            // Insert before the user info
            const userInfo = headerContent.querySelector('.user-info');
            if (userInfo) {
                headerContent.insertBefore(devIndicator, userInfo);
            }
        }
        
        // Update user info to show the original user
        const userName = document.querySelector('.user-name');
        const userEmail = document.querySelector('.user-email');
        
        if (userName) {
            userName.textContent = user.originalUserEmail.split('@')[0];
        }
        if (userEmail) {
            userEmail.textContent = user.originalUserEmail;
        }
        
        console.log('Developer mode activated for:', user.originalUserEmail);
    }
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
async function loadProjects() {
    console.log('Loading projects...');
    
    try {
        // Load projects from Firebase
        await loadProjectsFromFirebase();
    } catch (error) {
        console.error('Error loading projects:', error);
        // Fallback to static projects if Firebase fails
        loadStaticProjects();
    }
}

// Load projects from Firebase
async function loadProjectsFromFirebase() {
    const { getDocs, collection, query, where } = await import('firebase/firestore');
    const { db } = await import('./firebase-config.js');
    
    // Get current user
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Check if we're in developer mode (viewing as another user)
    const isDeveloperMode = user.isDeveloper && user.originalUserEmail;
    const userEmail = isDeveloperMode ? user.originalUserEmail : user.email;
    
    console.log('Loading projects for user:', userEmail, 'Developer mode:', isDeveloperMode);
    
    if (!userEmail) {
        console.error('No user email found');
        return;
    }
    
    // Query projects for this specific user
    const projectsQuery = query(
        collection(db, 'projects'),
        where('userEmail', '==', userEmail)
    );
    
    const projectsSnapshot = await getDocs(projectsQuery);
    const projectsContainer = document.querySelector('.projects-grid');
    
    if (projectsContainer) {
        projectsContainer.innerHTML = '';
        
        if (projectsSnapshot.empty) {
            const message = isDeveloperMode ? 
                `No hay proyectos asignados a ${userEmail}` : 
                'No hay proyectos asignados a tu cuenta';
            const subtitle = isDeveloperMode ?
                `Vista de desarrollador: ${userEmail}` :
                `Los proyectos aparecerán aquí cuando el administrador los asigne a tu email: ${userEmail}`;
                
            projectsContainer.innerHTML = `
                <div class="no-projects">
                    <i class="fas fa-folder-open"></i>
                    <p>${message}</p>
                    <small>${subtitle}</small>
                </div>
            `;
            console.log('No projects found for user:', userEmail);
        } else {
            // Sort projects by creation date (newest first)
            const projects = [];
            projectsSnapshot.forEach(doc => {
                const projectData = doc.data();
                projectData.id = doc.id;
                projects.push(projectData);
            });
            
            projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            console.log(`Found ${projects.length} projects for user:`, userEmail);
            
            projects.forEach(project => {
                console.log('Creating project card for:', project.title, 'Demo URL:', project.demoUrl);
                const projectCard = createClientProjectCard(project);
                projectsContainer.appendChild(projectCard);
            });
        }
    }
}

// Create project card for client dashboard
function createClientProjectCard(project) {
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card';
    
    const createdDate = new Date(project.createdAt).toLocaleDateString('es-ES');
    const statusClass = project.status === 'completed' ? 'active' : 
                       project.status === 'in-progress' ? 'active' : 'pending';
    const statusText = project.status === 'completed' ? 'Completado' : 
                      project.status === 'in-progress' ? 'En Progreso' : 'Pendiente';
    
    // Calculate progress based on status
    const progress = project.status === 'completed' ? 100 : 
                   project.status === 'in-progress' ? 75 : 30;
    
    projectCard.innerHTML = `
        <div class="project-header">
            <h3>${project.title}</h3>
            <span class="project-status ${statusClass}">${statusText}</span>
        </div>
        <div class="project-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <span class="progress-text">${progress}% Completado</span>
        </div>
        <div class="project-details">
            <p><i class="fas fa-calendar"></i> Fecha: ${createdDate}</p>
            <p><i class="fas fa-dollar-sign"></i> Precio Acordado: $${project.price ? project.price.toFixed(2) : '0.00'}</p>
            <p><i class="fas fa-tag"></i> Categoría: ${project.category}</p>
            ${project.demoUrl ? `<p><i class="fas fa-external-link-alt"></i> <a href="${project.demoUrl.startsWith('http') ? project.demoUrl : 'https://' + project.demoUrl}" target="_blank" onclick="event.stopPropagation()" class="demo-link">Ver Demo</a></p>` : ''}
        </div>
    `;
    
    // Add click handler (but not for links)
    projectCard.addEventListener('click', function(e) {
        // Don't trigger if clicking on a link
        if (e.target.tagName === 'A' || e.target.closest('a')) {
            return;
        }
        showProjectDetails(project.title);
    });
    
    return projectCard;
}

// Fallback to static projects
function loadStaticProjects() {
    const projectsContainer = document.querySelector('.projects-grid');
    if (projectsContainer) {
        // Keep the existing static content as fallback
        console.log('Using static projects as fallback');
    }
}

// Update dashboard stats based on real data
function updateDashboardStats() {
    const projectsContainer = document.querySelector('.projects-grid');
    const activeProjectsCount = document.getElementById('activeProjectsCount');
    const daysRemaining = document.getElementById('daysRemaining');
    const totalValue = document.getElementById('totalValue');
    
    if (!projectsContainer) return;
    
    // Count active projects
    const projectCards = projectsContainer.querySelectorAll('.project-card');
    const activeProjects = Array.from(projectCards).filter(card => {
        const statusElement = card.querySelector('.project-status');
        return statusElement && !statusElement.classList.contains('pending');
    });
    
    // Update active projects count
    if (activeProjectsCount) {
        activeProjectsCount.textContent = activeProjects.length;
    }
    
    // Calculate total value from projects
    let totalProjectValue = 0;
    projectCards.forEach(card => {
        const priceElement = card.querySelector('.project-details p:has(.fa-dollar-sign)');
        if (priceElement) {
            const priceText = priceElement.textContent;
            const priceMatch = priceText.match(/\$([\d,]+\.?\d*)/);
            if (priceMatch) {
                const price = parseFloat(priceMatch[1].replace(',', ''));
                if (!isNaN(price)) {
                    totalProjectValue += price;
                }
            }
        }
    });
    
    // Update total value
    if (totalValue) {
        totalValue.textContent = `$${totalProjectValue.toLocaleString()}`;
    }
    
    // Update days remaining (simplified calculation)
    if (daysRemaining) {
        if (activeProjects.length > 0) {
            // Simple calculation: 30 days per project
            const estimatedDays = activeProjects.length * 30;
            daysRemaining.textContent = estimatedDays;
        } else {
            daysRemaining.textContent = '-';
        }
    }
    
    console.log(`Updated stats: ${activeProjects.length} active projects, $${totalProjectValue} total value`);
}

// Load messages
async function loadMessages() {
    console.log('Loading messages...');
    
    try {
        // Load messages from Firebase
        await loadMessagesFromFirebase();
    } catch (error) {
        console.error('Error loading messages:', error);
        // Show empty state
        const messagesContainer = document.querySelector('.messages-list');
        if (messagesContainer) {
            messagesContainer.innerHTML = `
                <div class="no-messages">
                    <i class="fas fa-envelope-open"></i>
                    <p>No hay mensajes disponibles</p>
                </div>
            `;
        }
    }
}

// Load messages from Firebase
async function loadMessagesFromFirebase() {
    const { getDocs, collection, query, where } = await import('firebase/firestore');
    const { db } = await import('./firebase-config.js');
    
    // Get current user
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = user.email;
    
    if (!userEmail) {
        console.error('No user email found for messages');
        return;
    }
    
    // Query messages for this specific user
    const messagesQuery = query(
        collection(db, 'messages'),
        where('userEmail', '==', userEmail)
    );
    
    const messagesSnapshot = await getDocs(messagesQuery);
    const messagesContainer = document.querySelector('.messages-list');
    
    if (messagesContainer) {
        messagesContainer.innerHTML = '';
        
        if (messagesSnapshot.empty) {
            messagesContainer.innerHTML = `
                <div class="no-messages">
                    <i class="fas fa-envelope-open"></i>
                    <p>No hay mensajes disponibles</p>
                </div>
            `;
        } else {
            const messages = [];
            messagesSnapshot.forEach(doc => {
                const messageData = doc.data();
                messageData.id = doc.id;
                messages.push(messageData);
            });
            
            // Sort by date (newest first)
            messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            messages.forEach(message => {
                const messageElement = createMessageElement(message);
                messagesContainer.appendChild(messageElement);
            });
        }
    }
}

// Create message element
function createMessageElement(message) {
    const messageElement = document.createElement('div');
    messageElement.className = `message-item ${message.isRead ? '' : 'unread'}`;
    
    const timeAgo = getTimeAgo(message.createdAt);
    
    messageElement.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-user"></i>
        </div>
        <div class="message-content">
            <div class="message-header">
                <h4>${message.senderName || 'Sistema'}</h4>
                <span class="message-time">${timeAgo}</span>
            </div>
            <p>${message.content}</p>
        </div>
    `;
    
    // Add click handler
    messageElement.addEventListener('click', function() {
        const sender = this.querySelector('h4').textContent;
        const message = this.querySelector('p').textContent;
        showMessageDetails(sender, message);
    });
    
    return messageElement;
}

// Get time ago string
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    if (diffInHours < 48) return 'Ayer';
    return date.toLocaleDateString('es-ES');
}

// Load files
async function loadFiles() {
    console.log('Loading files...');
    
    try {
        // Load files from Firebase
        await loadFilesFromFirebase();
    } catch (error) {
        console.error('Error loading files:', error);
        // Show empty state
        const filesContainer = document.querySelector('.files-grid');
        if (filesContainer) {
            filesContainer.innerHTML = `
                <div class="no-files">
                    <i class="fas fa-folder-open"></i>
                    <p>No hay archivos disponibles</p>
                </div>
            `;
        }
    }
}

// Load files from Firebase
async function loadFilesFromFirebase() {
    const { getDocs, collection, query, where } = await import('firebase/firestore');
    const { db } = await import('./firebase-config.js');
    
    // Get current user
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = user.email;
    
    if (!userEmail) {
        console.error('No user email found for files');
        return;
    }
    
    // Query files for this specific user
    const filesQuery = query(
        collection(db, 'files'),
        where('userEmail', '==', userEmail)
    );
    
    const filesSnapshot = await getDocs(filesQuery);
    const filesContainer = document.querySelector('.files-grid');
    
    if (filesContainer) {
        filesContainer.innerHTML = '';
        
        if (filesSnapshot.empty) {
            filesContainer.innerHTML = `
                <div class="no-files">
                    <i class="fas fa-folder-open"></i>
                    <p>No hay archivos disponibles</p>
                </div>
            `;
        } else {
            const files = [];
            filesSnapshot.forEach(doc => {
                const fileData = doc.data();
                fileData.id = doc.id;
                files.push(fileData);
            });
            
            // Sort by date (newest first)
            files.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            files.forEach(file => {
                const fileElement = createFileElement(file);
                filesContainer.appendChild(fileElement);
            });
        }
    }
}

// Create file element
function createFileElement(file) {
    const fileElement = document.createElement('div');
    fileElement.className = 'file-item';
    
    const fileIcon = getFileIcon(file.type);
    
    fileElement.innerHTML = `
        <div class="file-icon">
            <i class="${fileIcon}"></i>
        </div>
        <div class="file-info">
            <h4>${file.name}</h4>
            <p>${file.description || 'Archivo del proyecto'}</p>
            <span class="file-size">${formatFileSize(file.size)}</span>
        </div>
        <div class="file-actions">
            <button class="btn-download" onclick="downloadFile('${file.id}')">
                <i class="fas fa-download"></i>
            </button>
        </div>
    `;
    
    return fileElement;
}

// Get file icon based on type
function getFileIcon(fileType) {
    if (fileType.includes('image')) return 'fas fa-file-image';
    if (fileType.includes('pdf')) return 'fas fa-file-pdf';
    if (fileType.includes('word')) return 'fas fa-file-word';
    if (fileType.includes('excel')) return 'fas fa-file-excel';
    if (fileType.includes('powerpoint')) return 'fas fa-file-powerpoint';
    if (fileType.includes('code')) return 'fas fa-file-code';
    return 'fas fa-file';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Load recent activity
async function loadRecentActivity() {
    console.log('Loading recent activity...');
    
    try {
        // Load activity from Firebase
        await loadActivityFromFirebase();
    } catch (error) {
        console.error('Error loading activity:', error);
        // Show empty state
        const activityContainer = document.getElementById('activityList');
        if (activityContainer) {
            activityContainer.innerHTML = `
                <div class="no-activity">
                    <i class="fas fa-clock"></i>
                    <p>No hay actividad reciente</p>
                </div>
            `;
        }
    }
}

// Load activity from Firebase
async function loadActivityFromFirebase() {
    const { getDocs, collection, query, where, orderBy, limit } = await import('firebase/firestore');
    const { db } = await import('./firebase-config.js');
    
    // Get current user
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = user.email;
    
    if (!userEmail) {
        console.error('No user email found for activity');
        return;
    }
    
    // Query activity for this specific user
    const activityQuery = query(
        collection(db, 'activity'),
        where('userEmail', '==', userEmail),
        orderBy('createdAt', 'desc'),
        limit(10)
    );
    
    const activitySnapshot = await getDocs(activityQuery);
    const activityContainer = document.getElementById('activityList');
    
    if (activityContainer) {
        activityContainer.innerHTML = '';
        
        if (activitySnapshot.empty) {
            activityContainer.innerHTML = `
                <div class="no-activity">
                    <i class="fas fa-clock"></i>
                    <p>No hay actividad reciente</p>
                </div>
            `;
        } else {
            const activities = [];
            activitySnapshot.forEach(doc => {
                const activityData = doc.data();
                activityData.id = doc.id;
                activities.push(activityData);
            });
            
            activities.forEach(activity => {
                const activityElement = createActivityElement(activity);
                activityContainer.appendChild(activityElement);
            });
        }
    }
}

// Create activity element
function createActivityElement(activity) {
    const activityElement = document.createElement('div');
    activityElement.className = 'activity-item';
    
    const timeAgo = getTimeAgo(activity.createdAt);
    const activityIcon = getActivityIcon(activity.type);
    
    activityElement.innerHTML = `
        <div class="activity-icon">
            <i class="${activityIcon}"></i>
        </div>
        <div class="activity-content">
            <h4>${activity.title}</h4>
            <p>${activity.description}</p>
            <span class="activity-time">${timeAgo}</span>
        </div>
    `;
    
    return activityElement;
}

// Get activity icon based on type
function getActivityIcon(activityType) {
    const iconMap = {
        'project_created': 'fas fa-plus-circle',
        'project_updated': 'fas fa-edit',
        'project_completed': 'fas fa-check-circle',
        'file_uploaded': 'fas fa-upload',
        'message_sent': 'fas fa-envelope',
        'bug_fixed': 'fas fa-bug',
        'feature_added': 'fas fa-code',
        'status_changed': 'fas fa-sync',
        'payment_received': 'fas fa-dollar-sign',
        'meeting_scheduled': 'fas fa-calendar'
    };
    
    return iconMap[activityType] || 'fas fa-info-circle';
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

// Load project information from admin data
function loadProjectInfo() {
    // Get quotes from localStorage (admin data)
    const quotes = JSON.parse(localStorage.getItem('quotes')) || [];
    
    // Find the current user's project
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userProject = quotes.find(quote => quote.email === user.email);
    
    if (userProject) {
        // Update project information
        updateProjectInfo(userProject);
        
        // Update stats cards
        updateStatsCards(userProject);
    } else {
        // No project found, show default values
        showNoProjectMessage();
    }
}

// Update project information display
function updateProjectInfo(project) {
    // Project name
    const projectNameEl = document.getElementById('projectName');
    if (projectNameEl) {
        projectNameEl.textContent = project.projectName || 'Proyecto sin nombre';
    }
    
    // Project type
    const projectTypeEl = document.getElementById('projectType');
    if (projectTypeEl) {
        projectTypeEl.textContent = getProjectTypeLabel(project.projectType);
    }
    
    // Project status
    const projectStatusEl = document.getElementById('projectStatus');
    if (projectStatusEl) {
        projectStatusEl.textContent = getStatusLabel(project.status);
        projectStatusEl.className = `status-badge status-${project.status}`;
    }
    
    // Project value
    const projectValueEl = document.getElementById('projectValue');
    if (projectValueEl) {
        const totalPrice = project.totalPrice || project.basePrice || 0;
        projectValueEl.textContent = `$${totalPrice.toFixed(2)}`;
    }
}

// Update stats cards
function updateStatsCards(project) {
    // Active projects count
    const activeProjectsEl = document.getElementById('activeProjectsCount');
    if (activeProjectsEl) {
        activeProjectsEl.textContent = '1';
    }
    
    // Days remaining (calculate based on project date and estimated delivery)
    const daysRemainingEl = document.getElementById('daysRemaining');
    if (daysRemainingEl) {
        const projectDate = new Date(project.date);
        const estimatedDays = getEstimatedDays(project.projectType);
        const deliveryDate = new Date(projectDate.getTime() + (estimatedDays * 24 * 60 * 60 * 1000));
        const today = new Date();
        const daysLeft = Math.ceil((deliveryDate - today) / (24 * 60 * 60 * 1000));
        
        if (daysLeft > 0) {
            daysRemainingEl.textContent = daysLeft;
        } else if (project.status === 'completed') {
            daysRemainingEl.textContent = 'Completado';
        } else {
            daysRemainingEl.textContent = 'En progreso';
        }
    }
    
    // Project progress
    const projectProgressEl = document.getElementById('projectProgress');
    if (projectProgressEl) {
        const progress = getProjectProgress(project.status);
        projectProgressEl.textContent = `${progress}%`;
    }
    
    // Total investment
    const totalInvestmentEl = document.getElementById('totalInvestment');
    if (totalInvestmentEl) {
        const totalPrice = project.totalPrice || project.basePrice || 0;
        totalInvestmentEl.textContent = `$${totalPrice.toFixed(2)}`;
    }
}

// Get project type label
function getProjectTypeLabel(type) {
    const labels = {
        'sitio-web': 'Sitio Web',
        'app-movil': 'Aplicación Móvil',
        'app-web': 'Aplicación Web',
        'ecommerce': 'Tienda Online',
        'sistema-empresarial': 'Sistema Empresarial'
    };
    return labels[type] || type;
}

// Preload projects for modals
async function preloadProjectsForModals() {
    try {
        const { getDocs, collection, query, where } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');
        
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const isDeveloperMode = user.isDeveloper && user.originalUserEmail;
        const userEmail = isDeveloperMode ? user.originalUserEmail : user.email;
        
        const projectsQuery = query(
            collection(db, 'projects'),
            where('userEmail', '==', userEmail)
        );
        
        const projectsSnapshot = await getDocs(projectsQuery);
        console.log('Preloaded projects for modals:', projectsSnapshot.size);
        
        // Store projects in a global variable for quick access
        window.userProjects = [];
        projectsSnapshot.forEach(doc => {
            window.userProjects.push({
                id: doc.id,
                title: doc.data().title
            });
        });
        
    } catch (error) {
        console.error('Error preloading projects:', error);
    }
}

// Requirements and Costs Management
function openRequirementModal() {
    const modal = document.getElementById('requirementModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Load projects for the select
    setTimeout(() => {
        loadProjectsForSelect('requirementProject');
    }, 100);
}

function closeRequirementModal() {
    const modal = document.getElementById('requirementModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Reset form
    document.getElementById('requirementTitle').value = '';
    document.getElementById('requirementDescription').value = '';
    document.getElementById('requirementPriority').value = 'medium';
    document.getElementById('requirementProject').value = '';
}


// Load projects for select dropdowns
async function loadProjectsForSelect(selectId) {
    try {
        console.log('Loading projects for select:', selectId);
        const select = document.getElementById(selectId);
        
        if (!select) {
            console.error('Select element not found:', selectId);
            return;
        }
        
        // Clear existing options
        select.innerHTML = '<option value="">Seleccionar proyecto</option>';
        
        // Check if we have preloaded projects
        if (window.userProjects && window.userProjects.length > 0) {
            console.log('Using preloaded projects:', window.userProjects.length);
            window.userProjects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = project.title;
                select.appendChild(option);
                console.log('Added project option:', project.title);
            });
        } else {
            // Fallback: load from Firebase
            console.log('Loading projects from Firebase...');
            const { getDocs, collection, query, where } = await import('firebase/firestore');
            const { db } = await import('./firebase-config.js');
            
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const isDeveloperMode = user.isDeveloper && user.originalUserEmail;
            const userEmail = isDeveloperMode ? user.originalUserEmail : user.email;
            
            console.log('Loading projects for user:', userEmail, 'Developer mode:', isDeveloperMode);
            
            const projectsQuery = query(
                collection(db, 'projects'),
                where('userEmail', '==', userEmail)
            );
            
            const projectsSnapshot = await getDocs(projectsQuery);
            console.log('Found projects:', projectsSnapshot.size);
            
            if (projectsSnapshot.empty) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No hay proyectos disponibles';
                option.disabled = true;
                select.appendChild(option);
                console.log('No projects found for user');
            } else {
                projectsSnapshot.forEach(doc => {
                    const project = doc.data();
                    const option = document.createElement('option');
                    option.value = doc.id;
                    option.textContent = project.title;
                    select.appendChild(option);
                    console.log('Added project option:', project.title);
                });
            }
        }
    } catch (error) {
        console.error('Error loading projects for select:', error);
        showNotification('Error al cargar proyectos: ' + error.message, 'error');
    }
}

// Submit requirement
async function submitRequirement() {
    const title = document.getElementById('requirementTitle').value.trim();
    const description = document.getElementById('requirementDescription').value.trim();
    const priority = document.getElementById('requirementPriority').value;
    const projectId = document.getElementById('requirementProject').value;
    
    if (!title || !description) {
        showNotification('Por favor completa todos los campos requeridos', 'error');
        return;
    }
    
    try {
        const { addDoc, collection } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');
        
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const isDeveloperMode = user.isDeveloper && user.originalUserEmail;
        const userEmail = isDeveloperMode ? user.originalUserEmail : user.email;
        
        const requirementData = {
            title: title,
            description: description,
            priority: priority,
            projectId: projectId,
            userEmail: userEmail,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        await addDoc(collection(db, 'requirements'), requirementData);
        
        showNotification('Requerimiento enviado exitosamente', 'success');
        closeRequirementModal();
        loadRequirements();
        
    } catch (error) {
        console.error('Error submitting requirement:', error);
        showNotification('Error al enviar requerimiento: ' + error.message, 'error');
    }
}


// Load requirements
async function loadRequirements() {
    try {
        const { getDocs, collection, query, where, orderBy } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');
        
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const isDeveloperMode = user.isDeveloper && user.originalUserEmail;
        const userEmail = isDeveloperMode ? user.originalUserEmail : user.email;
        
        const requirementsQuery = query(
            collection(db, 'requirements'),
            where('userEmail', '==', userEmail),
            orderBy('createdAt', 'desc')
        );
        
        const requirementsSnapshot = await getDocs(requirementsQuery);
        const requirementsList = document.getElementById('requirementsList');
        
        if (requirementsList) {
            requirementsList.innerHTML = '';
            
            if (requirementsSnapshot.empty) {
                requirementsList.innerHTML = `
                    <div class="no-data">
                        <i class="fas fa-clipboard-list"></i>
                        <p>No hay requerimientos de cambio</p>
                        <small>Los requerimientos aparecerán aquí cuando los solicites</small>
                    </div>
                `;
            } else {
                requirementsSnapshot.forEach(doc => {
                    const requirement = doc.data();
                    const requirementCard = createRequirementCard(requirement);
                    requirementsList.appendChild(requirementCard);
                });
            }
        }
    } catch (error) {
        console.error('Error loading requirements:', error);
    }
}

// Load costs
async function loadCosts() {
    try {
        const { getDocs, collection, query, where, orderBy } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');
        
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const isDeveloperMode = user.isDeveloper && user.originalUserEmail;
        const userEmail = isDeveloperMode ? user.originalUserEmail : user.email;
        
        const costsQuery = query(
            collection(db, 'costs'),
            where('userEmail', '==', userEmail),
            orderBy('createdAt', 'desc')
        );
        
        const costsSnapshot = await getDocs(costsQuery);
        const costsList = document.getElementById('costsList');
        
        if (costsList) {
            costsList.innerHTML = '';
            
            if (costsSnapshot.empty) {
                costsList.innerHTML = `
                    <div class="no-data">
                        <i class="fas fa-dollar-sign"></i>
                        <p>No hay costos adicionales</p>
                        <small>Los costos adicionales aparecerán aquí cuando se agreguen</small>
                    </div>
                `;
            } else {
                costsSnapshot.forEach(doc => {
                    const cost = doc.data();
                    const costCard = createCostCard(cost);
                    costsList.appendChild(costCard);
                });
            }
        }
    } catch (error) {
        console.error('Error loading costs:', error);
    }
}

// Create requirement card
function createRequirementCard(requirement) {
    const card = document.createElement('div');
    card.className = 'requirement-card';
    
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
            <h3>${requirement.title}</h3>
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
    `;
    
    return card;
}

// Create cost card for user dashboard
function createCostCard(cost) {
    const card = document.createElement('div');
    card.className = 'cost-card';
    
    const statusClass = {
        'pending': 'status-pending',
        'approved': 'status-approved',
        'rejected': 'status-rejected'
    }[cost.status] || 'status-pending';
    
    const statusText = {
        'pending': 'Pendiente de Aprobación',
        'approved': 'Aprobado',
        'rejected': 'Rechazado'
    }[cost.status] || 'Pendiente de Aprobación';
    
    const createdDate = new Date(cost.createdAt).toLocaleDateString('es-ES');
    
    // Only show action buttons if status is pending
    const actionButtons = cost.status === 'pending' ? `
        <div class="cost-actions">
            <button class="btn-success" onclick="approveCost('${cost.id}')">
                <i class="fas fa-check"></i>
                Aprobar
            </button>
            <button class="btn-danger" onclick="rejectCost('${cost.id}')">
                <i class="fas fa-times"></i>
                Rechazar
            </button>
        </div>
    ` : '';
    
    card.innerHTML = `
        <div class="cost-header">
            <h3>${cost.title}</h3>
            <div class="cost-amount">$${cost.amount.toFixed(2)}</div>
        </div>
        <div class="cost-content">
            <p>${cost.description}</p>
            <div class="cost-meta">
                <span class="status-badge ${statusClass}">${statusText}</span>
                <span><i class="fas fa-calendar"></i> ${createdDate}</span>
                ${cost.projectId ? `<span><i class="fas fa-folder"></i> Proyecto relacionado</span>` : ''}
            </div>
        </div>
        ${actionButtons}
    `;
    
    return card;
}

// Approve cost
async function approveCost(costId) {
    if (!confirm('¿Estás seguro de que quieres aprobar este costo adicional?')) {
        return;
    }
    
    try {
        const { updateDoc, doc } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');
        
        await updateDoc(doc(db, 'costs', costId), {
            status: 'approved',
            updatedAt: new Date().toISOString(),
            approvedBy: 'user',
            approvedAt: new Date().toISOString()
        });
        
        showNotification('Costo aprobado exitosamente', 'success');
        loadCosts();
        
    } catch (error) {
        console.error('Error approving cost:', error);
        showNotification('Error al aprobar costo: ' + error.message, 'error');
    }
}

// Reject cost
async function rejectCost(costId) {
    if (!confirm('¿Estás seguro de que quieres rechazar este costo adicional?')) {
        return;
    }
    
    try {
        const { updateDoc, doc } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');
        
        await updateDoc(doc(db, 'costs', costId), {
            status: 'rejected',
            updatedAt: new Date().toISOString(),
            rejectedBy: 'user',
            rejectedAt: new Date().toISOString()
        });
        
        showNotification('Costo rechazado', 'success');
        loadCosts();
        
    } catch (error) {
        console.error('Error rejecting cost:', error);
        showNotification('Error al rechazar costo: ' + error.message, 'error');
    }
}

// Get status label
function getStatusLabel(status) {
    const labels = {
        'planning': 'Planificación',
        'in-progress': 'En Progreso',
        'completed': 'Completado',
        'cancelled': 'Cancelado'
    };
    return labels[status] || status;
}

// Get estimated days for project type
function getEstimatedDays(projectType) {
    const estimates = {
        'sitio-web': 14,
        'app-movil': 21,
        'app-web': 18,
        'ecommerce': 21,
        'sistema-empresarial': 30
    };
    return estimates[projectType] || 14;
}

// Get project progress based on status
function getProjectProgress(status) {
    const progress = {
        'planning': 10,
        'in-progress': 50,
        'completed': 100,
        'cancelled': 0
    };
    return progress[status] || 0;
}

// Show message when no project is found
function showNoProjectMessage() {
    const projectNameEl = document.getElementById('projectName');
    const projectTypeEl = document.getElementById('projectType');
    const projectStatusEl = document.getElementById('projectStatus');
    const projectValueEl = document.getElementById('projectValue');
    
    if (projectNameEl) projectNameEl.textContent = 'No hay proyecto asignado';
    if (projectTypeEl) projectTypeEl.textContent = '-';
    if (projectStatusEl) {
        projectStatusEl.textContent = 'Sin proyecto';
        projectStatusEl.className = 'status-badge';
    }
    if (projectValueEl) projectValueEl.textContent = '$0.00';
}

// Call loadProjectInfo when dashboard loads
document.addEventListener('DOMContentLoaded', function() {
    // Add a small delay to ensure all elements are loaded
    setTimeout(loadProjectInfo, 100);
});

// Multimedia Projects Management
let currentMultimediaData = null;

// Load multimedia projects for the current user
async function loadMultimediaProjects() {
    try {
        const { getDocs, collection, query, where, orderBy } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');
        
        // Get current user email
        const userEmail = localStorage.getItem('userEmail') || 
                         (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : null);
        
        if (!userEmail) {
            console.error('No user email found');
            return;
        }
        
        console.log('Loading multimedia projects for user:', userEmail);
        
        // Query multimedia projects for this user
        const multimediaQuery = query(
            collection(db, 'multimedia'),
            where('userEmail', '==', userEmail),
            orderBy('createdAt', 'desc')
        );
        
        const multimediaSnapshot = await getDocs(multimediaQuery);
        const multimediaList = document.getElementById('multimediaList');
        
        if (multimediaList) {
            multimediaList.innerHTML = '';
            
            if (multimediaSnapshot.empty) {
                multimediaList.innerHTML = `
                    <div class="no-data">
                        <i class="fas fa-video"></i>
                        <p>No hay proyectos multimedia</p>
                        <small>Los proyectos multimedia aparecerán aquí cuando el administrador los suba</small>
                    </div>
                `;
            } else {
                multimediaSnapshot.forEach(doc => {
                    const multimedia = doc.data();
                    multimedia.id = doc.id;
                    const multimediaCard = createMultimediaCard(multimedia);
                    multimediaList.appendChild(multimediaCard);
                });
            }
        }
        
        console.log('Multimedia projects loaded successfully');
        
    } catch (error) {
        console.error('Error loading multimedia projects:', error);
        const multimediaList = document.getElementById('multimediaList');
        if (multimediaList) {
            multimediaList.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar proyectos multimedia</p>
                    <small>Intenta recargar la página</small>
                </div>
            `;
        }
    }
}

// Create multimedia card for user dashboard
function createMultimediaCard(multimedia) {
    const card = document.createElement('div');
    card.className = 'multimedia-card';
    
    const typeIcon = multimedia.type === 'video' ? 'fas fa-video' : 'fas fa-music';
    const typeText = multimedia.type === 'video' ? 'Video' : 'Audio';
    const createdDate = new Date(multimedia.createdAt).toLocaleDateString('es-ES');
    
    card.innerHTML = `
        <div class="multimedia-card-header">
            <div class="multimedia-type-badge">
                <i class="${typeIcon}"></i>
                <span>${typeText}</span>
            </div>
            <div class="multimedia-date">
                <i class="fas fa-calendar"></i>
                <span>${createdDate}</span>
            </div>
        </div>
        <div class="multimedia-card-content">
            <h3 class="multimedia-title">${multimedia.title}</h3>
            <p class="multimedia-description">${multimedia.description}</p>
            <div class="multimedia-file-info">
                <span class="file-name">
                    <i class="fas fa-file"></i>
                    ${multimedia.fileName}
                </span>
                <span class="file-size">
                    <i class="fas fa-weight"></i>
                    ${formatFileSize(multimedia.fileSize)}
                </span>
            </div>
        </div>
        <div class="multimedia-card-actions">
            <button class="btn-primary" onclick="viewMultimedia('${multimedia.id}')">
                <i class="fas fa-play"></i>
                Ver ${typeText}
            </button>
            <button class="btn-secondary" onclick="downloadMultimediaFile('${multimedia.fileUrl}', '${multimedia.fileName}')">
                <i class="fas fa-download"></i>
                Descargar
            </button>
        </div>
    `;
    
    return card;
}

// View multimedia in modal
async function viewMultimedia(multimediaId) {
    try {
        const { getDoc, doc } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');
        
        const multimediaDoc = await getDoc(doc(db, 'multimedia', multimediaId));
        
        if (!multimediaDoc.exists()) {
            showNotification('Proyecto multimedia no encontrado', 'error');
            return;
        }
        
        const multimedia = multimediaDoc.data();
        currentMultimediaData = multimedia;
        
        // Open modal
        const modal = document.getElementById('multimediaViewerModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Set title
        document.getElementById('multimediaViewerTitle').textContent = multimedia.title;
        
        // Set description
        document.getElementById('multimediaDescription').textContent = multimedia.description;
        
        // Set metadata
        const metadata = document.getElementById('multimediaMeta');
        const createdDate = new Date(multimedia.createdAt).toLocaleDateString('es-ES');
        metadata.innerHTML = `
            <div class="meta-item">
                <i class="fas fa-calendar"></i>
                <span>Subido: ${createdDate}</span>
            </div>
            <div class="meta-item">
                <i class="fas fa-file"></i>
                <span>Archivo: ${multimedia.fileName}</span>
            </div>
            <div class="meta-item">
                <i class="fas fa-weight"></i>
                <span>Tamaño: ${formatFileSize(multimedia.fileSize)}</span>
            </div>
            <div class="meta-item">
                <i class="fas fa-tag"></i>
                <span>Tipo: ${multimedia.type === 'video' ? 'Video' : 'Audio'}</span>
            </div>
        `;
        
        // Create player
        const player = document.getElementById('multimediaPlayer');
        player.innerHTML = '';
        
        if (multimedia.type === 'video') {
            const video = document.createElement('video');
            video.src = multimedia.fileUrl;
            video.controls = true;
            video.style.width = '100%';
            video.style.maxHeight = '400px';
            video.style.borderRadius = '8px';
            video.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            player.appendChild(video);
        } else {
            const audio = document.createElement('audio');
            audio.src = multimedia.fileUrl;
            audio.controls = true;
            audio.style.width = '100%';
            audio.style.borderRadius = '8px';
            audio.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            player.appendChild(audio);
        }
        
    } catch (error) {
        console.error('Error viewing multimedia:', error);
        showNotification('Error al cargar el proyecto multimedia', 'error');
    }
}

// Close multimedia viewer
function closeMultimediaViewer() {
    const modal = document.getElementById('multimediaViewerModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Clear player
    const player = document.getElementById('multimediaPlayer');
    player.innerHTML = '';
    
    currentMultimediaData = null;
}

// Download multimedia file
function downloadMultimediaFile(fileUrl, fileName) {
    try {
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.target = '_blank';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Descarga iniciada', 'success');
        
    } catch (error) {
        console.error('Error downloading file:', error);
        showNotification('Error al descargar el archivo', 'error');
    }
}

// Download multimedia from modal
function downloadMultimedia() {
    if (currentMultimediaData) {
        downloadMultimediaFile(currentMultimediaData.fileUrl, currentMultimediaData.fileName);
    }
}

// Format file size helper function
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
