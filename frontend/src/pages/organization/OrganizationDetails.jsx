import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Building2, Save, ArrowLeft, ShieldCheck,
    Users, Cpu, UserPlus, Zap, CheckCircle2,
    Calendar, MessageSquare, BadgeCheck, Circle,
    Settings2, ChevronRight, LayoutGrid, RefreshCw, AlertCircle, Activity
} from 'lucide-react';
import { BsPlug } from "react-icons/bs";
import { toast } from 'sonner';
import { useOrganizationStore } from '@/stores';

export default function OrganizationDetails() {
    const { orgId } = useParams();
    const navigate = useNavigate();
    const { getOrganization, updateOrganization, ownedOrganization, isLoading, isUpdating } = useOrganizationStore();

    const [organization, setOrganization] = useState(null);
    const [orgName, setOrgName] = useState('');

    useEffect(() => {
        const fetchOrganization = async () => {
            try {
                const data = await getOrganization(orgId);
                setOrganization(data);
                setOrgName(data.name);
            } catch (error) {
                toast.error('Failed to load organization');
                navigate('/organizations');
            }
        };
        fetchOrganization();
    }, [orgId, getOrganization, navigate]);

    const isOwner = ownedOrganization?._id === orgId;

    const handleUpdate = async () => {
        try {
            await updateOrganization(orgId, orgName);
            toast.success('Organization updated');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Update failed');
        }
    };

    if (isLoading || !organization) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    const stats = [
        { label: 'Members', value: organization.members?.length, limit: organization.meta?.limits?.maxMembers, icon: Users, color: 'text-blue-500' },
        {
            label: "Today's AI Usage",
            value: organization.usage?.aiCreditsUsed,
            limit: organization.meta?.limits?.aiCredits,
            icon: Cpu,
            color: 'text-purple-500',
            badge: 'Resets daily'
        },
        { label: 'Customers', value: organization.usage?.customerCount, limit: organization.meta?.limits?.maxCustomers, icon: UserPlus, color: 'text-emerald-500' },
    ];

    const remainingSlots = (organization.meta?.limits?.maxMembers || 0) - (organization.members?.length || 0);

    return (
        <div className="mx-auto max-w-6xl px-4 py-4 md:py-10 antialiased font-sans">

            {/* Nav Row */}
            <div className="mb-6 md:mb-10">
                <button
                    onClick={() => navigate('/organizations')}
                    className="group flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Dashboard
                </button>
            </div>

            {/* Profile Header */}
            <header className="mb-8 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground shadow-sm ring-1 ring-border md:h-24 md:w-24">
                        <Building2 className="h-8 w-8 opacity-90 md:h-12 md:w-12" />
                    </div>
                    {isOwner && (
                        <div className="absolute -bottom-1 -right-1 rounded-full bg-background p-1 shadow-md ring-1 ring-border">
                            <BadgeCheck className="h-4 w-4 text-blue-500 fill-blue-50 md:h-6 md:w-6" />
                        </div>
                    )}
                </div>

                <div className="flex-1 text-center sm:text-left pt-2">
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                        <h1 className="text-2xl font-black tracking-tight md:text-5xl uppercase">{organization.name}</h1>
                        <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-primary border border-primary/20">
                            {/* <Zap className="h-2.5 w-2.5 fill-current" /> */}
                            {organization.subscription?.plan?.toUpperCase()}
                        </span>
                    </div>
                    <div className="mt-2 flex flex-wrap justify-center gap-4 sm:justify-start">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                            <Calendar className="h-3 w-3" />
                            Active since{" - "}
                            {new Date(organization.createdAt).toLocaleDateString(undefined, {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            })}
                        </div>
                    </div>
                </div>
            </header>

            {/* Visual Stats Row - COMPACT 3-Column mobile grid */}
            <div className="mb-12 grid grid-cols-3 gap-2 md:gap-6">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="group p-2.5 md:p-5 border-l-2 md:border-l-[3px] border-muted hover:border-primary transition-all duration-300 bg-card/30 flex flex-col justify-between overflow-hidden"
                    >
                        <div>
                            <div className="flex items-center gap-1 md:gap-1.5 text-muted-foreground mb-1 md:mb-2">
                                <stat.icon className={`h-3 w-3 md:h-4 md:w-4 shrink-0 ${stat.color}`} />
                                {/* 
                        Changed: 
                        1. Removed 'truncate'
                        2. Added 'whitespace-nowrap' 
                        3. Adjusted tracking-tight for mobile 
                    */}
                                <span className="text-[7px] min-[380px]:text-[8px] md:text-[10px] font-black uppercase tracking-tight md:tracking-widest leading-none whitespace-nowrap">
                                    {stat.label}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-0.5 md:gap-1.5">
                                <span className="text-base min-[380px]:text-lg md:text-3xl font-black tracking-tighter">
                                    {stat.value}
                                </span>
                                <span className="text-[8px] md:text-xs font-bold text-muted-foreground/50 uppercase">
                                    /{stat.limit}
                                </span>
                            </div>
                        </div>

                        {stat.badge && (
                            <div className="mt-1.5 flex items-center gap-1">
                                <RefreshCw className="h-2 w-2 text-purple-400 animate-spin-slow shrink-0" />
                                <span className="text-[6px] md:text-[9px] font-bold text-purple-400 uppercase tracking-tight md:tracking-widest whitespace-nowrap">
                                    {stat.badge}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="grid gap-12 lg:grid-cols-12">

                {/* Left Area */}
                <div className="lg:col-span-7 space-y-12">
                    <section>
                        <div className="mb-6 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
                                <Settings2 className="h-4 w-4 text-primary" />
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Identity & Settings</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Workspace Display Name</label>
                                    {!isOwner && (
                                        <span className="flex items-center gap-1 text-[9px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded border border-destructive/20 uppercase">
                                            <AlertCircle className="h-2.5 w-2.5" />
                                            Only owner can edit
                                        </span>
                                    )}
                                </div>

                                <div className="relative flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3">
                                    <div className="relative flex-1 group">
                                        <input
                                            value={orgName}
                                            onChange={(e) => setOrgName(e.target.value)}
                                            disabled={!isOwner}
                                            className={`
                h-11 w-full rounded-xl border bg-background px-4 text-sm font-semibold transition-all outline-none border-border/60 placeholder:text-muted-foreground/50
                ${isOwner ? 'focus:ring-2 focus:ring-primary/20' : ''}
                ${isOwner && orgName !== organization.name ? 'pr-24 sm:pr-4' : ''} 
                disabled:bg-muted/30
            `}
                                            placeholder="Organization name"
                                        />

                                        {/* Mobile View: Inline button that only appears when name is changed (dirty) */}
                                        {isOwner && orgName !== organization.name && (
                                            <button
                                                onClick={handleUpdate}
                                                disabled={isUpdating}
                                                className="absolute right-1 top-1 bottom-1 px-3 sm:hidden flex items-center justify-center rounded-lg bg-primary text-[10px] font-black uppercase tracking-tighter text-primary-foreground transition-all animate-in fade-in zoom-in duration-200 active:scale-95 shadow-sm"
                                            >
                                                {isUpdating ? (
                                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                                ) : (
                                                    'Update'
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {/* Desktop View: Separate Button that only appears when name is changed (dirty) */}
                                    {isOwner && orgName !== organization.name && (
                                        <button
                                            onClick={handleUpdate}
                                            disabled={isUpdating}
                                            className="hidden sm:inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-xs font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 transition-all animate-in fade-in slide-in-from-right-2 duration-200 hover:scale-[1.02] active:scale-95"
                                        >
                                            {isUpdating ? (
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                            ) : (
                                                <>
                                                    Update
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {/* Description moved below editable name */}
                                <div className="mt-4 rounded-xl bg-muted/20 p-4 border border-dashed border-border/60">
                                    <p className="text-[11px] md:text-xs font-medium text-muted-foreground leading-relaxed">
                                        This is a premium workspace dedicated to enterprise-level management and AI-driven operations.
                                        {isOwner
                                            ? " As the owner, you can manage team access and update branding here."
                                            : " Please contact your administrator for any identity or branding changes."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="mb-6 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
                                <BsPlug className="h-4 w-4 text-primary" />
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Integrations</h2>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {[
                                {
                                    name: 'Google Calendar',
                                    key: 'googleCalendar',
                                    connected: organization.integrations?.googleCalendar?.isConnected
                                },
                                {
                                    name: 'WhatsApp Business',
                                    key: 'whatsapp',
                                    connected: organization.integrations?.whatsapp?.isEnabled
                                }
                            ].map((item) => (
                                <div
                                    key={item.key}
                                    className="flex items-center justify-between rounded-2xl border border-border/40 bg-card p-4 hover:bg-muted/30 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3">

                                        {/* ICON STATE */}
                                        {item.connected ? (
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-500/30" />
                                        ) : (
                                            <Circle className="h-4 w-4 text-muted-foreground/30" />
                                        )}

                                        <span className="text-xs font-bold tracking-tight">
                                            {item.name}
                                        </span>
                                    </div>

                                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:translate-x-1 transition-transform" />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Area */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="rounded-3xl border border-border/40 bg-card/40 p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between border-b border-border/40 pb-4">
                            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Subscription</h3>
                            {/* <Zap className="h-3.5 w-3.5 text-muted-foreground/40" /> */}
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-muted-foreground uppercase tracking-widest">Plan</span>
                                <span className="font-black capitalize text-primary">{organization.subscription?.plan}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-muted-foreground uppercase tracking-widest">Renewal</span>
                                <span className="font-bold">{organization.subscription?.endDate ? new Date(organization.subscription.endDate).toLocaleDateString() : 'Unlimited'}</span>
                            </div>
                            <button className="w-full rounded-xl bg-foreground py-3 text-[10px] font-black uppercase tracking-[0.2em] text-background hover:opacity-90 transition-all active:scale-[0.98]"
                                onClick={() => toast('Subscription management coming soon!')}
                            >
                                Manage Subscription
                            </button>
                        </div>
                    </div>

                    <div className="rounded-3xl border bg-card/50 p-6 shadow-sm ring-1 ring-border/50">
                        <div className="mb-6 flex items-baseline justify-between px-1">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Memeber slots</h3>
                            <div className="text-[10px] font-black text-primary uppercase">
                                {Math.round(((organization.members?.length || 0) / (organization.meta?.limits?.maxMembers || 1)) * 100)}% Used
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black tracking-tighter">{organization.members?.length || 0}</span>
                                <span className="text-xs font-bold text-muted-foreground/50">/ {organization.meta?.limits?.maxMembers || 0} Slots</span>
                            </div>

                            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="absolute inset-y-0 left-0 bg-primary transition-all duration-500"
                                    style={{ width: `${Math.min(((organization.members?.length || 0) / (organization.meta?.limits?.maxMembers || 1)) * 100, 100)}%` }}
                                />
                            </div>

                            <p className="text-[9px] font-medium text-muted-foreground italic leading-none">
                                {remainingSlots <= 0 ? "Slots Full, Remove Members or Upgrade Plan" : `${remainingSlots} slots remaining`}
                            </p>

                            <button
                                onClick={() => window.location.hash = 'members'}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl border bg-background py-2.5 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-muted"
                            >
                                View All Members
                                <ChevronRight className="h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}