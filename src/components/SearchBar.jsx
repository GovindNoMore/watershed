import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, MapPin } from 'lucide-react'

export default function SearchBar({ onSelect, rivers = [] }) {
  const [query, setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen]     = useState(false)
  const [focused, setFocused] = useState(false)
  const inputRef   = useRef(null)
  const containerRef = useRef(null)

  function doSearch(q) {
    setQuery(q)
    if (!q.trim()) { setResults([]); setOpen(false); return }
    const lower = q.toLowerCase()
    const hits = rivers.filter(r =>
      r.river_name.toLowerCase().includes(lower) ||
      r.state.toLowerCase().includes(lower) ||
      r.station_name.toLowerCase().includes(lower)
    ).slice(0, 8)
    setResults(hits); setOpen(hits.length > 0)
  }

  function select(river) { setQuery(river.river_name); setOpen(false); onSelect(river); inputRef.current?.blur() }
  function clear() { setQuery(''); setResults([]); setOpen(false); inputRef.current?.focus() }

  useEffect(() => {
    const handler = e => { if (!containerRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${focused ? 'ring-1 ring-cyan-500/40' : ''}`}
        style={{ background: 'rgba(36,51,80,0.8)', border: '1px solid var(--border)' }}>
        <Search size={14} style={{ color: focused ? '#0EA5C9' : 'rgba(245,240,232,0.2)', flexShrink:0 }} />
        <input ref={inputRef} type="text" value={query} onChange={e => doSearch(e.target.value)}
          onFocus={() => { setFocused(true); if (results.length) setOpen(true) }}
          onBlur={() => setFocused(false)}
          placeholder="Search rivers, states…"
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: 'var(--sand)', fontFamily: 'var(--font-body)' }}
        />
        {query && <button onClick={clear} style={{ color: 'rgba(245,240,232,0.25)' }}><X size={13} /></button>}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
            transition={{ duration:0.12 }}
            className="absolute top-full left-0 right-0 mt-1.5 rounded-xl overflow-hidden z-50"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 16px 40px rgba(0,0,0,0.5)' }}>
            {results.map(r => (
              <button key={r.id} onMouseDown={() => select(r)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-white/5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <MapPin size={11} style={{ color: '#0EA5C9', flexShrink:0 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: 'var(--sand)', fontFamily: 'var(--font-body)' }}>{r.river_name}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--hint)', fontFamily: 'var(--font-body)' }}>{r.station_name}</p>
                </div>
                <span className="text-xs shrink-0" style={{ color: 'var(--hint)', fontFamily: 'var(--font-body)' }}>{r.state}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
