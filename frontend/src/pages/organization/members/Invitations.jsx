import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMemberStore } from "@/stores/memberStore";
import { useOrganizationStore } from "@/stores/organizationStore";
import { useUserStore } from "@/stores/userStore";
import {
    getEntityId,
    checkIsOwner,
    getInitials,
} from "./helpers/member.helper.js";
import {
    OrganizationInvitationsRow,
    OrganizationInvitationsCard,
} from "./components/OrganizationInvitationsRow";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ArrowLeft,
    Inbox,
    Users,
    ArrowRight,
    RotateCw,
    UserPlus,
    Loader2,
} from "lucide-react";

export default function OrganizationInvitations() {
    const navigate = useNavigate();
    const { orgId: routeOrgId } = useParams();

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    const { userProfile, getUserProfile, isLoading: isUserLoading } = useUserStore();
    const {
        currentOrganization,
        getOrganizations,
        isLoading: isOrgLoading,
    } = useOrganizationStore();
    const {
        organizationInvitations = [],
        members = [],
        isLoading: isInvitationsLoading,
        isUpdating,
        fetchOrganizationInvitations,
        fetchMembers,
        inviteMember,
        revokeInvitation,
    } = useMemberStore();

    const activeOrgId = getEntityId(userProfile?.activeOrganization);
    const targetOrgId = routeOrgId || getEntityId(currentOrganization) || activeOrgId;

    useEffect(() => {
        if (!userProfile) getUserProfile();
    }, []);

    useEffect(() => {
        if (userProfile && !currentOrganization && targetOrgId) {
            getOrganizations(targetOrgId);
        }
    }, [userProfile, targetOrgId]);

    useEffect(() => {
        if (targetOrgId) {
            fetchOrganizationInvitations(targetOrgId);
            fetchMembers(targetOrgId);
        }
    }, [targetOrgId]);

    const isOwner = useMemo(() => {
        return checkIsOwner(currentOrganization, userProfile);
    }, [currentOrganization, userProfile]);

    // Avatar stack metrics
    const desktopVisibleMembers = useMemo(() => members.slice(0, 4), [members]);
    const desktopOverflowCount = members.length > 4 ? members.length - 3 : 0;

    const mobileVisibleMembers = useMemo(() => members.slice(0, 3), [members]);
    const mobileOverflowCount = members.length > 3 ? members.length - 2 : 0;

    const handleRefresh = async () => {
        if (isRefreshing || !targetOrgId) return;
        setIsRefreshing(true);
        try {
            await Promise.all([
                fetchOrganizationInvitations(targetOrgId),
                fetchMembers(targetOrgId),
            ]);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleSendInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail || !targetOrgId) return;
        try {
            await inviteMember(targetOrgId, inviteEmail);
            setInviteEmail("");
            setIsInviteOpen(false);
            fetchOrganizationInvitations(targetOrgId);
        } catch {
            // Handled via toast in store
        }
    };

    const handleRevoke = async (invitationId) => {
        if (revokeInvitation) {
            await revokeInvitation(invitationId);
            if (targetOrgId) fetchOrganizationInvitations(targetOrgId);
        }
    };

    const showLoadingRows = isInvitationsLoading || isRefreshing;

    // Full-page synchronization loader
    if ((isOrgLoading || isUserLoading) && !currentOrganization) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background">
                <p className="text-sm font-semibold uppercase tracking-widest text-subtle-foreground/60 animate-pulse">
                    Synchronizing Workspace...
                </p>
            </div>
        );
    }

    return (
        <TooltipProvider delayDuration={0}>
            <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6 transition-all duration-300">
                {/* Back to -1 link */}
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="text-muted-foreground hover:text-foreground -ml-2 h-8 gap-1.5 cursor-pointer text-xs sm:text-sm font-medium transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>

                {/* Top Header & Adaptive Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                Organization Invitations
                            </h1>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleRefresh}
                                        disabled={showLoadingRows || isUpdating}
                                        className="h-8 w-8 rounded-full border border-border/80 bg-card/80 hover:bg-accent hover:border-border text-muted-foreground hover:text-foreground shadow-xs active:scale-95 transition-all cursor-pointer"
                                    >
                                        <RotateCw
                                            className={`h-3.5 w-3.5 ${showLoadingRows ? "animate-spin text-primary" : ""
                                                }`}
                                        />
                                        <span className="sr-only">Refresh invitations</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="text-xs font-medium">
                                    Refresh invitations
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            Manage and track invitations sent to prospective team members.
                        </p>
                    </div>

                    {/* Action Button Area */}
                    <div className="w-full sm:w-auto grid grid-cols-2 gap-2 sm:gap-3 sm:flex sm:items-center">
                        {/* Members Stack Button */}
                        {targetOrgId && members.length > 0 ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/organizations/${targetOrgId}/members`)}
                                        className="group w-full sm:w-auto h-10 flex items-center justify-center gap-2 bg-card/80 hover:bg-accent/40 active:scale-[0.98] px-3 sm:px-3.5 rounded-xl sm:rounded-full border border-border/80 shadow-xs hover:shadow-sm hover:border-border transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <div className="flex items-center gap-1 text-[11px] sm:text-xs font-medium text-foreground/90 shrink-0">
                                            <Users className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                                            <span>Members</span>
                                        </div>

                                        {/* Mobile Stack */}
                                        <div className="flex sm:hidden items-center -space-x-2 group-hover:space-x-0.5 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] shrink-0">
                                            {mobileVisibleMembers.map((member, index) => {
                                                const isThird = index === 2;
                                                const hasOverlay = isThird && mobileOverflowCount > 0;

                                                return (
                                                    <div
                                                        key={getEntityId(member)}
                                                        className={`relative shrink-0 transition-transform duration-200 group-hover:scale-105 z-[${index + 1}]`}
                                                    >
                                                        <Avatar className="h-5 w-5 border border-background shadow-xs">
                                                            <AvatarImage src={member.avatar} alt={member.name} />
                                                            <AvatarFallback className="text-[8px] font-semibold bg-muted text-foreground">
                                                                {getInitials(member.name)}
                                                            </AvatarFallback>
                                                        </Avatar>

                                                        {hasOverlay && (
                                                            <div className="absolute inset-0 rounded-full bg-foreground/90 text-background text-[8px] font-bold flex items-center justify-center shadow-xs pointer-events-none leading-none">
                                                                +{mobileOverflowCount}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Desktop Stack */}
                                        <div className="hidden sm:flex items-center -space-x-2.5 group-hover:space-x-1 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                                            {desktopVisibleMembers.map((member, index) => {
                                                const isFourth = index === 3;
                                                const hasOverlay = isFourth && desktopOverflowCount > 0;

                                                return (
                                                    <div
                                                        key={getEntityId(member)}
                                                        className={`relative shrink-0 z-[${index + 1}]`}
                                                    >
                                                        <Avatar className="h-6 w-6 border-2 border-background shadow-xs transition-transform duration-200 group-hover:scale-105">
                                                            <AvatarImage src={member.avatar} alt={member.name} />
                                                            <AvatarFallback className="text-[9px] font-bold bg-muted text-foreground">
                                                                {getInitials(member.name)}
                                                            </AvatarFallback>
                                                        </Avatar>

                                                        {hasOverlay && (
                                                            <div className="absolute inset-0 rounded-full border border-background bg-foreground/90 text-background text-[9px] font-bold flex items-center justify-center shadow-xs pointer-events-none transition-transform duration-200 group-hover:scale-105">
                                                                +{desktopOverflowCount}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="left"
                                    sideOffset={6}
                                    className="text-xs font-medium flex items-center gap-1.5"
                                >
                                    <span>Go to Members</span>
                                    <ArrowRight className="h-3 w-3" />
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="w-full sm:w-auto h-10 flex items-center justify-center gap-2 bg-muted/20 px-3 sm:px-3.5 rounded-xl sm:rounded-full border border-dashed border-border/60 opacity-60 backdrop-blur-xs cursor-not-allowed select-none">
                                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="text-xs font-medium text-muted-foreground">Members</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs max-w-[200px] text-center">
                                    No active organization selected
                                </TooltipContent>
                            </Tooltip>
                        )}

                        {/* Interactive Invite Member Dialog Button */}
                        {isOwner ? (
                            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        size="sm"
                                        className="w-full sm:w-auto h-10 px-3.5 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer rounded-xl sm:rounded-full shadow-xs active:scale-[0.98] transition-all duration-200"
                                    >
                                        <UserPlus className="h-3.5 w-3.5 shrink-0" />
                                        <span>Invite Member</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <form onSubmit={handleSendInvite}>
                                        <DialogHeader>
                                            <DialogTitle>Invite Teammate</DialogTitle>
                                            <DialogDescription>
                                                Send an email invitation link to join{" "}
                                                {currentOrganization?.name || "this organization"}.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4 space-y-2">
                                            <Label htmlFor="invite-email">Email address</Label>
                                            <Input
                                                id="invite-email"
                                                type="email"
                                                placeholder="teammate@company.com"
                                                value={inviteEmail}
                                                onChange={(e) => setInviteEmail(e.target.value)}
                                                required
                                                autoFocus
                                            />
                                        </div>
                                        <DialogFooter className="gap-2 sm:gap-0">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsInviteOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isUpdating || !inviteEmail}
                                            >
                                                {isUpdating && (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                )}
                                                Send Invitation
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        ) : (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="w-full sm:w-auto h-10 px-3.5 text-xs font-medium flex items-center justify-center gap-1.5 rounded-xl sm:rounded-full bg-muted/20 border border-dashed border-border/60 opacity-60 backdrop-blur-xs cursor-not-allowed select-none text-muted-foreground">
                                        <UserPlus className="h-3.5 w-3.5 shrink-0" />
                                        <span>Invite Member</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs max-w-[220px] text-center">
                                    Only organization owners can invite new members
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                </div>

                {/* Table Container */}
                <div className="rounded-xl border bg-card overflow-hidden shadow-xs w-full">
                    {/* Mobile Card View (< sm) */}
                    <div className="sm:hidden divide-y">
                        {showLoadingRows ? (
                            Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="p-4 space-y-3 bg-card animate-pulse">
                                    <div className="flex items-start justify-between gap-2.5">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <Skeleton className="h-9 w-9 rounded-lg" />
                                            <div className="space-y-1.5">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-16" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-5 w-16 rounded-full" />
                                    </div>
                                    <Skeleton className="h-7 w-full rounded-md" />
                                </div>
                            ))
                        ) : organizationInvitations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 space-y-2.5 text-center">
                                <div className="p-3 bg-muted/70 rounded-full">
                                    <Inbox className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <h2 className="text-sm font-semibold text-foreground">No Invitations Sent</h2>
                                <p className="text-xs text-muted-foreground max-w-xs">
                                    Your organization has not dispatched any invitations yet.
                                </p>
                            </div>
                        ) : (
                            organizationInvitations.map((inv) => (
                                <OrganizationInvitationsCard
                                    key={getEntityId(inv)}
                                    invitation={inv}
                                    onRevoke={handleRevoke}
                                    isUpdating={isUpdating}
                                    isOwner={isOwner}
                                />
                            ))
                        )}
                    </div>

                    {/* Desktop Table View (>= sm) */}
                    <div className="hidden sm:block">
                        <Table className="w-full table-fixed">
                            <colgroup>
                                <col className="w-[30%]" />
                                <col className="w-[22%]" />
                                <col className="w-[14%]" />
                                <col className="hidden md:table-column w-[18%]" />
                                <col className="w-[16%]" />
                            </colgroup>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b bg-muted/25">
                                    <TableHead className="py-3.5 pl-6 text-xs font-semibold text-muted-foreground">
                                        Candidate / Email
                                    </TableHead>
                                    <TableHead className="py-3.5 text-xs font-semibold text-muted-foreground">
                                        Sent By
                                    </TableHead>
                                    <TableHead className="py-3.5 text-center text-xs font-semibold text-muted-foreground">
                                        Status
                                    </TableHead>
                                    <TableHead className="py-3.5 hidden md:table-cell text-xs font-semibold text-muted-foreground">
                                        Expires
                                    </TableHead>
                                    <TableHead className="py-3.5 pr-6 text-right text-xs font-semibold text-muted-foreground">
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {showLoadingRows ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <TableRow key={index} className="border-b">
                                            <TableCell className="py-4 pl-6">
                                                <div className="flex items-center gap-3.5">
                                                    <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                                                    <div className="space-y-1.5 min-w-0">
                                                        <Skeleton className="h-3.5 w-36" />
                                                        <Skeleton className="h-2.5 w-20" />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="space-y-1.5">
                                                    <Skeleton className="h-3 w-24" />
                                                    <Skeleton className="h-2.5 w-32" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 text-center">
                                                <div className="flex justify-center">
                                                    <Skeleton className="h-5 w-18 rounded-full" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 hidden md:table-cell">
                                                <div className="space-y-1.5">
                                                    <Skeleton className="h-3 w-24" />
                                                    <Skeleton className="h-2.5 w-14" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 pr-6 text-right">
                                                <div className="flex justify-end">
                                                    <Skeleton className="h-8 w-20 rounded-lg" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : organizationInvitations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-16 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-2.5">
                                                <div className="p-3 bg-muted/70 rounded-full border border-border/50">
                                                    <Inbox className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <h2 className="text-sm font-semibold text-foreground">
                                                    No Invitations Sent
                                                </h2>
                                                <p className="text-xs text-muted-foreground max-w-sm">
                                                    Your organization has not dispatched any invitations yet.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    organizationInvitations.map((inv) => (
                                        <OrganizationInvitationsRow
                                            key={getEntityId(inv)}
                                            invitation={inv}
                                            onRevoke={handleRevoke}
                                            isUpdating={isUpdating}
                                            isOwner={isOwner}
                                        />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}