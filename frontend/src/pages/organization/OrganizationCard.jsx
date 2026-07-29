import { Link } from 'react-router-dom';
import {
    Building2, Users, Crown, UserPlus,
    Zap, Calendar, MessageSquare, ArrowUpRight,
    Trash2, Plus, Sparkles, CheckCircle2
} from 'lucide-react';

// --- Reusable Organization Card ---
export const OrganizationCard = ({ org, isActive, isOwner, onSelect, onDelete, isUpdating }) => {
    const displayMemberCount = org.members?.length || org.usage?.memberCount || 0;

    return (
        <div
            onClick={() => !isActive && onSelect(org._id)}
            className={`
        group relative flex flex-col justify-between rounded-3xl border p-6 transition-all duration-300 ease-out
        ${isActive
                    ? 'border-primary bg-primary/[0.03] shadow-xl shadow-primary/10 ring-2 ring-primary/20'
                    : 'border-border/60 bg-card hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 cursor-pointer'
                }
        ${isUpdating ? 'pointer-events-none opacity-60' : ''}
      `}
        >
            {/* Top Active Pill Accent */}
            {isActive && (
                <div className="absolute -top-3.5 right-6">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/25 ring-2 ring-background">
                        <CheckCircle2 className="h-3 w-3" /> Active
                    </span>
                </div>
            )}

            {/* Main Content Area */}
            <div className="space-y-6">
                {/* Header: Icon + Owner/Member Badge */}
                <div className="flex items-center justify-between gap-3">
                    <div className={`
            flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300
            ${isActive
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                            : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                        }
          `}>
                        <Building2 className="h-6 w-6" />
                    </div>

                    {isOwner ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Crown className="h-3 w-3" /> Owner
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            <UserPlus className="h-3 w-3" /> Member
                        </span>
                    )}
                </div>

                {/* Title and Integrations Row */}
                <div>
                    <h3 className="text-xl font-bold tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
                        {org.name}
                    </h3>

                    {/* Active Integrations Badges */}
                    <div className="mt-2.5 flex items-center gap-1.5 min-h-6">
                        {org.integrations?.whatsapp?.isConnected || org.integrations?.whatsapp?.isEnabled ? (
                            <div title="WhatsApp Connected" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-medium">
                                <MessageSquare className="h-2.5 w-2.5" /> WhatsApp
                            </div>
                        ) : null}
                        {org.integrations?.google?.isConnected || org.integrations?.googleCalendar?.isConnected ? (
                            <div title="Google Calendar Connected" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px] font-medium">
                                <Calendar className="h-2.5 w-2.5" /> Calendar
                            </div>
                        ) : null}
                        {(!org.integrations?.whatsapp?.isConnected && !org.integrations?.google?.isConnected) && (
                            <span className="text-xs text-muted-foreground/60 italic">No integrations linked</span>
                        )}
                    </div>
                </div>

                {/* Compact Metrics Grid (Team Size & Tier) */}
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted/40 p-3 border border-border/40">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Team Size</span>
                        <div className="mt-1 flex items-center gap-1.5 text-foreground">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-bold">{displayMemberCount} <span className="font-normal text-muted-foreground">members</span></span>
                        </div>
                    </div>

                    <div className="flex flex-col border-l border-border/60 pl-3">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Plan Tier</span>
                        <div className="mt-1 flex items-center gap-1.5 text-foreground">
                            <Zap className={`h-3.5 w-3.5 ${org.subscription?.plan === 'pro' ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                            <span className="text-xs font-bold capitalize">{org.subscription?.plan || 'Free'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card Actions */}
            <div className="mt-6 flex items-center gap-2 pt-2">
                <Link
                    to={`/organizations/${org._id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-secondary text-xs font-semibold text-secondary-foreground transition-all hover:bg-primary hover:text-primary-foreground active:scale-95 cursor-pointer"
                >
                    Manage Details <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                {isOwner && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(org);
                        }}
                        title="Delete Organization"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-destructive/20 text-destructive transition-all hover:bg-destructive hover:text-destructive-foreground active:scale-90 cursor-pointer shrink-0"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

// --- Reusable Create Organization Card ---
export const CreateOrganizationCard = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="
        group relative flex min-h-[260px] w-full flex-col items-center justify-center
        rounded-3xl border-2 border-dashed border-border/80
        bg-card/50 p-6
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:border-primary/50 hover:bg-primary/[0.02] hover:shadow-xl hover:shadow-primary/5
        cursor-pointer
      "
        >
            <div className="
        flex h-14 w-14 items-center justify-center
        rounded-2xl bg-muted text-muted-foreground
        transition-all duration-500
        group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-90 group-hover:shadow-lg group-hover:shadow-primary/25
      ">
                <Plus className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                New Workspace
            </h3>

            <p className="mt-1 text-xs text-muted-foreground max-w-[200px] text-center leading-relaxed">
                Set up an automated space for your team operations.
            </p>

            <div className="
        mt-5 inline-flex items-center gap-1.5
        rounded-xl bg-primary px-4 py-2
        text-xs font-bold text-primary-foreground
        shadow-md shadow-primary/20
        opacity-0 translate-y-2
        group-hover:opacity-100 group-hover:translate-y-0
        transition-all duration-300
      ">
                <Sparkles className="h-3.5 w-3.5" />
                Create Workspace
            </div>
        </button>
    );
};