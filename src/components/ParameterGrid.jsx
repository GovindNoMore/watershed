import { motion } from 'framer-motion'
import { PARAM_META, getParamStatus } from '../utils/grading'

const PARAMS = [
  { key: 'bod', valueKey: 'bod_max',            label: 'BOD'             },
  { key: 'do',  valueKey: 'do_min',             label: 'Dissolved O₂'   },
  { key: 'fc',  valueKey: 'fecal_coliform_max', label: 'Fecal Coliform'  },
  { key: 'ph',  valueKey: null,                 label: 'pH'              },
]

function formatValue(key, river) {
  if (key === 'ph') {
    if (river.ph_min == null) return null
    return `${river.ph_min} – ${river.ph_max}`
  }
  const paramMap = { bod: 'bod_max', do: 'do_min', fc: 'fecal_coliform_max' }
  return river[paramMap[key]]
}

function StatusPill({ status }) {
  if (status === 'missing') return (
    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-400 font-mono">
      N/A
    </span>
  )
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full font-mono font-medium ${
      status === 'pass'
        ? 'bg-green-900/60 text-green-400 border border-green-700/50'
        : 'bg-red-900/60 text-red-400 border border-red-700/50'
    }`}>
      {status === 'pass' ? '✓ OK' : '✗ HIGH'}
    </span>
  )
}

function GaugeBar({ paramKey, value }) {
  const meta = PARAM_META[paramKey]
  if (value === null || value === undefined || paramKey === 'ph') return null

  let pct = 0
  if (meta.dir === 'lower_better') {
    pct = Math.min(100, (value / (meta.safeVal * 4)) * 100)
  } else {
    pct = Math.min(100, (value / (meta.safeVal * 1.6)) * 100)
  }

  const isGood = meta.dir === 'lower_better'
    ? value <= meta.safeVal
    : value >= meta.safeVal

  return (
    <div className="mt-2 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${isGood ? 'bg-green-500' : 'bg-red-500'}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
      />
    </div>
  )
}

export default function ParameterGrid({ river, className = '' }) {
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      {PARAMS.map(({ key, label }, i) => {
        const meta   = PARAM_META[key]
        const value  = formatValue(key, river)
        const status = key === 'ph'
          ? (river.ph_min != null ? 'na' : 'missing')
          : getParamStatus(key, key === 'bod' ? river.bod_max : key === 'do' ? river.do_min : river.fecal_coliform_max)

        return (
          <motion.div
            key={key}
            className="glass rounded-xl p-3 flex flex-col gap-1"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: 0.15 * i, duration: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-river-foam/60 font-body uppercase tracking-wider">
                {meta.icon} {meta.label}
              </span>
              <StatusPill status={status} />
            </div>

            <div className="font-mono text-xl font-medium text-river-sand mt-1">
              {value !== null && value !== undefined
                ? <>{value} <span className="text-xs text-river-foam/40">{meta.unit}</span></>
                : <span className="text-gray-500 text-sm">No data</span>
              }
            </div>

            <GaugeBar
              paramKey={key}
              value={key === 'bod' ? river.bod_max : key === 'do' ? river.do_min : river.fecal_coliform_max}
            />

            <div className="text-xs text-river-foam/40 font-body mt-0.5">
              Safe: {meta.safe}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
