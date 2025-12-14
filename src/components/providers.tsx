"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "@/lib/auth-client";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/lib/store";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setUser, UserRole } from "@/lib/store/slices/userSlice";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

function AuthProviderInner({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const [user, setLocalUser] = useState<User | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (session?.user) {
      const userData = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: ((session.user as Record<string, unknown>).role as UserRole) || "USER",
        image: session.user.image || undefined,
      };
      setLocalUser(userData);
      dispatch(setUser(userData));
    } else {
      setLocalUser(null);
      dispatch(setUser(null));
    }
  }, [session, dispatch]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isPending,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </ReduxProvider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// Re-export hooks for convenience
export { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
