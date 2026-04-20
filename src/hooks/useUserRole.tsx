import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AppRole = "admin" | "atendente";

export function useUserRole() {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid);
    setRoles((data ?? []).map((r: any) => r.role as AppRole));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }
    fetchRoles(user.id);

    // Realtime: refetch quando os papéis do usuário mudarem
    const channel = supabase
      .channel(`user_roles:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_roles", filter: `user_id=eq.${user.id}` },
        () => fetchRoles(user.id)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, authLoading, fetchRoles]);

  return {
    roles,
    isAdmin: roles.includes("admin"),
    isAtendente: roles.includes("atendente"),
    loading: authLoading || loading,
  };
}
