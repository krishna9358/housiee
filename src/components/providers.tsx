"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { Provider } from "react-redux";
import { useSession } from "@/lib/auth-client";
import { makeStore, AppStore } from "@/lib/store";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setUser, setLoading, UserRole } from "@/lib/store/slices/userSlice";

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

function AuthSyncProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { data: session, isPending } = useSession();
  const { user, isLoading, isAuthenticated } = useAppSelector(
    (state) => state.user
  );

  useEffect(() => {
    dispatch(setLoading(isPending));
  }, [isPending, dispatch]);

  useEffect(() => {
    if (session?.user) {
      const userData: User = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role:
          ((session.user as Record<string, unknown>).role as UserRole) ||
          "USER",
        image: session.user.image || undefined,
      };
      dispatch(setUser(userData));
    } else if (!isPending) {
      dispatch(setUser(null));
    }
  }, [session, isPending, dispatch]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function StoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <AuthSyncProvider>{children}</AuthSyncProvider>
    </StoreProvider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
