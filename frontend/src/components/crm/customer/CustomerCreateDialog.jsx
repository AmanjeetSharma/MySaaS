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

const CustomerCreateDialog = ({ open, onOpenChange, organizationId, onCreated }) => {
  const { createCustomer, isUpdating } = useCustomerStore();
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (!open) {
      setForm(INITIAL_FORM);
    }
  }, [open]);

  const isValid = useMemo(() => {
    return form.name.trim().length > 0 && form.phone.trim().length === 10;
  }, [form]);

  const handleChange = (field) => (event) => {
    let value = event.target.value;

    // Custom structural validation lock specifically for the phone component
    if (field === "phone") {
      // Allow only numbers
      value = value.replace(/\D/g, "");
      // Limit to max 10 characters length
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
      phone: form.phone.trim(),
    };

    if (form.email.trim()) {
      payload.email = form.email.trim();
    }

    try {
      const response = await createCustomer(payload);
      const customer = response?.customer || response;
      onCreated?.(customer);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-5 gap-4 rounded-lg">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-base font-semibold">Create Customer</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Add a clear reference account data record below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="customer-name" className="text-xs text-muted-foreground">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customer-name"
              placeholder="e.g., Amanjeet Sharma"
              className="h-8 text-xs placeholder:text-muted-foreground/50"
              value={form.name}
              onChange={handleChange("name")}
              disabled={isUpdating}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="customer-phone" className="text-xs text-muted-foreground">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <span className="text-[10px] text-muted-foreground/60 font-mono">
                {form.phone.length}/10
              </span>
            </div>
            <Input
              id="customer-phone"
              type="text"
              inputMode="numeric"
              placeholder="10-digit number"
              className="h-8 text-xs font-mono placeholder:text-muted-foreground/50"
              value={form.phone}
              onChange={handleChange("phone")}
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="customer-email" className="text-xs text-muted-foreground">
              Email Address
            </Label>
            <Input
              id="customer-email"
              type="email"
              placeholder="name@company.com"
              className="h-8 text-xs placeholder:text-muted-foreground/50"
              value={form.email}
              onChange={handleChange("email")}
              disabled={isUpdating}
            />
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="h-8 text-xs gap-1" disabled={!isValid || isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="size-3 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="size-3" />
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