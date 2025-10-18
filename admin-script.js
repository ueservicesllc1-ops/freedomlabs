// Import Firebase and Backblaze functions
import { 
    signIn, 
    logout, 
    onAuthChange, 
    addProject, 
    getProjects, 
    updateProject, 
    deleteProject as deleteProjectFromFirebase 
} from './firebase-config.js';
import { 
    uploadProjectImage, 
    uploadProjectFiles, 
    deleteFile 
} from './backblaze-config.js';

// DOM Elements
const loginModal = document.getElementById('loginModal');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const addProjectBtn = document.getElementById('addProjectBtn');
const projectModal = document.getElementById('projectModal');
const projectForm = document.getElementById('projectForm');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const notification = document.getElementById('notification');
const projectsGrid = document.getElementById('projectsGrid');

// State
let currentUser = null;
let currentProjectId = null;
let isEditing = false;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Check auth state
    onAuthChange((user) => {
        if (user) {
            currentUser = user;
            showDashboard();
            loadProjects();
        } else {
            showLogin();
        }
    });
    
    // Event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Add project
    addProjectBtn.addEventListener('click', () => openProjectModal());
    
    // Close modal
    closeModal.addEventListener('click', closeProjectModal);
    cancelBtn.addEventListener('click', closeProjectModal);
    
    // Project form
    projectForm.addEventListener('submit', handleProjectSubmit);
    
    // File uploads
    document.getElementById('projectImage').addEventListener('change', handleImagePreview);
    document.getElementById('projectFiles').addEventListener('change', handleFilesPreview);
    
    // Close modal on outside click
    projectModal.addEventListener('click', (e) => {
        if (e.target === projectModal) {
            closeProjectModal();
        }
    });
}

// Auth functions
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    showLoading();
    
    try {
        await signIn(email, password);
        showNotification('Inicio de sesión exitoso', 'success');
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Error al iniciar sesión: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function handleLogout() {
    try {
        await logout();
        showNotification('Sesión cerrada', 'info');
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Error al cerrar sesión', 'error');
    }
}

// UI functions
function showLogin() {
    loginModal.style.display = 'flex';
    adminDashboard.style.display = 'none';
}

function showDashboard() {
    loginModal.style.display = 'none';
    adminDashboard.style.display = 'block';
}

function showLoading() {
    loadingOverlay.classList.add('active');
}

function hideLoading() {
    loadingOverlay.classList.remove('active');
}

function showNotification(message, type = 'success') {
    const notificationElement = document.getElementById('notification');
    const textElement = document.getElementById('notificationText');
    
    // Update notification content
    textElement.textContent = message;
    
    // Update notification style based on type
    notificationElement.className = `notification ${type}`;
    notificationElement.style.background = type === 'success' ? '#10b981' : 
                                         type === 'error' ? '#ef4444' : 
                                         type === 'warning' ? '#f59e0b' : '#3b82f6';
    
    // Show notification
    notificationElement.classList.add('show');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        notificationElement.classList.remove('show');
    }, 5000);
}

// Project functions
async function loadProjects() {
    try {
        showLoading();
        const projects = await getProjects();
        displayProjects(projects);
    } catch (error) {
        console.error('Error loading projects:', error);
        showNotification('Error al cargar proyectos', 'error');
    } finally {
        hideLoading();
    }
}

function displayProjects(projects) {
    projectsGrid.innerHTML = '';
    
    if (projects.length === 0) {
        projectsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <h3>No hay proyectos</h3>
                <p>Comienza agregando tu primer proyecto</p>
            </div>
        `;
        return;
    }
    
    projects.forEach(project => {
        const projectCard = createProjectCard(project);
        projectsGrid.appendChild(projectCard);
    });
}

function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const imageUrl = project.imageUrl || '';
    const technologies = project.technologies ? project.technologies.split(',').map(tech => tech.trim()) : [];
    
    card.innerHTML = `
        <div class="project-image">
            ${imageUrl ? `<img src="${imageUrl}" alt="${project.title}">` : '<i class="fas fa-image"></i>'}
        </div>
        <h3 class="project-title">${project.title}</h3>
        <p class="project-description">${project.description}</p>
        <div class="project-tech">
            ${technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
        </div>
        <div class="project-actions">
            <button class="btn-edit" onclick="editProject('${project.id}')">
                <i class="fas fa-edit"></i>
                Editar
            </button>
            <button class="btn-delete" onclick="deleteProject('${project.id}')">
                <i class="fas fa-trash"></i>
                Eliminar
            </button>
        </div>
    `;
    
    return card;
}

// Modal functions
function openProjectModal(projectId = null) {
    currentProjectId = projectId;
    isEditing = !!projectId;
    
    const modalTitle = document.getElementById('modalTitle');
    const saveBtn = document.getElementById('saveBtn');
    
    if (isEditing) {
        modalTitle.textContent = 'Editar Proyecto';
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Proyecto';
        loadProjectData(projectId);
    } else {
        modalTitle.textContent = 'Nuevo Proyecto';
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Proyecto';
        projectForm.reset();
        clearPreviews();
    }
    
    projectModal.classList.add('active');
}

function closeProjectModal() {
    projectModal.classList.remove('active');
    currentProjectId = null;
    isEditing = false;
    projectForm.reset();
    clearPreviews();
}

async function loadProjectData(projectId) {
    try {
        const projects = await getProjects();
        const project = projects.find(p => p.id === projectId);
        
        if (project) {
            document.getElementById('projectTitle').value = project.title || '';
            document.getElementById('projectCategory').value = project.category || 'web';
            document.getElementById('projectDescription').value = project.description || '';
            document.getElementById('projectTech').value = project.technologies || '';
            document.getElementById('projectStatus').value = project.status || 'completed';
            document.getElementById('projectDemo').value = project.demoUrl || '';
            document.getElementById('projectGithub').value = project.githubUrl || '';
            
            // Show existing image if available
            if (project.imageUrl) {
                showImagePreview(project.imageUrl);
            }
        }
    } catch (error) {
        console.error('Error loading project data:', error);
        showNotification('Error al cargar datos del proyecto', 'error');
    }
}

// Form handling
async function handleProjectSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(projectForm);
    const projectData = {
        title: formData.get('title'),
        category: formData.get('category'),
        description: formData.get('description'),
        technologies: formData.get('technologies'),
        status: formData.get('status'),
        demoUrl: formData.get('demoUrl'),
        githubUrl: formData.get('githubUrl')
    };
    
    try {
        showLoading();
        
        // Handle image upload
        const imageFile = document.getElementById('projectImage').files[0];
        if (imageFile) {
            const imageResult = await uploadProjectImage(imageFile, currentProjectId || 'temp');
            if (imageResult.success) {
                projectData.imageUrl = imageResult.url;
            }
        }
        
        // Handle additional files
        const files = document.getElementById('projectFiles').files;
        if (files.length > 0) {
            const filesResult = await uploadProjectFiles(Array.from(files), currentProjectId || 'temp');
            projectData.files = filesResult.map(result => result.success ? result.url : null).filter(Boolean);
        }
        
        if (isEditing) {
            await updateProject(currentProjectId, projectData);
            showNotification('Proyecto actualizado exitosamente', 'success');
        } else {
            await addProject(projectData);
            showNotification('Proyecto creado exitosamente', 'success');
        }
        
        closeProjectModal();
        loadProjects();
        
    } catch (error) {
        console.error('Error saving project:', error);
        showNotification('Error al guardar proyecto: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// File handling
function handleImagePreview(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => showImagePreview(e.target.result);
        reader.readAsDataURL(file);
    }
}

function showImagePreview(imageUrl) {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = `
        <div class="preview-item">
            <img src="${imageUrl}" alt="Preview">
            <button class="remove-file" onclick="clearImagePreview()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
}

function clearImagePreview() {
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('projectImage').value = '';
}

function handleFilesPreview(e) {
    const files = Array.from(e.target.files);
    const preview = document.getElementById('filesPreview');
    
    preview.innerHTML = files.map((file, index) => `
        <div class="preview-item">
            <span>${file.name}</span>
            <button class="remove-file" onclick="removeFile(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function removeFile(index) {
    const input = document.getElementById('projectFiles');
    const dt = new DataTransfer();
    const files = Array.from(input.files);
    
    files.splice(index, 1);
    files.forEach(file => dt.items.add(file));
    input.files = dt.files;
    
    handleFilesPreview({ target: { files: input.files } });
}

function clearPreviews() {
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('filesPreview').innerHTML = '';
}

// Project actions
async function editProject(projectId) {
    openProjectModal(projectId);
}

async function deleteProject(projectId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
        return;
    }
    
    try {
        showLoading();
        await deleteProjectFromFirebase(projectId);
        showNotification('Proyecto eliminado exitosamente', 'success');
        loadProjects();
    } catch (error) {
        console.error('Error deleting project:', error);
        showNotification('Error al eliminar proyecto', 'error');
    } finally {
        hideLoading();
    }
}

// Make functions globally available
window.editProject = editProject;
window.deleteProject = deleteProject;
window.clearImagePreview = clearImagePreview;
window.removeFile = removeFile;
