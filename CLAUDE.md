# NPS Dashboard — Contexto del proyecto

## Stack
- Next.js 14 (App Router, TypeScript), Tailwind CSS, shadcn/ui, Recharts
- Supabase (persistencia en prod), localStorage (fallback local)
- Vercel para deploy, GitHub para CI/CD

## Infraestructura
- GitHub: `git@github.com:francozampini1980/NPSdashboard.git`
- Supabase: proyecto `cogxlrwncyjmcwkonnan`, región `sa-east-1`
- Deploy: push a `main` → redeploy automático en Vercel

## Estructura clave
- `app/nps-post-compra/` — dashboard principal (tabs: Mes actual / Evolutivo)
- `app/configuracion/` — upload CSV y gestión de meses
- `components/charts/` — todos los gráficos (Recharts)
- `lib/csv-parser.ts` — parseo de CSV mensual
- `lib/storage.ts` — abstracción Supabase/localStorage
- `types/index.ts` — tópicos predefinidos y tipos

## Formato CSV
Columnas usadas (0-indexed): C=2 fecha, D=3 país, F=5 device, G=6 browser, H=7 OS, K=10 NPS (0-10), L=11 mención negativa, M=12 mención positiva, N=13 comentario, S=18 tipo comentario. Formato fecha: `YYYY-MM-DD HH:MM:SS`.

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
