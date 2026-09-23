import { useEffect, useState } from 'react';
import { Building2, AlertTriangle, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useOrganizationStore, useUserStore } from '@/stores';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

import { OrganizationCard, CreateOrganizationCard } from './OrganizationCard';

export default function Organizations() {
  const {
    ownedOrganization,
    memberOrganizations,
    getOrganizations,
    createOrganization,
    deleteOrganization,
    switchOrganization,
    isLoading,
    isUpdating,
  } = useOrganizationStore();

  const { userProfile, getUserProfile } = useUserStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteOrg, setDeleteOrg] = useState(null);
  const [newOrgName, setNewOrgName] = useState('');

  // Track specifically which organization is being switched to
  const [switchingOrgId, setSwitchingOrgId] = useState(null);

  useEffect(() => {
    getOrganizations();
    getUserProfile();
  }, []);

  const activeOrganizationId = userProfile?.activeOrganization;
  const hasNoActiveOrganization = Boolean(userProfile) && !activeOrganizationId;

  const handleSwitch = async (orgId) => {
    // Prevent switching if a request is inflight or the org is already active
    if (switchingOrgId || orgId === activeOrganizationId) return;

    setSwitchingOrgId(orgId);

    try {
      useUserStore.setState((state) => ({
        userProfile: {
          ...state.userProfile,
          activeOrganization: orgId,
        },
      }));

      await switchOrganization(orgId);
      toast.success('Organization switched', {
        icon: <Building2 className="h-5 w-5 text-primary" />,
        position: 'top-center',
      });
    } catch (error) {
      toast.error('Failed to switch organization');
      await getUserProfile();
    } finally {
      setSwitchingOrgId(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newOrgName.trim()) return toast.error('Workspace name is required');
    try {
      await createOrganization(newOrgName);
      await getUserProfile();
      setShowCreateModal(false);
      setNewOrgName('');
      toast.success('Organization created successfully!');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Creation failed');
    }
  };

  const handleDelete = async (orgId) => {
    try {
      await deleteOrganization(orgId);
      await getUserProfile();
      setDeleteOrg(null);
      toast.success('Organization removed');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5 sm:pb-6">
          <div className="space-y-2">
            <Skeleton className="h-7 w-36 sm:w-44" />
            <Skeleton className="h-4 w-64 sm:w-80" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-border/70 bg-card/40 p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-44" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-16 w-full rounded-xl" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-10 flex-1 rounded-xl" />
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isBusy = isUpdating || Boolean(switchingOrgId);

  // Helper to dim non-targeted cards and apply a pulse effect to the active target
  const getCardSwitchStyle = (orgId) => {
    if (!switchingOrgId) return 'transition-opacity duration-200';
    if (switchingOrgId === orgId) {
      return 'relative z-10 animate-pulse pointer-events-none transition-opacity duration-200';
    }
    return 'opacity-30 pointer-events-none select-none transition-opacity duration-200';
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5 sm:pb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Workspaces
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Create, switch, or manage your organization workspaces and team access.
          </p>
        </div>

        {!ownedOrganization && (
          <Button
            type="button"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="h-9 px-3.5 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer rounded-xl shadow-2xs active:scale-[0.98] transition-all self-start sm:self-auto shrink-0"
          >
            <Plus className="h-3.5 w-3.5 shrink-0" />
            <span>New Workspace</span>
          </Button>
        )}
      </div>

      {/* No Active Org Banner */}
      {hasNoActiveOrganization && (
        <div className="flex items-center gap-2.5 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-xs sm:text-sm text-warning font-medium">
          <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
          <span>No active workspace selected. Please select or launch a workspace below to activate your account.</span>
        </div>
      )}

      {/* Organizations Responsive Grid: 1 col on mobile, 2 on tablet, 3 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* 1. Owned Org */}
        {ownedOrganization && (
          <div className={getCardSwitchStyle(ownedOrganization._id)}>
            <OrganizationCard
              org={ownedOrganization}
              isActive={activeOrganizationId === ownedOrganization._id}
              isOwner={true}
              onSelect={handleSwitch}
              onDelete={(org) => setDeleteOrg(org)}
              isUpdating={isBusy}
              isSwitching={switchingOrgId === ownedOrganization._id}
            />
          </div>
        )}

        {/* 2. Create Workspace Card */}
        {!ownedOrganization && (
          <div className={switchingOrgId ? 'opacity-30 pointer-events-none select-none transition-opacity duration-200' : 'transition-opacity duration-200'}>
            <CreateOrganizationCard onClick={() => setShowCreateModal(true)} />
          </div>
        )}

        {/* 3. Member Orgs List */}
        {memberOrganizations.map((org) => (
          <div key={org._id} className={getCardSwitchStyle(org._id)}>
            <OrganizationCard
              org={org}
              isActive={activeOrganizationId === org._id}
              isOwner={false}
              onSelect={handleSwitch}
              onDelete={(org) => setDeleteOrg(org)}
              isUpdating={isBusy}
              isSwitching={switchingOrgId === org._id}
            />
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md rounded-2xl border-border bg-card text-card-foreground [&>button]:cursor-pointer [&>button]:rounded-full [&>button]:p-1.5">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tight text-foreground">Launch Workspace</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Give your new organization a name to get started.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground">Workspace Name</Label>
              <Input
                autoFocus
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                className="h-10 rounded-xl text-sm border-border focus-visible:ring-1"
                placeholder="e.g. Acme Corp"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="h-9 rounded-xl text-xs font-medium cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                disabled={isBusy || !newOrgName.trim()}
                type="submit"
                className="h-9 px-4 rounded-xl text-xs font-medium cursor-pointer shadow-2xs active:scale-[0.98] transition-all"
              >
                {isBusy ? 'Creating...' : 'Create Workspace'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      {deleteOrg && (
        <Dialog open={!!deleteOrg} onOpenChange={() => setDeleteOrg(null)}>
          <DialogContent className="sm:max-w-sm rounded-2xl border-border bg-card text-card-foreground [&>button]:cursor-pointer [&>button]:rounded-full [&>button]:p-1.5">
            <DialogHeader className="space-y-2 text-left">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-semibold text-foreground tracking-tight">
                Delete Organization
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-normal">
                Are you sure you want to delete <span className="font-semibold text-foreground underline">{deleteOrg.name}</span>? This action is permanent and cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 pt-2 justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-8 rounded-lg text-xs font-medium cursor-pointer"
                onClick={() => setDeleteOrg(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="h-8 rounded-lg text-xs font-medium cursor-pointer shadow-2xs"
                onClick={() => handleDelete(deleteOrg._id)}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}