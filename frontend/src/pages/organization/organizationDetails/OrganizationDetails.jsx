import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { Cpu, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useOrganizationStore, useUserStore, useMemberStore } from '@/stores';
import { Separator } from '@/components/ui/separator';
import {
    InviteMemberModal,
    SyncSlugModal,
    OrganizationHero,
    OrganizationStats,
    OrganizationSettings,
    OrganizationIntegrations,
    OrganizationTeam,
    OrganizationSubscription,
} from './components';

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

export default function OrganizationDetails() {
    const { orgId } = useParams();
    const navigate = useNavigate();

    // Selective store subscriptions with useShallow
    const {
        getOrganization,
        updateOrganization,
        syncOrganizationSlug,
        ownedOrganization,
        isLoading,
        isUpdating
    } = useOrganizationStore(
        useShallow((state) => ({
            getOrganization: state.getOrganization,
            updateOrganization: state.updateOrganization,
            syncOrganizationSlug: state.syncOrganizationSlug,
            ownedOrganization: state.ownedOrganization,
            isLoading: state.isLoading,
            isUpdating: state.isUpdating
        }))
    );

    // Fetch members for avatar stack
    const { members: storeMembers = [], fetchMembers } = useMemberStore(
        useShallow((state) => ({
            members: state.members,
            fetchMembers: state.fetchMembers,
        }))
    );

    const currentUserId = useUserStore((state) => state.userProfile?._id);

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
    const copyTimeoutRef = useRef(null);

    const DESCRIPTION_LIMIT = 500;

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        const fetchOrg = async () => {
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
        fetchOrg();
    }, [orgId, currentUserId, getOrganization, navigate]);

    useEffect(() => {
        if (orgId) {
            fetchMembers(orgId);
        }
    }, [orgId, fetchMembers]);

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

    const handleUpdate = useCallback(async () => {
        if (!orgName.trim() || isUpdating) return;
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
    }, [orgId, orgName, orgDescription, isUpdating, updateOrganization]);

    const handleCancelEdit = useCallback(() => {
        setIsEditing(false);
        setOrgName(organization?.name || '');
        setOrgDescription(organization?.description || '');
    }, [organization?.name, organization?.description]);

    const handleEditKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            handleCancelEdit();
        } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleUpdate();
        }
    }, [handleCancelEdit, handleUpdate]);

    const handleConfirmSyncSlug = useCallback(async () => {
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
    }, [orgId, syncOrganizationSlug]);

    const handleInviteMember = useCallback((email) => {
        toast.success(`Invitation sent to ${email}`);
    }, []);

    const handleCopySlug = useCallback(() => {
        if (!organization?.slug) return;
        const bookingUrl = `${window.location.origin}/book/${organization.slug}`;
        navigator.clipboard.writeText(bookingUrl);
        setCopiedSlug(true);
        toast.success('Booking link copied to clipboard');
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = setTimeout(() => setCopiedSlug(false), 2000);
    }, [organization?.slug]);

    const openEditMode = useCallback((target = 'name') => {
        setFocusTarget(target);
        setIsEditing(true);
    }, []);

    const handleCloseSyncModal = useCallback(() => {
        if (!isSyncingSlug) setShowSyncModal(false);
    }, [isSyncingSlug]);

    const handleCloseInviteModal = useCallback(() => {
        setIsInviteModalOpen(false);
    }, []);

    // Memoize metric numbers to prevent layout thrash
    const memberCount = useMemo(() => {
        return (organization?.members?.length ?? organization?.usage?.memberCount ?? 0) + 1;
    }, [organization?.members?.length, organization?.usage?.memberCount]);

    const maxMembers = useMemo(() => {
        return organization?.meta?.limits?.maxMembers || 0;
    }, [organization?.meta?.limits?.maxMembers]);

    const remainingSlots = useMemo(() => {
        return Math.max(maxMembers - memberCount, 0);
    }, [maxMembers, memberCount]);

    // Resolved members list for avatar stack
    const membersList = useMemo(() => {
        if (Array.isArray(storeMembers) && storeMembers.length > 0) return storeMembers;
        if (Array.isArray(organization?.members) && organization.members.length > 0) return organization.members;
        if (organization?.owner) {
            return [{
                name: typeof organization.owner === 'object' ? (organization.owner.name || organization.owner.email) : 'Owner',
                avatar: typeof organization.owner === 'object' ? organization.owner.avatar : null,
                _id: getEntityId(organization.owner)
            }];
        }
        return [];
    }, [storeMembers, organization?.members, organization?.owner]);

    const maxVisibleAvatars = 4;
    const visibleMembers = useMemo(() => membersList.slice(0, maxVisibleAvatars), [membersList]);
    const overflowMembersCount = membersList.length > maxVisibleAvatars ? membersList.length - (maxVisibleAvatars - 1) : 0;

    // Memoize statistics list so StatItem props remain referentially stable
    const stats = useMemo(() => {
        return [
            {
                label: 'AI Credits Used',
                value: organization?.usage?.aiCreditsUsed,
                limit: organization?.meta?.limits?.aiCredits,
                icon: Cpu,
                badge: 'Resets daily'
            },
            {
                label: 'Customers Tracked',
                value: organization?.usage?.customerCount,
                limit: organization?.meta?.limits?.maxCustomers,
                icon: UserPlus,
                badge: `${((organization?.usage?.customerCount || 0) / (organization?.meta?.limits?.maxCustomers || 1) * 100).toFixed(0)}% of limit`
            },
            {
                label: 'Team Capacity',
                value: memberCount,
                limit: maxMembers,
                icon: Users,
                badge: `${remainingSlots} seat${remainingSlots === 1 ? '' : 's'} available`
            }
        ];
    }, [organization?.usage?.aiCreditsUsed, organization?.usage?.customerCount, organization?.meta?.limits?.aiCredits, organization?.meta?.limits?.maxCustomers, memberCount, maxMembers, remainingSlots]);

    // Memoize locale date strings
    const formattedCreatedAt = useMemo(() => {
        return organization?.createdAt
            ? new Date(organization.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
            : 'N/A';
    }, [organization?.createdAt]);

    const formattedRenewalDate = useMemo(() => {
        return organization?.subscription?.endDate
            ? new Date(organization.subscription.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
            : 'No expiration';
    }, [organization?.subscription?.endDate]);

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

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl space-y-8 sm:space-y-10">

                {/* Navigation Header, Hero & Stale Slug Alert */}
                <OrganizationHero
                    organization={organization}
                    isOwner={isOwner}
                    formattedCreatedAt={formattedCreatedAt}
                    copiedSlug={copiedSlug}
                    onCopySlug={handleCopySlug}
                    onOpenSyncModal={() => setShowSyncModal(true)}
                    isSyncingSlug={isSyncingSlug}
                    isUpdating={isUpdating}
                    onBack={() => navigate('/organizations')}
                />

                {/* Flat Metrology Summary Strip */}
                <OrganizationStats stats={stats} />

                {/* Flat 2-Column Content Layout with Vertical Separator */}
                <div className="flex flex-col lg:flex-row items-stretch gap-8 lg:gap-10">

                    {/* Left Column: Organization Details & Integrations */}
                    <div className="flex-1 min-w-0 space-y-10 sm:space-y-12">
                        <OrganizationSettings
                            organization={organization}
                            isOwner={isOwner}
                            isEditing={isEditing}
                            orgName={orgName}
                            setOrgName={setOrgName}
                            orgDescription={orgDescription}
                            setOrgDescription={setOrgDescription}
                            nameInputRef={nameInputRef}
                            descriptionInputRef={descriptionInputRef}
                            descriptionLimit={DESCRIPTION_LIMIT}
                            isUpdating={isUpdating}
                            onOpenEditMode={openEditMode}
                            onCancelEdit={handleCancelEdit}
                            onSave={handleUpdate}
                            onEditKeyDown={handleEditKeyDown}
                        />

                        <Separator className="bg-border-subtle" />

                        <OrganizationIntegrations
                            integrations={organization.integrations}
                        />
                    </div>

                    {/* Vertical shadcn Separator for Desktop */}
                    <Separator orientation="vertical" className="hidden lg:block h-auto self-stretch bg-border-subtle" />
                    {/* Horizontal Separator for Mobile/Tablet */}
                    <Separator className="lg:hidden bg-border-subtle" />

                    {/* Right Column: Team & Subscription */}
                    <div className="w-full lg:w-80 xl:w-88 shrink-0 space-y-10 sm:space-y-12">
                        <OrganizationTeam
                            memberCount={memberCount}
                            maxMembers={maxMembers}
                            remainingSlots={remainingSlots}
                            membersList={membersList}
                            visibleMembers={visibleMembers}
                            overflowMembersCount={overflowMembersCount}
                            maxVisibleAvatars={maxVisibleAvatars}
                            onNavigateToMembers={() => navigate(`/organizations/${orgId}/members`)}
                            onOpenInviteModal={() => setIsInviteModalOpen(true)}
                        />

                        <Separator className="bg-border-subtle" />

                        <OrganizationSubscription
                            subscription={organization.subscription}
                            formattedRenewalDate={formattedRenewalDate}
                            onManageSubscription={() => toast.info('Billing & Pro subscription plans opening soon!')}
                        />
                    </div>
                </div>
            </div>

            {/* Sync Organization URL Slug Confirmation Modal */}
            <SyncSlugModal
                isOpen={showSyncModal}
                isSyncing={isSyncingSlug}
                onConfirm={handleConfirmSyncSlug}
                onClose={handleCloseSyncModal}
            />

            {/* Invite Member Modal */}
            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={handleCloseInviteModal}
                onInvite={handleInviteMember}
            />
        </div>
    );
}
