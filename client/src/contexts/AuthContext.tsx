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

  const signIn = async (username: string, password: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Invalid username or password');
      }

      const data = await response.json();
      setAppUser({
        id: data.id,
        supabase_user_id: data.id,
        email: username,
        display_name: username,
        role: 'admin',
        created_at: new Date().toISOString(),
      });
      setIsGuest(false);
    } catch (error: any) {
      throw error;
    }
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
