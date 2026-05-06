-- NPS Dashboard: tabla principal de datos mensuales
CREATE TABLE IF NOT EXISTS nps_monthly_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month VARCHAR(7) NOT NULL,           -- YYYY-MM
  survey_type VARCHAR(50) NOT NULL DEFAULT 'post_purchase',
  impressions INTEGER NOT NULL DEFAULT 0,
  total_responses INTEGER NOT NULL DEFAULT 0,
  nps_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  promoters_count INTEGER NOT NULL DEFAULT 0,
  neutrals_count INTEGER NOT NULL DEFAULT 0,
  detractors_count INTEGER NOT NULL DEFAULT 0,
  score_distribution JSONB NOT NULL DEFAULT '{}',
  promotion_reasons JSONB NOT NULL DEFAULT '{}',
  detraction_reasons JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(month, survey_type)
);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER nps_monthly_data_updated_at
  BEFORE UPDATE ON nps_monthly_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security (para multi-usuario futuro)
ALTER TABLE nps_monthly_data ENABLE ROW LEVEL SECURITY;

-- Por ahora permite todo (MVP single-user)
CREATE POLICY "Allow all" ON nps_monthly_data FOR ALL USING (true) WITH CHECK (true);
