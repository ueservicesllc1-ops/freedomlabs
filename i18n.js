import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  es: {
    translation: {
      // Navigation
      "nav.home": "Inicio",
      "nav.services": "Servicios", 
      "nav.contact": "Contacto",
      "nav.about": "Quiénes Somos",
      "nav.terms": "Términos y Condiciones",
      "nav.privacy": "Política de Privacidad",
      
      // Hero Section
      "hero.title": "Freedom Labs",
      "hero.subtitle": "Transformamos ideas en <span class='highlight'>soluciones digitales</span> con las últimas tecnologías",
      "hero.startProject": "Iniciar Proyecto",
      
      // Services
      "services.title": "Nuestros Servicios",
      "services.websites": "Sitios Web",
      "services.mobile": "Apps Móviles",
      "services.webapps": "Webs Apps",
      "services.software": "Software",
      "services.taxi": "Apps para Taxis",
      "services.restaurant": "Apps para Restaurantes",
      "services.cafe": "Apps para Cafeterías",
      "services.icecream": "Apps para Heladerías",
      "services.commercial": "Comerciales",
      "services.billing": "Facturación",
      "services.sales": "Ventas",
      "services.online": "Tiendas en Línea",
      "services.betting": "Casa de Apuestas",
      "services.casino": "Casinos Online",
      "services.church_mobile": "Apps para Iglesias",
      "services.church_web": "Webs para Iglesias",
      
      // Creative Message
      "creative.title": "Podemos diseñar lo que te puedas imaginar",
      "creative.subtitle": "Nuestro equipo de desarrolladores está listo para convertir tus ideas en realidad",
      "creative.innovative": "Ideas innovadoras",
      "creative.technology": "Tecnología avanzada",
      "creative.design": "Diseño personalizado",
      "creative.functionality": "Funcionalidades únicas",
      
      // Footer
      "footer.description": "Desarrollo de software de última generación",
      "footer.rights": "Todos los derechos reservados",
      
      // Auth
      "auth.login": "Iniciar Sesión",
      "auth.register": "Registrarse",
      "auth.email": "Correo Electrónico",
      "auth.password": "Contraseña",
      "auth.confirmPassword": "Confirmar Contraseña",
      "auth.name": "Nombre Completo",
      "auth.loginButton": "Iniciar Sesión",
      "auth.registerButton": "Crear Cuenta",
      "auth.googleLogin": "Continuar con Google",
      "auth.divider": "O continúa con",
      "auth.close": "Cerrar",
      
      // Quote Modal
      "quote.title": "Solicitar Cotización",
      "quote.subtitle": "Cuéntanos sobre tu proyecto para darte la mejor cotización",
      "quote.companySize": "¿Cuál es el tamaño de tu empresa?",
      "quote.industry": "¿De qué se trata tu empresa? / ¿En qué industria operas?",
      "quote.startDate": "¿Cuándo tienes pensado iniciar tu proyecto?",
      "quote.budget": "¿Cuál es tu presupuesto aproximado?",
      "quote.projectType": "¿Qué tipo de proyecto necesitas?",
      "quote.design": "¿Tienes algún diseño o referencia visual?",
      "quote.integrations": "¿Necesitas integración con sistemas existentes?",
      "quote.users": "¿Cuántos usuarios esperas que tenga tu aplicación?",
      "quote.name": "Tu nombre completo",
      "quote.email": "Tu email",
      "quote.company": "Nombre de tu empresa (opcional)",
      "quote.details": "Cuéntanos más detalles sobre tu proyecto",
      "quote.objectives": "¿Cuáles son los objetivos principales de tu proyecto?",
      "quote.audience": "¿A qué público está dirigido tu producto/servicio?",
      "quote.resources": "¿Tienes recursos internos que participarán en el proyecto?",
      "quote.support": "¿Necesitas soporte y mantenimiento después del lanzamiento?",
      "quote.legal": "¿Tienes restricciones legales o de cumplimiento específicas?",
      "quote.howFound": "¿Cómo nos conociste?",
      "quote.cancel": "Cancelar",
      "quote.submit": "Solicitar Cotización",
      
      // Contact
      "contact.title": "Contacto",
      "contact.subtitle": "¿Tienes alguna pregunta? ¡Nos encantaría escucharte!",
      "contact.email": "Email",
      "contact.location": "Ubicación",
      "contact.hours": "Horarios",
      "contact.form.name": "Tu nombre",
      "contact.form.email": "Tu email",
      "contact.form.subject": "Asunto",
      "contact.form.message": "Tu mensaje",
      "contact.form.send": "Enviar Mensaje",
      
      // About
      "about.title": "Quiénes Somos",
      "about.subtitle": "Conoce más sobre Freedom Labs",
      "about.history": "Nuestra Historia",
      "about.team": "Nuestro Equipo",
      "about.mission": "Nuestra Misión",
      "about.values": "Nuestros Valores",
      "about.stats": "Por Qué Elegirnos?",
      
      // Common
      "common.loading": "Cargando...",
      "common.error": "Error",
      "common.success": "Éxito",
      "common.close": "Cerrar",
      "common.save": "Guardar",
      "common.cancel": "Cancelar",
      "common.delete": "Eliminar",
      "common.edit": "Editar",
      "common.view": "Ver",
      "common.back": "Volver",
      "common.next": "Siguiente",
      "common.previous": "Anterior"
    }
  },
  en: {
    translation: {
      // Navigation
      "nav.home": "Home",
      "nav.services": "Services",
      "nav.contact": "Contact", 
      "nav.about": "About Us",
      "nav.terms": "Terms and Conditions",
      "nav.privacy": "Privacy Policy",
      
      // Hero Section
      "hero.title": "Freedom Labs",
      "hero.subtitle": "We transform ideas into <span class='highlight'>digital solutions</span> with the latest technologies",
      "hero.startProject": "Start Project",
      
      // Services
      "services.title": "Our Services",
      "services.websites": "Websites",
      "services.mobile": "Mobile Apps",
      "services.webapps": "Web Apps",
      "services.software": "Software",
      "services.taxi": "Taxi Apps",
      "services.restaurant": "Restaurant Apps",
      "services.cafe": "Café Apps",
      "services.icecream": "Ice Cream Apps",
      "services.commercial": "Commercial",
      "services.billing": "Billing",
      "services.sales": "Sales",
      "services.online": "Online Stores",
      "services.betting": "Sports Betting",
      "services.casino": "Online Casinos",
      "services.church_mobile": "Church Apps",
      "services.church_web": "Church Websites",
      
      // Creative Message
      "creative.title": "We can design whatever you can imagine",
      "creative.subtitle": "Our development team is ready to turn your ideas into reality",
      "creative.innovative": "Innovative ideas",
      "creative.technology": "Advanced technology",
      "creative.design": "Custom design",
      "creative.functionality": "Unique functionalities",
      
      // Footer
      "footer.description": "Next-generation software development",
      "footer.rights": "All rights reserved",
      
      // Auth
      "auth.login": "Sign In",
      "auth.register": "Sign Up",
      "auth.email": "Email Address",
      "auth.password": "Password",
      "auth.confirmPassword": "Confirm Password",
      "auth.name": "Full Name",
      "auth.loginButton": "Sign In",
      "auth.registerButton": "Create Account",
      "auth.googleLogin": "Continue with Google",
      "auth.divider": "Or continue with",
      "auth.close": "Close",
      
      // Quote Modal
      "quote.title": "Request Quote",
      "quote.subtitle": "Tell us about your project to give you the best quote",
      "quote.companySize": "What is the size of your company?",
      "quote.industry": "What is your company about? / What industry do you operate in?",
      "quote.startDate": "When do you plan to start your project?",
      "quote.budget": "What is your approximate budget?",
      "quote.projectType": "What type of project do you need?",
      "quote.design": "Do you have any design or visual reference?",
      "quote.integrations": "Do you need integration with existing systems?",
      "quote.users": "How many users do you expect your application to have?",
      "quote.name": "Your full name",
      "quote.email": "Your email",
      "quote.company": "Your company name (optional)",
      "quote.details": "Tell us more details about your project",
      "quote.objectives": "What are the main objectives of your project?",
      "quote.audience": "What audience is your product/service aimed at?",
      "quote.resources": "Do you have internal resources that will participate in the project?",
      "quote.support": "Do you need support and maintenance after launch?",
      "quote.legal": "Do you have specific legal or compliance restrictions?",
      "quote.howFound": "How did you find us?",
      "quote.cancel": "Cancel",
      "quote.submit": "Request Quote",
      
      // Contact
      "contact.title": "Contact",
      "contact.subtitle": "Have any questions? We'd love to hear from you!",
      "contact.email": "Email",
      "contact.location": "Location",
      "contact.hours": "Hours",
      "contact.form.name": "Your name",
      "contact.form.email": "Your email",
      "contact.form.subject": "Subject",
      "contact.form.message": "Your message",
      "contact.form.send": "Send Message",
      
      // About
      "about.title": "About Us",
      "about.subtitle": "Learn more about Freedom Labs",
      "about.history": "Our History",
      "about.team": "Our Team",
      "about.mission": "Our Mission",
      "about.values": "Our Values",
      "about.stats": "Why Choose Us?",
      
      // Common
      "common.loading": "Loading...",
      "common.error": "Error",
      "common.success": "Success",
      "common.close": "Close",
      "common.save": "Save",
      "common.cancel": "Cancel",
      "common.delete": "Delete",
      "common.edit": "Edit",
      "common.view": "View",
      "common.back": "Back",
      "common.next": "Next",
      "common.previous": "Previous"
    }
  }
};

// Initialize i18next
i18n
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: 'es',
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },
    
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
