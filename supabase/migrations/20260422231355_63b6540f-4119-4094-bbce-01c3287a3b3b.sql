CREATE OR REPLACE FUNCTION public.create_public_lead(
  _name text DEFAULT NULL,
  _whatsapp text DEFAULT NULL,
  _city text DEFAULT NULL,
  _message text DEFAULT NULL,
  _status public.lead_status DEFAULT 'novo',
  _origem public.lead_origem DEFAULT 'site',
  _notes text DEFAULT NULL,
  _email text DEFAULT NULL,
  _state text DEFAULT NULL,
  _meta_fbc text DEFAULT NULL,
  _meta_fbp text DEFAULT NULL,
  _meta_ctwa_clid text DEFAULT NULL,
  _utm_source text DEFAULT NULL,
  _utm_medium text DEFAULT NULL,
  _utm_campaign text DEFAULT NULL,
  _utm_content text DEFAULT NULL,
  _utm_term text DEFAULT NULL,
  _referrer text DEFAULT NULL,
  _landing_page text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NULLIF(BTRIM(COALESCE(_whatsapp, '')), '') IS NULL THEN
    RAISE EXCEPTION 'whatsapp is required';
  END IF;

  IF NULLIF(BTRIM(COALESCE(_city, '')), '') IS NULL THEN
    RAISE EXCEPTION 'city is required';
  END IF;

  INSERT INTO public.leads (
    name,
    whatsapp,
    city,
    message,
    status,
    origem,
    notes,
    email,
    state,
    meta_fbc,
    meta_fbp,
    meta_ctwa_clid,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    referrer,
    landing_page
  ) VALUES (
    _name,
    _whatsapp,
    _city,
    _message,
    _status,
    _origem,
    _notes,
    _email,
    _state,
    _meta_fbc,
    _meta_fbp,
    _meta_ctwa_clid,
    _utm_source,
    _utm_medium,
    _utm_campaign,
    _utm_content,
    _utm_term,
    _referrer,
    _landing_page
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_public_lead(
  text, text, text, text, public.lead_status, public.lead_origem, text, text, text,
  text, text, text, text, text, text, text, text, text, text
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_public_lead(
  text, text, text, text, public.lead_status, public.lead_origem, text, text, text,
  text, text, text, text, text, text, text, text, text, text
) TO anon, authenticated;