import React, { createContext } from "react";
import { useAuthState } from "@/hooks/useAuth";

export const AuthContext = createContext<ReturnType<typeof useAuthState> | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthState();
  
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
