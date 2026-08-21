import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

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

import { useCustomerStore } from "@/stores";

const CustomerEditDialog = ({ open, onOpenChange, customer }) => {
  const { updateCustomer, isUpdating } = useCustomerStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (!customer) return;

    setFormData({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
    });
  }, [customer]);

  const handleChange = (field, value) => {
    if (field === "phone") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length > 10) return;
      setFormData((prev) => ({ ...prev, [field]: numericValue }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!customer?._id) return;

    try {
      await updateCustomer(customer._id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });

      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClose = () => {
    if (isUpdating) return;
    onOpenChange(false);
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
            Edit Customer
          </DialogTitle>
          <DialogDescription className="text-xs text-subtle-foreground">
            Update customer information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          {/* Name */}
          <div className="space-y-1.5 text-left">
            <Label htmlFor="name" className="text-xs font-semibold text-foreground">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Customer name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              disabled={isUpdating}
              required
              minLength={3}
              className="h-9 text-xs bg-surface border-border text-foreground placeholder:text-subtle-foreground/60 rounded-xl focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5 text-left">
            <Label htmlFor="email" className="text-xs font-semibold text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="customer@email.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={isUpdating}
              className="h-9 text-xs bg-surface border-border text-foreground placeholder:text-subtle-foreground/60 rounded-xl focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5 text-left">
            <div className="flex justify-between items-center">
              <Label htmlFor="phone" className="text-xs font-semibold text-foreground">
                Phone
              </Label>
              <span className="text-[10px] text-subtle-foreground font-mono select-none">
                {formData.phone.length}/10
              </span>
            </div>
            <Input
              id="phone"
              type="tel"
              pattern="[0-9]{10}"
              title="Phone number must be exactly 10 digits."
              placeholder="9999999999"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              disabled={isUpdating}
              className="h-9 text-xs font-mono bg-surface border-border text-foreground placeholder:text-subtle-foreground/60 rounded-xl focus-visible:ring-1 focus-visible:ring-ring"
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
              disabled={
                isUpdating ||
                formData.name.trim().length < 3 ||
                (formData.phone && formData.phone.length !== 10)
              }
              className="h-8 text-xs font-bold uppercase tracking-wider px-4 rounded-xl bg-accent text-accent-foreground shadow-md shadow-accent/20 hover:opacity-90 cursor-pointer transition-all active:scale-95"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerEditDialog;