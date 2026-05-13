import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Domínio interno usado quando o usuário não tem e-mail real cadastrado.
// O Supabase Auth exige e-mail, então geramos um placeholder que pode ser editado depois.
const INTERNAL_EMAIL_DOMAIN = "crm.local";

const sanitizeUsername = (raw: string) =>
  raw.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: roleRow } = await admin
      .from("user_roles").select("role")
      .eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Apenas administradores" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    let { email, username, password, display_name, profile_type_id } = body as {
      email?: string | null; username?: string | null; password?: string;
      display_name?: string; profile_type_id?: string | null;
    };

    email = email?.trim() || null;
    username = username ? sanitizeUsername(username) : null;

    if (!password || password.length < 6) {
      return new Response(JSON.stringify({ error: "Senha mínima de 6 caracteres" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!email && !username) {
      return new Response(JSON.stringify({ error: "Informe e-mail ou nome de usuário" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Username único?
    if (username) {
      const { data: existing } = await admin
        .from("profiles").select("id").ilike("username", username).maybeSingle();
      if (existing) {
        return new Response(JSON.stringify({ error: "Nome de usuário já está em uso" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // Se não há e-mail real, gera um interno baseado no username
    const authEmail = email ?? `${username}@${INTERNAL_EMAIL_DOMAIN}`;

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: authEmail,
      password,
      email_confirm: true,
      user_metadata: { display_name: display_name ?? username ?? authEmail.split("@")[0] },
    });
    if (createErr || !created.user) {
      return new Response(JSON.stringify({ error: createErr?.message ?? "Erro ao criar usuário" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const newUserId = created.user.id;

    await admin.from("profiles").upsert({
      id: newUserId,
      email: authEmail,
      username,
      display_name: display_name ?? username ?? authEmail.split("@")[0],
    });

    let assignedProfileId = profile_type_id ?? null;
    if (!assignedProfileId) {
      const { data: defaultProf } = await admin
        .from("profile_types").select("id, type")
        .eq("type", "atendente").eq("active", true).limit(1).maybeSingle();
      assignedProfileId = defaultProf?.id ?? null;
    }

    if (assignedProfileId) {
      await admin.from("user_profile_assignments").upsert(
        { user_id: newUserId, profile_type_id: assignedProfileId },
        { onConflict: "user_id" }
      );
      const { data: prof } = await admin.from("profile_types").select("type").eq("id", assignedProfileId).maybeSingle();
      const role = prof?.type === "administrador" ? "admin" : "atendente";
      await admin.from("user_roles").delete().eq("user_id", newUserId);
      await admin.from("user_roles").insert({ user_id: newUserId, role });
    } else {
      await admin.from("user_roles").insert({ user_id: newUserId, role: "atendente" });
    }

    return new Response(JSON.stringify({ ok: true, user_id: newUserId, email: authEmail, username }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
