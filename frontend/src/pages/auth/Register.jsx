import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '@/stores';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  Loader2,
  Mail,
  Lock,
  User,
  Image,
  Eye,
  EyeOff,
  Home,
} from 'lucide-react';
import { UAParser } from 'ua-parser-js';

import { toast } from 'sonner';

const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),

  email: z.string().email('Please enter a valid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),

  avatar: z.any().optional(),
});

const Register = () => {
  const navigate = useNavigate();

  const {
    register: registerUser,
    googleLogin,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  const [showDialog, setShowDialog] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showError, setShowError] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });


  const getDeviceName = () => {
    const parser = new UAParser();
    const result = parser.getResult();
    const { browser, os, device } = result;

    if (device.vendor && device.model) {
      return `${device.vendor} ${device.model} (${browser.name || 'Unknown Browser'})`;
    }

    return `${browser.name || 'Unknown Browser'} on ${os.name || 'Unknown OS'}`;
  };

  const avatar = watch('avatar');

  useEffect(() => {
    if (error) {
      setShowError(true);

      const timer = setTimeout(() => {
        setShowError(false);
        clearError();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setValue('avatar', file);

      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const onSubmit = async (data) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        avatar: data.avatar,
      });

      setRegisteredEmail(data.email);
      setShowDialog(true);
    } catch (err) {
      // handled by store
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin({
        token: credentialResponse.credential,
        device: getDeviceName()
      });

      toast.success('Google login successful! Redirecting to dashboard...');

      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      toast.error('Google registration failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google registration failed. Please try again.');
  };


  const googleWrapperRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (googleWrapperRef.current) {
        setContainerWidth(googleWrapperRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);



  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-muted p-4 relative">

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
              Create an account
            </CardTitle>

            <CardDescription>
              Enter your information to get started
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {showError && error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* NAME */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-9"
                    {...register('name')}
                  />
                </div>

                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* EMAIL */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-9"
                    {...register('email')}
                  />
                </div>

                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* PASSWORD ONLY */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-9 pr-10"
                    {...register('password')}
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

                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* AVATAR */}
              <div className="space-y-2">
                <Label htmlFor="avatar">
                  Avatar (Optional)
                </Label>

                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      className="pl-9"
                      onChange={handleAvatarChange}
                    />
                  </div>

                  {avatarPreview && (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  )}
                </div>
              </div>

              {/* SUBMIT */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>
            </form>

            {/* DIVIDER */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>

              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* GOOGLE LOGIN */}
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
              <div ref={googleWrapperRef} className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  text="signup_with"
                  shape="rectangular"
                  width={containerWidth}
                  logo_alignment="center"

                />
              </div>
            </GoogleOAuthProvider>
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* DIALOG */}
      <Dialog
        open={showDialog}
        onOpenChange={setShowDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Verify Your Email
            </DialogTitle>

            <DialogDescription className="space-y-2 pt-4">
              <p>
                We've sent a verification email to{' '}
                <strong>{registeredEmail}</strong>.
              </p>

              <p>
                Please check your inbox and click the
                verification link to activate your account.
              </p>

              <p className="text-sm text-muted-foreground">
                The verification link will expire in 10
                minutes.
              </p>
            </DialogDescription>
          </DialogHeader>

          <Button onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Register;