import { memo } from 'react';
import { Building2, ArrowLeft, Crown, Copy, Check, AlertTriangle, RefreshCw } from 'lucide-react';

export const OrganizationHero = memo(({
    organization,
    isOwner,
    formattedCreatedAt,
    copiedSlug,
    onCopySlug,
    onOpenSyncModal,
    isSyncingSlug,
    isUpdating,
    onBack,
}) => {
    if (!organization) return null;

    return (
        <div className="space-y-4">
            {/* Back Navigation Button */}
            <div>
                <button
                    type="button"
                    onClick={onBack}
                    className="group inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-xs"
                >
                    <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                    <span>Back to organizations</span>
                </button>
            </div>

            {/* Organization Hero Bar */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-center gap-3.5 sm:gap-4">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-surface border border-border flex items-center justify-center text-foreground shrink-0">
                        <Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-subtle-foreground" />
                    </div>

                    <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate max-w-md">
                                {organization.name}
                            </h1>
                            <span className="px-2 py-0.5 bg-secondary text-[10px] sm:text-xs font-semibold text-secondary-foreground rounded-full border border-border-subtle uppercase tracking-wider">
                                {organization.subscription?.plan?.toUpperCase() || 'FREE'}
                            </span>
                            {isOwner && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-warning bg-warning/10 border border-warning/20 rounded-full">
                                    <Crown className="h-3 w-3" />
                                    Owner
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span>Created at {formattedCreatedAt}</span>
                            <span className="text-border-subtle">•</span>
                            <button
                                type="button"
                                onClick={onCopySlug}
                                title="Click to copy public booking url path"
                                aria-label="Copy public booking link"
                                className="inline-flex items-center gap-1.5 font-mono text-foreground/80 hover:text-foreground hover:underline transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-xs"
                            >
                                <span>/{organization.slug}</span>
                                {copiedSlug ? (
                                    <Check className="h-3 w-3 text-success shrink-0" />
                                ) : (
                                    <Copy className="h-3 w-3 text-muted-foreground group-hover:text-foreground shrink-0" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stale Slug Alert Banner (Flat) */}
            {organization.isSlugStale && (
                <div className="p-3.5 sm:p-4 rounded-xl border border-warning/30 bg-warning/10 text-warning flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                        <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider">Public URL Out of Sync</h4>
                            <p className="text-xs opacity-90 mt-0.5">
                                Your organization name was updated, but your public URL (<code className="font-mono font-bold bg-warning/15 px-1 rounded">{organization.slug}</code>) is still out of sync.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onOpenSyncModal}
                        disabled={isSyncingSlug || isUpdating}
                        className="self-end sm:self-auto h-7 px-3 bg-warning hover:opacity-90 text-background rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning"
                    >
                        <RefreshCw className="h-3 w-3" />
                        <span>Sync URL Slug</span>
                    </button>
                </div>
            )}
        </div>
    );
});
OrganizationHero.displayName = 'OrganizationHero';
