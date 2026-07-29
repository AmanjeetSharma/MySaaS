import { useEffect, useState } from 'react';
import { Building2, AlertTriangle } from 'lucide-react';
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

  useEffect(() => {
    getOrganizations();
    getUserProfile();
  }, []);

  const activeOrganizationId = userProfile?.activeOrganization;
  const hasNoActiveOrganization = Boolean(userProfile) && !activeOrganizationId;

  const handleSwitch = async (orgId) => {
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
      getUserProfile();
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
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center font-semibold text-sm uppercase tracking-widest text-muted-foreground/50 animate-pulse">
        Synchronizing Workspaces...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-2 pb-8 md:pt-4 space-y-6">
      {/* Header Section (Tighter top margin to sit directly below navbar) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Manage Your Workspace
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Create, switch, or delete your workspaces. You can also manage members and integrations for each workspace.
          </p>
        </div>

        {hasNoActiveOrganization && (
          <div className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
            <span>No active workspace selected. Please select or create one below.</span>
          </div>
        )}
      </div>

      {/* Organizations Responsive Grid */}
      {/* Organizations Responsive Grid */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* 1. Owned Org */}
        {ownedOrganization && (
          <OrganizationCard
            org={ownedOrganization}
            isActive={activeOrganizationId === ownedOrganization._id}
            isOwner={true}
            onSelect={handleSwitch}
            onDelete={(org) => setDeleteOrg(org)}
            isUpdating={isUpdating}
          />
        )}

        {/* 2. Create Workspace Card */}
        {!ownedOrganization && (
          <CreateOrganizationCard onClick={() => setShowCreateModal(true)} />
        )}

        {/* 3. Member Orgs List */}
        {memberOrganizations.map((org) => (
          <OrganizationCard
            key={org._id}
            org={org}
            isActive={activeOrganizationId === org._id}
            isOwner={false}
            onSelect={handleSwitch}
            onDelete={(org) => setDeleteOrg(org)}
            isUpdating={isUpdating}
          />
        ))}
      </div>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md rounded-2xl  [&>button]:cursor-pointer">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Launch Workspace</DialogTitle>
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
                className="h-10 rounded-xl text-sm"
                placeholder="e.g. My Organization"
              />
            </div>
            <Button disabled={isUpdating} type="submit" className="w-full h-10 rounded-xl font-semibold cursor-pointer">
              {isUpdating ? 'Creating...' : 'Create Organization'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      {deleteOrg && (
        <Dialog open={!!deleteOrg} onOpenChange={() => setDeleteOrg(null)}>
          <DialogContent className="sm:max-w-sm rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-destructive font-bold">Delete Organization</DialogTitle>
              <DialogDescription className="text-xs">
                Are you sure you want to delete <span className="font-semibold text-foreground underline">{deleteOrg.name}</span>? This action is permanent and cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" className="flex-1 rounded-xl cursor-pointer text-xs" onClick={() => setDeleteOrg(null)}>Cancel</Button>
              <Button variant="destructive" className="flex-1 rounded-xl cursor-pointer text-xs" onClick={() => handleDelete(deleteOrg._id)}>Delete</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}