import ru from './ru.js';
import en from './en.js';

const STORAGE_KEY = 'where-to-go-lang';
const translations = { ru, en };

function detectLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && translations[saved]) return saved;
  } catch {}
  const browserLang = navigator.language?.slice(0, 2);
  return browserLang === 'ru' ? 'ru' : 'en';
}

export const i18n = $state({
  locale: detectLanguage(),
});

export function setLocale(lang) {
  i18n.locale = lang;
  try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
}

export function t(key) {
  return translations[i18n.locale]?.[key] ?? translations.ru[key] ?? key;
}

export function tf(key, ...args) {
  const fn = translations[i18n.locale]?.[key] ?? translations.ru[key];
  return typeof fn === 'function' ? fn(...args) : fn ?? key;
}
