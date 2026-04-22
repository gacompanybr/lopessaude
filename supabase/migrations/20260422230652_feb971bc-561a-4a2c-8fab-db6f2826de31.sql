-- Remove a policy antiga que estava restrita ao role 'public'
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;

-- Cria nova policy que cobre tanto visitantes anônimos quanto autenticados
CREATE POLICY "Anyone can insert leads"
  ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);