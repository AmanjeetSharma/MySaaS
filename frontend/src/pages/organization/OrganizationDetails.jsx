import { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    Building2, ArrowLeft,
    Users, Cpu, UserPlus,
    Settings2, ChevronRight, LayoutGrid,
    CreditCard, ExternalLink, X, Send,
    AlertTriangle, RefreshCw, CheckCircle2, AlertCircle,
    FileText, Edit3, Copy, Check,
    Crown
} from 'lucide-react';
import { toast } from 'sonner';
import { useOrganizationStore, useUserStore } from '@/stores';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { INTEGRATION_LIST } from '@/constants/integrations.constant';

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

const SectionHeader = ({ icon: Icon, title, description, action }) => (
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
);

// Flat Stat Metrology Item
const StatItem = ({ label, value, limit, icon: Icon, badge, unit = '' }) => {
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
                        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
                            {value?.toLocaleString() ?? 0}
                        </span>
                        {limit !== undefined && (
                            <span className="text-xs text-muted-foreground font-normal">
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
};

// Flat Integration Row
const IntegrationRow = ({ name, description, icon: Icon, connected, path }) => (
    <Link
        to={path}
        className="flex items-center justify-between py-3.5 px-2 hover:bg-hover/50 -mx-2 rounded-lg transition-colors group cursor-pointer"
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
);

const DetailRow = ({ label, value, valueClassName }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-border-subtle/50 last:border-0">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn("text-xs font-medium text-foreground", valueClassName)}>
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
        if (!email.trim()) {
            toast.error('Please enter an email address');
            return;
        }

        setIsSending(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        onInvite(email.trim());
        setEmail('');
        setIsSending(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-xs animate-in fade-in-0 duration-150">
            <div className="bg-surface-elevated border border-border-strong rounded-xl w-full max-w-md shadow-2xl text-surface-elevated-foreground animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border-subtle">
                    <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-primary" />
                        <h3 className="font-heading text-base font-semibold text-foreground">Invite Team Member</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-1 rounded-md hover:bg-hover"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-4 sm:p-5 space-y-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="colleague@company.com"
                                className="w-full h-9 px-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground/60 text-sm"
                                autoFocus
                                required
                            />
                            <p className="mt-1.5 text-xs text-muted-foreground">
                                They will receive an invitation to join this organization workspace.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2.5 p-4 sm:p-5 border-t border-border-subtle bg-surface/40">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-8 px-3 border border-border rounded-lg text-xs font-medium hover:bg-hover hover:text-hover-foreground transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSending}
                            className="flex-1 h-8 px-3 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                            {isSending ? (
                                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                            ) : (
                                <>
                                    <Send className="h-3.5 w-3.5" />
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
    const [focusTarget, setFocusTarget] = useState('name');
    const [isSyncingSlug, setIsSyncingSlug] = useState(false);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [copiedSlug, setCopiedSlug] = useState(false);

    const nameInputRef = useRef(null);
    const descriptionInputRef = useRef(null);

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

    // Handle cursor focus when switching into edit mode
    useEffect(() => {
        if (isEditing) {
            if (focusTarget === 'description' && descriptionInputRef.current) {
                descriptionInputRef.current.focus();
            } else if (nameInputRef.current) {
                nameInputRef.current.focus();
            }
        }
    }, [isEditing, focusTarget]);

    const isOwner = useMemo(() => {
        return (
            hasSameId(ownedOrganization, orgId) ||
            hasSameId(organization?.owner, currentUserId)
        );
    }, [organization?.owner, orgId, ownedOrganization, currentUserId]);

    const handleUpdate = async () => {
        try {
            const updatedOrganization = await updateOrganization(orgId, {
                orgName: orgName.trim(),
                description: orgDescription.trim()
            });
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

    const handleConfirmSyncSlug = async () => {
        try {
            setIsSyncingSlug(true);
            const data = await syncOrganizationSlug(orgId);
            setOrganization((prev) => ({
                ...prev,
                slug: data.slug,
                isSlugStale: false
            }));
            toast.success('Organization URL synchronized successfully');
            setShowSyncModal(false);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to synchronize organization URL');
        } finally {
            setIsSyncingSlug(false);
        }
    };

    const handleInviteMember = (email) => {
        toast.success(`Invitation sent to ${email}`);
    };

    const handleCopySlug = () => {
        if (!organization?.slug) return;
        const bookingUrl = `${window.location.origin}/book/${organization.slug}`;
        navigator.clipboard.writeText(bookingUrl);
        setCopiedSlug(true);
        toast.success('Booking link copied to clipboard');
        setTimeout(() => setCopiedSlug(false), 2000);
    };

    const openEditMode = (target = 'name') => {
        setFocusTarget(target);
        setIsEditing(true);
    };

    if (isLoading || !organization) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground animate-pulse">
                        Synchronizing Workspace...
                    </p>
                </div>
            </div>
        );
    }

    const memberCount = (organization.members?.length ?? organization.usage?.memberCount ?? 0) + 1;
    const maxMembers = organization.meta?.limits?.maxMembers || 0;
    const remainingSlots = Math.max(maxMembers - memberCount, 0);

    const stats = [
        {
            label: 'AI Credits Used',
            value: organization.usage?.aiCreditsUsed,
            limit: organization.meta?.limits?.aiCredits,
            icon: Cpu,
            badge: 'Resets daily'
        },
        {
            label: 'Customers Tracked',
            value: organization.usage?.customerCount,
            limit: organization.meta?.limits?.maxCustomers,
            icon: UserPlus,
            badge: `${((organization.usage?.customerCount || 0) / (organization.meta?.limits?.maxCustomers || 1) * 100).toFixed(0)}% of limit`
        },
        {
            label: 'Team Capacity',
            value: memberCount,
            limit: maxMembers,
            icon: Users,
            badge: `${remainingSlots} seat${remainingSlots === 1 ? '' : 's'} available`
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl space-y-8 sm:space-y-10">

                {/* Navigation Header */}
                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/organizations')}
                        className="group inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                        <span>Back to organizations</span>
                    </button>

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
                                    <span>Created {new Date(organization.createdAt).toLocaleDateString()}</span>
                                    <span className="text-border-subtle">•</span>
                                    <button
                                        onClick={handleCopySlug}
                                        title="Click to copy public booking link"
                                        className="inline-flex items-center gap-1.5 font-mono text-foreground/80 hover:text-foreground hover:underline transition-colors cursor-pointer group"
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
                            onClick={() => setShowSyncModal(true)}
                            disabled={isSyncingSlug || isUpdating}
                            className="self-end sm:self-auto h-7 px-3 bg-warning hover:opacity-90 text-background rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                        >
                            <RefreshCw className="h-3 w-3" />
                            <span>Sync URL Slug</span>
                        </button>
                    </div>
                )}

                {/* Flat Metrology Summary Strip (border-y divider based) */}
                <div className="border-y border-border-subtle grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border-subtle -mx-4 sm:mx-0">
                    {stats.map((stat) => (
                        <StatItem key={stat.label} {...stat} />
                    ))}
                </div>

                {/* Flat 2-Column Content Layout with Vertical shadcn Separator */}
                <div className="flex flex-col lg:flex-row items-stretch gap-8 lg:gap-10">

                    {/* Left Column: Organization Details & Integrations */}
                    <div className="flex-1 min-w-0 space-y-10 sm:space-y-12">

                        {/* Flat Organization Settings Section */}
                        <section className="space-y-5">
                            <SectionHeader
                                icon={Settings2}
                                title="Organization Settings"
                                description="Manage your organization's basic information and public profile"
                                action={
                                    isOwner && !isEditing && (
                                        <button
                                            onClick={() => openEditMode('name')}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                                        >
                                            <Edit3 className="h-3.5 w-3.5" />
                                            <span>Edit Details</span>
                                        </button>
                                    )
                                }
                            />

                            {isEditing ? (
                                <div className="space-y-4 pt-1">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                            Organization Name
                                        </label>
                                        <input
                                            ref={nameInputRef}
                                            type="text"
                                            value={orgName}
                                            onChange={(e) => setOrgName(e.target.value)}
                                            className="w-full h-9 px-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground/60 text-sm"
                                            placeholder="Organization name"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                Description
                                            </label>
                                            <span className={cn(
                                                "text-[11px] font-mono",
                                                orgDescription.length > DESCRIPTION_LIMIT ? "text-destructive font-medium" : "text-muted-foreground"
                                            )}>
                                                {orgDescription.length}/{DESCRIPTION_LIMIT}
                                            </span>
                                        </div>
                                        <textarea
                                            ref={descriptionInputRef}
                                            rows={4}
                                            maxLength={DESCRIPTION_LIMIT}
                                            value={orgDescription}
                                            onChange={(e) => setOrgDescription(e.target.value)}
                                            className="w-full p-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground/60 text-sm resize-y"
                                            placeholder="Briefly describe your organization's mission or service..."
                                        />
                                    </div>

                                    <div className="flex items-center justify-end gap-2.5 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setOrgName(organization.name);
                                                setOrgDescription(organization.description || '');
                                            }}
                                            className="h-8 px-3 border border-border rounded-lg text-xs font-medium hover:bg-hover hover:text-hover-foreground transition-colors cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleUpdate}
                                            disabled={isUpdating || !orgName.trim() || orgDescription.length > DESCRIPTION_LIMIT}
                                            className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:opacity-90 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                                        >
                                            {isUpdating ? 'Saving...' : 'Save changes'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 pt-1">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-border-subtle/50">
                                        <div className="space-y-1">
                                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                Organization Name
                                            </span>
                                            <p className="text-sm font-semibold text-foreground">
                                                {organization.name}
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                Public URL: Path
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono bg-surface px-2.5 py-0.5 rounded text-foreground border border-border-subtle">
                                                    /{organization.slug}
                                                </span>
                                                {organization.isSlugStale ? (
                                                    <span className="text-[10px] font-bold text-warning bg-warning/10 px-2 py-0.5 rounded-full border border-warning/20 uppercase tracking-wide">
                                                        Sync needed
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-success inline-flex items-center gap-1 font-medium">
                                                        <CheckCircle2 className="h-3 w-3" /> Synced
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                                <FileText className="h-3.5 w-3.5" /> Description
                                            </span>
                                            {organization?.description && (
                                                <span className="text-[10px] font-mono text-muted-foreground/70">
                                                    {organization.description.length}/500 chars
                                                </span>
                                            )}
                                        </div>

                                        {organization?.description ? (
                                            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                                                {organization.description}
                                            </p>
                                        ) : (
                                            <div className="py-2">
                                                <p className="text-xs text-muted-foreground italic">
                                                    No description provided yet.
                                                </p>
                                                {isOwner && (
                                                    <button
                                                        onClick={() => openEditMode('description')}
                                                        className="mt-1 text-xs font-medium text-primary hover:underline cursor-pointer inline-flex items-center gap-1"
                                                    >
                                                        + Add description
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {!isOwner && (
                                        <div className="pt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                            Contact your organization owner to edit these details.
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        <Separator className="bg-border-subtle" />

                        {/* Flat Integrations Section */}
                        <section className="space-y-4">
                            <SectionHeader
                                icon={LayoutGrid}
                                title="Integrations"
                                description="Connect external services to your organization"
                            />

                            <div className="divide-y divide-border-subtle/60 border-y border-border-subtle/60">
                                {INTEGRATION_LIST.map((item) => {
                                    const isConnected = organization.integrations?.[item.integrationKey]?.isConnected;
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
                    </div>

                    {/* Vertical shadcn Separator for Desktop */}
                    <Separator orientation="vertical" className="hidden lg:block h-auto self-stretch bg-border-subtle" />
                    {/* Horizontal Separator for Mobile/Tablet */}
                    <Separator className="lg:hidden bg-border-subtle" />

                    {/* Right Column: Team & Subscription */}
                    <div className="w-full lg:w-80 xl:w-88 shrink-0 space-y-10 sm:space-y-12">

                        {/* Flat Team Members Section */}
                        <section className="space-y-4">
                            <SectionHeader
                                icon={Users}
                                title="Team Members"
                                description={`${memberCount} of ${maxMembers} members`}
                            />

                            <div className="space-y-3 pt-1">
                                <button
                                    onClick={() => navigate(`/organizations/${orgId}/members`)}
                                    className="w-full flex items-center justify-between p-3 rounded-lg border border-border-subtle hover:bg-hover hover:border-border transition-all group cursor-pointer"
                                >
                                    <div className="text-left">
                                        <span className="text-xs font-semibold text-foreground group-hover:text-hover-foreground block">
                                            View all members
                                        </span>
                                        <span className="text-[11px] text-muted-foreground">
                                            Member permissions & invitations
                                        </span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
                                </button>

                                {remainingSlots > 0 ? (
                                    <button
                                        onClick={() => setIsInviteModalOpen(true)}
                                        className="w-full h-8 px-3 text-xs font-semibold text-primary hover:bg-primary/10 border border-dashed border-primary/50 hover:border-primary rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                        <UserPlus className="h-3.5 w-3.5" />
                                        <span>Invite Team Member</span>
                                    </button>
                                ) : (
                                    <div className="p-2.5 bg-surface rounded-lg border border-border-subtle text-center">
                                        <p className="text-[11px] text-muted-foreground">
                                            Member limit reached. Upgrade to add more members.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <Separator className="bg-border-subtle" />

                        {/* Flat Subscription Section */}
                        <section className="space-y-4">
                            <SectionHeader
                                icon={CreditCard}
                                title="Subscription"
                                description="Your current plan and billing"
                            />

                            <div className="space-y-1 pt-1">
                                <DetailRow
                                    label="Current Plan"
                                    value={organization.subscription?.plan?.toUpperCase() || 'FREE'}
                                    valueClassName="uppercase font-bold tracking-wider text-primary text-xs"
                                />
                                <DetailRow
                                    label="Renewal Date"
                                    value={organization.subscription?.endDate
                                        ? new Date(organization.subscription.endDate).toLocaleDateString()
                                        : 'No expiration'}
                                />
                                <DetailRow
                                    label="Billing Status"
                                    value={organization.subscription?.status || 'Active'}
                                    valueClassName="capitalize text-xs font-medium text-success"
                                />

                                <div className="pt-3">
                                    <button
                                        onClick={() => toast.info('Billing & Pro subscription plans opening soon!')}
                                        className="w-full h-8 px-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5 text-primary" />
                                        <span>Manage subscription</span>
                                    </button>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>
            </div>

            {/* Sync Organization URL Slug Confirmation Modal */}
            {showSyncModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4 backdrop-blur-xs animate-in fade-in-0 duration-150">
                    <div className="w-full max-w-md space-y-4 rounded-xl border border-border-strong bg-surface-elevated p-5 sm:p-6 shadow-2xl text-surface-elevated-foreground animate-in zoom-in-95 duration-150">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning border border-warning/20">
                                <AlertTriangle className="h-5 w-5" />
                            </div>

                            <div className="space-y-1">
                                <h3 className="font-heading text-base font-bold text-foreground">
                                    Sync Organization URL?
                                </h3>
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    Create a new booking link that matches the current organization name.
                                </p>
                                <p className="text-xs font-semibold leading-relaxed text-warning pt-1">
                                    Warning: All existing links using this organization prefix will be disabled immediately.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 pt-2">
                            <button
                                type="button"
                                disabled={isSyncingSlug}
                                onClick={() => setShowSyncModal(false)}
                                className="h-8 w-full rounded-lg border border-border bg-surface text-xs font-medium text-foreground hover:bg-hover transition-colors cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={isSyncingSlug}
                                onClick={handleConfirmSyncSlug}
                                className="h-8 w-full cursor-pointer flex items-center justify-center gap-1.5 rounded-lg bg-warning px-3 text-xs font-bold text-background shadow-xs hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {isSyncingSlug ? (
                                    <>
                                        <RefreshCw className="h-3 w-3 animate-spin" />
                                        <span>Syncing...</span>
                                    </>
                                ) : (
                                    'Confirm Sync'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInvite={handleInviteMember}
            />
        </div>
    );
}
