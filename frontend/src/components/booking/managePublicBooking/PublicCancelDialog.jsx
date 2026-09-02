import { AlertTriangle, Ban } from "lucide-react";
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

const PublicCancelDialog = ({
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
            <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl bg-white border border-slate-200 text-slate-900 p-5 sm:p-6 shadow-2xl overflow-hidden [&>button]:cursor-pointer">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
                    {/* Header */}
                    <DialogHeader className="space-y-1.5 text-left">
                        <div className="flex items-center gap-2 text-rose-600">
                            <div className="flex size-7 items-center justify-center rounded-lg bg-rose-50 border border-rose-200 shrink-0">
                                <Ban className="size-4 text-rose-600" />
                            </div>
                            <DialogTitle className="text-base font-bold tracking-tight text-rose-600">
                                Cancel Booking
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-slate-500 leading-normal">
                            Please tell us why you need to cancel this appointment. This action cannot be reversed.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Warning Banner */}
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                        <AlertTriangle className="size-4 shrink-0 mt-0.5 text-rose-600" />
                        <span className="text-[11px] leading-relaxed font-medium">
                            Cancelling releases your slot so others can book. Calendar reminders and links will be revoked.
                        </span>
                    </div>

                    {/* Reason Input */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="public-cancel-reason"
                                className="text-xs font-semibold text-slate-700"
                            >
                                Reason for cancellation <span className="text-rose-500">*</span>
                            </label>
                            <span className="text-[10px] font-mono text-slate-400">
                                {reason.length}/{MAX_CANCEL_REASON_LENGTH}
                            </span>
                        </div>

                        <Textarea
                            id="public-cancel-reason"
                            rows={3}
                            maxLength={MAX_CANCEL_REASON_LENGTH}
                            value={reason}
                            onChange={(e) => onReasonChange(e.target.value)}
                            placeholder="e.g., Unforeseen scheduling conflict, no longer needed..."
                            required
                            className="min-h-[85px] max-h-[140px] px-3 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl focus-visible:ring-1 focus-visible:ring-rose-500 transition-all shadow-xs resize-none"
                        />
                    </div>

                    {/* Footer Actions */}
                    <DialogFooter className="pt-2 flex-col-reverse sm:flex-row justify-end items-stretch sm:items-center gap-2 sm:space-x-0">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="h-9 sm:h-8.5 px-3.5 rounded-xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold cursor-pointer active:scale-95 transition-all"
                        >
                            Keep Appointment
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isCancelling || !reason.trim()}
                            className="h-9 sm:h-8.5 px-4 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-xs disabled:opacity-50"
                        >
                            {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default PublicCancelDialog;