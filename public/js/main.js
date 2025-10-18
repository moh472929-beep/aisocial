// Facebook AI Manager - Main JavaScript
// Language data and translations
const languageData = {
    en: {
        title: "Facebook AI Manager",
        subtitle: "Advanced AI-Powered Facebook Page Management Platform",
        cta: "Get Started",
        login: "Login",
        register: "Register",
        dashboard: "Dashboard",
        home: "Home",
        subscription: "Subscription",
        payment: "Payment",
        logout: "Logout",
        feature1Title: "Smart Automation",
        feature1Desc: "Automated content creation and management using advanced AI",
        feature2Title: "Creative Tools",
        feature2Desc: "Create engaging posts and visual content with AI assistance",
        feature3Title: "Advanced Analytics",
        feature3Desc: "Track performance and optimize your social media strategy",
        feature4Title: "Facebook Integration",
        feature4Desc: "Complete Facebook page management with full automation",
        aiFeatureTitle: "AI-Powered Post Generation",
        aiFeatureDesc: "Create engaging Facebook posts automatically with our advanced AI technology",
        tryItNow: "Try It Now - Free!",
        pricingTitle: "Pricing Plans",
        freePlan: "Free",
        premiumPlan: "Premium",
        monthly: "/month",
        footer: "© 2025 Facebook AI Manager. All rights reserved.",
        username: "Username or Email",
        password: "Password",
        forgotPassword: "Forgot Password?",
        createAccount: "Create Account",
        loginButton: "Login",
        loading: "Logging in...",
        loginSuccess: "Login successful! Redirecting...",
        loginError: "Login error. Please try again.",
        connectionError: "Connection error. Please check your internet connection and try again."
    },
    ar: {
        title: "مدير صفحات الفيس بوك بالذكاء الاصطناعي",
        subtitle: "منصة إدارة صفحات الفيس بوك المتطورة بالذكاء الاصطناعي",
        cta: "ابدأ الآن",
        login: "تسجيل الدخول",
        register: "إنشاء حساب",
        dashboard: "لوحة التحكم",
        home: "الرئيسية",
        subscription: "الاشتراك",
        payment: "الدفع",
        logout: "تسجيل الخروج",
        feature1Title: "أتمتة ذكية",
        feature1Desc: "إنشاء وتنظيم المحتوى تلقائياً باستخدام الذكاء الاصطناعي المتقدم",
        feature2Title: "أدوات إبداعية",
        feature2Desc: "إنشاء منشورات جذابة ومحتوى مرئي بمساعدة الذكاء الاصطناعي",
        feature3Title: "تحليلات متقدمة",
        feature3Desc: "تتبع الأداء وتحسين استراتيجية وسائل التواصل الاجتماعي",
        feature4Title: "تكامل الفيس بوك",
        feature4Desc: "إدارة متكاملة لصفحات الفيس بوك مع أتمتة كاملة",
        aiFeatureTitle: "إنشاء منشورات مدعومة بالذكاء الاصطناعي",
        aiFeatureDesc: "أنشئ منشورات فيسبوك جذابة تلقائياً باستخدام تقنية الذكاء الاصطناعي المتقدمة لدينا",
        tryItNow: "جربها الآن - مجاناً!",
        pricingTitle: "خطط الأسعار",
        freePlan: "مجاني",
        premiumPlan: "مميز",
        monthly: "/شهر",
        footer: "© 2025 Facebook AI Manager. جميع الحقوق محفوظة.",
        username: "اسم المستخدم أو البريد الإلكتروني",
        password: "كلمة المرور",
        forgotPassword: "نسيت كلمة المرور؟",
        createAccount: "إنشاء حساب",
        loginButton: "تسجيل الدخول",
        loading: "جاري تسجيل الدخول...",
        loginSuccess: "تم تسجيل الدخول بنجاح! جاري التوجيه...",
        loginError: "خطأ في تسجيل الدخول. يرجى المحاولة مرة أخرى.",
        connectionError: "حدث خطأ في الاتصال. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى."
    },
    fr: {
        title: "Gestionnaire IA Facebook",
        subtitle: "Plateforme avancée de gestion de pages Facebook alimentée par l'IA",
        cta: "Commencer",
        login: "Connexion",
        register: "S'inscrire",
        dashboard: "Tableau de bord",
        home: "Accueil",
        subscription: "Abonnement",
        payment: "Paiement",
        logout: "Déconnexion",
        feature1Title: "Automatisation intelligente",
        feature1Desc: "Création et gestion automatisées de contenu avec l'IA avancée",
        feature2Title: "Outils créatifs",
        feature2Desc: "Créer des posts engageants et du contenu visuel avec l'aide de l'IA",
        feature3Title: "Analytique avancée",
        feature3Desc: "Suivre les performances et optimiser votre stratégie de médias sociaux",
        feature4Title: "Intégration Facebook",
        feature4Desc: "Gestion complète des pages Facebook avec automatisation totale",
        aiFeatureTitle: "Génération de posts alimentée par l'IA",
        aiFeatureDesc: "Créez automatiquement des posts Facebook engageants avec notre technologie IA avancée",
        tryItNow: "Essayez maintenant - Gratuit!",
        pricingTitle: "Plans tarifaires",
        freePlan: "Gratuit",
        premiumPlan: "Premium",
        monthly: "/mois",
        footer: "© 2025 Facebook AI Manager. Tous droits réservés.",
        username: "Nom d'utilisateur ou Email",
        password: "Mot de passe",
        forgotPassword: "Mot de passe oublié?",
        createAccount: "Créer un compte",
        loginButton: "Connexion",
        loading: "Connexion en cours...",
        loginSuccess: "Connexion réussie! Redirection...",
        loginError: "Erreur de connexion. Veuillez réessayer.",
        connectionError: "Erreur de connexion. Veuillez vérifier votre connexion internet et réessayer."
    },
    de: {
        title: "Facebook KI Manager",
        subtitle: "Fortgeschrittene KI-gestützte Facebook-Seitenverwaltungsplattform",
        cta: "Loslegen",
        login: "Anmelden",
        register: "Registrieren",
        dashboard: "Dashboard",
        home: "Startseite",
        subscription: "Abonnement",
        payment: "Zahlung",
        logout: "Abmelden",
        feature1Title: "Intelligente Automatisierung",
        feature1Desc: "Automatisierte Inhaltserstellung und -verwaltung mit fortgeschrittener KI",
        feature2Title: "Kreative Werkzeuge",
        feature2Desc: "Erstellen Sie ansprechende Posts und visuelle Inhalte mit KI-Unterstützung",
        feature3Title: "Erweiterte Analytik",
        feature3Desc: "Verfolgen Sie die Leistung und optimieren Sie Ihre Social-Media-Strategie",
        feature4Title: "Facebook-Integration",
        feature4Desc: "Vollständige Facebook-Seitenverwaltung mit vollständiger Automatisierung",
        aiFeatureTitle: "KI-gestützte Beitragsgenerierung",
        aiFeatureDesc: "Erstellen Sie automatisch ansprechende Facebook-Beiträge mit unserer fortschrittlichen KI-Technologie",
        tryItNow: "Jetzt kostenlos testen!",
        pricingTitle: "Preispläne",
        freePlan: "Kostenlos",
        premiumPlan: "Premium",
        monthly: "/Monat",
        footer: "© 2025 Facebook AI Manager. Alle Rechte vorbehalten.",
        username: "Benutzername oder E-Mail",
        password: "Passwort",
        forgotPassword: "Passwort vergessen?",
        createAccount: "Konto erstellen",
        loginButton: "Anmelden",
        loading: "Anmeldung läuft...",
        loginSuccess: "Anmeldung erfolgreich! Weiterleitung...",
        loginError: "Anmeldefehler. Bitte versuchen Sie es erneut.",
        connectionError: "Verbindungsfehler. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut."
    },
    es: {
        title: "Gestor IA Facebook",
        subtitle: "Plataforma avanzada de gestión de páginas de Facebook impulsada por IA",
        cta: "Comenzar",
        login: "Iniciar sesión",
        register: "Registrarse",
        dashboard: "Panel de control",
        home: "Inicio",
        subscription: "Suscripción",
        payment: "Pago",
        logout: "Cerrar sesión",
        feature1Title: "Automatización inteligente",
        feature1Desc: "Creación y gestión automatizada de contenido con IA avanzada",
        feature2Title: "Herramientas creativas",
        feature2Desc: "Crear publicaciones atractivas y contenido visual con asistencia de IA",
        feature3Title: "Analítica avanzada",
        feature3Desc: "Rastrear el rendimiento y optimizar tu estrategia de redes sociales",
        feature4Title: "Integración Facebook",
        feature4Desc: "Gestión completa de páginas de Facebook con automatización total",
        aiFeatureTitle: "Generación de publicaciones impulsada por IA",
        aiFeatureDesc: "Crea automáticamente publicaciones de Facebook atractivas con nuestra tecnología de IA avanzada",
        tryItNow: "¡Pruébalo ahora - Gratis!",
        pricingTitle: "Planes de precios",
        freePlan: "Gratis",
        premiumPlan: "Premium",
        monthly: "/mes",
        footer: "© 2025 Facebook AI Manager. Todos los derechos reservados.",
        username: "Nombre de usuario o Email",
        password: "Contraseña",
        forgotPassword: "¿Olvidaste la contraseña?",
        createAccount: "Crear cuenta",
        loginButton: "Iniciar sesión",
        loading: "Iniciando sesión...",
        loginSuccess: "¡Inicio de sesión exitoso! Redirigiendo...",
        loginError: "Error de inicio de sesión. Por favor, inténtalo de nuevo.",
        connectionError: "Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo."
    }
};

// Global function to update page content
function updateMainContent(lang = 'ar') {
    const translations = languageData[lang] || languageData['ar'];
    
    // Update main content elements
    const elements = {
        '.animated-title': translations.title,
        '.animated-subtitle': translations.subtitle,
        '.cta-button': translations.cta,
        '.feature-card h3': [translations.feature1Title, translations.feature2Title, translations.feature3Title, translations.feature4Title],
        '.feature-card p': [translations.feature1Desc, translations.feature2Desc, translations.feature3Desc, translations.feature4Desc],
        '.feature-highlight h2': translations.aiFeatureTitle,
        '.feature-highlight p': translations.aiFeatureDesc,
        '.feature-highlight .cta-button': translations.tryItNow,
        '.pricing-section h2': translations.pricingTitle,
        'footer p': translations.footer
    };
    
    // Update single text elements
    Object.keys(elements).forEach(selector => {
        if (typeof elements[selector] === 'string') {
            const element = document.querySelector(selector);
            if (element) {
                element.textContent = elements[selector];
            }
        }
    });
    
    // Update array elements (feature cards)
    const featureCards = document.querySelectorAll('.feature-card h3');
    featureCards.forEach((card, index) => {
        if (elements['.feature-card h3'][index]) {
            card.textContent = elements['.feature-card h3'][index];
        }
    });
    
    const featureDescs = document.querySelectorAll('.feature-card p');
    featureDescs.forEach((desc, index) => {
        if (elements['.feature-card p'][index]) {
            desc.textContent = elements['.feature-card p'][index];
        }
    });
    
    // Update navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    const navTexts = [translations.home, translations.dashboard, translations.subscription, translations.login];
    navLinks.forEach((link, index) => {
        if (navTexts[index]) {
            link.textContent = navTexts[index];
        }
    });
    
    // Update footer links
    const footerLinks = document.querySelectorAll('.footer-links a');
    const footerTexts = [translations.home, translations.dashboard, translations.subscription, translations.payment];
    footerLinks.forEach((link, index) => {
        if (footerTexts[index]) {
            link.textContent = footerTexts[index];
        }
    });
    
    // Update page direction
    if (lang === 'ar') {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
    } else {
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = lang;
    }
    
    // Save language preference
    localStorage.setItem('preferredLanguage', lang);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load saved language preference
    const savedLang = localStorage.getItem('preferredLanguage') || 'ar';
    
    // Apply saved language immediately
    if (typeof updateMainContent === 'function') {
        updateMainContent(savedLang);
    }
    
    // Add smooth animations to elements
    const animatedElements = document.querySelectorAll('.feature-card, .pricing-card, .feature-highlight');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 200);
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(element);
    });
    
    // Add click effects to buttons
    document.querySelectorAll('.cta-button, .pricing-button').forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add smooth scrolling for anchor links
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
});

// Add ripple effect styles
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Export for use in other files
window.updateMainContent = updateMainContent;
window.languageData = languageData;
