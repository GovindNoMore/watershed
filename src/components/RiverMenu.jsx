import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, AlertTriangle, Droplets, TrendingDown, FileText, Filter, X, ChevronDown } from 'lucide-react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table'
import RiverMap from './RiverMap'
import ReportCard from './ReportCard'

const ACTIVISM_QUOTES = [
  {
    icon: <AlertTriangle size={18} />,
    color: '#EF4444',
    headline: '296 rivers',
    sub: 'have polluted stretches in India as of 2025 — and we monitor them all',
    source: 'CPCB Polluted River Stretches Report 2025',
  },
  {
    icon: <TrendingDown size={18} />,
    color: '#F97316',
    headline: '70% untreated',
    sub: 'of industrial and municipal wastewater flows into our rivers',
    source: 'CPCB Report 2024',
  },
  {
    icon: <Droplets size={18} />,
    color: '#F59E0B',
    headline: '70%',
    sub: 'of waterborne diseases in India are caused by river pollution',
    source: 'CPCB Data 2022',
  },
]

export default function RiverMenu({ rivers, selectedRiver, onSelect, onLocate }) {
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('popularity')
  const [sorting, setSorting] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [mapExpanded, setMapExpanded] = useState(false)
  const [mapSelectedRiver, setMapSelectedRiver] = useState(null)
  const mapRef = useRef()

  // Calculate river metrics for advanced filtering
  const riverMetrics = useMemo(() => {
    const metrics = {}
    rivers.forEach(r => {
      if (!metrics[r.river_name]) {
        metrics[r.river_name] = {
          count: 0,
          grades: [],
          worst_bod: 0,
          worst_coliform: 0,
          best_do: 100
        }
      }
      metrics[r.river_name].count++
      metrics[r.river_name].grades.push(r.grade)
      metrics[r.river_name].worst_bod = Math.max(metrics[r.river_name].worst_bod, r.bod_max || 0)
      metrics[r.river_name].worst_coliform = Math.max(metrics[r.river_name].worst_coliform, r.fecal_coliform_max || 0)
      metrics[r.river_name].best_do = Math.min(metrics[r.river_name].best_do, r.do_min || 100)
    })
    return metrics
  }, [rivers])

  const filtered = useMemo(() => {
    let list = rivers.filter(r => 
      r.river_name.toLowerCase().includes(query.toLowerCase()) || 
      r.state.toLowerCase().includes(query.toLowerCase())
    )
    
    // Remove duplicates - keep only first entry per river
    const seen = new Set()
    list = list.filter(r => {
      if (seen.has(r.river_name)) return false
      seen.add(r.river_name)
      return true
    })

    // Apply sorting
    if (sortBy === 'health') {
      list.sort((a, b) => a.grade.localeCompare(b.grade))
    } else if (sortBy === 'alpha') {
      list.sort((a, b) => a.river_name.localeCompare(b.river_name))
    } else if (sortBy === 'popularity') {
      list.sort((a, b) => (riverMetrics[b.river_name]?.count || 0) - (riverMetrics[a.river_name]?.count || 0))
    } else if (sortBy === 'drinkability') {
      list.sort((a, b) => {
        const scoreA = 
          (1 / (riverMetrics[a.river_name]?.worst_coliform || 1)) * 100 +
          (riverMetrics[a.river_name]?.best_do || 0) * 10 -
          (riverMetrics[a.river_name]?.worst_bod || 0) * 5
        const scoreB = 
          (1 / (riverMetrics[b.river_name]?.worst_coliform || 1)) * 100 +
          (riverMetrics[b.river_name]?.best_do || 0) * 10 -
          (riverMetrics[b.river_name]?.worst_bod || 0) * 5
        return scoreB - scoreA
      })
    } else if (sortBy === 'bathability') {
      list.sort((a, b) => {
        const safeA = (riverMetrics[a.river_name]?.worst_coliform || 0) < 500 ? -1 : 1
        const safeB = (riverMetrics[b.river_name]?.worst_coliform || 0) < 500 ? -1 : 1
        return safeA - safeB
      })
    } else if (sortBy === 'untouched') {
      list.sort((a, b) => (riverMetrics[a.river_name]?.count || 0) - (riverMetrics[b.river_name]?.count || 0))
    }

    return list
  }, [rivers, query, sortBy, riverMetrics])

  // React Table columns
  const columnHelper = createColumnHelper()
  
  const columns = [
    columnHelper.accessor('river_name', {
      header: 'River',
      cell: info => (
        <span style={{ fontWeight: 600, color: 'var(--sand)', fontSize: '14px', fontFamily: 'var(--font-head)' }}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('state', {
      header: 'State',
      cell: info => (
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('grade', {
      header: 'Grade',
      cell: info => {
        const gradeColors = { A:'#22C55E', B:'#84CC16', C:'#F59E0B', D:'#F97316', F:'#EF4444' }
        return (
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
            style={{ background: gradeColors[info.getValue()] || '#6b7280' }}
          >
            {info.getValue()}
          </div>
        )
      },
    }),
    columnHelper.accessor(row => riverMetrics[row.river_name]?.count || 0, {
      id: 'stations',
      header: 'Stations',
      cell: info => (
        <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>
          {info.getValue()}
        </span>
      ),
    }),
  ]

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--ink)' }}>
      {/* Background radial accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #0EA5C9 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-80px] right-[-100px] w-[400px] h-[400px] rounded-full opacity-6"
          style={{ background: 'radial-gradient(circle, #EF4444 0%, transparent 70%)' }} />
      </div>

      {/* ── Hero Header ──────────────────────────── */}
      <section className="relative px-6 pt-12 pb-6 text-center flex-shrink-0">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mb-3 justify-center"
        >
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-xs font-medium tracking-widest uppercase"
            style={{ color: '#0EA5C9', fontFamily: 'var(--font-body)' }}>
            Find your river
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', lineHeight: 1.15, color: 'var(--sand)' }}
          className="mb-2 max-w-2xl mx-auto"
        >
          Check your<br />
          <span style={{ color: '#0EA5C9' }}>river's health</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center max-w-lg mx-auto"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)', fontSize: '13px', lineHeight: 1.5 }}
        >
          50+ Indian rivers graded A to F. Find yours and explore its water quality.
        </motion.p>
      </section>

      {/* ── Search & Filter (Sticky) ──────────────── */}
      <section className="px-6 sticky top-0 z-20 flex-shrink-0" style={{ background: 'linear-gradient(to bottom, var(--ink), rgba(26,26,46,0.98))' }}>
        <div className="max-w-4xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3 pt-2 pb-4"
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-white/30" size={18} />
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-cyan-400/50 outline-none transition-colors"
                placeholder="Search river name or state..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ fontFamily: 'var(--font-body)', color: 'var(--sand)' }}
              />
            </div>

            {/* Filter buttons - collapsible dropdown */}
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between py-2.5 px-4 rounded-lg font-medium text-sm transition-all"
              style={{
                background: showFilters ? 'rgba(14,165,201,0.2)' : 'rgba(255,255,255,0.05)',
                border: showFilters ? '1px solid rgba(14,165,201,0.4)' : '1px solid rgba(255,255,255,0.1)',
                color: showFilters ? '#0EA5C9' : 'var(--muted)',
                fontFamily: 'var(--font-body)',
              }}
            >
              <div className="flex items-center gap-2">
                <Filter size={16} />
                <span>Filters & Sorting</span>
              </div>
              <motion.div
                animate={{ rotate: showFilters ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown size={16} />
              </motion.div>
            </motion.button>

            {/* Collapsible filter options */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2 overflow-hidden"
                >
                  {[
                    { key: 'health', label: 'Health Grade' },
                    { key: 'popularity', label: 'Popularity' },
                    { key: 'drinkability', label: 'Drinkability' },
                    { key: 'bathability', label: 'Bathability' },
                    { key: 'untouched', label: 'Untouched' },
                    { key: 'alpha', label: 'Alphabetical' }
                  ].map(f => (
                    <button 
                      key={f.key}
                      onClick={() => {
                        setSortBy(f.key)
                        setShowFilters(false)
                      }}
                      className="w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all text-left"
                      style={{
                        background: sortBy === f.key ? 'rgba(14,165,201,0.2)' : 'rgba(255,255,255,0.05)',
                        border: sortBy === f.key ? '1px solid rgba(14,165,201,0.4)' : '1px solid rgba(255,255,255,0.1)',
                        color: sortBy === f.key ? '#0EA5C9' : 'var(--muted)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ── Advanced Table Grid (Scrollable) ──────── */}
      <section className="flex-1 overflow-y-auto px-6" style={{ 
        scrollBehavior: 'smooth',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        <style>{`
          section::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="max-w-4xl mx-auto w-full py-6">
          {filtered.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              {/* Table header row */}
              <div className="grid grid-cols-4 gap-4 px-4 py-3 rounded-lg mb-2" style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(14,165,201,0.2)' }}>
                {table.getFlatHeaders().map(header => (
                  <div key={header.id} style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--hint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </div>
                ))}
              </div>

              {/* Table data rows */}
              {table.getRowModel().rows.map((row, idx) => (
                <motion.div
                  key={row.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.05 }}
                  onClick={() => {
                    onSelect(row.original)
                  }}
                  className="grid grid-cols-4 gap-4 p-4 rounded-xl transition-all border cursor-pointer"
                  style={{
                    background: selectedRiver?.id === row.original.id ? 'rgba(14,165,201,0.15)' : 'rgba(255,255,255,0.05)',
                    border: selectedRiver?.id === row.original.id ? '1px solid rgba(14,165,201,0.4)' : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {row.getVisibleCells().map(cell => (
                    <div key={cell.id} className="flex items-center justify-start">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  ))}
                </motion.div>
              ))}



              {/* Action button when selected */}
              {selectedRiver && (
                <motion.button 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  onClick={(e) => { e.stopPropagation(); onLocate?.(); }}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  <MapPin size={16} /> EXPLORE ON MAP
                </motion.button>
              )}

              {/* ── Why This Matters ──────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="py-8 mt-8 border-t"
                style={{ borderColor: 'var(--border)' }}
              >
                <p className="text-xs font-medium tracking-widest uppercase mb-6"
                  style={{ color: 'var(--hint)', fontFamily: 'var(--font-body)' }}>
                  Why this matters
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {ACTIVISM_QUOTES.map((f, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * i }}
                      className="card p-4 space-y-3"
                    >
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

              {/* ── Footer ──────────────────────────── */}
              <div className="border-t py-8 text-center mb-4" style={{ borderColor: 'var(--border)' }}>
                <p style={{ fontSize: '11px', color: 'var(--hint)', fontFamily: 'var(--font-body)' }}>
                  Watershed · CPCB NWMP 2021 · Built for public awareness, not profit
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}>No rivers found</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Mini Map Preview Square (Floating) ──── */}
      {!mapExpanded && (
        <motion.button
          onClick={() => setMapExpanded(true)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-lg overflow-hidden shadow-lg border cursor-pointer hover:scale-110 transition-transform z-30"
          style={{
            background: 'rgba(31,45,69,0.95)',
            border: '1px solid rgba(14,165,201,0.3)',
            boxShadow: '0 20px 25px rgba(0,0,0,0.3)',
          }}
          title="Explore map"
        >
          <div className="w-full h-full flex items-center justify-center" style={{ color: '#0EA5C9', fontSize: '24px' }}>
            🗺️
          </div>
        </motion.button>
      )}

      {/* ── Expanded Map Overlay ──────────────── */}
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
            {/* Map header with close button */}
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--deep)' }}>
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', color: 'var(--sand)', fontWeight: 600 }}>
                Explore Rivers
              </h2>
              <button
                onClick={() => {
                  setMapExpanded(false)
                  setMapSelectedRiver(null)
                }}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                style={{ color: 'var(--sand)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Map + Sidebar Layout */}
            <div className="flex-1 flex overflow-hidden">
              {/* Map on left */}
              <div className="flex-1 overflow-hidden relative">
                <RiverMap 
                  ref={mapRef}
                  rivers={rivers}
                  selected={mapSelectedRiver}
                  onSelect={(river) => {
                    setMapSelectedRiver(river)
                  }}
                  onRiverClick={(river) => {
                    setMapSelectedRiver(river)
                  }}
                />
              </div>

              {/* Sidebar info on right */}
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
                    <ReportCard 
                      river={mapSelectedRiver}
                      onClose={() => setMapSelectedRiver(null)}
                    />
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
