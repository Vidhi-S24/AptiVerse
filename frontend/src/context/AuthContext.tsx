import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface AuthContextType {
  user: any | null;
  session: any | null;
  role: string | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [currSession, setCurrSession] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const syncWithBackend = async (session: any) => {
    if (!session) {
      setUser(null);
      setCurrSession(null);
      setRole(null);
      setLoading(false);
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${API_URL}/api/auth/sync`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${session.access_token}` },
      });
      const data = await response.json();

      setUser(session.user);
      setCurrSession(session);
      setRole(data.user?.role || "USER");
    } catch (err) {
      console.error("Auth sync failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncWithBackend(session);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncWithBackend(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session: currSession,
      role,
      loading,
      isAdmin: role === 'ADMIN',
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};