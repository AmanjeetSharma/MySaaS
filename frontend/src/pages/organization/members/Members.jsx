import React, { useEffect, useState, useMemo } from "react";
import { useMemberStore } from "@/stores/memberStore";
import { useOrganizationStore } from "@/stores/organizationStore";
import { useUserStore } from "@/stores/userStore";
import { checkIsOwner, getEntityId } from "./helpers/member.helper.js";
import { MemberTable } from "./components/MemberTable";
import { InvitationsView } from "./components/InvitationsView";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Users, Mail, Inbox, Loader2, Building2 } from "lucide-react";

export default function Members() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const { userProfile, getUserProfile } = useUserStore();
  const { currentOrganization, getOrganizations, isLoading: isOrgLoading } = useOrganizationStore();
  const {
    members,
    myInvitations,
    organizationInvitations,
    isLoading: isMemberLoading,
    isUpdating,
    fetchMembers,
    fetchOrganizationInvitations,
    fetchMyInvitations,
    inviteMember,
    acceptInvitation,
    removeMember,
    leaveOrganization,
  } = useMemberStore();

  const activeOrgId = getEntityId(userProfile?.activeOrganization);
  const currentOrgId = getEntityId(currentOrganization);
  const currentUserId = getEntityId(userProfile);
  const hasNoActiveOrganization = Boolean(userProfile) && !activeOrgId;

  const isOwner = useMemo(
    () => checkIsOwner(currentOrganization, userProfile),
    [currentOrganization, userProfile]
  );

  // 1. Initial hydration: ensure userProfile and orgs are loaded with activeOrgId
  useEffect(() => {
    if (!userProfile) {
      getUserProfile();
    }
    fetchMyInvitations();
  }, []);

  useEffect(() => {
    if (userProfile && !currentOrganization) {
      getOrganizations(activeOrgId);
    }
  }, [userProfile, activeOrgId]);

  // 2. Fetch member & org-invitation data when currentOrganization resolves
  useEffect(() => {
    if (currentOrgId) {
      fetchMembers(currentOrgId);
      if (isOwner) {
        fetchOrganizationInvitations(currentOrgId);
      }
    }
  }, [currentOrgId, isOwner]);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail || !currentOrgId) return;
    try {
      await inviteMember(currentOrgId, inviteEmail);
      setInviteEmail("");
      setIsInviteOpen(false);
      fetchOrganizationInvitations(currentOrgId);
    } catch {
      // Handled via toast in store
    }
  };

  const handleAcceptInvite = async (invitationId) => {
    await acceptInvitation(invitationId);
    if (currentOrgId) fetchMembers(currentOrgId);
  };

  // Loading state gate for store rehydration
  if (isOrgLoading && !currentOrganization) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Empty state when user is not attached to any active organization
  if (hasNoActiveOrganization && !currentOrganization) {
    return (
      <div className="container mx-auto p-6 max-w-4xl space-y-6">
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-card text-center space-y-3">
          <Building2 className="h-10 w-10 text-muted-foreground" />
          <h2 className="text-xl font-semibold">No Active Organization</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            You are not currently in an active workspace. Check your received invitations below or create a new organization.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Invitations</CardTitle>
            <CardDescription>Invitations sent to your email to join workspaces.</CardDescription>
          </CardHeader>
          <CardContent>
            <InvitationsView
              invitations={myInvitations}
              isOrgLevel={false}
              onAccept={handleAcceptInvite}
              isUpdating={isUpdating}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Members & Invitations</h1>
          <p className="text-sm text-muted-foreground">
            Manage organization members, send invitations, and view requests.
          </p>
        </div>

        {/* Action Button: Invite (Owners only) */}
        {isOwner && (
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button className="h-9">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleSendInvite}>
                <DialogHeader>
                  <DialogTitle>Invite New Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation link to join {currentOrganization?.name || "the organization"}.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="teammate@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUpdating || !inviteEmail}>
                    {isUpdating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Send Invitation
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="members" className="w-full space-y-4">
        <TabsList className={`grid w-full ${isOwner ? "grid-cols-3 max-w-[540px]" : "grid-cols-2 max-w-[360px]"}`}>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members ({members.length})
          </TabsTrigger>
          <TabsTrigger value="my-invitations" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            My Invites ({myInvitations.filter((i) => i.status === "pending").length})
          </TabsTrigger>
          {isOwner && (
            <TabsTrigger value="org-invitations" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Sent Invites ({organizationInvitations.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Team Members</CardTitle>
              <CardDescription>
                Active users in {currentOrganization?.name || "this workspace"}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isMemberLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <MemberTable
                  members={members}
                  isOwner={isOwner}
                  currentUserId={currentUserId}
                  onRemoveMember={(id) => removeMember(currentOrgId, id)}
                  onLeaveOrg={() => leaveOrganization(currentOrgId, currentUserId)}
                  isUpdating={isUpdating}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-invitations">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Your Invitations</CardTitle>
              <CardDescription>
                Invitations sent to your email to join other teams or workspaces.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvitationsView
                invitations={myInvitations}
                isOrgLevel={false}
                onAccept={handleAcceptInvite}
                isUpdating={isUpdating}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {isOwner && (
          <TabsContent value="org-invitations">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Sent Invitations</CardTitle>
                <CardDescription>
                  Pending and historical invitations dispatched for this organization.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InvitationsView
                  invitations={organizationInvitations}
                  isOrgLevel={true}
                  isUpdating={isUpdating}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}