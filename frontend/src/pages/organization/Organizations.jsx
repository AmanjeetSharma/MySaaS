import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Check, Plus, Shield, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useOrganizationStore, useUserStore } from '@/stores';

// --- Reusable Card Component ---
const OrganizationCard = ({
  org,
  isActive,
  isOwner,
  isCreateCard,
  onSelect,
  onDelete,
  isUpdating
}) => {
  if (isCreateCard) {
    return (
      <div className="group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-muted-foreground/20 bg-transparent p-8 transition-all hover:border-primary/50 hover:bg-primary/5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary/10">
          <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold">Create Your Organization</h3>
          <p className="text-sm text-muted-foreground">You don't have your own organization yet</p>
        </div>
        <button
          onClick={onSelect}
          className="mt-6 rounded-xl bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90"
        >
          Get Started
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => !isActive && onSelect(org._id)}
      className={`
        group relative flex cursor-pointer flex-col rounded-3xl border p-6 transition-all duration-300
        ${isActive ? 'border-primary ring-2 ring-primary/10 ring-offset-2' : 'border-border hover:-translate-y-1 hover:shadow-xl'}
        ${isUpdating ? 'pointer-events-none opacity-60' : ''}
        bg-card
      `}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
          <Building2 className="h-7 w-7" />
        </div>

        {isActive && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
            <Check className="h-3 w-3" /> Active
          </span>
        )}
      </div>

      <div className="mt-6 flex-1">
        <h3 className="truncate text-xl font-bold tracking-tight">{org.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {org.description || 'Professional workspace for team collaboration and management.'}
        </p>

        <div className="mt-4 flex items-center gap-3">
          <div className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${isOwner ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-500'}`}>
            {isOwner ? <Shield className="h-3 w-3" /> : null}
            {isOwner ? 'Owner' : 'Member'}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            {org.memberCount || 1} Members
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <Link
          to={`/organization/${org._id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex h-10 flex-1 items-center justify-center rounded-xl bg-secondary text-sm font-medium transition-colors hover:bg-secondary/80"
        >
          Settings
        </Link>
        {isOwner && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(org);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-destructive/20 text-destructive transition-colors hover:bg-destructive hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

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
    getAllOrganizations,
  } = useOrganizationStore();

  const { userProfile, getUserProfile } = useUserStore();

  const [orgName, setOrgName] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    getOrganizations();
    getUserProfile();
  }, []);

  const organizations = useMemo(() => getAllOrganizations(), [ownedOrganization, memberOrganizations]);
  const activeOrganizationId = userProfile?.activeOrganization;

  const handleSwitch = async (orgId) => {
    try {
      await switchOrganization(orgId);
      await getUserProfile();
      toast.success('Switched workspace');
    } catch (error) {
      toast.error('Switch failed');
    }
  };

  const handleCreate = async () => {
    if (!orgName.trim()) return toast.error('Name required');
    try {
      await createOrganization(orgName);
      await getUserProfile();
      toast.success('Created successfully');
      setOrgName('');
      setShowCreateForm(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Create failed');
    }
  };

  if (isLoading) return <div className="flex h-96 items-center justify-center">Loading workspaces...</div>;

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Organizations</h1>
        <p className="text-lg text-muted-foreground">Select a workspace to manage your team and projects.</p>
      </div>

      {/* Conditional Create Section */}
      {showCreateForm && (
        <div className="animate-in fade-in zoom-in rounded-3xl border bg-card p-8 duration-300">
          <h2 className="mb-4 text-xl font-bold">New Organization</h2>
          <div className="flex flex-col gap-4 sm:flex-row">
            <input
              autoFocus
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Enter organization name..."
              className="h-12 flex-1 rounded-xl border bg-background px-4 focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowCreateForm(false)} className="h-12 rounded-xl border px-6 font-medium">Cancel</button>
              <button onClick={handleCreate} disabled={isUpdating} className="h-12 rounded-xl bg-primary px-6 font-medium text-primary-foreground">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* My Organization Section */}
      {ownedOrganization && (
        <section className="space-y-5">
          <div className="flex items-center gap-2 px-1">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">My Organization</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <OrganizationCard
              org={ownedOrganization}
              isActive={activeOrganizationId === ownedOrganization._id}
              isOwner={true}
              onSelect={handleSwitch}
              onDelete={setDeleteModal}
              isUpdating={isUpdating}
            />
          </div>
        </section>
      )}

      {/* Member/Other Organizations */}
      <section className="space-y-5">
        <div className="flex items-center gap-2 px-1">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            {ownedOrganization ? 'Other Organizations' : 'Available Organizations'}
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {!ownedOrganization && !showCreateForm && (
            <OrganizationCard isCreateCard onSelect={() => setShowCreateForm(true)} />
          )}

          {memberOrganizations.map((org) => (
            <OrganizationCard
              key={org._id}
              org={org}
              isActive={activeOrganizationId === org._id}
              isOwner={false}
              onSelect={handleSwitch}
              onDelete={setDeleteModal}
              isUpdating={isUpdating}
            />
          ))}
        </div>
      </section>

      {/* Delete Modal remains largely the same but styled for consistency */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-destructive">Delete {deleteModal.name}?</h2>
            <p className="mt-2 text-muted-foreground">This action is permanent. Type <span className="font-mono font-bold text-foreground">DELETE</span> to proceed.</p>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="mt-6 h-12 w-full rounded-xl border bg-background px-4 text-center font-bold tracking-widest"
              placeholder="DELETE"
            />
            <div className="mt-8 flex gap-3">
              <button onClick={() => { setDeleteModal(null); setConfirmText(''); }} className="h-12 flex-1 rounded-xl border font-semibold">Cancel</button>
              <button
                onClick={async () => {
                  if (confirmText !== 'DELETE') return toast.error('Please type DELETE to confirm');
                  await deleteOrganization(deleteModal._id);
                  await getUserProfile();
                  setDeleteModal(null);
                  setConfirmText('');
                  toast.success('Organization removed');
                }}
                className="h-12 flex-1 rounded-xl bg-destructive font-semibold text-white transition-opacity hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}