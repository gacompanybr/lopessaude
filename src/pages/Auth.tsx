import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import logoAsset from "@/assets/logo-lopes-novo.png.asset.json";
const logo = logoAsset.url;

const loginSchema = z.object({
  identifier: z.string().trim().min(2, "Informe e-mail ou usuário").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});

const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Informe seu nome").max(100),
    email: z.string().trim().email("E-mail inválido").max(255),
    password: z.string().min(6, "Mínimo 6 caracteres").max(72),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "As senhas não conferem",
    path: ["confirm"],
  });

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || "/leads";

  useEffect(() => {
    if (!authLoading && session) navigate(from, { replace: true });
  }, [session, authLoading, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ identifier: loginIdentifier, password: loginPassword });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);

    // Resolve e-mail a partir do identificador (e-mail OU nome de usuário).
    let email = parsed.data.identifier;
    if (!email.includes("@")) {
      const { data: resolvedEmail, error: rpcErr } = await supabase.rpc(
        "get_email_by_username",
        { _username: email }
      );
      if (rpcErr || !resolvedEmail) {
        setLoading(false);
        toast.error("Usuário ou senha incorretos");
        return;
      }
      email = resolvedEmail as string;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: parsed.data.password,
    });
    setLoading(false);
    if (error) {
      const msg = error.message.includes("Invalid login")
        ? "E-mail/usuário ou senha incorretos"
        : error.message;
      toast.error(msg);
      return;
    }
    toast.success("Login realizado!");
    navigate(from, { replace: true });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ name, email, password, confirm });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/leads`,
        data: { display_name: parsed.data.name },
      },
    });
    setLoading(false);
    if (error) {
      const msg = error.message.toLowerCase().includes("already")
        ? "Este e-mail já está cadastrado"
        : error.message;
      toast.error(msg);
      return;
    }
    toast.success("Cadastro realizado! Faça login para continuar.");
    setLoginIdentifier(parsed.data.email);
    setName(""); setEmail(""); setPassword(""); setConfirm("");
    setTab("login");
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/leads`,
    });
    if (result.error) {
      setLoading(false);
      toast.error("Falha ao entrar com Google");
      return;
    }
    if (result.redirected) return;
    navigate("/leads", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
      <Card className="w-full max-w-md p-8 shadow-xl rounded-2xl border-blue-100">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Lopes Saúde e Odontologia" className="h-20 w-auto mb-3" />
          <h1 className="text-2xl font-bold text-foreground">Acesso ao CRM</h1>
          <p className="text-sm text-muted-foreground mt-1">Entre para gerenciar seus leads</p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-identifier">E-mail ou usuário</Label>
                <Input
                  id="login-identifier"
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="seu@email.com  ou  nome.usuario"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Senha</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
              <Button type="submit" className="w-full rounded-xl" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl"
              onClick={handleGoogle}
              disabled={loading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Entrar com Google
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Não tem conta?{" "}
              <button type="button" onClick={() => setTab("signup")} className="text-primary font-medium hover:underline">
                Cadastre-se
              </button>
            </p>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Nome</Label>
                <Input id="signup-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">E-mail</Label>
                <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" autoComplete="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Senha</Label>
                <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" autoComplete="new-password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm">Confirmar senha</Label>
                <Input id="signup-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repita a senha" autoComplete="new-password" required />
              </div>
              <Button type="submit" className="w-full rounded-xl" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar conta"}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Já tem conta?{" "}
              <button type="button" onClick={() => setTab("login")} className="text-primary font-medium hover:underline">
                Entrar
              </button>
            </p>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
