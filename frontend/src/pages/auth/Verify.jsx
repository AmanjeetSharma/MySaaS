import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import { toast } from 'sonner';

const Verify = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { verifyEmail, isLoading, error, clearError } = useAuthStore();
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, success, error
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (token) {
      handleVerification();
    } else {
      setVerificationStatus('error');
      toast.error('Invalid verification link');
    }
  }, [token]);

  useEffect(() => {
    if (verificationStatus === 'success') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/signin');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [verificationStatus, navigate]);

  const handleVerification = async () => {
    try {
      await verifyEmail(token);
      setVerificationStatus('success');
      toast.success('Email verified successfully! Redirecting to sign in...');
    } catch (err) {
      setVerificationStatus('error');
      toast.error(error || 'Verification failed. Please try again.');
    } finally {
      setTimeout(() => clearError(), 3000);
    }
  };

  if (verificationStatus === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h3 className="text-lg font-semibold">Verifying Your Email</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we verify your email address...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Email Verified!</CardTitle>
            <CardDescription>
              Your email has been successfully verified.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Redirecting you to login page in {countdown} seconds...
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/signin')} className="gap-2">
              <Mail className="h-4 w-4" />
              Go to Sign In Now
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">Verification Failed</CardTitle>
          <CardDescription>
            We couldn't verify your email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {error || 'The verification link is invalid or has expired. Please try signing up again.'}
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-center gap-2">
          <Button onClick={() => navigate('/signup')} className="cursor-pointer">
            Sign Up Again
          </Button>
          <Button variant="outline" onClick={() => navigate('/signin')} className="cursor-pointer">
            Back to Sign In
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Verify;