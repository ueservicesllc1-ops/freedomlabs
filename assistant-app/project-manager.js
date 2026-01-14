// Project Manager Functionality Module
// Handles task management, team oversight, and project creation for Project Managers

class ProjectManagerModule {
    constructor(userId, firebaseConfig) {
        this.userId = userId;
        this.firebase = firebaseConfig;
        this.db = firebaseConfig.db;
        this.currentTeam = [];
        this.currentTasks = [];
        this.currentEditingTask = null;
    }

    // Initialize the module based on user role
    async initialize() {
        const userRole = await this.getUserRole();
        if (userRole !== 'project_manager') {
            // Hide PM navigation
            const pmNav = document.getElementById('projectManagerNav');
            if (pmNav) pmNav.style.display = 'none';
            return false;
        }

        // Show PM navigation
        const pmNav = document.getElementById('projectManagerNav');
        if (pmNav) pmNav.style.display = 'block';

        // Setup event listeners
        this.setupEventListeners();

        console.log('Project Manager module initialized');
        return true;
    }

    async getUserRole() {
        try {
            const assistantsRef = this.db.collection('assistants');
            const q = assistantsRef.where('userId', '==', this.userId);
            const querySnapshot = await q.get();

            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data();
                return userData.role;
            }
            return null;
        } catch (error) {
            console.error('Error getting user role:', error);
            return null;
        }
    }

    setupEventListeners() {
        // Create task button
        const createTaskBtn = document.getElementById('createTaskBtn');
        if (createTaskBtn) {
            createTaskBtn.addEventListener('click', () => this.openTaskModal());
        }

        // Task form submit
        const taskForm = document.getElementById('taskForm');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => this.handleTaskSubmit(e));
        }

        // Task modal close
        const closeTaskModal = document.getElementById('closeTaskModal');
        const cancelTaskBtn = document.getElementById('cancelTaskBtn');
        if (closeTaskModal) {
            closeTaskModal.addEventListener('click', () => this.closeTaskModal());
        }
        if (cancelTaskBtn) {
            cancelTaskBtn.addEventListener('click', () => this.closeTaskModal());
        }

        // PM Create Project Form
        const pmCreateProjectForm = document.getElementById('pmCreateProjectForm');
        if (pmCreateProjectForm) {
            pmCreateProjectForm.addEventListener('submit', (e) => this.handleCreateProject(e));
        }
    }

    // Task Management
    async openTaskModal(task = null) {
        this.currentEditingTask = task;

        const modal = document.getElementById('taskModal');
        const modalTitle = document.getElementById('taskModalTitle');

        if (task) {
            modalTitle.textContent = 'Editar Tarea';
            // Populate form with task data
            document.getElementById('taskName').value = task.name || '';
            document.getElementById('taskType').value = task.type || 'HISTORIA';
            document.getElementById('taskDetails').value = task.details || '';
            document.getElementById('taskAssignee').value = task.assigneeUserId || '';
            document.getElementById('taskStatus').value = task.status || 'diseño';
            document.getElementById('taskDueDate').value = task.dueDate || '';
            document.getElementById('taskPriority').value = task.priority || 'media';
            document.getElementById('taskProject').value = task.projectId || '';
        } else {
            modalTitle.textContent = 'Nueva Tarea';
            document.getElementById('taskForm').reset();
        }

        // Load team members for assignment
        await this.loadTeamMembersForTask();

        // Load projects for task
        await this.loadProjectsForTask();

        modal.style.display = 'flex';
    }

    closeTaskModal() {
        const modal = document.getElementById('taskModal');
        modal.style.display = 'none';
        this.currentEditingTask = null;
        document.getElementById('taskForm').reset();
        const errorDiv = document.getElementById('taskError');
        const successDiv = document.getElementById('taskSuccess');
        if (errorDiv) errorDiv.classList.remove('show');
        if (successDiv) successDiv.classList.remove('show');
    }

    async loadTeamMembersForTask() {
        try {
            const team = await this.getTeamMembers();
            const assigneeSelect = document.getElementById('taskAssignee');

            assigneeSelect.innerHTML = '<option value="">Seleccionar miembro...</option>';
            team.forEach(member => {
                const option = document.createElement('option');
                option.value = member.userId;
                option.textContent = `${member.name || member.username || member.email} (${this.getRoleDisplayName(member.role)})`;
                assigneeSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading team members:', error);
        }
    }

    async loadProjectsForTask() {
        try {
            const projects = await this.firebase.getAllProjects();
            const projectSelect = document.getElementById('taskProject');

            projectSelect.innerHTML = '<option value="">Sin proyecto específico</option>';
            projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = project.name;
                projectSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }

    async handleTaskSubmit(e) {
        e.preventDefault();

        const errorDiv = document.getElementById('taskError');
        const successDiv = document.getElementById('taskSuccess');

        errorDiv.classList.remove('show');
        successDiv.classList.remove('show');

        const taskData = {
            name: document.getElementById('taskName').value.trim(),
            type: document.getElementById('taskType').value,
            details: document.getElementById('taskDetails').value.trim(),
            assigneeUserId: document.getElementById('taskAssignee').value,
            status: document.getElementById('taskStatus').value,
            dueDate: document.getElementById('taskDueDate').value,
            priority: document.getElementById('taskPriority').value,
            projectId: document.getElementById('taskProject').value || null,
            createdBy: this.userId,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

            if (this.currentEditingTask) {
                // Update existing task
                await this.db.collection('tasks').doc(this.currentEditingTask.id).update(taskData);
                successDiv.textContent = 'Tarea actualizada exitosamente';
            } else {
                // Create new task
                taskData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                const taskRef = await this.db.collection('tasks').add(taskData);
                successDiv.textContent = 'Tarea creada exitosamente';

                // Send notification to assigned user
                if (taskData.assigneeUserId) {
                    try {
                        const dueDate = taskData.dueDate ? new Date(taskData.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Sin fecha límite';
                        const priorityLabel = taskData.priority.charAt(0).toUpperCase() + taskData.priority.slice(1);

                        await this.db.collection('notifications').add({
                            userId: taskData.assigneeUserId,
                            type: 'task_assigned',
                            title: 'Nueva tarea asignada: ' + taskData.name,
                            message: `Se te ha asignado la tarea "${taskData.name}"\n\nTipo: ${taskData.type}\nPrioridad: ${priorityLabel}\nFecha de entrega: ${dueDate}\n\n${taskData.details || ''}`,
                            taskId: taskRef.id,
                            taskName: taskData.name,
                            taskType: taskData.type,
                            taskPriority: taskData.priority,
                            taskDueDate: taskData.dueDate,
                            projectId: taskData.projectId,
                            read: false,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                        console.log('Notification sent to user:', taskData.assigneeUserId);
                    } catch (notifError) {
                        console.error('Error sending notification:', notifError);
                    }
                }
            }

            successDiv.classList.add('show');

            // Reload tasks
            await this.loadTasks();

            // Close modal after success
            setTimeout(() => {
                this.closeTaskModal();
            }, 1500);

        } catch (error) {
            console.error('Error saving task:', error);
            errorDiv.textContent = 'Error al guardar la tarea: ' + error.message;
            errorDiv.classList.add('show');
        } finally {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Tarea';
        }
    }

    async loadTasks() {
        try {
            const tasksList = document.getElementById('tasksList');
            if (!tasksList) return;

            tasksList.innerHTML = '<div class="loading-message">Cargando tareas...</div>';

            // Get all tasks created by this PM
            // Get all tasks created by this PM
            const tasksRef = this.db.collection('tasks');
            // FIX: Removed .orderBy('updatedAt', 'desc') to avoid composite index requirement
            const q = tasksRef.where('createdBy', '==', this.userId);
            const querySnapshot = await q.get();

            const tasks = [];
            querySnapshot.forEach(doc => {
                tasks.push({ id: doc.id, ...doc.data() });
            });

            // Sort by updatedAt descending (client-side)
            tasks.sort((a, b) => {
                const timeA = a.updatedAt?.seconds || 0;
                const timeB = b.updatedAt?.seconds || 0;
                return timeB - timeA;
            });

            this.currentTasks = tasks;

            if (tasks.length === 0) {
                tasksList.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 40px;">No has creado tareas aún</p>';
                return;
            }

            // Group tasks by status
            const tasksByStatus = {
                'diseño': [],
                'contenido': [],
                'corrección': [],
                'aprobación': [],
                'pausado': [],
                'completado': []
            };

            tasks.forEach(task => {
                const status = task.status || 'diseño';
                if (!tasksByStatus[status]) tasksByStatus[status] = [];
                tasksByStatus[status].push(task);
            });

            // Render tasks by status
            let html = '<div class="tasks-board" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px;">';

            const statusNames = {
                'diseño': 'Diseño',
                'contenido': 'Contenido',
                'corrección': 'Corrección',
                'aprobación': 'Aprobación',
                'pausado': 'Pausado',
                'completado': 'Completado'
            };

            const statusColors = {
                'diseño': '#f59e0b',
                'contenido': '#3b82f6',
                'corrección': '#ef4444',
                'aprobación': '#8b5cf6',
                'pausado': '#64748b',
                'completado': '#10b981'
            };

            Object.keys(tasksByStatus).forEach(status => {
                const statusTasks = tasksByStatus[status];
                const color = statusColors[status] || '#6b7280';

                html += `
                    <div class="status-column" style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 15px; border: 1px solid rgba(255,255,255,0.1);">
                        <h3 style="color: ${color}; font-size: 16px; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                            <span>${statusNames[status]}</span>
                            <span style="background: ${color}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">${statusTasks.length}</span>
                        </h3>
                        <div class="tasks-column-content">
                `;

                if (statusTasks.length === 0) {
                    html += '<p style="color: rgba(255,255,255,0.3); font-size: 13px; text-align: center; padding: 20px 0;">Sin tareas</p>';
                } else {
                    statusTasks.forEach(task => {
                        html += this.renderTaskCard(task);
                    });
                }

                html += '</div></div>';
            });

            html += '</div>';

            tasksList.innerHTML = html;

            // Add click listeners to task cards
            document.querySelectorAll('.task-card').forEach(card => {
                card.addEventListener('click', async (e) => {
                    if (!e.target.closest('.task-action-btn')) {
                        const taskId = card.dataset.taskId;
                        const task = tasks.find(t => t.id === taskId);
                        if (task) {
                            await this.openTaskModal(task);
                        }
                    }
                });
            });

            // Add click listeners to delete buttons
            document.querySelectorAll('.delete-task-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const taskId = btn.dataset.taskId;
                    if (confirm('¿Estás seguro de eliminar esta tarea?')) {
                        await this.deleteTask(taskId);
                    }
                });
            });

        } catch (error) {
            console.error('Error loading tasks:', error);
            const tasksList = document.getElementById('tasksList');
            if (tasksList) {
                tasksList.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px;">Error al cargar tareas: ${error.message}</p>`;
            }
        }
    }

    renderTaskCard(task) {
        const priorityColors = {
            'baja': '#10b981',
            'media': '#f59e0b',
            'alta': '#ef4444',
            'urgente': '#dc2626'
        };

        const priorityColor = priorityColors[task.priority] || '#6b7280';

        // Format due date
        let dueDateHtml = '';
        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isOverdue = dueDate < today && task.status !== 'completado';

            dueDateHtml = `
                <div style="display: flex; align-items: center; gap: 5px; font-size: 11px; ${isOverdue ? 'color: #ef4444;' : 'color: rgba(255,255,255,0.6);'}">
                    <i class="fas fa-calendar"></i>
                    <span>${dueDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}</span>
                    ${isOverdue ? '<span style="color: #ef4444; font-weight: 600;">⚠ Vencida</span>' : ''}
                </div>
            `;
        }

        return `
            <div class="task-card" data-task-id="${task.id}" style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 12px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s; border: 1px solid rgba(255,255,255,0.05);" 
                onmouseover="this.style.background='rgba(255,255,255,0.08)'; this.style.borderColor='rgba(255,255,255,0.15)';" 
                onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='rgba(255,255,255,0.05)';">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <h4 style="color: white; font-size: 14px; margin: 0; flex: 1;">${task.name}</h4>
                    <button class="task-action-btn delete-task-btn" data-task-id="${task.id}" style="background: #ef4444; border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div style="display: flex; gap: 5px; margin-bottom: 8px;">
                    <span style="background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 2px 8px; border-radius: 4px; font-size: 10px;">${task.type}</span>
                    <span style="background: ${priorityColor}20; color: ${priorityColor}; padding: 2px 8px; border-radius: 4px; font-size: 10px;">${task.priority}</span>
                </div>
                ${task.details ? `<p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 8px 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${task.details}</p>` : ''}
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                    ${dueDateHtml}
                    <div style="font-size: 11px; color: rgba(255,255,255,0.5);">
                        <i class="fas fa-user"></i> ${task.assigneeUserId ? 'Asignada' : 'Sin asignar'}
                    </div>
                </div>
            </div>
        `;
    }

    async deleteTask(taskId) {
        try {
            await this.db.collection('tasks').doc(taskId).delete();
            await this.loadTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Error al eliminar la tarea: ' + error.message);
        }
    }

    // Team Management
    async getTeamMembers() {
        try {
            const assistantsRef = this.db.collection('assistants');
            // Get all assistants except project managers and admins
            const querySnapshot = await assistantsRef.get();

            const team = [];
            querySnapshot.forEach(doc => {
                const data = doc.data();
                // Include all users except other project managers
                if (data.role !== 'project_manager' && data.userId !== this.userId) {
                    team.push({ id: doc.id, ...data });
                }
            });

            this.currentTeam = team;
            return team;
        } catch (error) {
            console.error('Error getting team members:', error);
            return [];
        }
    }

    async loadTeamView() {
        try {
            const teamList = document.getElementById('teamList');
            if (!teamList) return;

            teamList.innerHTML = '<div class="loading-message">Cargando equipo...</div>';

            const team = await this.getTeamMembers();

            if (team.length === 0) {
                teamList.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 40px;">No hay miembros en tu equipo</p>';
                return;
            }

            const html = team.map(member => this.renderTeamMemberCard(member)).join('');
            teamList.innerHTML = html;

        } catch (error) {
            console.error('Error loading team:', error);
            const teamList = document.getElementById('teamList');
            if (teamList) {
                teamList.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px;">Error al cargar equipo: ${error.message}</p>`;
            }
        }
    }

    renderTeamMemberCard(member) {
        const isOnline = member.isOnline === true || member.isOnline === 'true' || member.isOnline === 1;

        return `
            <div class="team-member-card" style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.1);">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: 600;">
                        ${(member.name || member.username || member.email).charAt(0).toUpperCase()}
                    </div>
                    <div style="flex: 1;">
                        <h3 style="color: white; font-size: 16px; margin: 0 0 4px 0;">${member.name || member.username || member.email}</h3>
                        <p style="color: rgba(255,255,255,0.6); font-size: 13px; margin: 0;">${this.getRoleDisplayName(member.role)}</p>
                    </div>
                    <div class="status-badge ${isOnline ? 'online' : 'offline'}" style="padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;">
                        <i class="fas fa-circle" style="font-size: 8px;"></i>
                        ${isOnline ? 'Online' : 'Offline'}
                    </div>
                </div>
                <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: rgba(255,255,255,0.6); font-size: 12px;">Email:</span>
                        <span style="color: white; font-size: 12px;">${member.email}</span>
                    </div>
                    ${member.username ? `
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: rgba(255,255,255,0.6); font-size: 12px;">Usuario:</span>
                        <span style="color: white; font-size: 12px;">${member.username}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    getRoleDisplayName(role) {
        const roleNames = {
            'designer': 'Diseñador Gráfico',
            'community_manager': 'Community Manager',
            'digitizer': 'Digitador',
            'videografo': 'Videógrafo',
            'desarrollador': 'Desarrollador',
            'project_manager': 'Project Manager'
        };
        return roleNames[role] || role || 'Sin rol';
    }

    // Project Creation (PM can create projects)
    async handleCreateProject(e) {
        e.preventDefault();

        const errorDiv = document.getElementById('pmCreateProjectError');
        const successDiv = document.getElementById('pmCreateProjectSuccess');

        errorDiv.classList.remove('show');
        successDiv.classList.remove('show');

        const name = document.getElementById('pmProjectName').value.trim();
        const description = document.getElementById('pmProjectDescription').value.trim();
        const driveFolderUrl = document.getElementById('pmProjectDriveFolder').value.trim();

        // Get selected assistants
        const assignedCheckboxes = e.target.querySelectorAll('input[name="pmAssignedAssistants"]:checked');
        const assignedAssistants = Array.from(assignedCheckboxes).map(cb => cb.value);

        if (!name) {
            errorDiv.textContent = 'Por favor ingresa un nombre para el proyecto';
            errorDiv.classList.add('show');
            return;
        }

        try {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando proyecto...';

            // Create project in Firestore
            const result = await this.firebase.createProject(name, description, assignedAssistants, [], driveFolderUrl);

            successDiv.textContent = 'Proyecto creado exitosamente';
            successDiv.classList.add('show');

            // Reset form
            e.target.reset();

            // Reload all projects view if available
            await this.loadAllProjects();

        } catch (error) {
            console.error('Error creating project:', error);
            errorDiv.textContent = 'Error al crear proyecto: ' + error.message;
            errorDiv.classList.add('show');
        } finally {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Crear Proyecto';
        }
    }

    async loadCreateProjectView() {
        try {
            const team = await this.getTeamMembers();
            const assistantsList = document.getElementById('pmAssistantsCheckboxList');

            if (!assistantsList) return;

            if (team.length === 0) {
                assistantsList.innerHTML = '<p style="color: rgba(255,255,255,0.5);">No hay miembros disponibles</p>';
            } else {
                assistantsList.innerHTML = team.map(assistant => `
                    <label style="display: flex; align-items: center; gap: 10px; padding: 8px; cursor: pointer; border-radius: 6px; margin-bottom: 5px; transition: background 0.2s;" 
                           onmouseover="this.style.background='rgba(255,255,255,0.05)'" 
                           onmouseout="this.style.background='transparent'">
                        <input type="checkbox" value="${assistant.userId}" name="pmAssignedAssistants" style="cursor: pointer;">
                        <span style="color: white;">${assistant.name || assistant.username || assistant.email}</span>
                        <span style="font-size: 11px; color: rgba(255,255,255,0.5);">(${this.getRoleDisplayName(assistant.role)})</span>
                    </label>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading create project view:', error);
        }
    }

    async loadAllProjects() {
        try {
            const projectsList = document.getElementById('allProjectsList');
            if (!projectsList) return;

            projectsList.innerHTML = '<div class="loading-message">Cargando proyectos...</div>';

            const projects = await this.firebase.getAllProjects();

            if (projects.length === 0) {
                projectsList.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 40px;">No hay proyectos</p>';
                return;
            }

            const html = projects.map(project => this.renderProjectCard(project)).join('');
            projectsList.innerHTML = html;

        } catch (error) {
            console.error('Error loading all projects:', error);
            const projectsList = document.getElementById('allProjectsList');
            if (projectsList) {
                projectsList.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 20px;">Error al cargar proyectos: ${error.message}</p>`;
            }
        }
    }

    renderProjectCard(project) {
        return `
            <div class="project-card" style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.1); transition: all 0.2s; cursor: pointer;" 
                 onmouseover="this.style.background='rgba(255,255,255,0.08)'; this.style.borderColor='rgba(255,255,255,0.2)';" 
                 onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='rgba(255,255,255,0.1)';">
                <h3 style="color: white; font-size: 18px; margin: 0 0 10px 0;">${project.name || 'Sin nombre'}</h3>
                <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 15px 0; line-height: 1.6;">${project.description || 'Sin descripción'}</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #4ade80; font-size: 12px; font-weight: 600;">
                        <i class="fas fa-circle" style="font-size: 8px;"></i> ${project.status || 'Activo'}
                    </span>
                    <span style="color: rgba(255,255,255,0.5); font-size: 12px;">
                        <i class="fas fa-users"></i> ${project.assignedAssistants?.length || 0} miembros
                    </span>
                </div>
            </div>
        `;
    }
}

// Export for use in app.js
window.ProjectManagerModule = ProjectManagerModule;
