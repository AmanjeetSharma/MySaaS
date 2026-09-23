import { Link } from 'react-router-dom';
import {
    Building2, Users, Crown, User,
    Zap, ArrowUpRight, Trash2, Plus, CheckCircle2, Loader2
} from 'lucide-react';
import { INTEGRATION_LIST } from '@/constants/integrations.constant';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export const OrganizationCard = ({
    org,
    isActive,
    isOwner,
    onSelect,
    onDelete,
    isSwitching = false,
}) => {
    const displayMemberCount = org.members?.length || org.usage?.memberCount || 0;

    // Filter integrations to ONLY include those that are connected/enabled
    const connectedIntegrations = INTEGRATION_LIST.filter((item) => {
        const keyData = org.integrations?.[item.integrationKey];
        return keyData?.isConnected === true || keyData?.isEnabled === true;
    });

    const handleKeyDown = (e) => {
        if (!isActive && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onSelect(org._id);
        }
    };

    return (
        <div
            role={isActive ? undefined : "button"}
            tabIndex={isActive ? -1 : 0}
            onKeyDown={handleKeyDown}
            aria-label={isActive ? `${org.name} (Active Workspace)` : `Switch active workspace to ${org.name}`}
            onClick={() => !isActive && onSelect(org._id)}
            className={`group relative flex flex-col justify-between rounded-2xl p-5 sm:p-6 transition-all duration-300 ease-out border focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
              ${isActive
                    ? 'border-primary bg-surface-sunken shadow-lg shadow-primary/10 ring-1 ring-primary/20 cursor-default'
                    : 'border-border-subtle bg-surface-elevated hover:border-primary/50 hover:shadow-md cursor-pointer'
                }
            `}
        >
            {/* Top Active / Switching Badge on the border */}
            {isSwitching ? (
                <div className="absolute -top-3 right-6 z-10 pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-md shadow-primary/25 ring-4 ring-background animate-pulse">
                        <Loader2 className="h-3 w-3 animate-spin" /> Switching...
                    </span>
                </div>
            ) : isActive ? (
                <div className="absolute -top-3 right-6 z-10 pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-md shadow-primary/25 ring-4 ring-background">
                        <CheckCircle2 className="h-3 w-3" /> Active
                    </span>
                </div>
            ) : null}

            {/* Main Content Area */}
            <div className="space-y-5">
                {/* Header: Icon + Owner/Member Badge */}
                <div className="flex items-center justify-between gap-3">
                    <div className={`
                        flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 shrink-0
                        ${isActive
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                            : 'bg-surface text-subtle-foreground group-hover:bg-primary/10 group-hover:text-primary'
                        }
                    `}>
                        <Building2 className="h-6 w-6" />
                    </div>

                    <div>
                        {isOwner ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-warning border border-warning/20">
                                <Crown className="h-3 w-3" /> Owner
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary-foreground border border-border-subtle">
                                <User className="h-3 w-3" /> Member
                            </span>
                        )}
                    </div>
                </div>

                {/* Title and Connected Integration Icons with Tooltips */}
                <div>
                    <h3 className="font-heading text-xl font-bold tracking-tight text-foreground truncate transition-colors">
                        {org.name}
                    </h3>

                    {/* Connected Provider Icons with Shadcn Tooltips */}
                    <div className="mt-2.5 flex items-center gap-1.5 min-h-7">
                        {connectedIntegrations.length > 0 ? (
                            <TooltipProvider delayDuration={150}>
                                {connectedIntegrations.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Tooltip key={item.integrationKey}>
                                            <TooltipTrigger asChild>
                                                <div className="p-1.5 rounded-xl bg-success/10 text-success border border-success/20 transition-transform hover:scale-105 cursor-pointer">
                                                    <Icon className="h-3.5 w-3.5" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" sideOffset={4}>
                                                {item.name}
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                })}
                            </TooltipProvider>
                        ) : (
                            <span className="text-[11px] text-subtle-foreground/60 italic">
                                No integrations connected
                            </span>
                        )}
                    </div>
                </div>

                {/* Compact Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-surface p-3 border border-border-subtle">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-subtle-foreground uppercase tracking-wider">Team Size</span>
                        <div className="mt-1 flex items-center gap-1.5 text-foreground">
                            <Users className="h-3.5 w-3.5 text-subtle-foreground" />
                            <span className="text-xs font-bold">{displayMemberCount} <span className="font-normal text-subtle-foreground">members</span></span>
                        </div>
                    </div>

                    <div className="flex flex-col border-l border-border-subtle pl-3">
                        <span className="text-[10px] font-semibold text-subtle-foreground uppercase tracking-wider">Plan Tier</span>
                        <div className="mt-1 flex items-center gap-1.5 text-foreground">
                            <Zap className={`h-3.5 w-3.5 ${org.subscription?.plan === 'pro' ? 'text-warning fill-warning' : 'text-subtle-foreground'}`} />
                            <span className="text-xs font-bold capitalize">{org.subscription?.plan || 'Free'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card Actions */}
            <div className="mt-6 flex items-center gap-2 pt-1">
                <Link
                    to={`/organizations/${org._id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-secondary text-xs font-semibold text-secondary-foreground transition-all hover:bg-accent hover:text-accent-foreground active:scale-95 cursor-pointer shadow-2xs"
                >
                    Manage Details <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                {isOwner && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(org);
                        }}
                        title="Delete Organization"
                        aria-label="Delete Organization"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-destructive/20 text-destructive transition-all hover:bg-destructive/15 hover:text-destructive active:scale-90 cursor-pointer shrink-0"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

export const CreateOrganizationCard = ({ onClick }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className="
                group relative flex min-h-[280px] h-full w-full flex-col items-center justify-center
                rounded-2xl border-2 border-dashed border-border-strong
                bg-surface-elevated/50 p-6
                transition-all duration-300 ease-out
                hover:border-primary hover:bg-surface-elevated hover:shadow-md
                cursor-pointer
            "
        >
            <div className="
                flex h-12 w-12 items-center justify-center
                rounded-2xl bg-surface text-subtle-foreground
                transition-all duration-500
                group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-90 group-hover:shadow-lg group-hover:shadow-primary/25
            ">
                <Plus className="h-6 w-6" />
            </div>

            <h3 className="font-heading mt-4 text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                New Workspace
            </h3>

            <p className="mt-1 text-xs text-subtle-foreground max-w-[220px] text-center leading-relaxed">
                Set up an automated space for your team operations.
            </p>

            <div className="
                mt-4 inline-flex items-center gap-1.5
                rounded-xl bg-accent px-4 py-2
                text-xs font-bold text-accent-foreground
                shadow-md shadow-accent/20
                opacity-0 translate-y-2
                group-hover:opacity-100 group-hover:translate-y-0
                transition-all duration-300
            ">
                Create Workspace
            </div>
        </button>
    );
};