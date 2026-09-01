import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const MAX_CANCEL_REASON_LENGTH = 500;

const BookingCancelDialog = ({
    open,
    onOpenChange,
    reason,
    onReasonChange,
    onConfirm,
    isCancelling,
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!reason?.trim()) return;
        onConfirm(e);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[440px] rounded-2xl bg-surface-elevated border-border text-foreground p-6 shadow-2xl overflow-hidden [&>button]:cursor-pointer">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Header */}
                    <DialogHeader className="space-y-1.5 text-left">
                        <div className="flex items-center gap-2 text-destructive">
                            <DialogTitle className="font-heading text-base font-bold tracking-tight text-destructive">
                                Cancel Booking
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-subtle-foreground leading-normal">
                            This action will cancel the appointment and notify the customer. This step cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Reason Input */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="cancel-reason"
                                className="text-xs font-medium text-foreground"
                            >
                                Reason for cancellation <span className="text-destructive">*</span>
                            </label>
                            <span className="text-[10px] font-mono text-subtle-foreground/60">
                                {reason.length}/{MAX_CANCEL_REASON_LENGTH}
                            </span>
                        </div>

                        <Textarea
                            id="cancel-reason"
                            rows={3}
                            maxLength={MAX_CANCEL_REASON_LENGTH}
                            value={reason}
                            onChange={(e) => onReasonChange(e.target.value)}
                            placeholder="e.g., Client requested cancellation due to a scheduling conflict..."
                            required
                            className="min-h-[80px] max-h-[140px] px-3 py-2 text-xs bg-surface border-border text-foreground placeholder:text-subtle-foreground/50 rounded-xl focus-visible:ring-1 focus-visible:ring-destructive transition-all shadow-xs resize-none"
                        />
                    </div>

                    {/* Footer Actions */}
                    <DialogFooter className="pt-2 flex-row justify-end items-center gap-2 sm:space-x-0">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="h-8.5 px-3.5 rounded-xl border-border bg-surface text-subtle-foreground hover:bg-hover hover:text-foreground text-xs font-semibold cursor-pointer active:scale-95 transition-all"
                        >
                            Keep Booking
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isCancelling || !reason.trim()}
                            className="h-8.5 px-4 rounded-xl bg-destructive/20 text-destructive hover:bg-destructive/10 text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-xs disabled:opacity-50"
                        >
                            {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default BookingCancelDialog;