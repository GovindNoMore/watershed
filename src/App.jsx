/**
 * App.jsx — Main app with Landing → Menu → Details/Map flow
 */
import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Waves, X } from 'lucide-react'
import { useRiverData } from './hooks/useRiverData'
import LandingPage from './components/LandingPage'
import RiverMenu from './components/RiverMenu'
import RiverMap from './components/RiverMap'
import ReportCard from './components/ReportCard'

export default function App() {
  const { rivers } = useRiverData()
  const [view, setView] = useState('landing') // 'landing' | 'menu' | 'map' | 'details'
  const [selectedRiver, setSelectedRiver] = useState(null)
  const mapRef = useRef()

  const gradeCounts = useMemo(() => {
    const c = { A: 0, B: 0, C: 0, D: 0, F: 0 }
    rivers.forEach(r => { if (c[r.grade] !== undefined) c[r.grade]++ })
    return c
  }, [rivers])

  function enterApp() {
    setView('menu')
    setSelectedRiver(null)
  }

  function selectRiver(river) {
    setSelectedRiver(river)
    setView('details')
  }

  function goToMap() {
    setView('map')
  }

  function backToMenu() {
    setSelectedRiver(null)
    setView('menu')
  }

  function exitToLanding() {
    setView('landing')
    setSelectedRiver(null)
  }

  /* ── Landing ───────────────────────────── */
  if (view === 'landing') {
    return <LandingPage onEnter={enterApp} />
  }

  /* ── Menu View ────────────────────────────── */
  if (view === 'menu') {
    return (
      <div className="w-screen h-screen overflow-hidden" style={{ background: 'var(--ink)' }}>
        {/* Top bar with branding */}
        <header className="shrink-0 flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--deep)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(14,165,201,0.15)', border: '1px solid rgba(14,165,201,0.25)' }}>
              <Waves size={16} style={{ color: '#0EA5C9' }} />
            </div>
            <h1 className="text-lg font-bold" style={{ fontFamily: 'var(--font-head)', color: 'var(--sand)' }}>Watershed</h1>
          </div>
          <button
            onClick={exitToLanding}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        {/* Full-screen menu */}
        <RiverMenu 
          rivers={rivers}
          selectedRiver={selectedRiver}
          onSelect={selectRiver}
          onLocate={goToMap}
        />
      </div>
    )
  }

  /* ── Details View ────────────────────────────── */
  if (view === 'details' && selectedRiver) {
    return (
      <div className="w-screen h-screen flex flex-col overflow-hidden" style={{ background: 'var(--ink)' }}>
        {/* Top bar */}
        <header className="shrink-0 flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--deep)' }}>
          <button
            onClick={backToMenu}
            className="text-sm font-semibold hover:opacity-80 transition-opacity flex items-center gap-2"
            style={{ color: 'var(--muted)' }}
          >
            ← Back to Menu
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(14,165,201,0.15)', border: '1px solid rgba(14,165,201,0.25)' }}>
              <Waves size={16} style={{ color: '#0EA5C9' }} />
            </div>
            <h1 className="text-lg font-bold" style={{ fontFamily: 'var(--font-head)', color: 'var(--sand)' }}>Watershed</h1>
          </div>
          <button
            onClick={exitToLanding}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        {/* Details panel */}
        <div className="flex-1 overflow-auto">
          <ReportCard 
            river={selectedRiver}
            onClose={backToMenu}
            onGoToMap={goToMap}
          />
        </div>

        {/* Action button at bottom */}
        <div className="shrink-0 p-6 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={goToMap}
            className="w-full py-3 font-bold text-white rounded-xl transition-all"
            style={{ background: 'var(--teal)', color: 'var(--ink)' }}
          >
            Explore on Map →
          </button>
        </div>
      </div>
    )
  }

  /* ── Map View ────────────────────────────── */
  if (view === 'map') {
    return (
      <div className="w-screen h-screen overflow-hidden flex flex-col" style={{ background: 'var(--ink)' }}>
        {/* Top bar */}
        <header className="shrink-0 flex items-center justify-between px-6 py-4 border-b z-20" style={{ borderColor: 'var(--border)', background: 'var(--deep)' }}>
          <button
            onClick={backToMenu}
            className="text-sm font-semibold hover:opacity-80 transition-opacity flex items-center gap-2"
            style={{ color: 'var(--muted)' }}
          >
            ← Back to Menu
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(14,165,201,0.15)', border: '1px solid rgba(14,165,201,0.25)' }}>
              <Waves size={16} style={{ color: '#0EA5C9' }} />
            </div>
            <h1 className="text-lg font-bold" style={{ fontFamily: 'var(--font-head)', color: 'var(--sand)' }}>Watershed Map</h1>
          </div>
          <button
            onClick={exitToLanding}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        {/* Map */}
        <div className="flex-1">
          <RiverMap 
            ref={mapRef}
            rivers={rivers}
            selected={selectedRiver}
            onSelect={selectRiver}
          />
        </div>
      </div>
    )
  }

  return null
}
