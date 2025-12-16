// Get Firebase functions from window object (loaded from firebase-config-web.js)
// These will be available through window.firebaseConfig

let currentUser = null;
let assistantsUnsubscribe = null;
let refreshInterval = null;
let currentEditingAssistant = null;
let productivityDashboard = null; // Productivity Dashboard instance


// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    checkAuthState();
    setupRefreshInterval();
    // Initialize Firebase connection for assistants data (no auth needed)
    if (window.firebaseConfig && window.firebaseConfig.watchAssistants) {
        // Firebase is ready, but we don't need auth
    }
}

function setupEventListeners() {
    // PIN input
    const pinInput = document.getElementById('pinInput');
    const pinSubmitBtn = document.getElementById('pinSubmitBtn');

    console.log('Setting up event listeners');
    console.log('pinInput:', pinInput);
    console.log('pinSubmitBtn:', pinSubmitBtn);

    if (pinInput && pinSubmitBtn) {
        pinSubmitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('PIN button clicked');
            handlePINSubmit();
        });
        pinInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                console.log('Enter key pressed');
                e.preventDefault();
                handlePINSubmit();
            }
        });
        console.log('Event listeners added successfully');
    } else {
        console.error('PIN elements not found!', { pinInput, pinSubmitBtn });
    }

    // Create user form
    const createUserForm = document.getElementById('createUserForm');
    if (createUserForm) {
        createUserForm.addEventListener('submit', handleCreateUser);
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

    // Create project button
    const createProjectBtn = document.getElementById('createProjectBtn');
    if (createProjectBtn) {
        createProjectBtn.addEventListener('click', () => {
            openCreateProjectModal();
        });
    }

    // Create project form
    const createProjectForm = document.getElementById('createProjectForm');
    if (createProjectForm) {
        createProjectForm.addEventListener('submit', handleCreateProject);
    }

    // Close create project modal
    const closeProjectModal = document.querySelector('.close-project-modal');
    const createProjectModal = document.getElementById('createProjectModal');
    if (closeProjectModal) {
        closeProjectModal.addEventListener('click', closeCreateProjectModal);
    }
    if (createProjectModal) {
        createProjectModal.addEventListener('click', (e) => {
            if (e.target.id === 'createProjectModal') {
                closeCreateProjectModal();
            }
        });
    }

    // Edit project assignments modal
    const editProjectAssignmentsForm = document.getElementById('editProjectAssignmentsForm');
    const closeEditAssignments = document.querySelector('.close-edit-assignments');
    const editAssignmentsModal = document.getElementById('editProjectAssignmentsModal');

    if (editProjectAssignmentsForm) {
        editProjectAssignmentsForm.addEventListener('submit', handleEditProjectAssignments);
    }
    if (closeEditAssignments) {
        closeEditAssignments.addEventListener('click', closeEditAssignmentsModal);
    }
    if (editAssignmentsModal) {
        editAssignmentsModal.addEventListener('click', (e) => {
            if (e.target.id === 'editProjectAssignmentsModal') {
                closeEditAssignmentsModal();
            }
        });
    }

    // Edit drive folder modal
    const editDriveFolderForm = document.getElementById('editDriveFolderForm');
    const closeEditDriveFolder = document.querySelector('.close-edit-drive-folder');
    const editDriveFolderModal = document.getElementById('editDriveFolderModal');

    if (editDriveFolderForm) {
        editDriveFolderForm.addEventListener('submit', handleEditDriveFolder);
    }
    if (closeEditDriveFolder) {
        closeEditDriveFolder.addEventListener('click', closeEditDriveFolderModal);
    }
    if (editDriveFolderModal) {
        editDriveFolderModal.addEventListener('click', (e) => {
            if (e.target.id === 'editDriveFolderModal') {
                closeEditDriveFolderModal();
            }
        });
    }

    // Project files input
    const projectFilesInput = document.getElementById('projectFilesInput');
    const projectFilesDropZone = document.getElementById('projectFilesDropZone');
    if (projectFilesInput && projectFilesDropZone) {
        projectFilesInput.addEventListener('change', handleProjectFilesSelect);

        // Drag and drop
        projectFilesDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            projectFilesDropZone.style.borderColor = '#f59e0b';
        });
        projectFilesDropZone.addEventListener('dragleave', () => {
            projectFilesDropZone.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        });
        projectFilesDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            projectFilesDropZone.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            if (e.dataTransfer.files.length > 0) {
                projectFilesInput.files = e.dataTransfer.files;
                handleProjectFilesSelect({ target: projectFilesInput });
            }
        });
    }

    // Refresh interval setting
    const refreshIntervalSelect = document.getElementById('refreshInterval');
    if (refreshIntervalSelect) {
        refreshIntervalSelect.addEventListener('change', (e) => {
            setupRefreshInterval(parseInt(e.target.value));
        });
    }

    // Modal close
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            document.getElementById('assistantModal').classList.remove('active');
        });
    }

    // Close modal on outside click
    const assistantModal = document.getElementById('assistantModal');
    if (assistantModal) {
        assistantModal.addEventListener('click', (e) => {
            if (e.target.id === 'assistantModal') {
                document.getElementById('assistantModal').classList.remove('active');
            }
        });
    }

    // Edit assistant modal
    const editAssistantModal = document.getElementById('editAssistantModal');
    const closeEditModal = document.querySelector('.close-edit-modal');
    const editAssistantForm = document.getElementById('editAssistantForm');
    const deleteAssistantBtn = document.getElementById('deleteAssistantBtn');

    if (closeEditModal) {
        closeEditModal.addEventListener('click', () => {
            editAssistantModal.classList.remove('active');
        });
    }

    if (editAssistantModal) {
        editAssistantModal.addEventListener('click', (e) => {
            if (e.target.id === 'editAssistantModal') {
                editAssistantModal.classList.remove('active');
            }
        });
    }

    if (editAssistantForm) {
        editAssistantForm.addEventListener('submit', handleEditAssistant);
    }

    if (deleteAssistantBtn) {
        deleteAssistantBtn.addEventListener('click', handleDeleteAssistant);
    }
}

function switchView(view) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    const viewElement = document.getElementById(`${view}View`);
    if (viewElement) {
        viewElement.classList.add('active');
    }

    const navItem = document.querySelector(`[data-view="${view}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }

    // Load view data
    if (view === 'assistants') {
        // Already watching, no need to reload
    } else if (view === 'projects') {
        loadProjects();
    } else if (view === 'analytics') {
        loadAnalytics();
    } else if (view === 'notifications') {
        loadNotifications();
    } else if (view === 'create-user') {
        // Clear form
        const form = document.getElementById('createUserForm');
        if (form) {
            form.reset();
        }
        const errorDiv = document.getElementById('createUserError');
        const successDiv = document.getElementById('createUserSuccess');
        if (errorDiv) errorDiv.classList.remove('show');
        if (successDiv) successDiv.classList.remove('show');
    }
}

let selectedProjectFiles = [];

async function openCreateProjectModal() {
    const modal = document.getElementById('createProjectModal');
    if (!modal) return;

    // Load assistants for assignment
    try {
        const assistants = await window.firebaseConfig.getAllAssistants();
        const assistantsList = document.getElementById('assistantsCheckboxList');

        if (assistants.length === 0) {
            assistantsList.innerHTML = '<p style="color: rgba(255,255,255,0.5);">No hay asistentes disponibles</p>';
        } else {
            assistantsList.innerHTML = assistants.map(assistant => `
                <label style="display: flex; align-items: center; gap: 10px; padding: 8px; cursor: pointer; border-radius: 6px; margin-bottom: 5px; transition: background 0.2s;" 
                       onmouseover="this.style.background='rgba(255,255,255,0.05)'" 
                       onmouseout="this.style.background='transparent'">
                    <input type="checkbox" value="${assistant.userId}" name="assignedAssistants" style="cursor: pointer;">
                    <span style="color: white;">${assistant.name || assistant.username || assistant.email}</span>
                    <span style="font-size: 11px; color: rgba(255,255,255,0.5);">(${assistant.role || 'Sin rol'})</span>
                </label>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading assistants:', error);
        document.getElementById('assistantsCheckboxList').innerHTML = '<p style="color: #ef4444;">Error al cargar asistentes</p>';
    }

    // Reset form
    document.getElementById('createProjectForm').reset();
    selectedProjectFiles = [];
    document.getElementById('projectFilesPreview').innerHTML = '';
    document.getElementById('createProjectError').classList.remove('show');
    document.getElementById('createProjectSuccess').classList.remove('show');

    modal.classList.add('active');
}

function closeCreateProjectModal() {
    const modal = document.getElementById('createProjectModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function handleProjectFilesSelect(e) {
    const files = Array.from(e.target.files);
    selectedProjectFiles = files;

    const preview = document.getElementById('projectFilesPreview');
    if (files.length === 0) {
        preview.innerHTML = '';
        return;
    }

    preview.innerHTML = '<h4 style="margin-bottom: 10px; font-size: 14px;">Archivos seleccionados:</h4>' +
        files.map((file, index) => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 6px; margin-bottom: 5px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-file" style="color: #f59e0b;"></i>
                    <span style="color: white; font-size: 13px;">${file.name}</span>
                    <span style="color: rgba(255,255,255,0.5); font-size: 11px;">(${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <button type="button" onclick="removeProjectFile(${index})" style="background: #ef4444; border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
}

window.removeProjectFile = function (index) {
    selectedProjectFiles.splice(index, 1);
    const dt = new DataTransfer();
    selectedProjectFiles.forEach(file => dt.items.add(file));
    document.getElementById('projectFilesInput').files = dt.files;
    handleProjectFilesSelect({ target: document.getElementById('projectFilesInput') });
};

async function handleCreateProject(e) {
    e.preventDefault();

    const errorDiv = document.getElementById('createProjectError');
    const successDiv = document.getElementById('createProjectSuccess');
    const form = e.target;

    const name = document.getElementById('projectName').value.trim();
    const description = document.getElementById('projectDescription').value.trim();
    const driveFolderUrl = document.getElementById('projectDriveFolder').value.trim();

    // Get selected assistants
    const assignedCheckboxes = form.querySelectorAll('input[name="assignedAssistants"]:checked');
    const assignedAssistants = Array.from(assignedCheckboxes).map(cb => cb.value);

    if (!name) {
        errorDiv.textContent = 'Por favor ingresa un nombre para el proyecto';
        errorDiv.classList.add('show');
        return;
    }

    errorDiv.classList.remove('show');
    successDiv.classList.remove('show');

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando proyecto...';

        let uploadedFiles = [];

        // Upload files to B2 if any
        if (selectedProjectFiles.length > 0) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo archivos...';

            // Create a temporary project ID for file uploads
            const tempProjectId = `temp-${Date.now()}`;

            try {
                uploadedFiles = await window.firebaseConfig.uploadFilesToB2(selectedProjectFiles, tempProjectId);
                console.log('Files uploaded to B2:', uploadedFiles);
            } catch (uploadError) {
                console.error('Error uploading files:', uploadError);
                // Continue with project creation even if file upload fails
                errorDiv.textContent = `Proyecto creado pero algunos archivos no se pudieron subir: ${uploadError.message}`;
                errorDiv.classList.add('show');
            }
        }

        // Create project in Firestore
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando proyecto...';
        const result = await window.firebaseConfig.createProject(name, description, assignedAssistants, uploadedFiles, driveFolderUrl);

        successDiv.textContent = 'Proyecto creado exitosamente';
        successDiv.classList.add('show');

        // Reset form
        form.reset();
        selectedProjectFiles = [];
        document.getElementById('projectFilesPreview').innerHTML = '';

        // Reload projects list
        await loadProjects();

        // Close modal after 2 seconds
        setTimeout(() => {
            closeCreateProjectModal();
            successDiv.classList.remove('show');
        }, 2000);

    } catch (error) {
        console.error('Error creating project:', error);
        errorDiv.textContent = 'Error al crear proyecto: ' + (error.message || 'Intenta nuevamente');
        errorDiv.classList.add('show');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

function handlePINSubmit() {
    console.log('handlePINSubmit called');
    const errorDiv = document.getElementById('pinError');
    const pinInput = document.getElementById('pinInput');

    if (!pinInput) {
        console.error('PIN input not found!');
        return;
    }

    const pin = pinInput.value.trim();
    console.log('PIN entered:', pin);

    if (errorDiv) {
        errorDiv.classList.remove('show');
    }

    // Check PIN
    if (pin === '1619') {
        console.log('PIN correct, accessing admin panel');
        showDashboard();
        if (errorDiv) {
            errorDiv.classList.remove('show');
        }
        // Start watching assistants after a short delay to ensure Firebase is loaded
        setTimeout(() => {
            startWatchingAssistants();
        }, 500);
    } else {
        console.log('PIN incorrect:', pin);
        if (errorDiv) {
            errorDiv.textContent = 'PIN incorrecto. Intenta nuevamente.';
            errorDiv.classList.add('show');
        }
        if (pinInput) {
            pinInput.value = '';
            pinInput.focus();
        }
    }
}

async function handleCreateUser(e) {
    e.preventDefault();
    console.log('Create user form submitted');

    const errorDiv = document.getElementById('createUserError');
    const successDiv = document.getElementById('createUserSuccess');
    const form = e.target;

    const name = document.getElementById('createUserName').value.trim();
    const email = document.getElementById('createUserEmail').value.trim();
    const username = document.getElementById('createUserUsername').value.trim();
    const password = document.getElementById('createUserPassword').value;
    const role = document.getElementById('createUserRole').value;

    if (errorDiv) {
        errorDiv.classList.remove('show');
    }
    if (successDiv) {
        successDiv.classList.remove('show');
    }

    // Validate
    if (!name || !email || !username || !password || !role) {
        if (errorDiv) {
            errorDiv.textContent = 'Por favor completa todos los campos';
            errorDiv.classList.add('show');
        }
        return;
    }

    if (password.length < 6) {
        if (errorDiv) {
            errorDiv.textContent = 'La contraseña debe tener al menos 6 caracteres';
            errorDiv.classList.add('show');
        }
        return;
    }

    try {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creando usuario...';
        }

        if (!window.firebaseConfig || !window.firebaseConfig.createAssistant) {
            throw new Error('Firebase config no disponible');
        }

        const result = await window.firebaseConfig.createAssistant(name, email, username, password, role);
        console.log('User created successfully:', result);

        if (successDiv) {
            successDiv.textContent = 'Usuario creado exitosamente';
            successDiv.classList.add('show');
        }

        // Reset form
        form.reset();

        // Reload assistants list
        if (assistantsUnsubscribe) {
            assistantsUnsubscribe();
        }
        startWatchingAssistants();

        // Switch to assistants view after 2 seconds
        setTimeout(() => {
            switchView('assistants');
            if (successDiv) {
                successDiv.classList.remove('show');
            }
        }, 2000);

    } catch (error) {
        console.error('Create User Error:', error);

        if (errorDiv) {
            let errorMessage = 'Error al crear usuario. ';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage += 'El email ya está en uso.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage += 'Email inválido.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage += 'La contraseña es muy débil.';
            } else {
                errorMessage += error.message || 'Intenta nuevamente.';
            }
            errorDiv.textContent = errorMessage;
            errorDiv.classList.add('show');
        }
    } finally {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Crear Usuario';
        }
    }
}

async function handleLogout() {
    if (assistantsUnsubscribe) {
        assistantsUnsubscribe();
        assistantsUnsubscribe = null;
    }
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
    showPINScreen();
    const pinInput = document.getElementById('pinInput');
    if (pinInput) {
        pinInput.value = '';
    }
}

function checkAuthState() {
    // No need for Firebase auth check, just show PIN screen
    showPINScreen();
}

function showPINScreen() {
    document.getElementById('pinScreen').classList.add('active');
    document.getElementById('dashboardScreen').classList.remove('active');
    const pinInput = document.getElementById('pinInput');
    if (pinInput) {
        pinInput.focus();
    }
}

function showDashboard() {
    document.getElementById('pinScreen').classList.remove('active');
    document.getElementById('dashboardScreen').classList.add('active');
    document.getElementById('userNameDisplay').textContent = 'Administrador';

    // Initialize Productivity Dashboard
    if (window.ProductivityDashboard && window.firebaseConfig) {
        productivityDashboard = new window.ProductivityDashboard(window.firebaseConfig);
        console.log('Productivity Dashboard initialized');
    }
}

function startWatchingAssistants() {
    console.log('startWatchingAssistants called');

    // Usar directamente el SDK global de Firebase (compat) cargado en index.html
    if (typeof firebase === 'undefined' || !firebase.firestore) {
        console.warn('Firebase SDK not loaded yet, retrying in 1 second...');
        setTimeout(() => {
            startWatchingAssistants();
        }, 1000);
        return;
    }

    const db = firebase.firestore();

    if (assistantsUnsubscribe) {
        assistantsUnsubscribe();
    }

    try {
        const assistantsRef = db.collection('assistants');
        assistantsUnsubscribe = assistantsRef.onSnapshot(
            (querySnapshot) => {
                const assistants = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    console.log('Firestore assistant doc:', {
                        id: doc.id,
                        name: data.name || data.username,
                        email: data.email,
                        isOnline: data.isOnline,
                        userId: data.userId,
                        isOnlineType: typeof data.isOnline,
                        hasLocation: !!data.location,
                        location: data.location
                    });
                    assistants.push({ id: doc.id, ...data });
                });

                console.log('Assistants updated (from SDK):', assistants.length);
                displayAssistants(assistants);
                updateStats(assistants);
            },
            (error) => {
                console.error('Error in assistants onSnapshot:', error);
            }
        );

        console.log('Watching assistants started successfully (using SDK)');
    } catch (error) {
        console.error('Error starting to watch assistants (SDK):', error);
    }
}

function displayAssistants(assistants) {
    const assistantsList = document.getElementById('assistantsList');

    if (assistants.length === 0) {
        assistantsList.innerHTML = '<p style="color: rgba(255,255,255,0.5);">No hay ayudantes registrados</p>';
        return;
    }

    assistantsList.innerHTML = assistants.map(assistant => {
        // Read online status from Firestore.
        // Prefer "isOnline" but also support legacy/alternative "online" field.
        const rawStatus = assistant.isOnline !== undefined ? assistant.isOnline : assistant.online;
        // Check both boolean true, string "true" and numeric 1
        const isOnline = rawStatus === true || rawStatus === 'true' || rawStatus === 1;
        console.log('Assistant status check:', {
            name: assistant.name || assistant.username,
            isOnline: assistant.isOnline,
            online: assistant.online,
            usedStatus: rawStatus,
            isOnlineType: typeof rawStatus,
            result: isOnline
        });
        const lastSeen = assistant.lastSeen ? formatDate(assistant.lastSeen.toDate()) : 'Nunca';
        const hoursWorked = (assistant.totalHoursWorked || 0).toFixed(1);
        const roleNames = {
            'designer': 'Diseñador Gráfico',
            'community_manager': 'Community Manager',
            'digitizer': 'Digitador',
            'videografo': 'Videógrafo',
            'desarrollador': 'Desarrollador'
        };

        return `
            <div class="assistant-row" data-assistant-id="${assistant.userId}" data-doc-id="${assistant.id}">
                <div class="assistants-col-name">
                    <div class="assistant-name">${assistant.name || assistant.username || assistant.email}</div>
                    <div class="assistant-role">${roleNames[assistant.role] || assistant.role || 'Sin rol'}</div>
                </div>
                <div class="assistants-col-email">${assistant.email}</div>
                <div class="assistants-col-username">${assistant.username || 'N/A'}</div>
                <div class="assistants-col-hours">${hoursWorked}h</div>
                <div class="assistants-col-lastseen">${lastSeen}</div>
                <div class="assistants-col-status">
                    <div class="status-badge ${isOnline ? 'online' : 'offline'}">
                        <i class="fas fa-circle"></i>
                        ${isOnline ? 'On' : 'Off'}
                    </div>
                </div>
                <div class="assistants-col-details">
                    <button class="btn-details" data-details-id="${assistant.id}" style="padding: 6px 10px; background: #10b981; border: none; border-radius: 6px; color: white; cursor: pointer; font-size: 12px;">
                        <i class="fas fa-info-circle"></i> Detalles
                    </button>
                </div>
                <div class="assistants-col-actions">
                    <button class="btn-edit" data-edit-id="${assistant.id}" style="padding: 6px 10px; background: #3b82f6; border: none; border-radius: 6px; color: white; cursor: pointer; font-size: 12px;">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Add click listeners to rows
    document.querySelectorAll('.assistant-row').forEach(card => {
        card.addEventListener('click', () => {
            const assistantId = card.dataset.assistantId;
            showAssistantDetails(assistants.find(a => a.userId === assistantId));
        });
    });

    // Add click listeners to "Detalles" buttons
    document.querySelectorAll('.btn-details').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation(); // Avoid triggering card click
            const docId = btn.dataset.detailsId;
            console.log('Detalles button clicked, docId:', docId);
            const assistant = assistants.find(a => a.id === docId);
            console.log('Found assistant:', assistant);
            if (!assistant) {
                console.error('Assistant not found for docId:', docId);
                return;
            }
            try {
                await showAssistantDetails(assistant);
            } catch (error) {
                console.error('Error showing assistant details:', error);
                alert('Error al cargar los detalles: ' + error.message);
            }
        });
    });

    // Add click listeners to "Editar" buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid triggering card click
            const docId = btn.dataset.editId;
            const assistant = assistants.find(a => a.id === docId);
            if (!assistant) return;

            currentEditingAssistant = assistant;

            const editAssistantModal = document.getElementById('editAssistantModal');
            const editAssistantName = document.getElementById('editAssistantName');
            const editAssistantEmail = document.getElementById('editAssistantEmail');
            const editAssistantUsername = document.getElementById('editAssistantUsername');
            const editAssistantRole = document.getElementById('editAssistantRole');
            const editAssistantForm = document.getElementById('editAssistantForm');

            if (editAssistantForm) {
                editAssistantForm.dataset.docId = assistant.id;
            }

            if (editAssistantName) editAssistantName.value = assistant.name || assistant.username || '';
            if (editAssistantEmail) editAssistantEmail.value = assistant.email || '';
            if (editAssistantUsername) editAssistantUsername.value = assistant.username || '';
            if (editAssistantRole) editAssistantRole.value = assistant.role || '';

            if (editAssistantModal) {
                editAssistantModal.classList.add('active');
            }
        });
    });
}

function updateStats(assistants) {
    // Count online assistants - check both boolean true and string "true"
    const onlineCount = assistants.filter(a => {
        const rawStatus = a.isOnline !== undefined ? a.isOnline : a.online;
        const isOnline = rawStatus === true || rawStatus === 'true' || rawStatus === 1;
        return isOnline;
    }).length;
    const totalCount = assistants.length;

    console.log('Stats update:', {
        onlineCount, totalCount, assistants: assistants.map(a => ({
            name: a.name || a.username,
            isOnline: a.isOnline,
            isOnlineType: typeof a.isOnline
        }))
    });

    document.getElementById('onlineCount').textContent = onlineCount;
    document.getElementById('totalCount').textContent = totalCount;
}

// Helper function to calculate hours by period
function calculateHoursByPeriod(sessions) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    let hoursToday = 0;
    let hoursWeek = 0;
    let hoursMonth = 0;

    sessions.forEach(session => {
        const startTime = session.startTime?.toDate ? session.startTime.toDate() : new Date(session.startTime);
        const hours = session.hoursWorked || 0;

        if (startTime >= today) {
            hoursToday += hours;
        }
        if (startTime >= weekAgo) {
            hoursWeek += hours;
        }
        if (startTime >= monthAgo) {
            hoursMonth += hours;
        }
    });

    return { hoursToday, hoursWeek, hoursMonth };
}

async function showAssistantDetails(assistant) {
    if (!assistant) {
        console.error('showAssistantDetails called without assistant');
        return;
    }

    console.log('showAssistantDetails called for:', assistant.name || assistant.username);

    const modalNameEl = document.getElementById('modalAssistantName');
    const modalDetailsEl = document.getElementById('modalAssistantDetails');
    const modalEl = document.getElementById('assistantModal');

    if (!modalNameEl || !modalDetailsEl || !modalEl) {
        console.error('Modal elements not found!', { modalNameEl, modalDetailsEl, modalEl });
        alert('Error: No se encontraron los elementos del modal');
        return;
    }

    modalNameEl.textContent = assistant.name || assistant.username || assistant.email;

    // Normalizar estado online también aquí
    const rawStatus = assistant.isOnline !== undefined ? assistant.isOnline : assistant.online;
    const isOnline = rawStatus === true || rawStatus === 'true' || rawStatus === 1;

    // Get all data
    let sessions = [], files = [], projects = [];

    try {
        if (window.firebaseConfig && window.firebaseConfig.getWorkSessions) {
            sessions = await window.firebaseConfig.getWorkSessions(assistant.userId);
        }
    } catch (error) {
        console.error('Error getting work sessions:', error);
    }

    try {
        if (window.firebaseConfig && window.firebaseConfig.getAssistantFiles) {
            files = await window.firebaseConfig.getAssistantFiles(assistant.userId);
        }
    } catch (error) {
        console.error('Error getting assistant files:', error);
    }

    try {
        if (window.firebaseConfig && window.firebaseConfig.getAssignedProjects) {
            projects = await window.firebaseConfig.getAssignedProjects(assistant.userId);
        }
    } catch (error) {
        console.error('Error getting assigned projects:', error);
    }

    console.log('Loaded data:', { sessions: sessions.length, files: files.length, projects: projects.length });

    // Calculate hours by period
    const { hoursToday, hoursWeek, hoursMonth } = calculateHoursByPeriod(sessions);

    // Format sessions
    const sessionsHtml = sessions.length > 0
        ? sessions.slice(0, 20).map(session => {
            const startTime = session.startTime?.toDate ? session.startTime.toDate() : new Date(session.startTime);
            const endTime = session.endTime?.toDate ? session.endTime.toDate() : new Date(session.endTime);
            const hours = session.hoursWorked || 0;

            return `
                <div class="session-item">
                    <div>
                        <div style="font-weight: 600;">${formatDate(startTime)}</div>
                        <div style="font-size: 12px; color: rgba(255,255,255,0.7);">
                            ${formatTime(startTime)} - ${formatTime(endTime)}
                        </div>
                    </div>
                    <div style="font-weight: 600; color: #f59e0b;">${hours.toFixed(2)}h</div>
                </div>
            `;
        }).join('')
        : '<p style="color: rgba(255,255,255,0.5);">No hay sesiones registradas</p>';

    // Format files
    const filesHtml = files.length > 0
        ? files.slice(0, 10).map(file => {
            const uploadedAt = file.uploadedAt?.toDate ? formatDate(file.uploadedAt.toDate()) : 'N/A';
            return `
                <div class="session-item">
                    <div>
                        <div style="font-weight: 600;">${file.fileName || 'Sin nombre'}</div>
                        <div style="font-size: 12px; color: rgba(255,255,255,0.7);">
                            ${file.fileType || 'N/A'} • ${uploadedAt}
                        </div>
                    </div>
                    <a href="${file.downloadURL}" target="_blank" style="color: #3b82f6; text-decoration: none;">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            `;
        }).join('')
        : '<p style="color: rgba(255,255,255,0.5);">No hay archivos subidos</p>';

    // Format projects
    const projectsHtml = projects.length > 0
        ? projects.map(project => `
            <div class="session-item">
                <div>
                    <div style="font-weight: 600;">${project.name || 'Sin nombre'}</div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.7);">
                        ${project.description || 'Sin descripción'}
                    </div>
                </div>
                <span style="color: #4ade80; font-size: 12px;">${project.status || 'Activo'}</span>
            </div>
        `).join('')
        : '<p style="color: rgba(255,255,255,0.5);">No hay proyectos asignados</p>';

    const roleNames = {
        'designer': 'Diseñador Gráfico',
        'community_manager': 'Community Manager',
        'digitizer': 'Digitador'
    };

    // Format location info - only show if online
    const location = isOnline ? (assistant.location || assistant.lastLocation) : null;
    const locationHtml = location ? `
        <div class="info-row">
            <span class="info-label">📍 Ubicación Actual:</span>
            <span class="info-value">${location.city}, ${location.region}, ${location.country}</span>
        </div>
        <div class="info-row">
            <span class="info-label">🌐 IP:</span>
            <span class="info-value">${location.ip}</span>
        </div>
        <div class="info-row">
            <span class="info-label">🏢 ISP:</span>
            <span class="info-value">${location.org || 'N/A'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">🕐 Zona Horaria:</span>
            <span class="info-value">${location.timezone || 'N/A'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">🔄 Última actualización:</span>
            <span class="info-value">${location.lastUpdated ? new Date(location.lastUpdated).toLocaleString('es-ES') : 'N/A'}</span>
        </div>
        ${location.latitude && location.longitude ? `
        <div class="info-row" style="margin-top: 10px;">
            <button id="openMapsBtn" data-lat="${location.latitude}" data-lng="${location.longitude}"
                    style="padding: 8px 16px; background: #4285F4; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-map-marker-alt"></i>
                Ver en Google Maps
            </button>
        </div>
        ` : ''}
    ` : `
        <div class="info-row">
            <span class="info-label">📍 Ubicación:</span>
            <span class="info-value" style="color: rgba(255,255,255,0.5);">${isOnline ? 'No disponible' : 'Usuario desconectado'}</span>
        </div>
    `;

    const detailsHtml = `
        <div class="assistant-info" style="margin-top: 20px;">
            <div class="info-row">
                <span class="info-label">Nombre:</span>
                <span class="info-value">${assistant.name || assistant.username || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${assistant.email}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Usuario:</span>
                <span class="info-value">${assistant.username || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Rol:</span>
                <span class="info-value">${roleNames[assistant.role] || assistant.role || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Estado:</span>
                <span class="info-value">
                    <span class="status-badge ${isOnline ? 'online' : 'offline'}">
                        ${isOnline ? 'En línea' : 'Desconectado'}
                    </span>
                </span>
            </div>
            ${locationHtml}
        </div>
        
        <div style="margin-top: 30px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; text-align: center;">
                <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 5px;">Hoy</div>
                <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">${hoursToday.toFixed(1)}h</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; text-align: center;">
                <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 5px;">Esta Semana</div>
                <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">${hoursWeek.toFixed(1)}h</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; text-align: center;">
                <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 5px;">Este Mes</div>
                <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">${hoursMonth.toFixed(1)}h</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; text-align: center;">
                <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 5px;">Total</div>
                <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">${(assistant.totalHoursWorked || 0).toFixed(1)}h</div>
            </div>
        </div>
        
        <div style="margin-top: 30px;">
            <h3 style="margin-bottom: 15px;">Proyectos Asignados (${projects.length})</h3>
            <div class="sessions-list">
                ${projectsHtml}
            </div>
        </div>
        
        <div style="margin-top: 30px;">
            <h3 style="margin-bottom: 15px;">Archivos Subidos (${files.length})</h3>
            <div class="sessions-list">
                ${filesHtml}
            </div>
        </div>
        
        <div style="margin-top: 30px;">
            <h3 style="margin-bottom: 15px;">Sesiones de Trabajo (${sessions.length})</h3>
            <div class="sessions-list">
                ${sessionsHtml}
            </div>
        </div>
    `;

    modalDetailsEl.innerHTML = detailsHtml;
    modalEl.classList.add('active');
    console.log('Modal should be visible now');

    // Add event listener for Google Maps button
    const openMapsBtn = document.getElementById('openMapsBtn');
    if (openMapsBtn) {
        openMapsBtn.addEventListener('click', () => {
            const lat = openMapsBtn.dataset.lat;
            const lng = openMapsBtn.dataset.lng;
            const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
            console.log('Opening Google Maps:', mapsUrl);

            // Open in default browser
            window.open(mapsUrl, '_blank', 'noopener,noreferrer');
        });
    }
}

async function handleEditAssistant(e) {
    e.preventDefault();

    const editAssistantForm = document.getElementById('editAssistantForm');
    const errorDiv = document.getElementById('editAssistantError');
    const successDiv = document.getElementById('editAssistantSuccess');

    if (errorDiv) errorDiv.classList.remove('show');
    if (successDiv) successDiv.classList.remove('show');

    if (!editAssistantForm) return;

    const docId = editAssistantForm.dataset.docId;
    if (!docId) {
        console.error('No docId found for assistant edit');
        if (errorDiv) {
            errorDiv.textContent = 'No se pudo identificar el ayudante a editar.';
            errorDiv.classList.add('show');
        }
        return;
    }

    const name = document.getElementById('editAssistantName')?.value.trim();
    const email = document.getElementById('editAssistantEmail')?.value.trim();
    const username = document.getElementById('editAssistantUsername')?.value.trim();
    const role = document.getElementById('editAssistantRole')?.value;

    if (!name || !email || !username || !role) {
        if (errorDiv) {
            errorDiv.textContent = 'Por favor completa todos los campos.';
            errorDiv.classList.add('show');
        }
        return;
    }

    try {
        const submitBtn = editAssistantForm.querySelector('button[type=\"submit\"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Guardando...';
        }

        if (!window.firebaseConfig || !window.firebaseConfig.updateAssistant) {
            throw new Error('Firebase config no disponible para actualizar ayudante');
        }

        await window.firebaseConfig.updateAssistant(docId, {
            name,
            email,
            username,
            role
        });

        if (successDiv) {
            successDiv.textContent = 'Cambios guardados correctamente.';
            successDiv.classList.add('show');
        }

        // Cerrar modal después de un momento
        setTimeout(() => {
            const editAssistantModal = document.getElementById('editAssistantModal');
            if (editAssistantModal) {
                editAssistantModal.classList.remove('active');
            }
        }, 1000);
    } catch (error) {
        console.error('Error updating assistant:', error);
        if (errorDiv) {
            errorDiv.textContent = error.message || 'Error al guardar cambios.';
            errorDiv.classList.add('show');
        }
    } finally {
        const submitBtn = editAssistantForm.querySelector('button[type=\"submit\"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Guardar Cambios';
        }
    }
}

async function handleDeleteAssistant() {
    const editAssistantForm = document.getElementById('editAssistantForm');
    const errorDiv = document.getElementById('editAssistantError');
    const successDiv = document.getElementById('editAssistantSuccess');

    if (!editAssistantForm) return;

    const docId = editAssistantForm.dataset.docId;
    if (!docId) {
        console.error('No docId found for assistant delete');
        if (errorDiv) {
            errorDiv.textContent = 'No se pudo identificar el ayudante a eliminar.';
            errorDiv.classList.add('show');
        }
        return;
    }

    const confirmed = window.confirm('¿Seguro que quieres eliminar este ayudante? Esta acción no se puede deshacer.');
    if (!confirmed) return;

    if (errorDiv) errorDiv.classList.remove('show');
    if (successDiv) successDiv.classList.remove('show');

    try {
        if (!window.firebaseConfig || !window.firebaseConfig.deleteAssistant) {
            throw new Error('Firebase config no disponible para eliminar ayudante');
        }

        await window.firebaseConfig.deleteAssistant(docId);

        if (successDiv) {
            successDiv.textContent = 'Ayudante eliminado correctamente.';
            successDiv.classList.add('show');
        }

        // Cerrar modal y refrescar lista
        const editAssistantModal = document.getElementById('editAssistantModal');
        if (editAssistantModal) {
            editAssistantModal.classList.remove('active');
        }

        if (assistantsUnsubscribe) {
            assistantsUnsubscribe();
            assistantsUnsubscribe = null;
        }
        startWatchingAssistants();
    } catch (error) {
        console.error('Error deleting assistant:', error);
        if (errorDiv) {
            errorDiv.textContent = error.message || 'Error al eliminar el ayudante.';
            errorDiv.classList.add('show');
        }
    }
}

async function loadProjects() {
    try {
        const projects = await window.firebaseConfig.getAllProjects();
        const projectsList = document.getElementById('projectsList');

        if (projects.length === 0) {
            projectsList.innerHTML = '<p style="color: rgba(255,255,255,0.5);">No hay proyectos</p>';
            return;
        }

        projectsList.innerHTML = projects.map(project => `
            <div class="project-card" data-project-id="${project.id}" style="cursor: pointer;">
                <h3>${project.name || 'Sin nombre'}</h3>
                <p style="color: rgba(255,255,255,0.7); margin: 10px 0;">${project.description || ''}</p>
                <div style="margin-top: 15px;">
                    <span style="font-size: 12px; color: rgba(255,255,255,0.5);">Estado: </span>
                    <span style="color: #4ade80;">${project.status || 'Activo'}</span>
                </div>
            </div>
        `).join('');

        // Add click listeners to project cards
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', () => {
                const projectId = card.dataset.projectId;
                const project = projects.find(p => p.id === projectId);
                if (project) {
                    showProjectDetails(project);
                }
            });
        });
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

async function loadAnalytics() {
    try {
        if (!window.firebaseConfig || !window.firebaseConfig.getAllAssistants) {
            console.error('getAllAssistants not available');
            return;
        }
        const assistants = await window.firebaseConfig.getAllAssistants();

        // Calculate total hours
        const totalHours = assistants.reduce((sum, a) => sum + (a.totalHoursWorked || 0), 0);
        document.getElementById('totalHoursWorked').textContent = totalHours.toFixed(1);

        // Calculate daily average (assuming 30 days)
        const dailyAverage = totalHours / 30;
        document.getElementById('dailyAverage').textContent = dailyAverage.toFixed(1);

        // Find most active assistant
        const mostActive = assistants.reduce((max, a) =>
            (a.totalHoursWorked || 0) > (max.totalHoursWorked || 0) ? a : max,
            assistants[0] || {}
        );
        document.getElementById('mostActive').textContent = mostActive.username || mostActive.email || '-';

        // Load recent sessions
        const allSessions = [];
        for (const assistant of assistants) {
            const sessions = await window.firebaseConfig.getWorkSessions(assistant.userId);
            allSessions.push(...sessions.map(s => ({
                ...s,
                assistantName: assistant.name || assistant.username || assistant.email
            })));
        }

        // Sort by date and show recent
        allSessions.sort((a, b) => {
            const dateA = a.startTime?.toDate ? a.startTime.toDate() : new Date(a.startTime);
            const dateB = b.startTime?.toDate ? b.startTime.toDate() : new Date(b.startTime);
            return dateB - dateA;
        });

        const sessionsList = document.getElementById('sessionsList');
        sessionsList.innerHTML = allSessions.slice(0, 20).map(session => {
            const startTime = session.startTime?.toDate ? session.startTime.toDate() : new Date(session.startTime);
            const hours = session.hoursWorked || 0;

            return `
                <div class="session-item">
                    <div>
                        <div style="font-weight: 600;">${session.assistantName}</div>
                        <div style="font-size: 12px; color: rgba(255,255,255,0.7);">
                            ${formatDate(startTime)} - ${formatTime(startTime)}
                        </div>
                    </div>
                    <div style="font-weight: 600; color: #f59e0b;">${hours.toFixed(2)}h</div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

function setupRefreshInterval(interval = 10000) {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }

    refreshInterval = setInterval(() => {
        if (currentUser) {
            // Force refresh by re-watching
            if (assistantsUnsubscribe) {
                assistantsUnsubscribe();
            }
            startWatchingAssistants();
        }
    }, interval);
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

function formatTime(date) {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : date.toDate();
    return d.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

let currentProjectDetails = null;

async function showProjectDetails(project) {
    currentProjectDetails = project;
    const modal = document.getElementById('projectDetailsModal');
    const modalName = document.getElementById('projectDetailsName');
    const modalContent = document.getElementById('projectDetailsContent');

    if (!modal || !modalName || !modalContent) return;

    modalName.textContent = project.name || 'Sin nombre';

    // Get assigned assistants
    let assignedAssistants = [];
    if (project.assignedAssistants && project.assignedAssistants.length > 0) {
        try {
            const allAssistants = await window.firebaseConfig.getAllAssistants();
            assignedAssistants = allAssistants.filter(a =>
                project.assignedAssistants.includes(a.userId)
            );
        } catch (error) {
            console.error('Error loading assigned assistants:', error);
        }
    }

    // Get project files
    let projectFiles = [];
    try {
        projectFiles = await window.firebaseConfig.getProjectFiles(project.id);
    } catch (error) {
        console.error('Error loading project files:', error);
    }

    // Separate admin files from completed products (uploaded by assistants)
    const adminFiles = projectFiles.filter(f => !f.isCompleted && !f.userId);
    const completedProducts = projectFiles.filter(f => f.isCompleted === true);

    // Get assistant names for completed products
    let assistantNamesMap = {};
    if (completedProducts.length > 0) {
        try {
            const allAssistants = await window.firebaseConfig.getAllAssistants();
            completedProducts.forEach(file => {
                if (file.userId) {
                    const assistant = allAssistants.find(a => a.userId === file.userId);
                    if (assistant) {
                        assistantNamesMap[file.userId] = assistant.name || assistant.username || assistant.email;
                    }
                }
            });
        } catch (error) {
            console.error('Error loading assistant names:', error);
        }
    }

    // Categorize admin files
    const videos = adminFiles.filter(f =>
        f.fileType === 'video' ||
        f.fileName?.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i) ||
        f.downloadURL?.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i)
    );
    const images = adminFiles.filter(f =>
        f.fileType === 'photo' ||
        f.fileType === 'image' ||
        f.fileName?.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i) ||
        f.downloadURL?.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i)
    );
    const documents = adminFiles.filter(f =>
        !videos.includes(f) && !images.includes(f)
    );

    // Categorize completed products
    const completedVideos = completedProducts.filter(f =>
        f.fileType === 'video' ||
        f.fileName?.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i) ||
        f.downloadURL?.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i)
    );
    const completedImages = completedProducts.filter(f =>
        f.fileType === 'photo' ||
        f.fileType === 'image' ||
        f.fileName?.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i) ||
        f.downloadURL?.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i)
    );

    const roleNames = {
        'designer': 'Diseñador Gráfico',
        'community_manager': 'Community Manager',
        'digitizer': 'Digitador'
    };

    const contentHtml = `
        <div style="margin-top: 20px;">
            <div class="assistant-info">
                <div class="info-row">
                    <span class="info-label">Nombre:</span>
                    <span class="info-value">${project.name || 'Sin nombre'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Estado:</span>
                    <span class="info-value">
                        <span style="color: #4ade80; font-weight: 600;">${project.status || 'Activo'}</span>
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Descripción:</span>
                    <span class="info-value">${project.description || 'Sin descripción'}</span>
                </div>
                <div class="info-row" style="align-items: flex-start;">
                    <span class="info-label">Asignado a:</span>
                    <span class="info-value" style="display: flex; flex-direction: column; gap: 5px;">
                        ${assignedAssistants.length > 0
            ? assignedAssistants.map(a => `
                                <span style="display: inline-block; padding: 4px 8px; background: rgba(59, 130, 246, 0.2); border-radius: 6px; font-size: 12px;">
                                    ${a.name || a.username || a.email} (${roleNames[a.role] || a.role || 'Sin rol'})
                                </span>
                            `).join('')
            : '<span style="color: rgba(255,255,255,0.5);">Ningún asistente asignado</span>'}
                    </span>
                </div>
                <div style="margin-top: 15px;">
                    <button class="btn-primary" onclick="openEditProjectAssignments('${project.id}')" style="padding: 8px 16px; font-size: 13px;">
                        <i class="fas fa-user-edit"></i> Editar Asignaciones
                    </button>
                </div>
                ${project.driveFolderUrl ? `
                <div class="info-row" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <span class="info-label">Carpeta de Drive:</span>
                    <span class="info-value">
                        <button onclick="window.open('${project.driveFolderUrl.replace(/'/g, "\\'")}', '_blank')" style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; font-size: 13px;">
                            <i class="fab fa-google-drive"></i> Abrir Carpeta de Drive
                        </button>
                    </span>
                </div>
                <div style="margin-top: 10px;">
                    <button class="btn-secondary" onclick="openEditDriveFolder('${project.id}', '${project.driveFolderUrl || ''}')" style="padding: 6px 12px; font-size: 12px;">
                        <i class="fas fa-edit"></i> Editar URL de Drive
                    </button>
                </div>
                ` : `
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <button class="btn-secondary" onclick="openEditDriveFolder('${project.id}', '')" style="padding: 8px 16px; font-size: 13px;">
                        <i class="fab fa-google-drive"></i> Agregar Carpeta de Drive
                    </button>
                </div>
                `}
            </div>
        </div>
        
        <div style="margin-top: 40px;">
            <h3 style="margin-bottom: 20px; font-size: 18px;">Archivos del Proyecto</h3>
            
            <!-- Videos Section -->
            <div style="margin-bottom: 30px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h4 style="font-size: 16px; color: #f59e0b;">
                        <i class="fas fa-video"></i> Videos (${videos.length})
                    </h4>
                    <button class="btn-primary" onclick="openUploadDialog('${project.id}', 'video')" style="padding: 8px 16px; font-size: 13px;">
                        <i class="fas fa-upload"></i> Subir Video
                    </button>
                </div>
                <div id="videosList-${project.id}" class="files-category-list">
                    ${videos.length > 0 ? videos.map(file => createFileItem(file)).join('') : '<p style="color: rgba(255,255,255,0.5); padding: 20px; text-align: center;">No hay videos</p>'}
                </div>
            </div>
            
            <!-- Images Section -->
            <div style="margin-bottom: 30px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h4 style="font-size: 16px; color: #f59e0b;">
                        <i class="fas fa-image"></i> Imágenes (${images.length})
                    </h4>
                    <button class="btn-primary" onclick="openUploadDialog('${project.id}', 'photo')" style="padding: 8px 16px; font-size: 13px;">
                        <i class="fas fa-upload"></i> Subir Imagen
                    </button>
                </div>
                <div id="imagesList-${project.id}" class="files-category-list">
                    ${images.length > 0 ? images.map(file => createFileItem(file)).join('') : '<p style="color: rgba(255,255,255,0.5); padding: 20px; text-align: center;">No hay imágenes</p>'}
                </div>
            </div>
            
            <!-- Documents Section -->
            <div style="margin-bottom: 30px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h4 style="font-size: 16px; color: #f59e0b;">
                        <i class="fas fa-file"></i> Archivos/Documentos (${documents.length})
                    </h4>
                    <button class="btn-primary" onclick="openUploadDialog('${project.id}', 'file')" style="padding: 8px 16px; font-size: 13px;">
                        <i class="fas fa-upload"></i> Subir Archivo
                    </button>
                </div>
                <div id="documentsList-${project.id}" class="files-category-list">
                    ${documents.length > 0 ? documents.map(file => createFileItem(file)).join('') : '<p style="color: rgba(255,255,255,0.5); padding: 20px; text-align: center;">No hay archivos</p>'}
                </div>
            </div>
        </div>
        
        <div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid rgba(16, 185, 129, 0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="font-size: 18px; color: #10b981;">
                    <i class="fas fa-check-circle"></i> Productos Realizados por Asistentes (${completedProducts.length})
                </h3>
            </div>
            
            ${completedProducts.length === 0
            ? '<p style="color: rgba(255,255,255,0.5); padding: 20px; text-align: center;">Aún no hay productos realizados</p>'
            : `
                    ${completedVideos.length > 0 ? `
                        <div style="margin-bottom: 25px;">
                            <h4 style="font-size: 14px; color: rgba(255,255,255,0.8); margin-bottom: 10px;">
                                <i class="fas fa-video"></i> Videos Completados (${completedVideos.length})
                            </h4>
                            <div class="files-category-list">
                                ${completedVideos.map(f => createCompletedFileItem(f, assistantNamesMap[f.userId])).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${completedImages.length > 0 ? `
                        <div style="margin-bottom: 25px;">
                            <h4 style="font-size: 14px; color: rgba(255,255,255,0.8); margin-bottom: 10px;">
                                <i class="fas fa-image"></i> Imágenes Completadas (${completedImages.length})
                            </h4>
                            <div class="files-category-list">
                                ${completedImages.map(f => createCompletedFileItem(f, assistantNamesMap[f.userId])).join('')}
                            </div>
                        </div>
                    ` : ''}
                `}
        </div>
    `;

    modalContent.innerHTML = contentHtml;
    modal.classList.add('active');

    // Setup close button
    const closeBtn = document.querySelector('.close-project-details');
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.classList.remove('active');
        };
    }

    // Close on outside click
    modal.onclick = (e) => {
        if (e.target.id === 'projectDetailsModal') {
            modal.classList.remove('active');
        }
    };
}

function createFileItem(file) {
    const uploadedAt = file.uploadedAt?.toDate ? formatDate(file.uploadedAt.toDate()) : 'N/A';
    const fileSize = file.size ? formatFileSize(file.size) : 'N/A';

    return `
        <div class="file-item-card" style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                <i class="fas fa-file" style="font-size: 24px; color: #f59e0b;"></i>
                <div>
                    <div style="font-weight: 600; color: white; margin-bottom: 4px;">${file.fileName || 'Sin nombre'}</div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.6);">
                        ${fileSize} • ${uploadedAt}
                    </div>
                </div>
            </div>
            <a href="${file.downloadURL}" target="_blank" class="btn-secondary" style="padding: 6px 12px; text-decoration: none;">
                <i class="fas fa-download"></i> Descargar
            </a>
        </div>
    `;
}

function createCompletedFileItem(file, assistantName) {
    const uploadedAt = file.uploadedAt?.toDate ? formatDate(file.uploadedAt.toDate()) : 'N/A';
    const fileSize = file.size ? formatFileSize(file.size) : 'N/A';

    return `
        <div class="file-item-card" style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: rgba(16, 185, 129, 0.1); border-radius: 8px; margin-bottom: 10px; border-left: 3px solid #10b981;">
            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                <i class="fas fa-check-circle" style="font-size: 24px; color: #10b981;"></i>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: white; margin-bottom: 4px;">
                        ${file.fileName || 'Sin nombre'}
                        <span style="font-size: 11px; color: rgba(255,255,255,0.5); margin-left: 8px;">por ${assistantName || 'Desconocido'}</span>
                    </div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.6);">
                        ${fileSize} • ${uploadedAt}
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 8px;">
                <a href="${file.downloadURL}" target="_blank" class="btn-secondary" style="padding: 6px 12px; text-decoration: none;">
                    <i class="fas fa-download"></i> Ver
                </a>
                <button onclick="deleteCompletedFile('${file.id}', '${file.storagePath || ''}', '${currentProjectDetails?.id || ''}')" class="btn-danger" style="padding: 6px 12px; background: #ef4444; border: none; border-radius: 6px; color: white; cursor: pointer; font-size: 12px;">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `;
}

window.deleteCompletedFile = async function (fileId, storagePath, projectId) {
    if (!fileId) {
        alert('Error: No se pudo identificar el archivo a eliminar');
        return;
    }

    const confirmed = confirm('¿Estás seguro de que quieres eliminar este producto realizado? Esta acción no se puede deshacer.');
    if (!confirmed) return;

    try {
        // Show loading
        const loadingMsg = document.createElement('div');
        loadingMsg.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.9); padding: 20px; border-radius: 10px; z-index: 10000; color: white;';
        loadingMsg.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Eliminando archivo...';
        document.body.appendChild(loadingMsg);

        // Delete from Firestore and B2
        await window.firebaseConfig.deleteProjectFile(fileId, storagePath);

        // Remove loading
        document.body.removeChild(loadingMsg);

        // Show success message
        const successMsg = document.createElement('div');
        successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 15px 20px; border-radius: 8px; z-index: 10000;';
        successMsg.innerHTML = '<i class="fas fa-check"></i> Archivo eliminado exitosamente';
        document.body.appendChild(successMsg);
        setTimeout(() => {
            if (document.body.contains(successMsg)) {
                document.body.removeChild(successMsg);
            }
        }, 3000);

        // Reload project details
        if (currentProjectDetails && projectId) {
            await showProjectDetails(currentProjectDetails);
        }

    } catch (error) {
        console.error('Error deleting file:', error);

        // Remove loading if exists
        const loading = document.querySelector('div[style*="position: fixed"][style*="top: 50%"]');
        if (loading) {
            document.body.removeChild(loading);
        }

        // Show error message
        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 15px 20px; border-radius: 8px; z-index: 10000;';
        errorMsg.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Error: ${error.message || 'No se pudo eliminar el archivo'}`;
        document.body.appendChild(errorMsg);
        setTimeout(() => {
            if (document.body.contains(errorMsg)) {
                document.body.removeChild(errorMsg);
            }
        }, 5000);
    }
};

function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Upload dialog functions
window.openUploadDialog = function (projectId, fileType) {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = fileType !== 'video'; // Videos usually one at a time

    // Set file type filters
    if (fileType === 'video') {
        input.accept = 'video/*';
    } else if (fileType === 'photo') {
        input.accept = 'image/*';
    } else {
        input.accept = '*/*';
    }

    input.onchange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        await uploadProjectFiles(projectId, files, fileType);
    };

    input.click();
};

let currentEditingProjectId = null;
let currentEditingDriveProjectId = null;

window.openEditDriveFolder = function (projectId, currentUrl) {
    currentEditingDriveProjectId = projectId;
    const modal = document.getElementById('editDriveFolderModal');
    const urlInput = document.getElementById('editDriveFolderUrl');

    if (modal && urlInput) {
        urlInput.value = currentUrl || '';
        document.getElementById('editDriveFolderError').classList.remove('show');
        document.getElementById('editDriveFolderSuccess').classList.remove('show');
        modal.classList.add('active');
    }
};

window.closeEditDriveFolderModal = function () {
    const modal = document.getElementById('editDriveFolderModal');
    if (modal) {
        modal.classList.remove('active');
    }
    currentEditingDriveProjectId = null;
};

async function handleEditDriveFolder(e) {
    e.preventDefault();

    const errorDiv = document.getElementById('editDriveFolderError');
    const successDiv = document.getElementById('editDriveFolderSuccess');
    const form = e.target;
    const urlInput = document.getElementById('editDriveFolderUrl');

    if (!currentEditingDriveProjectId) {
        errorDiv.textContent = 'No se pudo identificar el proyecto';
        errorDiv.classList.add('show');
        return;
    }

    const driveFolderUrl = urlInput.value.trim();

    errorDiv.classList.remove('show');
    successDiv.classList.remove('show');

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

        await window.firebaseConfig.updateProjectDriveFolder(currentEditingDriveProjectId, driveFolderUrl);

        successDiv.textContent = 'Carpeta de Drive actualizada exitosamente';
        successDiv.classList.add('show');

        // Reload project details
        if (currentProjectDetails) {
            await showProjectDetails(currentProjectDetails);
        }

        // Reload projects list
        await loadProjects();

        // Close modal after 1.5 seconds
        setTimeout(() => {
            closeEditDriveFolderModal();
            successDiv.classList.remove('show');
        }, 1500);

    } catch (error) {
        console.error('Error updating drive folder:', error);
        errorDiv.textContent = 'Error al actualizar carpeta de Drive: ' + (error.message || 'Intenta nuevamente');
        errorDiv.classList.add('show');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

window.openEditProjectAssignments = async function (projectId) {
    currentEditingProjectId = projectId;
    const modal = document.getElementById('editProjectAssignmentsModal');
    if (!modal) return;

    // Get current project
    let currentProject = null;
    try {
        const projects = await window.firebaseConfig.getAllProjects();
        currentProject = projects.find(p => p.id === projectId);
    } catch (error) {
        console.error('Error loading project:', error);
    }

    // Load assistants
    try {
        const assistants = await window.firebaseConfig.getAllAssistants();
        const assistantsList = document.getElementById('editAssistantsCheckboxList');

        if (assistants.length === 0) {
            assistantsList.innerHTML = '<p style="color: rgba(255,255,255,0.5);">No hay asistentes disponibles</p>';
        } else {
            const currentAssignedIds = currentProject?.assignedAssistants || [];
            assistantsList.innerHTML = assistants.map(assistant => {
                const isChecked = currentAssignedIds.includes(assistant.userId);
                const roleNames = {
                    'designer': 'Diseñador Gráfico',
                    'community_manager': 'Community Manager',
                    'digitizer': 'Digitador'
                };
                return `
                    <label style="display: flex; align-items: center; gap: 10px; padding: 8px; cursor: pointer; border-radius: 6px; margin-bottom: 5px; transition: background 0.2s;" 
                           onmouseover="this.style.background='rgba(255,255,255,0.05)'" 
                           onmouseout="this.style.background='transparent'">
                        <input type="checkbox" value="${assistant.userId}" name="editAssignedAssistants" ${isChecked ? 'checked' : ''} style="cursor: pointer;">
                        <span style="color: white;">${assistant.name || assistant.username || assistant.email}</span>
                        <span style="font-size: 11px; color: rgba(255,255,255,0.5);">(${roleNames[assistant.role] || assistant.role || 'Sin rol'})</span>
                    </label>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading assistants:', error);
        document.getElementById('editAssistantsCheckboxList').innerHTML = '<p style="color: #ef4444;">Error al cargar asistentes</p>';
    }

    // Reset messages
    document.getElementById('editAssignmentsError').classList.remove('show');
    document.getElementById('editAssignmentsSuccess').classList.remove('show');

    modal.classList.add('active');
};

window.closeEditAssignmentsModal = function () {
    const modal = document.getElementById('editProjectAssignmentsModal');
    if (modal) {
        modal.classList.remove('active');
    }
    currentEditingProjectId = null;
};

async function handleEditProjectAssignments(e) {
    e.preventDefault();

    const errorDiv = document.getElementById('editAssignmentsError');
    const successDiv = document.getElementById('editAssignmentsSuccess');
    const form = e.target;

    if (!currentEditingProjectId) {
        errorDiv.textContent = 'No se pudo identificar el proyecto';
        errorDiv.classList.add('show');
        return;
    }

    // Get selected assistants
    const assignedCheckboxes = form.querySelectorAll('input[name="editAssignedAssistants"]:checked');
    const assignedAssistants = Array.from(assignedCheckboxes).map(cb => cb.value);

    errorDiv.classList.remove('show');
    successDiv.classList.remove('show');

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

        await window.firebaseConfig.updateProjectAssignments(currentEditingProjectId, assignedAssistants);

        successDiv.textContent = 'Asignaciones actualizadas exitosamente';
        successDiv.classList.add('show');

        // Reload project details
        if (currentProjectDetails) {
            await showProjectDetails(currentProjectDetails);
        }

        // Reload projects list
        await loadProjects();

        // Close modal after 1.5 seconds
        setTimeout(() => {
            closeEditAssignmentsModal();
            successDiv.classList.remove('show');
        }, 1500);

    } catch (error) {
        console.error('Error updating project assignments:', error);
        errorDiv.textContent = 'Error al actualizar asignaciones: ' + (error.message || 'Intenta nuevamente');
        errorDiv.classList.add('show');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

async function uploadProjectFiles(projectId, files, fileType) {
    const errorDiv = document.getElementById('projectDetailsContent');
    if (!errorDiv) return;

    try {
        // Show loading
        const loadingMsg = document.createElement('div');
        loadingMsg.id = 'uploadLoading';
        loadingMsg.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.9); padding: 20px; border-radius: 10px; z-index: 10000;';
        loadingMsg.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo archivos...';
        document.body.appendChild(loadingMsg);

        // Upload to B2
        const uploadedFiles = await window.firebaseConfig.uploadFilesToB2(files, projectId);

        // Save to Firestore
        if (uploadedFiles && uploadedFiles.length > 0) {
            for (const file of uploadedFiles) {
                await window.firebaseConfig.db.collection("projectFiles").add({
                    projectId: projectId,
                    fileName: file.fileName || file.name || 'Sin nombre',
                    fileType: fileType,
                    storagePath: file.key,
                    downloadURL: file.url,
                    size: file.size || 0,
                    uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        }

        // Remove loading
        document.body.removeChild(loadingMsg);

        // Reload project details
        if (currentProjectDetails) {
            await showProjectDetails(currentProjectDetails);
        }

        // Show success message
        const successMsg = document.createElement('div');
        successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 15px 20px; border-radius: 8px; z-index: 10000;';
        successMsg.innerHTML = '<i class="fas fa-check"></i> Archivos subidos exitosamente';
        document.body.appendChild(successMsg);
        setTimeout(() => {
            if (document.body.contains(successMsg)) {
                document.body.removeChild(successMsg);
            }
        }, 3000);

    } catch (error) {
        console.error('Error uploading files:', error);
        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 15px 20px; border-radius: 8px; z-index: 10000;';
        errorMsg.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Error: ${error.message}`;
        document.body.appendChild(errorMsg);
        setTimeout(() => {
            if (document.body.contains(errorMsg)) {
                document.body.removeChild(errorMsg);
            }
        }, 5000);

        // Remove loading if exists
        const loading = document.getElementById('uploadLoading');
        if (loading) {
            document.body.removeChild(loading);
        }
    }
}

// Notifications functions
async function loadNotifications() {
    const list = document.getElementById('notificationsList');
    if (!list) return;

    try {
        list.innerHTML = '<div class="loading-message">Cargando notificaciones...</div>';
        const notifications = await window.firebaseConfig.getAllNotifications();

        if (notifications.length === 0) {
            list.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 40px;">No hay notificaciones</p>';
            return;
        }

        list.innerHTML = notifications.map(notif => {
            const createdAt = notif.createdAt?.toDate ? formatDate(notif.createdAt.toDate()) : 'N/A';
            const readCount = notif.readCount || 0;
            const targetUsers = Array.isArray(notif.targetUsers) ? notif.targetUsers.length : (notif.targetUsers === 'all' ? 'Todos' : 1);

            return `
                <div class="notification-item-admin" style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 15px; border-left: 4px solid ${notif.type === 'update' ? '#10b981' : notif.type === 'announcement' ? '#f59e0b' : '#00d4ff'};">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <div>
                            <h3 style="margin: 0 0 5px 0; color: white; font-size: 16px;">${notif.title || 'Sin título'}</h3>
                            <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 13px;">${notif.message || ''}</p>
                        </div>
                        <span style="background: ${notif.isActive ? '#10b981' : '#ef4444'}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                            ${notif.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                    </div>
                    ${notif.type === 'update' && notif.downloadLink ? `
                        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 12px; margin: 10px 0;">
                            <p style="margin: 0 0 5px 0; color: #10b981; font-size: 12px; font-weight: 600;">Actualización: Versión ${notif.version || 'N/A'}</p>
                            <a href="${notif.downloadLink}" target="_blank" style="color: #00d4ff; text-decoration: none; font-size: 12px;">
                                <i class="fas fa-external-link-alt"></i> Ver en Drive
                            </a>
                        </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                        <div style="font-size: 11px; color: rgba(255,255,255,0.5);">
                            <span>Enviado: ${createdAt}</span> | 
                            <span>Destinatarios: ${targetUsers}</span> | 
                            <span>Leídas: ${readCount}</span>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            ${notif.isActive ? `
                                <button onclick="handleDeactivateNotification('${notif.id}')" class="btn-secondary" style="padding: 6px 12px; font-size: 12px;">
                                    <i class="fas fa-ban"></i> Desactivar
                                </button>
                            ` : ''}
                            <button onclick="handleDeleteNotification('${notif.id}')" class="btn-secondary" style="padding: 6px 12px; font-size: 12px; background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.5); color: #fca5a5;">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading notifications:', error);
        list.innerHTML = '<p style="color: #ef4444; text-align: center; padding: 40px;">Error al cargar notificaciones</p>';
    }
}

function openCreateNotificationModal() {
    const modal = document.getElementById('createNotificationModal');
    if (!modal) return;

    // Setup handlers when opening modal
    setupNotificationHandlers();

    // Reset form
    const form = document.getElementById('createNotificationForm');
    if (form) {
        form.reset();
        const updateFields = document.getElementById('updateFields');
        if (updateFields) updateFields.style.display = 'none';
    }

    const errorDiv = document.getElementById('createNotificationError');
    const successDiv = document.getElementById('createNotificationSuccess');
    if (errorDiv) errorDiv.classList.remove('show');
    if (successDiv) successDiv.classList.remove('show');

    modal.style.display = 'flex';

    // Load assistants for target selection
    loadAssistantsForNotification();
}

function closeCreateNotificationModal() {
    const modal = document.getElementById('createNotificationModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function loadAssistantsForNotification() {
    try {
        const assistants = await window.firebaseConfig.getAllAssistants();
        const targetSelect = document.getElementById('notificationTarget');

        if (targetSelect) {
            // Keep "all" option and add assistants
            targetSelect.innerHTML = '<option value="all">Todos los usuarios</option>';
            assistants.forEach(assistant => {
                const option = document.createElement('option');
                option.value = assistant.userId;
                option.textContent = `${assistant.name || assistant.username || assistant.email} (${assistant.role || 'Sin rol'})`;
                targetSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading assistants for notification:', error);
    }
}

// Setup notification form handlers (called when opening the modal)
// Use a flag to ensure handlers are only set up once
let notificationHandlersSetup = false;

function setupNotificationHandlers() {
    // Only set up handlers once
    if (notificationHandlersSetup) {
        return;
    }

    try {
        const notificationType = document.getElementById('notificationType');
        const updateFields = document.getElementById('updateFields');

        if (notificationType && updateFields) {
            notificationType.addEventListener('change', (e) => {
                if (e.target.value === 'update') {
                    if (updateFields) updateFields.style.display = 'block';
                    const versionEl = document.getElementById('notificationVersion');
                    const linkEl = document.getElementById('notificationDownloadLink');
                    if (versionEl) versionEl.required = true;
                    if (linkEl) linkEl.required = true;
                } else {
                    if (updateFields) updateFields.style.display = 'none';
                    const versionEl = document.getElementById('notificationVersion');
                    const linkEl = document.getElementById('notificationDownloadLink');
                    if (versionEl) versionEl.required = false;
                    if (linkEl) linkEl.required = false;
                }
            });
        }

        // Handle create notification form
        const createNotificationForm = document.getElementById('createNotificationForm');
        if (createNotificationForm) {
            createNotificationForm.addEventListener('submit', handleCreateNotification);
        }

        notificationHandlersSetup = true;
    } catch (error) {
        console.error('Error setting up notification handlers:', error);
    }
}

async function handleCreateNotification(e) {
    e.preventDefault();

    const errorDiv = document.getElementById('createNotificationError');
    const successDiv = document.getElementById('createNotificationSuccess');
    const form = e.target;

    const type = document.getElementById('notificationType').value;
    const title = document.getElementById('notificationTitle').value.trim();
    const message = document.getElementById('notificationMessage').value.trim();
    const target = document.getElementById('notificationTarget').value;
    const version = type === 'update' ? document.getElementById('notificationVersion').value.trim() : null;
    const downloadLink = type === 'update' ? document.getElementById('notificationDownloadLink').value.trim() : null;

    if (!title || !message) {
        errorDiv.textContent = 'Por favor completa todos los campos requeridos';
        errorDiv.classList.add('show');
        return;
    }

    if (type === 'update' && (!version || !downloadLink)) {
        errorDiv.textContent = 'Para notificaciones de actualización, debes proporcionar la versión y el link de descarga';
        errorDiv.classList.add('show');
        return;
    }

    errorDiv.classList.remove('show');
    successDiv.classList.remove('show');

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

        // Get all assistants if target is "all"
        let targetUsers = [];
        if (target === 'all') {
            const assistants = await window.firebaseConfig.getAllAssistants();
            targetUsers = assistants.map(a => a.userId);
        } else {
            targetUsers = [target];
        }

        // Add message about closing app for updates
        let finalMessage = message;
        if (type === 'update') {
            finalMessage += '\n\n⚠️ IMPORTANTE: Antes de instalar la nueva versión, debes cerrar completamente la aplicación.';
        }

        await window.firebaseConfig.createNotification(
            title,
            finalMessage,
            type,
            targetUsers,
            downloadLink,
            version
        );

        successDiv.textContent = 'Notificación enviada exitosamente';
        successDiv.classList.add('show');

        // Reset form
        form.reset();
        document.getElementById('updateFields').style.display = 'none';

        // Reload notifications list
        await loadNotifications();

        // Close modal after 2 seconds
        setTimeout(() => {
            closeCreateNotificationModal();
            successDiv.classList.remove('show');
        }, 2000);

    } catch (error) {
        console.error('Error creating notification:', error);
        errorDiv.textContent = 'Error al crear notificación: ' + (error.message || 'Intenta nuevamente');
        errorDiv.classList.add('show');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

async function handleDeactivateNotification(notificationId) {
    if (!confirm('¿Estás seguro de que deseas desactivar esta notificación?')) {
        return;
    }

    try {
        await window.firebaseConfig.deactivateNotification(notificationId);
        await loadNotifications();
    } catch (error) {
        console.error('Error deactivating notification:', error);
        alert('Error al desactivar notificación: ' + error.message);
    }
}

async function handleDeleteNotification(notificationId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta notificación? Esta acción no se puede deshacer.')) {
        return;
    }

    try {
        await window.firebaseConfig.deleteNotification(notificationId);
        await loadNotifications();
    } catch (error) {
        console.error('Error deleting notification:', error);
        alert('Error al eliminar notificación: ' + error.message);
    }
}

window.deactivateNotification = handleDeactivateNotification;
window.handleDeactivateNotification = handleDeactivateNotification;
window.handleDeleteNotification = handleDeleteNotification;
window.openCreateNotificationModal = openCreateNotificationModal;
window.closeCreateNotificationModal = closeCreateNotificationModal;

