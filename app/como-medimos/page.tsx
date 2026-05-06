import { HelpCircle, Clock } from 'lucide-react'

export default function ComoMedimosPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">¿Cómo medimos la experiencia?</h2>
        <p className="text-slate-500 text-sm mt-1">Metodología y criterios de medición</p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <HelpCircle size={28} className="text-slate-400" />
        </div>
        <p className="text-lg font-medium text-slate-500">Tercera instancia del proyecto</p>
        <div className="flex items-center gap-1.5 text-sm mt-2">
          <Clock size={14} />
          <span>En desarrollo</span>
        </div>
      </div>
    </div>
  )
}
