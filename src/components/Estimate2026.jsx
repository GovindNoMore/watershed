import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, FlaskConical, ExternalLink } from 'lucide-react'
import { getEstimate2026 } from '../data/estimates2026'
import { GRADE_META } from '../utils/grading'

const TREND_CONFIG = {
  worsening:            { icon: <TrendingDown size={11} />, color: '#f87171', label: 'Worsening' },
  'stable-critical':    { icon: <Minus size={11} />,        color: '#fb923c', label: 'Stable (critical)' },
  'stable-poor':        { icon: <Minus size={11} />,        color: '#fbbf24', label: 'Stable (poor)' },
  stable:               { icon: <Minus size={11} />,        color: '#94a3b8', label: 'Stable' },
  'marginal-improvement': { icon: <TrendingUp size={11} />, color: '#4ade80', label: 'Slight improvement' },
  unknown:              { icon: <Minus size={11} />,        color: '#475569', label: 'Unknown' },
}

export default function Estimate2026({ river }) {
  const est = getEstimate2026(river)
  if (!est || est === getEstimate2026({ river_name: '__none__' })) return null

  const isDefault = est.trend === 'unknown' && !est.grade
  const gradeMeta = est.grade ? (GRADE_META[est.grade] ?? GRADE_META['?']) : null
  const trend = TREND_CONFIG[est.trend] ?? TREND_CONFIG.unknown

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="est-box p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical size={13} style={{ color: '#fb923c' }} />
          <span className="pill pill-est">2025–2026 estimate</span>
        </div>
        {est.grade && gradeMeta && (
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: gradeMeta.color }}
            >
              {est.grade}
            </div>
            <span className="text-xs font-medium" style={{ color: gradeMeta.color, fontFamily: 'var(--font-body)' }}>
              {gradeMeta.label}
            </span>
          </div>
        )}
      </div>

      {/* Trend */}
      <div className="flex items-center gap-1.5">
        <span style={{ color: trend.color }}>{trend.icon}</span>
        <span className="text-xs" style={{ color: trend.color, fontFamily: 'var(--font-body)' }}>{trend.label}</span>
        <span className="text-xs ml-1" style={{ color: 'rgba(245,240,232,0.2)', fontFamily: 'var(--font-body)' }}>vs 2021</span>
      </div>

      {/* Note */}
      <p className="text-xs leading-relaxed" style={{ color: 'rgba(245,240,232,0.6)', fontFamily: 'var(--font-body)' }}>
        {est.note}
      </p>

      {/* Estimated params if available */}
      {(est.bod_est || est.do_est || est.fc_est) && (
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { label: 'BOD est.', value: est.bod_est, unit: 'mg/L', bad: v => v > 3 },
            { label: 'DO est.',  value: est.do_est,  unit: 'mg/L', bad: v => v < 5 },
            { label: 'FC est.',  value: est.fc_est,  unit: 'MPN',  bad: v => v > 500 },
          ].map(({ label, value, unit, bad }) => value != null ? (
            <div key={label} className="rounded-lg p-2 text-center"
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="text-xs mb-0.5" style={{ color: 'rgba(245,240,232,0.35)', fontFamily: 'var(--font-body)' }}>{label}</div>
              <div className="text-sm font-semibold" style={{
                color: bad(value) ? '#f87171' : '#4ade80',
                fontFamily: 'var(--font-mono)',
              }}>
                {value >= 1000000
                  ? (value / 1000000).toFixed(1) + 'M'
                  : value >= 1000
                  ? (value / 1000).toFixed(0) + 'k'
                  : value}
              </div>
              <div className="text-xs" style={{ color: 'rgba(245,240,232,0.2)', fontFamily: 'var(--font-body)' }}>{unit}</div>
            </div>
          ) : null)}
        </div>
      )}

      {/* Sources */}
      {est.sources?.length > 0 && (
        <div className="pt-1 space-y-0.5">
          {est.sources.map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              <ExternalLink size={9} style={{ color: 'rgba(245,240,232,0.2)' }} />
              <span className="text-xs" style={{ color: 'rgba(245,240,232,0.25)', fontFamily: 'var(--font-body)' }}>{s}</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs italic pt-1" style={{ color: 'rgba(245,240,232,0.2)', fontFamily: 'var(--font-body)' }}>
        Estimate — not official CPCB data. Based on published research.
      </p>
    </motion.div>
  )
}
