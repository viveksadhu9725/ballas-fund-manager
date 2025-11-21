import { createContext, useContext, useState } from 'react';
import type { AppUser } from '@shared/schema';

interface AuthContextType {
  appUser: AppUser | null;
  isGuest: boolean;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    // Simple admin authentication: any non-empty email and password grants admin access
    // This is a pragmatic workaround for development
    if (email && password) {
      setAppUser({
        id: crypto.randomUUID(),
        supabase_user_id: crypto.randomUUID(),
        email,
        display_name: email.split('@')[0],
        role: 'admin',
        created_at: new Date().toISOString(),
      });
      setIsGuest(false);
      return;
    }
    throw new Error('Invalid email or credentials');
  };

  const signInAsGuest = async () => {
    setIsGuest(true);
    setAppUser(null);
    setLoading(false);
  };

  const signOut = async () => {
    setIsGuest(false);
    setAppUser(null);
  };

  const isAdmin = appUser?.role === 'admin' || false;

  return (
    <AuthContext.Provider
      value={{
        appUser,
        isGuest,
        isAdmin,
        loading,
        signIn,
        signInAsGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
