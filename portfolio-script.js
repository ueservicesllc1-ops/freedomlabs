// Import Firebase functions
import { getProjects } from './firebase-config.js';

// Initialize AOS
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });
    
    // Load projects from Firebase
    loadProjectsFromFirebase();
    
    // Setup filter functionality
    setupFilters();
    
    // Setup animations
    setupAnimations();
});

// Load projects from Firestore
async function loadProjectsFromFirebase() {
    try {
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('./firebase-config.js');
        
        const projectsQuery = collection(db, 'projects');
        const projectsSnapshot = await getDocs(projectsQuery);
        
        if (projectsSnapshot.empty) {
            console.log('No projects found in Firestore, loading static projects');
            loadStaticProjects();
            return;
        }
        
        // Convert Firestore data to project format
        const projects = [];
        projectsSnapshot.forEach(doc => {
            const projectData = doc.data();
            projects.push({
                id: doc.id,
                title: projectData.title,
                description: projectData.description,
                category: projectData.category,
                technologies: projectData.technologies ? projectData.technologies.join(', ') : '',
                imageUrl: projectData.imageUrl || '',
                demoUrl: projectData.demoUrl || '',
                githubUrl: projectData.githubUrl || '',
                status: projectData.status || 'completed'
            });
        });
        
        // Sort by creation date (newest first)
        projects.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        
        displayProjects(projects);
    } catch (error) {
        console.error('Error loading projects from Firestore:', error);
        // Fallback to static projects if Firestore fails
        loadStaticProjects();
    }
}

// Fallback static projects
function loadStaticProjects() {
    const staticProjects = [
        {
            id: '1',
            title: 'E-Commerce Platform',
            description: 'Plataforma de comercio electrónico completa con sistema de pagos integrado y panel administrativo avanzado.',
            category: 'web',
            technologies: 'React, Node.js, MongoDB',
            imageUrl: '',
            demoUrl: '#',
            githubUrl: '#',
            status: 'completed'
        },
        {
            id: '2',
            title: 'Task Management App',
            description: 'Aplicación móvil para gestión de tareas con sincronización en tiempo real y colaboración en equipo.',
            category: 'mobile',
            technologies: 'React Native, Firebase, Redux',
            imageUrl: '',
            demoUrl: '#',
            githubUrl: '#',
            status: 'completed'
        },
        {
            id: '3',
            title: 'Analytics Dashboard',
            description: 'Dashboard de análisis de datos con visualizaciones interactivas y reportes automatizados.',
            category: 'dashboard',
            technologies: 'Vue.js, Express, PostgreSQL',
            imageUrl: '',
            demoUrl: '#',
            githubUrl: '#',
            status: 'completed'
        },
        {
            id: '4',
            title: 'Social Media App',
            description: 'Red social móvil con funcionalidades de chat, compartir contenido y geolocalización.',
            category: 'mobile',
            technologies: 'Flutter, Dart, Firebase',
            imageUrl: '',
            demoUrl: '#',
            githubUrl: '#',
            status: 'completed'
        },
        {
            id: '5',
            title: 'CMS Platform',
            description: 'Sistema de gestión de contenido moderno con editor visual y SEO optimizado.',
            category: 'web',
            technologies: 'Next.js, TypeScript, Prisma',
            imageUrl: '',
            demoUrl: '#',
            githubUrl: '#',
            status: 'completed'
        },
        {
            id: '6',
            title: 'Security Dashboard',
            description: 'Panel de seguridad empresarial con monitoreo en tiempo real y alertas automáticas.',
            category: 'dashboard',
            technologies: 'Angular, NestJS, MySQL',
            imageUrl: '',
            demoUrl: '#',
            githubUrl: '#',
            status: 'completed'
        }
    ];
    
    displayProjects(staticProjects);
}

// Display projects in grid
function displayProjects(projects) {
    const projectsGrid = document.getElementById('projectsGrid');
    if (!projectsGrid) return;

    projectsGrid.innerHTML = '';

    projects.forEach((project, index) => {
        const projectCard = createProjectCard(project, index);
        projectsGrid.appendChild(projectCard);
    });
}

// Create project card element
function createProjectCard(project, index) {
    const card = document.createElement('div');
    card.className = `project-card ${project.category}`;
    card.setAttribute('data-aos', 'fade-up');
    card.setAttribute('data-aos-delay', (index * 100).toString());
    
    const imageUrl = project.imageUrl || '';
    const technologies = project.technologies ? project.technologies.split(',').map(tech => tech.trim()) : [];
    
    card.innerHTML = `
        <div class="project-image">
            ${imageUrl ? `<img src="${imageUrl}" alt="${project.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">` : '<i class="fas fa-laptop-code project-placeholder"></i>'}
            <div class="project-overlay">
                <a href="${project.demoUrl || project.githubUrl || '#'}" class="project-link" target="_blank" rel="noopener">
                    <i class="fas fa-external-link-alt"></i>
                    Ver Proyecto
                </a>
            </div>
        </div>
        <div class="project-content">
            <div class="project-category">${getCategoryLabel(project.category)}</div>
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
        </div>
    `;
    
    return card;
}

// Get category label
function getCategoryLabel(category) {
    const labels = {
        'web': 'Desarrollo Web',
        'mobile': 'App Móvil',
        'ecommerce': 'E-Commerce',
        'dashboard': 'Dashboard',
        'other': 'Otro'
    };
    return labels[category] || 'Otro';
}

// Get status label
function getStatusLabel(status) {
    const labels = {
        'completed': 'Completado',
        'in-progress': 'En Progreso',
        'planning': 'Planificación'
    };
    return labels[status] || 'Completado';
}

// Setup filter functionality
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const filter = button.getAttribute('data-filter');

            projectCards.forEach(card => {
                if (filter === 'all' || card.classList.contains(filter)) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.5s ease-out';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Setup animations
function setupAnimations() {
    // GSAP animations
    gsap.registerPlugin(ScrollTrigger);

    // Hero animations
    gsap.timeline()
        .from('.hero-title', {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        })
        .from('.hero-subtitle', {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out'
        }, '-=0.5')
        .from('.hero-stats', {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out'
        }, '-=0.3');

    // Stats counter animation
    gsap.utils.toArray('.stat-number').forEach(stat => {
        const endValue = parseInt(stat.textContent);
        gsap.from(stat, {
            textContent: 0,
            duration: 2,
            ease: 'power2.out',
            snap: { textContent: 1 },
            scrollTrigger: {
                trigger: stat,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // Project cards hover effect removed for normal display
}

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
