import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2,
    ChevronDown,
    Check,
    Loader2,
    Plus,
    ArrowUpRight,
    Crown,
    Users
} from 'lucide-react';
import { toast } from 'sonner';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUserStore, useOrganizationStore } from '@/stores';
import { cn } from '@/lib/utils';

export function OrganizationDropdown() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [switchingOrgId, setSwitchingOrgId] = useState(null);

    const { userProfile, getUserProfile } = useUserStore();
    const activeOrganizationId = userProfile?.activeOrganization;

    const {
        ownedOrganization,
        memberOrganizations,
        getOrganizations,
        switchOrganization,
        isLoading: isOrgLoading,
    } = useOrganizationStore();

    useEffect(() => {
        getOrganizations();
    }, [getOrganizations]);

    const allOrganizations = useMemo(() => {
        const orgs = [
            ...(ownedOrganization ? [ownedOrganization] : []),
            ...(memberOrganizations || []),
        ];

        const seen = new Set();
        return orgs.filter((org) => {
            if (!org?._id || seen.has(org._id)) return false;
            seen.add(org._id);
            return true;
        });
    }, [ownedOrganization, memberOrganizations]);

    const currentOrgId =
        typeof activeOrganizationId === 'object'
            ? activeOrganizationId?._id
            : activeOrganizationId;

    const currentOrg = allOrganizations.find((org) => org._id === currentOrgId);

    const hasMatchingOrg = allOrganizations.some((org) => org._id === currentOrgId);
    const canCreateOrganization = !hasMatchingOrg && !ownedOrganization;

    const handleSelectOrg = async (orgId) => {
        if (orgId === currentOrgId) {
            setOpen(false);
            navigate(`/organizations/${orgId}`);
            return;
        }

        if (switchingOrgId) return;

        setSwitchingOrgId(orgId);
        try {
            useUserStore.setState((state) => ({
                userProfile: state.userProfile
                    ? {
                        ...state.userProfile,
                        activeOrganization: orgId,
                    }
                    : null,
            }));

            await switchOrganization(orgId);
            toast.success('Organization switched', {
                icon: <Building2 className="h-4 w-4 text-primary" />,
                position: 'top-center',
            });

            navigate(`/organizations/${orgId}`);
        } catch (error) {
            toast.error(
                error?.response?.data?.message || 'Failed to switch organization'
            );
            await getUserProfile();
        } finally {
            setSwitchingOrgId(null);
            setOpen(false);
        }
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    title={currentOrg ? currentOrg.name : 'No organization selected'}
                    className={cn(
                        'group inline-flex h-8 items-center gap-1.5 sm:gap-2 rounded-lg border px-2 sm:px-2.5 md:px-3 text-xs font-medium outline-none transition-all duration-200 cursor-pointer select-none shrink min-w-0 max-w-[130px] xs:max-w-[160px] sm:max-w-[200px] md:max-w-[240px]',
                        'border-primary/60 bg-primary/5 hover:border-primary hover:bg-primary/10 text-foreground active:scale-[0.98]',
                        open && 'border-primary ring-2 ring-primary/25 bg-primary/10',
                        'focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background'
                    )}
                    aria-label="Choose organization"
                >
                    <Building2 className="h-3.5 w-3.5 text-primary shrink-0 transition-transform duration-200 group-hover:scale-110" />

                    <span className="truncate text-xs font-medium min-w-0">
                        {currentOrg ? currentOrg.name : 'no org selected'}
                    </span>

                    {switchingOrgId ? (
                        <Loader2 className="h-3 w-3 animate-spin text-primary shrink-0 ml-0.5" />
                    ) : (
                        <ChevronDown
                            className={cn(
                                'h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0',
                                open && 'rotate-180 text-foreground'
                            )}
                        />
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                sideOffset={6}
                collisionPadding={8}
                className={cn(
                    'w-[calc(100vw-2rem)] max-w-64 sm:w-64 rounded-xl border border-border bg-popover/95 p-1.5',
                    'backdrop-blur-xl shadow-xl'
                )}
            >
                <DropdownMenuLabel className="px-2.5 py-1.5 text-[10px] sm:text-[11px] font-semibold tracking-wider text-muted-foreground uppercase flex items-center justify-between">
                    <span>Organizations</span>
                    {allOrganizations.length > 0 && (
                        <span className="text-[10px] font-normal text-muted-foreground/70">
                            {allOrganizations.length} available
                        </span>
                    )}
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="my-1 bg-border/60" />

                <div className="max-h-56 overflow-y-auto py-0.5 space-y-0.5">
                    {isOrgLoading && allOrganizations.length === 0 ? (
                        <div className="flex items-center justify-center py-4 gap-2 text-xs text-muted-foreground">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                            <span>Loading organizations...</span>
                        </div>
                    ) : allOrganizations.length === 0 ? (
                        <div className="py-4 px-3 text-center text-xs text-muted-foreground">
                            No organizations found
                        </div>
                    ) : (
                        allOrganizations.map((org) => {
                            const isSelected = org._id === currentOrgId;
                            const isSwitching = switchingOrgId === org._id;
                            const isOwner = org._id === ownedOrganization?._id;

                            return (
                                <DropdownMenuItem
                                    key={org._id}
                                    onClick={() => handleSelectOrg(org._id)}
                                    className={cn(
                                        'group/item flex items-center justify-between rounded-lg px-2.5 py-2 text-xs sm:text-sm cursor-pointer transition-colors',
                                        isSelected
                                            ? 'bg-primary/10 text-primary font-medium focus:bg-primary/15 focus:text-primary'
                                            : 'hover:bg-accent focus:bg-accent text-foreground'
                                    )}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="flex flex-col min-w-0 text-left">
                                            <span className="truncate text-xs font-medium text-foreground">
                                                {org.name}
                                            </span>

                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                {isOwner ? (
                                                    <>
                                                        <Crown className="h-2.5 w-2.5 text-warning shrink-0" />
                                                        Owner
                                                    </>
                                                ) : (
                                                    <>
                                                        <Users className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                                                        Member
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                    </div>


                                    <div className="ml-2 shrink-0">
                                        {isSwitching ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                                        ) : isSelected ? (
                                            <Check className="h-4 w-4 text-primary" />
                                        ) : null}
                                    </div>
                                </DropdownMenuItem>
                            );
                        })
                    )}
                </div>

                <DropdownMenuSeparator className="my-1 bg-border/60" />

                <div className="pt-0.5 space-y-0.5">
                    <DropdownMenuItem
                        onClick={() => {
                            setOpen(false);
                            navigate('/organizations');
                        }}
                        className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent focus:bg-accent cursor-pointer"
                    >
                        <div className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5" />
                            <span>Manage organizations</span>
                        </div>
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
                    </DropdownMenuItem>

                    {canCreateOrganization && (
                        <DropdownMenuItem
                            onClick={() => {
                                setOpen(false);
                                navigate('/organizations');
                            }}
                            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 focus:bg-primary/10 cursor-pointer"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Create new organization</span>
                        </DropdownMenuItem>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
