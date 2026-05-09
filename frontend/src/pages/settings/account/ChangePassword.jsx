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
} from "lucide-react";

import { usePasswordStore } from "@/stores/passwordStore";
import passwordImage from "@/assets/password1.png";

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
    <div className="space-y-1.5">

      <label className="block text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </label>

      <div className="relative">

        <input
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className="h-10 w-full rounded-xl border border-input bg-muted/40 px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all duration-150 focus:border-ring/60 focus:bg-background focus:ring-2 focus:ring-ring/10"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors duration-150 hover:text-foreground"
        >

          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
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
      className={`mb-5 flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm ${
        isSuccess
          ? "border-green-500/20 bg-green-500/8 text-green-600 dark:text-green-400"
          : "border-red-500/20 bg-red-500/8 text-red-600 dark:text-red-400"
      }`}
    >

      {isSuccess ? (
        <CheckCircle2 className="mt-px h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle className="mt-px h-4 w-4 shrink-0" />
      )}

      <span>{message}</span>

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

  useEffect(() => {
    return () => clearState();
  }, [clearState]);

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

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });

    } catch (err) {
      console.error(err);
    }
  };

  return (

    <div
      className={`w-full overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-[0_8px_40px_rgba(0,0,0,0.14)] sm:rounded-3xl ${className}`}
    >

      <div className="grid lg:grid-cols-[220px_1fr]">

        {/* SIDE PANEL */}
        <div className="hidden lg:flex relative flex-col justify-between overflow-hidden border-r border-border bg-muted/30 p-8">

          {/* BG BLOBS */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >

            <div className="absolute -left-16 -top-20 h-56 w-56 rounded-full bg-primary/8 blur-3xl" />

            <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-primary/5 blur-2xl" />

          </div>

          {/* HEADER */}
          <div className="relative z-10 flex flex-col gap-2">

            <div className="flex w-fit items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1">

              <ShieldCheck className="h-3 w-3 text-muted-foreground" />

              <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Security
              </span>

            </div>

            <h1 className="text-base font-semibold tracking-tight text-foreground">
              Change password
            </h1>

            <p className="max-w-[220px] text-xs leading-relaxed text-muted-foreground">
              Keep your account safe with a strong, unique password.
            </p>

          </div>

          {/* IMAGE */}
          <div className="relative z-10 mt-8 flex justify-center">

            <img
              src={passwordImage}
              alt="Password illustration"
              className="pointer-events-none w-full max-w-[165px] select-none object-contain drop-shadow-xl"
            />

          </div>

        </div>

        {/* FORM PANEL */}
        <div className="p-5 sm:p-7 md:p-8">

          {/* MOBILE HEADER */}
          <div className="mb-6 flex flex-col gap-2 lg:hidden">

            <div className="flex w-fit items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1">

              <ShieldCheck className="h-3 w-3 text-muted-foreground" />

              <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Security
              </span>

            </div>

            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              Change password
            </h1>

            <p className="max-w-[280px] text-sm leading-relaxed text-muted-foreground">
              Keep your account safe with a strong, unique password.
            </p>

          </div>

          <Alert
            type={isSuccess ? "success" : "error"}
            message={isSuccess ? successMessage : error}
          />

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

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

            <div className="border-t border-border" />

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-foreground text-sm font-medium text-background transition-all duration-150 hover:opacity-85 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >

              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <LockKeyhole className="h-4 w-4" />
                  Update password
                </>
              )}

            </button>

          </form>

        </div>

      </div>

    </div>
  );
}