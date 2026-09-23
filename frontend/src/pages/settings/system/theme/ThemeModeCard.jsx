import React, { memo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const ThemeModeCard = memo(({ option, isSelected, isThemeUpdating, onSelect }) => {
    const Icon = option.icon;

    return (
        <button
            type="button"
            onClick={() => onSelect(option.id)}
            disabled={isThemeUpdating}
            role="radio"
            aria-checked={isSelected}
            className={cn(
                "group relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                isSelected
                    ? "border-primary bg-surface-elevated ring-1 ring-primary/20 shadow-xs"
                    : "border-border-subtle bg-surface hover:bg-hover hover:border-border cursor-pointer",
                isThemeUpdating && "opacity-70"
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
                    {option.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    {option.description}
                </p>
            </div>
        </button>
    );
});

ThemeModeCard.displayName = 'ThemeModeCard';

export default ThemeModeCard;
