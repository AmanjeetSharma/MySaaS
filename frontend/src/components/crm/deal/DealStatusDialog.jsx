import { useEffect, useState } from "react";
import { Loader2, Flag } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";

const DEAL_STATUSES = [
    {
        value: "active",
        label: "Active",
    },
    {
        value: "won",
        label: "Won",
    },
    {
        value: "lost",
        label: "Lost",
    },
];

const DealStatusDialog = ({
    open,
    onOpenChange,
    deal,
    onSubmit,
    isUpdating = false,
}) => {
    const [status, setStatus] = useState("active");

    useEffect(() => {
        if (deal?.status) {
            setStatus(deal.status);
        }
    }, [deal]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        await onSubmit(status);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Flag className="h-4 w-4" />
                        Update Deal Status
                    </DialogTitle>

                    <DialogDescription>
                        Change the current status of this deal.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <div className="space-y-2">
                        <Label>Status</Label>

                        <Select
                            value={status}
                            onValueChange={setStatus}
                            disabled={isUpdating}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
                                {DEAL_STATUSES.map((item) => (
                                    <SelectItem
                                        key={item.value}
                                        value={item.value}
                                    >
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isUpdating}
                            onClick={() =>
                                onOpenChange(false)
                            }
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={isUpdating}
                        >
                            {isUpdating && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}

                            Update Status
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default DealStatusDialog;