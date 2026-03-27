import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react'
import { fetchRiverInsight, getFallbackInsight } from '../utils/groqInsight'

function SkeletonLine({ w = 'w-full' }) {
  return <div className={`h-3 rounded shimmer ${w}`} />
}

export default function AIInsight({ river }) {
  const [insight, setInsight] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]     = useState(null)
  const [isFallback, setFallback] = useState(false)

  async function load() {
    setLoading(true); setError(null); setFallback(false)
    try {
      setInsight(await fetchRiverInsight(river))
    } catch (err) {
      setInsight(getFallbackInsight(river)); setFallback(true); setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (river) load() }, [river?.id])

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={13} style={{ color: '#0EA5C9' }} />
          <span className="text-xs font-medium tracking-widest uppercase" style={{ color: '#0EA5C9', fontFamily: 'var(--font-body)' }}>
            AI Analysis
          </span>
          {isFallback && <span className="text-xs" style={{ color: 'rgba(245,158,11,0.6)', fontFamily: 'var(--font-mono)' }}>(offline)</span>}
        </div>
        {!loading && (
          <button onClick={load} className="transition-colors hover:opacity-100" style={{ color: 'var(--hint)' }}>
            <RefreshCw size={11} />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="load" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="space-y-2">
            <SkeletonLine /><SkeletonLine w="w-5/6" /><SkeletonLine w="w-4/6" />
            <div className="pt-1 space-y-1.5"><SkeletonLine w="w-3/4" /><SkeletonLine w="w-2/3" /></div>
          </motion.div>
        )}
        {!loading && insight && (
          <motion.div key="content" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} className="space-y-3">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}>{insight.summary}</p>
            <div>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--hint)', fontFamily: 'var(--font-body)' }}>Top causes</p>
              <ul className="space-y-1.5">
                {insight.causes?.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'rgba(245,240,232,0.6)', fontFamily: 'var(--font-body)' }}>
                    <span style={{ color: '#0EA5C9', marginTop: 1, flexShrink:0 }}>›</span>{c}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'rgba(14,165,201,0.08)', border: '1px solid rgba(14,165,201,0.15)' }}>
              <p className="text-xs font-medium mb-1" style={{ color: '#38BDF8', fontFamily: 'var(--font-body)' }}>💡 What can be done</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(245,240,232,0.55)', fontFamily: 'var(--font-body)' }}>{insight.recommendation}</p>
            </div>
          </motion.div>
        )}
        {!loading && error && !insight && (
          <motion.div key="error" className="flex items-center gap-2 text-xs" style={{ color: 'rgba(245,158,11,0.6)' }}>
            <AlertCircle size={12} />
            <span style={{ fontFamily: 'var(--font-body)' }}>Add VITE_GROQ_API_KEY to .env to enable AI analysis</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border)' }}>
        <span className="text-xs" style={{ color: 'var(--hint)', fontFamily: 'var(--font-body)' }}>Powered by Groq / Llama 3.3</span>
        <span className="text-xs" style={{ color: 'var(--hint)', fontFamily: 'var(--font-mono)' }}>CPCB NWMP 2021</span>
      </div>
    </div>
  )
}
