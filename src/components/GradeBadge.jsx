import { motion } from 'framer-motion'
import { GRADE_META } from '../utils/grading'

const SIZES = { sm:'w-9 h-9 text-base', md:'w-14 h-14 text-2xl', lg:'w-24 h-24 text-5xl', xl:'w-32 h-32 text-6xl' }

export default function GradeBadge({ grade = '?', size = 'lg', animate = true, className = '' }) {
  const meta = GRADE_META[grade] ?? GRADE_META['?']
  return (
    <motion.div
      className={`relative flex items-center justify-center rounded-full font-bold shadow-2xl ${SIZES[size]} ${className}`}
      style={{ background: meta.color, boxShadow: `0 0 32px ${meta.color}50, 0 4px 16px rgba(0,0,0,0.4)`, fontFamily: 'var(--font-head)' }}
      initial={animate ? { scale: 0.3, rotate: -15, opacity: 0 } : false}
      animate={animate ? { scale: 1, rotate: 0, opacity: 1 }    : false}
      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
    >
      <motion.div className="absolute inset-0 rounded-full"
        style={{ border: `2px solid ${meta.color}60`, background: 'transparent' }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }} />
      <span className="relative z-10 text-white select-none drop-shadow">{grade}</span>
    </motion.div>
  )
}
