import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");

    // Validate caller
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Check role admin
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Apenas administradores" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { email, password, display_name, profile_type_id, active } = body as {
      email: string; password: string; display_name?: string; profile_type_id?: string | null; active?: boolean;
    };

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "E-mail e senha obrigatórios" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Create user (auto-confirmed so admin pode usar imediatamente)
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: display_name ?? email.split("@")[0] },
    });
    if (createErr || !created.user) {
      return new Response(JSON.stringify({ error: createErr?.message ?? "Erro ao criar usuário" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const newUserId = created.user.id;

    // Garantir profile (handle_new_user trigger normalmente cria, mas garantimos aqui)
    await admin.from("profiles").upsert({
      id: newUserId,
      email,
      display_name: display_name ?? email.split("@")[0],
    });

    // Vincular perfil
    let assignedProfileId = profile_type_id ?? null;
    if (!assignedProfileId) {
      // padrão: pegar primeiro perfil tipo "atendente" ativo
      const { data: defaultProf } = await admin
        .from("profile_types")
        .select("id, type")
        .eq("type", "atendente")
        .eq("active", true)
        .limit(1)
        .maybeSingle();
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
      // sem perfil disponível — coloca como atendente por padrão no user_roles
      await admin.from("user_roles").insert({ user_id: newUserId, role: "atendente" });
    }

    return new Response(JSON.stringify({ ok: true, user_id: newUserId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
