// Multi-language support structure for DailyHunt clone

export const LANGUAGES = {
    en: {
        code: 'en',
        name: 'English',
        nativeName: 'English',
    },
    hi: {
        code: 'hi',
        name: 'Hindi',
        nativeName: 'हिंदी',
    },
    ta: {
        code: 'ta',
        name: 'Tamil',
        nativeName: 'தமிழ்',
    },
    te: {
        code: 'te',
        name: 'Telugu',
        nativeName: 'తెలుగు',
    },
    kn: {
        code: 'kn',
        name: 'Kannada',
        nativeName: 'ಕನ್ನಡ',
    },
    ml: {
        code: 'ml',
        name: 'Malayalam',
        nativeName: 'മലയാളം',
    },
    mr: {
        code: 'mr',
        name: 'Marathi',
        nativeName: 'मराठी',
    },
    gu: {
        code: 'gu',
        name: 'Gujarati',
        nativeName: 'ગુજરાતી',
    },
    bn: {
        code: 'bn',
        name: 'Bengali',
        nativeName: 'বাংলা',
    },
};

// Translations
const translations = {
    en: {
        home: 'Home',
        explore: 'Explore',
        saved: 'Saved',
        profile: 'Profile',
        search: 'Search news...',
        trending: 'Trending',
        latest: 'Latest News',
        popularTags: 'Popular Tags',
        localNews: 'Local News',
        categories: 'Categories',
        viewAll: 'View All',
        noBookmarks: 'No bookmarks yet',
        saveArticles: 'Save articles to read them later',
        darkMode: 'Dark Mode',
        account: 'Account',
        logOut: 'Log Out',
        loadMore: 'Load More',
        noResults: 'No results found',
        share: 'Share',
        bookmark: 'Bookmark',
    },
    hi: {
        home: 'होम',
        explore: 'एक्सप्लोर',
        saved: 'सहेजे गए',
        profile: 'प्रोफ़ाइल',
        search: 'समाचार खोजें...',
        trending: 'ट्रेंडिंग',
        latest: 'ताज़ा खबरें',
        popularTags: 'लोकप्रिय टैग',
        localNews: 'स्थानीय समाचार',
        categories: 'श्रेणियाँ',
        viewAll: 'सभी देखें',
        noBookmarks: 'अभी तक कोई बुकमार्क नहीं',
        saveArticles: 'बाद में पढ़ने के लिए लेख सहेजें',
        darkMode: 'डार्क मोड',
        account: 'खाता',
        logOut: 'लॉग आउट',
        loadMore: 'और लोड करें',
        noResults: 'कोई परिणाम नहीं मिला',
        share: 'साझा करें',
        bookmark: 'बुकमार्क',
    },
};

let currentLanguage = 'en';

export const i18n = {
    setLanguage: (langCode) => {
        if (LANGUAGES[langCode]) {
            currentLanguage = langCode;
        }
    },
    
    getLanguage: () => currentLanguage,
    
    t: (key) => {
        return translations[currentLanguage]?.[key] || translations.en[key] || key;
    },
    
    getAvailableLanguages: () => Object.values(LANGUAGES),
};

