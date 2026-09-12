import React, { useState } from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials, formatDate } from "../helpers/member.helper.js";
import {
    Shield,
    User,
    Mail,
    Phone,
    Globe,
    Calendar,
    Copy,
    Check,
    ExternalLink,
} from "lucide-react";

export const MemberDetailsModal = ({ isOpen, onOpenChange, memberInfo, isLoading }) => {
    const [isAvatarPreviewOpen, setIsAvatarPreviewOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const isOwner = memberInfo?.role === "owner";
    const userId = memberInfo?.id || memberInfo?._id || "";

    const handleCopyId = () => {
        if (!userId) return;
        navigator.clipboard.writeText(userId);
        setCopied(true);
        toast.success("User Id copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            {/* Discord-Style Member Details Modal */}
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                {/* 1. Main Member Details Modal */}
                <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md p-0 overflow-hidden border border-border/80 bg-card shadow-2xl rounded-2xl [&>button]:cursor-pointer">                    <DialogHeader className="sr-only">
                    <DialogTitle>Member Profile</DialogTitle>
                    <DialogDescription>
                        Detailed profile and account metadata for this workspace member.
                    </DialogDescription>
                </DialogHeader>

                    {isLoading || !memberInfo ? (
                        <div className="relative">
                            <Skeleton className="h-24 sm:h-28 w-full rounded-none" />
                            <div className="px-5 sm:px-6 -mt-10 sm:-mt-12 flex items-end">
                                <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 border-card ring-2 ring-border/40" />
                            </div>
                            <div className="p-5 sm:p-6 pt-3 space-y-4">
                                <div className="space-y-1.5">
                                    <Skeleton className="h-6 w-36" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                                <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 space-y-3">
                                    <Skeleton className="h-3 w-28" />
                                    <div className="space-y-2.5 pt-1">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                </div>
                                <Skeleton className="h-8 w-full rounded-lg" />
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Discord Banner */}
                            <div className="h-24 sm:h-28 w-full bg-linear-to-r from-primary/30 via-accent/40 to-primary/20 relative">
                                <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] dark:bg-[radial-gradient(#000_1px,transparent_1px)] opacity-20 [background-size:12px_12px]" />
                            </div>

                            {/* Large Avatar with Clickable View Overlay */}
                            <div className="px-5 sm:px-6 -mt-10 sm:-mt-12 flex items-end">
                                <button
                                    type="button"
                                    onClick={() => memberInfo.avatar && setIsAvatarPreviewOpen(true)}
                                    disabled={!memberInfo.avatar}
                                    className="relative group rounded-full p-0 border-0 outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer disabled:cursor-default"
                                >
                                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 border-card shadow-xl bg-muted ring-2 ring-border/40 transition-transform duration-200 group-hover:scale-105">
                                        <AvatarImage
                                            src={memberInfo.avatar}
                                            alt={memberInfo.name}
                                            className="object-cover"
                                        />
                                        <AvatarFallback className="text-xl sm:text-2xl font-bold bg-muted text-foreground">
                                            {getInitials(memberInfo.name)}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Icon hover overlay on avatar circle only */}
                                    {memberInfo.avatar && (
                                        <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 cursor-pointer">
                                            <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5" />
                                            <span className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider">View</span>
                                        </div>
                                    )}
                                </button>
                            </div>

                            {/* Profile Body */}
                            <div className="p-5 sm:p-6 pt-3 space-y-4">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                                            {memberInfo.name}
                                        </h3>
                                        <Badge
                                            variant={isOwner ? "default" : "secondary"}
                                            className={`capitalize text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-0.5 font-medium rounded-full inline-flex items-center gap-1.5 ${isOwner
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-foreground border border-border"
                                                }`}
                                        >
                                            {isOwner ? (
                                                <Shield className="h-3 w-3" />
                                            ) : (
                                                <User className="h-3 w-3 text-muted-foreground" />
                                            )}
                                            {memberInfo.role}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
                                        {memberInfo.email}
                                    </p>
                                </div>

                                {/* Metadata Card */}
                                <div className="rounded-xl border border-border/60 bg-muted/30 p-3 sm:p-3.5 space-y-2.5 sm:space-y-3">
                                    <div className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                                        Member Information
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 sm:gap-2.5 text-xs">
                                        <div className="flex items-center justify-between py-0.5 sm:py-1 border-b border-border/40 gap-2">
                                            <span className="text-muted-foreground flex items-center gap-1.5 sm:gap-2 shrink-0 text-[11px] sm:text-xs">
                                                <Mail className="h-3.5 w-3.5" /> Email
                                            </span>
                                            <span className="font-medium text-foreground truncate text-[11px] sm:text-xs">{memberInfo.email}</span>
                                        </div>

                                        <div className="flex items-center justify-between py-0.5 sm:py-1 border-b border-border/40 gap-2">
                                            <span className="text-muted-foreground flex items-center gap-1.5 sm:gap-2 shrink-0 text-[11px] sm:text-xs">
                                                <Phone className="h-3.5 w-3.5" /> Phone
                                            </span>
                                            <span className="font-medium text-foreground truncate text-[11px] sm:text-xs">
                                                {memberInfo.phone || "Not provided"}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between py-0.5 sm:py-1 border-b border-border/40 gap-2">
                                            <span className="text-muted-foreground flex items-center gap-1.5 sm:gap-2 shrink-0 text-[11px] sm:text-xs">
                                                <Globe className="h-3.5 w-3.5" /> Timezone
                                            </span>
                                            <span className="font-medium text-foreground truncate text-[11px] sm:text-xs">
                                                {memberInfo.timezone || "Device Default"}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between py-0.5 sm:py-1 border-b border-border/40 gap-2">
                                            <span className="text-muted-foreground flex items-center gap-1.5 sm:gap-2 shrink-0 text-[11px] sm:text-xs">
                                                <Calendar className="h-3.5 w-3.5" /> Joined Workspace
                                            </span>
                                            <span className="font-medium text-foreground truncate text-[11px] sm:text-xs">
                                                {memberInfo.joinedAt ? formatDate(memberInfo.joinedAt) : "—"}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between py-0.5 sm:py-1 gap-2">
                                            <span className="text-muted-foreground flex items-center gap-1.5 sm:gap-2 shrink-0 text-[11px] sm:text-xs">
                                                <Calendar className="h-3.5 w-3.5" /> Account Created
                                            </span>
                                            <span className="font-medium text-foreground truncate text-[11px] sm:text-xs">
                                                {memberInfo.createdAt ? formatDate(memberInfo.createdAt) : "—"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Full User ID with Copy & Sonner Toast */}
                                {userId && (
                                    <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground bg-muted/20 px-3 py-2 rounded-lg border border-border/40">
                                        <span className="font-mono truncate select-all">
                                            {userId}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleCopyId}
                                            className="flex items-center gap-1 shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-medium ml-2"
                                        >
                                            {copied ? (
                                                <>
                                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                    <span className="text-emerald-500 font-semibold">Copied to clipboard!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-3.5 w-3.5" />
                                                    <span>Copy ID</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Compact & Responsive Avatar Preview Modal */}
            <Dialog open={isAvatarPreviewOpen} onOpenChange={setIsAvatarPreviewOpen}>
                <DialogContent className="w-[calc(100vw-2.5rem)] max-w-[300px] sm:max-w-[320px] p-4 sm:p-5 bg-card/95 backdrop-blur-xl border border-border/80 rounded-3xl flex flex-col items-center justify-center gap-3 sm:gap-4 shadow-2xl [&>button]:cursor-pointer [&>button]:rounded-full [&>button]:opacity-80 hover:[&>button]:opacity-100">
                    <DialogHeader className="w-full text-center space-y-0.5 sm:space-y-1">
                        <DialogTitle className="text-sm sm:text-base font-bold tracking-tight text-foreground truncate px-2">
                            {memberInfo?.name}
                        </DialogTitle>
                        <DialogDescription className="text-[11px] text-muted-foreground font-mono truncate px-2">
                            {memberInfo?.email}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Circular Avatar Container */}
                    <div className="relative group p-1">
                        <div className="absolute -inset-1 rounded-full bg-linear-to-tr from-primary/30 to-accent/30 blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative h-44 w-44 min-[380px]:h-48 min-[380px]:w-48 sm:h-56 sm:w-56 rounded-full overflow-hidden border-4 border-card ring-2 ring-border/80 shadow-2xl bg-muted shrink-0">
                            <img
                                src={memberInfo?.avatar}
                                alt={memberInfo?.name}
                                className="h-full w-full object-cover select-none"
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};