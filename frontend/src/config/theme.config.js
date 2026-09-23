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

                "--surface": "#fafafa",
                "--surface-foreground": "#18181b",

                "--surface-elevated": "#ffffff",
                "--surface-elevated-foreground": "#09090b",

                "--surface-sunken": "#f2f2f3",
                "--surface-sunken-foreground": "#27272a",

                "--card": "#ffffff",
                "--card-foreground": "#09090b",

                "--popover": "#ffffff",
                "--popover-foreground": "#09090b",

                "--primary": "#18181b",
                "--primary-foreground": "#ffffff",

                "--secondary": "#f3f3f4",
                "--secondary-foreground": "#18181b",

                "--muted": "#f4f4f5",
                "--muted-foreground": "#71717a",

                "--accent": "#f0f0f1",
                "--accent-foreground": "#18181b",

                "--destructive": "#dc2626",
                "--success": "#16a34a",
                "--warning": "#d97706",

                "--border-subtle": "#eeeeef",
                "--border": "#e1e1e3",
                "--border-strong": "#cfcfd2",

                "--input": "#e1e1e3",
                "--ring": "#18181b",

                "--subtle-foreground": "#52525b",

                "--hover": "#f0f0f1",
                "--hover-foreground": "#18181b",

                "--active": "#e2e2e4",
                "--active-foreground": "#09090b",

                "--selected": "#dcdcdf",
                "--selected-foreground": "#09090b",

                "--overlay": "rgba(9, 9, 11, 0.45)",

                "--radius": "0.5rem",

                "--sidebar": "#ffffff",
                "--sidebar-foreground": "#18181b",

                "--sidebar-primary": "#18181b",
                "--sidebar-primary-foreground": "#ffffff",

                "--sidebar-accent": "#f4f4f5",
                "--sidebar-accent-foreground": "#18181b",

                "--sidebar-border": "#e1e1e3",
                "--sidebar-ring": "#18181b",
            },

            dark: {
                "--background": "#000000",
                "--foreground": "#ffffff",

                "--surface": "#040404",
                "--surface-foreground": "#f5f5f5",

                "--surface-elevated": "#0c0c0d",
                "--surface-elevated-foreground": "#ffffff",

                "--surface-sunken": "#000000",
                "--surface-sunken-foreground": "#99999f",

                "--card": "#070707",
                "--card-foreground": "#ffffff",

                "--popover": "#0c0c0d",
                "--popover-foreground": "#ffffff",

                "--primary": "#ffffff",
                "--primary-foreground": "#000000",

                "--secondary": "#111112",
                "--secondary-foreground": "#ffffff",

                "--muted": "#151516",
                "--muted-foreground": "#a1a1a6",

                "--accent": "#1f1f22",
                "--accent-foreground": "#ffffff",

                "--destructive": "#ef4444",
                "--success": "#22c55e",
                "--warning": "#f59e0b",

                "--border-subtle": "#0d0d0e",
                "--border": "#1b1b1d",
                "--border-strong": "#2d2d30",

                "--input": "#1b1b1d",
                "--ring": "#ffffff",

                "--subtle-foreground": "#d4d4d8",

                "--hover": "#121213",
                "--hover-foreground": "#ffffff",

                "--active": "#1b1b1d",
                "--active-foreground": "#ffffff",

                "--selected": "#242426",
                "--selected-foreground": "#ffffff",

                "--overlay": "rgba(0, 0, 0, 0.68)",

                "--radius": "0.5rem",

                "--sidebar": "#040404",
                "--sidebar-foreground": "#ffffff",

                "--sidebar-primary": "#ffffff",
                "--sidebar-primary-foreground": "#000000",

                "--sidebar-accent": "#111112",
                "--sidebar-accent-foreground": "#ffffff",

                "--sidebar-border": "#1b1b1d",
                "--sidebar-ring": "#ffffff",
            }
        }
    },
    [THEME_IDS.PLATINUM]: {
        name: "Platinum",
        tier: "pro",
        mode: {
            light: {
                "--background": "#f5f7f9",
                "--foreground": "#171b21",

                "--surface": "#eef1f4",
                "--surface-foreground": "#252b33",

                "--surface-elevated": "#ffffff",
                "--surface-elevated-foreground": "#171b21",

                "--surface-sunken": "#e6eaee",
                "--surface-sunken-foreground": "#4c5561",

                "--card": "#ffffff",
                "--card-foreground": "#171b21",

                "--popover": "#ffffff",
                "--popover-foreground": "#171b21",

                "--primary": "#4b5563",
                "--primary-foreground": "#ffffff",

                "--secondary": "#e2e6eb",
                "--secondary-foreground": "#252b33",

                "--muted": "#edf0f3",
                "--muted-foreground": "#737c87",

                "--accent": "#64707d",
                "--accent-foreground": "#ffffff",

                "--destructive": "#dc2626",
                "--success": "#16a34a",
                "--warning": "#d97706",

                "--border-subtle": "#edf0f2",
                "--border": "#d2d8de",
                "--border-strong": "#b5bec8",

                "--input": "#d3d9df",
                "--ring": "#64707d",

                "--subtle-foreground": "#59636e",

                "--hover": "#e9edf1",
                "--hover-foreground": "#252b33",

                "--active": "#dfe4e9",
                "--active-foreground": "#1f252c",

                "--selected": "#d5dce2",
                "--selected-foreground": "#1c232b",

                "--overlay": "rgba(23, 27, 33, 0.45)",

                "--radius": "0.5rem",

                "--sidebar": "#fafbfc",
                "--sidebar-foreground": "#171b21",

                "--sidebar-primary": "#4b5563",
                "--sidebar-primary-foreground": "#ffffff",

                "--sidebar-accent": "#eef1f4",
                "--sidebar-accent-foreground": "#252b33",

                "--sidebar-border": "#d2d8de",
                "--sidebar-ring": "#64707d",
            },

            dark: {
                "--background": "#080b0f",
                "--foreground": "#f1f4f7",

                "--surface": "#0d1116",
                "--surface-foreground": "#dfe4e9",

                "--surface-elevated": "#151a21",
                "--surface-elevated-foreground": "#f5f7f9",

                "--surface-sunken": "#05070a",
                "--surface-sunken-foreground": "#89939e",

                "--card": "#11161c",
                "--card-foreground": "#f1f4f7",

                "--popover": "#171d24",
                "--popover-foreground": "#f5f7f9",

                "--primary": "#c3cbd4",
                "--primary-foreground": "#0a0d11",

                "--secondary": "#171e26",
                "--secondary-foreground": "#e8edf1",

                "--muted": "#141a21",
                "--muted-foreground": "#8d98a4",

                "--accent": "#8995a2",
                "--accent-foreground": "#080b0f",

                "--destructive": "#ef4444",
                "--success": "#22c55e",
                "--warning": "#f59e0b",

                "--border-subtle": "#12171d",
                "--border": "#202831",
                "--border-strong": "#303b47",

                "--input": "#171e26",
                "--ring": "#d5dce3",

                "--subtle-foreground": "#b3bcc5",

                "--hover": "#182028",
                "--hover-foreground": "#f1f4f7",

                "--active": "#202a34",
                "--active-foreground": "#f7f9fb",

                "--selected": "#293540",
                "--selected-foreground": "#f3f6f8",

                "--overlay": "rgba(8, 11, 15, 0.72)",

                "--radius": "0.5rem",

                "--sidebar": "#06090c",
                "--sidebar-foreground": "#f1f4f7",

                "--sidebar-primary": "#c3cbd4",
                "--sidebar-primary-foreground": "#0a0d11",

                "--sidebar-accent": "#12181f",
                "--sidebar-accent-foreground": "#e8edf1",

                "--sidebar-border": "#202831",
                "--sidebar-ring": "#d5dce3",
            }
        }
    },
    [THEME_IDS.OCEAN_TEAL]: {
        name: "Ocean Teal",
        tier: "pro",
        mode: {
            light: {
                "--background": "#f6fffd",
                "--foreground": "#102a2a",
                "--surface": "#effaf8",
                "--surface-foreground": "#173b39",
                "--surface-elevated": "#ffffff",
                "--surface-elevated-foreground": "#102a2a",
                "--surface-sunken": "#e5f5f2",
                "--surface-sunken-foreground": "#315b57",
                "--card": "#ffffff",
                "--card-foreground": "#102a2a",
                "--popover": "#ffffff",
                "--popover-foreground": "#102a2a",
                "--primary": "#0f766e",
                "--primary-foreground": "#ffffff",
                "--secondary": "#dff4f0",
                "--secondary-foreground": "#145c56",
                "--muted": "#eaf8f5",
                "--muted-foreground": "#668783",
                "--accent": "#14b8a6",
                "--accent-foreground": "#ffffff",
                "--destructive": "#dc2626",
                "--success": "#059669",
                "--warning": "#d97706",
                "--border-subtle": "#e5f2ef",
                "--border": "#c8e2dd",
                "--border-strong": "#9bcac2",
                "--input": "#d8ebe7",
                "--ring": "#0f766e",
                "--subtle-foreground": "#4f716d",
                "--hover": "#e3f5f1",
                "--hover-foreground": "#145c56",
                "--active": "#d5ece7",
                "--active-foreground": "#0f514c",
                "--selected": "#c7e5df",
                "--selected-foreground": "#0a4f4a",
                "--overlay": "rgba(16, 42, 42, 0.45)",
                "--radius": "0.5rem",
                "--sidebar": "#fafffe",
                "--sidebar-foreground": "#102a2a",
                "--sidebar-primary": "#0f766e",
                "--sidebar-primary-foreground": "#ffffff",
                "--sidebar-accent": "#e8f7f4",
                "--sidebar-accent-foreground": "#0f766e",
                "--sidebar-border": "#c8e2dd",
                "--sidebar-ring": "#0f766e",
            },
            dark: {
                "--background": "#020707",
                "--foreground": "#ecfeff",
                "--surface": "#040c0c",
                "--surface-foreground": "#dff8f5",
                "--surface-elevated": "#081414",
                "--surface-elevated-foreground": "#ecfeff",
                "--surface-sunken": "#000000",
                "--surface-sunken-foreground": "#789d99",
                "--card": "#061010",
                "--card-foreground": "#ecfeff",
                "--popover": "#0a1717",
                "--popover-foreground": "#ecfeff",
                "--primary": "#2dd4bf",
                "--primary-foreground": "#001312",
                "--secondary": "#0d1c1c",
                "--secondary-foreground": "#d7faf6",
                "--muted": "#112121",
                "--muted-foreground": "#7da49f",
                "--accent": "#0d9488",
                "--accent-foreground": "#ffffff",
                "--destructive": "#ef4444",
                "--success": "#22c55e",
                "--warning": "#f59e0b",
                "--border-subtle": "#081717",
                "--border": "#132828",
                "--border-strong": "#1f3e3e",
                "--input": "#0d1c1c",
                "--ring": "#2dd4bf",
                "--subtle-foreground": "#9cd5ce",
                "--hover": "#0c1b1b",
                "--hover-foreground": "#ecfeff",
                "--active": "#102525",
                "--active-foreground": "#ffffff",
                "--selected": "#142e2e",
                "--selected-foreground": "#5eead4",
                "--overlay": "rgba(2, 7, 7, 0.75)",
                "--radius": "0.5rem",
                "--sidebar": "#030808",
                "--sidebar-foreground": "#ecfeff",
                "--sidebar-primary": "#2dd4bf",
                "--sidebar-primary-foreground": "#001312",
                "--sidebar-accent": "#0b1818",
                "--sidebar-accent-foreground": "#5eead4",
                "--sidebar-border": "#132828",
                "--sidebar-ring": "#2dd4bf",
            },
        }
    },
    [THEME_IDS.MIDNIGHT_VIOLET]: {
        name: "Midnight Violet",
        tier: "pro",
        mode: {
            light: {
                "--background": "#fbfaff",
                "--foreground": "#160b2e",

                "--surface": "#f8f6ff",
                "--surface-foreground": "#241442",

                "--surface-elevated": "#ffffff",
                "--surface-elevated-foreground": "#160b2e",

                "--surface-sunken": "#f1edff",
                "--surface-sunken-foreground": "#4c3670",

                "--card": "#ffffff",
                "--card-foreground": "#160b2e",

                "--popover": "#ffffff",
                "--popover-foreground": "#160b2e",

                "--primary": "#7c3aed",
                "--primary-foreground": "#ffffff",

                "--secondary": "#ede9fe",
                "--secondary-foreground": "#3b176f",

                "--muted": "#f5f3ff",
                "--muted-foreground": "#777184",

                "--accent": "#8b5cf6",
                "--accent-foreground": "#ffffff",

                "--destructive": "#dc2626",
                "--success": "#059669",
                "--warning": "#d97706",

                "--border-subtle": "#f0ecfa",
                "--border": "#e3ddf0",
                "--border-strong": "#cfc3e3",

                "--input": "#e4dff0",
                "--ring": "#8b5cf6",

                "--subtle-foreground": "#5f526f",

                "--hover": "#f0ebff",
                "--hover-foreground": "#4c1d95",

                "--active": "#e5dcff",
                "--active-foreground": "#3b176f",

                "--selected": "#ddd0ff",
                "--selected-foreground": "#4c1d95",

                "--overlay": "rgba(22, 11, 46, 0.45)",

                "--radius": "0.5rem",

                "--sidebar": "#fdfcff",
                "--sidebar-foreground": "#160b2e",

                "--sidebar-primary": "#7c3aed",
                "--sidebar-primary-foreground": "#ffffff",

                "--sidebar-accent": "#f3efff",
                "--sidebar-accent-foreground": "#3b176f",

                "--sidebar-border": "#e3ddf0",
                "--sidebar-ring": "#8b5cf6",
            },

            dark: {
                "--background": "#020008",
                "--foreground": "#f5f3ff",

                "--surface": "#06020f",
                "--surface-foreground": "#eee9ff",

                "--surface-elevated": "#0d0619",
                "--surface-elevated-foreground": "#faf8ff",

                "--surface-sunken": "#010005",
                "--surface-sunken-foreground": "#968ca8",

                "--card": "#0a0414",
                "--card-foreground": "#f5f3ff",

                "--popover": "#10071d",
                "--popover-foreground": "#f5f3ff",

                "--primary": "#a78bfa",
                "--primary-foreground": "#090014",

                "--secondary": "#181028",
                "--secondary-foreground": "#ede9fe",

                "--muted": "#120c20",
                "--muted-foreground": "#a8a0bd",

                "--accent": "#7c3aed",
                "--accent-foreground": "#ffffff",

                "--destructive": "#ef4444",
                "--success": "#22c55e",
                "--warning": "#f59e0b",

                "--border-subtle": "#160c28",
                "--border": "#24163f",
                "--border-strong": "#3b2460",

                "--input": "#1a122e",
                "--ring": "#a78bfa",

                "--subtle-foreground": "#c0b8d1",

                "--hover": "#160c26",
                "--hover-foreground": "#f5f3ff",

                "--active": "#21113a",
                "--active-foreground": "#faf8ff",

                "--selected": "#2d1550",
                "--selected-foreground": "#f3eaff",

                "--overlay": "rgba(2, 0, 8, 0.72)",

                "--radius": "0.5rem",

                "--sidebar": "#06020f",
                "--sidebar-foreground": "#f5f3ff",

                "--sidebar-primary": "#a78bfa",
                "--sidebar-primary-foreground": "#090014",

                "--sidebar-accent": "#140d24",
                "--sidebar-accent-foreground": "#ede9fe",

                "--sidebar-border": "#24163f",
                "--sidebar-ring": "#a78bfa",
            }
        }
    },
    [THEME_IDS.FOREST_WOOD]: {
        name: "Forest Amber",
        tier: "pro",
        mode: {
            light: {
                "--background": "#f8faf4",
                "--foreground": "#1b2617",

                "--surface": "#f1f6eb",
                "--surface-foreground": "#25331f",

                "--surface-elevated": "#ffffff",
                "--surface-elevated-foreground": "#1b2617",

                "--surface-sunken": "#e7efde",
                "--surface-sunken-foreground": "#46563b",

                "--card": "#ffffff",
                "--card-foreground": "#1b2617",

                "--popover": "#ffffff",
                "--popover-foreground": "#1b2617",

                "--primary": "#4f7f2f",
                "--primary-foreground": "#ffffff",

                "--secondary": "#e5eedc",
                "--secondary-foreground": "#26371e",

                "--muted": "#edf3e7",
                "--muted-foreground": "#68775d",

                "--accent": "#a85f0a",
                "--accent-foreground": "#ffffff",

                "--destructive": "#dc2626",
                "--success": "#16a34a",
                "--warning": "#c87912",

                "--border-subtle": "#e9eee3",
                "--border": "#d5dfc9",
                "--border-strong": "#b9c9aa",

                "--input": "#d9e3ce",
                "--ring": "#a85f0a",

                "--subtle-foreground": "#536249",

                "--hover": "#e8f0df",
                "--hover-foreground": "#304521",

                "--active": "#dce8d1",
                "--active-foreground": "#263b1c",

                "--selected": "#d0dfc2",
                "--selected-foreground": "#294119",

                "--overlay": "rgba(27, 38, 23, 0.45)",

                "--radius": "0.5rem",

                "--sidebar": "#fcfdf9",
                "--sidebar-foreground": "#1b2617",

                "--sidebar-primary": "#4f7f2f",
                "--sidebar-primary-foreground": "#ffffff",

                "--sidebar-accent": "#edf3e6",
                "--sidebar-accent-foreground": "#304521",

                "--sidebar-border": "#d5dfc9",
                "--sidebar-ring": "#a85f0a",
            },

            dark: {
                "--background": "#050804",
                "--foreground": "#eef6e8",

                "--surface": "#091008",
                "--surface-foreground": "#dfead8",

                "--surface-elevated": "#10190c",
                "--surface-elevated-foreground": "#f2f8ed",

                "--surface-sunken": "#020402",
                "--surface-sunken-foreground": "#87977e",

                "--card": "#0c1409",
                "--card-foreground": "#eef6e8",

                "--popover": "#111b0d",
                "--popover-foreground": "#f2f8ed",

                "--primary": "#84cc16",
                "--primary-foreground": "#081005",

                "--secondary": "#172311",
                "--secondary-foreground": "#e7f2df",

                "--muted": "#121b0e",
                "--muted-foreground": "#91a38a",

                "--accent": "#b87512",
                "--accent-foreground": "#fff6df",

                "--destructive": "#ef4444",
                "--success": "#22c55e",
                "--warning": "#d9911b",

                "--border-subtle": "#172116",
                "--border": "#26341f",
                "--border-strong": "#3a4a2d",

                "--input": "#1a2514",
                "--ring": "#b87512",

                "--subtle-foreground": "#b8c7ae",

                "--hover": "#172310",
                "--hover-foreground": "#f0f7e9",

                "--active": "#213018",
                "--active-foreground": "#f4faed",

                "--selected": "#2b3d1d",
                "--selected-foreground": "#eff9e8",

                "--overlay": "rgba(5, 8, 4, 0.72)",

                "--radius": "0.5rem",

                "--sidebar": "#080d06",
                "--sidebar-foreground": "#eef6e8",

                "--sidebar-primary": "#84cc16",
                "--sidebar-primary-foreground": "#081005",

                "--sidebar-accent": "#14200f",
                "--sidebar-accent-foreground": "#e7f2df",

                "--sidebar-border": "#26341f",
                "--sidebar-ring": "#b87512",
            }
        }
    },
    [THEME_IDS.VOLCANIC]: {
        name: "Volcanic",
        tier: "pro",
        mode: {
            light: {
                "--background": "#FFF7F4",
                "--foreground": "#2B120B",
                "--surface": "#FCEEE8",
                "--surface-foreground": "#2B120B",
                "--surface-elevated": "#FFFFFF",
                "--surface-elevated-foreground": "#2B120B",
                "--surface-sunken": "#F5DDD5",
                "--surface-sunken-foreground": "#692E21",
                "--card": "#FFFFFF",
                "--card-foreground": "#2B120B",
                "--popover": "#FFFFFF",
                "--popover-foreground": "#2B120B",
                "--primary": "#DC2626",
                "--primary-foreground": "#FFFFFF",
                "--secondary": "#FEF3C7",
                "--secondary-foreground": "#92400E",
                "--muted": "#F7E6DF",
                "--muted-foreground": "#8C584C",
                "--accent": "#D97706",
                "--accent-foreground": "#FFFFFF",
                "--destructive": "#991B1B",
                "--success": "#16A34A",
                "--warning": "#D97706",
                "--border-subtle": "#F6E2DB",
                "--border": "#E8C8BE",
                "--border-strong": "#C99E92",
                "--input": "#E8C8BE",
                "--ring": "#DC2626",
                "--subtle-foreground": "#78473B",
                "--hover": "#FDE8E1",
                "--hover-foreground": "#2B120B",
                "--active": "#F9D5CA",
                "--active-foreground": "#2B120B",
                "--selected": "#FEF3C7",
                "--selected-foreground": "#92400E",
                "--overlay": "rgba(43, 18, 11, 0.45)",
                "--radius": "0.5rem",
                "--sidebar": "#FAF0EC",
                "--sidebar-foreground": "#2B120B",
                "--sidebar-primary": "#DC2626",
                "--sidebar-primary-foreground": "#FFFFFF",
                "--sidebar-accent": "#FDE68A",
                "--sidebar-accent-foreground": "#92400E",
                "--sidebar-border": "#E8C8BE",
                "--sidebar-ring": "#DC2626",
            },
            dark: {
                "--background": "#0C0405",
                "--foreground": "#FFF1EE",
                "--surface": "#16080B",
                "--surface-foreground": "#FFF1EE",
                "--surface-elevated": "#220D11",
                "--surface-elevated-foreground": "#FFFFFF",
                "--surface-sunken": "#070203",
                "--surface-sunken-foreground": "#9E6D64",
                "--card": "#1A090D",
                "--card-foreground": "#FFF1EE",
                "--popover": "#240E13",
                "--popover-foreground": "#FFFFFF",
                "--primary": "#FF3B30",
                "--primary-foreground": "#FFFFFF",
                "--secondary": "#2A0E13",
                "--secondary-foreground": "#FFB4A2",
                "--muted": "#1C0A0D",
                "--muted-foreground": "#A36B60",
                "--accent": "#FBBF24",
                "--accent-foreground": "#1A0800",
                "--destructive": "#EF4444",
                "--success": "#22C55E",
                "--warning": "#F59E0B",
                "--border-subtle": "#250D11",
                "--border": "#3D141B",
                "--border-strong": "#5E1E29",
                "--input": "#2E0F14",
                "--ring": "#FF3B30",
                "--subtle-foreground": "#C4978F",
                "--hover": "#2B1015",
                "--hover-foreground": "#FFF1EE",
                "--active": "#3B151D",
                "--active-foreground": "#FFFFFF",
                "--selected": "#2F1116",
                "--selected-foreground": "#FFB4A2",
                "--overlay": "rgba(12, 4, 5, 0.85)",
                "--radius": "0.5rem",
                "--sidebar": "#070203",
                "--sidebar-foreground": "#FFF1EE",
                "--sidebar-primary": "#FF3B30",
                "--sidebar-primary-foreground": "#FFFFFF",
                "--sidebar-accent": "#261304",
                "--sidebar-accent-foreground": "#FBBF24",
                "--sidebar-border": "#2E0F14",
                "--sidebar-ring": "#FF3B30",
            },
        }
    },
    [THEME_IDS.SUPERNOVA]: {
        name: "Supernova",
        tier: "pro",
        mode: {
            light: {
                "--background": "#FBF9F5",
                "--foreground": "#1C1306",
                "--surface": "#F6F0E6",
                "--surface-foreground": "#1C1306",
                "--surface-elevated": "#FFFFFF",
                "--surface-elevated-foreground": "#1C1306",
                "--surface-sunken": "#EFE5D5",
                "--surface-sunken-foreground": "#63471A",
                "--card": "#FFFFFF",
                "--card-foreground": "#1C1306",
                "--popover": "#FFFFFF",
                "--popover-foreground": "#1C1306",
                "--primary": "#D97706",
                "--primary-foreground": "#FFFFFF",
                "--secondary": "#E0F2FE",
                "--secondary-foreground": "#0369A1",
                "--muted": "#F3E9D9",
                "--muted-foreground": "#7D6035",
                "--accent": "#0284C7",
                "--accent-foreground": "#FFFFFF",
                "--destructive": "#DC2626",
                "--success": "#16A34A",
                "--warning": "#D97706",
                "--border-subtle": "#F2E7D7",
                "--border": "#E4D2BC",
                "--border-strong": "#C4A987",
                "--input": "#E4D2BC",
                "--ring": "#D97706",
                "--subtle-foreground": "#6E5023",
                "--hover": "#EFE1CE",
                "--hover-foreground": "#1C1306",
                "--active": "#E4D0B8",
                "--active-foreground": "#1C1306",
                "--selected": "#E0F2FE",
                "--selected-foreground": "#0369A1",
                "--overlay": "rgba(28, 19, 6, 0.45)",
                "--radius": "0.5rem",
                "--sidebar": "#FAF4EB",
                "--sidebar-foreground": "#1C1306",
                "--sidebar-primary": "#D97706",
                "--sidebar-primary-foreground": "#FFFFFF",
                "--sidebar-accent": "#E0F2FE",
                "--sidebar-accent-foreground": "#0369A1",
                "--sidebar-border": "#E4D2BC",
                "--sidebar-ring": "#D97706",
            },
            dark: {
                "--background": "#060713",
                "--foreground": "#F8FAFC",
                "--surface": "#0B0D21",
                "--surface-foreground": "#F8FAFC",
                "--surface-elevated": "#121533",
                "--surface-elevated-foreground": "#FFFFFF",
                "--surface-sunken": "#03040A",
                "--surface-sunken-foreground": "#7E84B0",
                "--card": "#0E1026",
                "--card-foreground": "#F8FAFC",
                "--popover": "#141738",
                "--popover-foreground": "#FFFFFF",
                "--primary": "#F59E0B",
                "--primary-foreground": "#000000",
                "--secondary": "#112338",
                "--secondary-foreground": "#7DD3FC",
                "--muted": "#0F122B",
                "--muted-foreground": "#8C94C7",
                "--accent": "#06B6D4",
                "--accent-foreground": "#002029",
                "--destructive": "#EF4444",
                "--success": "#22C55E",
                "--warning": "#F59E0B",
                "--border-subtle": "#131636",
                "--border": "#1F2454",
                "--border-strong": "#2F367D",
                "--input": "#14193D",
                "--ring": "#F59E0B",
                "--subtle-foreground": "#A5ACDD",
                "--hover": "#171B42",
                "--hover-foreground": "#F8FAFC",
                "--active": "#22275E",
                "--active-foreground": "#FFFFFF",
                "--selected": "#192E47",
                "--selected-foreground": "#38BDF8",
                "--overlay": "rgba(6, 7, 19, 0.85)",
                "--radius": "0.5rem",
                "--sidebar": "#04040D",
                "--sidebar-foreground": "#F8FAFC",
                "--sidebar-primary": "#F59E0B",
                "--sidebar-primary-foreground": "#000000",
                "--sidebar-accent": "#0E1F30",
                "--sidebar-accent-foreground": "#22D3EE",
                "--sidebar-border": "#161B42",
                "--sidebar-ring": "#F59E0B",
            },
        }
    },
    [THEME_IDS.SAKURA]: {
        name: "Sakura",
        tier: "pro",
        mode: {
            light: {
                "--background": "#fff8fb",
                "--foreground": "#4a2838",

                "--surface": "#fff0f5",
                "--surface-foreground": "#583142",

                "--surface-elevated": "#fffdfd",
                "--surface-elevated-foreground": "#4a2838",

                "--surface-sunken": "#fce4ec",
                "--surface-sunken-foreground": "#7a4c5f",

                "--card": "#ffffff",
                "--card-foreground": "#4a2838",

                "--popover": "#ffffff",
                "--popover-foreground": "#4a2838",

                "--primary": "#e96b94",
                "--primary-foreground": "#ffffff",

                "--secondary": "#f9dce6",
                "--secondary-foreground": "#5b3042",

                "--muted": "#fcecf2",
                "--muted-foreground": "#927181",

                "--accent": "#f3a1ba",
                "--accent-foreground": "#5a263b",

                "--destructive": "#dc2626",
                "--success": "#16a34a",
                "--warning": "#d97706",

                "--border-subtle": "#f9e8ee",
                "--border": "#f1d3de",
                "--border-strong": "#dfb2c2",

                "--input": "#efd2dc",
                "--ring": "#e96b94",

                "--subtle-foreground": "#704b5c",

                "--hover": "#fbe7ee",
                "--hover-foreground": "#6a3047",

                "--active": "#f6d8e2",
                "--active-foreground": "#5d293e",

                "--selected": "#f0cbd8",
                "--selected-foreground": "#562438",

                "--overlay": "rgba(74, 40, 56, 0.42)",

                "--radius": "0.5rem",

                "--sidebar": "#fffafb",
                "--sidebar-foreground": "#4a2838",

                "--sidebar-primary": "#e96b94",
                "--sidebar-primary-foreground": "#ffffff",

                "--sidebar-accent": "#fcecf2",
                "--sidebar-accent-foreground": "#633147",

                "--sidebar-border": "#f1d3de",
                "--sidebar-ring": "#e96b94",
            },

            dark: {
                "--background": "#080306",
                "--foreground": "#ffeaf0",

                "--surface": "#0e070b",
                "--surface-foreground": "#f7dce4",

                "--surface-elevated": "#1b0d14",
                "--surface-elevated-foreground": "#fff1f5",

                "--surface-sunken": "#050204",
                "--surface-sunken-foreground": "#9f7283",

                "--card": "#14090f",
                "--card-foreground": "#ffeaf0",

                "--popover": "#21111a",
                "--popover-foreground": "#fff1f5",

                "--primary": "#ff80ab",
                "--primary-foreground": "#260b16",

                "--secondary": "#321a25",
                "--secondary-foreground": "#f8dce5",

                "--muted": "#25131c",
                "--muted-foreground": "#b8899a",

                "--accent": "#c94f79",
                "--accent-foreground": "#fff0f5",

                "--destructive": "#ef4444",
                "--success": "#22c55e",
                "--warning": "#f59e0b",

                "--border-subtle": "#2b161f",
                "--border": "#3e202e",
                "--border-strong": "#5a2d40",

                "--input": "#2f1823",
                "--ring": "#ff80ab",

                "--subtle-foreground": "#d0a7b5",

                "--hover": "#321a25",
                "--hover-foreground": "#ffeaf0",

                "--active": "#40202e",
                "--active-foreground": "#fff0f5",

                "--selected": "#51283b",
                "--selected-foreground": "#ffe8ef",

                "--overlay": "rgba(8, 3, 6, 0.76)",

                "--radius": "0.5rem",

                "--sidebar": "#060205",
                "--sidebar-foreground": "#ffeaf0",

                "--sidebar-primary": "#ff80ab",
                "--sidebar-primary-foreground": "#260b16",

                "--sidebar-accent": "#24131b",
                "--sidebar-accent-foreground": "#f8dce5",

                "--sidebar-border": "#3e202e",
                "--sidebar-ring": "#ff80ab",
            }
        }
    },
    [THEME_IDS.SKYLINE_AFTERDARK]: {
        name: "Skyline Afterdark",
        tier: "pro",
        mode: {
            light: {
                "--background": "#F0F9FF",
                "--foreground": "#0C2340",
                "--surface": "#E0F2FE",
                "--surface-foreground": "#0C2340",
                "--surface-elevated": "#FFFFFF",
                "--surface-elevated-foreground": "#0C2340",
                "--surface-sunken": "#BAE6FD",
                "--surface-sunken-foreground": "#0369A1",
                "--card": "#FFFFFF",
                "--card-foreground": "#0C2340",
                "--popover": "#FFFFFF",
                "--popover-foreground": "#0C2340",
                "--primary": "#0284C7",
                "--primary-foreground": "#FFFFFF",
                "--secondary": "#FCE7F3",
                "--secondary-foreground": "#9D174D",
                "--muted": "#E0F2FE",
                "--muted-foreground": "#50759E",
                "--accent": "#E11D48",
                "--accent-foreground": "#FFFFFF",
                "--destructive": "#DC2626",
                "--success": "#16A34A",
                "--warning": "#D97706",
                "--border-subtle": "#BAE6FD",
                "--border": "#7DD3FC",
                "--border-strong": "#38BDF8",
                "--input": "#BAE6FD",
                "--ring": "#0284C7",
                "--subtle-foreground": "#365373",
                "--hover": "#D0EDFD",
                "--hover-foreground": "#0C2340",
                "--active": "#B9E4FB",
                "--active-foreground": "#0C2340",
                "--selected": "#FCE7F3",
                "--selected-foreground": "#9D174D",
                "--overlay": "rgba(12, 35, 64, 0.45)",
                "--radius": "0.5rem",
                "--sidebar": "#F8FCFF",
                "--sidebar-foreground": "#0C2340",
                "--sidebar-primary": "#0284C7",
                "--sidebar-primary-foreground": "#FFFFFF",
                "--sidebar-accent": "#FCE7F3",
                "--sidebar-accent-foreground": "#9D174D",
                "--sidebar-border": "#BAE6FD",
                "--sidebar-ring": "#0284C7",
            },
            dark: {
                "--background": "#020612",
                "--foreground": "#F0F9FF",
                "--surface": "#060E22",
                "--surface-foreground": "#F0F9FF",
                "--surface-elevated": "#0C1838",
                "--surface-elevated-foreground": "#FFFFFF",
                "--surface-sunken": "#010309",
                "--surface-sunken-foreground": "#6583B8",
                "--card": "#08122B",
                "--card-foreground": "#F0F9FF",
                "--popover": "#0E1B40",
                "--popover-foreground": "#FFFFFF",
                "--primary": "#00E5FF",
                "--primary-foreground": "#002229",
                "--secondary": "#111C3D",
                "--secondary-foreground": "#7DD3FC",
                "--muted": "#09132E",
                "--muted-foreground": "#7B96C9",
                "--accent": "#FF2A85",
                "--accent-foreground": "#1A000D",
                "--destructive": "#EF4444",
                "--success": "#22C55E",
                "--warning": "#F59E0B",
                "--border-subtle": "#0B1736",
                "--border": "#152A5E",
                "--border-strong": "#214394",
                "--input": "#0D1B3D",
                "--ring": "#00E5FF",
                "--subtle-foreground": "#88A0CE",
                "--hover": "#0F1F47",
                "--hover-foreground": "#F0F9FF",
                "--active": "#162C66",
                "--active-foreground": "#FFFFFF",
                "--selected": "#1B173B",
                "--selected-foreground": "#FF2A85",
                "--overlay": "rgba(2, 6, 18, 0.85)",
                "--radius": "0.5rem",
                "--sidebar": "#01040D",
                "--sidebar-foreground": "#F0F9FF",
                "--sidebar-primary": "#00E5FF",
                "--sidebar-primary-foreground": "#002229",
                "--sidebar-accent": "#240A1A",
                "--sidebar-accent-foreground": "#FF2A85",
                "--sidebar-border": "#102047",
                "--sidebar-ring": "#00E5FF",
            },
        }
    },
    [THEME_IDS.BUMBLEBEE]: {
        name: "Bumblebee",
        tier: "pro",
        mode: {
            light: {
                "--background": "#FFFFFF",
                "--foreground": "#0A0A0A",
                "--surface": "#F4F4F5",
                "--surface-foreground": "#18181B",
                "--surface-elevated": "#FFFFFF",
                "--surface-elevated-foreground": "#0A0A0A",
                "--surface-sunken": "#E4E4E7",
                "--surface-sunken-foreground": "#52525B",
                "--card": "#FFFFFF",
                "--card-foreground": "#0A0A0A",
                "--popover": "#FFFFFF",
                "--popover-foreground": "#0A0A0A",
                "--primary": "#0A0A0A",
                "--primary-foreground": "#FFD000",
                "--secondary": "#FFFBEB",
                "--secondary-foreground": "#78350F",
                "--muted": "#F4F4F5",
                "--muted-foreground": "#71717A",
                "--accent": "#FFD000",
                "--accent-foreground": "#000000",
                "--destructive": "#DC2626",
                "--success": "#16A34A",
                "--warning": "#D97706",
                "--border-subtle": "#F4F4F5",
                "--border": "#E4E4E7",
                "--border-strong": "#A1A1AA",
                "--input": "#E4E4E7",
                "--ring": "#FFD000",
                "--subtle-foreground": "#52525B",
                "--hover": "#FEF3C7",
                "--hover-foreground": "#000000",
                "--active": "#FDE68A",
                "--active-foreground": "#000000",
                "--selected": "#FDE047",
                "--selected-foreground": "#000000",
                "--overlay": "rgba(0, 0, 0, 0.60)",
                "--radius": "0.5rem",
                "--sidebar": "#FFFFFF",
                "--sidebar-foreground": "#0A0A0A",
                "--sidebar-primary": "#0A0A0A",
                "--sidebar-primary-foreground": "#FFD000",
                "--sidebar-accent": "#FEF3C7",
                "--sidebar-accent-foreground": "#000000",
                "--sidebar-border": "#E4E4E7",
                "--sidebar-ring": "#FFD000",
            },
            dark: {
                "--background": "#050505",
                "--foreground": "#FFFFFF",
                "--surface": "#0A0A0A",
                "--surface-foreground": "#FFFFFF",
                "--surface-elevated": "#121212",
                "--surface-elevated-foreground": "#FFFFFF",
                "--surface-sunken": "#000000",
                "--surface-sunken-foreground": "#737373",
                "--card": "#0A0A0A",
                "--card-foreground": "#FFFFFF",
                "--popover": "#121212",
                "--popover-foreground": "#FFFFFF",
                "--primary": "#FFD000",
                "--primary-foreground": "#000000",
                "--secondary": "#171717",
                "--secondary-foreground": "#FFD000",
                "--muted": "#121212",
                "--muted-foreground": "#8E8E93",
                "--accent": "#FFE500",
                "--accent-foreground": "#000000",
                "--destructive": "#EF4444",
                "--success": "#22C55E",
                "--warning": "#F59E0B",
                "--border-subtle": "#141414",
                "--border": "#242424",
                "--border-strong": "#383838",
                "--input": "#171717",
                "--ring": "#FFD000",
                "--subtle-foreground": "#A1A1AA",
                "--hover": "#1A1A1A",
                "--hover-foreground": "#FFD000",
                "--active": "#262626",
                "--active-foreground": "#FFFFFF",
                "--selected": "#FFD000",
                "--selected-foreground": "#000000",
                "--overlay": "rgba(0, 0, 0, 0.85)",
                "--radius": "0.5rem",
                "--sidebar": "#050505",
                "--sidebar-foreground": "#FFFFFF",
                "--sidebar-primary": "#FFD000",
                "--sidebar-primary-foreground": "#000000",
                "--sidebar-accent": "#141414",
                "--sidebar-accent-foreground": "#FFD000",
                "--sidebar-border": "#242424",
                "--sidebar-ring": "#FFD000",
            },
        }
    },
    [THEME_IDS.CYBER_SUNSET]: {
        name: "Cyber Sunset",
        tier: "pro",
        mode: {
            light: {
                "--background": "#FDF8FA",
                "--foreground": "#181124",
                "--surface": "#F7EFF5",
                "--surface-foreground": "#181124",
                "--surface-elevated": "#FFFFFF",
                "--surface-elevated-foreground": "#181124",
                "--surface-sunken": "#EFE3EC",
                "--surface-sunken-foreground": "#594D69",
                "--card": "#FFFFFF",
                "--card-foreground": "#181124",
                "--popover": "#FFFFFF",
                "--popover-foreground": "#181124",
                "--primary": "#E11D48",
                "--primary-foreground": "#FFFFFF",
                "--secondary": "#F3E8FF",
                "--secondary-foreground": "#6B21A8",
                "--muted": "#F5EBF3",
                "--muted-foreground": "#786C87",
                "--accent": "#7C3AED",
                "--accent-foreground": "#FFFFFF",
                "--destructive": "#DC2626",
                "--success": "#16A34A",
                "--warning": "#D97706",
                "--border-subtle": "#F1E5EE",
                "--border": "#E2D1DF",
                "--border-strong": "#CCAEC6",
                "--input": "#E2D1DF",
                "--ring": "#E11D48",
                "--subtle-foreground": "#594D69",
                "--hover": "#F0E1EE",
                "--hover-foreground": "#181124",
                "--active": "#E4CEE0",
                "--active-foreground": "#181124",
                "--selected": "#F3E8FF",
                "--selected-foreground": "#6B21A8",
                "--overlay": "rgba(24, 17, 36, 0.45)",
                "--radius": "0.5rem",
                "--sidebar": "#FAF3F8",
                "--sidebar-foreground": "#181124",
                "--sidebar-primary": "#E11D48",
                "--sidebar-primary-foreground": "#FFFFFF",
                "--sidebar-accent": "#F0E1EE",
                "--sidebar-accent-foreground": "#6B21A8",
                "--sidebar-border": "#E2D1DF",
                "--sidebar-ring": "#E11D48",
            },
            dark: {
                "--background": "#090814",
                "--foreground": "#F8F7FF",
                "--surface": "#0E0D1E",
                "--surface-foreground": "#F8F7FF",
                "--surface-elevated": "#15132D",
                "--surface-elevated-foreground": "#FFFFFF",
                "--surface-sunken": "#05040B",
                "--surface-sunken-foreground": "#7B759E",
                "--card": "#121026",
                "--card-foreground": "#F8F7FF",
                "--popover": "#171533",
                "--popover-foreground": "#FFFFFF",
                "--primary": "#FF5A5F",
                "--primary-foreground": "#FFFFFF",
                "--secondary": "#241E45",
                "--secondary-foreground": "#D8B4FE",
                "--muted": "#131127",
                "--muted-foreground": "#9691B8",
                "--accent": "#A855F7",
                "--accent-foreground": "#FFFFFF",
                "--destructive": "#EF4444",
                "--success": "#22C55E",
                "--warning": "#F59E0B",
                "--border-subtle": "#181533",
                "--border": "#282352",
                "--border-strong": "#3F377C",
                "--input": "#1C183B",
                "--ring": "#FF5A5F",
                "--subtle-foreground": "#B2ACCF",
                "--hover": "#1E1A3D",
                "--hover-foreground": "#F8F7FF",
                "--active": "#2B2456",
                "--active-foreground": "#FFFFFF",
                "--selected": "#241E45",
                "--selected-foreground": "#D8B4FE",
                "--overlay": "rgba(9, 8, 20, 0.85)",
                "--radius": "0.5rem",
                "--sidebar": "#06050E",
                "--sidebar-foreground": "#F8F7FF",
                "--sidebar-primary": "#FF5A5F",
                "--sidebar-primary-foreground": "#FFFFFF",
                "--sidebar-accent": "#1E193D",
                "--sidebar-accent-foreground": "#C084FC",
                "--sidebar-border": "#1E1A3B",
                "--sidebar-ring": "#FF5A5F",
            },
        }
    },
    [THEME_IDS.AURORA_BOREALIS]: {
        name: "Aurora Borealis",
        tier: "pro",
        mode: {
            light: {
                "--background": "#F2FAF9",
                "--foreground": "#042023",
                "--surface": "#E7F5F4",
                "--surface-foreground": "#042023",
                "--surface-elevated": "#FFFFFF",
                "--surface-elevated-foreground": "#042023",
                "--surface-sunken": "#DCEEED",
                "--surface-sunken-foreground": "#2B5A56",
                "--card": "#FFFFFF",
                "--card-foreground": "#042023",
                "--popover": "#FFFFFF",
                "--popover-foreground": "#042023",
                "--primary": "#0D766E",
                "--primary-foreground": "#FFFFFF",
                "--secondary": "#E0F2FE",
                "--secondary-foreground": "#0369A1",
                "--muted": "#E3F2F0",
                "--muted-foreground": "#4B7B77",
                "--accent": "#7C3AED",
                "--accent-foreground": "#FFFFFF",
                "--destructive": "#DC2626",
                "--success": "#16A34A",
                "--warning": "#D97706",
                "--border-subtle": "#D8ECEA",
                "--border": "#B7DEDA",
                "--border-strong": "#8AC7C1",
                "--input": "#B7DEDA",
                "--ring": "#0D766E",
                "--subtle-foreground": "#2B5A56",
                "--hover": "#DBEFEA",
                "--hover-foreground": "#042023",
                "--active": "#CCE8E2",
                "--active-foreground": "#042023",
                "--selected": "#CCECE6",
                "--selected-foreground": "#0D766E",
                "--overlay": "rgba(4, 32, 35, 0.45)",
                "--radius": "0.5rem",
                "--sidebar": "#F8FCFA",
                "--sidebar-foreground": "#042023",
                "--sidebar-primary": "#0D766E",
                "--sidebar-primary-foreground": "#FFFFFF",
                "--sidebar-accent": "#E2F4F1",
                "--sidebar-accent-foreground": "#0F5953",
                "--sidebar-border": "#B7DEDA",
                "--sidebar-ring": "#0D766E",
            },
            dark: {
                "--background": "#020D14",
                "--foreground": "#ECFEFF",
                "--surface": "#05141E",
                "--surface-foreground": "#ECFEFF",
                "--surface-elevated": "#091F2C",
                "--surface-elevated-foreground": "#ECFEFF",
                "--surface-sunken": "#01070B",
                "--surface-sunken-foreground": "#587D90",
                "--card": "#071824",
                "--card-foreground": "#ECFEFF",
                "--popover": "#0B2434",
                "--popover-foreground": "#ECFEFF",
                "--primary": "#00F5A0",
                "--primary-foreground": "#002517",
                "--secondary": "#0F2638",
                "--secondary-foreground": "#7DD3FC",
                "--muted": "#061B29",
                "--muted-foreground": "#6B95A8",
                "--accent": "#C084FC",
                "--accent-foreground": "#1E1136",
                "--destructive": "#EF4444",
                "--success": "#22C55E",
                "--warning": "#F59E0B",
                "--border-subtle": "#082133",
                "--border": "#103650",
                "--border-strong": "#194D70",
                "--input": "#0D2E45",
                "--ring": "#00F5A0",
                "--subtle-foreground": "#93BECE",
                "--hover": "#0C273B",
                "--hover-foreground": "#ECFEFF",
                "--active": "#11354F",
                "--active-foreground": "#FFFFFF",
                "--selected": "#0F2638",
                "--selected-foreground": "#00F5A0",
                "--overlay": "rgba(2, 13, 20, 0.85)",
                "--radius": "0.5rem",
                "--sidebar": "#01080D",
                "--sidebar-foreground": "#ECFEFF",
                "--sidebar-primary": "#00F5A0",
                "--sidebar-primary-foreground": "#002517",
                "--sidebar-accent": "#0D2A3D",
                "--sidebar-accent-foreground": "#38BDF8",
                "--sidebar-border": "#103650",
                "--sidebar-ring": "#00F5A0",
            },
        }
    },
};
