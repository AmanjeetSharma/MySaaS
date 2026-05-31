// RESET PASSWORD PAGE

import { useState, useEffect } from 'react';
import {
  useNavigate,
  useSearchParams,
  Link,
} from 'react-router-dom';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { usePasswordStore } from '@/stores';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Alert, AlertDescription } from '@/components/ui/alert';

import {
  Loader2,
  Lock,
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Home,
} from 'lucide-react';

import { toast } from 'sonner';

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /[A-Z]/,
        'Password must contain at least one uppercase letter'
      )
      .regex(
        /[a-z]/,
        'Password must contain at least one lowercase letter'
      )
      .regex(
        /[0-9]/,
        'Password must contain at least one number'
      ),

    confirmPassword: z.string(),
  })

  .refine(
    (data) =>
      data.newPassword === data.confirmPassword,
    {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }
  );

const ResetPassword = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  const {
    resetPassword,
    isLoading,
    error,
    isSuccess,
    successMessage,
    clearState,
  } = usePasswordStore();

  const [showError, setShowError] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      toast.error(
        'Invalid reset link. Please request a new one.'
      );

      setTimeout(
        () => navigate('/forgot-password'),
        2000
      );
    }
  }, [token, navigate]);

  useEffect(() => {
    if (error) {
      setShowError(true);

      const timer = setTimeout(() => {
        setShowError(false);
        clearState();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, clearState]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate('/signin');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  const onSubmit = async (data) => {
    if (!token) return;

    try {
      await resetPassword(
        token,
        data.newPassword,
        data.confirmPassword
      );

      toast.success(
        'Password reset successful! Redirecting to sign in...'
      );
    } catch (err) {
      // handled by store
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 relative">

      {/* HOME BUTTON */}
      <Button
        variant="outline"
        className="absolute top-4 left-4"
        onClick={() => navigate('/')}
      >
        <Home className="h-4 w-4 mr-2" />
        Home
      </Button>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">
            Create New Password
          </CardTitle>

          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {showError && error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {isSuccess && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />

              <AlertDescription className="text-green-800 dark:text-green-300">
                {successMessage ||
                  'Password reset successfully! Redirecting to login...'}
              </AlertDescription>
            </Alert>
          )}

          {!isSuccess && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* NEW PASSWORD */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">
                  New Password
                </Label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                  <Input
                    id="newPassword"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    placeholder="••••••••"
                    className="pl-9 pr-10"
                    {...register('newPassword')}
                    disabled={isLoading}
                  />

                  {/* EYE BUTTON */}
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {errors.newPassword && (
                  <p className="text-sm text-destructive">
                    {errors.newPassword.message}
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters
                  with uppercase, lowercase, and numbers
                </p>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirm New Password
                </Label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                  <Input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? 'text'
                        : 'password'
                    }
                    placeholder="••••••••"
                    className="pl-9 pr-10"
                    {...register('confirmPassword')}
                    disabled={isLoading}
                  />

                  {/* EYE BUTTON */}
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* BUTTON */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          <Link
            to="/signin"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;