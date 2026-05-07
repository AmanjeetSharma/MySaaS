// themeSync.utils.js
import { THEME_IDS, THEME_MODES } from '../theme/theme.constant.js';
import { applyUserTheme } from './theme.utils.js';

const STORAGE_KEYS = {
    THEME_NAME: 'app_theme_name',
    THEME_MODE: 'app_theme_mode'
};

export const saveThemeToLocalStorage = (themeName, themeMode) => {
    localStorage.setItem(STORAGE_KEYS.THEME_NAME, themeName);
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, themeMode);
};

export const getThemeFromLocalStorage = () => {
    const name = localStorage.getItem(STORAGE_KEYS.THEME_NAME);
    const mode = localStorage.getItem(STORAGE_KEYS.THEME_MODE);
    return {
        name: name || THEME_IDS.DEFAULT,
        mode: mode || THEME_MODES.DARK
    };
};

export const initializeThemeFromLocalStorage = () => {
    const { name, mode } = getThemeFromLocalStorage();
    applyUserTheme(name, mode);
    return { name, mode };
};

export const clearThemeFromLocalStorage = () => {
    localStorage.removeItem(STORAGE_KEYS.THEME_NAME);
    localStorage.removeItem(STORAGE_KEYS.THEME_MODE);
};

// NEW: Sync local storage with backend user theme
export const syncThemeWithBackend = (backendThemeName, backendThemeMode) => {
    const localTheme = getThemeFromLocalStorage();

    // If backend theme is different from local storage
    if (backendThemeName !== localTheme.name || backendThemeMode !== localTheme.mode) {
        // Apply backend theme
        applyUserTheme(backendThemeName, backendThemeMode);
        // Update local storage to match backend
        saveThemeToLocalStorage(backendThemeName, backendThemeMode);
        return true; // Theme was updated
    }

    return false; // Themes already match
};