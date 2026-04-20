import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Loader2, Mail, MapPin, MessageSquare, Plus, Save, ShieldCheck, Trash2, Upload, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import UserMenu from "@/components/UserMenu";

type CompanySettings = {
  id?: string;
  logo_url: string | null;
  company_name: string;
  address: string;
  cnpj: string;
  whatsapp: string;
  email: string;
};

type ProfileType = {
  id: string;
  name: string;
  active: boolean;
};

type UserWithRoles = {
  id: string;
  display_name: string | null;
  email: string | null;
  roles: ("admin" | "atendente")[];
};

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [company, setCompany] = useState<CompanySettings>({
    logo_url: null,
    company_name: "",
    address: "",
    cnpj: "",
    whatsapp: "",
    email: user?.email ?? "",
  });
  const [savingCompany, setSavingCompany] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [profiles, setProfiles] = useState<ProfileType[]>([]);
  const [newProfile, setNewProfile] = useState("");
  const [users, setUsers] = useState<UserWithRoles[]>([]);

  const loadAll = async () => {
    const [{ data: comp }, { data: profs }, { data: profUsers }, { data: rolesRows }] = await Promise.all([
      supabase.from("company_settings").select("*").maybeSingle(),
      supabase.from("profile_types").select("*").order("created_at", { ascending: true }),
      supabase.from("profiles").select("id, display_name, email"),
      supabase.from("user_roles").select("user_id, role"),
    ]);

    if (comp) {
      setCompany({
        id: comp.id,
        logo_url: comp.logo_url,
        company_name: comp.company_name ?? "",
        address: comp.address ?? "",
        cnpj: comp.cnpj ?? "",
        whatsapp: comp.whatsapp ?? "",
        email: comp.email ?? user?.email ?? "",
      });
    }
    setProfiles((profs ?? []) as ProfileType[]);

    const rolesByUser = new Map<string, ("admin" | "atendente")[]>();
    (rolesRows ?? []).forEach((r: any) => {
      const arr = rolesByUser.get(r.user_id) ?? [];
      arr.push(r.role);
      rolesByUser.set(r.user_id, arr);
    });
    setUsers(
      (profUsers ?? []).map((u: any) => ({
        id: u.id,
        display_name: u.display_name,
        email: u.email,
        roles: rolesByUser.get(u.id) ?? [],
      }))
    );
  };

  useEffect(() => {
    loadAll();
  }, []);

  // ----- Empresa -----
  const handleLogoUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `logo-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("company-assets").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("company-assets").getPublicUrl(path);
      setCompany((c) => ({ ...c, logo_url: data.publicUrl }));
      toast.success("Logo enviada");
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao enviar logo");
    } finally {
      setUploading(false);
    }
  };

  const saveCompany = async () => {
    setSavingCompany(true);
    try {
      const payload = {
        logo_url: company.logo_url,
        company_name: company.company_name,
        address: company.address,
        cnpj: company.cnpj,
        whatsapp: company.whatsapp,
        email: company.email,
      };
      const { error } = company.id
        ? await supabase.from("company_settings").update(payload).eq("id", company.id)
        : await supabase.from("company_settings").insert(payload);
      if (error) throw error;
      toast.success("Configurações salvas");
      loadAll();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao salvar");
    } finally {
      setSavingCompany(false);
    }
  };

  // ----- Perfis -----
  const addProfile = async () => {
    if (!newProfile.trim()) return;
    const { error } = await supabase.from("profile_types").insert({ name: newProfile.trim() });
    if (error) return toast.error(error.message);
    setNewProfile("");
    toast.success("Perfil criado");
    loadAll();
  };

  const updateProfile = async (id: string, patch: Partial<ProfileType>) => {
    const { error } = await supabase.from("profile_types").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    loadAll();
  };

  const removeProfile = async (id: string) => {
    if (!confirm("Remover este perfil?")) return;
    const { error } = await supabase.from("profile_types").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Perfil removido");
    loadAll();
  };

  // ----- Vínculo usuário ↔ role -----
  const setUserRole = async (userId: string, role: "admin" | "atendente") => {
    // remove roles anteriores e insere a nova (perfil único por usuário nesta etapa)
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) return toast.error(error.message);
    toast.success("Perfil vinculado");
    loadAll();
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/10 dark:text-white"
              onClick={() => navigate("/leads")}
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
            <div className="bg-primary-foreground/15 rounded-xl p-2">
              <ShieldCheck className="w-6 h-6 dark:text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl dark:text-white">Configurações</h1>
              <p className="text-sm opacity-80 dark:text-white">Geral e perfis de acesso</p>
            </div>
          </div>
          <UserMenu />
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <Tabs defaultValue="general">
          <TabsList className="mb-6">
            <TabsTrigger value="general" className="gap-2">
              <Building2 className="w-4 h-4" /> Configuração Geral
            </TabsTrigger>
            <TabsTrigger value="profiles" className="gap-2">
              <Users className="w-4 h-4" /> Perfis
            </TabsTrigger>
          </TabsList>

          {/* ============== GERAL ============== */}
          <TabsContent value="general">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg">Dados da Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl border bg-muted/40 flex items-center justify-center overflow-hidden">
                    {company.logo_url ? (
                      <img src={company.logo_url} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <Building2 className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Logo da empresa</Label>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                    />
                    <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {uploading ? "Enviando..." : "Enviar logo"}
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome da clínica / empresa</Label>
                    <Input value={company.company_name} onChange={(e) => setCompany({ ...company, company_name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>CNPJ</Label>
                    <Input value={company.cnpj} onChange={(e) => setCompany({ ...company, cnpj: e.target.value })} placeholder="00.000.000/0000-00" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Endereço</Label>
                    <Input value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><MessageSquare className="w-3.5 h-3.5" /> WhatsApp</Label>
                    <Input value={company.whatsapp} onChange={(e) => setCompany({ ...company, whatsapp: e.target.value })} placeholder="(14) 99668-4609" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> E-mail</Label>
                    <Input type="email" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={saveCompany} disabled={savingCompany} className="gap-2">
                    {savingCompany ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============== PERFIS ============== */}
          <TabsContent value="profiles" className="space-y-6">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg">Perfis de acesso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome do perfil (ex: Gerente)"
                    value={newProfile}
                    onChange={(e) => setNewProfile(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addProfile()}
                  />
                  <Button onClick={addProfile} className="gap-2"><Plus className="w-4 h-4" /> Adicionar</Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="w-32">Ativo</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <Input
                            defaultValue={p.name}
                            onBlur={(e) => e.target.value !== p.name && updateProfile(p.id, { name: e.target.value })}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch checked={p.active} onCheckedChange={(v) => updateProfile(p.id, { active: v })} />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => removeProfile(p.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {profiles.length === 0 && (
                      <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">Nenhum perfil cadastrado</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg">Vincular usuários a perfis</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Perfil atual</TableHead>
                      <TableHead className="w-48">Definir perfil</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.display_name ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell>
                          {u.roles.length === 0 ? (
                            <Badge variant="outline">sem perfil</Badge>
                          ) : (
                            u.roles.map((r) => (
                              <Badge key={r} variant={r === "admin" ? "default" : "secondary"} className="mr-1 capitalize">{r}</Badge>
                            ))
                          )}
                        </TableCell>
                        <TableCell>
                          <Select onValueChange={(v) => setUserRole(u.id, v as any)}>
                            <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Administrador</SelectItem>
                              <SelectItem value="atendente">Atendente</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;
