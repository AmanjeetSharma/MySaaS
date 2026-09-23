import { memo } from 'react';

export const SectionHeader = memo(({ icon: Icon, title, description, action }) => (
    <div className="flex items-start justify-between gap-4 pb-3">
        <div className="space-y-1">
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <h2 className="font-heading text-sm font-semibold tracking-tight text-foreground uppercase">
                    {title}
                </h2>
            </div>
            {description && (
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
            )}
        </div>
        {action}
    </div>
));
SectionHeader.displayName = 'SectionHeader';
