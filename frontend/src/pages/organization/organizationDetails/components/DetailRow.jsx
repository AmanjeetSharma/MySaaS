import { memo } from 'react';
import { cn } from '@/lib/utils';

export const DetailRow = memo(({ label, value, valueClassName }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-border-subtle/50 last:border-0">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn("text-xs font-medium text-foreground", valueClassName)}>
            {value}
        </span>
    </div>
));
DetailRow.displayName = 'DetailRow';
