import { memo } from 'react';
import { CreditCard, ExternalLink } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { DetailRow } from './DetailRow';

export const OrganizationSubscription = memo(({
    subscription,
    formattedRenewalDate,
    onManageSubscription,
}) => {
    return (
        <section className="space-y-4">
            <SectionHeader
                icon={CreditCard}
                title="Subscription"
                description="Your current plan and billing"
            />

            <div className="space-y-1 pt-1">
                <DetailRow
                    label="Current Plan"
                    value={subscription?.plan?.toUpperCase() || 'FREE'}
                    valueClassName="uppercase font-bold tracking-wider text-primary text-xs"
                />
                <DetailRow
                    label="Renewal Date"
                    value={formattedRenewalDate}
                />
                <DetailRow
                    label="Billing Status"
                    value={subscription?.status || 'Active'}
                    valueClassName="capitalize text-xs font-medium text-success"
                />

                <div className="pt-3">
                    <button
                        type="button"
                        onClick={onManageSubscription}
                        className="w-full h-8 px-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                        <ExternalLink className="h-3.5 w-3.5 text-primary" />
                        <span>Manage subscription</span>
                    </button>
                </div>
            </div>
        </section>
    );
});
OrganizationSubscription.displayName = 'OrganizationSubscription';
