import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEntityId, formatExpiryDetails, formatDateTime } from "../helpers/member.helper.js";
import {
    Check,
    X,
    Loader2,
    Building2,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Mail,
    Shield,
} from "lucide-react";

/* =========================================================
    HELPER: Status Badge Component (Used in both Mobile & Desktop)
========================================================= */
const StatusBadge = ({ status, size = "default" }) => {
    const isSmall = size === "small";
    const badgeClasses = isSmall
        ? "text-[10px] px-2 py-0.5"
        : "text-xs px-2.5 py-0.5";
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

    // Fallback for "expired" or any other non-active state
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

/* =========================================================
    1. MOBILE CARD VIEW (< sm)
========================================================= */
export const MyInvitationsCard = ({
    invitation,
    onAccept,
    onDecline,
    isUpdating,
}) => {
    const invId = getEntityId(invitation);
    const isPending = invitation.status === "pending";
    const isAccepted = invitation.status === "accepted";
    const isDeclined = invitation.status === "declined";
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

/* =========================================================
    2. DESKTOP TABLE ROW VIEW (>= sm)
========================================================= */
export const MyInvitationsRow = ({
    invitation,
    onAccept,
    onDecline,
    isUpdating,
}) => {
    const invId = getEntityId(invitation);
    const isPending = invitation.status === "pending";
    const isAccepted = invitation.status === "accepted";
    const isDeclined = invitation.status === "declined";
    const orgName = invitation.organization?.name || "Workspace";
    const expiry = formatExpiryDetails(invitation.expiresAt);

    return (
        <TableRow className="hover:bg-muted/40 transition-colors border-b">
            {/* 1. Organization & Role */}
            <TableCell className="py-4 pl-6 align-middle">
                <div className="flex items-center gap-3.5">
                    <div className="h-9 w-9 rounded-lg border border-border/70 bg-muted/50 flex items-center justify-center shrink-0">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                        <span className="font-semibold text-sm text-foreground truncate block leading-none">
                            {orgName}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize mt-1.5 inline-block">
                            Role: <span className="font-medium text-foreground/80">{invitation.role}</span>
                        </span>
                    </div>
                </div>
            </TableCell>

            {/* 2. Inviter Info */}
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

            {/* 3. Status Badge (Centered) */}
            <TableCell className="py-4 text-center align-middle">
                <StatusBadge status={invitation.status} />
            </TableCell>

            {/* 4. Expiration / Timeline */}
            <TableCell className="py-4 hidden md:table-cell align-middle">
                {isAccepted ? (
                    <span className="text-xs text-muted-foreground">Completed</span>
                ) : isDeclined ? (
                    <span className="text-xs text-muted-foreground">Invitation Declined</span>
                ) : isPending ? (
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                            {expiry.formatted}
                        </span>
                        <span
                            className={`text-[11px] mt-0.5 font-medium ${expiry.isExpired ? "text-destructive" : "text-amber-600 dark:text-amber-400"
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
            {/* 5. Actions / Completed Timestamp */}
            <TableCell className="py-4 pr-6 text-right align-middle">
                {isPending ? (
                    <div className="flex items-center justify-end gap-2.5 shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isUpdating}
                            onClick={() => onDecline(invId)}
                            className="h-8 px-3.5 text-xs font-medium cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 rounded-lg shrink-0"
                        >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Decline
                        </Button>
                        <Button
                            size="sm"
                            disabled={isUpdating}
                            onClick={() => onAccept(invId)}
                            className="h-8 px-3.5 text-xs font-medium cursor-pointer rounded-lg shadow-xs shrink-0"
                        >
                            {isUpdating ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                            ) : (
                                <Check className="h-3.5 w-3.5 mr-1" />
                            )}
                            Accept
                        </Button>
                    </div>
                ) : isAccepted ? (
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground font-medium">Joined At</span>
                        <span className="text-xs font-medium text-foreground/80 mt-0.5">
                            {invitation.acceptedAt ? formatDateTime(invitation.acceptedAt) : "—"}
                        </span>
                    </div>
                ) : isDeclined ? (
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-rose-500 font-medium">Declined At</span>
                        <span className="text-xs font-medium text-foreground/80 mt-0.5">
                            {formatDateTime(invitation.declinedAt || invitation.updatedAt)}
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
    );
};