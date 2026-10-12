import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading, signOut } = useAuth();
  const { isAdmin, isAtendente, loading: roleLoading } = useUserRole();
  const location = useLocation();

  if (loading || (session && roleLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (!isAdmin && !isAtendente) return (
    <div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-background text-foreground">
      <p>Acesso ao CRM não autorizado. Solicite liberação ao administrador.</p>
      <Button onClick={() => void signOut()}>Sair</Button>
    </div>
  );

  return <>{children}</>;
}
