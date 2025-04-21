
import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const { user } = useAuth();

  // Redirect if user is already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Wisefolio</h1>
          <p className="text-muted-foreground mt-2">
            Your intelligent investment companion
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
};

export default Auth;
