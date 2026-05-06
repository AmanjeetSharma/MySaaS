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
import { ChevronDown, Building2, Plus } from 'lucide-react';
import { useOrganizationStore } from '@/stores';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function OrganizationSwitcher() {
  const {
    organizations,
    currentOrganization,
    getOrganizations,
    switchOrganization,
    createOrganization
  } = useOrganizationStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');

  useEffect(() => {
    getOrganizations();
  }, []);

  const handleSwitch = async (orgId) => {
    await switchOrganization(orgId);
  };

  const handleCreate = async () => {
    if (newOrgName.trim()) {
      await createOrganization(newOrgName);
      setNewOrgName('');
      setIsCreateOpen(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Building2 className="h-4 w-4" />
          <span className="max-w-[150px] truncate">
            {currentOrganization?.name || 'Select Organization'}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Your Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org._id}
            onClick={() => handleSwitch(org._id)}
            className={currentOrganization?._id === org._id ? 'bg-accent' : ''}
          >
            <Building2 className="mr-2 h-4 w-4" />
            <span className="flex-1 truncate">{org.name}</span>
            {currentOrganization?._id === org._id && (
              <span className="ml-auto text-xs text-muted-foreground">Active</span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Plus className="mr-2 h-4 w-4" />
              Create Organization
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Organization</DialogTitle>
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
              <Button onClick={handleCreate} className="w-full">
                Create Organization
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}