import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Check, Plus, Shield, Trash2, Users,
  Sparkles, ArrowUpRight, Crown, UserPlus,
  Zap, Calendar, MessageSquare, X
} from 'lucide-react';
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

// --- Organization Card Component ---
const OrganizationCard = ({ org, isActive, isOwner, onSelect, onDelete, isUpdating }) => {
  // Logic: Count members excluding the owner
  const displayMemberCount = org.members?.length || 0;

  // Logic: Dynamic Description with Static Fallback
  const description = org.description || "A professional high-performance workspace designed for seamless team collaboration and automated business operations.";

  return (
    <div
      onClick={() => !isActive && onSelect(org._id)}
      className={`
        group relative flex cursor-pointer flex-col rounded-[2rem] border p-6 transition-all duration-300
        ${isActive
          ? 'border-primary bg-primary/2 ring-2 ring-primary/20 shadow-xl shadow-primary/10'
          : 'border-border/60 bg-card hover:border-primary/30 hover:shadow-2xl '
        }
        ${isUpdating ? 'pointer-events-none opacity-60' : ''}
      `}
    >
      {/* Header: Icon and Role Badge */}
      <div className="flex items-start justify-between">
        <div className={`
          flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300
          ${isActive
            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
            : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
          }
        `}>
          <Building2 className="h-7 w-7" />
        </div>

        <div className="flex flex-col items-end gap-2">
          {isOwner ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-600 border border-amber-500/20">
              <Crown className="h-3 w-3" /> Owner
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600 border border-blue-500/20">
              <UserPlus className="h-3 w-3" /> Member
            </span>
          )}

          {/* Active Indicator - Positioned on the border */}
          {/* Active Indicator - Premium Badge with Centered Text */}
          {isActive && (
            <div className="absolute -top-3.5 right-7">
              <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary-foreground shadow-lg shadow-primary/30 ring-2 ring-primary/20">
                {/* <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_rgba(255,255,255,0.8)]" /> */}
                Active
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mt-8 flex-1">
        <h3 className="text-2xl font-black tracking-tight truncate uppercase">{org.name}</h3>

        {/* Dynamic Description Implementation */}
        <p className="mt-3 text-xs md:text-sm font-medium text-muted-foreground/80 line-clamp-2 leading-relaxed h-10 md:h-12">
          {description}
        </p>

        {/* Integration Mini-Badges */}
        <div className="mt-4 flex gap-2">
          {org.integrations?.whatsapp?.isEnabled && (
            <div title="WhatsApp Enabled" className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/10">
              <MessageSquare className="h-3 w-3" />
            </div>
          )}
          {org.integrations?.googleCalendar?.isConnected && (
            <div title="Calendar Synced" className="p-1 rounded-md bg-blue-500/10 text-blue-600 border border-blue-500/10">
              <Calendar className="h-3 w-3" />
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Team Size</span>
            <div className="mt-1 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-bold">{displayMemberCount} <span className="text-[10px] text-muted-foreground font-medium lowercase">others</span></span>
            </div>
          </div>

          <div className="h-8 w-px bg-border/60" />

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Tier</span>
            <div className="mt-1 flex items-center gap-1.5">
              <Zap className={`h-3.5 w-3.5 ${org.subscription?.plan === 'pro' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="text-sm font-bold capitalize">{org.subscription?.plan || 'Free'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex items-center gap-2">
        <Link
          to={`/organizations/${org._id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-secondary text-xs font-black uppercase tracking-widest transition-all hover:bg-muted active:scale-95"
        >
          Details <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
        {isOwner && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(org);
            }}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-destructive/10 text-destructive transition-all hover:bg-destructive hover:text-white active:scale-90"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        )}
      </div>
    </div>
  );
};

// --- Create Organization Card ---
const CreateOrganizationCard = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-muted-foreground/20 bg-card/30 p-8 min-h-[320px] transition-all duration-300 hover:border-primary/40 hover:bg-primary/[0.02] hover:shadow-2xl"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted/50 transition-all group-hover:bg-primary group-hover:text-white group-hover:rotate-90 duration-500">
        <Plus className="h-10 w-10" />
      </div>
      <h3 className="mt-8 text-xl font-black tracking-tight uppercase">New Workspace</h3>
      <p className="mt-2 text-sm font-medium text-muted-foreground max-w-[220px] text-center">
        Set up a professional space for your team and operations.
      </p>
      <div className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-primary/20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
        <Sparkles className="h-3 w-3" />
        Launch Now
      </div>
    </button>
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteOrg, setDeleteOrg] = useState(null);
  const [newOrgName, setNewOrgName] = useState('');

  useEffect(() => {
    getOrganizations();
    getUserProfile();
  }, []);

  const activeOrganizationId = userProfile?.activeOrganization;

  const handleSwitch = async (orgId) => {
    try {
      // OPTIMISTIC UPDATE
      useUserStore.setState((state) => ({
        userProfile: {
          ...state.userProfile,
          activeOrganization: orgId,
        },
      }));

      await switchOrganization(orgId);
      toast.success('Organization switched', {
        icon: <Building2 className="h-5 w-5 text-primary" />,
        position: 'bottom-right',
      });
    } catch (error) {
      toast.error('Failed to switch');
      getUserProfile(); // rollback safety
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newOrgName.trim()) return toast.error('Workspace name required');
    try {
      await createOrganization(newOrgName);
      await getUserProfile();
      setShowCreateModal(false);
      setNewOrgName('');
      toast.success('Organization created!');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Create failed');
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
    return <div className="flex h-screen items-center justify-center animate-pulse font-black uppercase tracking-widest text-muted-foreground/40">Syncing Workspaces...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 md:py-20">
      {/* Header */}
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-5xl font-black tracking-tighter md:text-6xl uppercase ">Workspace</h1>
        <p className="text-muted-foreground font-medium md:text-lg">
          Switch between your owned and team organizations.
        </p>
      </div>

      {/* Organizations Grid */}
      <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* 1. Show Owned Org IF it exists */}
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

        {/* 2. Show Create Card ONLY IF user does NOT own an org */}
        {!ownedOrganization && (
          <CreateOrganizationCard onClick={() => setShowCreateModal(true)} />
        )}

        {/* 3. List Member Orgs */}
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

      {/* Modal for creating workspace */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Launch Workspace</DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">Give your new organization a name to get started.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Workspace Name</Label>
              <Input
                autoFocus
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                className="h-12 rounded-xl text-lg font-bold"
                placeholder="Acme Corp"
              />
            </div>
            <Button disabled={isUpdating} type="submit" className="w-full h-12 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20">
              {isUpdating ? 'Creating...' : 'Create Organization'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      {deleteOrg && (
        <Dialog open={!!deleteOrg} onOpenChange={() => setDeleteOrg(null)}>
          <DialogContent className="sm:max-w-[400px] rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-destructive font-black uppercase tracking-tight">Dangerous Action</DialogTitle>
              <DialogDescription className="font-medium">
                Are you sure you want to delete <span className="font-bold text-foreground underline">{deleteOrg.name}</span>? This action is permanent.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" className="flex-1 rounded-xl font-bold" onClick={() => setDeleteOrg(null)}>Cancel</Button>
              <Button variant="destructive" className="flex-1 rounded-xl font-bold" onClick={() => handleDelete(deleteOrg._id)}>Delete</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}