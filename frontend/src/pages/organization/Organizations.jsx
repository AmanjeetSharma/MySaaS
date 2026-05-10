import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, Check, Plus, Shield, Trash2, Users, 
  X, LayoutGrid, ArrowRight 
} from 'lucide-react';
import { toast } from 'sonner';
import { useOrganizationStore, useUserStore } from '@/stores';

// --- Reusable Card Component ---
const OrganizationCard = ({
  org,
  isActive,
  isOwner,
  isCreateAction,
  onSelect,
  onDelete,
  isUpdating
}) => {
  // Option 1: The "Create New" Card
  if (isCreateAction) {
    return (
      <button
        onClick={onSelect}
        className="group relative flex min-h-[220px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-muted-foreground/20 bg-transparent p-6 transition-all hover:border-primary/50 hover:bg-primary/5"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted transition-colors group-hover:bg-primary/10">
          <Plus className="h-7 w-7 text-muted-foreground group-hover:text-primary" />
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-bold">New Organization</h3>
          <p className="text-xs text-muted-foreground mt-1">Start a fresh workspace</p>
        </div>
      </button>
    );
  }

  // Option 2: Standard Organization Card
  return (
    <div
      onClick={() => !isActive && onSelect(org._id)}
      className={`
        group relative flex min-h-[220px] cursor-pointer flex-col rounded-3xl border p-6 transition-all duration-300
        ${isActive ? 'border-primary ring-4 ring-primary/5 shadow-xl' : 'border-border hover:-translate-y-1 hover:shadow-lg'}
        ${isUpdating ? 'pointer-events-none opacity-60' : ''}
        bg-card
      `}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
          <Building2 className="h-6 w-6" />
        </div>

        {isActive ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
            <Check className="h-3 w-3" /> Active
          </span>
        ) : (
          <div className="opacity-0 transition-opacity group-hover:opacity-100">
            <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
              Switch <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 flex-1">
        <h3 className="truncate text-xl font-bold tracking-tight">{org.name}</h3>
        
        <div className="mt-2 flex items-center gap-2">
          <div className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isOwner ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-500'}`}>
            {isOwner ? <Shield className="h-3 w-3" /> : null}
            {isOwner ? 'Owner' : 'Member'}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
            <Users className="h-3 w-3" />
            {org.memberCount || 1}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <Link
          to={`/organizations/${org._id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex h-10 flex-1 items-center justify-center rounded-xl bg-secondary text-sm font-semibold transition-all hover:bg-secondary/80"
        >
          Manage
        </Link>
        {isOwner && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(org);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-destructive/10 text-destructive transition-colors hover:bg-destructive hover:text-white"
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
  } = useOrganizationStore();

  const { userProfile, getUserProfile } = useUserStore();

  const [orgName, setOrgName] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    getOrganizations();
    getUserProfile();
  }, []);

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

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!orgName.trim()) return toast.error('Name required');
    try {
      await createOrganization(orgName);
      await getUserProfile();
      toast.success('Created successfully');
      setOrgName('');
      setIsCreateModalOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Create failed');
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center text-muted-foreground animate-pulse">Loading workspaces...</div>;

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-12">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b pb-8">
        <div className="flex items-center gap-3">
            <LayoutGrid className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-black tracking-tight">Workspaces</h1>
        </div>
        <p className="text-lg text-muted-foreground">Manage your organizations or switch between existing teams.</p>
      </div>

      {/* Unified Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        
        {/* FIRST SLOT: Owned Org OR Create Action */}
        {ownedOrganization ? (
          <OrganizationCard
            org={ownedOrganization}
            isActive={activeOrganizationId === ownedOrganization._id}
            isOwner={true}
            onSelect={handleSwitch}
            onDelete={setDeleteModal}
            isUpdating={isUpdating}
          />
        ) : (
          <OrganizationCard isCreateAction onSelect={() => setIsCreateModalOpen(true)} />
        )}

        {/* REMAINING SLOTS: Member Organizations */}
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

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">New Workspace</h2>
                <button onClick={() => setIsCreateModalOpen(false)} className="rounded-full p-2 hover:bg-muted transition-colors">
                    <X className="h-5 w-5" />
                </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold px-1">Organization Name</label>
                    <input
                        autoFocus
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="e.g. Acme Corp"
                        className="h-12 w-full rounded-xl border bg-background px-4 focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
                <button 
                    type="submit"
                    disabled={isUpdating}
                    className="h-12 w-full rounded-xl bg-primary font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                >
                    {isUpdating ? 'Creating...' : 'Create Organization'}
                </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-bold text-destructive">Wait, are you sure?</h2>
            <p className="mt-2 text-muted-foreground leading-relaxed">
                Deleting <span className="font-bold text-foreground">"{deleteModal.name}"</span> is permanent. 
                All data, members, and settings will be lost. Type <span className="font-mono font-bold text-foreground bg-muted px-1 rounded">DELETE</span> to confirm.
            </p>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="mt-6 h-12 w-full rounded-xl border border-destructive/20 bg-background px-4 text-center font-bold tracking-widest outline-none focus:ring-2 focus:ring-destructive"
              placeholder="DELETE"
            />
            <div className="mt-8 flex gap-3">
              <button onClick={() => { setDeleteModal(null); setConfirmText(''); }} className="h-12 flex-1 rounded-xl border font-bold hover:bg-muted transition-colors">Cancel</button>
              <button
                onClick={async () => {
                  if (confirmText !== 'DELETE') return toast.error('Verification failed');
                  await deleteOrganization(deleteModal._id);
                  await getUserProfile();
                  setDeleteModal(null);
                  setConfirmText('');
                  toast.success('Workspace dissolved');
                }}
                className="h-12 flex-1 rounded-xl bg-destructive font-bold text-white shadow-lg shadow-destructive/20 hover:opacity-90"
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