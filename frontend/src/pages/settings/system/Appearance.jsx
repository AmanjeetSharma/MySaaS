import React, { useState, useEffect, useMemo } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { THEME_IDS, THEME_MODES } from '@/theme/theme.constant.js';
import { themeProfiles } from '@/config/theme.config.js';
import { applyUserTheme, getEffectiveThemeMode } from '@/theme/theme.utils.js';
import { saveThemeToLocalStorage } from '@/theme/themeSync.utils.js';

import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import {
    Sun,
    Moon,
    Laptop,
    Crown,
    Check,
    CheckCircle2,
    Palette,
    Loader2
} from 'lucide-react';

const MODE_OPTIONS = [
    {
        id: THEME_MODES.LIGHT,
        label: 'Light',
        description: 'Clean daylight theme',
        icon: Sun
    },
    {
        id: THEME_MODES.DARK,
        label: 'Dark',
        description: 'Focused low-light contrast',
        icon: Moon
    },
    {
        id: THEME_MODES.SYSTEM,
        label: 'System',
        description: 'Follows operating system settings',
        icon: Laptop
    }
];

const Appearance = () => {
    const {
        theme,
        isLoading,
        fetchSettings,
        updateTheme,
        isProTier,
        getAllThemes
    } = useSettingsStore();

    const [localThemeMode, setLocalThemeMode] = useState(null);
    const [isThemeUpdating, setIsThemeUpdating] = useState(false);
    const [upgradeTarget, setUpgradeTarget] = useState(null);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const isPro = isProTier();
    const allThemes = getAllThemes ? getAllThemes() : Object.values(THEME_IDS).map((themeId) => ({
        value: themeId,
        label: themeId.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        isLocked: !isPro && themeId !== THEME_IDS.DEFAULT
    }));

    const selectedThemeMode = localThemeMode || theme?.mode || THEME_MODES.SYSTEM;

    // Track active system OS mode dynamically
    const [systemOSMode, setSystemOSMode] = useState(() => {
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches
                ? THEME_MODES.DARK
                : THEME_MODES.LIGHT;
        }
        return THEME_MODES.DARK;
    });

    // Listen for OS theme changes and automatically apply when System mode is active
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleOSChange = (e) => {
            const detected = e.matches ? THEME_MODES.DARK : THEME_MODES.LIGHT;
            setSystemOSMode(detected);
            if (selectedThemeMode === THEME_MODES.SYSTEM) {
                applyUserTheme(theme.name, THEME_MODES.SYSTEM);
            }
        };

        if (selectedThemeMode === THEME_MODES.SYSTEM) {
            applyUserTheme(theme.name, THEME_MODES.SYSTEM);
        }

        mediaQuery.addEventListener('change', handleOSChange);
        return () => mediaQuery.removeEventListener('change', handleOSChange);
    }, [selectedThemeMode, theme.name]);

    // Resolve preview mode dynamically (follows OS when in System mode)
    const effectivePreviewMode = useMemo(() => {
        if (selectedThemeMode === THEME_MODES.SYSTEM) {
            return systemOSMode;
        }
        return selectedThemeMode;
    }, [selectedThemeMode, systemOSMode]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleModeSelect = async (mode) => {
        if (mode === selectedThemeMode || isThemeUpdating) return;

        const previousMode = selectedThemeMode;
        setLocalThemeMode(mode);
        setIsThemeUpdating(true);

        // Optimistically apply theme immediately
        applyUserTheme(theme.name, mode);
        saveThemeToLocalStorage(theme.name, mode);

        try {
            await updateTheme(theme.name, mode);
        } catch {
            setLocalThemeMode(previousMode);
            applyUserTheme(theme.name, previousMode);
            saveThemeToLocalStorage(theme.name, previousMode);
            toast.error('Failed to save color mode');
        } finally {
            setIsThemeUpdating(false);
        }
    };

    const handleThemeClick = async (themeOption) => {
        if (themeOption.isLocked) {
            setUpgradeTarget(themeOption);
            setIsUpgradeModalOpen(true);
            return;
        }

        if (theme.name === themeOption.value || isThemeUpdating) return;

        const previousThemeName = theme.name;
        setIsThemeUpdating(true);

        // Optimistically apply immediately
        applyUserTheme(themeOption.value, selectedThemeMode);
        saveThemeToLocalStorage(themeOption.value, selectedThemeMode);

        try {
            await updateTheme(themeOption.value, selectedThemeMode);
        } catch {
            applyUserTheme(previousThemeName, selectedThemeMode);
            saveThemeToLocalStorage(previousThemeName, selectedThemeMode);
            toast.error('Failed to apply theme preset');
        } finally {
            setIsThemeUpdating(false);
        }
    };

    const activeProfileColors = useMemo(() => {
        const profile = themeProfiles[theme.name] || themeProfiles[THEME_IDS.DEFAULT];
        return profile?.mode?.[effectivePreviewMode] || profile?.mode?.dark || {};
    }, [theme.name, effectivePreviewMode]);

    if (isLoading && !theme?.name) {
        return (
            <div className="flex h-[calc(100vh-10rem)] items-center justify-center font-semibold text-xs uppercase tracking-widest text-subtle-foreground/60 animate-pulse">
                Synchronizing Appearance...
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 bg-background text-foreground">
            {/* 1. TITLE HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        Appearance
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Personalize your workspace palette, interface mode, and display styling.
                    </p>
                </div>

                {isThemeUpdating && (
                    <div className="flex items-center gap-2 self-start sm:self-auto rounded-full bg-surface-sunken px-3 py-1 border border-border-subtle text-xs text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                        <span>Synchronizing...</span>
                    </div>
                )}
            </div>

            <Separator className="bg-border-subtle" />

            <div className="space-y-4">
                <div>
                    <h3 className="text-base font-semibold text-foreground">
                        Choose desired mode
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Choose your preferred appearance mode, or let your device automatically adjust it for you.
                    </p>
                </div>

                <Separator className="bg-border-subtle" />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {MODE_OPTIONS.map((opt) => {
                        const isSelected = selectedThemeMode === opt.id;
                        const Icon = opt.icon;

                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleModeSelect(opt.id)}
                                disabled={isThemeUpdating}
                                role="radio"
                                aria-checked={isSelected}
                                className={cn(
                                    "group relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 outline-none",
                                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                                    isSelected
                                        ? "border-primary bg-surface-elevated ring-1 ring-primary/20 shadow-xs"
                                        : "border-border-subtle bg-surface hover:bg-hover hover:border-border cursor-pointer",
                                    isThemeUpdating && "opacity-70 cursor-wait"
                                )}
                            >
                                <div className="flex w-full items-center justify-between">
                                    <div
                                        className={cn(
                                            "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
                                            isSelected
                                                ? "border-primary/30 bg-primary/10 text-primary"
                                                : "border-border-subtle bg-surface-sunken text-muted-foreground group-hover:text-foreground"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </div>

                                    {isSelected && (
                                        <CheckCircle2 className="h-4 w-4 text-primary fill-primary/15" />
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        {opt.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                                        {opt.description}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <Separator className="bg-border-subtle" />

            {/* 3. THEME PRESETS (ALL OPTIONS) */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <Palette className="h-4.5 w-4.5 text-primary shrink-0" />
                            <h3 className="text-base font-semibold text-foreground">
                                Theme Presets
                            </h3>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Choose an accent palette to customize sidebars, buttons, indicators, and charts.
                        </p>
                    </div>

                    <div>
                        {isPro ? (
                            <Badge
                                variant="outline"
                                className="w-fit gap-1.5 px-2.5 py-1 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 rounded-full"
                            >
                                All {allThemes.length} Themes Accessible
                            </Badge>
                        ) : (
                            <Badge
                                variant="outline"
                                className="w-fit gap-1.5 px-2.5 py-1 text-xs bg-warning/10 text-warning border-warning/20 rounded-full cursor-pointer hover:bg-warning/15 transition-colors"
                                onClick={() => {
                                    setUpgradeTarget(allThemes.find((t) => t.isLocked) || null);
                                    setIsUpgradeModalOpen(true);
                                }}
                            >
                                <Crown className="h-3 w-3" />
                                Pro Presets Available
                            </Badge>
                        )}
                    </div>
                </div>

                <Separator className="bg-border-subtle" />

                {/* Theme Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                    {allThemes.map((themeOption) => {
                        const isActive = theme.name === themeOption.value;
                        const isLocked = themeOption.isLocked;
                        const profile = themeProfiles[themeOption.value] || themeProfiles[THEME_IDS.DEFAULT];
                        const colors = profile?.mode?.[effectivePreviewMode] || profile?.mode?.dark || {};

                        return (
                            <div
                                key={themeOption.value}
                                onClick={() => handleThemeClick(themeOption)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleThemeClick(themeOption);
                                    }
                                }}
                                className={cn(
                                    "group relative flex flex-col rounded-xl border p-3 transition-all duration-200 text-left outline-none",
                                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                                    isActive
                                        ? "border-primary bg-surface-elevated ring-1 ring-primary/25 shadow-xs"
                                        : "border-border-subtle bg-surface hover:border-border hover:bg-hover/80 hover:-translate-y-0.5 cursor-pointer",
                                    isLocked && "hover:border-warning/40",
                                    isThemeUpdating && "cursor-wait"
                                )}
                            >
                                {/* Miniature UI Workspace Canvas */}
                                <div
                                    className="w-full h-24 sm:h-26 rounded-lg border overflow-hidden p-2 flex flex-col justify-between transition-colors duration-200 select-none"
                                    style={{
                                        backgroundColor: colors['--background'] || '#09090b',
                                        borderColor: colors['--border-subtle'] || 'rgba(255,255,255,0.08)'
                                    }}
                                >
                                    {/* Mini Window Bar */}
                                    <div
                                        className="flex items-center justify-between pb-1.5 border-b"
                                        style={{ borderColor: colors['--border-subtle'] || 'rgba(255,255,255,0.06)' }}
                                    >
                                        <div className="flex items-center gap-1">
                                            <div
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{ backgroundColor: colors['--destructive'] || '#ef4444' }}
                                            />
                                            <div
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{ backgroundColor: colors['--warning'] || '#f59e0b' }}
                                            />
                                            <div
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{ backgroundColor: colors['--success'] || '#10b981' }}
                                            />
                                        </div>

                                        <div
                                            className="h-1.5 w-10 rounded-full opacity-40"
                                            style={{ backgroundColor: colors['--foreground'] || '#fff' }}
                                        />

                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: colors['--primary'] || '#3b82f6' }}
                                        />
                                    </div>

                                    {/* Mini App Body: Sidebar + Main Canvas */}
                                    <div className="flex-1 flex gap-2 pt-1.5 items-stretch min-h-0">
                                        {/* Mini Sidebar */}
                                        <div
                                            className="w-5 rounded flex flex-col gap-1 p-1"
                                            style={{ backgroundColor: colors['--surface'] || 'rgba(255,255,255,0.04)' }}
                                        >
                                            {/* Active Nav Pill */}
                                            <div
                                                className="h-1.5 w-full rounded-xs"
                                                style={{ backgroundColor: colors['--primary'] || '#3b82f6' }}
                                            />
                                            <div
                                                className="h-1.5 w-3/4 rounded-xs opacity-25"
                                                style={{ backgroundColor: colors['--subtle-foreground'] || '#fff' }}
                                            />
                                            <div
                                                className="h-1.5 w-2/3 rounded-xs opacity-25"
                                                style={{ backgroundColor: colors['--subtle-foreground'] || '#fff' }}
                                            />
                                        </div>

                                        {/* Mini Canvas Card */}
                                        <div
                                            className="flex-1 rounded p-1.5 flex flex-col justify-between"
                                            style={{
                                                backgroundColor: colors['--surface-elevated'] || colors['--card'] || 'rgba(255,255,255,0.03)',
                                                border: `1px solid ${colors['--border-subtle'] || 'rgba(255,255,255,0.08)'}`
                                            }}
                                        >
                                            <div className="space-y-1">
                                                <div
                                                    className="h-1.5 w-12 rounded-xs"
                                                    style={{ backgroundColor: colors['--foreground'] || '#fff', opacity: 0.7 }}
                                                />
                                                <div
                                                    className="h-1 w-16 rounded-xs opacity-30"
                                                    style={{ backgroundColor: colors['--muted-foreground'] || '#fff' }}
                                                />
                                            </div>

                                            {/* Micro Action Button */}
                                            <div className="flex items-center justify-between pt-1">
                                                <div
                                                    className="h-1 w-6 rounded-xs opacity-30"
                                                    style={{ backgroundColor: colors['--subtle-foreground'] || '#fff' }}
                                                />
                                                <div
                                                    className="h-2.5 px-1.5 rounded-xs flex items-center justify-center text-[7px] font-bold shadow-2xs"
                                                    style={{
                                                        backgroundColor: colors['--primary'] || '#3b82f6',
                                                        color: colors['--primary-foreground'] || '#fff'
                                                    }}
                                                >
                                                    Active
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer Info */}
                                <div className="flex items-center justify-between pt-3">
                                    <div className="min-w-0 pr-2">
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-sm font-semibold truncate text-foreground">
                                                {themeOption.label}
                                            </p>
                                            {themeOption.value === THEME_IDS.DEFAULT && (
                                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1.5 py-0.5 rounded-xs bg-muted">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {isLocked
                                                ? "Pro Exclusive"
                                                : isActive
                                                    ? "Currently Active"
                                                    : "Click to apply"}
                                        </p>
                                    </div>

                                    {/* Action Status Indicator */}
                                    {isActive ? (
                                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground shadow-xs shrink-0">
                                            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                                        </div>
                                    ) : isLocked ? (
                                        <div className="flex items-center gap-1 text-warning bg-warning/10 border border-warning/20 px-2 py-0.5 rounded-full text-xs font-medium shrink-0">
                                            <Crown className="h-3 w-3" />
                                            <span>Pro</span>
                                        </div>
                                    ) : (
                                        <div className="h-6 w-6 rounded-full border border-border-subtle bg-surface-sunken opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shrink-0">
                                            <Check className="h-3 w-3 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <Separator className="bg-border-subtle" />

            {/* 4. WORKSPACE SPECIFICATIONS */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-base font-semibold text-foreground">
                        Workspace Specifications
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Current visual engine tokens and workspace rendering parameters.
                    </p>
                </div>

                <Separator className="bg-border-subtle" />

                <div className="rounded-xl border border-border-subtle divide-y divide-border-subtle bg-surface text-sm">
                    <div className="flex items-center justify-between py-3 px-4">
                        <span className="text-muted-foreground">Active Palette</span>
                        <span className="font-medium text-foreground flex items-center gap-2">
                            <span
                                className="h-2.5 w-2.5 rounded-full ring-1 ring-border/50"
                                style={{ backgroundColor: activeProfileColors['--primary'] || '#3b82f6' }}
                            />
                            {themeProfiles[theme.name]?.name || 'Default'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between py-3 px-4">
                        <span className="text-muted-foreground">Color Mode</span>
                        <span className="font-medium text-foreground capitalize flex items-center gap-1.5">
                            {selectedThemeMode === THEME_MODES.SYSTEM ? (
                                <>
                                    <span>System</span>
                                    <span className="text-xs text-muted-foreground font-normal">
                                        (Auto: {effectivePreviewMode === THEME_MODES.DARK ? 'Dark Mode' : 'Light Mode'})
                                    </span>
                                </>
                            ) : (
                                `${selectedThemeMode} Mode`
                            )}
                        </span>
                    </div>

                    <div className="flex items-center justify-between py-3 px-4">
                        <span className="text-muted-foreground">Theme License</span>
                        <span className="font-medium text-foreground flex items-center gap-1.5">
                            {isPro ? (
                                <span>Pro</span>
                            ) : (
                                <span>Free Tier</span>
                            )}
                        </span>
                    </div>
                </div>
            </div>

            {/* Pro Upgrade Modal Dialog */}
            <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="gap-2">
                        <div className="h-10 w-10 rounded-full bg-warning/10 text-warning flex items-center justify-center border border-warning/20 mb-1">
                            <Crown className="h-5 w-5" />
                        </div>
                        <DialogTitle className="text-lg font-bold">
                            Unlock {upgradeTarget?.label || 'Pro'} Theme
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                            This theme preset is part of the Pro workspace suite. Upgrade your account to unlock all 10 custom designer color palettes, advanced workspace branding, and priority team sync.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Pro Feature Highlights */}
                    <div className="rounded-lg border border-border-subtle bg-muted/30 p-3 space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-foreground font-medium">
                            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span>Instant access to all 10 crafted themes</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground font-medium">
                            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span>Custom workspace accents & navigation tokens</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground font-medium">
                            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span>Priority cross-device preference sync</span>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsUpgradeModalOpen(false)}
                        >
                            Maybe Later
                        </Button>
                        <Button
                            className="bg-primary text-primary-foreground font-semibold gap-1.5"
                            onClick={() => {
                                setIsUpgradeModalOpen(false);
                                toast.info('Billing & Pro subscription plans opening soon!');
                            }}
                        >
                            <Crown className="h-4 w-4" />
                            Upgrade to Pro
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Appearance;