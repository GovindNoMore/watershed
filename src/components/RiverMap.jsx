/**
 * RiverMap.jsx — React Leaflet map with GeoJSON boundaries and pulse animations
 */
import { useEffect, useState, useImperativeHandle, forwardRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Internal component to handle the "Fly To" animation
function MapController({ selectedRiver, mapRef }) {
  const map = useMap()

  useEffect(() => {
    if (selectedRiver && selectedRiver.latitude && selectedRiver.longitude) {
      map.flyTo([selectedRiver.latitude, selectedRiver.longitude], 11, {
        duration: 1.2,
        easeLinearity: 0.25
      })
    }
  }, [selectedRiver, map])

  // Expose map reference for external control
  useEffect(() => {
    if (mapRef) {
      mapRef.current = map
    }
  }, [map, mapRef])

  return null
}

const RiverMapComponent = forwardRef(function RiverMap(
  { rivers = [], selected, onSelect, onRiverClick },
  ref
) {
  const [geoData, setGeoData] = useState(null)
  const mapRef = { current: null }

  // Fetch official boundaries once
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/datameet/maps/master/Country/india-osm.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error('Failed to load GeoJSON:', err))
  }, [])

  // Expose setViewToRiver method through ref
  useImperativeHandle(ref, () => ({
    setViewToRiver: (river) => {
      if (mapRef.current && river?.latitude && river?.longitude) {
        mapRef.current.flyTo([river.latitude, river.longitude], 11, {
          duration: 1.2,
          easeLinearity: 0.25
        })
      }
    }
  }), [])

  const createPulseIcon = (grade, isSelected) => {
    const colors = {
      A: '#22C55E',
      B: '#84CC16',
      C: '#F59E0B',
      D: '#F97316',
      F: '#EF4444',
      '?': '#6b7280'
    }
    const color = colors[grade] || '#6b7280'
    const size = isSelected ? 32 : 24

    return L.divIcon({
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border: ${isSelected ? '3px solid #fff' : '2px solid rgba(255,255,255,0.4)'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${isSelected ? '11px' : '9px'};
          font-weight: 700;
          color: #fff;
          box-shadow: 0 4px 14px rgba(0,0,0,0.6), 0 0 20px ${color}70;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
        ">${grade}</div>
      `,
      className: 'custom-river-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2]
    })
  }

  const handleMarkerClick = (river) => {
    onSelect?.(river)
    onRiverClick?.(river)
  }

  return (
    <div className="w-full h-full bg-slate-950 relative">
      <style>{`
        .custom-river-marker {
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
        .leaflet-popup-content-wrapper {
          background: #0f172a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
        }
        .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        .leaflet-popup-tip {
          background: #0f172a;
          border-top: 1px solid rgba(255,255,255,0.1);
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
        {/* Dark satellite tile layer */}
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          attribution='&copy; Google Maps'
          maxZoom={16}
        />

        {/* India boundary GeoJSON */}
        {geoData && (
          <GeoJSON
            data={geoData}
            style={{
              color: '#ffffff',
              weight: 1.5,
              fillColor: 'transparent',
              opacity: 0.3
            }}
          />
        )}

        {/* River markers */}
        {rivers.map(river => (
          <Marker
            key={river.id}
            position={[river.latitude, river.longitude]}
            icon={createPulseIcon(river.grade, selected?.id === river.id)}
            eventHandlers={{
              click: () => handleMarkerClick(river)
            }}
          >
            <Popup className="river-popup">
              <div className="text-white space-y-1">
                <div className="font-bold text-sm">{river.river_name}</div>
                <div className="text-xs text-slate-400 uppercase">{river.state}</div>
                <div className="text-xs text-slate-400">{river.station_name}</div>
                <div className="mt-2 flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      background: {
                        A: '#22C55E',
                        B: '#84CC16',
                        C: '#F59E0B',
                        D: '#F97316',
                        F: '#EF4444'
                      }[river.grade] || '#6b7280'
                    }}
                  >
                    {river.grade}
                  </div>
                  <span className="text-xs font-semibold">Grade</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Map controller for fly-to animations */}
        <MapController selectedRiver={selected} mapRef={mapRef} />
      </MapContainer>

      {/* Info overlay */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur text-white px-3 py-2 rounded-lg text-xs border border-white/10 z-10">
        <p className="font-semibold">Watershed Map</p>
        <p className="text-gray-300">Click markers to view details</p>
      </div>
    </div>
  )
})

export default RiverMapComponent