import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      const timer = setTimeout(() => {
        setShouldRedirect(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, user]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (shouldRedirect && !user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}