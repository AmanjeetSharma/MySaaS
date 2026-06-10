import React from 'react'
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useUserStore } from '@/stores/userStore';

const SetPassword = () => {
  const user = useUserStore((state) => state.userProfile);
  const hasLocalAuth = user?.providers?.local?.enabled;

  if (hasLocalAuth) {
    toast.error("You already have a password set for your account. You can change it from the change password tab.", { duration: 5000 });
    return (
      <Navigate to="/settings/account/change-password" replace />
    );
  }
  return (
    <div>
      <h1>Set Password</h1>
      <p>This page allows users who registered using Google to set a password for their account. This is useful if they want to log in using email and password in the future.</p>
    </div>
  )
}

export default SetPassword
