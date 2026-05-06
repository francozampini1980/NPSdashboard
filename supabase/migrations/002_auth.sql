-- ============================================================
-- 002_auth.sql — Roles y autenticación
-- ============================================================

-- Tabla de perfiles: extiende auth.users con el rol
CREATE TABLE IF NOT EXISTS public.profiles (
  id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email     TEXT NOT NULL,
  role      TEXT NOT NULL DEFAULT 'visitor'
              CHECK (role IN ('visitor', 'editor', 'dios')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede leer todos los perfiles
-- (necesario para la página de gestión de usuarios)
CREATE POLICY "Authenticated read profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Cada usuario puede actualizar su propio perfil
CREATE POLICY "User updates own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- El service_role (API routes admin) puede hacer todo sin restricciones
-- (no requiere política explícita — service_role bypasses RLS)

-- ============================================================
-- Trigger: crear perfil automáticamente al registrar usuario
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'visitor')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Actualizar RLS en nps_monthly_data: requerir autenticación
-- ============================================================

-- Eliminar políticas permisivas anteriores si existen
DROP POLICY IF EXISTS "Allow all" ON public.nps_monthly_data;
DROP POLICY IF EXISTS "Enable all for all users" ON public.nps_monthly_data;

-- Cualquier usuario autenticado puede leer datos
CREATE POLICY "Authenticated read nps data"
  ON public.nps_monthly_data FOR SELECT
  TO authenticated
  USING (true);

-- Solo editor y dios pueden insertar/actualizar/eliminar
CREATE POLICY "Editor and dios write nps data"
  ON public.nps_monthly_data FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('editor', 'dios')
    )
  );

CREATE POLICY "Editor and dios update nps data"
  ON public.nps_monthly_data FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('editor', 'dios')
    )
  );

CREATE POLICY "Editor and dios delete nps data"
  ON public.nps_monthly_data FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('editor', 'dios')
    )
  );
