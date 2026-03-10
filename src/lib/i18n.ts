// Internationalization configuration
export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const translations = {
  en: {
    // Common
    appName: 'AI Receptionist',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    noData: 'No data available',
    
    // Navigation
    dashboard: 'Dashboard',
    customers: 'Customers',
    callHistory: 'Call History',
    booking: 'Booking',
    settings: 'Settings',
    logout: 'Logout',
    
    // Login
    login: 'Login',
    email: 'Email',
    password: 'Password',
    adminLogin: 'Admin Login',
    loginButton: 'Sign In',
    invalidCredentials: 'Invalid email or password',
    
    // Dashboard
    todayAppointments: "Today's Appointments",
    totalCustomers: 'Total Customers',
    upcomingAppointments: 'Upcoming Appointments',
    recentActivity: 'Recent Activity',
    noAppointments: 'No appointments scheduled',
    
    // Customers
    customerList: 'Customer List',
    addCustomer: 'Add Customer',
    customerName: 'Name',
    customerEmail: 'Email',
    customerPhone: 'Phone',
    customerNotes: 'Notes',
    noCustomers: 'No customers yet',
    
    // Booking
    bookAppointment: 'Book Appointment',
    selectService: 'Select Service',
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    yourName: 'Your Name',
    yourEmail: 'Your Email',
    yourPhone: 'Your Phone',
    notes: 'Notes (optional)',
    bookNow: 'Book Now',
    appointmentBooked: 'Appointment booked successfully!',
    
    // Settings
    apiSettings: 'API Settings',
    calComApiKey: 'Cal.com API Key',
    elevenLabsApiKey: 'ElevenLabs API Key',
    supabaseUrl: 'Supabase URL',
    supabaseAnonKey: 'Supabase Anon Key',
    languageSettings: 'Language Settings',
    selectLanguage: 'Select Language',
    english: 'English',
    french: 'French',
    settingsSaved: 'Settings saved successfully!',
  },
  fr: {
    // Common
    appName: 'Réceptionniste IA',
    loading: 'Chargement...',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    search: 'Rechercher',
    noData: 'Aucune donnée disponible',
    
    // Navigation
    dashboard: 'Tableau de bord',
    customers: 'Clients',
    callHistory: 'Historique d\'appels',
    booking: 'Réservation',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    
    // Login
    login: 'Connexion',
    email: 'Courriel',
    password: 'Mot de passe',
    adminLogin: 'Connexion Admin',
    loginButton: 'Se connecter',
    invalidCredentials: 'Courriel ou mot de passe invalide',
    
    // Dashboard
    todayAppointments: "Rendez-vous d'aujourd'hui",
    totalCustomers: 'Total Clients',
    upcomingAppointments: 'Prochains Rendez-vous',
    recentActivity: 'Activité Récente',
    noAppointments: 'Aucun rendez-vous prévu',
    
    // Customers
    customerList: 'Liste des Clients',
    addCustomer: 'Ajouter un Client',
    customerName: 'Nom',
    customerEmail: 'Courriel',
    customerPhone: 'Téléphone',
    customerNotes: 'Notes',
    noCustomers: 'Pas encore de clients',
    
    // Booking
    bookAppointment: 'Réserver un Rendez-vous',
    selectService: 'Sélectionner un Service',
    selectDate: 'Sélectionner une Date',
    selectTime: 'Sélectionner une Heure',
    yourName: 'Votre Nom',
    yourEmail: 'Votre Courriel',
    yourPhone: 'Votre Téléphone',
    notes: 'Notes (optionnel)',
    bookNow: 'Réserver Maintenant',
    appointmentBooked: 'Rendez-vous réservé avec succès!',
    
    // Settings
    apiSettings: 'Paramètres API',
    calComApiKey: 'Clé API Cal.com',
    elevenLabsApiKey: 'Clé API ElevenLabs',
    supabaseUrl: 'URL Supabase',
    supabaseAnonKey: 'Clé Anon Supabase',
    languageSettings: 'Paramètres de Langue',
    selectLanguage: 'Sélectionner la Langue',
    english: 'Anglais',
    french: 'Français',
    settingsSaved: 'Paramètres enregistrés avec succès!',
  }
};

export type TranslationKey = keyof typeof translations.en;
