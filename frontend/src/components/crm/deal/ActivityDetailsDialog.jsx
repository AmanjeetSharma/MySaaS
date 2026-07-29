import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, Pencil, Calendar, User, Building, Briefcase, FileText, Sparkles } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

import { ACTIVITY_TYPES, getActivityLabel, getActivityIcon } from "@/constants/activityTypes.constant";
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
    const [charCount, setCharCount] = useState(0);

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
            const descriptionText = selectedActivity.description || "";
            setForm({
                type: selectedActivity.type || "note",
                customType: selectedActivity.customType || "",
                event: selectedActivity.event || "",
                description: descriptionText,
            });
            setCharCount(descriptionText.length);
        }
    }, [selectedActivity, mode]);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (field === "description") {
            setCharCount(value.length);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!form.event.trim()) return;

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
            <DialogContent className="max-w-[95vw] md:max-w-3xl lg:max-w-4xl p-0 gap-0 rounded-2xl overflow-hidden shadow-2xl border-border/40 bg-background flex flex-col h-[85vh] transition-all duration-300">

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
                        {/* Immersive Top Toolbar Rail Header */}
                        <DialogHeader className="px-5 sm:px-7 py-3.5 border-b border-border/40 bg-muted/20 backdrop-blur-sm shrink-0 w-full flex flex-row items-center justify-between space-y-0 text-left">
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 pr-4">
                                <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex items-center gap-2">
                                    <span className="text-xs font-semibold text-muted-foreground/80 tracking-wide uppercase whitespace-nowrap">
                                        Workspace
                                    </span>
                                    <span className="text-muted-foreground/30 hidden xs:inline">/</span>
                                    <span className="text-xs text-muted-foreground/60 truncate font-mono hidden xs:inline">
                                        {mode === "view" ? `Log Details` : `Modify Context`}
                                    </span>
                                </div>
                            </div>

                            {/* Options Action Tray - padded right layout block (pr-8) prevents collision with shadcn close button overlay */}
                            <div className="flex items-center gap-2 shrink-0 pr-8 sm:pr-10">
                                {mode === "view" ? (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-muted/60 text-foreground/80 border-0 max-w-[140px] truncate">
                                            {activityLabel}
                                        </Badge>
                                        <span className="text-[11px] font-mono text-muted-foreground/40 hidden sm:inline">
                                            ID: {selectedActivity?._id}
                                        </span>
                                    </div>
                                ) : (
                                    <Select value={form.type} onValueChange={(value) => handleChange("type", value)}>
                                        <SelectTrigger className="h-8 w-[120px] sm:w-[145px] rounded-lg border-border/50 text-xs font-medium cursor-pointer bg-background hover:bg-muted/50 transition-colors focus:ring-1 focus:ring-primary/20">
                                            <SelectValue placeholder="Log Type" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl shadow-lg border-border/40">
                                            {ACTIVITY_TYPES.map((t) => (
                                                <SelectItem key={t.value} value={t.value} className="py-2 text-xs cursor-pointer rounded-md">
                                                    <div className="flex items-center gap-2">
                                                        <t.icon className="h-3.5 w-3.5 text-muted-foreground/70" />
                                                        <span>{t.label}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </DialogHeader>

                        {/* Interactive Canvas Workspace Content Window */}
                        <div className="flex-1 overflow-hidden flex flex-col min-w-0">
                            {mode === "view" ? (
                                <ScrollArea className="h-full w-full">
                                    <div className="max-w-3xl mx-auto px-6 sm:px-12 pt-6 sm:pt-8 pb-6 space-y-6">
                                        
                                        {/* Primary Read Header View */}
                                        <div className="space-y-1 min-w-0">
                                            <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground break-all leading-tight">
                                                {selectedActivity?.event}
                                            </DialogTitle>
                                        </div>

                                        {/* Meta Connection Information Badges */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
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

                                        <Separator className="bg-border/30" />

                                        {/* Immersive Scroll View Description Canvas */}
                                        <div className="space-y-2 min-w-0 w-full">
                                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 select-none">Detailed Description</h4>
                                            <div className="text-sm sm:text-base text-foreground/90 leading-relaxed whitespace-pre-wrap break-all sm:break-words pt-1">
                                                {selectedActivity?.description ? (
                                                    selectedActivity.description
                                                ) : (
                                                    <span className="text-xs italic text-muted-foreground/40 font-normal">No descriptive details loaded for this timestamp node.</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Beautiful System Trace Auditing Logs Track */}
                                        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/30 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-muted-foreground/80 font-medium">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 opacity-60" />
                                                    <span>Created: {selectedActivity?.createdAt ? format(new Date(selectedActivity.createdAt), "PPP p") : "—"}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <User className="h-3.5 w-3.5 opacity-60" />
                                                    <span className="truncate">By: {selectedActivity?.createdBy?.name}</span>
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
                                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 min-w-0 w-full overflow-hidden">
                                    <ScrollArea className="flex-1 w-full">
                                        <div className="max-w-3xl mx-auto px-6 sm:px-12 pt-8 sm:pt-10 pb-6 min-w-0 space-y-6 sm:space-y-7">
                                            
                                            {/* Dynamic Form Custom Input Sub-Track */}
                                            {form.type === "custom" && (
                                                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <div className="flex items-center gap-2 border-b border-border/30 pb-1 w-full max-w-xs focus-within:border-primary/40 transition-colors">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 select-none shrink-0">Custom Type Focus:</span>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g., LinkedIn Outreach"
                                                            value={form.customType}
                                                            onChange={(e) => handleChange("customType", e.target.value)}
                                                            className="bg-transparent border-0 outline-none p-0 text-xs font-semibold text-foreground placeholder:text-muted-foreground/40 w-full break-all focus:ring-0"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Unified Document-Style Header Input Canvas */}
                                            <div className="space-y-1 min-w-0">
                                                <input
                                                    type="text"
                                                    placeholder="Untitled Interaction Event..."
                                                    value={form.event}
                                                    onChange={(e) => handleChange("event", e.target.value)}
                                                    required
                                                    className="w-full bg-transparent border-0 outline-none p-0 text-xl sm:text-2xl font-bold tracking-tight text-foreground placeholder:text-muted-foreground/25 font-sans break-all focus:ring-0"
                                                />
                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground/40 font-medium select-none uppercase tracking-widest pt-1">
                                                    <span>Primary Event Title</span>
                                                    <span className="text-destructive font-bold">* Required</span>
                                                </div>
                                            </div>

                                            <Separator className="bg-border/30" />

                                            {/* Frameless Digital Notepad Editor Workspace Surface */}
                                            <div className="min-w-0 w-full relative group">
                                                <textarea
                                                    value={form.description}
                                                    onChange={(e) => handleChange("description", e.target.value)}
                                                    maxLength={2000}
                                                    placeholder="Modify activity tracking notes, timeline metrics, or descriptions here..."
                                                    className="w-full bg-transparent border-0 outline-none p-0 text-sm sm:text-base text-foreground/90 placeholder:text-muted-foreground/30 font-sans leading-relaxed resize-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[260px] sm:min-h-[320px] break-all sm:break-words"
                                                />
                                                
                                                {charCount === 0 && (
                                                    <div className="absolute right-0 bottom-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-muted-foreground/30 text-[11px] font-medium tracking-wide select-none">
                                                        <Sparkles className="h-3 w-3" />
                                                        <span>Focus canvas view</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </form>
                            )}
                        </div>

                        {/* Sticky Control Action Footer Rail */}
                        <div className="shrink-0 flex items-center justify-between px-5 sm:px-7 py-3.5 border-t border-border/30 bg-muted/10 w-full">
                            {/* Word Metric Counters vs Mode Tracks */}
                            <div className="text-xs font-mono text-muted-foreground/50 select-none">
                                {mode === "edit" ? (
                                    <div className="flex items-center gap-1">
                                        <span className={charCount > 1800 ? "text-warning font-bold" : "text-muted-foreground/70"}>
                                            {charCount}
                                        </span>
                                        <span>/ 2000 chars</span>
                                    </div>
                                ) : (
                                    <span className="text-[11px] font-sans text-muted-foreground/40">Read-Only</span>
                                )}
                            </div>

                            {/* Operational Button Control Clusters */}
                            <div className="flex items-center gap-2 sm:gap-3">
                                {mode === "view" ? (
                                    <>
                                        <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-9 px-4 rounded-xl text-xs sm:text-sm font-medium text-muted-foreground/70 hover:text-foreground hover:bg-muted/60 cursor-pointer">
                                            Close
                                        </Button>
                                        <Button onClick={() => setMode("edit")} className="h-9 px-5 rounded-xl text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg gap-1.5 cursor-pointer">
                                            <Pencil className="h-3.5 w-3.5" />
                                            Edit
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button type="button" variant="ghost" onClick={() => setMode("view")} disabled={isUpdating} className="h-9 px-4 rounded-xl text-xs sm:text-sm font-medium text-muted-foreground/70 hover:text-foreground hover:bg-muted/60 cursor-pointer">
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSubmit} disabled={isUpdating || !form.event.trim()} className="h-9 px-5 rounded-xl text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer">
                                            {isUpdating ? (
                                                <>
                                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                "Save Changes"
                                            )}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ActivityDetailsDialog;