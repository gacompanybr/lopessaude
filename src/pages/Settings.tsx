import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Loader2, Mail, MapPin, MessageSquare, Pencil, Plus, Save, ShieldCheck, Trash2, Upload, Users, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import UserMenu from "@/components/UserMenu";

type ProfileCategory = "administrador" | "atendente" | "comercial" | "gerente" | "outro";

const CATEGORIES: { value: ProfileCategory; label: string }[] = [
  { value: "administrador", label: "Administrador" },
  { value: "atendente", label: "Atendente" },
  { value: "comercial", label: "Comercial" },
  { value: "gerente", label: "Gerente" },
  { value: "outro", label: "Outro" },
];

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
  type: ProfileCategory;
  active: boolean;
};

type UserRow = {
  id: string;
  display_name: string | null;
  email: string | null;
  profile_type_id: string | null;
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
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileType, setNewProfileType] = useState<ProfileCategory>("atendente");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<ProfileCategory>("outro");

  const [users, setUsers] = useState<UserRow[]>([]);

  // Novo usuário
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [nuName, setNuName] = useState("");
  const [nuEmail, setNuEmail] = useState("");
  const [nuPassword, setNuPassword] = useState("");
  const [nuProfileId, setNuProfileId] = useState<string>("");

  const createUser = async () => {
    if (!nuEmail || !nuPassword || nuPassword.length < 6) {
      return toast.error("Informe e-mail e senha (mín. 6 caracteres)");
    }
    setCreatingUser(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-create-user", {
        body: {
          email: nuEmail.trim(),
          password: nuPassword,
          display_name: nuName.trim() || undefined,
          profile_type_id: nuProfileId || undefined,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success("Usuário cadastrado");
      setNewUserOpen(false);
      setNuName(""); setNuEmail(""); setNuPassword(""); setNuProfileId("");
      loadAll();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao cadastrar usuário");
    } finally {
      setCreatingUser(false);
    }
  };

  const loadAll = async () => {
    const [{ data: comp }, { data: profs }, { data: profUsers }, { data: assignments }] = await Promise.all([
      supabase.from("company_settings").select("*").maybeSingle(),
      supabase.from("profile_types").select("*").order("created_at", { ascending: true }),
      supabase.from("profiles").select("id, display_name, email"),
      supabase.from("user_profile_assignments").select("user_id, profile_type_id"),
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

    const map = new Map<string, string>();
    (assignments ?? []).forEach((a: any) => map.set(a.user_id, a.profile_type_id));
    setUsers(
      (profUsers ?? []).map((u: any) => ({
        id: u.id,
        display_name: u.display_name,
        email: u.email,
        profile_type_id: map.get(u.id) ?? null,
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
    if (!newProfileName.trim()) {
      toast.error("Informe o nome do perfil");
      return;
    }
    const { error } = await supabase
      .from("profile_types")
      .insert({ name: newProfileName.trim(), type: newProfileType });
    if (error) return toast.error(error.message);
    setNewProfileName("");
    setNewProfileType("atendente");
    toast.success("Perfil criado");
    loadAll();
  };

  const startEdit = (p: ProfileType) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditType(p.type);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return toast.error("Nome obrigatório");
    const { error } = await supabase
      .from("profile_types")
      .update({ name: editName.trim(), type: editType })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Perfil atualizado");
    cancelEdit();
    loadAll();
  };

  const toggleActive = async (id: string, active: boolean) => {
    const { error } = await supabase.from("profile_types").update({ active }).eq("id", id);
    if (error) return toast.error(error.message);
    loadAll();
  };

  const removeProfile = async (id: string) => {
    if (!confirm("Remover este perfil? Os vínculos de usuários a ele também serão removidos.")) return;
    const { error } = await supabase.from("profile_types").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Perfil removido");
    loadAll();
  };

  // ----- Vínculo usuário ↔ perfil -----
  const assignUser = async (userId: string, profileTypeId: string) => {
    const { error } = await supabase
      .from("user_profile_assignments")
      .upsert({ user_id: userId, profile_type_id: profileTypeId }, { onConflict: "user_id" });
    if (error) return toast.error(error.message);

    let profile = profiles.find((p) => p.id === profileTypeId);

    // Se o perfil se chama "Administrador" mas o tipo ainda não é "administrador",
    // sincroniza automaticamente o tipo para administrador.
    if (profile && profile.name.trim().toLowerCase() === "administrador" && profile.type !== "administrador") {
      const { error: typeErr } = await supabase
        .from("profile_types")
        .update({ type: "administrador" })
        .eq("id", profile.id);
      if (!typeErr) {
        profile = { ...profile, type: "administrador" };
      }
    }

    // Espelha o papel do usuário com base no TIPO do perfil vinculado.
    // Tipo "administrador" => admin; qualquer outro tipo => atendente (acesso padrão ao CRM).
    const role: "admin" | "atendente" = profile?.type === "administrador" ? "admin" : "atendente";
    await supabase.from("user_roles").delete().eq("user_id", userId);
    await supabase.from("user_roles").insert({ user_id: userId, role });

    toast.success("Perfil vinculado");
    loadAll();
  };

  const profileLabel = (id: string | null) => {
    if (!id) return null;
    return profiles.find((p) => p.id === id) ?? null;
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
                <CardTitle className="text-lg">Cadastrar perfil de acesso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-[1fr_220px_auto] gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Nome do perfil</Label>
                    <Input
                      placeholder="ex: Atendente Recepção"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addProfile()}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Tipo</Label>
                    <Select value={newProfileType} onValueChange={(v) => setNewProfileType(v as ProfileCategory)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addProfile} className="gap-2 w-full md:w-auto">
                      <Plus className="w-4 h-4" /> Adicionar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg">Perfis cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="w-44">Tipo</TableHead>
                      <TableHead className="w-24">Ativo</TableHead>
                      <TableHead className="w-28 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((p) => {
                      const isEditing = editingId === p.id;
                      return (
                        <TableRow key={p.id}>
                          <TableCell>
                            {isEditing ? (
                              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                            ) : (
                              <span className="font-medium">{p.name}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Select value={editType} onValueChange={(v) => setEditType(v as ProfileCategory)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {CATEGORIES.map((c) => (
                                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant="secondary" className="capitalize">
                                {CATEGORIES.find((c) => c.value === p.type)?.label ?? p.type}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Switch checked={p.active} onCheckedChange={(v) => toggleActive(p.id, v)} />
                          </TableCell>
                          <TableCell className="text-right">
                            {isEditing ? (
                              <div className="flex justify-end gap-1">
                                <Button size="icon" variant="ghost" onClick={() => saveEdit(p.id)}>
                                  <Check className="w-4 h-4 text-primary" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={cancelEdit}>
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-1">
                                <Button size="icon" variant="ghost" onClick={() => startEdit(p)}>
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => removeProfile(p.id)}>
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {profiles.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">Nenhum perfil cadastrado</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg">Usuários da plataforma</CardTitle>
                <Dialog open={newUserOpen} onOpenChange={setNewUserOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2"><UserPlus className="w-4 h-4" /> Adicionar usuário</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Cadastrar novo usuário</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-1.5">
                        <Label>Nome</Label>
                        <Input value={nuName} onChange={(e) => setNuName(e.target.value)} placeholder="Nome completo" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>E-mail</Label>
                        <Input type="email" value={nuEmail} onChange={(e) => setNuEmail(e.target.value)} placeholder="usuario@empresa.com" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Senha</Label>
                        <Input type="password" value={nuPassword} onChange={(e) => setNuPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Perfil de acesso</Label>
                        <Select value={nuProfileId} onValueChange={setNuProfileId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Padrão: Atendente" />
                          </SelectTrigger>
                          <SelectContent>
                            {profiles.filter((p) => p.active).map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} · {CATEGORIES.find((c) => c.value === p.type)?.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Se nenhum perfil for selecionado, o usuário recebe automaticamente o perfil <strong>Atendente</strong>.</p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewUserOpen(false)}>Cancelar</Button>
                      <Button onClick={createUser} disabled={creatingUser} className="gap-2">
                        {creatingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                        Cadastrar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Perfil atual</TableHead>
                      <TableHead className="w-56">Definir perfil</TableHead>
                      <TableHead className="w-20 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => {
                      const current = profileLabel(u.profile_type_id);
                      const isSelf = u.id === user?.id;
                      return (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.display_name ?? "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{u.email}</TableCell>
                          <TableCell>
                            {current ? (
                              <div className="flex items-center gap-2">
                                <Badge>{current.name}</Badge>
                                <span className="text-xs text-muted-foreground capitalize">
                                  {CATEGORIES.find((c) => c.value === current.type)?.label}
                                </span>
                              </div>
                            ) : (
                              <Badge variant="outline">sem perfil</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={u.profile_type_id ?? undefined}
                              onValueChange={(v) => assignUser(u.id, v)}
                            >
                              <SelectTrigger><SelectValue placeholder="Selecionar perfil..." /></SelectTrigger>
                              <SelectContent>
                                {profiles.filter((p) => p.active).map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.name} · {CATEGORIES.find((c) => c.value === p.type)?.label}
                                  </SelectItem>
                                ))}
                                {profiles.filter((p) => p.active).length === 0 && (
                                  <div className="px-2 py-1.5 text-sm text-muted-foreground">Cadastre um perfil ativo</div>
                                )}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={isSelf}
                              title={isSelf ? "Você não pode excluir a si mesmo" : "Excluir usuário"}
                              onClick={() => deleteUser(u.id, u.display_name ?? u.email ?? "este usuário")}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {users.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Nenhum usuário encontrado</TableCell></TableRow>
                    )}
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
