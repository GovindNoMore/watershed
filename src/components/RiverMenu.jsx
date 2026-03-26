/**
 * RiverMenu.jsx — Improved river panel with smart listing modes
 * New: Grade swim-lanes, health heatmap bar, inline spark metrics,
 *      state-grouped accordion, and a "crisis mode" alert strip.
 */
import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, MapPin, AlertTriangle, Droplets, TrendingDown, FileText,
  Filter, X, ChevronDown, Thermometer, Wind, Zap, LayoutGrid,
  List, Map, Layers, Eye, ArrowUpDown, ChevronRight
} from 'lucide-react'
import RiverMap from './RiverMap'
import ReportCard from './ReportCard'

// ─── Constants ────────────────────────────────────────────────────────────────

const GRADE_META = {
  A: { color: '#22C55E', bg: 'rgba(34,197,94,0.12)', label: 'Excellent', emoji: '✦' },
  B: { color: '#84CC16', bg: 'rgba(132,204,22,0.12)', label: 'Good',      emoji: '◆' },
  C: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'Moderate',  emoji: '▲' },
  D: { color: '#F97316', bg: 'rgba(249,115,22,0.12)', label: 'Poor',      emoji: '●' },
  F: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  label: 'Critical',  emoji: '⬟' },
  '?': { color: '#6b7280', bg: 'rgba(107,114,128,0.12)', label: 'Unknown', emoji: '?' },
}

const SORT_OPTIONS = [
  { key: 'health',       label: 'Health Grade',  icon: '🧬', desc: 'Best to worst' },
  { key: 'crisis',       label: 'Crisis First',  icon: '🚨', desc: 'F grades up top' },
  { key: 'popularity',   label: 'Most Monitored',icon: '📡', desc: 'Station density' },
  { key: 'drinkability', label: 'Drinkability',  icon: '💧', desc: 'Safest to drink' },
  { key: 'bathability',  label: 'Bathability',   icon: '🏊', desc: 'Safe to bathe in' },
  { key: 'untouched',    label: 'Untouched',     icon: '🌿', desc: 'Least monitored' },
  { key: 'alpha',        label: 'A → Z',         icon: '🔤', desc: 'Alphabetical' },
]

const VIEW_MODES = [
  { key: 'list',   icon: List,       label: 'List' },
  { key: 'lanes',  icon: Layers,     label: 'Lanes' },
  { key: 'states', icon: LayoutGrid, label: 'States' },
]

const ACTIVISM_QUOTES = [
  { icon: <AlertTriangle size={18} />, color: '#EF4444', headline: '296 rivers', sub: 'have polluted stretches in India as of 2025 — and we monitor them all', source: 'CPCB Polluted River Stretches Report 2025' },
  { icon: <TrendingDown size={18} />,  color: '#F97316', headline: '70% untreated', sub: 'of industrial and municipal wastewater flows into our rivers', source: 'CPCB Report 2024' },
  { icon: <Droplets size={18} />,      color: '#F59E0B', headline: '70%', sub: 'of waterborne diseases in India are caused by river pollution', source: 'CPCB Data 2022' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Horizontal health distribution bar shown in the hero */
function HealthBar({ rivers }) {
  const gradeCounts = useMemo(() => {
    const counts = { A: 0, B: 0, C: 0, D: 0, F: 0 }
    rivers.forEach(r => {
      if (counts[r.grade] !== undefined) {
        counts[r.grade]++
      }
    })
    return counts
  }, [rivers])

  const total = Object.values(gradeCounts).reduce((a, b) => a + b, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="max-w-xl mx-auto mt-5 space-y-2"
    >
      {/* Bar */}
      <div className="flex rounded-full overflow-hidden h-2.5 gap-px">
        {Object.entries(gradeCounts).map(([grade, count]) => {
          const pct = total ? (count / total) * 100 : 0
          return (
            <motion.div
              key={grade}
              initial={{ flex: 0 }}
              animate={{ flex: pct }}
              transition={{ duration: 1, delay: 0.6 + Object.keys(gradeCounts).indexOf(grade) * 0.08 }}
              style={{ background: GRADE_META[grade]?.color || '#6b7280', minWidth: count ? 4 : 0 }}
              title={`Grade ${grade}: ${count}`}
            />
          )
        })}
      </div>
      {/* Legend */}
      <div className="flex justify-center gap-4 flex-wrap">
        {Object.entries(gradeCounts).map(([grade, count]) => (
          <div key={grade} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: GRADE_META[grade]?.color }} />
            <span style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-body)' }}>
              {grade} · {count}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

/** Single river card for list mode */
function RiverRow({ river, metrics, isSelected, onClick, index }) {
  const m = metrics[river.river_name] || {}
  const meta = GRADE_META[river.grade] || GRADE_META['?']

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.3 }}
      onClick={onClick}
      className="group relative cursor-pointer rounded-xl overflow-hidden border transition-all"
      style={{
        background: isSelected ? meta.bg : 'rgba(255,255,255,0.04)',
        borderColor: isSelected ? meta.color + '60' : 'rgba(255,255,255,0.08)',
      }}
    >
      {/* Grade accent strip */}
      <div className="absolute left-0 inset-y-0 w-0.5 rounded-l-xl transition-all group-hover:w-1"
        style={{ background: meta.color }} />

      <div className="px-4 py-3.5 flex items-center gap-4">
        {/* Grade badge */}
        <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center font-bold text-sm text-white"
          style={{ background: meta.color + '22', border: `1.5px solid ${meta.color}50`, color: meta.color, fontFamily: 'var(--font-head)' }}>
          {river.grade}
        </div>

        {/* Name + state */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight truncate" style={{ color: 'var(--sand)', fontFamily: 'var(--font-head)' }}>
            {river.river_name}
          </p>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--hint)' }}>
            {river.state}
          </p>
        </div>

        {/* Inline mini-metrics */}
        <div className="hidden sm:flex items-center gap-3 text-right">
          {river.bod_max != null && (
            <div className="text-right">
              <p className="text-xs font-mono" style={{ color: river.bod_max > 6 ? '#F97316' : '#22C55E' }}>
                {river.bod_max}
              </p>
              <p style={{ fontSize: '9px', color: 'var(--hint)' }}>BOD</p>
            </div>
          )}
          {river.do_min != null && (
            <div className="text-right">
              <p className="text-xs font-mono" style={{ color: river.do_min < 4 ? '#EF4444' : '#22C55E' }}>
                {river.do_min}
              </p>
              <p style={{ fontSize: '9px', color: 'var(--hint)' }}>DO</p>
            </div>
          )}
          <div className="text-right">
            <p className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
              {m.count || 1}
            </p>
            <p style={{ fontSize: '9px', color: 'var(--hint)' }}>stn</p>
          </div>
        </div>

        <ChevronRight size={14} className="shrink-0 transition-transform group-hover:translate-x-0.5"
          style={{ color: isSelected ? meta.color : 'var(--hint)' }} />
      </div>
    </motion.div>
  )
}

/** Grade swim-lanes view: rivers grouped by grade */
function SwimLanes({ filtered, metrics, selectedRiver, onSelect }) {
  const [expanded, setExpanded] = useState({ A: true, B: true, C: true, D: true, F: true })

  const byGrade = useMemo(() => {
    const groups = { A: [], B: [], C: [], D: [], F: [] }
    filtered.forEach(r => { if (groups[r.grade]) groups[r.grade].push(r) })
    return groups
  }, [filtered])

  return (
    <div className="space-y-3">
      {Object.entries(byGrade).map(([grade, rivers]) => {
        if (!rivers.length) return null
        const meta = GRADE_META[grade]
        const isOpen = expanded[grade]

        return (
          <div key={grade} className="rounded-xl overflow-hidden border" style={{ borderColor: meta.color + '25' }}>
            {/* Lane header */}
            <button
              className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/5"
              style={{ background: meta.bg }}
              onClick={() => setExpanded(e => ({ ...e, [grade]: !e[grade] }))}
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-sm"
                  style={{ background: meta.color, color: '#000', fontFamily: 'var(--font-head)' }}>
                  {grade}
                </div>
                <span className="font-semibold text-sm" style={{ color: meta.color, fontFamily: 'var(--font-head)' }}>
                  {meta.label}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono"
                  style={{ background: meta.color + '18', color: meta.color }}>
                  {rivers.length} river{rivers.length !== 1 ? 's' : ''}
                </span>
              </div>
              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                <ChevronDown size={15} style={{ color: meta.color }} />
              </motion.div>
            </button>

            {/* Lane rows */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="divide-y overflow-hidden"
                  style={{ divideColor: 'rgba(255,255,255,0.05)' }}
                >
                  {rivers.map((r, i) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => onSelect(r)}
                      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                      style={{
                        background: selectedRiver?.id === r.id ? meta.bg : 'transparent',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: meta.color }} />
                      <span className="flex-1 text-sm truncate" style={{ color: 'var(--sand)', fontFamily: 'var(--font-head)', fontWeight: 500 }}>
                        {r.river_name}
                      </span>
                      <span className="text-xs shrink-0" style={{ color: 'var(--hint)' }}>
                        {r.state}
                      </span>
                      {r.bod_max != null && (
                        <span className="text-xs font-mono shrink-0" style={{ color: r.bod_max > 6 ? '#F97316' : 'var(--hint)' }}>
                          BOD {r.bod_max}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

/** State-grouped accordion view */
function StateGroups({ filtered, metrics, selectedRiver, onSelect }) {
  const [openState, setOpenState] = useState(null)

  const byState = useMemo(() => {
    const groups = {}
    filtered.forEach(r => {
      if (!groups[r.state]) groups[r.state] = []
      groups[r.state].push(r)
    })
    // Sort states by worst grade
    const gradeOrder = { A: 0, B: 1, C: 2, D: 3, F: 4, '?': 5 }
    return Object.entries(groups).sort(([, a], [, b]) => {
      const worstA = Math.max(...a.map(r => gradeOrder[r.grade] ?? 5))
      const worstB = Math.max(...b.map(r => gradeOrder[r.grade] ?? 5))
      return worstB - worstA
    })
  }, [filtered])

  return (
    <div className="space-y-2">
      {byState.map(([state, rivers]) => {
        const isOpen = openState === state
        // Dominant grade (worst present)
        const gradeOrder = { F: 0, D: 1, C: 2, B: 3, A: 4 }
        const dominantGrade = rivers.reduce((worst, r) =>
          (gradeOrder[r.grade] ?? 5) < (gradeOrder[worst] ?? 5) ? r.grade : worst
        , 'A')
        const meta = GRADE_META[dominantGrade] || GRADE_META['?']

        // Grade mini-distribution
        const dist = rivers.reduce((acc, r) => { acc[r.grade] = (acc[r.grade] || 0) + 1; return acc }, {})

        return (
          <div key={state} className="rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
              style={{ background: isOpen ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)' }}
              onClick={() => setOpenState(isOpen ? null : state)}
            >
              <MapPin size={12} style={{ color: meta.color, flexShrink: 0 }} />
              <span className="flex-1 text-left text-sm font-semibold" style={{ color: 'var(--sand)', fontFamily: 'var(--font-head)' }}>
                {state}
              </span>

              {/* Mini grade dots */}
              <div className="flex gap-1 items-center">
                {Object.entries(dist).map(([g, n]) => (
                  <div key={g} className="flex items-center gap-0.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: GRADE_META[g]?.color }} />
                    <span style={{ fontSize: '9px', color: 'var(--hint)', fontFamily: 'var(--font-body)' }}>{n}</span>
                  </div>
                ))}
              </div>

              <span className="text-xs ml-1 font-mono" style={{ color: 'var(--hint)' }}>
                {rivers.length}
              </span>

              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                <ChevronDown size={13} style={{ color: 'var(--hint)' }} />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.28 }}
                  className="overflow-hidden"
                >
                  {rivers.map((r, i) => {
                    const rm = GRADE_META[r.grade] || GRADE_META['?']
                    return (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => onSelect(r)}
                        className="flex items-center gap-3 px-5 py-2.5 cursor-pointer border-t transition-colors hover:bg-white/5"
                        style={{
                          borderColor: 'rgba(255,255,255,0.05)',
                          background: selectedRiver?.id === r.id ? rm.bg : 'transparent',
                        }}
                      >
                        <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: rm.color + '20', color: rm.color, fontFamily: 'var(--font-head)' }}>
                          {r.grade}
                        </div>
                        <span className="flex-1 text-sm" style={{ color: 'var(--sand)' }}>{r.river_name}</span>
                        {r.fecal_coliform_max != null && r.fecal_coliform_max > 2500 && (
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', fontSize: '9px' }}>
                            ⚠ FC
                          </span>
                        )}
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

/** Crisis alert strip — shown when F-grade rivers present */
function CrisisStrip({ rivers }) {
  const crisisRivers = useMemo(() => {
    return rivers.filter(r => r.grade === 'F').slice(0, 5)
  }, [rivers])

  if (!crisisRivers.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55 }}
      className="rounded-xl overflow-hidden border"
      style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}
    >
      <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: 'rgba(239,68,68,0.15)' }}>
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span style={{ fontSize: '10px', color: '#EF4444', fontFamily: 'var(--font-body)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Critical Rivers
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto px-4 py-2.5" style={{ scrollbarWidth: 'none' }}>
        {crisisRivers.map(r => (
          <div key={r.id} className="shrink-0 px-2.5 py-1 rounded-md text-xs"
            style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
            {r.river_name}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function RiverMenu({ rivers, selectedRiver, onSelect, onLocate }) {
  const [query, setQuery]             = useState('')
  const [sortBy, setSortBy]           = useState('popularity')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode]       = useState('list')
  const [mapExpanded, setMapExpanded] = useState(false)
  const [mapSelectedRiver, setMapSelectedRiver] = useState(null)
  const mapRef = useRef()

  // River metrics for sorting
  const riverMetrics = useMemo(() => {
    const m = {}
    rivers.forEach(r => {
      if (!m[r.river_name]) m[r.river_name] = { count: 0, grades: [], worst_bod: 0, worst_coliform: 0, best_do: 100 }
      m[r.river_name].count++
      m[r.river_name].grades.push(r.grade)
      m[r.river_name].worst_bod        = Math.max(m[r.river_name].worst_bod, r.bod_max || 0)
      m[r.river_name].worst_coliform   = Math.max(m[r.river_name].worst_coliform, r.fecal_coliform_max || 0)
      m[r.river_name].best_do          = Math.min(m[r.river_name].best_do, r.do_min || 100)
    })
    return m
  }, [rivers])

  const filtered = useMemo(() => {
    let list = rivers.filter(r =>
      r.river_name.toLowerCase().includes(query.toLowerCase()) ||
      r.state.toLowerCase().includes(query.toLowerCase())
    )
    // Show all 50 rivers (including duplicate monitoring stations)
    const go = { A: 0, B: 1, C: 2, D: 3, F: 4, '?': 5 }
    if (sortBy === 'health')       list.sort((a, b) => (go[a.grade] ?? 5) - (go[b.grade] ?? 5))
    else if (sortBy === 'crisis')  list.sort((a, b) => (go[b.grade] ?? 5) - (go[a.grade] ?? 5))
    else if (sortBy === 'alpha')   list.sort((a, b) => a.river_name.localeCompare(b.river_name))
    else if (sortBy === 'popularity') list.sort((a, b) => (riverMetrics[b.river_name]?.count || 0) - (riverMetrics[a.river_name]?.count || 0))
    else if (sortBy === 'drinkability') list.sort((a, b) => {
      const sc = r => (1 / (riverMetrics[r.river_name]?.worst_coliform || 1)) * 100 + (riverMetrics[r.river_name]?.best_do || 0) * 10 - (riverMetrics[r.river_name]?.worst_bod || 0) * 5
      return sc(b) - sc(a)
    })
    else if (sortBy === 'bathability') list.sort((a, b) => {
      const safe = r => (riverMetrics[r.river_name]?.worst_coliform || 0) < 500 ? -1 : 1
      return safe(a) - safe(b)
    })
    else if (sortBy === 'untouched') list.sort((a, b) => (riverMetrics[a.river_name]?.count || 0) - (riverMetrics[b.river_name]?.count || 0))
    return list
  }, [rivers, query, sortBy, riverMetrics])

  const activeSortMeta = SORT_OPTIONS.find(s => s.key === sortBy)

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--ink)' }}>
      {/* Background accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #0EA5C9 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-80px] right-[-100px] w-[400px] h-[400px] rounded-full opacity-6"
          style={{ background: 'radial-gradient(circle, #EF4444 0%, transparent 70%)' }} />
      </div>

      <div className="flex-1 overflow-y-auto" style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none' }}>
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>

        {/* ── Hero ──────────────────────────── */}
        <section className="relative px-6 pt-12 pb-4 text-center">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex items-center gap-2 mb-3 justify-center">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs font-medium tracking-widest uppercase"
              style={{ color: '#0EA5C9', fontFamily: 'var(--font-body)' }}>
              Find your river
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', lineHeight: 1.15, color: 'var(--sand)' }}
            className="mb-2 max-w-2xl mx-auto">
            Check your<br /><span style={{ color: '#0EA5C9' }}>river's health</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-center max-w-lg mx-auto"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)', fontSize: '13px', lineHeight: 1.5 }}>
            {rivers.length > 0 ? `${new Set(rivers.map(r => r.river_name)).size} Indian rivers` : '50+'} graded A to F.
            Find yours and explore its water quality.
          </motion.p>

          {/* Grade distribution bar */}
          <HealthBar rivers={rivers} />
        </section>

        {/* ── Search + Controls ──────────── */}
        <section className="px-6 pb-4" style={{ background: 'linear-gradient(to bottom, var(--ink), rgba(26,26,46,0.98))' }}>
          <div className="max-w-4xl mx-auto w-full space-y-3">

            {/* Search */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="relative">
              <Search className="absolute left-4 top-3.5 text-white/30" size={18} />
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-cyan-400/50 outline-none transition-colors"
                placeholder="Search river name or state…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ fontFamily: 'var(--font-body)', color: 'var(--sand)' }}
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-4 top-3.5 text-white/30 hover:text-white/60 transition-colors">
                  <X size={16} />
                </button>
              )}
            </motion.div>

            {/* Controls row: View mode toggle + sort */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="flex items-center gap-2">

              {/* View mode pills */}
              <div className="flex rounded-lg overflow-hidden border border-white/10 shrink-0">
                {VIEW_MODES.map(vm => {
                  const Icon = vm.icon
                  const active = viewMode === vm.key
                  return (
                    <button key={vm.key}
                      onClick={() => setViewMode(vm.key)}
                      title={vm.label}
                      className="px-3 py-2 transition-all flex items-center gap-1.5"
                      style={{
                        background: active ? 'rgba(14,165,201,0.2)' : 'rgba(255,255,255,0.04)',
                        color: active ? '#0EA5C9' : 'var(--hint)',
                        borderRight: '1px solid rgba(255,255,255,0.08)',
                      }}>
                      <Icon size={13} />
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-body)', display: 'none' }} className="sm:inline">
                        {vm.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Sort dropdown toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex-1 flex items-center justify-between py-2 px-3 rounded-lg font-medium text-sm transition-all"
                style={{
                  background: showFilters ? 'rgba(14,165,201,0.15)' : 'rgba(255,255,255,0.05)',
                  border: showFilters ? '1px solid rgba(14,165,201,0.3)' : '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--muted)',
                  fontFamily: 'var(--font-body)',
                }}>
                <div className="flex items-center gap-2">
                  <ArrowUpDown size={13} />
                  <span style={{ fontSize: '12px' }}>
                    {activeSortMeta?.icon} {activeSortMeta?.label}
                  </span>
                </div>
                <motion.div animate={{ rotate: showFilters ? 180 : 0 }} transition={{ duration: 0.25 }}>
                  <ChevronDown size={14} />
                </motion.div>
              </button>
            </motion.div>

            {/* Sort options panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => { setSortBy(opt.key); setShowFilters(false) }}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all"
                        style={{
                          background: sortBy === opt.key ? 'rgba(14,165,201,0.15)' : 'rgba(255,255,255,0.05)',
                          border: sortBy === opt.key ? '1px solid rgba(14,165,201,0.35)' : '1px solid rgba(255,255,255,0.08)',
                          color: sortBy === opt.key ? '#0EA5C9' : 'var(--muted)',
                        }}>
                        <span style={{ fontSize: '16px' }}>{opt.icon}</span>
                        <div>
                          <p style={{ fontSize: '12px', fontFamily: 'var(--font-body)', fontWeight: 600 }}>{opt.label}</p>
                          <p style={{ fontSize: '10px', color: 'var(--hint)' }}>{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ── River List ─────────────────── */}
        <section className="px-6 py-4">
          <div className="max-w-4xl mx-auto w-full space-y-3">

            {/* Crisis strip */}
            <CrisisStrip rivers={filtered} />

            {/* Result count */}
            {filtered.length > 0 && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
                style={{ fontSize: '11px', color: 'var(--hint)', fontFamily: 'var(--font-body)' }}>
                {filtered.length} rivers · sorted by {activeSortMeta?.label}
              </motion.p>
            )}

            {/* View mode renderers */}
            {filtered.length > 0 ? (
              <>
                {viewMode === 'list' && (
                  <div className="space-y-2">
                    {filtered.map((r, i) => (
                      <RiverRow
                        key={r.id}
                        river={r}
                        metrics={riverMetrics}
                        isSelected={selectedRiver?.id === r.id}
                        onClick={() => onSelect(r)}
                        index={i}
                      />
                    ))}
                  </div>
                )}

                {viewMode === 'lanes' && (
                  <SwimLanes
                    filtered={filtered}
                    metrics={riverMetrics}
                    selectedRiver={selectedRiver}
                    onSelect={onSelect}
                  />
                )}

                {viewMode === 'states' && (
                  <StateGroups
                    filtered={filtered}
                    metrics={riverMetrics}
                    selectedRiver={selectedRiver}
                    onSelect={onSelect}
                  />
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Droplets size={32} style={{ color: 'var(--hint)', opacity: 0.4 }} />
                <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)', fontSize: '14px' }}>
                  No rivers match "{query}"
                </p>
                <button onClick={() => setQuery('')} className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: 'rgba(14,165,201,0.12)', color: '#0EA5C9', fontFamily: 'var(--font-body)' }}>
                  Clear search
                </button>
              </div>
            )}

            {/* Locate button */}
            {selectedRiver && (
              <motion.button
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onClick={e => { e.stopPropagation(); onLocate?.() }}
                className="w-full mt-2 py-3 text-slate-950 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                style={{ background: 'linear-gradient(135deg, #0EA5C9, #06B6D4)', fontFamily: 'var(--font-body)' }}>
                <MapPin size={16} /> EXPLORE ON MAP
              </motion.button>
            )}

            {/* ── Why This Matters ─── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="py-8 mt-6 border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              <p className="text-xs font-medium tracking-widest uppercase mb-6"
                style={{ color: 'var(--hint)', fontFamily: 'var(--font-body)' }}>
                Why this matters
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ACTIVISM_QUOTES.map((f, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: 0.1 * i }}
                    className="card p-4 space-y-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: f.color + '18', color: f.color }}>
                      {f.icon}
                    </div>
                    <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.25rem', color: f.color, lineHeight: 1.1 }}>
                      {f.headline}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
                      {f.sub}
                    </p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <FileText size={10} style={{ color: 'var(--hint)' }} />
                      <span style={{ fontSize: '10px', color: 'var(--hint)', fontFamily: 'var(--font-body)' }}>{f.source}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Footer */}
            <div className="border-t py-8 text-center mb-4" style={{ borderColor: 'var(--border)' }}>
              <p style={{ fontSize: '11px', color: 'var(--hint)', fontFamily: 'var(--font-body)' }}>
                RiverLens · CPCB NWMP 2021 · Built for public awareness, not profit
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ── Floating map button ── */}
      {!mapExpanded && (
        <motion.button
          onClick={() => setMapExpanded(true)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.06 }}
          transition={{ delay: 0.8 }}
          className="fixed bottom-6 right-6 rounded-xl overflow-hidden shadow-xl border cursor-pointer z-30 px-4 py-3 flex items-center gap-2"
          style={{
            background: 'rgba(14,165,201,0.15)',
            border: '1px solid rgba(14,165,201,0.35)',
            backdropFilter: 'blur(12px)',
          }}
          title="Explore map"
        >
          <Map size={16} style={{ color: '#0EA5C9' }} />
          <span style={{ fontSize: '12px', color: '#0EA5C9', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            Map
          </span>
        </motion.button>
      )}

      {/* ── Map overlay ── */}
      <AnimatePresence>
        {mapExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex flex-col overflow-hidden"
            style={{ background: 'var(--ink)' }}
          >
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--deep)' }}>
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', color: 'var(--sand)', fontWeight: 600 }}>
                Explore Rivers
              </h2>
              <button onClick={() => { setMapExpanded(false); setMapSelectedRiver(null) }}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors" style={{ color: 'var(--sand)' }}>
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 overflow-hidden relative">
                <RiverMap
                  ref={mapRef}
                  rivers={rivers}
                  selected={mapSelectedRiver}
                  onSelect={setMapSelectedRiver}
                  onRiverClick={setMapSelectedRiver}
                />
              </div>
              <AnimatePresence>
                {mapSelectedRiver && (
                  <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ duration: 0.3 }}
                    className="w-96 border-l overflow-hidden flex flex-col"
                    style={{ borderColor: 'var(--border)', background: 'var(--ink)' }}
                  >
                    <ReportCard river={mapSelectedRiver} onClose={() => setMapSelectedRiver(null)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}