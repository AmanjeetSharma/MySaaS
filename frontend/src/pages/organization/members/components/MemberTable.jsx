import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEntityId, isSameId, formatDate } from "../helpers/member.helper.js";
import { Shield, User, UserMinus, LogOut, Loader2 } from "lucide-react";

export const MemberTable = ({
    members = [],
    isOwner,
    currentUserId,
    onRemoveMember,
    onLeaveOrg,
    isUpdating,
}) => {
    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                No members found in this organization.
                            </TableCell>
                        </TableRow>
                    ) : (
                        members.map((member) => {
                            const memberId = getEntityId(member);
                            const isSelf = isSameId(memberId, currentUserId);
                            const memberIsOwner = member.role === "owner";

                            return (
                                <TableRow key={memberId}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground flex items-center gap-1.5">
                                                {member.name}
                                                {isSelf && (
                                                    <span className="text-xs text-muted-foreground font-normal">(You)</span>
                                                )}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{member.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={memberIsOwner ? "default" : "secondary"}
                                            className="capitalize inline-flex items-center gap-1"
                                        >
                                            {memberIsOwner ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                                            {member.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatDate(member.joinedAt)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {/* Owner removing a member */}
                                        {isOwner && !memberIsOwner && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={isUpdating}
                                                onClick={() => onRemoveMember(memberId)}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <UserMinus className="h-4 w-4 mr-1.5" />
                                                Remove
                                            </Button>
                                        )}

                                        {/* Member leaving organization (Owner can never leave) */}
                                        {!isOwner && isSelf && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={isUpdating}
                                                onClick={onLeaveOrg}
                                                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                                            >
                                                {isUpdating ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                                ) : (
                                                    <LogOut className="h-4 w-4 mr-1.5" />
                                                )}
                                                Leave
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
};