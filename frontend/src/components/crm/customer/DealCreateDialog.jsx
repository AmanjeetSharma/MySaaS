import { useState, useEffect } from "react";
import { Loader2, Plus, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useDealStore } from "@/stores";

const DealCreateDialog = ({ open, onOpenChange, customer, onSuccess }) => {
  const { createDeal, isUpdating } = useDealStore();
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!open) {
      setTitle("");
    }
  }, [open]);

  const handleClose = () => {
    if (isUpdating) return;
    setTitle("");
    onOpenChange(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!customer?._id || !title.trim()) return;

    try {
      await createDeal({
        orgId: customer.organization,
        customerId: customer._id,
        title: title.trim(),
      });

      if (typeof onSuccess === "function") {
        await onSuccess();
      }

      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="fixed left-1/2 top-1/2 z-50 w-full max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 sm:max-w-md p-5 gap-3.5 rounded-2xl border border-border-strong bg-surface-elevated text-surface-elevated-foreground shadow-2xl [&>button]:hidden">
        {/* Custom Close Button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isUpdating}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-xl p-1 text-subtle-foreground hover:text-foreground hover:bg-hover transition-all cursor-pointer disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader className="space-y-1 pr-6 text-left">
          <DialogTitle className="font-heading text-sm sm:text-base font-bold tracking-tight text-foreground">
            Create Deal
          </DialogTitle>
          <DialogDescription className="text-xs text-subtle-foreground">
            Create a new deal for{" "}
            <span className="font-semibold text-foreground">
              {customer?.name}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          {/* Customer (Read-only reference) */}
          <div className="space-y-1.5 text-left">
            <Label htmlFor="customer-readonly" className="text-xs font-semibold text-foreground">
              Customer
            </Label>
            <Input
              id="customer-readonly"
              value={customer?.name || ""}
              disabled
              className="h-9 text-xs bg-surface-sunken/60 text-subtle-foreground border-border-subtle rounded-xl cursor-not-allowed"
            />
          </div>

          {/* Deal Title */}
          <div className="space-y-1.5 text-left">
            <Label htmlFor="title" className="text-xs font-semibold text-foreground">
              Deal Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter deal title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUpdating}
              required
              autoFocus
              className="h-9 text-xs bg-surface border-border text-foreground placeholder:text-subtle-foreground/60 rounded-xl focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUpdating}
              className="h-8 text-xs font-semibold px-4 rounded-xl border-border bg-surface text-subtle-foreground hover:bg-surface-sunken hover:text-foreground cursor-pointer transition-all active:scale-95"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isUpdating || !title.trim()}
              className="h-8 text-xs font-bold uppercase tracking-wider gap-1.5 px-4 rounded-xl bg-accent text-accent-foreground shadow-md shadow-accent/20 hover:opacity-90 cursor-pointer transition-all active:scale-95"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="size-3.5 stroke-[2.5]" />
                  <span>Create Deal</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DealCreateDialog;