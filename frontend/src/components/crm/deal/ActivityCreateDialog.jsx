import { useEffect, useState } from "react";
import { Loader2, FileText, Sparkles } from "lucide-react";

import {
    Dialog,
    DialogContent,
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
import { ScrollArea } from "@/components/ui/scroll-area";

import { ACTIVITY_TYPES } from "@/constants/activityTypes.constant";
import { useActivityStore } from "@/stores";

const defaultForm = {
    type: "note",
    customType: "",
    event: "",
    description: "",
};

const ActivityCreateDialog = ({ open, onOpenChange, dealId }) => {
    const { createActivity, isUpdating } = useActivityStore();
    const [form, setForm] = useState(defaultForm);
    const [charCount, setCharCount] = useState(0);

    useEffect(() => {
        if (open) {
            setForm(defaultForm);
            setCharCount(0);
        }
    }, [open]);

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
            await createActivity({ dealId, ...payload });
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (field === "description") {
            setCharCount(value.length);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] md:max-w-3xl lg:max-w-4xl p-0 gap-0 rounded-2xl overflow-hidden shadow-2xl border-border/40 bg-background flex flex-col h-[85vh] transition-all duration-300">
                
                {/* Top Workspace Toolbar Rail - pr-10 prevents grouping collision with standard close layout triggers */}
                <div className="shrink-0 flex items-center justify-between pl-5 sm:pl-7 pr-12 sm:pr-14 py-3.5 border-b border-border/40 bg-muted/20 backdrop-blur-sm w-full">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0">
                            <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground/80 tracking-wide uppercase whitespace-nowrap">
                                Workspace
                            </span>
                            <span className="text-muted-foreground/30 hidden xs:inline">/</span>
                            <span className="text-xs text-muted-foreground/60 hidden xs:inline truncate font-mono">
                                New Entry Log
                            </span>
                        </div>
                    </div>

                    {/* Activity Type Selection Widget with Extended Inner Padding Track */}
                    <div className="flex items-center shrink-0">
                        <Select value={form.type} onValueChange={(value) => handleChange("type", value)}>
                            <SelectTrigger className="h-9 w-[130px] sm:w-[150px] px-3 rounded-lg border-border/50 text-xs font-medium cursor-pointer bg-background hover:bg-muted/50 transition-all focus:ring-1 focus:ring-primary/20 shadow-sm">
                                <SelectValue placeholder="Log Type" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-lg border-border/40">
                                {ACTIVITY_TYPES.map((t) => (
                                    <SelectItem key={t.value} value={t.value} className="py-2.5 px-3 text-xs cursor-pointer rounded-md">
                                        <div className="flex items-center gap-2">
                                            <t.icon className="h-3.5 w-3.5 text-muted-foreground/70" />
                                            <span>{t.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Immersive Creative Writing Canvas */}
                <div className="flex-1 overflow-hidden flex flex-col bg-background relative min-w-0">
                    <ScrollArea className="flex-1 w-full">
                        <div className="max-w-3xl mx-auto px-6 sm:px-12 pt-8 sm:pt-12 pb-6 min-w-0 space-y-6 sm:space-y-8">
                            
                            {/* Custom Type Expansion Transition Frame */}
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

                            {/* Document Title Header Input Section */}
                            <div className="space-y-1 min-w-0">
                                <input
                                    type="text"
                                    placeholder="Untitled Interaction Event..."
                                    value={form.event}
                                    onChange={(e) => handleChange("event", e.target.value)}
                                    required
                                    className="w-full bg-transparent border-0 outline-none p-0 text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground placeholder:text-muted-foreground/25 font-sans break-all focus:ring-0"
                                />
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground/40 font-medium select-none uppercase tracking-widest pt-1">
                                    <span>Primary Event Title</span>
                                    <span className="text-destructive font-bold">* Required</span>
                                </div>
                            </div>

                            <Separator className="bg-border/30" />

                            {/* Main Writing Surface Canvas Textarea */}
                            <div className="min-w-0 w-full relative group">
                                <textarea
                                    value={form.description}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                    maxLength={2000}
                                    placeholder="Start typing your activity notes, details, or meeting transcripts here (supports up to 2,000 characters)..."
                                    className="w-full bg-transparent border-0 outline-none p-0 text-sm sm:text-base text-foreground/90 placeholder:text-muted-foreground/30 font-sans leading-relaxed resize-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[280px] sm:min-h-[340px] break-all sm:break-words"
                                />
                                
                                {/* Inline Clean Canvas Focus State Watermark */}
                                {charCount === 0 && (
                                    <div className="absolute right-0 bottom-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-muted-foreground/30 text-[11px] font-medium tracking-wide select-none">
                                        <Sparkles className="h-3 w-3" />
                                        <span>Focus view active</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                </div>

                {/* Minimal Sticky Metadata & Control Footer */}
                <div className="shrink-0 flex items-center justify-between px-5 sm:px-7 py-3.5 border-t border-border/30 bg-muted/10 w-full">
                    <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground/50 select-none">
                        <div className="flex items-center gap-1">
                            <span className={charCount > 1800 ? "text-warning font-bold" : "text-muted-foreground/70"}>
                                {charCount}
                            </span>
                            <span>/ 2000 chars</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => onOpenChange(false)} 
                            className="h-9 px-4 rounded-xl text-xs sm:text-sm font-medium text-muted-foreground/70 hover:text-foreground hover:bg-muted/60 transition-all cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="button"
                            onClick={handleSubmit}
                            disabled={isUpdating || !form.event.trim()} 
                            className="h-9 px-5 sm:px-6 rounded-xl text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create"
                            )}
                        </Button>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
};

export default ActivityCreateDialog;