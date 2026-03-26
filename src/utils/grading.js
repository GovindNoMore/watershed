/**
 * grading.js — Watershed grading engine
 *
 * Weights (plan spec, nitrate excluded since data unavailable):
 *   BOD            30%  →  scaled to 33%
 *   Dissolved O2   25%  →  scaled to 28%
 *   Fecal Coliform 25%  →  scaled to 28%
 *   pH             10%  →  scaled to 11%
 *
 * Each parameter → 0–4 score. Weighted average → letter grade.
 */

// ─── Individual Parameter Scorers ────────────────────────────────────────────

export function scoreBOD(bod) {
  if (bod === null || bod === undefined) return null
  if (bod <= 2)  return 4.0  // Pristine
  if (bod <= 3)  return 3.5  // A threshold
  if (bod <= 5)  return 3.0  // Moderate - B
  if (bod <= 8)  return 2.0  // C
  if (bod <= 15) return 1.0  // D
  if (bod <= 30) return 0.5  // Severe D/F boundary
  return 0.0                  // F — critical
}

export function scoreDO(doMin) {
  if (doMin === null || doMin === undefined) return null
  if (doMin >= 8)  return 4.0  // Excellent
  if (doMin >= 6)  return 3.5
  if (doMin >= 5)  return 3.0  // A/B threshold
  if (doMin >= 4)  return 2.0  // C
  if (doMin >= 2)  return 1.0  // D
  if (doMin >= 0.5) return 0.5
  return 0.0                    // F — anoxic
}

export function scoreFecalColiform(fc) {
  if (fc === null || fc === undefined) return null
  if (fc <= 100)    return 4.0  // Very clean
  if (fc <= 500)    return 3.5  // Regulatory limit
  if (fc <= 2500)   return 2.5  // B
  if (fc <= 10000)  return 1.5  // C
  if (fc <= 100000) return 0.5  // D
  return 0.0                    // F
}

export function scorePH(phMin, phMax) {
  if (phMin === null || phMax === null || phMin === undefined || phMax === undefined) return null
  const center = (phMin + phMax) / 2
  const deviation = Math.max(
    Math.max(0, 6.5 - phMin),
    Math.max(0, phMax - 8.5)
  )
  if (deviation === 0) return 4.0
  if (deviation <= 0.3) return 3.0
  if (deviation <= 0.8) return 2.0
  if (deviation <= 1.5) return 1.0
  return 0.0
}

// ─── Weighted Grade Calculator ────────────────────────────────────────────────

const WEIGHTS = {
  bod: 0.33,
  do:  0.28,
  fc:  0.28,
  ph:  0.11,
}

export function calculateGrade(river) {
  const scores = {
    bod: scoreBOD(river.bod_max),
    do:  scoreDO(river.do_min),
    fc:  scoreFecalColiform(river.fecal_coliform_max),
    ph:  scorePH(river.ph_min, river.ph_max),
  }

  // Only weight parameters with actual data
  let weightedSum = 0
  let totalWeight = 0

  for (const [key, score] of Object.entries(scores)) {
    if (score !== null) {
      weightedSum  += score * WEIGHTS[key]
      totalWeight  += WEIGHTS[key]
    }
  }

  if (totalWeight === 0) return { letter: '?', score: null, scores, partial: true }

  const normalised = weightedSum / totalWeight
  const finalScore = normalised  // already 0–4

  const letter =
    finalScore >= 3.5 ? 'A' :
    finalScore >= 2.5 ? 'B' :
    finalScore >= 1.5 ? 'C' :
    finalScore >= 0.5 ? 'D' : 'F'

  const partial = Object.values(scores).some(s => s === null)

  return { letter, score: +finalScore.toFixed(2), scores, partial }
}

// ─── Grade Metadata ───────────────────────────────────────────────────────────

export const GRADE_META = {
  A: {
    label:   'Clean',
    color:   '#22C55E',
    bg:      'bg-green-600',
    text:    'text-green-400',
    border:  'border-green-500',
    glow:    'shadow-green-500/30',
    desc:    'Safe for most uses. Healthy ecosystem.',
  },
  B: {
    label:   'Moderate',
    color:   '#84CC16',
    bg:      'bg-lime-600',
    text:    'text-lime-400',
    border:  'border-lime-500',
    glow:    'shadow-lime-500/30',
    desc:    'Some concerns. Treat before drinking.',
  },
  C: {
    label:   'Polluted',
    color:   '#F59E0B',
    bg:      'bg-yellow-600',
    text:    'text-yellow-400',
    border:  'border-yellow-500',
    glow:    'shadow-yellow-500/30',
    desc:    'Not safe to drink or swim. Monitoring needed.',
  },
  D: {
    label:   'Severely Polluted',
    color:   '#F97316',
    bg:      'bg-orange-600',
    text:    'text-orange-400',
    border:  'border-orange-500',
    glow:    'shadow-orange-500/30',
    desc:    'Major pollution. Unsafe for most uses.',
  },
  F: {
    label:   'Critical',
    color:   '#EF4444',
    bg:      'bg-red-600',
    text:    'text-red-400',
    border:  'border-red-500',
    glow:    'shadow-red-500/30',
    desc:    'Ecological collapse risk. Immediate action required.',
  },
  '?': {
    label:   'No Data',
    color:   '#6b7280',
    bg:      'bg-gray-600',
    text:    'text-gray-400',
    border:  'border-gray-500',
    glow:    'shadow-gray-500/30',
    desc:    'Insufficient data for grading.',
  },
}

// ─── Parameter Threshold Metadata ────────────────────────────────────────────

export const PARAM_META = {
  bod: {
    label:    'BOD',
    fullName: 'Biochemical Oxygen Demand',
    unit:     'mg/L',
    safe:     '< 3 mg/L',
    safeVal:  3,
    dir:      'lower_better',
    desc:     'Measures organic pollution. Higher = more sewage/waste.',
    icon:     '🧪',
  },
  do: {
    label:    'Dissolved O₂',
    fullName: 'Dissolved Oxygen',
    unit:     'mg/L',
    safe:     '> 5 mg/L',
    safeVal:  5,
    dir:      'higher_better',
    desc:     'Oxygen fish breathe. Below 4 mg/L, fish cannot survive.',
    icon:     '🐟',
  },
  fc: {
    label:    'Fecal Coliform',
    fullName: 'Fecal Coliform',
    unit:     'MPN/100mL',
    safe:     '< 500 MPN/100mL',
    safeVal:  500,
    dir:      'lower_better',
    desc:     'Sewage bacteria indicator. High = untreated sewage.',
    icon:     '⚠️',
  },
  ph: {
    label:    'pH',
    fullName: 'Acidity / Alkalinity',
    unit:     '',
    safe:     '6.5 – 8.5',
    safeVal:  null,
    dir:      'range',
    desc:     'Measures acidity. Extreme values harm aquatic life.',
    icon:     '⚗️',
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getParamStatus(paramKey, value) {
  if (value === null || value === undefined) return 'missing'
  const m = PARAM_META[paramKey]
  if (m.dir === 'lower_better') return value <= m.safeVal  ? 'pass' : 'fail'
  if (m.dir === 'higher_better') return value >= m.safeVal ? 'pass' : 'fail'
  return 'na'
}

export function enrichRiver(river) {
  const gradeResult = calculateGrade(river)
  return {
    ...river,
    grade:    gradeResult.letter,
    score:    gradeResult.score,
    scores:   gradeResult.scores,
    partial:  gradeResult.partial,
    gradeMeta: GRADE_META[gradeResult.letter],
  }
}

export function enrichAll(rivers) {
  return rivers.map(enrichRiver)
}
