// src/components/account/ChangePasswordCard.jsx

import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  CircleCheck,
} from "lucide-react";

import { usePasswordStore } from "@/stores/passwordStore";
import passwordImage from "@/assets/password1.png";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function PasswordField({
  label,
  name,
  value,
  onChange,
  placeholder,
  visible,
  onToggle,
}) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="block text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </label>
      <div className="relative rounded-xl border border-input bg-muted/20 transition-all duration-200 focus-within:border-primary/60 focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/10">
        <input
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className="h-10 w-full bg-transparent px-3.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors duration-150 hover:text-foreground focus:text-foreground focus:outline-none cursor-pointer"
        >
          {visible ? (
            <EyeOff className="h-4 w-4 stroke-[1.75]" />
          ) : (
            <Eye className="h-4 w-4 stroke-[1.75]" />
          )}
        </button>
      </div>
    </div>
  );
}

function Alert({ type, message }) {
  if (!message) return null;

  const isSuccess = type === "success";

  return (
    <div
      className={`mb-6 flex items-start gap-3 rounded-xl border p-3 text-sm animate-in fade-in-50 slide-in-from-top-2 duration-200 ${isSuccess
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "border-destructive/20 bg-destructive/10 text-destructive"
        }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 stroke-2" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 stroke-2" />
      )}
      <span className="font-medium leading-tight">{message}</span>
    </div>
  );
}

export default function ChangePasswordCard({ className = "" }) {
  const {
    changePassword,
    isLoading,
    error,
    isSuccess,
    successMessage,
    clearState,
  } = usePasswordStore();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    return () => clearState();
  }, [clearState]);

  useEffect(() => {
    if (isSuccess) {
      setIsDialogOpen(true);
    }
  }, [isSuccess]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const togglePassword = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await changePassword(
        formData.currentPassword,
        formData.newPassword,
        formData.confirmNewPassword
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetFormPanel = () => {
    setIsDialogOpen(false);
    clearState();
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setShowPassword({
      current: false,
      new: false,
      confirm: false,
    });
  };

  return (
    <>
      <div
        className={`w-full overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xl sm:rounded-3xl ${className}`}
      >
        <div className="grid lg:grid-cols-[240px_1fr]">
          {/* SIDE PANEL (Desktop Only) */}
          <div className="hidden lg:flex relative flex-col justify-between overflow-hidden border-r border-border bg-muted/20 p-8">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70">
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary/15 blur-2xl dark:bg-primary/20 dark:blur-3xl" />
              <div className="absolute bottom-4 right-4 h-32 w-32 rounded-full bg-sky-400/10 blur-xl dark:bg-sky-400/15 dark:blur-2xl" />
            </div>

            <div className="relative z-10 flex flex-col gap-2.5">
              <div className="flex w-fit items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-2.5 py-0.5 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Security
                </span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Change password
              </h2>
              <p className="text-xs leading-relaxed text-muted-foreground/90">
                Keep your account safe with a strong, unique password configuration.
              </p>
            </div>

            <div className="relative z-10 mt-6 flex justify-center">
              <img
                src={passwordImage}
                alt="Password illustration"
                className="pointer-events-none w-full max-w-35 select-none object-contain drop-shadow-md transition-all duration-300 dark:brightness-200 dark:contrast-125 dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              />
            </div>
          </div>

          {/* FORM PANEL */}
          <div className="p-4 sm:p-6 md:p-8">
            {/* MOBILE HEADER */}
            <div className="mb-6 flex flex-col gap-2 lg:hidden">
              <div className="flex w-fit items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Security
                </span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Change password
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Keep your account safe with a strong, unique password.
              </p>
            </div>

            {!isSuccess && <Alert type="error" message={error} />}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <PasswordField
                label="Current password"
                name="currentPassword"
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={handleChange}
                visible={showPassword.current}
                onToggle={() => togglePassword("current")}
              />

              <PasswordField
                label="New password"
                name="newPassword"
                placeholder="Create a strong password"
                value={formData.newPassword}
                onChange={handleChange}
                visible={showPassword.new}
                onToggle={() => togglePassword("new")}
              />

              <PasswordField
                label="Confirm password"
                name="confirmNewPassword"
                placeholder="Re-enter new password"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                visible={showPassword.confirm}
                onToggle={() => togglePassword("confirm")}
              />

              <div className="pt-2 border-t border-border/60" />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 rounded-xl font-semibold cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <LockKeyhole className="h-4 w-4 stroke-2" />
                    Update password
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* SUCCESS DIALOG POPUP */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="max-w-90 sm:max-w-100 rounded-2xl p-6 text-center gap-0 outline-none"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="flex flex-col items-center justify-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
            </div>

            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              Password Updated!
            </DialogTitle>

            <DialogDescription className="pt-2 text-sm text-muted-foreground leading-relaxed">
              {successMessage || "Your account security configurations have been saved successfully."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6">
            <Button
              type="button"
              variant="default"
              onClick={handleResetFormPanel}
              className="w-full h-10 rounded-xl font-semibold cursor-pointer"
            >
              <CircleCheck className="h-4 w-4 stroke-2" />
              All done!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}