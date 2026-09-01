import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const BookingStatusDialog = ({
    open,
    onOpenChange,
    currentStatus,
    allowedTransitions,
    onUpdate,
    isUpdating,
}) => {
    const [selectedStatus, setSelectedStatus] = useState("");

    useEffect(() => {
        if (allowedTransitions?.length > 0) {
            setSelectedStatus(allowedTransitions[0]);
        }
    }, [allowedTransitions, open]);

    const handleConfirm = () => {
        if (selectedStatus) {
            onUpdate(selectedStatus);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl bg-surface-elevated border-border text-foreground p-5 sm:p-6 shadow-2xl overflow-hidden [&>button]:cursor-pointer">
                <DialogHeader className="space-y-1 text-left">
                    <DialogTitle className="font-heading text-base font-bold tracking-tight text-foreground">
                        Change Status
                    </DialogTitle>
                    <DialogDescription className="text-xs text-subtle-foreground leading-normal">
                        Transition booking from{" "}
                        <span className="font-semibold text-foreground">
                            {currentStatus?.replace(/_/g, " ")}
                        </span>{" "}
                        to an allowed state.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-1.5">
                    <label className="text-xs font-medium text-foreground">
                        Next Status
                    </label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-full h-9 text-xs rounded-xl border-border bg-surface text-foreground cursor-pointer focus-visible:ring-1 focus-visible:ring-accent transition-all shadow-xs">
                            <SelectValue placeholder="Select target status" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground border-border rounded-xl shadow-xl z-50">
                            {allowedTransitions.map((st) => (
                                <SelectItem
                                    key={st}
                                    value={st}
                                    className="text-xs hover:bg-hover hover:text-hover-foreground cursor-pointer"
                                >
                                    {st.replace(/_/g, " ")}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter className="pt-2 flex-row justify-end items-center gap-2 sm:space-x-0">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="h-8.5 px-3.5 rounded-xl border-border bg-surface text-subtle-foreground hover:bg-hover hover:text-foreground text-xs font-semibold cursor-pointer active:scale-95 transition-all"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        disabled={isUpdating || !selectedStatus}
                        onClick={handleConfirm}
                        className="h-8.5 px-4 rounded-xl bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-xs hover:opacity-95"
                    >
                        {isUpdating ? "Updating..." : "Update Status"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BookingStatusDialog;