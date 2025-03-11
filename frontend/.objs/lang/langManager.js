"use strict";
function setLanguagePreference(lang) {
    // TODO: Change this to set the changement in database
    localStorage.setItem('language', lang);
}
function updateContent(languageData, lang) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key && languageData[key]) {
            element.innerHTML = languageData[key];
        }
    });
    const htmlLangAttribute = document.querySelector('html');
    if (htmlLangAttribute) {
        htmlLangAttribute.setAttribute('lang', lang);
    }
}
async function fetchLanguageData(lang) {
    const response = await fetch(`src/lang/languages/${lang}.json`);
    return response.json();
}
async function changeLanguage(lang) {
    setLanguagePreference(lang);
    const languageData = await fetchLanguageData(lang);
    updateContent(languageData, lang);
}
// for the language management
window.addEventListener('DOMContentLoaded', async () => {
    // TODO: changer ca par un appel api qui connait la langue de l'user
    const userPreferredLanguage = localStorage.getItem('language') || 'en';
    const langData = await fetchLanguageData(userPreferredLanguage);
    updateContent(langData, userPreferredLanguage);
});
window.changeLanguage = changeLanguage;
//# sourceMappingURL=langManager.js.map