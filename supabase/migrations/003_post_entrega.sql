-- NPS Post Entrega: tabla de datos mensuales
CREATE TABLE IF NOT EXISTS nps_post_entrega_monthly (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month VARCHAR(7) NOT NULL UNIQUE,
  sent_count INTEGER NOT NULL DEFAULT 0,
  total_responses INTEGER NOT NULL DEFAULT 0,
  nps_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  promoters_count INTEGER NOT NULL DEFAULT 0,
  neutrals_count INTEGER NOT NULL DEFAULT 0,
  detractors_count INTEGER NOT NULL DEFAULT 0,
  score_distribution JSONB NOT NULL DEFAULT '{}',
  ces_score DECIMAL(4,2) NOT NULL DEFAULT 0,
  ces_good_pct DECIMAL(5,2) NOT NULL DEFAULT 0,
  ces_regular_pct DECIMAL(5,2) NOT NULL DEFAULT 0,
  ces_bad_pct DECIMAL(5,2) NOT NULL DEFAULT 0,
  csat_puntualidad_score DECIMAL(4,2) NOT NULL DEFAULT 0,
  csat_puntualidad_good_pct DECIMAL(5,2) NOT NULL DEFAULT 0,
  csat_puntualidad_regular_pct DECIMAL(5,2) NOT NULL DEFAULT 0,
  csat_puntualidad_bad_pct DECIMAL(5,2) NOT NULL DEFAULT 0,
  csat_predisposicion_score DECIMAL(4,2) NOT NULL DEFAULT 0,
  csat_predisposicion_good_pct DECIMAL(5,2) NOT NULL DEFAULT 0,
  csat_predisposicion_regular_pct DECIMAL(5,2) NOT NULL DEFAULT 0,
  csat_predisposicion_bad_pct DECIMAL(5,2) NOT NULL DEFAULT 0,
  csat_condicion_score DECIMAL(4,2) NOT NULL DEFAULT 0,
  csat_condicion_good_pct DECIMAL(5,2) NOT NULL DEFAULT 0,
  csat_condicion_regular_pct DECIMAL(5,2) NOT NULL DEFAULT 0,
  csat_condicion_bad_pct DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER nps_post_entrega_updated_at
  BEFORE UPDATE ON nps_post_entrega_monthly
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE nps_post_entrega_monthly ENABLE ROW LEVEL SECURITY;

-- Lectura para todos los usuarios autenticados
CREATE POLICY "Post entrega read" ON nps_post_entrega_monthly
  FOR SELECT TO authenticated USING (true);

-- Escritura solo para editor y dios
CREATE POLICY "Post entrega write" ON nps_post_entrega_monthly
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('editor', 'dios'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('editor', 'dios'))
  );
