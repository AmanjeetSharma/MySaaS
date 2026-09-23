import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMemberStore } from "@/stores/memberStore";
import { useOrganizationStore } from "@/stores/organizationStore";
import { useUserStore } from "@/stores/userStore";
import { checkIsOwner, getEntityId } from "./helpers/member.helper.js";
import { MemberCard } from "./components/MemberCard";
import { MemberDetailsModal } from "./components/MemberDetailsModal";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UserPlus,
  Mail,
  Inbox,
  Loader2,
  Building2,
  RotateCw,
  Search,
  Users,
  ArrowLeft,
  X,
} from "lucide-react";

export default function Members() {
  const navigate = useNavigate();

  const [inviteEmail, setInviteEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { userProfile, getUserProfile, isLoading: isUserLoading } = useUserStore();
  const { currentOrganization, getOrganizations, isLoading: isOrgLoading } = useOrganizationStore();
  const {
    members = [],
    memberInfo,
    isLoading: isMembersLoading,
    isUpdating,
    fetchMembers,
    fetchMemberInfo,
    clearMemberInfo,
    inviteMember,
    removeMember,
  } = useMemberStore();

  const activeOrgId = getEntityId(userProfile?.activeOrganization);
  const currentOrgId = getEntityId(currentOrganization) || activeOrgId;
  const currentUserId = getEntityId(userProfile);
  const hasNoActiveOrganization = Boolean(userProfile) && !activeOrgId;

  const isOwner = useMemo(
    () => checkIsOwner(currentOrganization, userProfile),
    [currentOrganization, userProfile]
  );

  useEffect(() => {
    if (!userProfile) getUserProfile();
  }, []);

  useEffect(() => {
    if (userProfile && !currentOrganization && activeOrgId) {
      getOrganizations(activeOrgId);
    }
  }, [userProfile, activeOrgId]);

  useEffect(() => {
    if (currentOrgId) {
      fetchMembers(currentOrgId);
    }
  }, [currentOrgId]);

  const handleRefresh = async () => {
    if (isRefreshing || !currentOrgId) return;
    setIsRefreshing(true);
    try {
      await fetchMembers(currentOrgId);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail || !currentOrgId) return;
    try {
      await inviteMember(currentOrgId, inviteEmail);
      setInviteEmail("");
      setIsInviteOpen(false);
    } catch {
      // Handled in store
    }
  };

  const handleOpenDetails = async (memberId) => {
    setIsDetailsOpen(true);
    setIsDetailsLoading(true);
    try {
      await fetchMemberInfo(currentOrgId, memberId);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleCloseDetails = (open) => {
    setIsDetailsOpen(open);
    if (!open) clearMemberInfo();
  };

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const query = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.name?.toLowerCase().includes(query) ||
        m.email?.toLowerCase().includes(query) ||
        m.role?.toLowerCase().includes(query)
    );
  }, [members, searchQuery]);

  const showLoadingCards = (isMembersLoading && members.length === 0) || isRefreshing;

  if ((isOrgLoading || isUserLoading) && !currentOrganization) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <p className="text-sm font-semibold uppercase tracking-widest text-subtle-foreground/60 animate-pulse">
          Synchronizing Workspace...
        </p>
      </div>
    );
  }

  if (hasNoActiveOrganization && !currentOrganization) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center min-h-[380px] border border-border/80 rounded-2xl bg-card/60 text-center p-8 space-y-4">
          <div className="p-3.5 bg-muted rounded-full">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">No Active Organization</h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
            You must select or accept an invite to an active workspace to manage members.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/my-invitations")}
            className="rounded-xl cursor-pointer"
          >
            View My Invitations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 transition-all duration-300">
        {/* Back Navigation */}
        <div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground -ml-2 h-8 gap-1.5 cursor-pointer text-xs sm:text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Header & Action Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5 sm:pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Members
              </h1>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={showLoadingCards || isUpdating}
                    className="h-8 w-8 rounded-xl border border-border/80 bg-card/80 hover:bg-accent hover:border-border text-muted-foreground hover:text-foreground shadow-2xs active:scale-95 transition-all cursor-pointer"
                  >
                    <RotateCw
                      className={`h-3.5 w-3.5 ${showLoadingCards ? "animate-spin text-primary" : ""
                        }`}
                    />
                    <span className="sr-only">Refresh members</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs font-medium">
                  Refresh members
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Manage team access, permissions, and roles for {currentOrganization?.name || "this workspace"}.
            </p>
          </div>

          {/* Action buttons toolbar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate("/my-invitations")}
              className="h-9 px-3 sm:px-3.5 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer rounded-xl bg-card/80 hover:bg-accent/40 active:scale-[0.98] border border-border/80 shadow-2xs"
            >
              <Inbox className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">My Invitations</span>
            </Button>

            {isOwner && currentOrgId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate(`/organizations/${currentOrgId}/members/invitations`)}
                className="h-9 px-3 sm:px-3.5 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer rounded-xl bg-card/80 hover:bg-accent/40 active:scale-[0.98] border border-border/80 shadow-2xs"
              >
                <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">Organization Invites</span>
              </Button>
            )}

            {isOwner && (
              <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 px-3.5 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer rounded-xl shadow-2xs active:scale-[0.98] transition-all"
                  >
                    <UserPlus className="h-3.5 w-3.5 shrink-0" />
                    <span>Invite Member</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-2xl [&>button]:cursor-pointer">
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
                        className="rounded-xl"
                      />
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsInviteOpen(false)}
                        className="rounded-xl cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isUpdating || !inviteEmail}
                        className="rounded-xl cursor-pointer"
                      >
                        {isUpdating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Send Invitation
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Controls Toolbar: Search & Member Stats */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search members by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-9.5 pr-8 rounded-xl border-border/80 bg-card/60 focus-visible:ring-1 text-xs sm:text-sm placeholder:text-muted-foreground/70"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                aria-label="Clear search query"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground self-start sm:self-auto shrink-0">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border/80 bg-card/60 shadow-2xs font-medium">
              <Users className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>
                {searchQuery ? (
                  <>
                    Showing <span className="font-semibold text-foreground">{filteredMembers.length}</span> of {members.length} members
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-foreground">{members.length}</span> {members.length === 1 ? "Active Member" : "Active Members"}
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Grid of Members: 1 column on mobile, 2 on tablet, 3 on desktop */}
        {showLoadingCards ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="p-3.5 sm:p-4.5 rounded-xl border border-border/70 bg-card/40 flex items-center gap-3 sm:gap-3.5 animate-pulse"
              >
                <Skeleton className="h-11 w-11 sm:h-12 sm:w-12 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <Skeleton className="h-4 w-28 sm:w-36" />
                  <Skeleton className="h-3 w-36 sm:w-48" />
                  <Skeleton className="h-3.5 w-16 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 sm:p-12 border border-dashed border-border/80 rounded-2xl bg-card/40 text-center space-y-3">
            <div className="p-3 bg-muted rounded-full">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {searchQuery ? "No members match your search" : "No members found"}
              </p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {searchQuery
                  ? `We couldn't find any members matching "${searchQuery}". Try a different name, email, or role.`
                  : "No members have been added to this workspace yet."}
              </p>
            </div>
            {searchQuery ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="h-8 rounded-lg text-xs font-medium cursor-pointer"
              >
                Clear Search
              </Button>
            ) : isOwner ? (
              <Button
                type="button"
                size="sm"
                onClick={() => setIsInviteOpen(true)}
                className="h-8 rounded-lg text-xs font-medium cursor-pointer gap-1.5"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Invite First Member
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {filteredMembers.map((member) => (
              <MemberCard
                key={getEntityId(member)}
                member={member}
                isOwner={isOwner}
                currentUserId={currentUserId}
                onViewDetails={handleOpenDetails}
                onRemoveMember={(id) => removeMember(currentOrgId, id)}
                isUpdating={isUpdating}
              />
            ))}
          </div>
        )}

        {/* Discord-Style Member Details Modal */}
        <MemberDetailsModal
          isOpen={isDetailsOpen}
          onOpenChange={handleCloseDetails}
          memberInfo={memberInfo}
          isLoading={isDetailsLoading}
        />
      </div>
    </TooltipProvider>
  );
}