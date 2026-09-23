import { memo } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { INTEGRATION_LIST } from '@/constants/integrations.constant';
import { SectionHeader } from './SectionHeader';

// Flat Integration Row (Memoized)
export const IntegrationRow = memo(({ name, description, icon: Icon, connected, path }) => (
    <Link
        to={path}
        className="flex items-center justify-between py-3.5 px-2 hover:bg-hover/50 -mx-2 rounded-lg transition-colors group cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
        <div className="flex items-center gap-3.5 min-w-0">
            <div className={cn(
                "p-2 rounded-lg shrink-0 transition-colors",
                connected
                    ? "bg-success/10 text-success border border-success/20"
                    : "bg-surface text-muted-foreground border border-border-subtle"
            )}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground group-hover:text-hover-foreground transition-colors truncate">
                        {name}
                    </p>
                    {connected && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-success uppercase tracking-wider">
                            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                            Connected
                        </span>
                    )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                    {connected ? 'Active & synchronized' : description || 'Not configured'}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-3">
            <span className="text-xs font-medium hidden sm:inline">Configure</span>
            <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
    </Link>
));
IntegrationRow.displayName = 'IntegrationRow';

export const OrganizationIntegrations = memo(({ integrations, integrationList = INTEGRATION_LIST }) => {
    return (
        <section className="space-y-4">
            <SectionHeader
                icon={LayoutGrid}
                title="Integrations"
                description="Connect external services to your organization"
            />

            <div className="divide-y divide-border-subtle/60 border-y border-border-subtle/60">
                {integrationList.map((item) => {
                    const isConnected = integrations?.[item.integrationKey]?.isConnected;
                    const Icon = item.icon;

                    return (
                        <IntegrationRow
                            key={item.integrationKey}
                            name={item.name}
                            description={item.description}
                            icon={Icon}
                            connected={isConnected}
                            path={item.path}
                        />
                    );
                })}
            </div>
        </section>
    );
});
OrganizationIntegrations.displayName = 'OrganizationIntegrations';
