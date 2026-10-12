ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS campaign_name text, ADD COLUMN IF NOT EXISTS category text, ADD COLUMN IF NOT EXISTS whatsapp_received_at timestamptz;
CREATE TABLE public.lead_campaign_rules (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), platform text NOT NULL CHECK(platform IN ('google_ads','meta_ads')), campaign_key text NOT NULL CHECK(length(btrim(campaign_key))>0), campaign_name text NOT NULL, category text NOT NULL CHECK(category IN ('aluguel_sala','clinica')), message_match text, active boolean NOT NULL DEFAULT true, UNIQUE(platform,campaign_key));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_campaign_rules TO authenticated;
GRANT ALL ON public.lead_campaign_rules TO service_role;
ALTER TABLE public.lead_campaign_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read campaign rules" ON public.lead_campaign_rules FOR SELECT TO authenticated USING(true);
CREATE POLICY "Admins manage campaign rules" ON public.lead_campaign_rules FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE TABLE public.whatsapp_ingestion_events (instance text NOT NULL, message_id text NOT NULL, lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL, received_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(instance,message_id));
GRANT ALL ON public.whatsapp_ingestion_events TO service_role;
ALTER TABLE public.whatsapp_ingestion_events ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.classify_lead_tag_origem() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_source text:=lower(COALESCE(NEW.utm_source,'')); v_medium text:=lower(COALESCE(NEW.utm_medium,'')); v_referrer text:=lower(COALESCE(NEW.referrer,''));
BEGIN
 IF NULLIF(btrim(NEW.gclid),'') IS NOT NULL THEN NEW.tag_origem:='google_ads'; NEW.tag_origem_manual:=false;
 ELSIF COALESCE(NEW.tag_origem_manual,false) AND NULLIF(btrim(NEW.meta_ctwa_clid),'') IS NULL THEN RETURN NEW;
 ELSIF NULLIF(btrim(NEW.meta_ctwa_clid),'') IS NOT NULL THEN NEW.tag_origem:='meta_ads'; NEW.tag_origem_manual:=false;
 ELSIF v_source IN ('googleads','google_ads','adwords') OR (v_source='google' AND v_medium IN ('cpc','ppc','paid','paidsearch','paid_search')) THEN NEW.tag_origem:='google_ads'; NEW.tag_origem_manual:=false;
 ELSIF v_source IN ('facebook','instagram','fb','ig','meta') AND v_medium NOT IN ('organic','organico','social','referral') OR v_medium IN ('paid_social','paidsocial','cpc-meta') OR NULLIF(btrim(NEW.meta_fbc),'') IS NOT NULL THEN NEW.tag_origem:='meta_ads'; NEW.tag_origem_manual:=false;
 ELSIF NEW.origem='manual' AND NEW.utm_source IS NULL AND NEW.referrer IS NULL THEN NEW.tag_origem:='novo';
 ELSIF v_referrer LIKE '%google.%' OR v_referrer LIKE '%bing.com%' OR v_referrer LIKE '%duckduckgo.com%' OR v_referrer LIKE '%yahoo.com%' OR NEW.utm_source IS NOT NULL OR NEW.referrer IS NOT NULL THEN NEW.tag_origem:='organico';
 ELSE NEW.tag_origem:='site'; END IF;
 RETURN NEW;
END; $$;
CREATE OR REPLACE FUNCTION public.assign_lead_campaign() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r public.lead_campaign_rules;
BEGIN
 SELECT * INTO r FROM public.lead_campaign_rules WHERE active AND platform=NEW.tag_origem::text AND campaign_key=COALESCE(NEW.meta_campaign_id, NEW.utm_campaign) LIMIT 1;
 IF FOUND THEN NEW.category:=r.category; NEW.campaign_name:=r.campaign_name; END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER zz_assign_lead_campaign BEFORE INSERT OR UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.assign_lead_campaign();
CREATE OR REPLACE FUNCTION public.ingest_whatsapp_lead(_instance text,_message_id text,_phone text,_name text,_message text,_category text,_campaign_id text,_campaign_name text,_ctwa_clid text,_is_meta boolean,_received_at timestamptz) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_id uuid; v_inserted boolean:=false;
BEGIN
 IF _phone !~ '^[0-9]{10,15}$' OR length(_message)>10000 OR length(_message_id)>200 THEN RAISE EXCEPTION 'Invalid message'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(_instance||_phone,0));
 IF EXISTS(SELECT 1 FROM public.whatsapp_ingestion_events WHERE instance=_instance AND message_id=_message_id) THEN RETURN jsonb_build_object('duplicate',true); END IF;
 SELECT id INTO v_id FROM public.leads WHERE regexp_replace(whatsapp,'[^0-9]','','g') IN (_phone, CASE WHEN left(_phone,2)='55' THEN substr(_phone,3) ELSE _phone END) AND created_at>=now()-interval '30 days' AND (category IS NOT DISTINCT FROM _category OR (category IS NULL AND created_at>=now()-interval '1 day')) ORDER BY created_at DESC LIMIT 1;
 IF v_id IS NULL THEN
 INSERT INTO public.leads(name,whatsapp,city,message,origem,utm_source,utm_medium,utm_campaign,meta_campaign_id,campaign_name,category,meta_ctwa_clid,whatsapp_received_at,created_at)
 VALUES(NULLIF(_name,''),_phone,'Não informado',_message,'whatsapp',CASE WHEN _is_meta THEN 'facebook' END,CASE WHEN _is_meta THEN 'paid_social' END,_campaign_id,_campaign_id,_campaign_name,_category,_ctwa_clid,_received_at,_received_at) RETURNING id INTO v_id; v_inserted:=true;
 ELSE
 UPDATE public.leads SET whatsapp_received_at=_received_at, name=COALESCE(NULLIF(name,''),NULLIF(_name,'')), category=COALESCE(category,_category),campaign_name=COALESCE(campaign_name,_campaign_name),utm_campaign=COALESCE(utm_campaign,_campaign_id),meta_ctwa_clid=COALESCE(meta_ctwa_clid,_ctwa_clid) WHERE id=v_id;
 END IF;
 INSERT INTO public.whatsapp_ingestion_events(instance,message_id,lead_id) VALUES(_instance,_message_id,v_id);
 RETURN jsonb_build_object('lead_id',v_id,'created',v_inserted,'duplicate',false);
END; $$;
REVOKE ALL ON FUNCTION public.ingest_whatsapp_lead(text,text,text,text,text,text,text,text,text,boolean,timestamptz) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.ingest_whatsapp_lead(text,text,text,text,text,text,text,text,text,boolean,timestamptz) TO service_role;