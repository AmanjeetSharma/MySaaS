import React, { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { getEntityId, formatExpiryDetails, formatDateTime } from "../helpers/member.helper.js";
import {
    X,
    Loader2,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    AlertTriangle,
    Ban,
    Mail,
} from "lucide-react";

export const StatusBadge = ({ status, size = "default" }) => {
    const isSmall = size === "small";
    const badgeClasses = isSmall ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-0.5";
    const iconSize = isSmall ? "h-2.5 w-2.5" : "h-3 w-3";

    if (status === "accepted") {
        return (
            <Badge
                variant="outline"
                className={`bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium capitalize inline-flex items-center gap-1.5 ${badgeClasses}`}
            >
                <CheckCircle2 className={iconSize} />
                Accepted
            </Badge>
        );
    }

    if (status === "declined") {
        return (
            <Badge
                variant="outline"
                className={`bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-medium capitalize inline-flex items-center gap-1.5 ${badgeClasses}`}
            >
                <XCircle className={iconSize} />
                Declined
            </Badge>
        );
    }

    if (status === "revoked") {
        return (
            <Badge
                variant="outline"
                className={`bg-muted/80 text-muted-foreground border-border font-medium capitalize inline-flex items-center gap-1.5 ${badgeClasses}`}
            >
                <Ban className={iconSize} />
                Revoked
            </Badge>
        );
    }

    if (status === "pending") {
        return (
            <Badge
                variant="outline"
                className={`bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium capitalize inline-flex items-center gap-1.5 ${badgeClasses}`}
            >
                <Clock className={iconSize} />
                Pending
            </Badge>
        );
    }

    return (
        <Badge
            variant="outline"
            className={`bg-destructive/10 text-destructive border-destructive/20 font-medium capitalize inline-flex items-center gap-1.5 ${badgeClasses}`}
        >
            <AlertCircle className={iconSize} />
            Expired
        </Badge>
    );
};

export const OrganizationInvitationsRow = ({
    invitation,
    onRevoke,
    isUpdating,
    isOwner,
}) => {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const invId = invitation.id || getEntityId(invitation);
    const isPending = invitation.status === "pending";
    const isAccepted = invitation.status === "accepted";
    const isDeclined = invitation.status === "declined";
    const isRevoked = invitation.status === "revoked";
    const expiry = formatExpiryDetails(invitation.expiresAt);

    const handleConfirmRevoke = async () => {
        if (onRevoke) {
            await onRevoke(invId);
            setIsConfirmOpen(false);
        }
    };

    return (
        <>
            <TableRow className="hover:bg-muted/40 transition-colors border-b">
                {/* 1. Recipient & Role */}
                <TableCell className="py-4 pl-6 align-middle">
                    <div className="flex items-center gap-3.5">
                        <div className="h-9 w-9 rounded-lg border border-border/70 bg-muted/50 flex items-center justify-center shrink-0">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                            <span className="font-semibold text-sm text-foreground truncate block leading-none">
                                {invitation.email}
                            </span>
                            <span className="text-xs text-muted-foreground capitalize mt-1.5 inline-block">
                                Role: <span className="font-medium text-foreground/80">{invitation.role}</span>
                            </span>
                        </div>
                    </div>
                </TableCell>

                {/* 2. Sender / Inviter */}
                <TableCell className="py-4 align-middle">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-foreground truncate">
                            {invitation.inviter || "Workspace Admin"}
                        </span>
                        <span className="text-xs text-muted-foreground truncate mt-0.5">
                            {invitation.inviterEmail || "—"}
                        </span>
                    </div>
                </TableCell>

                {/* 3. Status Badge */}
                <TableCell className="py-4 text-center align-middle">
                    <StatusBadge status={invitation.status} />
                </TableCell>

                {/* 4. Expiration / Relative Time */}
                <TableCell className="py-4 hidden md:table-cell align-middle">
                    {isAccepted ? (
                        <span className="text-xs text-muted-foreground">Joined Workspace</span>
                    ) : isDeclined ? (
                        <span className="text-xs text-muted-foreground">Candidate Declined</span>
                    ) : isRevoked ? (
                        <span className="text-xs text-muted-foreground">Invitation Revoked</span>
                    ) : isPending ? (
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                                {expiry.formatted}
                            </span>
                            <span
                                className={`text-[11px] mt-0.5 font-medium ${
                                    expiry.isExpired ? "text-destructive" : "text-amber-600 dark:text-amber-400"
                                }`}
                            >
                                {expiry.relative}
                            </span>
                        </div>
                    ) : (
                        <span className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Expired ({expiry.formatted})
                        </span>
                    )}
                </TableCell>

                {/* 5. Actions / Completed Timestamp */}
                <TableCell className="py-4 pr-6 text-right align-middle">
                    {isPending && isOwner ? (
                        <div className="flex items-center justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isUpdating}
                                onClick={() => setIsConfirmOpen(true)}
                                className="h-8 px-3 text-xs font-medium cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 rounded-lg"
                            >
                                <X className="h-3.5 w-3.5 mr-1.5" />
                                Revoke
                            </Button>
                        </div>
                    ) : isAccepted ? (
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-muted-foreground font-medium">Joined At</span>
                            <span className="text-xs font-medium text-foreground/80 mt-0.5">
                                {invitation.acceptedAt ? formatDateTime(invitation.acceptedAt) : formatDateTime(invitation.invitedAt)}
                            </span>
                        </div>
                    ) : isDeclined ? (
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-rose-500 font-medium">Declined At</span>
                            <span className="text-xs font-medium text-foreground/80 mt-0.5">
                                {formatDateTime(invitation.declinedAt || invitation.updatedAt)}
                            </span>
                        </div>
                    ) : isRevoked ? (
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-muted-foreground font-medium">Revoked At</span>
                            <span className="text-xs font-medium text-foreground/80 mt-0.5">
                                {formatDateTime(invitation.revokedAt || invitation.updatedAt)}
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-muted-foreground font-medium">Expired</span>
                            <span className="text-xs text-muted-foreground/70 mt-0.5">
                                {expiry.formatted}
                            </span>
                        </div>
                    )}
                </TableCell>
            </TableRow>

            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent
                    onClick={(e) => e.stopPropagation()}
                    className="sm:max-w-[400px] rounded-2xl p-6 gap-4 border border-border/80 bg-card/95 backdrop-blur-xl [&>button]:cursor-pointer [&>button]:rounded-full [&>button]:opacity-70 hover:[&>button]:opacity-100"
                >
                    <DialogHeader className="space-y-2.5 text-left">
                        <div className="h-9 w-9 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                            <AlertTriangle className="h-4.5 w-4.5" />
                        </div>
                        <DialogTitle className="text-base font-semibold text-foreground tracking-tight">
                            Revoke Invitation
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                            Are you sure you want to revoke the invitation sent to{" "}
                            <span className="font-semibold text-foreground">{invitation.email}</span>? The link will immediately expire.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 pt-2 flex-row justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isUpdating}
                            onClick={() => setIsConfirmOpen(false)}
                            className="rounded-xl text-xs cursor-pointer border-border/80"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={isUpdating}
                            onClick={handleConfirmRevoke}
                            className="rounded-xl text-xs font-medium shadow-xs cursor-pointer"
                        >
                            {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                            Revoke
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
export default OrganizationInvitationsRow;