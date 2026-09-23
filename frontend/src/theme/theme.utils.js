// theme.utils.js
import { themeProfiles } from '../config/theme.config.js';
import { THEME_IDS, THEME_MODES } from './theme.constant.js';

export const PUBLIC_THEME = {
    name: THEME_IDS.DEFAULT,
    mode: THEME_MODES.DARK,
};

/**
 * Applies the theme to the document root based on backend response
 * @param {string} backendThemeId - e.g., "slate-orange"
 * @param {string} backendMode - e.g., "dark" or "light"
 */

export const getEffectiveThemeMode = (mode) => {
    if (mode === THEME_MODES.SYSTEM || !mode) {
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches
                ? THEME_MODES.DARK
                : THEME_MODES.LIGHT;
        }
        return THEME_MODES.DARK;
    }
    return mode;
};

let activeThemeId = THEME_IDS.DEFAULT;
let activeThemeMode = THEME_MODES.SYSTEM;
let systemMediaListenerAttached = false;

const handleGlobalSystemChange = () => {
    if (activeThemeMode === THEME_MODES.SYSTEM) {
        applyUserTheme(activeThemeId, THEME_MODES.SYSTEM);
    }
};

export const applyUserTheme = (backendThemeId, backendMode) => {
    activeThemeId = backendThemeId || THEME_IDS.DEFAULT;
    activeThemeMode = backendMode || THEME_MODES.SYSTEM;

    // Attach global media listener once if system mode is used
    if (typeof window !== 'undefined' && window.matchMedia && !systemMediaListenerAttached) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        if (mediaQuery?.addEventListener) {
            mediaQuery.addEventListener('change', handleGlobalSystemChange);
        } else if (mediaQuery?.addListener) {
            mediaQuery.addListener(handleGlobalSystemChange);
        }
        systemMediaListenerAttached = true;
    }

    // 1. Direct Lookup with Fallback: 
    // If backendThemeId is null or invalid, it defaults to THEME_IDS.DEFAULT
    const selectedTheme = themeProfiles[backendThemeId] || themeProfiles[THEME_IDS.DEFAULT];

    // 2. Resolve system preference if applicable
    const resolvedMode = getEffectiveThemeMode(backendMode);

    // 3. Validate Mode with Fallback:
    const validMode = [THEME_MODES.LIGHT, THEME_MODES.DARK].includes(resolvedMode)
        ? resolvedMode
        : THEME_MODES.LIGHT;

    // 4. Extract the actual CSS variables
    const cssVariables = selectedTheme.mode[validMode];

    // 5. Inject variables into the HTML :root
    const root = document.documentElement;

    Object.entries(cssVariables).forEach(([cssVar, hexValue]) => {
        root.style.setProperty(cssVar, hexValue);
    });

    if (validMode === THEME_MODES.DARK) {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
};

export const applyPublicTheme = () => {
    applyUserTheme(PUBLIC_THEME.name, PUBLIC_THEME.mode);
};
