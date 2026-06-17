import { useEffect, useState } from "react";

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

import { ACTIVITY_TYPES } from "@/config/activityTypes.config";
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

    useEffect(() => {
        if (open) setForm(defaultForm);
    }, [open]);

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
            await createActivity({ dealId, ...payload });
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-w-[95vw] p-0 gap-0 rounded-xl overflow-hidden shadow-xl border-border/50">
                <DialogHeader className="px-5 sm:px-6 pt-5 sm:pt-6 pb-3 sm:pb-4 border-b border-border/40 bg-background/30">
                    <DialogTitle className="text-base sm:text-lg font-semibold tracking-tight">
                        Add Activity
                    </DialogTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        Log a new interaction or milestone
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="px-5 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
                    <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                            Activity Type
                        </label>
                        <Select value={form.type} onValueChange={(value) => handleChange("type", value)}>
                            <SelectTrigger className="h-9 sm:h-10 rounded-lg border-border/60 text-sm cursor-pointer bg-background/50">
                                <SelectValue placeholder="Select activity type" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                                {ACTIVITY_TYPES.map((activityType) => (
                                    <SelectItem key={activityType.value} value={activityType.value} className="py-2 cursor-pointer text-sm">
                                        <div className="flex items-center gap-2.5">
                                            <activityType.icon className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span>{activityType.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {form.type === "custom" && (
                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                                Custom Type
                            </label>
                            <Input
                                placeholder="e.g., LinkedIn Outreach"
                                value={form.customType}
                                onChange={(e) => handleChange("customType", e.target.value)}
                                className="h-9 sm:h-10 rounded-lg border-border/60 text-sm bg-background/50"
                            />
                        </div>
                    )}

                    <Separator className="bg-border/30" />

                    <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                            Event <span className="text-destructive">*</span>
                        </label>
                        <Input
                            placeholder="e.g., Sent proposal"
                            value={form.event}
                            onChange={(e) => handleChange("event", e.target.value)}
                            required
                            className="h-9 sm:h-10 rounded-lg border-border/60 text-sm bg-background/50"
                        />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                            Description
                        </label>
                        <Textarea
                            rows={3}
                            placeholder="Add additional details..."
                            value={form.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            className="rounded-lg border-border/60 text-sm resize-none bg-background/50 min-h-[80px]"
                        />
                    </div>

                    <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-t-border/30 -mx-5 sm:-mx-6 px-5 sm:px-6 py-3 sm:py-4 bg-background/20 rounded-b-xl">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-8 sm:h-9 px-4 sm:px-5 rounded-lg text-xs sm:text-sm font-medium border-border/60">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isUpdating} className="h-8 sm:h-9 px-4 sm:px-5 rounded-lg text-xs sm:text-sm font-medium shadow-sm">
                            {isUpdating ? "Creating..." : "Create"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ActivityCreateDialog;