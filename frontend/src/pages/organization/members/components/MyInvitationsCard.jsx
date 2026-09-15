import React from "react";
import { Button } from "@/components/ui/button";
import { getEntityId, formatExpiryDetails, formatDateTime } from "../helpers/member.helper.js";
import { StatusBadge } from "./MyInvitationsRow";
import {
    Check,
    X,
    Loader2,
    Building2,
    Clock,
    Mail,
    Shield,
} from "lucide-react";

export const MyInvitationsCard = ({
    invitation,
    onAccept,
    onDecline,
    isUpdating,
}) => {
    const invId = invitation.id || getEntityId(invitation);
    const isPending = invitation.status === "pending";
    const isAccepted = invitation.status === "accepted";
    const isDeclined = invitation.status === "declined";
    const isRevoked = invitation.status === "revoked";
    const orgName = invitation.organization?.name || "Workspace";
    const expiry = formatExpiryDetails(invitation.expiresAt);

    return (
        <div className="p-4 space-y-3 bg-card">
            {/* Top: Icon + Name + Role + Status Badge */}
            <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 rounded-lg border border-border/70 bg-muted/50 flex items-center justify-center shrink-0">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-semibold text-sm text-foreground truncate">
                            {orgName}
                        </h4>
                        <span className="text-[11px] text-muted-foreground capitalize flex items-center gap-1 mt-0.5">
                            <Shield className="h-3 w-3 text-muted-foreground/70" />
                            Role: <span className="font-medium text-foreground/80">{invitation.role}</span>
                        </span>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="shrink-0">
                    <StatusBadge status={invitation.status} size="small" />
                </div>
            </div>

            {/* Middle Metadata: Clean Contextual Information */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-muted/30 px-2.5 py-2 rounded-md border border-border/40">
                <div className="flex items-center gap-1.5 truncate max-w-[48%]">
                    <Mail className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                    <span className="truncate">{invitation.inviter || invitation.inviterEmail}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0 font-medium">
                    <Clock className="h-3 w-3 text-muted-foreground/70" />
                    {isAccepted ? (
                        <span className="text-foreground/80">
                            Joined at: {formatDateTime(invitation.acceptedAt)}
                        </span>
                    ) : isDeclined ? (
                        <span className="text-rose-600 dark:text-rose-400">
                            Declined at: {formatDateTime(invitation.declinedAt || invitation.updatedAt)}
                        </span>
                    ) : isRevoked ? (
                        <span className="text-muted-foreground">
                            Revoked at: {formatDateTime(invitation.revokedAt || invitation.updatedAt)}
                        </span>
                    ) : isPending ? (
                        <span className="text-foreground/80 flex items-center gap-1">
                            <span>Expires at:</span>
                            <span>{expiry.formatted}</span>
                            {expiry.relative && (
                                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                                    ({expiry.relative})
                                </span>
                            )}
                        </span>
                    ) : (
                        <span className="text-destructive">
                            Expired on {expiry.formatted}
                        </span>
                    )}
                </div>
            </div>

            {/* Action Buttons (Pending Only) */}
            {isPending && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => onDecline(invId)}
                        className="h-9 text-xs font-medium cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                    >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Decline
                    </Button>
                    <Button
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => onAccept(invId)}
                        className="h-9 text-xs font-medium cursor-pointer shadow-xs"
                    >
                        {isUpdating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                        ) : (
                            <Check className="h-3.5 w-3.5 mr-1" />
                        )}
                        Accept
                    </Button>
                </div>
            )}
        </div>
    );
};

export default MyInvitationsCard;