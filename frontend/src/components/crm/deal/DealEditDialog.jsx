import { useEffect, useState } from "react";
import { Loader2, Pencil } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DealEditDialog = ({
    open,
    onOpenChange,
    deal,
    onSubmit,
    isUpdating = false,
}) => {
    const [title, setTitle] = useState("");

    useEffect(() => {
        if (deal) {
            setTitle(deal.title || "");
        }
    }, [deal]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const trimmedTitle = title.trim();

        if (!trimmedTitle) return;

        await onSubmit(trimmedTitle);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Pencil className="h-4 w-4" />
                        Edit Deal
                    </DialogTitle>

                    <DialogDescription>
                        Update the deal title.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <div className="space-y-2">
                        <Label htmlFor="deal-title">
                            Deal Title
                        </Label>

                        <Input
                            id="deal-title"
                            value={title}
                            placeholder="Enter deal title"
                            onChange={(e) =>
                                setTitle(e.target.value)
                            }
                            maxLength={255}
                            disabled={isUpdating}
                            autoFocus
                        />
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
                            disabled={
                                isUpdating ||
                                !title.trim()
                            }
                        >
                            {isUpdating && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}

                            Save Changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default DealEditDialog;