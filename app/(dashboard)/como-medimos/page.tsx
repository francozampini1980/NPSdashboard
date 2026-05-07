'use client'

import { useState } from 'react'

type Tab = 'post-compra' | 'post-entrega' | 'calculos'

// ─── Shared UI primitives ────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-slate-800 mb-2">{children}</h3>
}

function SectionBody({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-600 leading-relaxed">{children}</p>
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-6 ${className}`}>
      {children}
    </div>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 space-y-1.5">
      {items.map(item => (
        <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  )
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
      {n}
    </span>
  )
}

// ─── Tabs content ────────────────────────────────────────────────────────────

function PostCompraTab() {
  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle>¿Cuándo y dónde se muestra la encuesta?</SectionTitle>
        <SectionBody>
          La encuesta de satisfacción de pos compra sucede en la "página de gracias" inmediatamente después de que
          el pago se procese correctamente.
        </SectionBody>
      </Card>

      <Card>
        <SectionTitle>¿Por qué encuestamos solamente ventas exitosas?</SectionTitle>
        <SectionBody>
          No evadimos respuestas negativas, más bien buscamos que los y las usuarias no pierdan el foco de lo que
          tienen que resolver. Por suerte, después de ventas exitosas tenemos comentarios de todo tipo y sin filtro.
        </SectionBody>
      </Card>

      <Card>
        <SectionTitle>Tecnología y límites</SectionTitle>
        <SectionBody>
          Usamos la tecnología de Hotjar para incrustar la encuesta, lo que nos permite —solo de ser necesario—
          editarla o pausarla de forma simple y rápida. Por el tipo de plan está limitada a 5.000 respuestas
          mensuales y se la mostramos al 30% de las personas que pasan por la página de gracias.
        </SectionBody>
      </Card>

      <Card>
        <SectionTitle>Objetivo</SectionTitle>
        <SectionBody>
          Preguntar sobre el ecommerce: el proceso de compra y las promociones que ofrecemos.
        </SectionBody>
      </Card>

      <Card>
        <SectionTitle>Preguntas de la encuesta</SectionTitle>
        <div className="space-y-5 mt-3">
          <div className="flex gap-3">
            <StepBadge n={1} />
            <div>
              <p className="text-sm font-medium text-slate-700">Recomendación (NPS)</p>
              <p className="text-sm text-slate-500 mt-0.5">
                En base a tu experiencia de compra en nuestra web, ¿qué tan probable es que la recomiendes a un
                amigo y/o familiar?
              </p>
              <p className="text-xs text-slate-400 mt-1">Escala de 0 a 10 — 0 = nada probable, 10 = muy probable</p>
            </div>
          </div>

          <div className="flex gap-3">
            <StepBadge n={2} />
            <div>
              <p className="text-sm font-medium text-slate-700">Principal motivo (se ramifica según puntaje)</p>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-600 mb-2">Puntaje 0–8 · Tópicos negativos</p>
                  <BulletList items={[
                    'Plataforma lenta',
                    'Ofertas y promos no son claras',
                    'Pocas opciones de shipping',
                    'Información de productos',
                    'Uso de cupón de descuento',
                    'Desconfianza de la plataforma',
                    'La atención poco útil (chat o teléfono)',
                    'Difícil encontrar lo que buscaba',
                    'Costos de envío son elevados',
                  ]} />
                </div>
                <div className="bg-emerald-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-emerald-600 mb-2">Puntaje 9–10 · Tópicos positivos</p>
                  <BulletList items={[
                    'Plataforma rápida',
                    'Ofertas y promos',
                    'Opciones de shipping',
                    'Información de productos',
                    'Usar cupones de descuento',
                    'Confianza',
                    'Atención útil (chat o teléfono)',
                    'Fácil encontrar lo que buscaba',
                    'Costos de envío adecuados',
                  ]} />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">Solo puede seleccionar el tópico que considere más importante</p>
            </div>
          </div>

          <div className="flex gap-3">
            <StepBadge n={3} />
            <div>
              <p className="text-sm font-medium text-slate-700">Comentario abierto</p>
              <p className="text-sm text-slate-500 mt-0.5">
                ¿Podrías indicarnos el motivo de tus calificaciones? Campo de texto libre con respuestas
                cualitativas que analizamos con IA para cuantificar los principales tópicos de promoción y detracción.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function PostEntregaTab() {
  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle>¿Cuándo se dispara la encuesta?</SectionTitle>
        <SectionBody>
          El inicio es el mail donde confirmamos que entregamos el producto en el domicilio del cliente. Desde ahí,
          por proactividad, ingresa al flujo de la encuesta que tiene 4 pasos (5 si CES nos califica negativo).
        </SectionBody>
      </Card>

      <Card>
        <SectionTitle>Preguntas de la encuesta</SectionTitle>
        <div className="space-y-5 mt-3">
          <div className="flex gap-3">
            <StepBadge n={1} />
            <div>
              <p className="text-sm font-medium text-slate-700">Recomendación (NPS)</p>
              <p className="text-sm text-slate-500 mt-0.5">
                En base a tu experiencia con la entrega de tu compra, ¿qué tan probable es que recomiendes Frávega a
                amigos y/o familiares?
              </p>
              <p className="text-xs text-slate-400 mt-1">Escala de 0 a 10 — 0 = nada probable, 10 = muy probable</p>
            </div>
          </div>

          <div className="flex gap-3">
            <StepBadge n={2} />
            <div>
              <p className="text-sm font-medium text-slate-700">Seguimiento del pedido (CES)</p>
              <p className="text-sm text-slate-500 mt-0.5">
                ¿Qué tan fácil fue realizar el seguimiento de tu pedido a través de la plataforma de Frávega?
              </p>
              <p className="text-xs text-slate-400 mt-1">Escala de 1 a 5</p>
            </div>
          </div>

          <div className="flex gap-3 ml-9">
            <div className="w-px bg-slate-200 mr-3" />
            <div className="bg-amber-50 rounded-lg p-3 flex-1">
              <p className="text-xs font-semibold text-amber-600 mb-1">2b · Solo si la calificación es 1 o 2</p>
              <p className="text-sm font-medium text-slate-700">Motivo de dificultad</p>
              <p className="text-sm text-slate-500 mt-0.5">
                Lamentamos los inconvenientes. ¿Cuáles son las principales razones por las que indicaste ese nivel
                de dificultad? Campo de texto libre analizado con IA.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <StepBadge n={3} />
            <div>
              <p className="text-sm font-medium text-slate-700">Detalle de la experiencia (CSAT)</p>
              <p className="text-sm text-slate-500 mt-0.5">
                ¿Qué tan satisfecho estás respecto a los temas mencionados debajo?{' '}
                <span className="text-slate-400">(1 = Nada satisfecho, 5 = Muy satisfecho)</span>
              </p>
              <BulletList items={[
                'Puntualidad de la entrega de tu producto',
                'Predisposición del transportista',
                'Condición en la que recibiste el producto',
              ]} />
              <p className="text-xs text-slate-400 mt-2">Escala CSAT de 1 a 5 para cada ítem</p>
            </div>
          </div>

          <div className="flex gap-3">
            <StepBadge n={4} />
            <div>
              <p className="text-sm font-medium text-slate-700">Comentarios adicionales</p>
              <p className="text-sm text-slate-500 mt-0.5">
                ¿Podrías comentarnos el motivo de tus calificaciones? Campo de texto libre analizado con IA para
                cuantificar los principales tópicos de detracción.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function CalculosTab() {
  return (
    <div className="space-y-4">
      {/* Comparison table */}
      <Card>
        <SectionTitle>Un poco de teoría</SectionTitle>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 pr-6 text-slate-500 font-semibold">Métrica</th>
                <th className="text-left py-2 pr-6 text-slate-500 font-semibold">Enfoque</th>
                <th className="text-left py-2 text-slate-500 font-semibold">Pregunta clave</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { metric: 'NPS', focus: 'Relación / Lealtad', question: '¿Nos recomendarías?' },
                { metric: 'CSAT', focus: 'Felicidad / Satisfacción', question: '¿Qué tan satisfecho estás?' },
                { metric: 'CES', focus: 'Esfuerzo / Fricción', question: '¿Qué tan fácil fue resolver tu problema?' },
              ].map(row => (
                <tr key={row.metric}>
                  <td className="py-3 pr-6">
                    <span className="font-bold text-slate-800">{row.metric}</span>
                  </td>
                  <td className="py-3 pr-6 text-slate-600">{row.focus}</td>
                  <td className="py-3 text-slate-600">{row.question}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* NPS */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">NPS</span>
          <SectionTitle>¿Cómo se calcula?</SectionTitle>
        </div>

        <div className="bg-slate-50 rounded-lg px-5 py-4 text-center mb-4">
          <p className="text-lg font-bold text-slate-800">NPS = % Promotores − % Detractores</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { range: '0 – 6', label: 'Detractores', color: 'bg-red-100 text-red-700 border-red-200' },
            { range: '7 – 8', label: 'Neutros', color: 'bg-amber-100 text-amber-700 border-amber-200' },
            { range: '9 – 10', label: 'Promotores', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
          ].map(g => (
            <div key={g.label} className={`rounded-lg border px-3 py-3 text-center ${g.color}`}>
              <p className="text-lg font-bold">{g.range}</p>
              <p className="text-xs font-medium mt-0.5">{g.label}</p>
            </div>
          ))}
        </div>

        <SectionTitle>¿Cómo es su escala?</SectionTitle>
        <p className="text-sm text-slate-500 mb-3">El NPS se mide en un rango de −100 a 100:</p>
        <div className="space-y-2">
          {[
            { range: 'Menos de 0', label: 'Crítico', desc: 'Hay más detractores que promotores.', color: 'border-l-red-400' },
            { range: '0 a 30', label: 'Bueno', desc: 'Rango positivo, con espacio para crecer.', color: 'border-l-amber-400' },
            { range: '30 a 70', label: 'Excelente', desc: 'Base de clientes muy leales.', color: 'border-l-blue-400' },
            { range: 'Más de 70', label: 'Clase Mundial', desc: 'Fidelidad excepcional (ej. Apple, Costco).', color: 'border-l-emerald-400' },
          ].map(item => (
            <div key={item.label} className={`border-l-4 pl-3 py-1 ${item.color}`}>
              <p className="text-sm font-semibold text-slate-700">{item.label} <span className="font-normal text-slate-400">({item.range})</span></p>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* CSAT y CES */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">CSAT</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">CES</span>
          <SectionTitle>¿Cómo se calcula?</SectionTitle>
        </div>

        <div className="bg-slate-50 rounded-lg px-5 py-4 text-center mb-4">
          <p className="text-base font-bold text-slate-800">
            Total de respuestas con valor 4 y 5 / Total de respuestas × 100
          </p>
        </div>

        <SectionTitle>¿Cómo es su escala? <span className="text-slate-400 font-normal text-sm">(1 a 5)</span></SectionTitle>
        <p className="text-sm text-slate-500 mb-3">
          Para los indicadores de Satisfacción (CSAT) y Esfuerzo (CES) expresados en escala 1 a 5:
        </p>
        <div className="space-y-2">
          {[
            { range: '1 a 2', label: 'Necesita mejorar', desc: 'Existe una fricción significativa en la experiencia.', color: 'border-l-red-400', bg: 'bg-red-50' },
            { range: '3', label: 'Regular', desc: 'La experiencia es funcional pero no genera valor diferencial.', color: 'border-l-amber-400', bg: 'bg-amber-50' },
            { range: '4 a 5', label: 'Bueno', desc: 'El cliente está satisfecho y el proceso fue fluido.', color: 'border-l-emerald-400', bg: 'bg-emerald-50' },
          ].map(item => (
            <div key={item.label} className={`border-l-4 pl-3 py-2 rounded-r-lg ${item.color} ${item.bg}`}>
              <p className="text-sm font-semibold text-slate-700">{item.label} <span className="font-normal text-slate-400">({item.range})</span></p>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: 'post-compra', label: 'NPS Post Compra' },
  { id: 'post-entrega', label: 'NPS Post Entrega' },
  { id: 'calculos', label: '¿Cómo se calcula NPS, CSAT y CES?' },
]

export default function ComoMedimosPage() {
  const [activeTab, setActiveTab] = useState<Tab>('post-compra')

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">¿Cómo medimos la experiencia?</h2>
        <p className="text-slate-500 text-sm mt-1">Metodología y criterios de medición</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg w-fit mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'post-compra' && <PostCompraTab />}
      {activeTab === 'post-entrega' && <PostEntregaTab />}
      {activeTab === 'calculos' && <CalculosTab />}
    </div>
  )
}
