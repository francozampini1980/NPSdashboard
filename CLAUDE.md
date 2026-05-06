# NPS Dashboard — Contexto del proyecto

## Stack
- Next.js 14 (App Router, TypeScript), Tailwind CSS, shadcn/ui, Recharts
- Supabase (persistencia + auth en prod), localStorage (fallback local para datos)
- Vercel para deploy, GitHub para CI/CD

## Infraestructura
- GitHub: `git@github.com:francozampini1980/NPSdashboard.git`
- Supabase: proyecto `cogxlrwncyjmcwkonnan`, región `sa-east-1`
- Deploy: push a `main` → redeploy automático en Vercel

## Estructura de rutas (App Router con route groups)
```
app/
  (auth)/              ← sin sidebar, layout centrado
    login/             → /login
    auth/callback/     → /auth/callback (token exchange)
    auth/update-password/ → /auth/update-password
  (dashboard)/         ← con sidebar + AuthProvider
    nps-post-compra/   → /nps-post-compra
    nps-post-entrega/  → /nps-post-entrega
    como-medimos/      → /como-medimos
    configuracion/     → /configuracion
    gestion-usuarios/  → /gestion-usuarios (solo rol 'dios')
  api/admin/           ← API routes server-side
    users/             GET — listar usuarios
    invite/            POST — invitar por email
    delete-user/       DELETE — eliminar usuario
    update-role/       PATCH — cambiar rol
```

## Archivos clave
- `app/(dashboard)/layout.tsx` — layout con sidebar + AuthProvider
- `components/layout/Sidebar.tsx` — nav con visibilidad por rol, user info, logout
- `lib/auth-context.tsx` — React context: user, role, loading, signOut
- `lib/supabase.ts` — cliente anon (lazy proxy, para datos)
- `lib/supabase-admin.ts` — cliente service_role (solo API routes)
- `lib/storage.ts` — abstracción Supabase/localStorage
- `lib/csv-parser.ts` — parseo de CSV mensual
- `components/charts/` — todos los gráficos (Recharts)
- `types/index.ts` — tópicos predefinidos y tipos
- `middleware.ts` — protección de rutas, redirige a /login si sin sesión

## Variables de entorno
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   ← solo servidor, nunca en cliente
NEXT_PUBLIC_APP_URL=...         ← URL base para redirects de invitación
```

## Auth y roles
- **Supabase Auth** email+password, invite por email, reset password
- **Roles** en tabla `profiles`: `visitor` | `editor` | `dios`
  - visitor: solo lee dashboard
  - editor: dashboard + configuración (subir CSV)
  - dios: todo lo anterior + gestión de usuarios
- Trigger auto-crea perfil como `visitor` al registrarse
- Las API routes `/api/admin/*` requieren rol `dios` y usan `service_role` key
- Para hacer a un usuario Dios: SQL en Supabase dashboard:
  `UPDATE profiles SET role = 'dios' WHERE email = 'tu@email.com';`

## Formato CSV
Columnas (0-indexed): C=2 fecha, D=3 país, F=5 device, G=6 browser, H=7 OS, K=10 NPS (0-10), L=11 mención negativa, M=12 mención positiva, N=13 comentario, S=18 tipo comentario. Formato fecha: `YYYY-MM-DD HH:MM:SS`.

## Tópicos predefinidos (valores exactos del CSV)
**Positivos:** La plataforma es rápida · Las ofertas y promociones que ofrecen · Variedad de opciones para retirar o recibir mi producto · Buena información sobre los productos · Poder usar cupones de descuento · La plataforma me genera confianza · La atención (chat o teléfono) fue útil · Me resulto fácil encontrar lo que buscaba · Los costos de envío son adecuados

**Negativos:** La plataforma es lenta · Las ofertas y promociones no son claras · Pocas opciones para retirar o recibir mi producto · Poca información sobre los productos · No pude ingresar el cupón de descuento · La plataforma me genera desconfianza · La atención (chat o teléfono) no fue útil · Me resulto difícil encontrar lo que buscaba · Los costos de envío son elevados

## Reglas de negocio
- NPS = % promotores (9-10) − % detractores (0-6)
- % menciones = count / grupo (promotores o detractores), NO sobre suma de menciones
- Solo mostrar tópicos predefinidos, ignorar respuestas libres
- Un CSV por mes — el nuevo pisa al anterior (upsert por month+survey_type)

## Próximas instancias
1. NPS Post Entrega (2ª instancia)
2. Sección ¿Cómo medimos? — contenido estático (3ª instancia)
