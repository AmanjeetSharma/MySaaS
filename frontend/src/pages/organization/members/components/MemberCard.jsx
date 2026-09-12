import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { getEntityId, isSameId, getInitials, formatDate } from "../helpers/member.helper.js";
import { MoreVertical, Shield, User, UserMinus, Loader2, AlertTriangle } from "lucide-react";

export const MemberCard = ({
    member,
    isOwner,
    currentUserId,
    onViewDetails,
    onRemoveMember,
    isUpdating,
}) => {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const memberId = getEntityId(member);
    const isSelf = isSameId(memberId, currentUserId);
    const memberIsOwner = member.role === "owner";
    const canRemove = isOwner && !memberIsOwner && !isSelf;

    const handleConfirmRemove = async () => {
        await onRemoveMember(memberId);
        setIsConfirmOpen(false);
    };

    return (
        <>
            <Card
                onClick={() => onViewDetails(memberId)}
                className="group relative border border-border/80 bg-card/60 hover:bg-card hover:border-primary/40 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer rounded-xl overflow-hidden"
            >
                <CardContent className="p-3.5 sm:p-5 flex flex-col sm:flex-row items-center sm:justify-between text-center sm:text-left gap-2 sm:gap-4 h-full relative">
                    {/* Left: Avatar + Details Container */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3.5 min-w-0 w-full">
                        {/* Avatar */}
                        <div className="relative shrink-0 mt-1 sm:mt-0">
                            <Avatar className="h-12 w-12 sm:h-12 sm:w-12 rounded-full border-2 border-border/80 group-hover:border-primary/50 transition-colors shadow-xs">
                                <AvatarImage src={member.avatar} alt={member.name} className="object-cover" />
                                <AvatarFallback className="font-semibold text-xs sm:text-sm bg-muted text-foreground">
                                    {getInitials(member.name)}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        {/* Details */}
                        <div className="min-w-0 w-full space-y-1">
                            <div className="flex items-center justify-center sm:justify-start gap-1 min-w-0">
                                <p className="font-semibold text-xs sm:text-sm text-foreground truncate group-hover:text-primary transition-colors leading-tight">
                                    {member.name}
                                </p>
                                {isSelf && (
                                    <span className="text-[9px] sm:text-[10px] bg-muted text-muted-foreground px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded-md font-medium shrink-0">
                                        You
                                    </span>
                                )}
                            </div>

                            <p className="text-[11px] sm:text-xs text-muted-foreground truncate font-mono">
                                {member.email}
                            </p>

                            <div className="flex items-center justify-center sm:justify-start gap-1.5 pt-0.5 flex-wrap">
                                <Badge
                                    variant={memberIsOwner ? "default" : "secondary"}
                                    className="capitalize text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0 h-4 sm:h-4.5 font-medium rounded-md inline-flex items-center gap-1"
                                >
                                    {memberIsOwner ? (
                                        <Shield className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                                    ) : (
                                        <User className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-muted-foreground" />
                                    )}
                                    {member.role}
                                </Badge>

                                {member.joinedAt && (
                                    <span className="text-[10px] sm:text-[11px] text-muted-foreground/70 truncate hidden sm:inline">
                                        Joined {formatDate(member.joinedAt)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: 3-Dot Actions (Anchored absolute top-right on mobile, flex centered on desktop) */}
                    {canRemove && (
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-2 right-2 sm:static sm:shrink-0"
                        >
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer"
                                    >
                                        <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        <span className="sr-only">Open options</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-auto min-w-[155px] p-1 rounded-xl">
                                    <DropdownMenuItem
                                        disabled={isUpdating}
                                        onClick={() => setIsConfirmOpen(true)}
                                        className="text-destructive focus:text-destructive focus:bg-destructive/10 hover:bg-destructive/10 cursor-pointer text-xs font-medium rounded-lg whitespace-nowrap flex items-center gap-2 px-2.5 py-2"
                                    >
                                        <UserMinus className="h-3.5 w-3.5 shrink-0" />
                                        <span>Remove Member</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent
                    onClick={(e) => e.stopPropagation()}
                    className="w-[calc(100vw-2.5rem)] max-w-[340px] sm:max-w-[380px] rounded-2xl p-4 sm:p-5 gap-4 shadow-xl border border-border/80 bg-card/95 backdrop-blur-xl [&>button]:cursor-pointer [&>button]:rounded-full [&>button]:opacity-70 hover:[&>button]:opacity-100"
                >
                    <DialogHeader className="space-y-2 text-left">
                        <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                            <AlertTriangle className="h-4 w-4" />
                        </div>
                        <DialogTitle className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
                            Remove Member
                        </DialogTitle>
                        <DialogDescription className="text-[11px] sm:text-xs text-muted-foreground leading-normal">
                            Are you sure you want to remove <span className="font-semibold text-foreground">{member.name}</span> from this workspace? They will lose all access immediately.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2 pt-1 flex-row justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isUpdating}
                            onClick={() => setIsConfirmOpen(false)}
                            className="h-8 rounded-lg text-xs font-medium cursor-pointer flex-1 sm:flex-none border-border/80"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={isUpdating}
                            onClick={handleConfirmRemove}
                            className="h-8 rounded-lg text-xs font-medium shadow-xs cursor-pointer flex-1 sm:flex-none"
                        >
                            {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                            Remove
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};