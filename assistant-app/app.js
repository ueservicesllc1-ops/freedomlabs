// Get Firebase functions from window object (loaded from firebase-config-web.js)
// These will be available through window.firebaseConfig

let currentUser = null;
let sessionStartTime = null;
let selectedFiles = [];
let currentProjects = [];
let inactivityTimer = null;
let lastActivityTime = Date.now();
let isWindowMinimized = false;
let isSystemActive = true;
let productivityTracker = null; // Productivity tracking instance
const INACTIVITY_TIMEOUT = 20 * 60 * 1000; // 20 minutes in milliseconds

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Function to get location information
async function getLocationInfo() {
    try {
        console.log('Attempting to fetch location data...');

        // Try multiple APIs in order
        const apis = [
            'https://ipapi.co/json/',
            'https://api.ipify.org?format=json', // Fallback 1: Just IP
            'https://ipinfo.io/json' // Fallback 2: Another service
        ];

        for (const apiUrl of apis) {
            try {
                console.log(`Trying API: ${apiUrl}`);
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    console.warn(`API ${apiUrl} returned status ${response.status}`);
                    continue;
                }

                const data = await response.json();
                console.log('Location data received:', data);

                // Format data based on API response
                const locationData = {
                    ip: data.ip || data.query || 'Unknown',
                    city: data.city || 'Unknown',
                    region: data.region || data.regionName || 'Unknown',
                    country: data.country_name || data.country || 'Unknown',
                    countryCode: data.country_code || data.countryCode || 'Unknown',
                    latitude: data.latitude || data.lat || null,
                    longitude: data.longitude || data.lon || null,
                    timezone: data.timezone || 'Unknown',
                    org: data.org || data.isp || 'Unknown',
                    lastUpdated: new Date().toISOString()
                };

                console.log('Formatted location data:', locationData);
                return locationData;

            } catch (apiError) {
                console.warn(`Error with API ${apiUrl}:`, apiError.message);
                continue;
            }
        }

        // If all APIs failed
        throw new Error('All location APIs failed');

    } catch (error) {
        console.error('Error fetching location (all attempts failed):', error);
        // Return basic info if location fetch fails
        return {
            ip: 'Unknown',
            city: 'Unknown',
            region: 'Unknown',
            country: 'Unknown',
            countryCode: 'Unknown',
            latitude: null,
            longitude: null,
            timezone: 'Unknown',
            org: 'Unknown',
            lastUpdated: new Date().toISOString(),
            error: error.message
        };
    }
}


function initializeApp() {
    setupEventListeners();
    checkAuthState();
    setupTimeTracking();
}

function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Google Sign In button
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', handleGoogleSignIn);
    }


    // Notifications button
    const notificationsBtn = document.getElementById('notificationsBtn');
    const closeNotificationsModal = document.getElementById('closeNotificationsModal');
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', openNotificationsModal);
    }
    if (closeNotificationsModal) {
        closeNotificationsModal.addEventListener('click', closeNotificationsModalFunc);
    }

    // Version button
    const versionBtn = document.getElementById('versionBtn');
    if (versionBtn) {
        versionBtn.addEventListener('click', showVersionInfo);
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.currentTarget.dataset.view;
            switchView(view);
        });
    });

    // File upload
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#00d4ff';
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.3)';
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        handleFileSelect(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFileSelect(e.target.files);
    });

    document.getElementById('uploadBtn').addEventListener('click', handleUpload);
}

function switchView(view) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    document.getElementById(`${view}View`).classList.add('active');
    document.querySelector(`[data-view="${view}"]`).classList.add('active');

    // Load view data
    if (view === 'projects') {
        loadProjects();
        // Hide project details view if visible
        document.getElementById('projectDetailsView').classList.remove('active');
    } else if (view === 'files') {
        loadFiles();
    } else if (view === 'stats') {
        loadStats();
    } else if (view === 'upload') {
        loadProjectsForUpload();
    } else if (view === 'user') {
        loadUserDataView();
    } else if (view === 'chat') {
        // Chat functionality - por implementar
        console.log('Chat view selected - functionality not implemented yet');
    }
}


async function handleGoogleSignIn() {
    console.log('Google Sign In button clicked');
    const errorDiv = document.getElementById('authError');

    if (errorDiv) {
        errorDiv.classList.remove('show');
    }

    try {
        if (!window.firebaseConfig || !window.firebaseConfig.signInWithGoogle) {
            throw new Error('Firebase config not available');
        }

        console.log('Calling signInWithGoogle...');
        await window.firebaseConfig.signInWithGoogle();
        console.log('Google Sign In successful');

        // Auth state change will handle the rest (including location)

    } catch (error) {
        console.error('Google Sign In Error:', error);
        if (errorDiv) {
            errorDiv.textContent = 'Error al iniciar sesión con Google: ' + (error.message || 'Intenta nuevamente');
            errorDiv.classList.add('show');
        }
    }
}

async function handleLogin(e) {
    e.preventDefault();
    console.log('Login form submitted');
    const errorDiv = document.getElementById('authError');
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (errorDiv) {
        errorDiv.classList.remove('show');
    }

    try {
        console.log('Calling signIn...');
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Iniciando sesión...';
        }

        if (!window.firebaseConfig || !window.firebaseConfig.signIn) {
            throw new Error('Firebase config no disponible');
        }
        await window.firebaseConfig.signIn(email, password);
        console.log('Sign in successful');

        if (errorDiv) {
            errorDiv.classList.remove('show');
        }
    } catch (error) {
        console.error('Sign In Error:', error);
        console.error('Error details:', {
            code: error.code,
            message: error.message
        });

        // Always show error message
        let errorMessage = '';
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'Usuario no encontrado. Verifica tu email o usuario.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Contraseña incorrecta. Intenta nuevamente.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Email inválido. Verifica el formato de tu email.';
        } else if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Credenciales inválidas. Verifica tu email y contraseña.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Demasiados intentos fallidos. Intenta más tarde.';
        } else if (error.message) {
            errorMessage = 'Error al iniciar sesión: ' + error.message;
        } else {
            errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.';
        }

        // Show error in div
        if (errorDiv) {
            errorDiv.textContent = errorMessage;
            errorDiv.classList.add('show');
            errorDiv.style.display = 'block';
            errorDiv.style.opacity = '1';
            errorDiv.style.visibility = 'visible';
        }

        // Also show alert as fallback
        alert(errorMessage);

        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Iniciar Sesión';
        }
    }
}

async function handleLogout() {
    // Clear inactivity timer on logout
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }

    if (currentUser) {
        if (sessionStartTime && window.firebaseConfig && window.firebaseConfig.recordWorkSession) {
            await window.firebaseConfig.recordWorkSession(currentUser.uid, sessionStartTime, Date.now());
            sessionStartTime = null;
        }
        if (window.firebaseConfig && window.firebaseConfig.updateAssistantStatus) {
            await window.firebaseConfig.updateAssistantStatus(currentUser.uid, false);
        }
        if (window.firebaseConfig && window.firebaseConfig.logout) {
            await window.firebaseConfig.logout();
        }
    }
}

function checkAuthState() {
    if (!window.firebaseConfig || !window.firebaseConfig.onAuthChange) {
        console.warn('Firebase config not available yet, retrying...');
        setTimeout(() => {
            checkAuthState();
        }, 1000);
        return;
    }

    window.firebaseConfig.onAuthChange(async (user) => {
        if (user) {
            currentUser = user;

            // Get location information
            try {
                const locationData = await getLocationInfo();
                console.log('Location data:', locationData);

                // Update assistant status with location
                if (window.firebaseConfig && window.firebaseConfig.updateAssistantStatus) {
                    await window.firebaseConfig.updateAssistantStatus(user.uid, true, locationData);
                }
            } catch (error) {
                console.error('Error getting location:', error);
                // Still update status even if location fails
                if (window.firebaseConfig && window.firebaseConfig.updateAssistantStatus) {
                    await window.firebaseConfig.updateAssistantStatus(user.uid, true);
                }
            }

            sessionStartTime = Date.now();
            showDashboard();
            await loadUserData();

            // Load notifications after a delay to not block login
            setTimeout(async () => {
                try {
                    await loadNotifications();
                } catch (error) {
                    console.error('Error loading notifications on login:', error);
                    // Don't block login if notifications fail
                }
            }, 1000);

            // Reset inactivity timer on login
            resetInactivityTimer();

            // Start productivity tracking
            if (window.ProductivityTracker && window.firebaseConfig) {
                try {
                    productivityTracker = new window.ProductivityTracker(user.uid, window.firebaseConfig);
                    productivityTracker.start();
                    console.log('Productivity tracking started');
                } catch (error) {
                    console.error('Error starting productivity tracker:', error);
                }
            }
        } else {
            currentUser = null;
            showLogin();

            // Stop productivity tracking on logout
            if (productivityTracker) {
                productivityTracker.stop();
                productivityTracker = null;
                console.log('Productivity tracking stopped');
            }

            // Clear inactivity timer on logout
            if (inactivityTimer) {
                clearTimeout(inactivityTimer);
                inactivityTimer = null;
            }
        }
    });
}

function showLogin() {
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('dashboardScreen').classList.remove('active');
}

function showDashboard() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('dashboardScreen').classList.add('active');
    loadProjects();
}

async function loadUserData() {
    // Get user info from Firestore
    if (!window.firebaseConfig || !window.firebaseConfig.db) {
        console.warn('Firebase db not available');
        document.getElementById('userNameDisplay').textContent = currentUser.email || 'Usuario';
        return;
    }

    const db = window.firebaseConfig.db;
    const assistantsRef = db.collection('assistants');
    const q = assistantsRef.where('userId', '==', currentUser.uid);
    const querySnapshot = await q.get();

    if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        document.getElementById('userNameDisplay').textContent = userData.username || userData.name || userData.email;
    } else {
        document.getElementById('userNameDisplay').textContent = currentUser.email || 'Usuario';
    }
}

let currentSelectedProject = null;

async function loadProjects() {
    try {
        currentProjects = await window.firebaseConfig.getAssignedProjects(currentUser.uid);
        const projectsList = document.getElementById('projectsList');

        if (currentProjects.length === 0) {
            projectsList.innerHTML = '<p style="color: rgba(255,255,255,0.5);">No tienes proyectos asignados</p>';
            return;
        }

        projectsList.innerHTML = currentProjects.map(project => `
            <div class="project-card" data-project-id="${project.id}" style="cursor: pointer;">
                <h3>${project.name || 'Sin nombre'}</h3>
                <p style="color: rgba(255,255,255,0.7); margin: 10px 0;">${project.description || ''}</p>
                <div style="margin-top: 15px;">
                    <span style="font-size: 12px; color: rgba(255,255,255,0.5);">Estado: </span>
                    <span style="color: #4ade80;">${project.status || 'Activo'}</span>
                </div>
            </div>
        `).join('');

        // Add click listeners
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', () => {
                const projectId = card.dataset.projectId;
                const project = currentProjects.find(p => p.id === projectId);
                if (project) {
                    showProjectDetails(project);
                }
            });
        });
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

async function showProjectDetails(project) {
    currentSelectedProject = project;

    // Switch to project details view
    document.getElementById('projectsView').classList.remove('active');
    document.getElementById('projectDetailsView').classList.add('active');
    document.querySelector('[data-view="projects"]').classList.remove('active');

    document.getElementById('projectDetailsTitle').textContent = project.name || 'Sin nombre';

    // Get user role
    let userRole = null;
    try {
        const assistantsRef = window.firebaseConfig.db.collection('assistants');
        const q = assistantsRef.where('userId', '==', currentUser.uid);
        const querySnapshot = await q.get();
        if (!querySnapshot.empty) {
            userRole = querySnapshot.docs[0].data().role;
        }
    } catch (error) {
        console.error('Error getting user role:', error);
    }

    const isCommunityManager = userRole === 'community_manager';

    // Get project files (from admin) - only if NOT community_manager
    let adminFiles = [];
    if (!isCommunityManager) {
        try {
            adminFiles = await window.firebaseConfig.getProjectFiles(project.id);
            // Filter out completed files (only show admin files)
            adminFiles = adminFiles.filter(f => !f.isCompleted && !f.userId);
        } catch (error) {
            console.error('Error loading project files:', error);
        }
    }

    // Get completed files (uploaded by assistant)
    let completedFiles = [];
    try {
        // Query directly for this project and user to avoid index issues
        const filesRef = window.firebaseConfig.db.collection("projectFiles");
        const q = filesRef.where("projectId", "==", project.id)
            .where("userId", "==", currentUser.uid)
            .where("isCompleted", "==", true);
        const querySnapshot = await q.get();
        completedFiles = [];
        querySnapshot.forEach((doc) => {
            completedFiles.push({ id: doc.id, ...doc.data() });
        });
        // Sort by uploadedAt in memory (descending)
        completedFiles.sort((a, b) => {
            const aTime = a.uploadedAt?.toDate ? a.uploadedAt.toDate().getTime() : 0;
            const bTime = b.uploadedAt?.toDate ? b.uploadedAt.toDate().getTime() : 0;
            return bTime - aTime;
        });
    } catch (error) {
        console.error('Error loading completed files:', error);
        // Fallback: try without isCompleted filter
        try {
            const allFiles = await window.firebaseConfig.getAssistantFiles(currentUser.uid);
            completedFiles = allFiles.filter(f => f.projectId === project.id && f.isCompleted === true);
        } catch (fallbackError) {
            console.error('Fallback error loading completed files:', fallbackError);
        }
    }

    // Categorize admin files (only if not community_manager)
    const adminVideos = !isCommunityManager ? adminFiles.filter(f =>
        f.fileType === 'video' || f.fileName?.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i)
    ) : [];
    const adminImages = !isCommunityManager ? adminFiles.filter(f =>
        f.fileType === 'photo' || f.fileType === 'image' || f.fileName?.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i)
    ) : [];
    const adminDocuments = !isCommunityManager ? adminFiles.filter(f =>
        !adminVideos.includes(f) && !adminImages.includes(f)
    ) : [];

    const contentHtml = `
        <div style="margin-bottom: 30px;">
            <div class="assistant-info">
                <div class="info-row">
                    <span class="info-label">Nombre:</span>
                    <span class="info-value">${project.name || 'Sin nombre'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Descripción:</span>
                    <span class="info-value">${project.description || 'Sin descripción'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Estado:</span>
                    <span class="info-value">
                        <span style="color: #4ade80; font-weight: 600;">${project.status || 'Activo'}</span>
                    </span>
                </div>
            </div>
        </div>
        
        ${project.driveFolderUrl ? `
        <div style="margin-bottom: 30px; padding: 20px; background: rgba(59, 130, 246, 0.1); border-radius: 12px; border: 1px solid rgba(59, 130, 246, 0.3);">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <i class="fab fa-google-drive" style="font-size: 32px; color: #4285f4;"></i>
                    <div>
                        <h4 style="margin: 0; color: white; font-size: 16px; margin-bottom: 4px;">Carpeta Compartida de Google Drive</h4>
                        <p style="margin: 0; color: rgba(255,255,255,0.6); font-size: 12px;">Accede a los archivos del proyecto directamente desde Drive</p>
                    </div>
                </div>
                <button class="btn-primary open-drive-btn" style="padding: 10px 20px; display: inline-flex; align-items: center; gap: 8px; background: #4285f4; border: none; cursor: pointer;" data-drive-url="${project.driveFolderUrl.replace(/"/g, '&quot;')}">
                    <i class="fab fa-google-drive"></i> Abrir Carpeta de Drive
                </button>
            </div>
        </div>
        ` : ''}
        
        ${!isCommunityManager ? `
        <div style="margin-bottom: 40px;">
            <h3 style="margin-bottom: 20px; font-size: 18px; color: #f59e0b;">
                <i class="fas fa-folder-open"></i> Archivos del Proyecto (del Admin)
            </h3>
            
            ${adminFiles.length === 0
                ? '<p style="color: rgba(255,255,255,0.5); padding: 20px; text-align: center;">No hay archivos del proyecto aún</p>'
                : `
                    ${adminVideos.length > 0 ? `
                        <div style="margin-bottom: 25px;">
                            <h4 style="font-size: 14px; color: rgba(255,255,255,0.8); margin-bottom: 10px;">
                                <i class="fas fa-video"></i> Videos (${adminVideos.length})
                            </h4>
                            <div class="files-list">
                                ${adminVideos.map(f => createFileItem(f, false)).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${adminImages.length > 0 ? `
                        <div style="margin-bottom: 25px;">
                            <h4 style="font-size: 14px; color: rgba(255,255,255,0.8); margin-bottom: 10px;">
                                <i class="fas fa-image"></i> Imágenes (${adminImages.length})
                            </h4>
                            <div class="files-list">
                                ${adminImages.map(f => createFileItem(f, false)).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${adminDocuments.length > 0 ? `
                        <div style="margin-bottom: 25px;">
                            <h4 style="font-size: 14px; color: rgba(255,255,255,0.8); margin-bottom: 10px;">
                                <i class="fas fa-file"></i> Documentos (${adminDocuments.length})
                            </h4>
                            <div class="files-list">
                                ${adminDocuments.map(f => createFileItem(f, false)).join('')}
                            </div>
                        </div>
                    ` : ''}
                `}
        </div>
        ` : ''}
        
        <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="font-size: 18px; color: #10b981;">
                    <i class="fas fa-check-circle"></i> Productos Realizados (${completedFiles.length})
                </h3>
                <button class="btn-primary" onclick="openUploadCompletedDialog('${project.id}')" style="padding: 8px 16px; font-size: 13px;">
                    <i class="fas fa-upload"></i> Subir Producto Realizado
                </button>
            </div>
            
            ${completedFiles.length === 0
            ? '<p style="color: rgba(255,255,255,0.5); padding: 20px; text-align: center;">Aún no has subido productos realizados para este proyecto</p>'
            : `
                    <div class="files-list">
                        ${completedFiles.map(f => createFileItem(f, true)).join('')}
                    </div>
                `}
        </div>
    `;

    document.getElementById('projectDetailsContent').innerHTML = contentHtml;

    // Setup back button
    document.getElementById('backToProjectsBtn').onclick = () => {
        document.getElementById('projectDetailsView').classList.remove('active');
        document.getElementById('projectsView').classList.add('active');
        document.querySelector('[data-view="projects"]').classList.add('active');
    };

    // Setup Drive button(s) - use event delegation for dynamically added buttons
    const projectDetailsContent = document.getElementById('projectDetailsContent');
    if (projectDetailsContent) {
        // Remove any existing listeners first
        const existingButtons = projectDetailsContent.querySelectorAll('.open-drive-btn');
        existingButtons.forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });

        // Add new event listener using event delegation
        projectDetailsContent.addEventListener('click', (e) => {
            if (e.target.closest('.open-drive-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const btn = e.target.closest('.open-drive-btn');
                const url = btn.getAttribute('data-drive-url');
                console.log('Drive button clicked, URL:', url);

                if (url && url.trim()) {
                    try {
                        console.log('Drive button clicked');
                        console.log('Drive URL:', url);

                        // Use window.open directly (Electron will handle external URLs)

                        // Fallback to window.open
                        const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
                        if (newWindow) {
                            console.log('Opened via window.open');
                        } else {
                            console.error('window.open was blocked');
                            alert('Por favor, permite ventanas emergentes para abrir Google Drive.');
                        }
                    } catch (error) {
                        console.error('Error opening Drive folder:', error);
                        console.error('Error stack:', error.stack);
                        alert('Error al abrir la carpeta de Drive: ' + error.message);
                    }
                } else {
                    console.warn('No Drive URL found in data attribute');
                    alert('No hay URL de carpeta de Drive configurada para este proyecto.');
                }
            }
        });
    }
}

function createFileItem(file, isCompleted) {
    const uploadedAt = file.uploadedAt?.toDate ? formatDate(file.uploadedAt.toDate()) : 'N/A';
    const fileSize = file.size ? formatFileSize(file.size) : 'N/A';
    const badge = isCompleted ? '<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-left: 8px;">Completado</span>' : '';

    return `
        <div class="file-item-card" style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                <i class="fas fa-file" style="font-size: 24px; color: ${isCompleted ? '#10b981' : '#f59e0b'};"></i>
                <div>
                    <div style="font-weight: 600; color: white; margin-bottom: 4px;">
                        ${file.fileName || 'Sin nombre'} ${badge}
                    </div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.6);">
                        ${fileSize} • ${uploadedAt}
                    </div>
                </div>
            </div>
            <a href="${file.downloadURL}" target="_blank" class="btn-secondary" style="padding: 6px 12px; text-decoration: none;">
                <i class="fas fa-download"></i> Ver
            </a>
        </div>
    `;
}

function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(date) {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : date.toDate();
    return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

window.openDriveFolder = function (url) {
    if (url && url.trim()) {
        try {
            window.open(url, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error('Error opening Drive folder:', error);
            alert('Error al abrir la carpeta de Drive. Por favor, verifica que la URL sea correcta.');
        }
    } else {
        alert('No hay URL de carpeta de Drive configurada para este proyecto.');
    }
};

window.openUploadCompletedDialog = function (projectId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,video/*';

    input.onchange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        await uploadCompletedFiles(projectId, files);
    };

    input.click();
};

async function uploadCompletedFiles(projectId, files) {
    try {
        // Show loading
        const loadingMsg = document.createElement('div');
        loadingMsg.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.9); padding: 20px; border-radius: 10px; z-index: 10000; color: white;';
        loadingMsg.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo productos realizados...';
        document.body.appendChild(loadingMsg);

        // Upload to B2
        const uploadedFiles = await window.firebaseConfig.uploadFilesToB2(files, projectId, 'projects', currentUser.uid, true);

        // Save to Firestore as completed files
        if (uploadedFiles && uploadedFiles.length > 0) {
            for (const file of uploadedFiles) {
                const fileType = file.fileName?.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i) ? 'video' : 'photo';
                const fileData = {
                    projectId: projectId,
                    userId: currentUser.uid,
                    fileName: file.fileName || file.name || 'Sin nombre',
                    fileType: fileType,
                    storagePath: file.key,
                    downloadURL: file.url,
                    size: file.size || 0,
                    isCompleted: true, // Mark as completed product
                    uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                console.log('Saving completed file to Firestore:', fileData);
                const docRef = await window.firebaseConfig.db.collection("projectFiles").add(fileData);
                console.log('File saved with ID:', docRef.id);
            }
        } else {
            throw new Error('No se pudieron subir los archivos');
        }

        // Remove loading
        document.body.removeChild(loadingMsg);

        // Reload project details
        if (currentSelectedProject) {
            await showProjectDetails(currentSelectedProject);
        }

        // Show success
        alert('Productos realizados subidos exitosamente');

    } catch (error) {
        console.error('Error uploading completed files:', error);
        alert('Error al subir archivos: ' + error.message);
    }
}

async function loadProjectsForUpload() {
    try {
        currentProjects = await window.firebaseConfig.getAssignedProjects(currentUser.uid);
        const select = document.getElementById('uploadProjectSelect');

        select.innerHTML = '<option value="">Selecciona un proyecto</option>' +
            currentProjects.map(project =>
                `<option value="${project.id}">${project.name || 'Sin nombre'}</option>`
            ).join('');
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function handleFileSelect(files) {
    selectedFiles = Array.from(files);
    const uploadArea = document.getElementById('uploadArea');
    const uploadBtn = document.getElementById('uploadBtn');

    if (selectedFiles.length > 0) {
        uploadArea.innerHTML = `
            <i class="fas fa-file"></i>
            <p>${selectedFiles.length} archivo(s) seleccionado(s)</p>
            <p style="font-size: 12px; color: rgba(255,255,255,0.5);">${selectedFiles.map(f => f.name).join(', ')}</p>
        `;
        uploadBtn.disabled = false;
    }
}

async function handleUpload() {
    const projectId = document.getElementById('uploadProjectSelect').value;
    const fileType = document.getElementById('uploadFileType').value;

    if (!projectId) {
        alert('Por favor selecciona un proyecto');
        return;
    }

    if (selectedFiles.length === 0) {
        alert('Por favor selecciona archivos');
        return;
    }

    const progressDiv = document.getElementById('uploadProgress');
    progressDiv.innerHTML = '<div class="progress-bar"><div class="progress-fill" style="width: 0%"></div></div>';

    const progressBar = progressDiv.querySelector('.progress-fill');

    try {
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const progress = ((i + 1) / selectedFiles.length) * 100;

            await window.firebaseConfig.uploadFile(file, projectId, fileType, currentUser.uid);
            progressBar.style.width = `${progress}%`;
        }

        alert('Archivos subidos exitosamente');
        selectedFiles = [];
        document.getElementById('uploadArea').innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <p>Arrastra archivos aquí o haz clic para seleccionar</p>
        `;
        document.getElementById('uploadBtn').disabled = true;
        progressDiv.innerHTML = '';

        // Reload files
        if (document.getElementById('filesView').classList.contains('active')) {
            loadFiles();
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('Error al subir archivos: ' + error.message);
    }
}

async function loadFiles() {
    try {
        const allFiles = [];

        for (const project of currentProjects) {
            const files = await window.firebaseConfig.getProjectFiles(project.id);
            allFiles.push(...files.map(f => ({ ...f, projectName: project.name })));
        }

        const filesList = document.getElementById('filesList');

        if (allFiles.length === 0) {
            filesList.innerHTML = '<p style="color: rgba(255,255,255,0.5);">No has subido archivos aún</p>';
            return;
        }

        filesList.innerHTML = allFiles.map(file => `
            <div class="file-card">
                <h4>${file.fileName}</h4>
                <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 5px 0;">${file.projectName}</p>
                <p style="color: rgba(255,255,255,0.5); font-size: 11px;">Tipo: ${file.fileType}</p>
                <a href="${file.downloadURL}" target="_blank" style="color: #00d4ff; text-decoration: none; font-size: 12px;">Ver archivo</a>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading files:', error);
    }
}

async function loadStats() {
    try {
        const { db } = window.firebaseConfig || {};

        // Get assistant data
        const assistantsRef = db.collection('assistants');
        const q = assistantsRef.where('userId', '==', currentUser.uid);
        const querySnapshot = await q.get();

        if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();
            document.getElementById('totalHours').textContent = (data.totalHoursWorked || 0).toFixed(1);
        }

        document.getElementById('activeProjects').textContent = currentProjects.length;

        // Count files
        let totalFiles = 0;
        for (const project of currentProjects) {
            const files = await window.firebaseConfig.getProjectFiles(project.id);
            totalFiles += files.length;
        }
        document.getElementById('totalFiles').textContent = totalFiles;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Function to handle app close - set status to offline
async function handleAppClose() {
    if (currentUser) {
        try {
            console.log('App closing, updating status to offline for user:', currentUser.uid);

            // Update status to offline FIRST (most important)
            if (window.firebaseConfig && window.firebaseConfig.updateAssistantStatus) {
                try {
                    await window.firebaseConfig.updateAssistantStatus(currentUser.uid, false);
                    console.log('Status updated to offline successfully');
                } catch (statusError) {
                    console.error('Error updating status to offline:', statusError);
                    // Try one more time with a direct Firestore call
                    try {
                        const db = window.firebaseConfig.db;
                        const assistantsRef = db.collection("assistants");
                        const q = assistantsRef.where("userId", "==", currentUser.uid);
                        const querySnapshot = await q.get();
                        if (!querySnapshot.empty) {
                            const docRef = querySnapshot.docs[0];
                            await docRef.ref.update({
                                isOnline: false,
                                lastSeen: firebase.firestore.FieldValue.serverTimestamp()
                            });
                            console.log('Status updated via direct Firestore call');
                        }
                    } catch (directError) {
                        console.error('Direct Firestore update also failed:', directError);
                    }
                }
            }

            // Then record session (less critical, can fail)
            if (sessionStartTime && window.firebaseConfig && window.firebaseConfig.recordWorkSession) {
                try {
                    await window.firebaseConfig.recordWorkSession(currentUser.uid, sessionStartTime, Date.now());
                    sessionStartTime = null;
                    console.log('Work session recorded');
                } catch (sessionError) {
                    console.error('Error recording session on close:', sessionError);
                }
            }

            // Stop productivity tracking
            if (productivityTracker) {
                try {
                    productivityTracker.stop();
                    productivityTracker = null;
                    console.log('Productivity tracking stopped on app close');
                } catch (trackerError) {
                    console.error('Error stopping productivity tracker:', trackerError);
                }
            }
        } catch (error) {
            console.error('Error in handleAppClose:', error);
        }
    } else {
        console.log('No current user, skipping status update');
    }
}

function resetInactivityTimer() {
    lastActivityTime = Date.now();

    // Clear existing timer
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }

    // Don't set timer if window is minimized and system is active (user working in other app)
    if (isWindowMinimized && isSystemActive) {
        console.log('Window minimized but system active - not setting inactivity timer');
        return;
    }

    // Set new timer for 20 minutes
    inactivityTimer = setTimeout(async () => {
        // Double check: don't close if window is minimized and system is active
        if (isWindowMinimized && isSystemActive) {
            console.log('Inactivity timeout reached but window minimized and system active - resetting timer');
            resetInactivityTimer();
            return;
        }

        console.log('Inactivity timeout reached (20 minutes). Closing app...');

        if (currentUser) {
            try {
                // Record final session before closing
                if (sessionStartTime && window.firebaseConfig && window.firebaseConfig.recordWorkSession) {
                    await window.firebaseConfig.recordWorkSession(currentUser.uid, sessionStartTime, Date.now());
                    console.log('Final work session recorded before inactivity close');
                }

                // Update status to offline
                if (window.firebaseConfig && window.firebaseConfig.updateAssistantStatus) {
                    await window.firebaseConfig.updateAssistantStatus(currentUser.uid, false);
                    console.log('Status updated to offline due to inactivity');
                }
            } catch (error) {
                console.error('Error during inactivity close:', error);
            }
        }

        // Close the app
        alert('La aplicación se cerrará debido a inactividad. Por favor, inicia sesión nuevamente.');
        window.close();
    }, INACTIVITY_TIMEOUT);
}

function setupActivityMonitoring() {
    // Setup Electron power monitor to detect system activity
    // Note: Power monitor events are now handled in main process and sent via IPC
    try {
        if (window.electronAPI) {
            if (powerMonitor) {
                // Monitor system activity (when user is active in any app)
                powerMonitor.on('resume', () => {
                    isSystemActive = true;
                    console.log('System resumed - user is active');
                    resetInactivityTimer();
                });

                powerMonitor.on('suspend', () => {
                    isSystemActive = false;
                    console.log('System suspended - user inactive');
                });

                // Monitor lock/unlock
                powerMonitor.on('unlock-screen', () => {
                    isSystemActive = true;
                    console.log('Screen unlocked - user is active');
                    resetInactivityTimer();
                });

                powerMonitor.on('lock-screen', () => {
                    isSystemActive = false;
                    console.log('Screen locked - user inactive');
                });
            }
        }
    } catch (e) {
        console.log('Power monitor not available:', e);
    }

    // Monitor window minimize/restore
    // Note: Window events are now handled in main process and sent via IPC
    try {
        if (window.electronAPI) {
            // Window events are handled below via electronAPI listeners
        }
    } catch (e) {
        console.log('Window events not available, using fallback:', e);
        // Fallback: use visibility API
        document.addEventListener('visibilitychange', () => {
            isWindowMinimized = document.hidden;
            if (!document.hidden) {
                resetInactivityTimer();
            }
        });
    }

    // List of events that indicate user activity in THIS app
    const activityEvents = [
        'mousedown', 'mousemove', 'keypress', 'scroll',
        'touchstart', 'click', 'keydown', 'wheel'
    ];

    // Reset timer on any activity in this app
    activityEvents.forEach(event => {
        document.addEventListener(event, () => {
            resetInactivityTimer();
        }, { passive: true });
    });

    // Also monitor window focus
    window.addEventListener('focus', () => {
        isWindowMinimized = false;
        resetInactivityTimer();
    });

    window.addEventListener('blur', () => {
        // Don't set minimized on blur, only on actual minimize
        // User might be switching to another app but still active
    });

    // Start the timer
    resetInactivityTimer();

    console.log('Activity monitoring started. App will close after 20 minutes of inactivity (only when app is active and system is inactive).');
}

function setupTimeTracking() {
    let lastSessionRecordTime = null;

    // Setup activity monitoring for auto-close on inactivity
    setupActivityMonitoring();

    // Update status every 30 seconds
    setInterval(async () => {
        if (currentUser && window.firebaseConfig && window.firebaseConfig.updateAssistantStatus) {
            await window.firebaseConfig.updateAssistantStatus(currentUser.uid, true);
        }
    }, 30000);

    // Record work session every hour (3600000 ms) while user is online
    setInterval(async () => {
        if (currentUser && sessionStartTime && window.firebaseConfig && window.firebaseConfig.recordWorkSession) {
            try {
                const now = Date.now();
                const timeSinceLastRecord = lastSessionRecordTime ? (now - lastSessionRecordTime) : (now - sessionStartTime);

                // Only record if at least 1 minute has passed (to avoid too frequent updates)
                if (timeSinceLastRecord >= 60000) { // 1 minute minimum
                    const sessionEndTime = now;
                    await window.firebaseConfig.recordWorkSession(currentUser.uid, sessionStartTime, sessionEndTime);
                    console.log('Periodic work session recorded:', {
                        hours: ((sessionEndTime - sessionStartTime) / (1000 * 60 * 60)).toFixed(2)
                    });

                    // Reset session start time to now (for next interval)
                    sessionStartTime = now;
                    lastSessionRecordTime = now;
                }
            } catch (error) {
                console.error('Error recording periodic work session:', error);
            }
        }
    }, 3600000); // Every hour (3600000 ms)

    // Listen for Electron app close event via IPC
    let isClosing = false;
    try {
        if (window.electronAPI) {
            window.electronAPI.onAppWillClose(async () => {
                if (!isClosing) {
                    isClosing = true;
                    console.log('Received app-will-close event');
                    await handleAppClose();
                }
            });

            // Listen for window state changes
            window.electronAPI.onWindowMinimized(() => {
                isWindowMinimized = true;
                console.log('Window minimized - pausing inactivity timer');
                if (inactivityTimer) {
                    clearTimeout(inactivityTimer);
                }
            });

            window.electronAPI.onWindowRestored(() => {
                isWindowMinimized = false;
                console.log('Window restored - resuming inactivity timer');
                resetInactivityTimer();
            });

            window.electronAPI.onWindowShown(() => {
                isWindowMinimized = false;
                console.log('Window shown - resuming inactivity timer');
                resetInactivityTimer();
            });

            // Listen for system activity changes
            window.electronAPI.onSystemActive(() => {
                isSystemActive = true;
                console.log('System active - user is working');
                // Don't reset timer if window is minimized (user working in other app)
                if (!isWindowMinimized) {
                    resetInactivityTimer();
                }
            });

            window.electronAPI.onSystemInactive(() => {
                isSystemActive = false;
                console.log('System inactive - user away');
            });
        }
    } catch (e) {
        console.log('IPC not available (running in browser?)');
    }

    // Fallback: Record session and set offline on window close (browser/Electron)
    window.addEventListener('beforeunload', (e) => {
        if (!isClosing && currentUser) {
            isClosing = true;
            console.log('beforeunload event triggered');
            // Use synchronous approach for beforeunload
            if (window.firebaseConfig && window.firebaseConfig.updateAssistantStatus) {
                // Try to update status, but don't wait (beforeunload is unreliable for async)
                handleAppClose().catch(err => {
                    console.error('Error in beforeunload handler:', err);
                });
            }
        }
    });

    // Also handle pagehide (more reliable than beforeunload)
    window.addEventListener('pagehide', (e) => {
        if (!isClosing && currentUser) {
            isClosing = true;
            console.log('pagehide event triggered');
            if (window.firebaseConfig && window.firebaseConfig.updateAssistantStatus) {
                handleAppClose().catch(err => {
                    console.error('Error in pagehide handler:', err);
                });
            }
        }
    });

    // Also handle visibility change (when user switches tabs or minimizes)
    document.addEventListener('visibilitychange', async () => {
        if (document.hidden && currentUser && window.firebaseConfig && window.firebaseConfig.updateAssistantStatus) {
            // Optional: could set to offline when tab is hidden, but usually we keep online
            // Uncomment if you want offline when tab is hidden:
            // await window.firebaseConfig.updateAssistantStatus(currentUser.uid, false);
        }
    });
}

async function loadUserDataView() {
    try {
        const userDataContent = document.getElementById('userDataContent');
        userDataContent.innerHTML = '<div class="loading-message">Cargando datos...</div>';

        const { db } = window.firebaseConfig || {};
        if (!db) {
            userDataContent.innerHTML = '<p style="color: rgba(255,255,255,0.5);">Error: Firebase no disponible</p>';
            return;
        }

        // Get assistant data
        const assistantsRef = db.collection('assistants');
        const q = assistantsRef.where('userId', '==', currentUser.uid);
        const querySnapshot = await q.get();

        let assistantData = null;
        if (!querySnapshot.empty) {
            assistantData = querySnapshot.docs[0].data();
        }

        // Get work sessions for hours calculation
        let todayHours = 0, weekHours = 0, monthHours = 0, totalHours = 0;
        try {
            const sessionsRef = db.collection('workSessions');
            const sessionsQuery = sessionsRef.where('userId', '==', currentUser.uid);
            const sessionsSnapshot = await sessionsQuery.get();

            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
            weekStart.setHours(0, 0, 0, 0);
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

            sessionsSnapshot.forEach(doc => {
                const session = doc.data();
                const startTime = session.startTime?.toDate ? session.startTime.toDate() : new Date(session.startTime);
                const hours = session.hoursWorked || 0;

                totalHours += hours;

                if (startTime >= monthStart) {
                    monthHours += hours;
                }
                if (startTime >= weekStart) {
                    weekHours += hours;
                }
                if (startTime >= todayStart) {
                    todayHours += hours;
                }
            });
        } catch (error) {
            console.error('Error loading work sessions:', error);
        }

        // Get assigned projects count
        const projectsCount = currentProjects.length;

        // Get files count
        let filesCount = 0;
        try {
            for (const project of currentProjects) {
                const files = await window.firebaseConfig.getProjectFiles(project.id);
                filesCount += files.filter(f => f.userId === currentUser.uid).length;
            }
        } catch (error) {
            console.error('Error counting files:', error);
        }

        // Format last seen
        let lastSeenText = 'N/A';
        if (assistantData?.lastSeen) {
            const lastSeen = assistantData.lastSeen.toDate ? assistantData.lastSeen.toDate() : new Date(assistantData.lastSeen);
            lastSeenText = formatDate(lastSeen);
        }

        // Get role name
        const roleNames = {
            'designer': 'Diseñador',
            'videographer': 'Videógrafo',
            'developer': 'Desarrollador',
            'community_manager': 'Community Manager',
            'editor': 'Editor',
            'photographer': 'Fotógrafo'
        };
        const roleName = roleNames[assistantData?.role] || assistantData?.role || 'No asignado';

        // Build HTML
        userDataContent.innerHTML = `
            <div class="user-profile-card" style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 30px; margin-bottom: 30px;">
                <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px;">
                    <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 32px; color: white; font-weight: bold;">
                        ${(assistantData?.name || assistantData?.username || currentUser.email || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                        <h2 style="margin: 0 0 5px 0; color: white;">${assistantData?.name || assistantData?.username || currentUser.email || 'Usuario'}</h2>
                        <p style="margin: 0; color: rgba(255,255,255,0.7);">${currentUser.email}</p>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 25px;">
                    <div>
                        <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 0 0 5px 0;">ROL</p>
                        <p style="color: white; font-size: 16px; font-weight: 600; margin: 0;">${roleName}</p>
                    </div>
                    <div>
                        <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 0 0 5px 0;">ESTADO</p>
                        <p style="color: ${assistantData?.isOnline ? '#10b981' : '#ef4444'}; font-size: 16px; font-weight: 600; margin: 0;">
                            ${assistantData?.isOnline ? '● En línea' : '● Desconectado'}
                        </p>
                    </div>
                    <div>
                        <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 0 0 5px 0;">ÚLTIMA ACTIVIDAD</p>
                        <p style="color: white; font-size: 16px; font-weight: 600; margin: 0;">${lastSeenText}</p>
                    </div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div class="stat-card" style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px;">
                    <h3 style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0 0 10px 0;">Horas Hoy</h3>
                    <p style="color: white; font-size: 32px; font-weight: bold; margin: 0;">${todayHours.toFixed(2)}</p>
                </div>
                <div class="stat-card" style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px;">
                    <h3 style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0 0 10px 0;">Horas Esta Semana</h3>
                    <p style="color: white; font-size: 32px; font-weight: bold; margin: 0;">${weekHours.toFixed(2)}</p>
                </div>
                <div class="stat-card" style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px;">
                    <h3 style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0 0 10px 0;">Horas Este Mes</h3>
                    <p style="color: white; font-size: 32px; font-weight: bold; margin: 0;">${monthHours.toFixed(2)}</p>
                </div>
                <div class="stat-card" style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px;">
                    <h3 style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0 0 10px 0;">Horas Totales</h3>
                    <p style="color: white; font-size: 32px; font-weight: bold; margin: 0;">${totalHours.toFixed(2)}</p>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                <div class="stat-card" style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px;">
                    <h3 style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0 0 10px 0;">Proyectos Asignados</h3>
                    <p style="color: white; font-size: 32px; font-weight: bold; margin: 0;">${projectsCount}</p>
                </div>
                <div class="stat-card" style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px;">
                    <h3 style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0 0 10px 0;">Archivos Subidos</h3>
                    <p style="color: white; font-size: 32px; font-weight: bold; margin: 0;">${filesCount}</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading user data:', error);
        document.getElementById('userDataContent').innerHTML =
            '<p style="color: rgba(255,255,255,0.5);">Error al cargar los datos del usuario</p>';
    }
}

async function showVersionInfo() {
    try {
        let version = '1.0.0';
        let buildNumber = 'N/A';

        // Try to get from Electron IPC
        if (typeof require !== 'undefined') {
            try {
                const { ipcRenderer } = require('electron');
                if (ipcRenderer) {
                    const versionInfo = await ipcRenderer.invoke('get-app-version');
                    version = versionInfo.version || '1.0.0';
                    buildNumber = versionInfo.buildNumber || 'N/A';
                    showVersionDialog(version, buildNumber);
                    return;
                }
            } catch (e) {
                console.log('Could not get version from IPC:', e);
            }
        }

        // Fallback: try to fetch package.json
        try {
            const response = await fetch('./package.json');
            if (response.ok) {
                const data = await response.json();
                version = data.version || '1.0.0';
                buildNumber = data.buildNumber || 'N/A';
            }
        } catch (e) {
            console.log('Could not fetch package.json:', e);
        }

        showVersionDialog(version, buildNumber);
    } catch (error) {
        console.error('Error showing version info:', error);
        showVersionDialog('1.0.0', 'N/A');
    }
}

async function showVersionDialog(version, buildNumber) {
    const message = `Freedom Labs\n\nVersión: ${version}\nBuild: ${buildNumber}`;
    alert(message);
}

// Notifications functions
let notifications = [];
let unreadCount = 0;

async function loadNotifications() {
    if (!currentUser || !window.firebaseConfig || !window.firebaseConfig.getNotifications) {
        return;
    }

    try {
        notifications = await window.firebaseConfig.getNotifications(currentUser.uid);

        // Count unread notifications
        unreadCount = notifications.filter(n => {
            const readBy = n.readBy || [];
            return !readBy.includes(currentUser.uid);
        }).length;

        // Update badge
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }

        console.log('Notifications loaded:', notifications.length, 'Unread:', unreadCount);
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

function openNotificationsModal() {
    const modal = document.getElementById('notificationsModal');
    if (modal) {
        modal.style.display = 'flex';
        // Load notifications if not already loaded
        if (notifications.length === 0) {
            loadNotifications().then(() => {
                renderNotifications();
            });
        } else {
            renderNotifications();
        }
    }
}

function closeNotificationsModalFunc() {
    const modal = document.getElementById('notificationsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function renderNotifications() {
    const list = document.getElementById('notificationsList');
    if (!list) return;

    if (notifications.length === 0) {
        list.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 40px;">No hay notificaciones</p>';
        return;
    }

    list.innerHTML = notifications.map(notif => {
        const readBy = notif.readBy || [];
        const isRead = readBy.includes(currentUser.uid);
        const isUpdate = notif.type === 'update';
        const createdAt = notif.createdAt?.toDate ? formatDate(notif.createdAt.toDate()) : 'N/A';

        // Truncate message for preview (first 100 characters)
        const messagePreview = notif.message ? (notif.message.length > 100 ? notif.message.substring(0, 100) + '...' : notif.message) : '';

        return `
            <div class="notification-item ${isRead ? '' : 'unread'} ${isUpdate ? 'update' : ''}" data-id="${notif.id}">
                <div class="notification-item-title">${notif.title || 'Notificación'}</div>
                <div class="notification-item-message">${messagePreview}</div>
                <div class="notification-item-footer">
                    <span>${createdAt}</span>
                    ${!isRead ? '<span style="color: #f59e0b;">● No leída</span>' : ''}
                </div>
            </div>
        `;
    }).join('');

    // Add click listeners
    document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // Don't trigger if clicking on a link inside
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                return;
            }
            const notifId = item.dataset.id;
            showNotificationDetails(notifId);
        });
    });
}

async function showNotificationDetails(notifId) {
    const notification = notifications.find(n => n.id === notifId);
    if (!notification) return;

    // Mark as read first
    await handleMarkNotificationAsRead(notifId);

    // Show details modal
    const modal = document.getElementById('notificationDetailsModal');
    const titleEl = document.getElementById('notificationDetailsTitle');
    const contentEl = document.getElementById('notificationDetailsContent');

    if (!modal || !titleEl || !contentEl) return;

    const isUpdate = notification.type === 'update';
    const createdAt = notification.createdAt?.toDate ? formatDate(notification.createdAt.toDate()) : 'N/A';
    const readBy = notification.readBy || [];
    const isRead = readBy.includes(currentUser.uid);

    titleEl.textContent = notification.title || 'Notificación';

    let detailsHTML = `
        <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <span style="color: rgba(255,255,255,0.5); font-size: 12px;">Fecha: ${createdAt}</span>
                ${isRead ? '<span style="color: #10b981; font-size: 12px;">✓ Leída</span>' : '<span style="color: #f59e0b; font-size: 12px;">● No leída</span>'}
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="margin-bottom: 10px; color: white;">Mensaje:</h3>
                <p style="color: rgba(255,255,255,0.8); line-height: 1.6; white-space: pre-wrap;">${notification.message || 'Sin mensaje'}</p>
            </div>
    `;

    if (isUpdate && notification.downloadLink) {
        detailsHTML += `
            <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                <strong style="color: #f59e0b;">⚠️ IMPORTANTE:</strong>
                <p style="color: rgba(255,255,255,0.8); margin-top: 10px; line-height: 1.6;">
                    Antes de instalar la nueva versión, debes cerrar completamente esta aplicación.
                </p>
            </div>
            <div style="text-align: center;">
                <a href="${notification.downloadLink}" target="_blank" class="notification-download-link" style="display: inline-flex; align-items: center; gap: 10px; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    <i class="fas fa-download"></i> Descargar versión ${notification.version || 'nueva'}
                </a>
            </div>
        `;
    }

    detailsHTML += '</div>';

    contentEl.innerHTML = detailsHTML;
    modal.style.display = 'flex';

    // Ensure close button has event listener (re-attach after innerHTML update)
    const closeBtn = document.getElementById('closeNotificationDetailsModal');
    if (closeBtn) {
        // Remove existing listeners and add new one
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeNotificationDetailsModalFunc(e);
        });
    }

    // Also close when clicking outside the modal
    const existingClickHandler = modal._clickHandler;
    if (existingClickHandler) {
        modal.removeEventListener('click', existingClickHandler);
    }
    const clickHandler = (e) => {
        if (e.target === modal) {
            closeNotificationDetailsModalFunc(e);
        }
    };
    modal.addEventListener('click', clickHandler);
    modal._clickHandler = clickHandler;
}

function closeNotificationDetailsModalFunc(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const modal = document.getElementById('notificationDetailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Make function available globally for onclick
window.closeNotificationDetailsModalFunc = closeNotificationDetailsModalFunc;

async function handleMarkNotificationAsRead(notifId) {
    if (!currentUser || !window.firebaseConfig || !window.firebaseConfig.markNotificationAsRead) {
        return;
    }

    try {
        await window.firebaseConfig.markNotificationAsRead(notifId, currentUser.uid);
        // Reload notifications to update badge and list
        await loadNotifications();
        renderNotifications();
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

// Make markNotificationAsRead available globally for onclick
window.markNotificationAsRead = handleMarkNotificationAsRead;

