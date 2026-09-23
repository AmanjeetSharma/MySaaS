import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { THEME_IDS, THEME_MODES } from '@/theme/theme.constant.js';
import { themeProfiles } from '@/config/theme.config.js';
import { applyUserTheme } from '@/theme/theme.utils.js';
import { saveThemeToLocalStorage } from '@/theme/themeSync.utils.js';
import ThemeModeCard from './ThemeModeCard';
import ThemePreviewCard from './ThemePreviewCard';

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
import { toast } from 'sonner';

import {
    Sun,
    Moon,
    Laptop,
    Crown,
    Check,
    Palette,
    Loader2
} from 'lucide-react';

const MODE_OPTIONS = [
    {
        id: THEME_MODES.LIGHT,
        label: 'Light',
        description: 'For brighter environments',
        icon: Sun
    },
    {
        id: THEME_MODES.DARK,
        label: 'Dark',
        description: 'For darker environments',
        icon: Moon
    },
    {
        id: THEME_MODES.SYSTEM,
        label: 'System',
        description: 'Follows your system preference',
        icon: Laptop
    }
];


const Appearance = () => {
    // Atomic store subscriptions to avoid unnecessary re-renders
    const theme = useSettingsStore((state) => state.theme);
    const isLoading = useSettingsStore((state) => state.isLoading);
    const fetchSettings = useSettingsStore((state) => state.fetchSettings);
    const updateTheme = useSettingsStore((state) => state.updateTheme);
    const isPro = useSettingsStore((state) => state.theme?.tier === 'pro');

    const [localThemeMode, setLocalThemeMode] = useState(null);
    const [isThemeUpdating, setIsThemeUpdating] = useState(false);
    const [upgradeTarget, setUpgradeTarget] = useState(null);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    // Stable themes list with pro metadata
    const allThemes = useMemo(() => {
        return Object.values(THEME_IDS).map((themeId) => ({
            value: themeId,
            label: themeId.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            isLocked: !isPro && themeId !== THEME_IDS.DEFAULT
        }));
    }, [isPro]);

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

    // Synchronize OS scheme changes for real-time preview accuracy
    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleOSChange = (e) => {
            setSystemOSMode(e.matches ? THEME_MODES.DARK : THEME_MODES.LIGHT);
        };

        mediaQuery.addEventListener('change', handleOSChange);
        return () => mediaQuery.removeEventListener('change', handleOSChange);
    }, []);

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

    const handleModeSelect = useCallback(async (mode) => {
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
    }, [selectedThemeMode, isThemeUpdating, theme.name, updateTheme]);

    const handleThemeClick = useCallback(async (themeOption) => {
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
    }, [theme.name, isThemeUpdating, selectedThemeMode, updateTheme]);

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
                        Choose your preferred theme and interface mode.
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

            {/* 2. CHOOSE DESIRED MODE */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-base font-semibold text-foreground">
                        Choose desired mode
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Choose your preferred theme and mode, or let your device automatically adjust it for you.
                    </p>
                </div>

                <Separator className="bg-border-subtle" />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {MODE_OPTIONS.map((opt) => (
                        <ThemeModeCard
                            key={opt.id}
                            option={opt}
                            isSelected={selectedThemeMode === opt.id}
                            isThemeUpdating={isThemeUpdating}
                            onSelect={handleModeSelect}
                        />
                    ))}
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
                            Choose your desired theme preset.
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
                    {allThemes.map((themeOption) => (
                        <ThemePreviewCard
                            key={themeOption.value}
                            themeOption={themeOption}
                            isActive={theme.name === themeOption.value}
                            effectivePreviewMode={effectivePreviewMode}
                            isThemeUpdating={isThemeUpdating}
                            onClick={handleThemeClick}
                        />
                    ))}
                </div>
            </div>

            <Separator className="bg-border-subtle" />

            {/* 4. WORKSPACE */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-base font-semibold text-foreground">
                        Workspace Specifications
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        View your current workspace theme, mode, and plan details.
                    </p>
                </div>

                <Separator className="bg-border-subtle" />

                <div className="rounded-xl border border-border-subtle divide-y divide-border-subtle bg-surface text-sm">
                    <div className="flex items-center justify-between py-3 px-4">
                        <span className="text-muted-foreground">Active Theme Preset</span>
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
                        <span className="text-muted-foreground">Current Plan</span>
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
                <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md p-5 sm:p-6 rounded-2xl border border-border-subtle bg-surface-elevated text-surface-elevated-foreground shadow-2xl">

                    {/* Header Section */}
                    <DialogHeader className="gap-3 text-left">
                        <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-warning/30 bg-warning/10 text-warning">
                            <Crown className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>

                        <div className="space-y-1">
                            <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                                Unlock {upgradeTarget?.label || 'Pro'} Theme
                            </DialogTitle>
                            <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                Upgrade to unlock full aesthetic control across your entire workspace.
                            </DialogDescription>
                        </div>
                    </DialogHeader>



                    {/* Responsive Button Group */}
                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto flex-1 h-10 sm:h-11 rounded-lg border-border-subtle bg-surface text-subtle-foreground hover:bg-hover hover:text-hover-foreground text-xs sm:text-sm font-medium cursor-pointer"
                            onClick={() => setIsUpgradeModalOpen(false)}
                        >
                            Maybe Later
                        </Button>

                        <Button
                            className="w-full sm:w-auto flex-1 h-10 sm:h-11 rounded-lg bg-primary text-primary-foreground hover:opacity-90 text-xs sm:text-sm font-semibold gap-2 cursor-pointer"
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
