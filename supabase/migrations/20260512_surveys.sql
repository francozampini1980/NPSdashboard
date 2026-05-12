-- ============================================================
-- SURVEYS MODULE
-- Run this in the Supabase SQL editor
-- ============================================================

-- 1. surveys
CREATE TABLE IF NOT EXISTS surveys (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL,
  name            text NOT NULL,
  description     text,
  header_image_url text,
  footer_text     text NOT NULL DEFAULT 'Sus respuestas son anónimas y se utilizarán únicamente para mejorar nuestros servicios.',
  status          text NOT NULL DEFAULT 'paused' CHECK (status IN ('active','paused')),
  close_at        timestamptz,
  thanks_title    text NOT NULL DEFAULT '¡Gracias por tu participación!',
  thanks_body     text NOT NULL DEFAULT 'Tu opinión es fundamental para ayudarnos a mejorar.',
  thanks_duration_seconds int,
  redirect_url    text,
  created_by      uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- 2. survey_questions
CREATE TABLE IF NOT EXISTS survey_questions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id   uuid NOT NULL REFERENCES surveys ON DELETE CASCADE,
  position    int  NOT NULL DEFAULT 0,
  type        text NOT NULL CHECK (type IN (
    'nps','short_text','long_text','reaction',
    'single_choice','multiple_choice','announcement'
  )),
  question    text NOT NULL DEFAULT '',
  required    boolean NOT NULL DEFAULT true,
  config      jsonb NOT NULL DEFAULT '{}',
  -- config examples per type:
  -- nps:             { label_low, label_high }
  -- reaction:        { label_low, label_high, display: 'numbers'|'faces'|'stars' }
  -- single_choice:   { options: string[], randomize: bool }
  -- multiple_choice: { options: string[], randomize: bool, max_selections: int|null }
  -- announcement:    { content: string }
  -- short_text/long_text: {}
  logic       jsonb NOT NULL DEFAULT '{}',
  -- logic examples:
  -- nps:      { detractors: 'next'|uuid, neutrals: 'next'|uuid, promoters: 'next'|uuid }
  -- reaction: { negative: 'next'|uuid, neutral: 'next'|uuid, positive: 'next'|uuid }
  -- others:   { default: 'next'|uuid }
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS survey_questions_survey_id_position
  ON survey_questions (survey_id, position);

-- 3. survey_responses
CREATE TABLE IF NOT EXISTS survey_responses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id   uuid NOT NULL REFERENCES surveys ON DELETE CASCADE,
  var1        text,
  var2        text,
  var3        text,
  completed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS survey_responses_survey_id
  ON survey_responses (survey_id);

-- 4. survey_answers
CREATE TABLE IF NOT EXISTS survey_answers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid NOT NULL REFERENCES survey_responses ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES survey_questions ON DELETE CASCADE,
  value       jsonb NOT NULL
  -- value examples:
  -- nps / reaction / single_choice: 7
  -- multiple_choice: [1, 3]
  -- short_text / long_text / announcement: "texto libre"
);

CREATE INDEX IF NOT EXISTS survey_answers_response_id
  ON survey_answers (response_id);

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE surveys          ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_answers   ENABLE ROW LEVEL SECURITY;

-- surveys: autenticados leen todo; editors/dios escriben
CREATE POLICY "surveys_select_auth"
  ON surveys FOR SELECT TO authenticated USING (true);

CREATE POLICY "surveys_insert_editor"
  ON surveys FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('editor','dios')
  );

CREATE POLICY "surveys_update_editor"
  ON surveys FOR UPDATE TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('editor','dios')
  );

CREATE POLICY "surveys_delete_editor"
  ON surveys FOR DELETE TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('editor','dios')
  );

-- surveys: anónimos solo leen activas (para la encuesta pública)
CREATE POLICY "surveys_select_anon"
  ON surveys FOR SELECT TO anon
  USING (status = 'active');

-- survey_questions: misma lógica
CREATE POLICY "questions_select_auth"
  ON survey_questions FOR SELECT TO authenticated USING (true);

CREATE POLICY "questions_select_anon"
  ON survey_questions FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM surveys s
      WHERE s.id = survey_questions.survey_id AND s.status = 'active'
    )
  );

CREATE POLICY "questions_write_editor"
  ON survey_questions FOR ALL TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('editor','dios')
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('editor','dios')
  );

-- survey_responses: cualquiera puede insertar (anónimo completa), auth lee
CREATE POLICY "responses_insert_anon"
  ON survey_responses FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "responses_select_auth"
  ON survey_responses FOR SELECT TO authenticated USING (true);

-- survey_answers: igual que responses
CREATE POLICY "answers_insert_anon"
  ON survey_answers FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "answers_select_auth"
  ON survey_answers FOR SELECT TO authenticated USING (true);

-- ============================================================
-- updated_at trigger
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER surveys_updated_at
  BEFORE UPDATE ON surveys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Storage bucket para imágenes de header
-- Crear en Supabase Dashboard > Storage > New bucket:
--   Name: survey-assets
--   Public: true
-- O via SQL:
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('survey-assets', 'survey-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "survey_assets_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'survey-assets' AND
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('editor','dios')
  );

CREATE POLICY "survey_assets_public_read"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'survey-assets');
