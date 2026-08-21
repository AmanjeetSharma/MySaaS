import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { useCustomerStore } from "@/stores";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
};

const CustomerCreateDialog = ({ open, onOpenChange, organizationId, onSuccess }) => {
  const { createCustomer, isUpdating } = useCustomerStore();
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (!open) {
      setForm(INITIAL_FORM);
    }
  }, [open]);

  const isValid = useMemo(() => {
    const isNameValid = form.name.trim().length > 0;
    const isPhoneValid = form.phone.trim().length === 0 || form.phone.trim().length === 10;
    return isNameValid && isPhoneValid;
  }, [form]);

  const handleChange = (field) => (event) => {
    let value = event.target.value;

    if (field === "phone") {
      value = value.replace(/\D/g, "");
      if (value.length > 10) {
        value = value.slice(0, 10);
      }
    }

    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!organizationId || !isValid) return;

    const payload = {
      orgId: organizationId,
      name: form.name.trim(),
    };

    if (form.phone.trim()) {
      payload.phone = form.phone.trim();
    }

    if (form.email.trim()) {
      payload.email = form.email.trim();
    }

    try {
      await createCustomer(payload);

      if (typeof onSuccess === "function") {
        onSuccess();
      }

      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-5 gap-3.5 rounded-2xl border border-border-strong bg-surface-elevated text-surface-elevated-foreground shadow-2xl [&>button]:cursor-pointer [&>button]:rounded-xl [&>button]:hover:bg-hover [&>button]:text-subtle-foreground [&>button]:hover:text-foreground [&>button]:transition-all">
        <DialogHeader className="space-y-1 pr-6">
          <DialogTitle className="font-heading text-sm sm:text-base font-bold tracking-tight text-foreground">
            Create Customer
          </DialogTitle>
          <DialogDescription className="text-xs text-subtle-foreground">
            Add a clear reference account data record below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          {/* REQUIRED FIELD: FULL NAME */}
          <div className="space-y-1.5">
            <Label htmlFor="customer-name" className="text-xs font-semibold text-foreground">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customer-name"
              placeholder="e.g., Amanjeet Sharma"
              className="h-9 text-xs bg-surface border-border text-foreground placeholder:text-subtle-foreground/60 rounded-xl focus-visible:ring-1 focus-visible:ring-ring"
              value={form.name}
              onChange={handleChange("name")}
              disabled={isUpdating}
              autoFocus
            />
          </div>

          {/* OPTIONAL FIELD: PHONE NUMBER */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="customer-phone" className="text-xs font-semibold text-foreground">
                Phone Number <span className="text-subtle-foreground font-normal text-[11px]">(Optional)</span>
              </Label>
              <span className="text-[10px] text-subtle-foreground font-mono select-none">
                {form.phone.length}/10
              </span>
            </div>
            <Input
              id="customer-phone"
              type="text"
              inputMode="numeric"
              placeholder="10-digit number"
              className="h-9 text-xs font-mono bg-surface border-border text-foreground placeholder:text-subtle-foreground/60 rounded-xl focus-visible:ring-1 focus-visible:ring-ring"
              value={form.phone}
              onChange={handleChange("phone")}
              disabled={isUpdating}
            />
          </div>

          {/* OPTIONAL FIELD: EMAIL ADDRESS */}
          <div className="space-y-1.5">
            <Label htmlFor="customer-email" className="text-xs font-semibold text-foreground">
              Email Address <span className="text-subtle-foreground font-normal text-[11px]">(Optional)</span>
            </Label>
            <Input
              id="customer-email"
              type="email"
              placeholder="name@company.com"
              className="h-9 text-xs bg-surface border-border text-foreground placeholder:text-subtle-foreground/60 rounded-xl focus-visible:ring-1 focus-visible:ring-ring"
              value={form.email}
              onChange={handleChange("email")}
              disabled={isUpdating}
            />
          </div>

          {/* Footer Component Actions */}
          <DialogFooter className="pt-3 flex flex-row items-center justify-end gap-x-2.5 border-t border-border-subtle mt-4 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs font-semibold px-4 rounded-xl border-border bg-surface text-subtle-foreground hover:bg-surface-sunken hover:text-foreground cursor-pointer transition-all active:scale-95"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-8 text-xs font-bold uppercase tracking-wider gap-1.5 px-4 rounded-xl bg-accent text-accent-foreground shadow-md shadow-accent/20 hover:opacity-90 cursor-pointer transition-all active:scale-95"
              disabled={!isValid || isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="size-3 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="size-3 stroke-[2.5]" />
                  <span>Save Contact</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerCreateDialog;