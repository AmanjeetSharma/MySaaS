import { THEME_IDS, THEME_MODES } from '../constants/theme.constant';
import { applyUserTheme } from './theme.utils';

// Local storage keys
const STORAGE_KEYS = {
    THEME_NAME: 'app_theme_name',
    THEME_MODE: 'app_theme_mode'
};

// Save theme to localStorage
const saveThemeToLocalStorage = (themeName, themeMode) => {
    localStorage.setItem(STORAGE_KEYS.THEME_NAME, themeName);
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, themeMode);
};

// Get theme from localStorage
const getThemeFromLocalStorage = () => {
    const name = localStorage.getItem(STORAGE_KEYS.THEME_NAME);
    const mode = localStorage.getItem(STORAGE_KEYS.THEME_MODE);

    return {
        name: name || THEME_IDS.DEFAULT,
        mode: mode || THEME_MODES.DARK
    };
};


// Initialize theme from localStorage (called before app loads)
const initializeThemeFromLocalStorage = () => {
    const { name, mode } = getThemeFromLocalStorage();
    applyUserTheme(name, mode);
    return { name, mode };
};

// Clear theme from localStorage (on logout)
const clearThemeFromLocalStorage = () => {
    localStorage.removeItem(STORAGE_KEYS.THEME_NAME);
    localStorage.removeItem(STORAGE_KEYS.THEME_MODE);
};


export {
    saveThemeToLocalStorage,
    getThemeFromLocalStorage,
    initializeThemeFromLocalStorage,
    clearThemeFromLocalStorage
};