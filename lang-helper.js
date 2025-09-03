const defaultLang = 'en';
let currentLang = null;
let translations = {};
let isInitialized = false;

function getConfig() {
    return require('./config');
}

function loadTranslations() {
    if (currentLang === null) {
        currentLang = getConfig().language || defaultLang;
    }
    
    try {
        translations = require(`./lang/${currentLang}`);
        isInitialized = true;
    } catch (error) {
        const warningMsg = isInitialized ? 
            translations.errors?.languageNotFound || `Language file for '${currentLang}' not found, falling back to '${defaultLang}'` :
            `Language file for '${currentLang}' not found, falling back to '${defaultLang}'`;
        console.warn(warningMsg.replace('{language}', currentLang).replace('{defaultLang}', defaultLang));
        
        try {
            translations = require(`./lang/${defaultLang}`);
            currentLang = defaultLang;
            isInitialized = true;
        } catch (fallbackError) {
            const errorMsg = isInitialized ? 
                translations.errors?.defaultLanguageNotFound || 'Default language file not found' :
                'Default language file not found';
            console.error(errorMsg);
            translations = {};
        }
    }
}

function t(key, params = {}) {
    if (!isInitialized) {
        loadTranslations();
    }
    
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return key;
        }
    }
    
    if (typeof value !== 'string') {
        return key;
    }
    
    return value.replace(/\{(\w+)\}/g, (match, placeholder) => {
        return params[placeholder] || match;
    });
}

function setLanguage(lang) {
    currentLang = lang;
    loadTranslations();
}

function getCurrentLanguage() {
    if (currentLang === null) {
        currentLang = getConfig().language || defaultLang;
    }
    return currentLang;
}

module.exports = {
    t,
    setLanguage,
    getCurrentLanguage
};