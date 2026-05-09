// theme.config.js
import { THEME_IDS } from '../theme/theme.constant.js';

export const themeProfiles = {
    [THEME_IDS.DEFAULT]: {
        name: "Default",
        tier: "free",
        mode: {
            light: {
                "--background": "#ffffff",
                "--foreground": "#09090b",
                "--card": "#ffffff",
                "--card-foreground": "#09090b",
                "--popover": "#ffffff",
                "--popover-foreground": "#09090b",
                "--primary": "#18181b",
                "--primary-foreground": "#fafafa",
                "--secondary": "#f4f4f5",
                "--secondary-foreground": "#18181b",
                "--muted": "#f4f4f5",
                "--muted-foreground": "#71717a",
                "--accent": "#f4f4f5",
                "--accent-foreground": "#18181b",
                "--destructive": "#ef4444",
                "--success": "#22c55e",
                "--warning": "#f59e0b",
                "--border": "#e4e4e7",
                "--input": "#e4e4e7",
                "--ring": "#18181b",
                "--radius": "0.5rem",
                "--sidebar": "#ffffff",
                "--sidebar-foreground": "#18181b",
                "--sidebar-primary": "#18181b",
                "--sidebar-primary-foreground": "#fafafa",
                "--sidebar-accent": "#f4f4f5",
                "--sidebar-accent-foreground": "#18181b",
                "--sidebar-border": "#e4e4e7",
                "--sidebar-ring": "#18181b",
            },
            dark: {
                "--background": "#000000",
                "--foreground": "#fafafa",

                "--card": "#050505",
                "--card-foreground": "#fafafa",

                "--popover": "#050505",
                "--popover-foreground": "#fafafa",

                "--primary": "#ffffff",
                "--primary-foreground": "#000000",

                "--secondary": "#0f0f10",
                "--secondary-foreground": "#fafafa",

                "--muted": "#111111",
                "--muted-foreground": "#8b8b93",

                "--accent": "#141414",
                "--accent-foreground": "#ffffff",

                "--destructive": "#dc2626",
                "--success": "#15803d",
                "--warning": "#a16207",

                "--border": "#1a1a1a",
                "--input": "#121212",
                "--ring": "#52525b",

                "--radius": "0.5rem",

                "--sidebar": "#000000",
                "--sidebar-foreground": "#fafafa",

                "--sidebar-primary": "#ffffff",
                "--sidebar-primary-foreground": "#000000",

                "--sidebar-accent": "#111111",
                "--sidebar-accent-foreground": "#ffffff",

                "--sidebar-border": "#1a1a1a",
                "--sidebar-ring": "#52525b",
            }
        }
    },
    [THEME_IDS.OCEAN_TEAL]: {
        name: "Ocean Teal",
        tier: "pro",
        mode: {
            light: {
                "--background": "#f2fffd",
                "--foreground": "#102a2a",

                "--card": "#ffffff",
                "--card-foreground": "#102a2a",

                "--popover": "#ffffff",
                "--popover-foreground": "#102a2a",

                "--primary": "#0f766e",
                "--primary-foreground": "#ffffff",

                "--secondary": "#d7f5f1",
                "--secondary-foreground": "#134e4a",

                "--muted": "#ecfdfb",
                "--muted-foreground": "#5b8f8a",

                "--accent": "#14b8a6",
                "--accent-foreground": "#ffffff",

                "--destructive": "#dc2626",
                "--success": "#059669",
                "--warning": "#d97706",

                "--border": "#c7ebe6",
                "--input": "#dff7f3",
                "--ring": "#14b8a6",

                "--radius": "0.75rem",

                "--sidebar": "#fcfffe",
                "--sidebar-foreground": "#102a2a",

                "--sidebar-primary": "#0f766e",
                "--sidebar-primary-foreground": "#ffffff",

                "--sidebar-accent": "#e6faf7",
                "--sidebar-accent-foreground": "#134e4a",

                "--sidebar-border": "#c7ebe6",
                "--sidebar-ring": "#14b8a6",
            },

            dark: {
                "--background": "#000000",
                "--foreground": "#ecfeff",

                /* Layered surfaces */
                "--card": "#071010",
                "--card-foreground": "#ecfeff",

                "--popover": "#0a1414",
                "--popover-foreground": "#ecfeff",

                /* Brand identity */
                "--primary": "#2dd4bf",
                "--primary-foreground": "#001312",

                "--secondary": "#0f1b1b",
                "--secondary-foreground": "#d7fffb",

                "--muted": "#132121",
                "--muted-foreground": "#7db5af",

                "--accent": "#103232",
                "--accent-foreground": "#ccfbf1",

                "--destructive": "#dc2626",
                "--success": "#059669",
                "--warning": "#d97706",

                /* Subtle teal borders */
                "--border": "#183838",
                "--input": "#112525",

                "--ring": "#2dd4bf",

                "--radius": "0.75rem",

                /* Sidebar */
                "--sidebar": "#040808",
                "--sidebar-foreground": "#ecfeff",

                "--sidebar-primary": "#2dd4bf",
                "--sidebar-primary-foreground": "#001312",

                "--sidebar-accent": "#0f1f1f",
                "--sidebar-accent-foreground": "#d7fffb",

                "--sidebar-border": "#163232",
                "--sidebar-ring": "#2dd4bf",
            }
        }
    },
    [THEME_IDS.MIDNIGHT_VIOLET]: {
        name: "Midnight Violet",
        tier: "pro",
        mode: {
            light: {
                "--background": "#faf9ff",
                "--foreground": "#160b2e",
                "--card": "#ffffff",
                "--card-foreground": "#160b2e",
                "--popover": "#ffffff",
                "--popover-foreground": "#160b2e",
                "--primary": "#6d28d9",
                "--primary-foreground": "#ffffff",
                "--secondary": "#ede9fe",
                "--secondary-foreground": "#160b2e",
                "--muted": "#f5f3ff",
                "--muted-foreground": "#7c7c8a",
                "--accent": "#8b5cf6",
                "--accent-foreground": "#ffffff",
                "--destructive": "#ef4444",
                "--success": "#10b981",
                "--warning": "#f59e0b",
                "--border": "#e4e4e7",
                "--input": "#e4e4e7",
                "--ring": "#6d28d9",
                "--radius": "0.75rem",
                "--sidebar": "#ffffff",
                "--sidebar-foreground": "#160b2e",
                "--sidebar-primary": "#6d28d9",
                "--sidebar-primary-foreground": "#ffffff",
                "--sidebar-accent": "#f5f3ff",
                "--sidebar-accent-foreground": "#160b2e",
                "--sidebar-border": "#e4e4e7",
                "--sidebar-ring": "#6d28d9",
            },
            dark: {
                "--background": "#020008",
                "--foreground": "#f5f3ff",

                /* Surface hierarchy */
                "--card": "#0a0414",
                "--card-foreground": "#f5f3ff",

                "--popover": "#10071d",
                "--popover-foreground": "#f5f3ff",

                /* Brand */
                "--primary": "#8b5cf6",
                "--primary-foreground": "#050011",

                /* Layered surfaces */
                "--secondary": "#181028",
                "--secondary-foreground": "#ede9fe",

                "--muted": "#120c20",
                "--muted-foreground": "#a8a0bd",

                /* Hover/accent */
                "--accent": "#5b21b6",
                "--accent-foreground": "#f5f3ff",

                "--destructive": "#dc2626",
                "--success": "#15803d",
                "--warning": "#ca8a04",

                /* Softer premium borders */
                "--border": "#24163f",
                "--input": "#1a122e",

                "--ring": "#8b5cf6",

                "--radius": "0.75rem",

                /* Sidebar */
                "--sidebar": "#06020f",
                "--sidebar-foreground": "#f5f3ff",

                "--sidebar-primary": "#8b5cf6",
                "--sidebar-primary-foreground": "#050011",

                "--sidebar-accent": "#140d24",
                "--sidebar-accent-foreground": "#ede9fe",

                "--sidebar-border": "#24163f",
                "--sidebar-ring": "#8b5cf6",
            }
        }
    },
    [THEME_IDS.FOREST_AMBER]: {
        name: "Forest Amber",
        tier: "pro",
        mode: {
            light: {
                "--background": "#f7f9f2",
                "--foreground": "#1a2416",
                "--card": "#ffffff",
                "--card-foreground": "#1a2416",
                "--popover": "#ffffff",
                "--popover-foreground": "#1a2416",
                "--primary": "#4a7c2e",
                "--primary-foreground": "#ffffff",
                "--secondary": "#e8f0e0",
                "--secondary-foreground": "#1a2416",
                "--muted": "#edf3e6",
                "--muted-foreground": "#5e7052",
                "--accent": "#d97706",
                "--accent-foreground": "#ffffff",
                "--destructive": "#ef4444",
                "--success": "#22c55e",
                "--warning": "#eab308",
                "--border": "#dce5d0",
                "--input": "#dce5d0",
                "--ring": "#4a7c2e",
                "--radius": "0.5rem",
                "--sidebar": "#ffffff",
                "--sidebar-foreground": "#1a2416",
                "--sidebar-primary": "#4a7c2e",
                "--sidebar-primary-foreground": "#ffffff",
                "--sidebar-accent": "#f0f5e8",
                "--sidebar-accent-foreground": "#1a2416",
                "--sidebar-border": "#dce5d0",
                "--sidebar-ring": "#4a7c2e",
            },
            dark: {
                "--background": "#060904",
                "--foreground": "#edf7e7",

                /* Layered forest surfaces */
                "--card": "#0d1409",
                "--card-foreground": "#edf7e7",

                "--popover": "#11180d",
                "--popover-foreground": "#edf7e7",

                /* Brand */
                "--primary": "#84cc16",
                "--primary-foreground": "#081005",

                /* Elevated surfaces */
                "--secondary": "#182313",
                "--secondary-foreground": "#edf7e7",

                "--muted": "#131b10",
                "--muted-foreground": "#91a38a",

                /* Accent */
                "--accent": "#ca8a04",
                "--accent-foreground": "#081005",

                "--destructive": "#dc2626",
                "--success": "#15803d",
                "--warning": "#a16207",

                /* Organic borders */
                "--border": "#24301d",
                "--input": "#1a2415",

                "--ring": "#84cc16",

                "--radius": "0.5rem",

                /* Sidebar */
                "--sidebar": "#0a0f07",
                "--sidebar-foreground": "#edf7e7",

                "--sidebar-primary": "#84cc16",
                "--sidebar-primary-foreground": "#081005",

                "--sidebar-accent": "#151f11",
                "--sidebar-accent-foreground": "#edf7e7",

                "--sidebar-border": "#24301d",
                "--sidebar-ring": "#84cc16",
            }
        }
    },
    [THEME_IDS.ROSE_QUARTZ]: {
        name: "Rose Quartz",
        tier: "pro",
        mode: {
            light: {
                "--background": "#fff5f7",
                "--foreground": "#4a0519",
                "--card": "#ffffff",
                "--card-foreground": "#4a0519",
                "--popover": "#ffffff",
                "--popover-foreground": "#4a0519",
                "--primary": "#e11d48",
                "--primary-foreground": "#ffffff",
                "--secondary": "#ffe6ea",
                "--secondary-foreground": "#4a0519",
                "--muted": "#fff0f3",
                "--muted-foreground": "#9f5a6b",
                "--accent": "#be123c",
                "--accent-foreground": "#ffffff",
                "--destructive": "#ef4444",
                "--success": "#10b981",
                "--warning": "#f59e0b",
                "--border": "#fecdd3",
                "--input": "#fecdd3",
                "--ring": "#e11d48",
                "--radius": "1rem",
                "--sidebar": "#ffffff",
                "--sidebar-foreground": "#4a0519",
                "--sidebar-primary": "#e11d48",
                "--sidebar-primary-foreground": "#ffffff",
                "--sidebar-accent": "#fff0f3",
                "--sidebar-accent-foreground": "#4a0519",
                "--sidebar-border": "#fecdd3",
                "--sidebar-ring": "#e11d48",
            },
            dark: {
                "--background": "#140006",
                "--foreground": "#fff0f3",

                /* Surface hierarchy */
                "--card": "#22000d",
                "--card-foreground": "#fff0f3",

                "--popover": "#2a0010",
                "--popover-foreground": "#fff0f3",

                /* Brand */
                "--primary": "#fb7185",
                "--primary-foreground": "#140006",

                /* Layers */
                "--secondary": "#3f0016",
                "--secondary-foreground": "#fff0f3",

                "--muted": "#2a0010",
                "--muted-foreground": "#fda4af",

                /* Hover / accent refinement */
                "--accent": "#9f1239",
                "--accent-foreground": "#ffffff",

                "--destructive": "#7f1d1d",
                "--success": "#14532d",
                "--warning": "#78350f",

                /* Better separation */
                "--border": "#3a0a1a",
                "--input": "#2f0012",

                "--ring": "#fb7185",

                "--radius": "1rem",

                /* Sidebar depth */
                "--sidebar": "#1a0008",
                "--sidebar-foreground": "#fff0f3",

                "--sidebar-primary": "#fb7185",
                "--sidebar-primary-foreground": "#140006",

                "--sidebar-accent": "#3f0016",
                "--sidebar-accent-foreground": "#fff0f3",

                "--sidebar-border": "#3a0a1a",
                "--sidebar-ring": "#fb7185",
            }
        }
    },
    [THEME_IDS.COFFEE]: {
        name: "Coffee",
        tier: "pro",
        mode: {
            light: {
                "--background": "#fdf8f0",
                "--foreground": "#3b2a1f",
                "--card": "#ffffff",
                "--card-foreground": "#3b2a1f",
                "--popover": "#ffffff",
                "--popover-foreground": "#3b2a1f",
                "--primary": "#8b5a2b",
                "--primary-foreground": "#ffffff",
                "--secondary": "#f5e6d3",
                "--secondary-foreground": "#3b2a1f",
                "--muted": "#faf0e6",
                "--muted-foreground": "#8a6e4b",
                "--accent": "#c77d3e",
                "--accent-foreground": "#ffffff",
                "--destructive": "#ef4444",
                "--success": "#10b981",
                "--warning": "#f59e0b",
                "--border": "#e6d5c0",
                "--input": "#e6d5c0",
                "--ring": "#8b5a2b",
                "--radius": "0.5rem",
                "--sidebar": "#ffffff",
                "--sidebar-foreground": "#3b2a1f",
                "--sidebar-primary": "#8b5a2b",
                "--sidebar-primary-foreground": "#ffffff",
                "--sidebar-accent": "#fdf8f0",
                "--sidebar-accent-foreground": "#3b2a1f",
                "--sidebar-border": "#e6d5c0",
                "--sidebar-ring": "#8b5a2b",
            },
            dark: {
                "--background": "#120409",
                "--foreground": "#f5e6d3",

                /* Surface hierarchy */
                "--card": "#241a12",
                "--card-foreground": "#f5e6d3",

                "--popover": "#2c2016",
                "--popover-foreground": "#f5e6d3",

                /* Brand */
                "--primary": "#b8823a",
                "--primary-foreground": "#120409",

                /* Layers */
                "--secondary": "#332415",
                "--secondary-foreground": "#f5e6d3",

                "--muted": "#2a1d12",
                "--muted-foreground": "#b8956e",

                /* Accent (slightly toned down for balance) */
                "--accent": "#d97706",
                "--accent-foreground": "#120409",

                "--destructive": "#dc2626",
                "--success": "#14532d",
                "--warning": "#a16207",

                /* Better separation */
                "--border": "#3a281a",
                "--input": "#2f2116",

                "--ring": "#b8823a",

                "--radius": "0.5rem",

                /* Sidebar depth */
                "--sidebar": "#1a0b07",
                "--sidebar-foreground": "#f5e6d3",

                "--sidebar-primary": "#b8823a",
                "--sidebar-primary-foreground": "#120409",

                "--sidebar-accent": "#2e2015",
                "--sidebar-accent-foreground": "#f5e6d3",

                "--sidebar-border": "#3a281a",
                "--sidebar-ring": "#b8823a",
            }
        }
    },
    [THEME_IDS.SAKURA]: {
        name: "Sakura",
        tier: "pro",
        mode: {
            light: {
                "--background": "#fff5f9",
                "--foreground": "#4a2c3a",
                "--card": "#ffffff",
                "--card-foreground": "#4a2c3a",
                "--popover": "#ffffff",
                "--popover-foreground": "#4a2c3a",
                "--primary": "#f48fb1",
                "--primary-foreground": "#4a2c3a",
                "--secondary": "#ffe0e8",
                "--secondary-foreground": "#4a2c3a",
                "--muted": "#fff0f5",
                "--muted-foreground": "#8a6e7a",
                "--accent": "#f06292",
                "--accent-foreground": "#ffffff",
                "--destructive": "#ef4444",
                "--success": "#10b981",
                "--warning": "#f59e0b",
                "--border": "#fce4ec",
                "--input": "#fce4ec",
                "--ring": "#f48fb1",
                "--radius": "1rem",
                "--sidebar": "#ffffff",
                "--sidebar-foreground": "#4a2c3a",
                "--sidebar-primary": "#f48fb1",
                "--sidebar-primary-foreground": "#4a2c3a",
                "--sidebar-accent": "#fff5f9",
                "--sidebar-accent-foreground": "#4a2c3a",
                "--sidebar-border": "#fce4ec",
                "--sidebar-ring": "#f48fb1",
            },
            dark: {
                "--background": "#140c10",
                "--foreground": "#ffe0e8",

                /* Layered surfaces */
                "--card": "#22121b",
                "--card-foreground": "#ffe0e8",

                "--popover": "#2a1620",
                "--popover-foreground": "#ffe0e8",

                /* Brand */
                "--primary": "#ff80ab",
                "--primary-foreground": "#140c10",

                /* UI layers */
                "--secondary": "#3b2230",
                "--secondary-foreground": "#ffe0e8",

                "--muted": "#2a1620",
                "--muted-foreground": "#d1a1b1",

                /* Controlled accent */
                "--accent": "#ff4d8d",
                "--accent-foreground": "#140c10",

                "--destructive": "#7f1d1d",
                "--success": "#14532d",
                "--warning": "#a16207",

                /* Better separation */
                "--border": "#3f2432",
                "--input": "#2f1a26",

                "--ring": "#ff80ab",

                "--radius": "1rem",

                /* Sidebar depth */
                "--sidebar": "#1a0f14",
                "--sidebar-foreground": "#ffe0e8",

                "--sidebar-primary": "#ff80ab",
                "--sidebar-primary-foreground": "#140c10",

                "--sidebar-accent": "#2f1a26",
                "--sidebar-accent-foreground": "#ffe0e8",

                "--sidebar-border": "#3f2432",
                "--sidebar-ring": "#ff80ab",
            }
        }
    },
    [THEME_IDS.PLATINUM]: {
        name: "Platinum",
        tier: "pro",
        mode: {
            light: {
                "--background": "#f5f7fa",
                "--foreground": "#1a202c",
                "--card": "#ffffff",
                "--card-foreground": "#1a202c",
                "--popover": "#ffffff",
                "--popover-foreground": "#1a202c",
                "--primary": "#4a5568",
                "--primary-foreground": "#ffffff",
                "--secondary": "#e2e8f0",
                "--secondary-foreground": "#1a202c",
                "--muted": "#edf2f7",
                "--muted-foreground": "#718096",
                "--accent": "#6b7280",
                "--accent-foreground": "#ffffff",
                "--destructive": "#ef4444",
                "--success": "#10b981",
                "--warning": "#f59e0b",
                "--border": "#cbd5e0",
                "--input": "#cbd5e0",
                "--ring": "#4a5568",
                "--radius": "0.375rem",
                "--sidebar": "#ffffff",
                "--sidebar-foreground": "#1a202c",
                "--sidebar-primary": "#4a5568",
                "--sidebar-primary-foreground": "#ffffff",
                "--sidebar-accent": "#f5f7fa",
                "--sidebar-accent-foreground": "#1a202c",
                "--sidebar-border": "#cbd5e0",
                "--sidebar-ring": "#4a5568",
            },
            dark: {
                "--background": "#0b0f14",
                "--foreground": "#e2e8f0",

                /* Surface hierarchy */
                "--card": "#141a23",
                "--card-foreground": "#e2e8f0",

                "--popover": "#18202b",
                "--popover-foreground": "#e2e8f0",

                /* Brand (slightly more confident) */
                "--primary": "#a5b4fc",
                "--primary-foreground": "#0b0f14",

                /* Layers */
                "--secondary": "#1f2937",
                "--secondary-foreground": "#e2e8f0",

                "--muted": "#17202b",
                "--muted-foreground": "#9aa4b2",

                /* Better interaction accent */
                "--accent": "#64748b",
                "--accent-foreground": "#e2e8f0",

                "--destructive": "#dc2626",
                "--success": "#16a34a",
                "--warning": "#ca8a04",

                /* Better separation */
                "--border": "#263241",
                "--input": "#1b2430",

                "--ring": "#a5b4fc",

                "--radius": "0.375rem",

                /* Sidebar depth */
                "--sidebar": "#0e131a",
                "--sidebar-foreground": "#e2e8f0",

                "--sidebar-primary": "#a5b4fc",
                "--sidebar-primary-foreground": "#0b0f14",

                "--sidebar-accent": "#1a2230",
                "--sidebar-accent-foreground": "#e2e8f0",

                "--sidebar-border": "#263241",
                "--sidebar-ring": "#a5b4fc",
            }
        }
    },
    [THEME_IDS.AZURE_BLUE]: {
        name: "Azure Blue",
        tier: "pro",
        mode: {
            light: {
                "--background": "#f5f9ff",
                "--foreground": "#0b1220",

                /* Surfaces */
                "--card": "#ffffff",
                "--card-foreground": "#0b1220",

                "--popover": "#ffffff",
                "--popover-foreground": "#0b1220",

                /* Primary brand blue (same identity as dark) */
                "--primary": "#3b82f6",
                "--primary-foreground": "#ffffff",

                /* UI layers */
                "--secondary": "#eaf2ff",
                "--secondary-foreground": "#0b1220",

                "--muted": "#f1f6ff",
                "--muted-foreground": "#5b6b86",

                /* Accent */
                "--accent": "#60a5fa",
                "--accent-foreground": "#ffffff",

                /* States */
                "--destructive": "#ef4444",
                "--success": "#22c55e",
                "--warning": "#f59e0b",

                /* Borders & inputs */
                "--border": "#d6e4f5",
                "--input": "#d6e4f5",

                /* Focus ring */
                "--ring": "#3b82f6",

                "--radius": "0.5rem",

                /* Sidebar */
                "--sidebar": "#ffffff",
                "--sidebar-foreground": "#0b1220",

                "--sidebar-primary": "#3b82f6",
                "--sidebar-primary-foreground": "#ffffff",

                "--sidebar-accent": "#f1f6ff",
                "--sidebar-accent-foreground": "#0b1220",

                "--sidebar-border": "#d6e4f5",
                "--sidebar-ring": "#3b82f6",
            },
            dark: {
                "--background": "#0b1220",
                "--foreground": "#e6f0ff",

                /* Surfaces */
                "--card": "#111a2e",
                "--card-foreground": "#e6f0ff",

                "--popover": "#141f38",
                "--popover-foreground": "#e6f0ff",

                /* Primary brand blue */
                "--primary": "#3b82f6",
                "--primary-foreground": "#0b1220",

                /* UI layers */
                "--secondary": "#1a2740",
                "--secondary-foreground": "#e6f0ff",

                "--muted": "#162033",
                "--muted-foreground": "#93a4bf",

                /* Accent (slightly brighter electric blue) */
                "--accent": "#60a5fa",
                "--accent-foreground": "#0b1220",

                /* States */
                "--destructive": "#ef4444",
                "--success": "#22c55e",
                "--warning": "#f59e0b",

                /* Borders & inputs */
                "--border": "#22314d",
                "--input": "#1a2740",

                /* Focus ring */
                "--ring": "#3b82f6",

                "--radius": "0.5rem",

                /* Sidebar */
                "--sidebar": "#0b1220",
                "--sidebar-foreground": "#e6f0ff",

                "--sidebar-primary": "#3b82f6",
                "--sidebar-primary-foreground": "#0b1220",

                "--sidebar-accent": "#162033",
                "--sidebar-accent-foreground": "#e6f0ff",

                "--sidebar-border": "#22314d",
                "--sidebar-ring": "#3b82f6",
            }
        }
    }
};