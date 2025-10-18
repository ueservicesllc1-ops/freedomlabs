// Import Firebase functions
import { getProjects } from './firebase-config.js';

console.log('Script.js loaded successfully');

// Matrix Rain Effect - Canvas Implementation
function initMatrixRain() {
    console.log('Initializing Matrix Rain Canvas...');
    
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) {
        console.error('Matrix canvas not found!');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Ajusta el tamaño del canvas a la ventana
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    
    // Caracteres Matrix auténticos (katakana, números, letras)
    const matrixChars = "アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
    
    const fontSize = 18;
    const columns = canvas.width / fontSize;
    
    // Arreglo para las posiciones de caída
    const drops = Array(Math.floor(columns)).fill(1);
    
    function draw() {
        // Fondo negro para efecto Matrix
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Color verde Matrix
        ctx.fillStyle = "#00FF00";
        ctx.font = fontSize + "px monospace";
        
        // Dibujar caracteres
        for (let i = 0; i < drops.length; i++) {
            const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            // Reinicia la caída de una columna de vez en cuando
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    // Iniciar animación
    setInterval(draw, 60); // 60ms
    
    // Redimensionar canvas si cambia el tamaño de ventana
    window.addEventListener('resize', () => {
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
    });
    
    console.log('Matrix Rain Canvas initialized successfully');
}

// Initialize AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Check authentication status
    checkAuthStatus();
    
    // Initialize Matrix Rain first
    initMatrixRain();
    
    // Start the sequence: Matrix -> Logo -> Full Page
    startMatrixSequence();
    
    // Also show content immediately if user clicks anywhere
    document.addEventListener('click', function() {
        const pageContent = document.querySelector('.page-content');
        if (pageContent && !pageContent.classList.contains('show')) {
            pageContent.classList.add('show');
            console.log('Page content shown by user click');
        }
    });
    
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });
    
    // Load projects from Firebase
    loadProjectsFromFirebase();
});

// Matrix to Page Sequence
function startMatrixSequence() {
    // Start the timer immediately
    startMatrixTimer();
    
    // Wait 8 seconds with Matrix full screen
    setTimeout(() => {
        // Fade Matrix to background
        const canvas = document.getElementById('matrix-canvas');
        if (canvas) {
            canvas.classList.add('fade-to-background');
        }
        
        // Show page content
        const pageContent = document.querySelector('.page-content');
        if (pageContent) {
            pageContent.classList.add('show');
            console.log('Page content shown successfully');
        } else {
            console.error('Page content not found');
        }
        
        console.log('Matrix faded to background, page content shown');
    }, 3000);
}

// Matrix Timer Functions
function startMatrixTimer() {
    let seconds = 0;
    
    // Update timer every second
    const timerInterval = setInterval(() => {
        seconds++;
        updateTimerDisplay(seconds);
        updateAnalogClock(seconds);
    }, 1000);
}

function updateTimerDisplay(seconds) {
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        timerDisplay.textContent = timeString;
    }
}

function updateAnalogClock(seconds) {
    const hourHand = document.getElementById('hourHand');
    const minuteHand = document.getElementById('minuteHand');
    const secondHand = document.getElementById('secondHand');
    
    if (secondHand) {
        // Second hand rotates 6 degrees per second
        const secondRotation = (seconds % 60) * 6;
        secondHand.style.transform = `rotate(${secondRotation}deg)`;
    }
    
    if (minuteHand) {
        // Minute hand rotates 0.1 degrees per second
        const minuteRotation = (seconds % 3600) * 0.1;
        minuteHand.style.transform = `rotate(${minuteRotation}deg)`;
    }
    
    if (hourHand) {
        // Hour hand rotates 0.0083 degrees per second (30 degrees per hour)
        const hourRotation = (seconds % 43200) * 0.0083;
        hourHand.style.transform = `rotate(${hourRotation}deg)`;
    }
}

// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

// Hero animations
gsap.timeline()
    .from('.hero-title .title-line', {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.3,
        ease: 'power3.out'
    })
    .from('.hero-subtitle', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
    }, '-=0.5')
    .from('.hero-buttons', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
    }, '-=0.3');

// Floating shapes animation
gsap.to('.shape', {
    y: -20,
    rotation: 360,
    duration: 6,
    ease: 'sine.inOut',
    stagger: 1,
    repeat: -1,
    yoyo: true
});

// Project cards hover effect
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        gsap.to(this, {
            scale: 1.05,
            duration: 0.3,
            ease: 'power2.out'
        });
    });
    
    card.addEventListener('mouseleave', function() {
        gsap.to(this, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
        });
    });
});

// Service cards animation
gsap.from('.service-card', {
    scrollTrigger: {
        trigger: '.services',
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power2.out'
});

// Parallax effect for hero background
gsap.to('.floating-shapes', {
    scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
    },
    y: -100,
    ease: 'none'
});

// Text reveal animation
gsap.utils.toArray('.section-title, .section-subtitle').forEach(element => {
    gsap.from(element, {
        scrollTrigger: {
            trigger: element,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
    });
});

// Form animations
document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('focus', function() {
        gsap.to(this, {
            scale: 1.02,
            duration: 0.3,
            ease: 'power2.out'
        });
    });
    
    input.addEventListener('blur', function() {
        gsap.to(this, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
        });
    });
});

// Button hover effects
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
    button.addEventListener('mouseenter', function() {
        gsap.to(this, {
            scale: 1.05,
            duration: 0.3,
            ease: 'power2.out'
        });
    });
    
    button.addEventListener('mouseleave', function() {
        gsap.to(this, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
        });
    });
});

// Smooth scrolling functions
function scrollToProjects() {
    document.getElementById('projects').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function scrollToContact() {
    window.location.href = 'contacto.html';
}

// Form submission
document.querySelector('.form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const name = this.querySelector('input[type="text"]').value;
    const email = this.querySelector('input[type="email"]').value;
    const message = this.querySelector('textarea').value;
    
    // Simple validation
    if (!name || !email || !message) {
        showNotification('Por favor, completa todos los campos', 'error');
        return;
    }
    
    // Simulate form submission
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showNotification('¡Mensaje enviado correctamente! Te contactaremos pronto.', 'success');
        this.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
});

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
        top: 2rem;
        right: 2rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    gsap.to(notification, {
        x: 0,
        duration: 0.5,
        ease: 'power2.out'
    });
    
    // Auto remove
    setTimeout(() => {
        gsap.to(notification, {
            x: '100%',
            duration: 0.5,
            ease: 'power2.in',
            onComplete: () => notification.remove()
        });
    }, 5000);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.project-card, .service-card').forEach(el => {
    observer.observe(el);
});

// Mouse cursor effect
document.addEventListener('mousemove', function(e) {
    const cursor = document.querySelector('.cursor');
    if (!cursor) {
        const newCursor = document.createElement('div');
        newCursor.className = 'cursor';
        newCursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: rgba(99, 102, 241, 0.3);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.1s ease;
        `;
        document.body.appendChild(newCursor);
    }
    
    gsap.to('.cursor', {
        x: e.clientX - 10,
        y: e.clientY - 10,
        duration: 0.1,
        ease: 'power2.out'
    });
});

// Add cursor hover effects
document.querySelectorAll('a, button, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
        gsap.to('.cursor', {
            scale: 2,
            duration: 0.3,
            ease: 'power2.out'
        });
    });
    
    el.addEventListener('mouseleave', () => {
        gsap.to('.cursor', {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
        });
    });
});

// Loading animation
window.addEventListener('load', function() {
    gsap.from('body', {
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
    });
});

// Scroll progress indicator
const progressBar = document.createElement('div');
progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background: linear-gradient(90deg, #6366f1, #8b5cf6);
    z-index: 1000;
    transition: width 0.1s ease;
`;
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.offsetHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    progressBar.style.width = scrollPercent + '%';
});

// Add some interactive particles
function createParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particles';
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
    `;
    document.querySelector('.hero').appendChild(particleContainer);
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
        `;
        particleContainer.appendChild(particle);
        
        gsap.to(particle, {
            y: -100,
            opacity: 0,
            duration: Math.random() * 3 + 2,
            repeat: -1,
            delay: Math.random() * 2,
            ease: 'none'
        });
    }
}

// Initialize particles
createParticles();

// Add smooth reveal animations for text
gsap.utils.toArray('p, h1, h2, h3').forEach(element => {
    gsap.from(element, {
        scrollTrigger: {
            trigger: element,
            start: 'top 90%',
            toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
    });
});

// Performance optimization: throttle scroll events
let ticking = false;

function updateScrollEffects() {
    // Update any scroll-based animations here
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(updateScrollEffects);
        ticking = true;
    }
});

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Close any open modals or overlays
        document.querySelectorAll('.modal, .overlay').forEach(el => {
            el.style.display = 'none';
        });
    }
});

// Add touch gestures for mobile
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', function(e) {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe up - scroll down
            window.scrollBy(0, window.innerHeight);
        } else {
            // Swipe down - scroll up
            window.scrollBy(0, -window.innerHeight);
        }
    }
}

// Load projects from Firebase
async function loadProjectsFromFirebase() {
    try {
        const projects = await getProjects();
        updateProjectsDisplay(projects);
    } catch (error) {
        console.error('Error loading projects from Firebase:', error);
        // Fallback to static projects if Firebase fails
    }
}

// Update projects display with Firebase data
function updateProjectsDisplay(projects) {
    const projectsGrid = document.querySelector('.projects-grid');
    if (!projectsGrid) return;

    // Clear existing projects
    projectsGrid.innerHTML = '';

    projects.forEach(project => {
        const projectCard = createProjectCard(project);
        projectsGrid.appendChild(projectCard);
    });
}

// Create project card element
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('data-aos', 'fade-up');
    
    const imageUrl = project.imageUrl || '';
    const technologies = project.technologies ? 
        (Array.isArray(project.technologies) ? project.technologies : project.technologies.split(',').map(tech => tech.trim())) : 
        [];
    
    card.innerHTML = `
        <div class="project-image">
            ${imageUrl ? `<img src="${imageUrl}" alt="${project.title}" loading="lazy">` : '<i class="fas fa-laptop-code"></i>'}
            <div class="project-overlay">
                <div class="project-tech">
                    ${technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
            </div>
        </div>
        <div class="project-content">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-links">
                ${project.demoUrl ? `
                    <a href="${project.demoUrl}" class="project-link" target="_blank" rel="noopener">
                        <i class="fas fa-external-link-alt"></i>
                        Ver Demo
                    </a>
                ` : ''}
                ${project.githubUrl ? `
                    <a href="${project.githubUrl}" class="project-link" target="_blank" rel="noopener">
                        <i class="fab fa-github"></i>
                        Código
                    </a>
                ` : ''}
            </div>
        </div>
    `;
    
    return card;
}

// Auth Modal Functions - Make them global
window.openLoginModal = function() {
    console.log('Opening login modal...');
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('Login modal opened');
    } else {
        console.error('Login modal not found');
    }
}

window.closeLoginModal = function() {
    console.log('Closing login modal...');
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        console.log('Login modal closed');
    }
}

window.openRegisterModal = function() {
    console.log('Opening register modal...');
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('Register modal opened');
    } else {
        console.error('Register modal not found');
    }
}

window.closeRegisterModal = function() {
    console.log('Closing register modal...');
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        console.log('Register modal closed');
    }
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('auth-modal')) {
        closeLoginModal();
        closeRegisterModal();
    }
});

// Close modals with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeLoginModal();
        closeRegisterModal();
    }
});

// Login form handler
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            try {
                // Import Firebase auth functions
                const { signIn } = await import('./firebase-config.js');
                await signIn(email, password);
                
                // Show success message
                showNotification('¡Inicio de sesión exitoso!', 'success');
                closeLoginModal();
                
                // Save user data to localStorage
                const user = {
                    name: 'Cliente',
                    email: email,
                    loginTime: new Date().toISOString()
                };
                localStorage.setItem('user', JSON.stringify(user));
                
                // Update UI to show user info
                checkAuthStatus();
                
                // Check admin access
                checkAdminAccess(email);
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = window.location.origin + '/dashboard.html';
                }, 1500);
                
            } catch (error) {
                console.error('Login error:', error);
                showNotification('Error al iniciar sesión: ' + error.message, 'error');
            }
        });
    }

    // Register form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validate passwords match
            if (password !== confirmPassword) {
                showNotification('Las contraseñas no coinciden', 'error');
                return;
            }
            
            // Validate password strength
            if (password.length < 6) {
                showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
                return;
            }
            
            try {
                // Import Firebase auth functions
                const { register } = await import('./firebase-config.js');
                
                // Register with email and password
                await register(email, password);
                
                // Show success message
                showNotification('¡Cuenta creada exitosamente!', 'success');
                closeRegisterModal();
                
                // Save user data to localStorage
                const user = {
                    name: name,
                    email: email,
                    loginTime: new Date().toISOString()
                };
                localStorage.setItem('user', JSON.stringify(user));
                
                // Check admin access
                checkAdminAccess(email);
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = window.location.origin + '/dashboard.html';
                }, 1500);
                
            } catch (error) {
                console.error('Register error:', error);
                showNotification('Error al crear cuenta: ' + error.message, 'error');
            }
        });
    }
});

// Google authentication - Make global
window.loginWithGoogle = async function() {
    try {
        // Import Firebase auth functions
        const { signInWithGoogle } = await import('./firebase-config.js');
        
        // Sign in with Google
        const result = await signInWithGoogle();
        const user = result.user;
        
        // Show success message
        showNotification('¡Inicio de sesión con Google exitoso!', 'success');
        closeLoginModal();
        
        // Save user data to localStorage
        const userData = {
            name: user.displayName || 'Usuario Google',
            email: user.email,
            photoURL: user.photoURL,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Check admin access
        checkAdminAccess(user.email);
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = window.location.origin + '/dashboard.html';
        }, 1500);
        
    } catch (error) {
        console.error('Google login error:', error);
        showNotification('Error con Google: ' + error.message, 'error');
    }
}

window.registerWithGoogle = async function() {
    try {
        // Import Firebase auth functions
        const { signInWithGoogle } = await import('./firebase-config.js');
        
        // Sign in with Google (same as login for Google)
        const result = await signInWithGoogle();
        const user = result.user;
        
        // Show success message
        showNotification('¡Registro con Google exitoso!', 'success');
        closeRegisterModal();
        
        // Save user data to localStorage
        const userData = {
            name: user.displayName || 'Usuario Google',
            email: user.email,
            photoURL: user.photoURL,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Check admin access
        checkAdminAccess(user.email);
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = window.location.origin + '/dashboard.html';
        }, 1500);
        
    } catch (error) {
        console.error('Google register error:', error);
        showNotification('Error con Google: ' + error.message, 'error');
    }
}

// Update authentication UI
function updateAuthUI(isLoggedIn) {
    const authButtons = document.querySelector('.auth-buttons');
    
    if (isLoggedIn) {
        authButtons.innerHTML = `
            <button class="btn-login" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i>
                Cerrar Sesión
            </button>
        `;
    } else {
        authButtons.innerHTML = `
            <button class="btn-login" onclick="openLoginModal()">Iniciar Sesión</button>
            <button class="btn-register" onclick="openRegisterModal()">Registrarse</button>
        `;
    }
}

// Logout function - Make global
window.logout = async function() {
    try {
        // Import Firebase auth functions
        const { logout } = await import('./firebase-config.js');
        await logout();
        
        showNotification('Sesión cerrada exitosamente', 'success');
        updateAuthUI(false);
        
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Error al cerrar sesión: ' + error.message, 'error');
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

// Service Modal Functions
const serviceData = {
    mobile: {
        icon: 'fas fa-mobile-alt',
        title: 'Apps Móviles',
        features: [
            'Diseño responsivo para iOS y Android',
            'Interfaz intuitiva y moderna',
            'Integración con APIs y servicios',
            'Notificaciones push',
            'Almacenamiento local y en la nube',
            'Sincronización de datos'
        ],
        tech: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'Node.js'],
        delivery: '7-10 días'
    },
    website: {
        icon: 'fas fa-laptop-code',
        title: 'Sitios Web',
        features: [
            'Diseño responsive y moderno',
            'Optimización SEO',
            'Panel administrativo',
            'Formularios de contacto',
            'Integración con redes sociales',
            'Certificado SSL incluido'
        ],
        tech: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Vue.js', 'WordPress'],
        delivery: '5-7 días',
    },
    software: {
        icon: 'fas fa-desktop',
        title: 'Software',
        features: [
            'Desarrollo a medida',
            'Base de datos integrada',
            'Interfaz de usuario intuitiva',
            'Reportes y análisis',
            'Seguridad avanzada',
            'Soporte técnico incluido'
        ],
        tech: ['Python', 'Java', 'C#', 'MySQL', 'PostgreSQL', 'Docker'],
        delivery: '8-10 días',
    },
    taxi: {
        icon: 'fas fa-taxi',
        title: 'Apps para Taxis',
        features: [
            'Geolocalización en tiempo real',
            'Sistema de reservas',
            'Pagos integrados',
            'Calificación de conductores',
            'Panel de administración',
            'Notificaciones automáticas'
        ],
        tech: ['React Native', 'Google Maps API', 'Stripe', 'Firebase', 'Node.js', 'MongoDB'],
        delivery: '8-10 días',
    },
    restaurant: {
        icon: 'fas fa-utensils',
        title: 'Apps para Restaurantes',
        features: [
            'Menú digital interactivo con QR',
            'Sistema de pedidos online',
            'Gestión de mesas y reservas',
            'Integración con delivery (Uber Eats, DoorDash)',
            'Sistema de cobros y pagos',
            'Facturación automática',
            'Gestión de inventario',
            'Contabilidad integrada',
            'Estadísticas y reportes',
            'Integración con cocina'
        ],
        tech: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Twilio', 'AWS'],
        delivery: '7-9 días',
    },
    cafe: {
        icon: 'fas fa-coffee',
        title: 'Apps para Cafeterías',
        features: [
            'Menú digital con QR para cafeterías',
            'Catálogo de bebidas y snacks',
            'Sistema de puntos y recompensas',
            'Pedidos para llevar y delivery',
            'Sistema de cobros y pagos',
            'Facturación automática',
            'Gestión de inventario',
            'Contabilidad integrada',
            'Estadísticas y reportes',
            'Integración con cocina'
        ],
        tech: ['Vue.js', 'Express.js', 'MySQL', 'Redis', 'Stripe', 'SendGrid'],
        delivery: '6-8 días',
    },
    icecream: {
        icon: 'fas fa-ice-cream',
        title: 'Apps para Heladerías',
        features: [
            'Menú digital con QR para heladerías',
            'Catálogo de sabores y productos',
            'Personalización de helados',
            'Sistema de pedidos online',
            'Sistema de cobros y pagos',
            'Facturación automática',
            'Gestión de inventario',
            'Contabilidad integrada',
            'Estadísticas y reportes',
            'Integración con cocina'
        ],
        tech: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Cloudinary', 'Heroku'],
        delivery: '6-8 días',
    },
    commercial: {
        icon: 'fas fa-store',
        title: 'Apps Comerciales',
        features: [
            'Catálogo de productos',
            'Sistema de inventario',
            'Gestión de clientes',
            'Reportes de ventas',
            'Integración con POS',
            'Análisis de datos'
        ],
        tech: ['Angular', 'Laravel', 'MySQL', 'Redis', 'PayPal', 'AWS'],
        delivery: '7-9 días',
    },
    billing: {
        icon: 'fas fa-file-invoice',
        title: 'Sistemas de Facturación',
        features: [
            'Generación automática de facturas',
            'Gestión de clientes y proveedores',
            'Reportes fiscales',
            'Integración contable',
            'Backup automático',
            'Cumplimiento legal'
        ],
        tech: ['PHP', 'Laravel', 'MySQL', 'PDF Generator', 'Email', 'SSL'],
        delivery: '8-10 días',
    },
    sales: {
        icon: 'fas fa-chart-line',
        title: 'Sistemas de Ventas',
        features: [
            'CRM integrado',
            'Pipeline de ventas',
            'Gestión de leads',
            'Reportes y dashboards',
            'Automatización de procesos',
            'Integración con email'
        ],
        tech: ['React', 'Django', 'PostgreSQL', 'Chart.js', 'SendGrid', 'Docker'],
        delivery: '7-9 días',
    },
    ecommerce: {
        icon: 'fas fa-shopping-cart',
        title: 'Tiendas Online',
        features: [
            'Catálogo de productos',
            'Carrito de compras',
            'Pagos seguros',
            'Gestión de inventario',
            'Panel administrativo',
            'SEO optimizado'
        ],
        tech: ['Shopify', 'WooCommerce', 'Magento', 'Stripe', 'PayPal', 'SSL'],
        delivery: '6-8 días',
    },
    webapp: {
        icon: 'fas fa-globe',
        title: 'Webs Apps',
        features: [
            'Aplicación web completa',
            'Base de datos integrada',
            'Autenticación de usuarios',
            'API REST',
            'Interfaz responsive',
            'Despliegue en la nube',
            'Integración con IAs',
            'Chatbots inteligentes',
            'Análisis predictivo',
            'Automatización de procesos'
        ],
        tech: ['React', 'Node.js', 'MongoDB', 'Express', 'JWT', 'AWS', 'OpenAI', 'TensorFlow'],
        delivery: '7-9 días',
    },
    betting: {
        icon: 'fas fa-futbol',
        title: 'Casa de Apuestas',
        features: [
            'Plataforma de apuestas deportivas',
            'Sistema de cuentas de usuario',
            'Gestión de depósitos y retiros',
            'API de datos deportivos en tiempo real',
            'Sistema de odds dinámicas',
            'Panel de administración completo',
            'Sistema de pagos seguro',
            'Reportes y estadísticas',
            'Soporte multi-idioma',
            'Integración con proveedores de datos'
        ],
        tech: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'Stripe', 'AWS', 'Socket.io', 'JWT'],
        delivery: '10-12 días',
    },
    casino: {
        icon: 'fas fa-dice',
        title: 'Casinos Online',
        features: [
            'Plataforma de casino virtual',
            'Juegos de mesa y slots',
            'Sistema de cuentas y billeteras',
            'Gestión de bonos y promociones',
            'Sistema de pagos integrado',
            'Panel de administración',
            'Soporte en vivo',
            'Sistema de lealtad',
            'Reportes de juego',
            'Integración con proveedores de juegos'
        ],
        tech: ['Vue.js', 'Node.js', 'MongoDB', 'Socket.io', 'Stripe', 'AWS', 'Docker', 'Kubernetes'],
        delivery: '12-15 días',
    },
    church_mobile: {
        icon: 'fas fa-church',
        title: 'Apps para Iglesias',
        features: [
            'Aplicación móvil para congregación',
            'Streaming de servicios en vivo',
            'Sistema de donaciones',
            'Calendario de eventos',
            'Notificaciones push',
            'Biblioteca de sermones',
            'Sistema de oración',
            'Gestión de grupos pequeños',
            'Integración con redes sociales',
            'Panel de administración'
        ],
        tech: ['React Native', 'Node.js', 'MongoDB', 'WebRTC', 'Stripe', 'Firebase', 'AWS', 'Twilio'],
        delivery: '8-10 días',
    },
    church_web: {
        icon: 'fas fa-cross',
        title: 'Webs para Iglesias',
        features: [
            'Sitio web profesional para iglesia',
            'Streaming de servicios en vivo',
            'Sistema de donaciones online',
            'Calendario de eventos',
            'Biblioteca de recursos',
            'Formularios de contacto',
            'Galería de fotos',
            'Blog y noticias',
            'Integración con redes sociales',
            'Panel de administración'
        ],
        tech: ['WordPress', 'PHP', 'MySQL', 'Stripe', 'YouTube API', 'Facebook API', 'SSL', 'CDN'],
        delivery: '6-8 días',
    }
};

// Make functions global
window.openServiceModal = function(serviceType) {
    console.log('Opening modal for:', serviceType);
    const modal = document.getElementById('serviceModal');
    const data = serviceData[serviceType];
    
    if (data && modal) {
        document.getElementById('modalIcon').className = data.icon;
        document.getElementById('modalTitle').textContent = data.title;
        
        // Features
        const featuresList = document.getElementById('modalFeatures');
        featuresList.innerHTML = data.features.map(feature => `<li>${feature}</li>`).join('');
        
        // Technologies
        const techContainer = document.getElementById('modalTech');
        techContainer.innerHTML = data.tech.map(tech => `<span class="tech-tag">${tech}</span>`).join('');
        
        // Delivery
        document.getElementById('modalDelivery').textContent = data.delivery;
        
        // Update translations after modal content is set
        if (window.languageSwitcher) {
            window.languageSwitcher.updateContent();
        }
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        console.log('Modal opened successfully');
    } else {
        console.error('Modal or data not found');
    }
}

window.closeServiceModal = function() {
    const modal = document.getElementById('serviceModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        console.log('Modal closed');
    }
}

window.contactForService = function() {
    closeServiceModal();
    openQuoteModal();
}

// Quote Modal Functions
window.openQuoteModal = function() {
    const modal = document.getElementById('quoteModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
};

window.closeQuoteModal = function() {
    const modal = document.getElementById('quoteModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

window.submitQuoteForm = function() {
    // Get form data
    const form = document.querySelector('.quote-form');
    const formData = new FormData(form);
    
    // Create quote object
    const quote = {
        id: Date.now(), // Simple ID generation
        name: form.querySelector('input[type="text"]').value,
        email: form.querySelector('input[type="email"]').value,
        company: form.querySelectorAll('input[type="text"]')[1].value,
        companySize: form.querySelectorAll('select')[0].value,
        industry: form.querySelectorAll('select')[1].value,
        startDate: form.querySelectorAll('select')[2].value,
        budget: form.querySelectorAll('select')[3].value,
        projectType: form.querySelectorAll('select')[4].value,
        hasDesign: form.querySelectorAll('select')[5].value,
        integrations: form.querySelectorAll('select')[6].value,
        users: form.querySelectorAll('select')[7].value,
        objectives: form.querySelectorAll('textarea')[0].value,
        targetAudience: form.querySelectorAll('select')[8].value,
        internalResources: form.querySelectorAll('select')[9].value,
        supportNeeded: form.querySelectorAll('select')[10].value,
        legalRestrictions: form.querySelectorAll('select')[11].value,
        details: form.querySelectorAll('textarea')[1].value,
        howFound: form.querySelectorAll('select')[12].value,
        status: 'pending',
        date: new Date().toISOString()
    };
    
    // Save to localStorage
    let quotes = JSON.parse(localStorage.getItem('quotes')) || [];
    quotes.push(quote);
    localStorage.setItem('quotes', JSON.stringify(quotes));
    
    console.log('Quote saved:', quote);
    alert('¡Gracias! Hemos recibido tu solicitud de cotización. Te contactaremos pronto.');
    closeQuoteModal();
    
    // Reset form
    form.reset();
};

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('serviceModal');
    if (event.target === modal) {
        closeServiceModal();
    }
}

// Check authentication status and update UI
function checkAuthStatus() {
    const user = localStorage.getItem('user');
    const authContainer = document.getElementById('authContainer');
    const userInfoContainer = document.getElementById('userInfoContainer');
    
    if (user) {
        try {
            const userData = JSON.parse(user);
            // Hide auth buttons, show user info
            if (authContainer) authContainer.style.display = 'none';
            if (userInfoContainer) {
                userInfoContainer.style.display = 'flex';
                // Update user info
                const userNameDisplay = document.getElementById('userNameDisplay');
                const userEmailDisplay = document.getElementById('userEmailDisplay');
                if (userNameDisplay) userNameDisplay.textContent = userData.name || 'Usuario';
                if (userEmailDisplay) userEmailDisplay.textContent = userData.email || 'usuario@ejemplo.com';
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            // Show auth buttons if error
            if (authContainer) authContainer.style.display = 'flex';
            if (userInfoContainer) userInfoContainer.style.display = 'none';
        }
    } else {
        // Show auth buttons, hide user info
        if (authContainer) authContainer.style.display = 'flex';
        if (userInfoContainer) userInfoContainer.style.display = 'none';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('language');
    // Redirect to home page
    window.location.href = '/';
}
