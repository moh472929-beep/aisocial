// Translation files for different languages
const translations = {
  en: {
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    close: 'Close',
    
    // Navigation
    dashboard: 'Dashboard',
    analytics: 'Analytics',
    automation: 'Automation',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Logout',
    
    // Authentication
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    fullName: 'Full Name',
    username: 'Username',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    
    // Dashboard
    welcome: 'Welcome',
    facebookPages: 'Facebook Pages',
    connectFacebook: 'Connect Facebook Page',
    aiContentGenerator: 'AI Content Generator',
    trendingTopics: 'Trending Topics',
    
    // Profile
    updateProfile: 'Update Profile',
    subscription: 'Subscription',
    postsRemaining: 'Posts Remaining',
    
    // Facebook Pages
    pageName: 'Page Name',
    pageId: 'Page ID',
    accessToken: 'Access Token',
    removePage: 'Remove Page',
    
    // AI Content
    generateContent: 'Generate Content',
    contentCategory: 'Content Category',
    contentTone: 'Content Tone',
    customPrompt: 'Custom Prompt (Optional)',
    generate: 'Generate',
    
    // Trending Topics
    trendingTopicsTitle: 'Trending Topics',
    fetchTrending: 'Fetch Trending Topics',
    generateContentForTopic: 'Generate Content',
    publish: 'Publish',
    
    // AI Permissions
    aiPermissions: 'AI Permissions',
    enableAi: 'Enable AI',
    disableAi: 'Disable AI',
    aiFullAccess: 'Full Access',
    aiAutoPublishing: 'Auto Publishing',
    aiPostScheduling: 'Post Scheduling',
    aiAutoContentGeneration: 'Auto Content Generation',
    aiPermissionAutoPublishingDesc: 'Allow the AI to automatically publish posts that the user has created and approved for scheduling',
    aiPermissionPostSchedulingDesc: 'Enable the AI to schedule multiple posts at specific times set by the user',
    aiPermissionAutoContentGenerationDesc: 'Allow the AI to automatically generate and publish posts based on trending topics detected by the system',
    // New AI Permissions
    'AI Permissions Panel': 'AI Permissions Panel',
    'Auto-Posting Access': 'Auto-Posting Access',
    'Trend-Based Post Creation': 'Trend-Based Post Creation',
    'Analytics Access': 'Analytics Access',
    'Comment & Interaction Mode': 'Comment & Interaction Mode',
    
    // Chat
    chatWithAI: 'Chat with AI',
    sendMessage: 'Send Message',
    typeYourMessage: 'Type your message...',
    
    // Settings
    language: 'Language',
    theme: 'Theme',
    notifications: 'Notifications',
    
    // Languages
    english: 'English',
    arabic: 'Arabic',
    french: 'French',
    german: 'German',
    spanish: 'Spanish',
    russian: 'Russian'
  },
  
  ar: {
    // Common
    loading: 'جار التحميل...',
    error: 'خطأ',
    success: 'نجاح',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    close: 'إغلاق',
    
    // Navigation
    dashboard: 'لوحة التحكم',
    analytics: 'التحليلات',
    automation: 'الأتمتة',
    settings: 'الإعدادات',
    profile: 'الملف الشخصي',
    logout: 'تسجيل الخروج',
    
    // Authentication
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    fullName: 'الاسم الكامل',
    username: 'اسم المستخدم',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    dontHaveAccount: 'ليس لديك حساب؟',
    
    // Dashboard
    welcome: 'مرحباً',
    facebookPages: 'صفحات فيسبوك',
    connectFacebook: 'ربط صفحة فيسبوك',
    aiContentGenerator: 'مولد المحتوى بالذكاء الاصطناعي',
    trendingTopics: 'المواضيع الشائعة',
    
    // Profile
    updateProfile: 'تحديث الملف الشخصي',
    subscription: 'الاشتراك',
    postsRemaining: 'المنشورات المتبقية',
    
    // Facebook Pages
    pageName: 'اسم الصفحة',
    pageId: 'معرف الصفحة',
    accessToken: 'رمز الوصول',
    removePage: 'إزالة الصفحة',
    
    // AI Content
    generateContent: 'توليد المحتوى',
    contentCategory: 'فئة المحتوى',
    contentTone: 'نبرة المحتوى',
    customPrompt: 'موجه مخصص (اختياري)',
    generate: 'توليد',
    
    // Trending Topics
    trendingTopicsTitle: 'المواضيع الشائعة',
    fetchTrending: 'جلب المواضيع الشائعة',
    generateContentForTopic: 'توليد المحتوى',
    publish: 'نشر',
    
    // AI Permissions
    aiPermissions: 'صلاحيات الذكاء الاصطناعي',
    enableAi: 'تفعيل الذكاء الاصطناعي',
    disableAi: 'تعطيل الذكاء الاصطناعي',
    aiFullAccess: 'وصول كامل',
    aiAutoPublishing: 'النشر التلقائي',
    aiPostScheduling: 'جدولة المنشورات',
    aiAutoContentGeneration: 'توليد المحتوى التلقائي',
    aiPermissionAutoPublishingDesc: 'السماح للذكاء الاصطناعي بنشر المنشورات تلقائياً التي أنشأها المستخدم ووافق عليها للجدولة',
    aiPermissionPostSchedulingDesc: 'تمكين الذكاء الاصطناعي من جدولة منشورات متعددة في أوقات محددة من قبل المستخدم',
    aiPermissionAutoContentGenerationDesc: 'السماح للذكاء الاصطناعي بإنشاء ونشر المنشورات تلقائياً بناءً على المواضيع الشائعة التي يكتشفها النظام',
    // New AI Permissions
    'AI Permissions Panel': 'لوحة صلاحيات الذكاء الاصطناعي',
    'Auto-Posting Access': 'الوصول للنشر التلقائي',
    'Trend-Based Post Creation': 'إنشاء منشورات بناءً على الاتجاهات',
    'Analytics Access': 'الوصول للتحليلات',
    'Comment & Interaction Mode': 'وضع التعليق والتفاعل',
    
    // Chat
    chatWithAI: 'الدردشة مع الذكاء الاصطناعي',
    sendMessage: 'إرسال الرسالة',
    typeYourMessage: 'اكتب رسالتك...',
    
    // Settings
    language: 'اللغة',
    theme: 'السمة',
    notifications: 'الإشعارات',
    
    // Languages
    english: 'الإنجليزية',
    arabic: 'العربية',
    french: 'الفرنسية',
    german: 'الألمانية',
    spanish: 'الإسبانية',
    russian: 'الروسية'
  },
  
  fr: {
    // Common
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    save: 'Sauvegarder',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    close: 'Fermer',
    
    // Navigation
    dashboard: 'Tableau de bord',
    analytics: 'Analytique',
    automation: 'Automatisation',
    settings: 'Paramètres',
    profile: 'Profil',
    logout: 'Se déconnecter',
    
    // Authentication
    login: 'Se connecter',
    signup: "S'inscrire",
    email: 'Email',
    password: 'Mot de passe',
    fullName: 'Nom complet',
    username: "Nom d'utilisateur",
    alreadyHaveAccount: 'Vous avez déjà un compte?',
    dontHaveAccount: 'Vous n\'avez pas de compte?',
    
    // Dashboard
    welcome: 'Bienvenue',
    facebookPages: 'Pages Facebook',
    connectFacebook: 'Connecter une page Facebook',
    aiContentGenerator: 'Générateur de contenu IA',
    trendingTopics: 'Sujets tendance',
    
    // Profile
    updateProfile: 'Mettre à jour le profil',
    subscription: 'Abonnement',
    postsRemaining: 'Publications restantes',
    
    // Facebook Pages
    pageName: 'Nom de la page',
    pageId: 'ID de la page',
    accessToken: "Jeton d'accès",
    removePage: 'Supprimer la page',
    
    // AI Content
    generateContent: 'Générer du contenu',
    contentCategory: 'Catégorie de contenu',
    contentTone: 'Ton du contenu',
    customPrompt: 'Invite personnalisée (facultatif)',
    generate: 'Générer',
    
    // Trending Topics
    trendingTopicsTitle: 'Sujets tendance',
    fetchTrending: 'Récupérer les sujets tendance',
    generateContentForTopic: 'Générer du contenu',
    publish: 'Publier',
    
    // AI Permissions
    aiPermissions: 'Autorisations IA',
    enableAi: 'Activer l\'IA',
    disableAi: 'Désactiver l\'IA',
    aiAutoPublishing: 'Publication automatique',
    aiPostScheduling: 'Planification de publications',
    aiAutoContentGeneration: 'Génération automatique de contenu',
    aiFullAccess: 'Accès complet',
    aiPermissionAutoPublishingDesc: 'Permettre à l\'IA de publier automatiquement les publications créées par l\'utilisateur et approuvées pour la planification',
    aiPermissionPostSchedulingDesc: 'Permettre à l\'IA de planifier plusieurs publications à des moments spécifiques définis par l\'utilisateur',
    aiPermissionAutoContentGenerationDesc: 'Permettre à l\'IA de générer et publier automatiquement des publications basées sur les sujets tendance détectés par le système',
    // New AI Permissions
    'AI Permissions Panel': 'Panneau des autorisations IA',
    'Auto-Posting Access': 'Accès à la publication automatique',
    'Trend-Based Post Creation': 'Création de publications basée sur les tendances',
    'Analytics Access': 'Accès aux analyses',
    'Comment & Interaction Mode': 'Mode commentaire et interaction',
    
    // Chat
    chatWithAI: 'Discuter avec l\'IA',
    sendMessage: 'Envoyer un message',
    typeYourMessage: 'Tapez votre message...',
    
    // Settings
    language: 'Langue',
    theme: 'Thème',
    notifications: 'Notifications',
    
    // Languages
    english: 'Anglais',
    arabic: 'Arabe',
    french: 'Français',
    german: 'Allemand',
    spanish: 'Espagnol',
    russian: 'Russe'
  },
  
  de: {
    // Common
    loading: 'Wird geladen...',
    error: 'Fehler',
    success: 'Erfolg',
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    add: 'Hinzufügen',
    close: 'Schließen',
    
    // Navigation
    dashboard: 'Dashboard',
    analytics: 'Analytik',
    automation: 'Automatisierung',
    settings: 'Einstellungen',
    profile: 'Profil',
    logout: 'Ausloggen',
    
    // Authentication
    login: 'Anmelden',
    signup: 'Registrieren',
    email: 'E-Mail',
    password: 'Passwort',
    fullName: 'Vollständiger Name',
    username: 'Benutzername',
    alreadyHaveAccount: 'Haben Sie bereits ein Konto?',
    dontHaveAccount: 'Haben Sie kein Konto?',
    
    // Dashboard
    welcome: 'Willkommen',
    facebookPages: 'Facebook-Seiten',
    connectFacebook: 'Facebook-Seite verbinden',
    aiContentGenerator: 'KI-Inhaltsgenerator',
    trendingTopics: 'Trendthemen',
    
    // Profile
    updateProfile: 'Profil aktualisieren',
    subscription: 'Abonnement',
    postsRemaining: 'Verbleibende Beiträge',
    
    // Facebook Pages
    pageName: 'Seitenname',
    pageId: 'Seiten-ID',
    accessToken: 'Zugriffstoken',
    removePage: 'Seite entfernen',
    
    // AI Content
    generateContent: 'Inhalt generieren',
    contentCategory: 'Inhaltskategorie',
    contentTone: 'Inhaltston',
    customPrompt: 'Benutzerdefinierte Aufforderung (optional)',
    generate: 'Generieren',
    
    // Trending Topics
    trendingTopicsTitle: 'Trendthemen',
    fetchTrending: 'Trendthemen abrufen',
    generateContentForTopic: 'Inhalt generieren',
    publish: 'Veröffentlichen',
    
    // AI Permissions
    aiPermissions: 'KI-Berechtigungen',
    enableAi: 'KI aktivieren',
    disableAi: 'KI deaktivieren',
    aiAutoPublishing: 'Automatische Veröffentlichung',
    aiPostScheduling: 'Beitragsplanung',
    aiAutoContentGeneration: 'Automatische Inhaltserstellung',
    aiFullAccess: 'Vollzugriff',
    aiPermissionAutoPublishingDesc: 'Erlauben Sie der KI, Beiträge automatisch zu veröffentlichen, die der Benutzer erstellt und für die Planung genehmigt hat',
    aiPermissionPostSchedulingDesc: 'Ermöglichen Sie der KI, mehrere Beiträge zu bestimmten vom Benutzer festgelegten Zeiten zu planen',
    aiPermissionAutoContentGenerationDesc: 'Erlauben Sie der KI, automatisch Beiträge basierend auf vom System erkannten Trendthemen zu generieren und zu veröffentlichen',
    // New AI Permissions
    'AI Permissions Panel': 'KI-Berechtigungen Panel',
    'Auto-Posting Access': 'Automatischer Veröffentlichungszugriff',
    'Trend-Based Post Creation': 'Trendbasierte Beitrags erstellung',
    'Analytics Access': 'Analysezugriff',
    'Comment & Interaction Mode': 'Kommentar- und Interaktionsmodus',
    
    // Chat
    chatWithAI: 'Mit KI chatten',
    sendMessage: 'Nachricht senden',
    typeYourMessage: 'Geben Sie Ihre Nachricht ein...',
    
    // Settings
    language: 'Sprache',
    theme: 'Thema',
    notifications: 'Benachrichtigungen',
    
    // Languages
    english: 'Englisch',
    arabic: 'Arabisch',
    french: 'Französisch',
    german: 'Deutsch',
    spanish: 'Spanisch',
    russian: 'Russisch'
  },
  
  es: {
    // Common
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    add: 'Agregar',
    close: 'Cerrar',
    
    // Navigation
    dashboard: 'Tablero',
    analytics: 'Analítica',
    automation: 'Automatización',
    settings: 'Configuraciones',
    profile: 'Perfil',
    logout: 'Cerrar sesión',
    
    // Authentication
    login: 'Iniciar sesión',
    signup: 'Registrarse',
    email: 'Correo electrónico',
    password: 'Contraseña',
    fullName: 'Nombre completo',
    username: 'Nombre de usuario',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    dontHaveAccount: '¿No tienes una cuenta?',
    
    // Dashboard
    welcome: 'Bienvenido',
    facebookPages: 'Páginas de Facebook',
    connectFacebook: 'Conectar página de Facebook',
    aiContentGenerator: 'Generador de contenido de IA',
    trendingTopics: 'Temas populares',
    
    // Profile
    updateProfile: 'Actualizar perfil',
    subscription: 'Suscripción',
    postsRemaining: 'Publicaciones restantes',
    
    // Facebook Pages
    pageName: 'Nombre de la página',
    pageId: 'ID de la página',
    accessToken: 'Token de acceso',
    removePage: 'Eliminar página',
    
    // AI Content
    generateContent: 'Generar contenido',
    contentCategory: 'Categoría de contenido',
    contentTone: 'Tono del contenido',
    customPrompt: 'Indicación personalizada (opcional)',
    generate: 'Generar',
    
    // Trending Topics
    trendingTopicsTitle: 'Temas populares',
    fetchTrending: 'Obtener temas populares',
    generateContentForTopic: 'Generar contenido',
    publish: 'Publicar',
    
    // AI Permissions
    aiPermissions: 'Permisos de IA',
    enableAi: 'Habilitar IA',
    disableAi: 'Deshabilitar IA',
    aiAutoPublishing: 'Publicación automática',
    aiPostScheduling: 'Programación de publicaciones',
    aiAutoContentGeneration: 'Generación automática de contenido',
    aiFullAccess: 'Acceso completo',
    aiPermissionAutoPublishingDesc: 'Permitir que la IA publique automáticamente publicaciones que el usuario haya creado y aprobado para programar',
    aiPermissionPostSchedulingDesc: 'Habilitar la IA para programar múltiples publicaciones en momentos específicos establecidos por el usuario',
    aiPermissionAutoContentGenerationDesc: 'Permitir que la IA genere y publique automáticamente publicaciones basadas en temas populares detectados por el sistema',
    // New AI Permissions
    'AI Permissions Panel': 'Panel de permisos de IA',
    'Auto-Posting Access': 'Acceso a publicación automática',
    'Trend-Based Post Creation': 'Creación de publicaciones basada en tendencias',
    'Analytics Access': 'Acceso a análisis',
    'Comment & Interaction Mode': 'Modo de comentario e interacción',
    
    // Chat
    chatWithAI: 'Chatear con IA',
    sendMessage: 'Enviar mensaje',
    typeYourMessage: 'Escribe tu mensaje...',
    
    // Settings
    language: 'Idioma',
    theme: 'Tema',
    notifications: 'Notificaciones',
    
    // Languages
    english: 'Inglés',
    arabic: 'Árabe',
    french: 'Francés',
    german: 'Alemán',
    spanish: 'Español',
    russian: 'Ruso'
  },
  
  ru: {
    // Common
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успех',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    add: 'Добавить',
    close: 'Закрыть',
    
    // Navigation
    dashboard: 'Панель управления',
    analytics: 'Аналитика',
    automation: 'Автоматизация',
    settings: 'Настройки',
    profile: 'Профиль',
    logout: 'Выйти',
    
    // Authentication
    login: 'Войти',
    signup: 'Зарегистрироваться',
    email: 'Электронная почта',
    password: 'Пароль',
    fullName: 'Полное имя',
    username: 'Имя пользователя',
    alreadyHaveAccount: 'Уже есть аккаунт?',
    dontHaveAccount: 'Нет аккаунта?',
    
    // Dashboard
    welcome: 'Добро пожаловать',
    facebookPages: 'Страницы Facebook',
    connectFacebook: 'Подключить страницу Facebook',
    aiContentGenerator: 'Генератор контента с ИИ',
    trendingTopics: 'Актуальные темы',
    
    // Profile
    updateProfile: 'Обновить профиль',
    subscription: 'Подписка',
    postsRemaining: 'Оставшиеся публикации',
    
    // Facebook Pages
    pageName: 'Название страницы',
    pageId: 'ID страницы',
    accessToken: 'Токен доступа',
    removePage: 'Удалить страницу',
    
    // AI Content
    generateContent: 'Сгенерировать контент',
    contentCategory: 'Категория контента',
    contentTone: 'Тон контента',
    customPrompt: 'Пользовательский запрос (необязательно)',
    generate: 'Сгенерировать',
    
    // Trending Topics
    trendingTopicsTitle: 'Актуальные темы',
    fetchTrending: 'Получить актуальные темы',
    generateContentForTopic: 'Сгенерировать контент',
    publish: 'Опубликовать',
    
    // AI Permissions
    aiPermissions: 'Разрешения ИИ',
    enableAi: 'Включить ИИ',
    disableAi: 'Отключить ИИ',
    aiAutoPublishing: 'Автоматическая публикация',
    aiPostScheduling: 'Планирование публикаций',
    aiAutoContentGeneration: 'Автоматическая генерация контента',
    aiFullAccess: 'Полный доступ',
    aiPermissionAutoPublishingDesc: 'Разрешить ИИ автоматически публиковать посты, созданные пользователем и одобренные для планирования',
    aiPermissionPostSchedulingDesc: 'Включить ИИ для планирования нескольких постов в определенное время, установленное пользователем',
    aiPermissionAutoContentGenerationDesc: 'Разрешить ИИ автоматически генерировать и публиковать посты на основе актуальных тем, обнаруженных системой',
    // New AI Permissions
    'AI Permissions Panel': 'Панель разрешений ИИ',
    'Auto-Posting Access': 'Доступ к автоматической публикации',
    'Trend-Based Post Creation': 'Создание постов на основе трендов',
    'Analytics Access': 'Доступ к аналитике',
    'Comment & Interaction Mode': 'Режим комментариев и взаимодействия',
    
    // Chat
    chatWithAI: 'Чат с ИИ',
    sendMessage: 'Отправить сообщение',
    typeYourMessage: 'Введите ваше сообщение...',
    
    // Settings
    language: 'Язык',
    theme: 'Тема',
    notifications: 'Уведомления',
    
    // Languages
    english: 'Английский',
    arabic: 'Арабский',
    french: 'Французский',
    german: 'Немецкий',
    spanish: 'Испанский',
    russian: 'Русский'
  }
};

export default translations;