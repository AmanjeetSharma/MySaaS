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
import { UserPlus, Users, Mail, Inbox, Loader2 } from "lucide-react";

export default function Members() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const { userProfile } = useUserStore();
  const { currentOrganization } = useOrganizationStore();
  const {
    members,
    myInvitations,
    organizationInvitations,
    isLoading,
    isUpdating,
    fetchMembers,
    fetchOrganizationInvitations,
    fetchMyInvitations,
    inviteMember,
    acceptInvitation,
    removeMember,
    leaveOrganization,
  } = useMemberStore();

  const orgId = getEntityId(currentOrganization);
  const currentUserId = getEntityId(userProfile);
  const isOwner = useMemo(() => checkIsOwner(currentOrganization, userProfile), [currentOrganization, userProfile]);

  useEffect(() => {
    if (orgId) {
      fetchMembers(orgId);
      if (isOwner) {
        fetchOrganizationInvitations(orgId);
      }
    }
    fetchMyInvitations();
  }, [orgId, isOwner]);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail || !orgId) return;
    try {
      await inviteMember(orgId, inviteEmail);
      setInviteEmail("");
      setIsInviteOpen(false);
      fetchOrganizationInvitations(orgId);
    } catch {
      // Handled via toast in store
    }
  };

  const handleAcceptInvite = async (invitationId) => {
    await acceptInvitation(invitationId);
    if (orgId) fetchMembers(orgId);
  };

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
                    Send an invitation link to an email address to join {currentOrganization?.name || "the organization"}.
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
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
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

        {/* Tab 1: Organization Members */}
        <TabsContent value="members">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Team Members</CardTitle>
              <CardDescription>
                Active users with access to {currentOrganization?.name || "this workspace"}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <MemberTable
                  members={members}
                  isOwner={isOwner}
                  currentUserId={currentUserId}
                  onRemoveMember={(id) => removeMember(orgId, id)}
                  onLeaveOrg={() => leaveOrganization(orgId, currentUserId)}
                  isUpdating={isUpdating}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: User's Received Invitations */}
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

        {/* Tab 3: Organization Sent Invitations (Owners Only) */}
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