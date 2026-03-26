import { useState, useMemo } from 'react'
import { Search, MapPin, Activity, SlidersHorizontal, AlertTriangle, Droplets } from 'lucide-react'

const ACTIVISM_QUOTES = [
  {
    text: '296 rivers have polluted stretches in India — and we know exactly which ones.',
    source: 'CPCB 2025',
    icon: AlertTriangle
  },
  {
    text: '70% of waterborne diseases in India come from river pollution.',
    source: 'CPCB 2022',
    icon: Droplets
  },
  {
    text: 'Clean water is not a luxury. It\'s a right. Check your river\'s grade.',
    source: 'WHO',
    icon: Droplets
  },
]

export default function RiverMenu({ rivers, selectedRiver, onSelect, onLocate }) {
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('health') // 'health' or 'alpha'

  const filtered = useMemo(() => {
    let list = rivers.filter(r => 
      r.river_name.toLowerCase().includes(query.toLowerCase()) || 
      r.state.toLowerCase().includes(query.toLowerCase())
    )
    if (sortBy === 'health') list.sort((a, b) => a.grade.localeCompare(b.grade))
    if (sortBy === 'alpha') list.sort((a, b) => a.river_name.localeCompare(b.river_name))
    return list
  }, [rivers, query, sortBy])

  return (
    <div 
      className="w-full h-full flex flex-col relative overflow-hidden"
      style={{
        background: 'var(--ink)',
        backgroundImage: `
          radial-gradient(ellipse at 10% -10%, rgba(14, 165, 201, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 90% 110%, rgba(239, 68, 68, 0.06) 0%, transparent 50%)
        `,
      }}
    >
      <div className="p-6 pb-2">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
            <Activity size={18} className="text-white" />
          </div>
          <h1 className="font-bold text-2xl tracking-tight text-white uppercase" style={{ fontFamily: 'var(--font-head)' }}>Find a River</h1>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 text-white/20" size={18} />
          <input 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-base focus:border-cyan-500/50 outline-none transition-colors"
            placeholder="Search by river name or state..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between text-xs uppercase tracking-widest text-white/40 font-bold mb-4">
          <div className="flex gap-4">
            <button onClick={() => setSortBy('health')} className={`transition-colors ${sortBy === 'health' ? 'text-cyan-400' : ''}`}>Health Grade</button>
            <button onClick={() => setSortBy('alpha')} className={`transition-colors ${sortBy === 'alpha' ? 'text-cyan-400' : ''}`}>Alphabetical</button>
          </div>
          <SlidersHorizontal size={14} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-10" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
        {/* Quote Banner */}
        <div className="sticky top-0 bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/20 rounded-2xl p-5 mb-4 mt-2 backdrop-blur-sm z-10">
          <p className="text-sm font-semibold text-red-300">
            "Our rivers are drowning. The data proves it. Nobody told you."
          </p>
          <p className="text-xs text-white/40 mt-2">Check these 50+ rivers that we're monitoring.</p>
        </div>

        {filtered.length > 0 ? (
          filtered.map(r => {
            const gradeColors = { A:'#22C55E', B:'#84CC16', C:'#F59E0B', D:'#F97316', F:'#EF4444' }
            return (
              <div 
                key={r.id}
                onClick={() => onSelect(r)}
                className={`group p-5 rounded-2xl cursor-pointer border transition-all ${
                  selectedRiver?.id === r.id ? 'bg-white/10 border-cyan-500/40 shadow-lg shadow-cyan-500/10' : 'bg-white/5 border-transparent hover:bg-white/10'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-base truncate">{r.river_name}</h3>
                    <p className="text-xs text-white/40 uppercase tracking-tighter mt-1">{r.state}</p>
                  </div>
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm text-white shrink-0 ml-3"
                    style={{ background: gradeColors[r.grade] || '#6b7280' }}
                  >
                    {r.grade}
                  </div>
                </div>

                {selectedRiver?.id === r.id && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onLocate?.(); }}
                    className="mt-4 w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <MapPin size={16} /> VIEW ON MAP
                  </button>
                )}
              </div>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <p className="text-white/60">No rivers found</p>
          </div>
        )}

        {/* Activism Quotes Collection */}
        <div className="pt-6 mt-6 border-t border-white/10">
          <p className="text-xs uppercase tracking-widest text-white/30 font-bold mb-4">Why This Matters</p>
          {ACTIVISM_QUOTES.map((quote, idx) => {
            const IconComponent = quote.icon
            return (
              <div key={idx} className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 pt-1">
                    <IconComponent size={16} className="text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 leading-relaxed">{quote.text}</p>
                    <p className="text-xs text-white/40 mt-2">— {quote.source}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
