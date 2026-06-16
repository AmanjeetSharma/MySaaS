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

import {
    ACTIVITY_TYPES,
} from "@/config/activityTypes.config";

import {
    useActivityStore,
} from "@/stores";

const defaultForm = {
    type: "note",
    customType: "",
    event: "",
    description: "",
};

const ActivityFormDialog = ({
    open,
    onOpenChange,
    mode = "create",
    dealId,
    activity = null,
}) => {
    const {
        createActivity,
        updateActivity,
        isUpdating,
    } = useActivityStore();

    const [form, setForm] =
        useState(defaultForm);

    useEffect(() => {
        if (
            mode === "edit" &&
            activity
        ) {
            setForm({
                type: activity.type,
                customType:
                    activity.customType || "",
                event:
                    activity.event || "",
                description:
                    activity.description || "",
            });
        } else {
            setForm(defaultForm);
        }
    }, [activity, mode, open]);

    const handleSubmit = async (
        e
    ) => {
        e.preventDefault();

        try {
            const payload = {
                type: form.type,
                event: form.event.trim(),
                description:
                    form.description.trim(),
            };

            if (
                form.type === "custom"
            ) {
                payload.customType =
                    form.customType.trim();
            }

            if (mode === "create") {
                await createActivity({
                    dealId,
                    ...payload,
                });
            } else {
                await updateActivity(
                    activity._id,
                    payload
                );
            }

            onOpenChange(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (
        field,
        value
    ) => {
        setForm(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <Dialog
            open={open}
            onOpenChange={
                onOpenChange
            }
        >
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create"
                            ? "Add Activity"
                            : "Edit Activity"}
                    </DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="space-y-4"
                >
                    {/* Activity Type */}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Activity Type
                        </label>

                        <Select
                            value={form.type}
                            onValueChange={(
                                value
                            ) =>
                                handleChange(
                                    "type",
                                    value
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
                                {ACTIVITY_TYPES.map(
                                    (
                                        activityType
                                    ) => (
                                        <SelectItem
                                            key={
                                                activityType.value
                                            }
                                            value={
                                                activityType.value
                                            }
                                        >
                                            <div className="flex items-center gap-2">
                                                <activityType.icon className="h-4 w-4" />

                                                {
                                                    activityType.label
                                                }
                                            </div>
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Custom Type */}

                    {form.type ===
                        "custom" && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Custom Type
                                </label>

                                <Input
                                    placeholder="LinkedIn Outreach"
                                    value={
                                        form.customType
                                    }
                                    onChange={e =>
                                        handleChange(
                                            "customType",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                        )}

                    {/* Event */}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Event
                        </label>

                        <Input
                            placeholder="Sent proposal"
                            value={form.event}
                            onChange={e =>
                                handleChange(
                                    "event",
                                    e.target.value
                                )
                            }
                            required
                        />
                    </div>

                    {/* Description */}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Description
                        </label>

                        <Textarea
                            rows={4}
                            placeholder="Optional details..."
                            value={
                                form.description
                            }
                            onChange={e =>
                                handleChange(
                                    "description",
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    {/* Actions */}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                onOpenChange(
                                    false
                                )
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={
                                isUpdating
                            }
                        >
                            {isUpdating
                                ? mode ===
                                    "create"
                                    ? "Creating..."
                                    : "Saving..."
                                : mode ===
                                    "create"
                                    ? "Create Activity"
                                    : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ActivityFormDialog;