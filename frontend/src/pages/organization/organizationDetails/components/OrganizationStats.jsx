import { memo } from 'react';

// Flat Stat Metrology Item (Memoized to prevent re-renders on form typing)
export const StatItem = memo(({ label, value, limit, icon: Icon, badge, unit = '' }) => {
    const percentage = Math.min(((value || 0) / (limit || 1)) * 100, 100);

    return (
        <div className="p-4 sm:p-5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {label}
                    </span>
                </div>
                {badge && (
                    <span className="text-[10px] font-medium text-muted-foreground/80 px-1.5 py-0.5 rounded bg-surface border border-border-subtle/60">
                        {badge}
                    </span>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading tabular-nums">
                            {value?.toLocaleString() ?? 0}
                        </span>
                        {limit !== undefined && (
                            <span className="text-xs text-muted-foreground font-normal tabular-nums">
                                / {limit?.toLocaleString()} {unit}
                            </span>
                        )}
                    </div>
                    <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                        {percentage.toFixed(0)}%
                    </span>
                </div>

                <div className="h-1 bg-surface-sunken rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
});
StatItem.displayName = 'StatItem';

// Flat Metrology Summary Strip
export const OrganizationStats = memo(({ stats }) => {
    if (!Array.isArray(stats) || stats.length === 0) return null;

    return (
        <div className="border-y border-border-subtle grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border-subtle -mx-4 sm:mx-0">
            {stats.map((stat) => (
                <StatItem key={stat.label} {...stat} />
            ))}
        </div>
    );
});
OrganizationStats.displayName = 'OrganizationStats';
