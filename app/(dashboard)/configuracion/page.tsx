'use client'

import { useState } from 'react'
import PostCompraTab from './_components/PostCompraTab'
import PostEntregaTab from './_components/PostEntregaTab'

export default function ConfiguracionPage() {
  const [configTab, setConfigTab] = useState<'post-compra' | 'post-entrega'>('post-compra')

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Subir CSV</h2>
        <p className="text-slate-500 text-sm mt-1">Cargá y gestioná los archivos CSV mensuales</p>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit mb-6">
        {([
          ['post-compra', 'NPS Post Compra'],
          ['post-entrega', 'NPS Post Entrega'],
        ] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setConfigTab(val)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              configTab === val
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {configTab === 'post-compra' && <PostCompraTab />}
      {configTab === 'post-entrega' && <PostEntregaTab />}
    </div>
  )
}
