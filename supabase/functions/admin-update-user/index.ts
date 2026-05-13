import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
    let { user_id, email, username, password, display_name } = body as {
      user_id: string;
      email?: string | null;
      username?: string | null;
      password?: string | null;
      display_name?: string | null;
    };

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id obrigatório" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Normaliza
    if (typeof email === "string") email = email.trim() || null;
    if (typeof username === "string") username = username ? sanitizeUsername(username) : null;
    if (typeof display_name === "string") display_name = display_name.trim() || null;

    // Username único?
    if (username) {
      const { data: existing } = await admin
        .from("profiles").select("id").ilike("username", username).maybeSingle();
      if (existing && existing.id !== user_id) {
        return new Response(JSON.stringify({ error: "Nome de usuário já está em uso" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // Atualiza Auth (email e/ou senha) — apenas se fornecidos
    const authUpdate: Record<string, unknown> = {};
    if (email !== undefined && email !== null) authUpdate.email = email;
    if (password) {
      if (password.length < 6) {
        return new Response(JSON.stringify({ error: "Senha mínima de 6 caracteres" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      authUpdate.password = password;
    }
    if (Object.keys(authUpdate).length > 0) {
      const { error: authErr } = await admin.auth.admin.updateUserById(user_id, authUpdate);
      if (authErr) {
        return new Response(JSON.stringify({ error: authErr.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // Atualiza profile (apenas campos enviados)
    const profileUpdate: Record<string, unknown> = {};
    if (email !== undefined) profileUpdate.email = email;
    if (username !== undefined) profileUpdate.username = username;
    if (display_name !== undefined) profileUpdate.display_name = display_name;
    if (Object.keys(profileUpdate).length > 0) {
      await admin.from("profiles").update(profileUpdate).eq("id", user_id);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
