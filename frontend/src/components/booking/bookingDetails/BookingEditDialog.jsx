import { useEffect, useState } from "react";
import { User, Mail, Phone, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MAX_NOTES_LENGTH = 1000;

const BookingEditDialog = ({ open, onOpenChange, booking, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  useEffect(() => {
    if (booking && open) {
      setFormData({
        name: booking.booker?.name || "",
        email: booking.booker?.email || "",
        phone: booking.booker?.phone || "",
        notes: booking.notes || "",
      });
    }
  }, [booking, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      booker: {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      },
      notes: formData.notes.trim().slice(0, MAX_NOTES_LENGTH),
    });
  };

  const notesLength = formData.notes.length;
  const isNearLimit = notesLength > MAX_NOTES_LENGTH * 0.85;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[460px] rounded-2xl bg-surface-elevated border-border text-foreground p-6 shadow-2xl overflow-hidden [&>button]:cursor-pointer">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Header */}
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="font-heading text-base font-bold tracking-tight text-foreground">
              Edit Details
            </DialogTitle>
            <DialogDescription className="text-xs text-subtle-foreground leading-normal">
              Update client contact details and internal workspace notes.
            </DialogDescription>
          </DialogHeader>

          {/* Form Fields Container */}
          <div className="space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <User className="size-3.5 text-accent" />
                <span>Customer Name</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Amanjeet Sharma"
                required
                className="h-9 px-3 text-xs bg-surface border-border text-foreground placeholder:text-subtle-foreground/50 rounded-xl focus-visible:ring-1 focus-visible:ring-accent transition-all shadow-xs"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Mail className="size-3.5 text-accent" />
                <span>Email Address</span>
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="client@example.com"
                required
                className="h-9 px-3 text-xs bg-surface border-border text-foreground placeholder:text-subtle-foreground/50 rounded-xl focus-visible:ring-1 focus-visible:ring-accent transition-all shadow-xs"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Phone className="size-3.5 text-accent" />
                <span>Phone Number</span>
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="07413995089"
                required
                className="h-9 px-3 text-xs bg-surface border-border text-foreground placeholder:text-subtle-foreground/50 rounded-xl focus-visible:ring-1 focus-visible:ring-accent transition-all shadow-xs"
              />
            </div>

            {/* Internal Notes */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <FileText className="size-3.5 text-accent" />
                  <span>Internal Notes</span>
                  <span className="text-[10px] text-subtle-foreground/70 font-normal">
                    (Staff only)
                  </span>
                </label>
                <span
                  className={`text-[10px] font-mono transition-colors ${
                    isNearLimit
                      ? "text-warning font-semibold"
                      : "text-subtle-foreground/60"
                  }`}
                >
                  {notesLength}/{MAX_NOTES_LENGTH}
                </span>
              </div>
              <Textarea
                rows={3}
                maxLength={MAX_NOTES_LENGTH}
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Add private booking notes or instructions..."
                className="min-h-[80px] max-h-[140px] px-3 py-2 text-xs bg-surface border-border text-foreground placeholder:text-subtle-foreground/50 rounded-xl focus-visible:ring-1 focus-visible:ring-accent transition-all shadow-xs resize-none"
              />
            </div>
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
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="h-8.5 px-4 rounded-xl bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-xs hover:opacity-95"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingEditDialog;