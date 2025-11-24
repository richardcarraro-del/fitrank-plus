import React from "react";
import { AuthContext, useAuthState } from "@/hooks/useSupabaseAuth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthState();
  
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
