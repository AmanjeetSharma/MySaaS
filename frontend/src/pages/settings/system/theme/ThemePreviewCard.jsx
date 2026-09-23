import React, { useMemo, memo } from 'react';
import { THEME_IDS } from '@/theme/theme.constant.js';
import { themeProfiles } from '@/config/theme.config.js';
import { cn } from '@/lib/utils';
import { Check, Crown } from 'lucide-react';

const ThemePreviewCard = memo(({
    themeOption,
    isActive,
    effectivePreviewMode,
    isThemeUpdating,
    onClick
}) => {
    const { value, label, isLocked } = themeOption;

    const colors = useMemo(() => {
        const profile = themeProfiles[value] || themeProfiles[THEME_IDS.DEFAULT];
        return profile?.mode?.[effectivePreviewMode] || profile?.mode?.dark || {};
    }, [value, effectivePreviewMode]);

    const previewStyle = useMemo(() => ({
        '--p-bg': colors['--background'] || '#09090b',
        '--p-border': colors['--border-subtle'] || 'rgba(255,255,255,0.08)',
        '--p-border-line': colors['--border-subtle'] || 'rgba(255,255,255,0.06)',
        '--p-surface': colors['--surface'] || 'rgba(255,255,255,0.04)',
        '--p-elevated': colors['--surface-elevated'] || colors['--card'] || 'rgba(255,255,255,0.03)',
        '--p-fg': colors['--foreground'] || '#fff',
        '--p-muted': colors['--muted-foreground'] || '#fff',
        '--p-subtle': colors['--subtle-foreground'] || '#fff',
        '--p-primary': colors['--primary'] || '#3b82f6',
        '--p-primary-fg': colors['--primary-foreground'] || '#fff',
        '--p-secondary': colors['--secondary'] || 'rgba(255,255,255,0.08)',
        '--p-accent': colors['--accent'] || colors['--primary'] || '#3b82f6',
        '--p-accent-fg': colors['--accent-foreground'] || '#fff',
        '--p-destr': colors['--destructive'] || '#ef4444',
        '--p-warn': colors['--warning'] || '#f59e0b',
        '--p-success': colors['--success'] || '#10b981',
    }), [colors]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(themeOption);
        }
    };

    return (
        <div
            onClick={() => onClick(themeOption)}
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
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
                className="w-full h-24 sm:h-26 rounded-lg border overflow-hidden p-2 flex flex-col justify-between transition-colors duration-200 select-none bg-[var(--p-bg)] border-[var(--p-border)]"
                style={previewStyle}
            >
                {/* Mini Window Bar */}
                <div className="flex items-center justify-between pb-1.5 border-b border-[var(--p-border-line)]">
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--p-destr)]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--p-warn)]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--p-success)]" />
                    </div>

                    <div className="h-1.5 w-10 rounded-full opacity-40 bg-[var(--p-fg)]" />

                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--p-accent)] opacity-90" />
                        <div className="w-2 h-2 rounded-full bg-[var(--p-primary)]" />
                    </div>
                </div>

                {/* Mini App Body: Sidebar + Main Canvas */}
                <div className="flex-1 flex gap-2 pt-1.5 items-stretch min-h-0">
                    {/* Mini Sidebar */}
                    <div className="w-5 rounded flex flex-col gap-1 p-1 bg-[var(--p-surface)]">
                        <div className="h-1.5 w-full rounded-xs bg-[var(--p-primary)]" />
                        <div className="h-1.5 w-3/4 rounded-xs bg-[var(--p-accent)] opacity-75" />
                        <div className="h-1.5 w-2/3 rounded-xs opacity-25 bg-[var(--p-subtle)]" />
                    </div>

                    {/* Mini Canvas Card */}
                    <div className="flex-1 rounded p-1.5 flex flex-col justify-between bg-[var(--p-elevated)] border border-[var(--p-border)]">
                        <div className="space-y-1">
                            <div className="h-1.5 w-12 rounded-xs opacity-70 bg-[var(--p-fg)]" />
                            <div className="h-1 w-16 rounded-xs opacity-30 bg-[var(--p-muted)]" />
                        </div>

                        {/* Micro Action Button & Accent Tag */}
                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1">
                                <div className="h-1.5 w-3.5 rounded-xs bg-[var(--p-accent)] opacity-80" />
                                <div className="h-1 w-4 rounded-xs opacity-30 bg-[var(--p-subtle)]" />
                            </div>
                            <div className="h-2.5 px-1.5 rounded-xs flex items-center justify-center text-[7px] font-bold shadow-2xs bg-[var(--p-primary)] text-[var(--p-primary-fg)]">
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
                        {/* Dual-tone palette dot preview */}
                        <div className="flex items-center -space-x-1 shrink-0">
                            <span
                                className="h-2.5 w-2.5 rounded-full ring-1 ring-surface-elevated z-10 shadow-2xs"
                                style={{ backgroundColor: colors['--primary'] || '#3b82f6' }}
                            />
                            <span
                                className="h-2.5 w-2.5 rounded-full ring-1 ring-surface-elevated shadow-2xs"
                                style={{ backgroundColor: colors['--accent'] || colors['--primary'] || '#3b82f6' }}
                            />
                        </div>

                        <p className="text-sm font-semibold truncate text-foreground">
                            {label}
                        </p>
                        {value === THEME_IDS.DEFAULT && (
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
});

ThemePreviewCard.displayName = 'ThemePreviewCard';

export default ThemePreviewCard;
