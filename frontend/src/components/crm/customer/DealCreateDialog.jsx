import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

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

      // Triggers immediate live parent component layout sync hooks safely
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Deal</DialogTitle>
          <DialogDescription>
            Create a new deal for{" "}
            <span className="font-medium text-foreground">
              {customer?.name}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer (Read-only reference) */}
          <div className="space-y-2">
            <Label htmlFor="customer-readonly">Customer</Label>
            <Input
              id="customer-readonly"
              value={customer?.name || ""}
              disabled
              className="bg-muted/50"
            />
          </div>

          {/* Deal Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Deal Title</Label>
            <Input
              id="title"
              placeholder="Website Development"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUpdating}
              required
              autoFocus
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUpdating}
              className="cursor-pointer"
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isUpdating || !title.trim()} className="cursor-pointer">
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Deal"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DealCreateDialog;