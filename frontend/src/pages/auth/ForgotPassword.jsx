import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Mail,
  ArrowLeft,
  Home,
  CheckCircle,
} from 'lucide-react';

import { toast } from 'sonner';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const ForgotPassword = () => {
  const navigate = useNavigate();

  const {
    forgotPassword,
    isLoading,
    error,
    isSuccess,
    successMessage,
    clearState,
  } = usePasswordStore();

  const [showError, setShowError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // FIX: Reset global store state on page mount and unmount to keep the view fresh
  useEffect(() => {
    clearState();
    return () => clearState();
  }, [clearState]);

  useEffect(() => {
    if (error) {
      setShowError(true);

      const timer = setTimeout(() => {
        setShowError(false);
        clearState();
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [error, clearState]);

  const onSubmit = async (data) => {
    try {
      await forgotPassword(data.email);
    } catch (err) {
      // handled by store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-muted p-4 relative font-sans text-foreground">

      {/* HOME BUTTON */}
      <Button
        variant="outline"
        className="absolute top-4 left-4 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <Home className="h-4 w-4 mr-2" />
        Home
      </Button>

      <Card className="w-full max-w-md bg-card text-card-foreground border-border">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-heading">
            Forgot Password?
          </CardTitle>

          <CardDescription className="text-muted-foreground">
            Enter your email address and we'll send you
            a link to reset your password
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
            <Alert className="border-success/40 bg-success/10 text-success">
              <CheckCircle className="h-4 w-4 text-success" />

              <AlertDescription className="text-foreground">
                {successMessage ||
                  'Password reset link sent to your email address.'}
              </AlertDescription>
            </Alert>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address
              </Label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-9 bg-input border-border"
                  {...register('email')}
                  disabled={isSuccess}
                />
              </div>

              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full cursor-pointer bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
              disabled={isLoading || isSuccess}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending reset link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>
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

export default ForgotPassword;