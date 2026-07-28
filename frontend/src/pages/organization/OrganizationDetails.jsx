import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    Building2, ArrowLeft, ShieldCheck,
    Users, Cpu, UserPlus,
    Settings2, ChevronRight, LayoutGrid,
    CreditCard, ExternalLink, X, Send,
    AlertTriangle, RefreshCw, CheckCircle2, AlertCircle,
    FileText, Edit3
} from 'lucide-react';
import { toast } from 'sonner';
import { useOrganizationStore, useUserStore } from '@/stores';
import { cn } from '@/lib/utils';

const getEntityId = (entity) => {
    if (!entity) return null;
    if (typeof entity === 'string') return entity;
    return entity._id || entity.id || null;
};

const hasSameId = (left, right) => {
    const leftId = getEntityId(left);
    const rightId = getEntityId(right);
    return !!leftId && !!rightId && leftId.toString() === rightId.toString();
};

// Tooltip Component
const Tooltip = ({ content, children }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className="relative inline-flex items-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 w-72 p-3 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border border-border animate-in fade-in-0 zoom-in-95 pointer-events-none">
                    {content}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-popover" />
                </div>
            )}
        </div>
    );
};

// Reusable UI Components
const Card = ({ children, className = '', padding = 'md' }) => {
    const paddingClasses = {
        sm: 'p-3 md:p-4',
        md: 'p-4 md:p-6',
        lg: 'p-6 md:p-8'
    };
    return (
        <div className={cn(
            "bg-card border border-border rounded-lg shadow-sm",
            paddingClasses[padding],
            className
        )}>
            {children}
        </div>
    );
};

const StatCard = ({ label, value, limit, icon: Icon, badge, action }) => {
    const percentage = ((value || 0) / (limit || 1)) * 100;

    return (
        <Card padding="sm" className="hover:border-border/80 transition-colors">
            <div className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground">
                        <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        <span className="text-[10px] md:text-xs font-medium uppercase tracking-wide">
                            {label}
                        </span>
                    </div>
                    {badge && (
                        <span className="text-[10px] md:text-xs text-muted-foreground">{badge}</span>
                    )}
                </div>
                <div>
                    <div className="flex items-baseline justify-between mb-1.5 md:mb-2">
                        <div className="flex items-baseline gap-1 md:gap-1.5">
                            <span className="text-xl md:text-2xl font-semibold text-foreground">
                                {value?.toLocaleString() ?? 0}
                            </span>
                            <span className="text-xs md:text-sm text-muted-foreground">/ {limit?.toLocaleString()}</span>
                        </div>
                        {action}
                    </div>
                    <div className="h-1 md:h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
};

const SectionHeader = ({ icon: Icon, title, description, action }) => (
    <div className="flex items-start justify-between">
        <div className="space-y-1">
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">
                    {title}
                </h2>
            </div>
            {description && (
                <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
            )}
        </div>
        {action}
    </div>
);

const IntegrationRow = ({ name, connected, path }) => (
    <Link
        to={path}
        className="flex items-center justify-between p-3 md:p-4 border border-border rounded-lg hover:bg-accent/5 hover:border-border/80 transition-all group cursor-pointer"
    >
        <div className="flex items-center gap-2 md:gap-3">
            <div className={cn(
                "w-2 h-2 rounded-full",
                connected ? "bg-emerald-500" : "bg-muted-foreground/30"
            )} />
            <div>
                <p className="text-sm font-medium text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground">
                    {connected ? 'Connected' : 'Not configured'}
                </p>
            </div>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
    </Link>
);

const DetailRow = ({ label, value, valueClassName }) => (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={cn("text-sm font-medium text-foreground", valueClassName)}>
            {value}
        </span>
    </div>
);

// Invite Member Modal
const InviteMemberModal = ({ isOpen, onClose, onInvite }) => {
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter an email address');
            return;
        }

        setIsSending(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        onInvite(email);
        setEmail('');
        setIsSending(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-lg w-full max-w-md shadow-lg">
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground">Invite Team Member</h3>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-4 md:p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="colleague@company.com"
                                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm"
                                autoFocus
                                required
                            />
                            <p className="mt-2 text-xs text-muted-foreground">
                                They'll receive an email with instructions to join your organization.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 p-4 md:p-6 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-accent transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSending}
                            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isSending ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Send Invite
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function OrganizationDetails() {
    const { orgId } = useParams();
    const navigate = useNavigate();
    const {
        getOrganization,
        updateOrganization,
        syncOrganizationSlug,
        ownedOrganization,
        isLoading,
        isUpdating
    } = useOrganizationStore();

    const { userProfile } = useUserStore();
    const currentUserId = userProfile?._id;

    const [organization, setOrganization] = useState(null);
    const [orgName, setOrgName] = useState('');
    const [orgDescription, setOrgDescription] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isSyncingSlug, setIsSyncingSlug] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const DESCRIPTION_LIMIT = 500;

    useEffect(() => {
        const fetchOrganization = async () => {
            try {
                const response = await getOrganization(orgId);
                const data = response?.data || response;
                setOrganization(data);
                setOrgName(data.name || '');
                setOrgDescription(data.description || '');
            } catch {
                toast.error('Failed to load organization');
                navigate('/organizations');
            }
        };
        fetchOrganization();
    }, [orgId, currentUserId, getOrganization, navigate]);

    const isOwner = useMemo(() => {
        return (
            hasSameId(ownedOrganization, orgId) ||
            hasSameId(organization?.owner, currentUserId)
        );
    }, [organization?.owner, orgId, ownedOrganization, currentUserId]);

    const handleUpdate = async () => {
        try {
            const updatedOrganization = await updateOrganization(orgId,
                {
                    orgName: orgName,
                    description: orgDescription
                }
            );
            const unpackedData = updatedOrganization?.data || updatedOrganization;
            setOrganization((currentOrganization) => ({
                ...currentOrganization,
                ...unpackedData
            }));
            toast.success('Organization updated successfully');
            setIsEditing(false);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Update failed');
        }
    };

    const handleSyncSlug = async () => {
        try {
            setIsSyncingSlug(true);
            const data = await syncOrganizationSlug(orgId);
            setOrganization((prev) => ({
                ...prev,
                slug: data.slug,
                isSlugStale: false
            }));
            toast.success('Organization URL slug synchronized successfully');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to synchronize organization URL');
        } finally {
            setIsSyncingSlug(false);
        }
    };

    const handleInviteMember = (email) => {
        toast.success(`Invitation sent to ${email}`);
    };

    if (isLoading || !organization) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background">
                <p className="text-sm font-black uppercase tracking-widest text-muted-foreground/50">
                    Synchronizing Workspace...
                </p>
            </div>
        );
    }

    const memberCount = organization.members?.length || organization.usage?.memberCount || 0;
    const maxMembers = organization.meta?.limits?.maxMembers || 0;

    const stats = [
        {
            label: 'AI Credits Used',
            value: organization.usage?.aiCreditsUsed,
            limit: organization.meta?.limits?.aiCredits,
            icon: Cpu,
            badge: 'Resets daily'
        },
        {
            label: 'Customers',
            value: organization.usage?.customerCount,
            limit: organization.meta?.limits?.maxCustomers,
            icon: UserPlus,
            badge: `${((organization.usage?.customerCount || 0) / (organization.meta?.limits?.maxCustomers || 1) * 100).toFixed(0)}% of limit`
        },
        {
            label: 'Team Members',
            value: memberCount,
            limit: maxMembers,
            icon: Users,
            badge: `${memberCount} / ${maxMembers}`
        }
    ];

    const remainingSlots = maxMembers - memberCount;

    return (
        <>
            <div className="min-h-screen bg-background">
                <div className="mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
                    {/* Navigation Header */}
                    <div className="mb-6">
                        <button
                            onClick={() => navigate('/organizations')}
                            className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 cursor-pointer"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Back to organizations
                        </button>

                        {/* Organization Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="h-12 w-12 sm:h-14 sm:w-14 bg-muted rounded-lg flex items-center justify-center border border-border shrink-0">
                                    <Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground break-all">
                                            {organization.name}
                                        </h1>
                                        <span className="px-2 py-0.5 bg-muted text-[10px] sm:text-xs font-medium text-muted-foreground rounded-md">
                                            {organization.subscription?.plan?.toUpperCase() || 'FREE'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                                        <span>Created {new Date(organization.createdAt).toLocaleDateString()}</span>
                                        {isOwner && (
                                            <span className="flex items-center gap-1">
                                                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                                                Owner
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {isOwner && !isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="self-start sm:self-auto px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-foreground border border-border rounded-md hover:bg-accent hover:border-border/80 transition-colors cursor-pointer flex items-center gap-1.5"
                                >
                                    <Edit3 className="h-3.5 w-3.5" />
                                    Edit details
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stale Slug Alert Banner */}
                    {organization.isSlugStale && (
                        <div className="mb-6 p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold">Public URL Slug Out of Sync</h4>
                                    <p className="text-xs sm:text-sm opacity-90 mt-0.5">
                                        Your organization name was updated, but your public URL slug (<code className="font-mono font-bold">{organization.slug}</code>) is still out of sync.
                                    </p>
                                </div>
                            </div>

                            <div className="self-end sm:self-auto shrink-0">
                                <Tooltip
                                    content={
                                        <div className="flex items-start gap-2 text-amber-200">
                                            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                            <span>
                                                <strong>Warning:</strong> Syncing will update public links. Any old shared service or booking links will become deprecated.
                                            </span>
                                        </div>
                                    }
                                >
                                    <button
                                        onClick={handleSyncSlug}
                                        disabled={isSyncingSlug || isUpdating}
                                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                        {isSyncingSlug ? (
                                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <RefreshCw className="h-3.5 w-3.5" />
                                        )}
                                        Sync URL Slug
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                        {stats.map((stat) => (
                            <StatCard key={stat.label} {...stat} />
                        ))}
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                            <Card>
                                <SectionHeader
                                    icon={Settings2}
                                    title="Organization Settings"
                                    description="Manage your organization's basic information and public profile"
                                />
                                <div className="mt-4 sm:mt-6">
                                    {isEditing ? (
                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-2">
                                                    Organization Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={orgName}
                                                    onChange={(e) => setOrgName(e.target.value)}
                                                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm"
                                                    placeholder="Organization name"
                                                    autoFocus
                                                />
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="block text-sm font-medium text-foreground">
                                                        Description
                                                    </label>
                                                    <span className={cn(
                                                        "text-xs font-mono",
                                                        orgDescription.length > DESCRIPTION_LIMIT ? "text-destructive font-medium" : "text-muted-foreground"
                                                    )}>
                                                        {orgDescription.length}/{DESCRIPTION_LIMIT}
                                                    </span>
                                                </div>
                                                <textarea
                                                    rows={4}
                                                    maxLength={DESCRIPTION_LIMIT}
                                                    value={orgDescription}
                                                    onChange={(e) => setOrgDescription(e.target.value)}
                                                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm resize-y"
                                                    placeholder="Briefly describe your organization's mission or service..."
                                                />
                                            </div>

                                            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                                                <button
                                                    onClick={() => {
                                                        setIsEditing(false);
                                                        setOrgName(organization.name);
                                                        setOrgDescription(organization.description || '');
                                                    }}
                                                    className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-accent transition-colors cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleUpdate}
                                                    disabled={isUpdating || orgDescription.length > DESCRIPTION_LIMIT}
                                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
                                                >
                                                    {isUpdating ? 'Saving...' : 'Save changes'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* Top Key Data Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-border">
                                                <div className="space-y-1">
                                                    <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                                                        Organization Name
                                                    </span>
                                                    <p className="text-sm font-medium text-foreground break-all">
                                                        {organization.name}
                                                    </p>
                                                </div>

                                                <div className="space-y-1">
                                                    <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                                                        Public URL Slug
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-mono bg-muted/60 px-2 py-0.5 rounded text-foreground border border-border">
                                                            /{organization.slug}
                                                        </span>
                                                        {organization.isSlugStale ? (
                                                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-wide">
                                                                Sync needed
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                                                                <CheckCircle2 className="h-3.5 w-3.5" /> Synced
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Redesigned Description Card */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider flex items-center gap-1.5">
                                                        <FileText className="h-3.5 w-3.5" /> Description
                                                    </span>
                                                    {organization?.description && (
                                                        <span className="text-[11px] font-mono text-muted-foreground/70">
                                                            {organization.description.length}/500 chars
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="p-4 bg-muted/30 border border-border/80 rounded-lg">
                                                    {organization?.description ? (
                                                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-line break-words">
                                                            {organization.description}
                                                        </p>
                                                    ) : (
                                                        <div className="py-2 text-center sm:text-left">
                                                            <p className="text-sm text-muted-foreground italic">
                                                                No description provided yet.
                                                            </p>
                                                            {isOwner && (
                                                                <button
                                                                    onClick={() => setIsEditing(true)}
                                                                    className="mt-2 text-xs font-semibold text-primary hover:underline cursor-pointer inline-flex items-center gap-1"
                                                                >
                                                                    + Add description
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {!isOwner && (
                                                <div className="pt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                                                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                                    Contact your organization owner to edit these details.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* Integrations Section */}
                            <Card>
                                <SectionHeader
                                    icon={LayoutGrid}
                                    title="Integrations"
                                    description="Connect external services to your organization"
                                />
                                <div className="mt-4 sm:mt-6 space-y-2">
                                    <IntegrationRow
                                        name="Google Calendar"
                                        connected={organization.integrations?.google?.isConnected}
                                        path="/integrations/google-calendar"
                                    />
                                    <IntegrationRow
                                        name="WhatsApp Business"
                                        connected={organization.integrations?.whatsapp?.isConnected}
                                        path="/integrations/whatsapp"
                                    />
                                    <IntegrationRow
                                        name="Microsoft Teams"
                                        connected={organization.integrations?.microsoft?.isConnected}
                                        path="/integrations/microsoft-teams"
                                    />
                                    <IntegrationRow
                                        name="Zoom"
                                        connected={organization.integrations?.zoom?.isConnected}
                                        path="/integrations/zoom"
                                    />
                                </div>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6 sm:space-y-8">
                            <Card>
                                <SectionHeader
                                    icon={CreditCard}
                                    title="Subscription"
                                    description="Your current plan and billing"
                                />
                                <div className="mt-4 sm:mt-6 space-y-3">
                                    <DetailRow
                                        label="Current Plan"
                                        value={organization.subscription?.plan?.toUpperCase() || 'FREE'}
                                        valueClassName="capitalize"
                                    />
                                    <DetailRow
                                        label="Renewal Date"
                                        value={organization.subscription?.endDate
                                            ? new Date(organization.subscription.endDate).toLocaleDateString()
                                            : 'No expiration'}
                                    />
                                    <button className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer">
                                        Manage subscription
                                    </button>
                                </div>
                            </Card>

                            <Card>
                                <SectionHeader
                                    icon={Users}
                                    title="Team Members"
                                    description={`${memberCount} of ${maxMembers} members`}
                                />
                                <div className="mt-4">
                                    <button
                                        onClick={() => navigate(`/organizations/${orgId}/members`)}
                                        className="w-full flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/5 transition-colors group cursor-pointer"
                                    >
                                        <span className="text-sm font-medium text-foreground">View all members</span>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                    </button>

                                    {remainingSlots > 0 ? (
                                        <button
                                            onClick={() => setIsInviteModalOpen(true)}
                                            className="w-full mt-3 px-4 py-2 text-sm text-primary hover:text-primary/90 transition-colors font-medium border border-dashed border-border rounded-lg hover:border-primary/50 cursor-pointer"
                                        >
                                            + Invite members
                                        </button>
                                    ) : (
                                        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                                            <p className="text-xs text-muted-foreground text-center">
                                                Member limit reached. Upgrade to add more members.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInvite={handleInviteMember}
            />
        </>
    );
}