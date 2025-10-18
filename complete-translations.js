// Complete translation system for Freedom Labs
class CompleteLanguageSwitcher {
  constructor() {
    this.currentLang = localStorage.getItem('language') || 'en';
    this.translations = {
      es: {
        // Navigation
        'nav.home': 'Inicio',
        'nav.services': 'Servicios',
        'nav.contact': 'Contacto',
        'nav.about': 'Quiénes Somos',
        'nav.terms': 'Términos y Condiciones',
        'nav.privacy': 'Política de Privacidad',
        'nav.portfolio': 'Portfolio',
        'nav.admin': 'Admin',
        
        // Auth
        'auth.login': 'Iniciar Sesión',
        'auth.register': 'Registrarse',
        'auth.logout': 'Cerrar Sesión',
        'auth.email': 'Email',
        'auth.password': 'Contraseña',
        'auth.confirmPassword': 'Confirmar Contraseña',
        'auth.fullName': 'Nombre Completo',
        'auth.company': 'Empresa (opcional)',
        'auth.loginButton': 'Iniciar Sesión',
        'auth.registerButton': 'Crear Cuenta',
        'auth.close': 'Cerrar',
        
        // Hero Section
        'hero.startProject': 'Iniciar Proyecto',
        'hero.contactNow': 'Contactar Ahora',
        'hero.badge': 'Desarrollo Tecnológico',
        'hero.transform': 'Transformamos ideas en',
        'hero.solutions': 'soluciones digitales',
        'hero.technology': 'con las últimas tecnologías',
        
        // Services
        'services.title': 'Nuestros Servicios',
        'services.subtitle': 'Lo que hacemos para tu negocio',
        'services.websites': 'Sitios Web',
        'services.websites.desc': 'Páginas web profesionales',
        'services.mobile': 'Apps Móviles',
        'services.mobile.desc': 'Aplicaciones para iOS y Android',
        'services.webapps': 'Webs Apps',
        'services.webapps.desc': 'Aplicaciones web modernas',
        'services.software': 'Software',
        'services.software.desc': 'Software personalizado',
        'services.taxi': 'Apps para Taxis',
        'services.taxi.desc': 'Sistemas de transporte',
        'services.restaurant': 'Apps para Restaurantes',
        'services.restaurant.desc': 'Sistemas para restaurantes',
        'services.cafe': 'Apps para Cafeterías',
        'services.cafe.desc': 'Sistemas para cafeterías',
        'services.icecream': 'Apps para Heladerías',
        'services.icecream.desc': 'Sistemas para heladerías',
        'services.commercial': 'Apps Comerciales',
        'services.commercial.desc': 'Sistemas para comercios',
        'services.billing': 'Facturación',
        'services.billing.desc': 'Sistemas de facturación',
        'services.sales': 'Ventas',
        'services.sales.desc': 'Sistemas de gestión de ventas',
        'services.online': 'Tiendas Online',
        'services.online.desc': 'E-commerce y tiendas virtuales',
        'services.betting': 'Casa de Apuestas',
        'services.betting.desc': 'Plataformas de apuestas deportivas',
        'services.casino': 'Casinos Online',
        'services.casino.desc': 'Plataformas de casino virtual',
        'services.church_mobile': 'Apps para Iglesias',
        'services.church_mobile.desc': 'Aplicaciones móviles para iglesias',
        'services.church_web': 'Webs para Iglesias',
        'services.church_web.desc': 'Sitios web para iglesias',
        
        // Contact
        'contact.title': '¿Listo para tu próximo proyecto?',
        'contact.subtitle': 'Transformemos tu idea en una solución tecnológica innovadora.',
        'contact.name': 'Tu nombre',
        'contact.email': 'Tu email',
        'contact.message': 'Cuéntanos sobre tu proyecto',
        'contact.send': 'Enviar Mensaje',
        'contact.location': 'Ciudad de México, México',
        'contact.phone': '+1 (555) 123-4567',
        
        // Quote Modal
        'quote.title': 'Solicitar Cotización',
        'quote.subtitle': 'Cuéntanos sobre tu proyecto para darte la mejor cotización',
        'quote.companySize': '¿Cuál es el tamaño de tu empresa?',
        'quote.industry': '¿De qué se trata tu empresa? / ¿En qué industria operas?',
        'quote.startDate': '¿Cuándo tienes pensado iniciar tu proyecto?',
        'quote.budget': '¿Cuál es tu presupuesto aproximado?',
        'quote.projectType': '¿Qué tipo de proyecto necesitas?',
        'quote.designRef': '¿Tienes algún diseño o referencia visual?',
        'quote.integrations': '¿Necesitas integración con sistemas existentes?',
        'quote.expectedUsers': '¿Cuántos usuarios esperas que tenga tu aplicación?',
        'quote.fullName': 'Tu nombre completo',
        'quote.email': 'Tu email',
        'quote.companyName': 'Nombre de tu empresa (opcional)',
        'quote.projectDetails': 'Cuéntanos más detalles sobre tu proyecto',
        'quote.objectives': '¿Cuáles son los objetivos principales de tu proyecto?',
        'quote.targetAudience': '¿A qué público está dirigido tu producto/servicio?',
        'quote.internalResources': '¿Tienes recursos internos que participarán en el proyecto?',
        'quote.supportMaintenance': '¿Necesitas soporte y mantenimiento después del lanzamiento?',
        'quote.legalRestrictions': '¿Tienes restricciones legales o de cumplimiento específicas?',
        'quote.howFoundUs': '¿Cómo nos conociste?',
        'quote.cancel': 'Cancelar',
        'quote.request': 'Solicitar Cotización',
        'quote.fullNamePlaceholder': 'Ej: Juan Pérez',
        'quote.emailPlaceholder': 'Ej: juan@empresa.com',
        'quote.companyPlaceholder': 'Ej: Mi Empresa S.A.',
        'quote.projectDetailsPlaceholder': 'Describe tu proyecto, objetivos, funcionalidades específicas, etc.',
        'quote.objectivesPlaceholder': 'Describe qué quieres lograr con este proyecto, qué problemas resuelve, etc.',
        
        // Footer
        'footer.rights': 'Todos los derechos reservados.',
        'footer.weCanDesign': 'Podemos diseñar lo que te puedas imaginar',
        'footer.description': 'Desde aplicaciones móviles hasta plataformas complejas, desde sitios web hasta sistemas empresariales. Tu imaginación es nuestro límite.',
        'footer.innovativeIdeas': 'Ideas innovadoras',
        'footer.advancedTech': 'Tecnología avanzada',
        'footer.customDesign': 'Diseño personalizado',
        'footer.uniqueFeatures': 'Funcionalidades únicas',
        
        // About Page
        'about.title': 'Quiénes Somos',
        'about.subtitle': 'Conoce más sobre Freedom Labs',
        'about.mission': 'Nuestra Misión',
        'about.vision': 'Nuestra Visión',
        'about.values': 'Nuestros Valores',
        'about.whyChooseUs': '¿Por Qué Elegirnos?',
        'about.stats': 'Estadísticas',
        'about.years': 'Años de Experiencia',
        'about.projects': 'Proyectos Completados',
        'about.clients': 'Clientes Satisfechos',
        'about.team': 'Miembros del Equipo',
        
        // Admin Panel
        'admin.dashboard': 'Dashboard',
        'admin.quotes': 'Cotizaciones',
        'admin.users': 'Usuarios',
        'admin.projects': 'Proyectos',
        'admin.messages': 'Mensajes',
        'admin.files': 'Archivos',
        'admin.settings': 'Configuración',
        'admin.logout': 'Cerrar Sesión',
        'admin.updateStatus': 'Actualizar Estado',
        'admin.status': 'Estado',
        'admin.actions': 'Acciones',
        'admin.panel': 'Panel de Administración',
        'admin.subtitle': 'Gestiona las cotizaciones y solicitudes de clientes',
        'admin.backToSite': 'Volver al Sitio',
        
        // Dashboard translations
        'dashboard.client': 'Cliente',
        'dashboard.clientEmail': 'cliente@ejemplo.com',
        'dashboard.overview': 'Resumen',
        'dashboard.myProjects': 'Mis Proyectos',
        'dashboard.messages': 'Mensajes',
        'dashboard.files': 'Archivos',
        'dashboard.gallery': 'Galería',
        'dashboard.settings': 'Configuración',
        'dashboard.projectSummary': 'Resumen del Proyecto',
        'dashboard.welcomeMessage': 'Bienvenido a tu dashboard personalizado',
        'dashboard.activeProjects': 'Proyectos Activos',
        'dashboard.daysRemaining': 'Días Restantes',
        'dashboard.totalProgress': 'Progreso Total',
        'dashboard.totalInvestment': 'Inversión Total',
        'dashboard.recentActivity': 'Actividad Reciente',
        'dashboard.newFeature': 'Nueva funcionalidad agregada',
        'dashboard.authSystem': 'Se implementó el sistema de autenticación',
        'dashboard.twoHoursAgo': 'Hace 2 horas',
        'dashboard.bugFixed': 'Bug corregido',
        'dashboard.imageLoadFixed': 'Se solucionó el problema de carga de imágenes',
        'dashboard.oneDayAgo': 'Hace 1 día',
        'dashboard.filesUploaded': 'Archivos subidos',
        'dashboard.fiveNewFiles': 'Se agregaron 5 nuevos archivos al proyecto',
        'dashboard.threeDaysAgo': 'Hace 3 días',
        'dashboard.newProject': 'Nuevo Proyecto',
        'dashboard.inProgress': 'En Progreso',
        'dashboard.seventyFivePercent': '75% Completado',
        'dashboard.deadline': 'Fecha límite',
        'dashboard.developer': 'Desarrollador',
        'dashboard.pending': 'Pendiente',
        'dashboard.thirtyPercent': '30% Completado',
        'dashboard.completed': 'Completado',
        'dashboard.hundredPercent': '100% Completado',
        'dashboard.completedOn': 'Completado',
        'dashboard.newMessage': 'Nuevo Mensaje',
        'dashboard.paymentMessage': 'Hola, he terminado la implementación de la funcionalidad de pagos. ¿Podrías revisarla?',
        'dashboard.yesterday': 'Ayer',
        'dashboard.mobileDesignMessage': 'El diseño de la app móvil está listo. Te envío los archivos por correo.',
        'dashboard.landingPageMessage': 'La landing page ya está en producción. ¿Te parece bien el resultado?',
        'dashboard.projectFiles': 'Archivos del Proyecto',
        'dashboard.uploadFile': 'Subir Archivo',
        'dashboard.mainFile': 'Archivo principal del sitio web',
        'dashboard.companyLogo': 'Logo de la empresa',
        'dashboard.projectProposal': 'Propuesta del proyecto',
        'dashboard.projectGallery': 'Galería del Proyecto',
        'dashboard.uploadScreenshot': 'Subir Captura',
        'dashboard.all': 'Todas',
        'dashboard.desktop': 'Desktop',
        'dashboard.mobile': 'Móvil',
        'dashboard.tablet': 'Tablet',
        'dashboard.mainDashboard': 'Dashboard Principal',
        'dashboard.desktopView': 'Vista desktop del dashboard principal',
        'dashboard.december15': '15 de Diciembre, 2024',
        'dashboard.mobileApp': 'App Móvil',
        'dashboard.mobileInterface': 'Interfaz de la aplicación móvil',
        'dashboard.december12': '12 de Diciembre, 2024',
        'dashboard.onlineStore': 'Tienda Online',
        'dashboard.productPage': 'Página de productos del e-commerce',
        'dashboard.december10': '10 de Diciembre, 2024',
        'dashboard.tabletView': 'Vista Tablet',
        'dashboard.tabletOptimized': 'Interfaz optimizada para tablet',
        'dashboard.december8': '8 de Diciembre, 2024',
        'dashboard.mobileLogin': 'Login Móvil',
        'dashboard.mobileLoginScreen': 'Pantalla de inicio de sesión móvil',
        'dashboard.december5': '5 de Diciembre, 2024',
        'dashboard.adminPanel': 'Panel de Administración',
        'dashboard.adminInterface': 'Interfaz de administración del sistema',
        'dashboard.december3': '3 de Diciembre, 2024',
        'dashboard.download': 'Descargar',
        'dashboard.share': 'Compartir',
        'dashboard.phone': 'Teléfono',
        'dashboard.notifications': 'Notificaciones',
        'dashboard.emailNotifications': 'Recibir notificaciones por email',
        'dashboard.progressNotifications': 'Notificaciones de progreso',
        'dashboard.saveChanges': 'Guardar Cambios',
        
        // Modal translations
        'modal.whatIncludes': '¿Qué incluye?',
        'modal.technologies': 'Tecnologías',
        'modal.deliveryTime': 'Tiempo de entrega'
      },
      en: {
        // Navigation
        'nav.home': 'Home',
        'nav.services': 'Services',
        'nav.contact': 'Contact',
        'nav.about': 'About Us',
        'nav.terms': 'Terms & Conditions',
        'nav.privacy': 'Privacy Policy',
        'nav.portfolio': 'Portfolio',
        'nav.admin': 'Admin',
        
        // Auth
        'auth.login': 'Login',
        'auth.register': 'Register',
        'auth.logout': 'Logout',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.confirmPassword': 'Confirm Password',
        'auth.fullName': 'Full Name',
        'auth.company': 'Company (optional)',
        'auth.loginButton': 'Login',
        'auth.registerButton': 'Create Account',
        'auth.close': 'Close',
        
        // Hero Section
        'hero.startProject': 'Start Project',
        'hero.contactNow': 'Contact Now',
        'hero.badge': 'Technology Development',
        'hero.transform': 'We transform ideas into',
        'hero.solutions': 'digital solutions',
        'hero.technology': 'with the latest technologies',
        
        // Services
        'services.title': 'Our Services',
        'services.subtitle': 'What we do for your business',
        'services.websites': 'Websites',
        'services.websites.desc': 'Professional web pages',
        'services.mobile': 'Mobile Apps',
        'services.mobile.desc': 'iOS and Android applications',
        'services.webapps': 'Web Apps',
        'services.webapps.desc': 'Modern web applications',
        'services.software': 'Software',
        'services.software.desc': 'Custom software',
        'services.taxi': 'Taxi Apps',
        'services.taxi.desc': 'Transportation systems',
        'services.restaurant': 'Restaurant Apps',
        'services.restaurant.desc': 'Restaurant systems',
        'services.cafe': 'Café Apps',
        'services.cafe.desc': 'Café systems',
        'services.icecream': 'Ice Cream Apps',
        'services.icecream.desc': 'Ice cream systems',
        'services.commercial': 'Commercial Apps',
        'services.commercial.desc': 'Commerce systems',
        'services.billing': 'Billing',
        'services.billing.desc': 'Billing systems',
        'services.sales': 'Sales',
        'services.sales.desc': 'Sales management systems',
        'services.online': 'Online Stores',
        'services.online.desc': 'E-commerce and virtual stores',
        'services.betting': 'Sports Betting',
        'services.betting.desc': 'Sports betting platforms',
        'services.casino': 'Online Casinos',
        'services.casino.desc': 'Virtual casino platforms',
        'services.church_mobile': 'Church Apps',
        'services.church_mobile.desc': 'Mobile applications for churches',
        'services.church_web': 'Church Websites',
        'services.church_web.desc': 'Websites for churches',
        
        // Contact
        'contact.title': 'Ready for your next project?',
        'contact.subtitle': 'Let\'s transform your idea into an innovative technological solution.',
        'contact.name': 'Your name',
        'contact.email': 'Your email',
        'contact.message': 'Tell us about your project',
        'contact.send': 'Send Message',
        'contact.location': 'Mexico City, Mexico',
        'contact.phone': '+1 (555) 123-4567',
        
        // Quote Modal
        'quote.title': 'Request Quote',
        'quote.subtitle': 'Tell us about your project to get the best quote',
        'quote.companySize': 'What is your company size?',
        'quote.industry': 'What is your company about? / In which industry do you operate?',
        'quote.startDate': 'When do you plan to start your project?',
        'quote.budget': 'What is your approximate budget?',
        'quote.projectType': 'What type of project do you need?',
        'quote.designRef': 'Do you have any design or visual references?',
        'quote.integrations': 'Do you need integration with existing systems?',
        'quote.expectedUsers': 'How many users do you expect your application to have?',
        'quote.fullName': 'Your full name',
        'quote.email': 'Your email',
        'quote.companyName': 'Your company name (optional)',
        'quote.projectDetails': 'Tell us more details about your project',
        'quote.objectives': 'What are the main objectives of your project?',
        'quote.targetAudience': 'Who is your product/service aimed at?',
        'quote.internalResources': 'Do you have internal resources that will participate in the project?',
        'quote.supportMaintenance': 'Do you need support and maintenance after launch?',
        'quote.legalRestrictions': 'Do you have specific legal or compliance restrictions?',
        'quote.howFoundUs': 'How did you find us?',
        'quote.cancel': 'Cancel',
        'quote.request': 'Request Quote',
        'quote.fullNamePlaceholder': 'Ex: John Smith',
        'quote.emailPlaceholder': 'Ex: john@company.com',
        'quote.companyPlaceholder': 'Ex: My Company Inc.',
        'quote.projectDetailsPlaceholder': 'Describe your project, objectives, specific functionalities, etc.',
        'quote.objectivesPlaceholder': 'Describe what you want to achieve with this project, what problems it solves, etc.',
        
        // Footer
        'footer.rights': 'All rights reserved.',
        'footer.weCanDesign': 'We can design anything you can imagine',
        'footer.description': 'From mobile applications to complex platforms, from websites to enterprise systems. Your imagination is our limit.',
        'footer.innovativeIdeas': 'Innovative Ideas',
        'footer.advancedTech': 'Advanced Technology',
        'footer.customDesign': 'Custom Design',
        'footer.uniqueFeatures': 'Unique Features',
        
        // About Page
        'about.title': 'About Us',
        'about.subtitle': 'Learn more about Freedom Labs',
        'about.mission': 'Our Mission',
        'about.vision': 'Our Vision',
        'about.values': 'Our Values',
        'about.whyChooseUs': 'Why Choose Us?',
        'about.stats': 'Statistics',
        'about.years': 'Years of Experience',
        'about.projects': 'Completed Projects',
        'about.clients': 'Satisfied Clients',
        'about.team': 'Team Members',
        
        // Admin Panel
        'admin.dashboard': 'Dashboard',
        'admin.quotes': 'Quotes',
        'admin.users': 'Users',
        'admin.projects': 'Projects',
        'admin.messages': 'Messages',
        'admin.files': 'Files',
        'admin.settings': 'Settings',
        'admin.logout': 'Logout',
        'admin.updateStatus': 'Update Status',
        'admin.status': 'Status',
        'admin.actions': 'Actions',
        'admin.panel': 'Admin Panel',
        'admin.subtitle': 'Manage quotes and client requests',
        'admin.backToSite': 'Back to Site',
        
        // Dashboard translations
        'dashboard.client': 'Client',
        'dashboard.clientEmail': 'client@example.com',
        'dashboard.overview': 'Overview',
        'dashboard.myProjects': 'My Projects',
        'dashboard.messages': 'Messages',
        'dashboard.files': 'Files',
        'dashboard.gallery': 'Gallery',
        'dashboard.settings': 'Settings',
        'dashboard.projectSummary': 'Project Summary',
        'dashboard.welcomeMessage': 'Welcome to your personalized dashboard',
        'dashboard.activeProjects': 'Active Projects',
        'dashboard.daysRemaining': 'Days Remaining',
        'dashboard.totalProgress': 'Total Progress',
        'dashboard.totalInvestment': 'Total Investment',
        'dashboard.recentActivity': 'Recent Activity',
        'dashboard.newFeature': 'New feature added',
        'dashboard.authSystem': 'Authentication system implemented',
        'dashboard.twoHoursAgo': '2 hours ago',
        'dashboard.bugFixed': 'Bug fixed',
        'dashboard.imageLoadFixed': 'Image loading issue resolved',
        'dashboard.oneDayAgo': '1 day ago',
        'dashboard.filesUploaded': 'Files uploaded',
        'dashboard.fiveNewFiles': '5 new files added to the project',
        'dashboard.threeDaysAgo': '3 days ago',
        'dashboard.newProject': 'New Project',
        'dashboard.inProgress': 'In Progress',
        'dashboard.seventyFivePercent': '75% Completed',
        'dashboard.deadline': 'Deadline',
        'dashboard.developer': 'Developer',
        'dashboard.pending': 'Pending',
        'dashboard.thirtyPercent': '30% Completed',
        'dashboard.completed': 'Completed',
        'dashboard.hundredPercent': '100% Completed',
        'dashboard.completedOn': 'Completed',
        'dashboard.newMessage': 'New Message',
        'dashboard.paymentMessage': 'Hello, I have finished implementing the payment functionality. Could you review it?',
        'dashboard.yesterday': 'Yesterday',
        'dashboard.mobileDesignMessage': 'The mobile app design is ready. I\'m sending you the files by email.',
        'dashboard.landingPageMessage': 'The landing page is already in production. Do you like the result?',
        'dashboard.projectFiles': 'Project Files',
        'dashboard.uploadFile': 'Upload File',
        'dashboard.mainFile': 'Main website file',
        'dashboard.companyLogo': 'Company logo',
        'dashboard.projectProposal': 'Project proposal',
        'dashboard.projectGallery': 'Project Gallery',
        'dashboard.uploadScreenshot': 'Upload Screenshot',
        'dashboard.all': 'All',
        'dashboard.desktop': 'Desktop',
        'dashboard.mobile': 'Mobile',
        'dashboard.tablet': 'Tablet',
        'dashboard.mainDashboard': 'Main Dashboard',
        'dashboard.desktopView': 'Desktop view of the main dashboard',
        'dashboard.december15': 'December 15, 2024',
        'dashboard.mobileApp': 'Mobile App',
        'dashboard.mobileInterface': 'Mobile application interface',
        'dashboard.december12': 'December 12, 2024',
        'dashboard.onlineStore': 'Online Store',
        'dashboard.productPage': 'E-commerce product page',
        'dashboard.december10': 'December 10, 2024',
        'dashboard.tabletView': 'Tablet View',
        'dashboard.tabletOptimized': 'Tablet-optimized interface',
        'dashboard.december8': 'December 8, 2024',
        'dashboard.mobileLogin': 'Mobile Login',
        'dashboard.mobileLoginScreen': 'Mobile login screen',
        'dashboard.december5': 'December 5, 2024',
        'dashboard.adminPanel': 'Admin Panel',
        'dashboard.adminInterface': 'System administration interface',
        'dashboard.december3': 'December 3, 2024',
        'dashboard.download': 'Download',
        'dashboard.share': 'Share',
        'dashboard.phone': 'Phone',
        'dashboard.notifications': 'Notifications',
        'dashboard.emailNotifications': 'Receive email notifications',
        'dashboard.progressNotifications': 'Progress notifications',
        'dashboard.saveChanges': 'Save Changes',
        
        // Modal translations
        'modal.whatIncludes': 'What includes?',
        'modal.technologies': 'Technologies',
        'modal.deliveryTime': 'Delivery time'
      }
    };
    
    this.init();
  }

  init() {
    this.createSwitcher();
    this.updateContent();
  }

  createSwitcher() {
    console.log('Creating language switcher...');
    
    // Check if switcher already exists in the page
    const existingSwitcher = document.getElementById('languageSwitcher');
    if (existingSwitcher) {
      console.log('Language switcher already exists, using existing one');
      // Just add event listeners to existing switcher
      this.addEventListeners();
      return;
    }

    const switcherHTML = `
      <div class="language-switcher" id="languageSwitcher">
        <button class="lang-btn ${this.currentLang === 'es' ? 'active' : ''}" data-lang="es">
          🇪🇸 ES
        </button>
        <button class="lang-btn ${this.currentLang === 'en' ? 'active' : ''}" data-lang="en">
          🇺🇸 EN
        </button>
      </div>
    `;

    // Always insert at the end of body since it's fixed positioned
    document.body.insertAdjacentHTML('beforeend', switcherHTML);

    this.addEventListeners();
  }

  addEventListeners() {
    // Add event listeners
    const switcher = document.getElementById('languageSwitcher');
    if (switcher) {
      switcher.addEventListener('click', (e) => {
        const button = e.target.closest('.lang-btn');
        if (button) {
          this.changeLanguage(button.dataset.lang);
        }
      });
    }
  }

  changeLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('language', lang);
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.lang === lang) {
        btn.classList.add('active');
      }
    });

    this.updateContent();
  }

  updateContent() {
    // Update text content
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.translations[this.currentLang][key];
      if (translation) {
        element.textContent = translation;
      }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translation = this.translations[this.currentLang][key];
      if (translation) {
        element.placeholder = translation;
      }
    });

    // Update titles
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      const translation = this.translations[this.currentLang][key];
      if (translation) {
        element.title = translation;
      }
    });

    // Update values
    document.querySelectorAll('[data-i18n-value]').forEach(element => {
      const key = element.getAttribute('data-i18n-value');
      const translation = this.translations[this.currentLang][key];
      if (translation) {
        element.value = translation;
      }
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.languageSwitcher = new CompleteLanguageSwitcher();
});

// Also try after a delay
setTimeout(() => {
  if (!window.languageSwitcher) {
    window.languageSwitcher = new CompleteLanguageSwitcher();
  }
}, 1000);
