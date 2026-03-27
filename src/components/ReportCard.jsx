import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Activity, Droplets, Thermometer, AlertCircle, CheckCircle, Info } from 'lucide-react'
import GradeBadge from './GradeBadge'
import ParameterGrid from './ParameterGrid'
import TrendChart from './TrendChart'
import AIInsight from './AIInsight'
import ShareCard from './ShareCard'

const GRADE_META = {
  A: { color: '#22C55E', text: 'text-green-400',  label: 'Excellent', desc: 'Safe for bathing and recreation' },
  B: { color: '#84CC16', text: 'text-lime-400',   label: 'Good',      desc: 'Minor pollution, generally safe' },
  C: { color: '#F59E0B', text: 'text-amber-400',  label: 'Moderate',  desc: 'Polluted — avoid direct contact' },
  D: { color: '#F97316', text: 'text-orange-400', label: 'Poor',      desc: 'Heavily polluted, unsafe' },
  F: { color: '#EF4444', text: 'text-red-400',    label: 'Critical',  desc: 'Severely polluted — health risk' },
}

function MiniBar({ value, min, max, dangerAbove, dangerBelow, unit, label }) {
  if (value == null) return null
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
  const isDanger = dangerAbove != null ? value > dangerAbove : dangerBelow != null ? value < dangerBelow : false
  const barColor = isDanger ? '#EF4444' : '#22C55E'

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span style={{ fontSize: '10px', color: 'var(--hint)', fontFamily: 'var(--font-body)' }}>{label}</span>
        <span style={{ fontSize: '11px', color: isDanger ? '#EF4444' : '#22C55E', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
          {value} <span style={{ fontSize: '9px', color: 'var(--hint)' }}>{unit}</span>
        </span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="h-full rounded-full"
          style={{ background: barColor }}
        />
      </div>
    </div>
  )
}

/** Quick safety badge pill */
function SafetyBadge({ label, safe, icon: Icon }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
      style={{
        background: safe ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
        border: `1px solid ${safe ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
      }}>
      <Icon size={11} style={{ color: safe ? '#22C55E' : '#EF4444' }} />
      <span style={{ fontSize: '10px', color: safe ? '#22C55E' : '#EF4444', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
        {label}
      </span>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ReportCard({ river, onClose }) {
  if (!river) return null

  const meta = GRADE_META[river.grade] || {}
  const isBathable  = (river.fecal_coliform_max || 0) < 500
  const isDrinkable = (river.bod_max || 99) < 3 && (river.do_min || 0) > 6

  return (
    <AnimatePresence>
      <motion.div
        key={river.id}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="h-full flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3 shrink-0">
          <div className="flex-1 min-w-0 pr-3">
            <h2 className="font-display text-2xl font-bold text-river-sand leading-tight">
              {river.river_name}
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={11} className="text-river-teal shrink-0" />
              <p className="text-xs text-river-foam/50 font-body truncate">{river.state}</p>
            </div>
            <p className="text-xs text-river-foam/30 font-body mt-0.5 leading-tight line-clamp-2">
              {river.station_name}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <button onClick={onClose} className="text-river-foam/20 hover:text-river-sand transition-colors">
              <X size={16} />
            </button>
            <GradeBadge grade={river.grade} size="md" />
          </div>
        </div>

        {/* Grade label + safety badges */}
        <div className="px-5 pb-3 shrink-0 space-y-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-body font-semibold ${meta.text ?? 'text-gray-400'}`}>
                {meta.label ?? 'No data'}
              </span>
              {river.partial && (
                <span className="text-xs text-yellow-500/60 font-mono bg-yellow-500/10 px-2 py-0.5 rounded-full">
                  partial data
                </span>
              )}
            </div>
            <p className="text-xs text-river-foam/30 font-body mt-0.5">{meta.desc}</p>
          </div>

          {/* Safety quick-check badges */}
          <div className="flex gap-2 flex-wrap">
            <SafetyBadge label="Bathable"  safe={isBathable}  icon={isBathable  ? CheckCircle : AlertCircle} />
            <SafetyBadge label="Drinkable" safe={isDrinkable} icon={isDrinkable ? CheckCircle : AlertCircle} />
            {river.fecal_coliform_max != null && (
              <SafetyBadge
                label={`FC: ${river.fecal_coliform_max.toLocaleString()}`}
                safe={river.fecal_coliform_max < 2500}
                icon={Info}
              />
            )}
          </div>
        </div>

        {/* Visual bars for key params */}
        <div className="px-5 pb-4 shrink-0 space-y-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
          <p style={{ fontSize: '10px', fontFamily: 'var(--font-body)', color: 'var(--hint)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Key Indicators
          </p>
          <MiniBar value={river.bod_max}  min={0}  max={30}  dangerAbove={6}  unit="mg/L" label="BOD (max)" />
          <MiniBar value={river.do_min}   min={0}  max={15}  dangerBelow={4}  unit="mg/L" label="DO (min)"  />
          {river.ph_min != null && (
            <MiniBar value={river.ph_min} min={6}  max={9.5} dangerBelow={6.5} dangerAbove={8.5} unit="pH" label="pH (min)" />
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-5 pb-5 space-y-4 pt-4">

          <ParameterGrid river={river} />
          <TrendChart river={river} />
          <AIInsight river={river} />
          <ShareCard river={river} />

          {/* ── Data disclaimer ── */}
          <div className="border-t pt-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
            <div className="rounded-lg p-3" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.18)' }}>
              <p className="text-xs font-body leading-relaxed" style={{ color: 'var(--sand)' }}>
                📊 <strong>Official Data:</strong> CPCB NWMP 2021 (Station {river.station_code})<br />
                <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  📈 <strong>2026 Projections:</strong> Based on public studies &amp; trend analysis. Not official forecasts.
                </span>
              </p>
            </div>

            {/* ── 2026 Projections ── */}
            {river.estimated2026 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl overflow-hidden border"
                style={{ borderColor: 'rgba(249,115,22,0.2)', background: 'rgba(249,115,22,0.06)' }}
              >
                {/* Header */}
                <div className="flex items-center gap-2 px-3 py-2.5 border-b" style={{ borderColor: 'rgba(249,115,22,0.12)' }}>
                  <Activity size={12} style={{ color: '#F97316' }} />
                  <p className="text-xs font-semibold" style={{ fontFamily: 'var(--font-head)', color: '#F97316' }}>
                    2026 Projections
                  </p>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(249,115,22,0.12)', color: '#F97316', fontSize: '9px' }}>
                    Estimated
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 divide-x p-0" style={{ divideColor: 'rgba(249,115,22,0.1)' }}>
                  {river.estimated2026.bod_max != null && (
                    <div className="p-3 text-center space-y-1">
                      <Droplets size={12} style={{ color: '#F97316', margin: '0 auto' }} />
                      <p style={{ fontSize: '10px', color: 'var(--hint)' }}>BOD est.</p>
                      <p className="text-sm font-semibold" style={{ color: '#F97316', fontFamily: 'var(--font-head)' }}>
                        {river.estimated2026.bod_max}
                      </p>
                      <p className="text-xs font-mono" style={{ color: 'var(--hint)' }}>
                        ↑ from {river.bod_max}
                      </p>
                    </div>
                  )}
                  {river.estimated2026.do_min != null && (
                    <div className="p-3 text-center space-y-1">
                      <Thermometer size={12} style={{ color: '#EF4444', margin: '0 auto' }} />
                      <p style={{ fontSize: '10px', color: 'var(--hint)' }}>DO est.</p>
                      <p className="text-sm font-semibold" style={{ color: '#EF4444', fontFamily: 'var(--font-head)' }}>
                        {river.estimated2026.do_min}
                      </p>
                      <p className="text-xs font-mono" style={{ color: 'var(--hint)' }}>
                        ↓ from {river.do_min}
                      </p>
                    </div>
                  )}
                  {river.estimated2026.fecal_coliform_max != null && (
                    <div className="p-3 text-center space-y-1">
                      <AlertCircle size={12} style={{ color: '#EF4444', margin: '0 auto' }} />
                      <p style={{ fontSize: '10px', color: 'var(--hint)' }}>FC est.</p>
                      <p className="text-sm font-semibold" style={{ color: '#EF4444', fontFamily: 'var(--font-head)' }}>
                        {(river.estimated2026.fecal_coliform_max / 1000).toFixed(0)}k
                      </p>
                      <p className="text-xs font-mono" style={{ color: 'var(--hint)' }}>
                        vs {(river.fecal_coliform_max / 1000).toFixed(0)}k now
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}