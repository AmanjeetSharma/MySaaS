import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Building2, Plus, Loader2 } from 'lucide-react';
import { useOrganizationStore, useUserStore } from '@/stores';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

export function OrganizationSwitcher() {
  const {
    organizations,
    currentOrganization,
    getOrganizations,
    switchOrganization,
    createOrganization,
    isLoading: isOrgsLoading,
    isUpdating,
    setCurrentOrganization
  } = useOrganizationStore();
  
  const { userProfile, getUserProfile, isLoading: isUserLoading } = useUserStore();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch organizations and check user profile on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsInitialLoad(true);
      
      // First, ensure we have user profile with active organization
      if (!userProfile) {
        await getUserProfile();
      }
      
      // Then fetch all organizations
      await getOrganizations();
      
      setIsInitialLoad(false);
    };
    
    fetchInitialData();
  }, []);

  // CRITICAL: Check if user has an active organization from userProfile
  const hasActiveOrganization = userProfile?.activeOrganization !== null && 
                                 userProfile?.activeOrganization !== undefined;
  
  // Get the active organization ID from userProfile
  const userActiveOrgId = userProfile?.activeOrganization;
  
  // Check if user has any organizations in the organizationStore
  const hasOrganizations = organizations && organizations.length > 0;
  const hasSingleOrg = hasOrganizations && organizations.length === 1;
  const hasMultipleOrgs = hasOrganizations && organizations.length > 1;

  // CRITICAL: Sync current organization with user's active organization
  useEffect(() => {
    // Don't sync if still loading
    if (isInitialLoad || isUserLoading || isOrgsLoading) {
      return;
    }

    // If user has an active organization but no current organization is set
    if (hasActiveOrganization && !currentOrganization) {
      const matchedOrg = organizations.find(org => org._id === userActiveOrgId);
      if (matchedOrg) {
        setCurrentOrganization(matchedOrg);
      }
    }
    
    // If user has no active organization but has organizations, 
    // we need to set one as active
    if (!hasActiveOrganization && hasOrganizations && organizations.length > 0) {
      // Check if current organization is already set
      if (!currentOrganization) {
        // Set the first organization as current
        setCurrentOrganization(organizations[0]);
      }
    }
  }, [
    isInitialLoad, 
    isUserLoading, 
    isOrgsLoading, 
    hasActiveOrganization, 
    userActiveOrgId, 
    organizations, 
    currentOrganization, 
    hasOrganizations,
    setCurrentOrganization
  ]);

  const handleSwitch = async (orgId) => {
    if (currentOrganization?._id === orgId) {
      return; // Already on this organization
    }
    
    try {
      await switchOrganization(orgId);
      const selectedOrg = organizations.find(org => org._id === orgId);
      toast.success(`Switched to ${selectedOrg?.name}`);
      
      // CRITICAL: Refresh user profile to get updated activeOrganization
      await getUserProfile();
      
    } catch (error) {
      toast.error(error.message || 'Failed to switch organization');
    }
  };

  const handleCreate = async () => {
    if (!newOrgName.trim()) {
      toast.error('Organization name is required');
      return;
    }
    
    try {
      const newOrg = await createOrganization(newOrgName);
      setNewOrgName('');
      setIsCreateOpen(false);
      toast.success(`Organization "${newOrg.name}" created successfully`);
      
      // CRITICAL: Refresh user profile to get updated activeOrganization
      await getUserProfile();
      
    } catch (error) {
      toast.error(error.message || 'Failed to create organization');
    }
  };

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || 'O';
  };

  // Loading state
  if (isInitialLoad || isUserLoading || isOrgsLoading) {
    return (
      <Button variant="outline" className="gap-2" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading...</span>
      </Button>
    );
  }

  // CRITICAL: Check if user has NO active organization AND NO organizations at all
  if (!hasActiveOrganization && !hasOrganizations) {
    return (
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogTrigger asChild>
          <Button variant="default" className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            <span>Create Your First Organization</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Your First Organization</DialogTitle>
            <p className="text-sm text-muted-foreground">
              You need to create an organization to start using MySaaS
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                placeholder="Enter organization name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
            </div>
            <Button onClick={handleCreate} className="w-full" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Organization'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // CRITICAL: If user has active organization but somehow no organizations in store
  if (hasActiveOrganization && !hasOrganizations) {
    return (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading organizations...</span>
      </div>
    );
  }

  // Normal dropdown when user has organizations
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 min-w-[180px] justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {currentOrganization?.name || organizations[0]?.name || 'Select Organization'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Your Organizations ({organizations.length})
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* List all organizations */}
          {organizations.map((org) => {
            const isActive = currentOrganization?._id === org._id;
            const isUserActive = userActiveOrgId === org._id;
            
            return (
              <DropdownMenuItem
                key={org._id}
                onClick={() => handleSwitch(org._id)}
                className={`flex items-center gap-3 py-2 cursor-pointer ${
                  isActive || isUserActive ? 'bg-accent' : ''
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(org.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{org.name}</p>
                  {(isActive || isUserActive) && (
                    <p className="text-xs text-green-600 dark:text-green-400">Active</p>
                  )}
                </div>
                {(isActive || isUserActive) && (
                  <div className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                )}
              </DropdownMenuItem>
            );
          })}
          
          <DropdownMenuSeparator />
          
          {/* Create new organization option (always available) */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2 cursor-pointer">
                <Plus className="h-4 w-4" />
                <span>Create New Organization</span>
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Organization</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  You can create multiple organizations and switch between them
                </p>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    placeholder="Enter organization name"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  />
                </div>
                <Button onClick={handleCreate} className="w-full" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Organization'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}