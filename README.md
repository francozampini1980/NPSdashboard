# Métricas de Experiencia — Dashboard NPS

Dashboard para visualizar encuestas NPS post-compra con evolución mensual.

## Stack
- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** + shadcn/ui
- **Recharts** para gráficos
- **Supabase** para persistencia (o localStorage en modo local)
- **Vercel** para deploy

---

## Setup local (sin Supabase)

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). Los datos se guardan en **localStorage** del navegador y persisten entre sesiones.

---

## Setup con Supabase (para deploy en Vercel)

### 1. Crear proyecto Supabase

1. Andá a [app.supabase.com](https://app.supabase.com) y creá un proyecto
2. En el SQL Editor, ejecutá el contenido de `supabase/migrations/001_initial.sql`
3. En Settings → API, copiá la **Project URL** y la **anon public key**

### 2. Variables de entorno

```bash
cp .env.local.example .env.local
```

Editá `.env.local` con tus credenciales de Supabase.

### 3. Deploy en Vercel

1. Pusheá el código a GitHub
2. Importá el repo en [vercel.com](https://vercel.com)
3. Agregá las variables de entorno en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

---

## Formato del CSV

| Columna | Contenido |
|---------|-----------|
| C | Fecha (`YYYY-MM-DD HH:MM:SS`) |
| D | País |
| F | Device |
| G | Browser |
| H | Sistema operativo |
| K | NPS (0-10) |
| L | Mención negativa |
| M | Mención positiva |
| N | Comentario abierto |
| S | Tipo de comentario |

## NPS: cómo se calcula

- **Promotores**: 9-10 · **Neutros**: 7-8 · **Detractores**: 0-6
- **NPS** = % Promotores − % Detractores
- Excelente ≥50 · Bueno 30-49 · Mejorable 0-29 · Crítico <0
