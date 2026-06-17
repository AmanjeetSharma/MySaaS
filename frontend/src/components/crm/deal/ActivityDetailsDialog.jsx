import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, Pencil, Calendar, User, Building, Briefcase, FileText } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

import { ACTIVITY_TYPES, getActivityLabel, getActivityIcon } from "@/config/activityTypes.config";
import { useActivityStore } from "@/stores";

const ActivityDetailsDialog = ({ open, onOpenChange, activityId, initialMode = "view" }) => {
    const {
        selectedActivity,
        isLoadingActivityDetails,
        isUpdating,
        getActivityById,
        updateActivity,
        clearSelectedActivity
    } = useActivityStore();

    const [mode, setMode] = useState(initialMode);
    const [form, setForm] = useState({
        type: "note",
        customType: "",
        event: "",
        description: "",
    });

    useEffect(() => {
        if (open && activityId) {
            setMode(initialMode);
            getActivityById(activityId);
        }
        return () => {
            if (!open) clearSelectedActivity();
        };
    }, [open, activityId, initialMode]);

    useEffect(() => {
        if (selectedActivity) {
            setForm({
                type: selectedActivity.type || "note",
                customType: selectedActivity.customType || "",
                event: selectedActivity.event || "",
                description: selectedActivity.description || "",
            });
        }
    }, [selectedActivity, mode]);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                type: form.type,
                event: form.event.trim(),
                description: form.description.trim(),
            };
            if (form.type === "custom") {
                payload.customType = form.customType.trim();
            }
            await updateActivity(selectedActivity._id, payload);
            setMode("view");
        } catch (error) {
            console.error(error);
        }
    };

    const Icon = selectedActivity ? getActivityIcon(selectedActivity.type) : FileText;
    const activityLabel = selectedActivity
        ? selectedActivity.type === "custom" && selectedActivity.customType
            ? selectedActivity.customType
            : getActivityLabel(selectedActivity.type)
        : "";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-3xl p-0 gap-0 rounded-xl overflow-hidden shadow-xl border-border/50 bg-background flex flex-col max-h-[90vh]">

                {/* Global Loading View */}
                {isLoadingActivityDetails && !selectedActivity ? (
                    <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-7 w-[60%]" />
                            <Skeleton className="h-4 w-[40%]" />
                        </div>
                        <Separator className="bg-border/40" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Skeleton className="h-16 rounded-xl" />
                            <Skeleton className="h-16 rounded-xl" />
                            <Skeleton className="h-16 rounded-xl" />
                        </div>
                        <Skeleton className="h-32 rounded-xl w-full" />
                    </div>
                ) : (
                    <>
                        {/* Header Area */}
                        <DialogHeader className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-border/40 bg-background/30 shrink-0">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-muted/60 text-foreground/80 border-0">
                                            {activityLabel}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground/60 tabular-nums">
                                            ID: {selectedActivity?._id}
                                        </span>
                                    </div>
                                    <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
                                        {mode === "view" ? selectedActivity?.event : "Edit Activity Details"}
                                    </DialogTitle>
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Middle Content Wrapper */}
                        <div className="flex-1 overflow-hidden flex flex-col">
                            {mode === "view" ? (
                                <ScrollArea className="h-full px-5 sm:px-6 py-4 sm:py-5">
                                    <div className="space-y-5">
                                        {/* Context Cards Split */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="p-3 rounded-xl border border-border/40 bg-card/40 flex items-center gap-2.5 min-w-0">
                                                <User className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 leading-none mb-1">Customer</p>
                                                    <p className="text-xs font-semibold text-foreground truncate">{selectedActivity?.customer?.name || "—"}</p>
                                                </div>
                                            </div>
                                            <div className="p-3 rounded-xl border border-border/40 bg-card/40 flex items-center gap-2.5 min-w-0">
                                                <Briefcase className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 leading-none mb-1">Deal Title</p>
                                                    <p className="text-xs font-semibold text-foreground truncate">{selectedActivity?.deal?.title || "—"}</p>
                                                </div>
                                            </div>
                                            <div className="p-3 rounded-xl border border-border/40 bg-card/40 flex items-center gap-2.5 min-w-0">
                                                <Building className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 leading-none mb-1">Organization</p>
                                                    <p className="text-xs font-semibold text-foreground truncate">{selectedActivity?.organization?.name || "—"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Full Text Content Area */}
                                        <div className="space-y-1.5 min-w-0 w-full">
                                            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Detailed Description</h4>
                                            <div className="p-4 rounded-xl border border-border/50 bg-muted/20 min-h-[120px] max-h-[300px] overflow-y-auto w-full overflow-x-hidden">
                                                {selectedActivity?.description ? (
                                                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-all sm:break-words">
                                                        {selectedActivity.description}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs italic text-muted-foreground/50">No detailed description provided for this log window.</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Beautiful System Metadata Footer Track */}
                                        <div className="p-3 rounded-xl bg-muted/30 border border-border/30 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-muted-foreground/80 font-medium">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 opacity-60" />
                                                    <span>Created: {selectedActivity?.createdAt ? format(new Date(selectedActivity.createdAt), "PPP p") : "—"}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <User className="h-3.5 w-3.5 opacity-60" />
                                                    <span className="truncate">By: {selectedActivity?.createdBy?.name} ({selectedActivity?.createdBy?.email})</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1 sm:border-l sm:border-border/40 sm:pl-4">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 opacity-60" />
                                                    <span>Updated: {selectedActivity?.updatedAt ? format(new Date(selectedActivity.updatedAt), "PPP p") : "—"}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <User className="h-3.5 w-3.5 opacity-60" />
                                                    <span className="truncate">By: {selectedActivity?.updatedBy?.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollArea>
                            ) : (
                                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                                    <ScrollArea className="flex-1 px-5 sm:px-6 py-4">
                                        <div className="space-y-4">
                                            {/* Type Selection */}
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Activity Type</label>
                                                <Select value={form.type} onValueChange={(v) => handleChange("type", v)}>
                                                    <SelectTrigger className="h-10 rounded-lg border-border/60 text-sm cursor-pointer bg-background/50">
                                                        <SelectValue placeholder="Select activity type" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-lg">
                                                        {ACTIVITY_TYPES.map((t) => (
                                                            <SelectItem key={t.value} value={t.value} className="py-2 text-sm cursor-pointer">
                                                                <div className="flex items-center gap-2.5">
                                                                    <t.icon className="h-3.5 w-3.5 text-muted-foreground" />
                                                                    <span>{t.label}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {form.type === "custom" && (
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Custom Type</label>
                                                    <Input
                                                        placeholder="e.g., LinkedIn Outreach"
                                                        value={form.customType}
                                                        onChange={(e) => handleChange("customType", e.target.value)}
                                                        className="h-10 rounded-lg border-border/60 text-sm bg-background/50"
                                                    />
                                                </div>
                                            )}

                                            {/* Event Input */}
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Event Title <span className="text-destructive">*</span></label>
                                                <Input
                                                    placeholder="e.g., Sent proposal"
                                                    value={form.event}
                                                    onChange={(e) => handleChange("event", e.target.value)}
                                                    required
                                                    className="h-10 rounded-lg border-border/60 text-sm bg-background/50"
                                                />
                                            </div>

                                            {/* Description Input */}
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">Description (Max 2000 characters)</label>
                                                <Textarea
                                                    rows={6}
                                                    maxLength={2000}
                                                    placeholder="Add structural description updates here..."
                                                    value={form.description}
                                                    onChange={(e) => handleChange("description", e.target.value)}
                                                    className="rounded-lg border-border/60 text-sm resize-none bg-background/50 min-h-[140px]"
                                                />
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </form>
                            )}
                        </div>

                        {/* Interactive Sticky Footer Area */}
                        <div className="shrink-0 flex justify-end items-center gap-2 sm:gap-3 px-5 sm:px-6 py-3.5 border-t border-border/30 bg-muted/20 rounded-b-xl">
                            {mode === "view" ? (
                                <>
                                    <Button variant="outline" onClick={() => onOpenChange(false)} className="h-9 px-4 rounded-lg text-xs sm:text-sm font-medium border-border/60">
                                        Close
                                    </Button>
                                    <Button onClick={() => setMode("edit")} className="h-9 px-4 rounded-lg text-xs sm:text-sm font-medium shadow-sm gap-1.5">
                                        <Pencil className="h-3.5 w-3.5" />
                                        Edit Activity
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button type="button" variant="outline" onClick={() => setMode("view")} disabled={isUpdating} className="h-9 px-4 rounded-lg text-xs sm:text-sm font-medium border-border/60">
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSubmit} disabled={isUpdating} className="h-9 px-5 rounded-lg text-xs sm:text-sm font-medium shadow-sm">
                                        {isUpdating ? (
                                            <>
                                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ActivityDetailsDialog;