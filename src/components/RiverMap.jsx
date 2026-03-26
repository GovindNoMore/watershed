/**
 * RiverMap.jsx — Improved React Leaflet map
 * Additions: animated pulse rings on F-grade markers, grade legend overlay,
 *            cluster count badge on icons, hover tooltip, keyboard nav.
 */
import { useEffect, useState, useImperativeHandle, forwardRef, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ─── Constants ────────────────────────────────────────────────────────────────

const GRADE_COLORS = {
  A: '#22C55E',
  B: '#84CC16',
  C: '#F59E0B',
  D: '#F97316',
  F: '#EF4444',
  '?': '#6b7280',
}

const GRADE_LABELS = {
  A: 'Excellent',
  B: 'Good',
  C: 'Moderate',
  D: 'Poor',
  F: 'Critical',
}

// ─── MapController ────────────────────────────────────────────────────────────

function MapController({ selectedRiver, mapRef }) {
  const map = useMap()

  useEffect(() => {
    if (selectedRiver?.latitude && selectedRiver?.longitude) {
      map.flyTo([selectedRiver.latitude, selectedRiver.longitude], 11, {
        duration: 1.2,
        easeLinearity: 0.25,
      })
    }
  }, [selectedRiver, map])

  useEffect(() => {
    if (mapRef) mapRef.current = map
  }, [map, mapRef])

  return null
}

// ─── Icon factory ─────────────────────────────────────────────────────────────

function createPulseIcon(grade, isSelected, stationCount) {
  const color  = GRADE_COLORS[grade] || GRADE_COLORS['?']
  const size   = isSelected ? 34 : 26
  const isCritical = grade === 'F'

  const pulseRing = isCritical ? `
    <div style="
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      border: 2px solid ${color};
      opacity: 0.4;
      animation: ripple 2s ease-out infinite;
    "></div>
    <div style="
      position: absolute;
      inset: -12px;
      border-radius: 50%;
      border: 1.5px solid ${color};
      opacity: 0.2;
      animation: ripple 2s ease-out infinite 0.6s;
    "></div>
  ` : ''

  const countBadge = stationCount > 1 ? `
    <div style="
      position: absolute;
      top: -5px;
      right: -5px;
      width: 14px;
      height: 14px;
      background: rgba(15,23,42,0.9);
      border: 1px solid ${color};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      font-weight: 700;
      color: ${color};
      font-family: 'Inter', sans-serif;
    ">${stationCount > 9 ? '9+' : stationCount}</div>
  ` : ''

  return L.divIcon({
    html: `
      <style>
        @keyframes ripple {
          0%   { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      </style>
      <div style="position: relative; width: ${size}px; height: ${size}px;">
        ${pulseRing}
        ${countBadge}
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border: ${isSelected ? `3px solid #fff` : `2px solid rgba(255,255,255,0.35)`};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${isSelected ? '12px' : '9px'};
          font-weight: 700;
          color: #fff;
          box-shadow: 0 4px 14px rgba(0,0,0,0.6), 0 0 ${isSelected ? 28 : 16}px ${color}${isSelected ? '90' : '50'};
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.25s ease;
          position: relative;
          z-index: 1;
        ">${grade}</div>
      </div>
    `,
    className: 'custom-river-marker',
    iconSize: [size + 16, size + 16],
    iconAnchor: [(size + 16) / 2, (size + 16) / 2],
    popupAnchor: [0, -(size / 2 + 8)],
  })
}

// ─── Grade Legend Overlay ─────────────────────────────────────────────────────

function GradeLegend({ visible }) {
  if (!visible) return null
  return (
    <div className="absolute bottom-6 left-4 z-10 rounded-xl overflow-hidden border"
      style={{ background: 'rgba(10,18,33,0.88)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', minWidth: 120 }}>
      <div className="px-3 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <p style={{ fontSize: '9px', color: '#6b7280', fontFamily: 'sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          Water Grade
        </p>
      </div>
      <div className="px-3 py-2 space-y-1.5">
        {Object.entries(GRADE_LABELS).map(([grade, label]) => (
          <div key={grade} className="flex items-center gap-2">
            <div style={{
              width: 18, height: 18,
              background: GRADE_COLORS[grade],
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '8px', fontWeight: 700, color: '#fff', fontFamily: 'sans-serif',
              flexShrink: 0,
            }}>{grade}</div>
            <span style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'sans-serif' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

const RiverMapComponent = forwardRef(function RiverMap(
  { rivers = [], selected, onSelect, onRiverClick },
  ref
) {
  const [geoData, setGeoData]           = useState(null)
  const [showLegend, setShowLegend]     = useState(true)
  const [hoveredRiver, setHoveredRiver] = useState(null)
  const mapRef = useRef(null)

  // Station count per river (for badge)
  const stationCounts = {}
  rivers.forEach(r => {
    stationCounts[r.river_name] = (stationCounts[r.river_name] || 0) + 1
  })

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/datameet/maps/master/Country/india-osm.geojson')
      .then(r => r.json())
      .then(data => setGeoData(data))
      .catch(err => console.error('GeoJSON load error:', err))
  }, [])

  useImperativeHandle(ref, () => ({
    setViewToRiver: (river) => {
      if (mapRef.current && river?.latitude && river?.longitude) {
        mapRef.current.flyTo([river.latitude, river.longitude], 11, {
          duration: 1.2,
          easeLinearity: 0.25,
        })
      }
    }
  }), [])

  const handleMarkerClick = (river) => {
    onSelect?.(river)
    onRiverClick?.(river)
  }

  return (
    <div className="w-full h-full bg-slate-950 relative">
      <style>{`
        .custom-river-marker { background: transparent !important; border: none !important; }
        .leaflet-popup-content-wrapper {
          background: #0a1221;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }
        .leaflet-popup-content { margin: 0; width: auto !important; }
        .leaflet-popup-tip { background: #0a1221; }
        .leaflet-popup-close-button { color: #4b5563 !important; right: 8px !important; top: 8px !important; }
        .leaflet-control-zoom {
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 8px !important;
          overflow: hidden !important;
        }
        .leaflet-control-zoom a {
          background: rgba(10,18,33,0.9) !important;
          color: #9ca3af !important;
          border-bottom: 1px solid rgba(255,255,255,0.08) !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(14,165,201,0.2) !important;
          color: #0EA5C9 !important;
        }
      `}</style>

      <MapContainer
        center={[22.5, 82.0]}
        zoom={5}
        maxBounds={[[5.0, 65.0], [38.0, 98.0]]}
        minZoom={5}
        className="w-full h-full"
        zoomControl={true}
      >
        {/* Dark satellite tiles */}
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          attribution='&copy; Google Maps'
          maxZoom={16}
        />

        {/* India boundary */}
        {geoData && (
          <GeoJSON
            data={geoData}
            style={{ color: '#ffffff', weight: 1.5, fillColor: 'transparent', opacity: 0.25 }}
          />
        )}

        {/* River markers */}
        {rivers.map(river => (
          <Marker
            key={river.id}
            position={[river.latitude, river.longitude]}
            icon={createPulseIcon(river.grade, selected?.id === river.id, stationCounts[river.river_name])}
            eventHandlers={{
              click:      () => handleMarkerClick(river),
              mouseover:  () => setHoveredRiver(river),
              mouseout:   () => setHoveredRiver(null),
            }}
          >
            <Popup className="river-popup">
              <div className="text-white" style={{ padding: '12px 14px', minWidth: 180 }}>
                {/* Grade stripe at top */}
                <div className="h-1 rounded-full mb-3 -mx-3.5 -mt-3"
                  style={{ background: GRADE_COLORS[river.grade] || '#6b7280', marginLeft: '-14px', marginRight: '-14px', marginTop: '-12px' }} />

                <div className="font-bold text-sm mb-0.5" style={{ color: '#f1f5f9' }}>{river.river_name}</div>
                <div className="text-xs mb-2" style={{ color: '#64748b' }}>{river.state}</div>
                <div className="text-xs mb-3" style={{ color: '#475569', lineHeight: 1.4 }}>{river.station_name}</div>

                {/* Grade + key stats */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm text-white shrink-0"
                    style={{ background: GRADE_COLORS[river.grade] || '#6b7280' }}>
                    {river.grade}
                  </div>
                  <div className="space-y-0.5">
                    {river.bod_max != null && (
                      <div className="flex gap-1.5 items-center">
                        <span style={{ fontSize: '9px', color: '#475569', width: 22 }}>BOD</span>
                        <span style={{ fontSize: '11px', color: river.bod_max > 6 ? '#F97316' : '#22C55E', fontWeight: 600 }}>{river.bod_max}</span>
                        <span style={{ fontSize: '9px', color: '#334155' }}>mg/L</span>
                      </div>
                    )}
                    {river.do_min != null && (
                      <div className="flex gap-1.5 items-center">
                        <span style={{ fontSize: '9px', color: '#475569', width: 22 }}>DO</span>
                        <span style={{ fontSize: '11px', color: river.do_min < 4 ? '#EF4444' : '#22C55E', fontWeight: 600 }}>{river.do_min}</span>
                        <span style={{ fontSize: '9px', color: '#334155' }}>mg/L</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleMarkerClick(river)}
                  style={{
                    marginTop: 10, width: '100%', padding: '6px', borderRadius: 6,
                    background: 'rgba(14,165,201,0.15)', border: '1px solid rgba(14,165,201,0.3)',
                    color: '#0EA5C9', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'sans-serif',
                  }}>
                  View Report →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapController selectedRiver={selected} mapRef={mapRef} />
      </MapContainer>

      {/* Top info bar */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-white px-3 py-2 rounded-lg text-xs border border-white/10 z-10"
        style={{ backdropFilter: 'blur(8px)' }}>
        <p className="font-semibold" style={{ fontFamily: 'sans-serif' }}>RiverLens</p>
        <p style={{ color: '#9ca3af', fontSize: '10px' }}>{rivers.length} stations · {new Set(rivers.map(r => r.river_name)).size} rivers</p>
      </div>

      {/* Legend toggle button */}
      <button
        onClick={() => setShowLegend(v => !v)}
        className="absolute top-4 right-4 z-10 px-2.5 py-1.5 rounded-lg text-xs border transition-all"
        style={{
          background: 'rgba(10,18,33,0.8)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af',
          fontFamily: 'sans-serif',
        }}>
        {showLegend ? 'Hide' : 'Legend'}
      </button>

      {/* Grade legend */}
      <GradeLegend visible={showLegend} />

      {/* Hover tooltip */}
      {hoveredRiver && (
        <div className="absolute bottom-6 right-4 z-10 px-3 py-2 rounded-lg border pointer-events-none"
          style={{
            background: 'rgba(10,18,33,0.9)', border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
          }}>
          <p style={{ fontSize: '11px', color: '#f1f5f9', fontWeight: 600, fontFamily: 'sans-serif' }}>
            {hoveredRiver.river_name}
          </p>
          <p style={{ fontSize: '10px', color: '#6b7280', fontFamily: 'sans-serif' }}>
            {hoveredRiver.state} · Grade {hoveredRiver.grade}
          </p>
        </div>
      )}
    </div>
  )
})

export default RiverMapComponent