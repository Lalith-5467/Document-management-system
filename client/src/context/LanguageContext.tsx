'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type SupportedLanguage = 'en' | 'ta' | 'hi';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ் (Tamil)' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी (Hindi)' },
];

const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Navigation & Sidebar
    dashboard: 'Dashboard',
    myWorkspace: 'My Workspace',
    myDocuments: 'My Documents',
    categories: 'Categories',
    folders: 'Workspace Folders',
    favorites: 'Favorites',
    recentDocuments: 'Recent Documents',
    trash: 'Recycle Bin',
    activity: 'Activity History',
    profile: 'Profile',
    settings: 'Settings',
    help: 'Help & Support',
    logout: 'Logout',
    upload: 'Upload Document',
    uploadDocument: 'Upload Document',
    needHelp: 'Need Help?',
    helpSub: 'Check our documentation or contact support',
    helpCenter: 'Help Center',

    // Header
    welcome: 'Welcome back',
    welcomeSub: 'Manage your documents, folders and categories in one secure place.',
    searchPlaceholder: 'Search documents, folders, categories...',
    notifications: 'Notifications',
    dark: 'Dark',
    light: 'Light',

    // Favorites Page
    favoriteDocuments: 'Favorite Documents',
    favoriteSub: 'Manage and quickly access your most important documents.',
    favoriteFiles: 'Favorite Files',
    categoriesCount: 'Categories',
    storageUsed: 'Storage Used',
    lastUpdated: 'Last Updated',
    allCategories: 'All Categories',
    allFileTypes: 'All File Types',
    sortByNewest: 'Sort By: Newest',
    sortByOldest: 'Sort By: Oldest',
    sortByName: 'Sort By: Name A-Z',
    sortBySize: 'Sort By: File Size',
    resetFilters: 'Reset',
    noFavoritesFound: 'No matching favorite documents found.',
    noFavoritesSub: 'Try adjusting your search query, category, or file type filter.',
    showing: 'Showing',
    results: 'results',
    perPage: 'per page',
    storageUsage: 'Storage Usage',
    upgradeStorage: 'Upgrade Storage',
    recentActivity: 'Recent Activity',
    needMoreStorage: 'Need More Storage?',
    upgradeSub: 'Upgrade your plan to store more documents securely.',
    upgradeNow: 'Upgrade Now',
    removeFromFavorites: 'Remove from Favorites?',
    removeConfirmSub: 'This will unstar the document',
    removeConfirmText: 'Are you sure you want to remove this document from your favorites?',
    remove: 'Remove',
    cancel: 'Cancel',
    download: 'Download',

    // Dashboard & Overview
    totalDocuments: 'Total Documents',
    activeFolders: 'Active Folders',
    quickUpload: 'Quick Upload',
    documentCategories: 'Document Categories',
    storageTrend: 'Storage Trend',

    // Settings
    settingsTitle: 'Settings & Preferences',
    settingsSubtitle: 'Manage account credentials, security preferences, theme, and storage allocations',
    profileTab: 'Profile',
    securityTab: 'Security',
    preferencesTab: 'Theme & Language',
    storageTab: 'Storage Quota',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    changePassword: 'Change Password',
    themeAndLanguage: 'Theme & Language',
    displayModeTheme: 'DISPLAY MODE THEME',
    preferredLanguage: 'PREFERRED LANGUAGE',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    cleanInterface: 'Clean interface',
    sleekDarkTheme: 'Sleek dark theme',
    saveProfileDetails: 'Save Profile Details',
    updatePassword: 'Update Password',
    saveChanges: 'Save Changes',
    savingChanges: 'Saving Changes...',
  },
  ta: {
    // Navigation & Sidebar
    dashboard: 'டாஷ்போர்டு',
    myWorkspace: 'என் பணிமேடை',
    myDocuments: 'என் ஆவணங்கள்',
    categories: 'வகைகள்',
    folders: 'கோப்புறைகள்',
    favorites: 'விருப்பமானவை',
    recentDocuments: 'சமீபத்திய ஆவணங்கள்',
    trash: 'குப்பைத் தொட்டி',
    activity: 'செயல்பாட்டு வரலாறு',
    profile: 'சுயவிவரம்',
    settings: 'அமைப்புகள்',
    help: 'உதவி & ஆதரவு',
    logout: 'வெளியேறு',
    upload: 'ஆவணத்தைப் பதிவேற்று',
    uploadDocument: 'ஆவணத்தைப் பதிவேற்று',
    needHelp: 'உதவி தேவையா?',
    helpSub: 'எங்கள் ஆவணங்களைப் பார்க்கவும் அல்லது ஆதரவைத் தொடர்பு கொள்ளவும்',
    helpCenter: 'உதவி மையம்',

    // Header
    welcome: 'மீண்டும் வருக',
    welcomeSub: 'உங்கள் ஆவணங்கள், கோப்புறைகள் மற்றும் வகைகளை பாதுகாப்பாக நிர்வகிக்கவும்.',
    searchPlaceholder: 'ஆவணங்கள், கோப்புறைகளைத் தேடுங்கள்...',
    notifications: 'அறிவிப்புகள்',
    dark: 'இருண்ட',
    light: 'வெளிச்சமான',

    // Favorites Page
    favoriteDocuments: 'விருப்பமான ஆவணங்கள்',
    favoriteSub: 'உங்கள் முக்கிய ஆவணங்களை ஒரே இடத்தில் அணுகவும் நிர்வகிக்கவும்.',
    favoriteFiles: 'விருப்பமான கோப்புகள்',
    categoriesCount: 'வகைகள்',
    storageUsed: 'பயன்படுத்தப்பட்ட சேமிப்பகம்',
    lastUpdated: 'கடைசியாக புதுப்பிக்கப்பட்டது',
    allCategories: 'எல்லா வகைகளும்',
    allFileTypes: 'எல்லா கோப்பு வகைகளும்',
    sortByNewest: 'வரிசைப்படுத்து: புதியவை',
    sortByOldest: 'வரிசைப்படுத்து: பழையவை',
    sortByName: 'வரிசைப்படுத்து: பெயர் ஏ-இசட்',
    sortBySize: 'வரிசைப்படுத்து: கோப்பு அளவு',
    resetFilters: 'மீட்டமை',
    noFavoritesFound: 'விருப்பமான ஆவணங்கள் எதுவும் கிடைக்கவில்லை.',
    noFavoritesSub: 'உங்கள் தேடல் அல்லது வடிகட்டிகளை மாற்றி முயற்சிக்கவும்.',
    showing: 'காண்பிக்கப்படுகிறது',
    results: 'முடிவுகள்',
    perPage: 'பக்கத்திற்கு',
    storageUsage: 'சேமிப்பக பயன்பாடு',
    upgradeStorage: 'சேமிப்பகத்தை உயர்த்துக',
    recentActivity: 'சமீபத்திய செயல்பாடு',
    needMoreStorage: 'கூடுதல் சேமிப்பகம் தேவையா?',
    upgradeSub: 'உங்கள் ஆவணங்களை பாதுகாப்பாக சேமிக்க திட்டத்தை உயர்த்தவும்.',
    upgradeNow: 'இப்போதே உயர்த்துக',
    removeFromFavorites: 'விருப்பமானவற்றிலிருந்து நீக்கவா?',
    removeConfirmSub: 'இது ஆவணத்தின் நட்சத்திர குறியீட்டை நீக்கும்',
    removeConfirmText: 'இந்த ஆவணத்தை விருப்பமானவற்றிலிருந்து நிச்சயமாக நீக்க விரும்புகிறீர்களா?',
    remove: 'நீக்கு',
    cancel: 'ரத்து செய்',
    download: 'பதிவிறக்கு',

    // Dashboard & Overview
    totalDocuments: 'மொத்த ஆவணங்கள்',
    activeFolders: 'செயலில் உள்ள கோப்புறைகள்',
    quickUpload: 'வேகமான பதிவேற்றம்',
    documentCategories: 'ஆவண வகைகள்',
    storageTrend: 'சேமிப்பக போக்கு',

    // Settings
    settingsTitle: 'அமைப்புகள் & விருப்பங்கள்',
    settingsSubtitle: 'கணக்கு விவரங்கள், பாதுகாப்பு, தீம் மற்றும் சேமிப்பக அமைப்புகளை நிர்வகிக்கவும்',
    profileTab: 'சுயவிவரம்',
    securityTab: 'பாதுகாப்பு',
    preferencesTab: 'தீம் & மொழி',
    storageTab: 'சேமிப்பக அளவு',
    fullName: 'முழு பெயர்',
    emailAddress: 'மின்னஞ்சல் முகவரி',
    changePassword: 'கடவுச்சொல்லை மாற்றவும்',
    themeAndLanguage: 'தீம் & மொழி',
    displayModeTheme: 'காட்சி முறை தீம்',
    preferredLanguage: 'விருப்பமான மொழி',
    lightMode: 'லைட் மோட்',
    darkMode: 'டார்க் மோட்',
    cleanInterface: 'தெளிவான இடைமுகம்',
    sleekDarkTheme: 'நவீன இருண்ட தீம்',
    saveProfileDetails: 'சுயவிவரத்தைச் சேமி',
    updatePassword: 'கடவுச்சொல்லை புதுப்பித்தல்',
    saveChanges: 'மாற்றங்களைச் சேமி',
    savingChanges: 'மாற்றங்கள் சேமிக்கப்படுகின்றன...',
  },
  hi: {
    // Navigation & Sidebar
    dashboard: 'डैशबोर्ड',
    myWorkspace: 'मेरा कार्यक्षेत्र',
    myDocuments: 'मेरे दस्तावेज़',
    categories: 'श्रेणियाँ',
    folders: 'कार्यक्षेत्र फ़ोल्डर',
    favorites: 'पसंदीदा',
    recentDocuments: 'हाल के दस्तावेज़',
    trash: 'रीसायकल बिन',
    activity: 'गतिविधि इतिहास',
    profile: 'प्रोफ़ाइल',
    settings: 'सेटिंग्स',
    help: 'सहायता और सहायता',
    logout: 'लॉग आउट',
    upload: 'दस्तावेज़ अपलोड करें',
    uploadDocument: 'दस्तावेज़ अपलोड करें',
    needHelp: 'क्या आपको मदद चाहिए?',
    helpSub: 'हमारे दस्तावेज़ देखें या सहायता टीम से संपर्क करें',
    helpCenter: 'सहायता केंद्र',

    // Header
    welcome: 'वापसी पर स्वागत है',
    welcomeSub: 'अपने दस्तावेज़ों, फ़ोल्डरों और श्रेणियों को एक ही सुरक्षित स्थान पर प्रबंधित करें।',
    searchPlaceholder: 'दस्तावेज़, फ़ोल्डर खोजें...',
    notifications: 'सूचनाएं',
    dark: 'डार्क',
    light: 'लाइट',

    // Favorites Page
    favoriteDocuments: 'पसंदीदा दस्तावेज़',
    favoriteSub: 'अपने सबसे महत्वपूर्ण दस्तावेज़ों को एक सुरक्षित स्थान से प्रबंधित और एक्सेस करें।',
    favoriteFiles: 'पसंदीदा फ़ाइलें',
    categoriesCount: 'श्रेणियाँ',
    storageUsed: 'प्रयुक्त संग्रहण',
    lastUpdated: 'अंतिम अद्यतन',
    allCategories: 'सभी श्रेणियाँ',
    allFileTypes: 'सभी फ़ाइल प्रकार',
    sortByNewest: 'क्रमानुसार: नवीनतम',
    sortByOldest: 'क्रमानुसार: सबसे पुराना',
    sortByName: 'क्रमानुसार: नाम A-Z',
    sortBySize: 'क्रमानुसार: फ़ाइल आकार',
    resetFilters: 'रीसेट करें',
    noFavoritesFound: 'कोई पसंदीदा दस्तावेज़ नहीं मिला।',
    noFavoritesSub: 'कृपया अपनी खोज या फ़िल्टर बदलकर प्रयास करें।',
    showing: 'दर्शाया जा रहा है',
    results: 'परिणाम',
    perPage: 'प्रति पृष्ठ',
    storageUsage: 'संग्रहण उपयोग',
    upgradeStorage: 'संग्रहण अपग्रेड करें',
    recentActivity: 'हाल की गतिविधि',
    needMoreStorage: 'अधिक संग्रहण चाहिए?',
    upgradeSub: 'अधिक दस्तावेज़ों को सुरक्षित रूप से सहेजने के लिए प्लान अपग्रेड करें।',
    upgradeNow: 'अभी अपग्रेड करें',
    removeFromFavorites: 'पसंदीदा से हटाएं?',
    removeConfirmSub: 'यह दस्तावेज़ का स्टार हटा देगा',
    removeConfirmText: 'क्या आप निश्चित रूप से इस दस्तावेज़ को पसंदीदा से हटाना चाहते हैं?',
    remove: 'हटाएं',
    cancel: 'रद्द करें',
    download: 'डाउनलोड करें',

    // Dashboard & Overview
    totalDocuments: 'कुल दस्तावेज़',
    activeFolders: 'सक्रिय फ़ोल्डर',
    quickUpload: 'त्वरित अपलोड',
    documentCategories: 'दस्तावेज़ श्रेणियाँ',
    storageTrend: 'संग्रहण रुझान',

    // Settings
    settingsTitle: 'सेटिंग्स और प्राथमिकताएं',
    settingsSubtitle: 'खाता क्रेडेंशियल, सुरक्षा, थीम और संग्रहण प्राथमिकताओं को प्रबंधित करें',
    profileTab: 'प्रोफ़ाइल',
    securityTab: 'सुरक्षा',
    preferencesTab: 'थीम और भाषा',
    storageTab: 'संग्रहण कोटा',
    fullName: 'पूरा नाम',
    emailAddress: 'ईमेल पता',
    changePassword: 'पासवर्ड बदलें',
    themeAndLanguage: 'थीम और भाषा',
    displayModeTheme: 'डिस्प्ले मोड थीम',
    preferredLanguage: 'पसंदीदा भाषा',
    lightMode: 'लाइट मोड',
    darkMode: 'डार्क मोड',
    cleanInterface: 'साफ़ इंटरफ़ेस',
    sleekDarkTheme: 'आकर्षक डार्क थीम',
    saveProfileDetails: 'प्रोफ़ाइल विवरण सहेजें',
    updatePassword: 'पासवर्ड अपडेट करें',
    saveChanges: 'परिवर्तन सहेजें',
    savingChanges: 'सहेजा जा रहा है...',
  }
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, defaultText?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('dms_language') as SupportedLanguage | null;
    if (savedLang && (LANGUAGE_OPTIONS.some(o => o.code === savedLang))) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    localStorage.setItem('dms_language', newLang);
  };

  const t = (key: string, defaultText?: string): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (dict[key]) return dict[key];
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en' as SupportedLanguage,
      setLanguage: () => {},
      t: (key: string, defaultText?: string) => defaultText || key,
    };
  }
  return context;
}
