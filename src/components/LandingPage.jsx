/**
 * LandingPage.jsx — Watershed landing with activism framing
 */
import { motion } from 'framer-motion'
import { ArrowDown, Droplets, AlertTriangle, TrendingDown, FileText } from 'lucide-react'

const GRADE_STRIPS = [
  { g: 'A', color: '#22C55E', label: 'Clean',    count: 8  },
  { g: 'B', color: '#84CC16', label: 'Moderate', count: 11 },
  { g: 'C', color: '#F59E0B', label: 'Polluted', count: 14 },
  { g: 'D', color: '#F97316', label: 'Severe',   count: 12 },
  { g: 'F', color: '#EF4444', label: 'Critical', count: 9  },
]

const FACTS = [
  {
    icon: <AlertTriangle size={18} />,
    color: '#EF4444',
    headline: '296 rivers',
    sub: 'have polluted stretches in India as of 2025 — up from 251 in 2018',
    source: 'CPCB Polluted River Stretches Report 2025',
  },
  {
    icon: <TrendingDown size={18} />,
    color: '#F97316',
    headline: '₹30,458 crore',
    sub: 'spent on Namami Gange. Rivers are still failing. Only 178 of 353 projects completed.',
    source: 'Govt. of India PIB, 2024',
  },
  {
    icon: <Droplets size={18} />,
    color: '#F59E0B',
    headline: '70%',
    sub: 'of waterborne diseases in India are caused by river pollution',
    source: 'CPCB Report 2022',
  },
]

const STATS = [
  { num: '296', unit: 'rivers',  label: 'with polluted stretches' },
  { num: '37',  unit: 'Priority I', label: 'stretches — near total collapse' },
  { num: '70%', unit: 'untreated', label: 'of Maharashtra\'s wastewater' },
]

export default function LandingPage({ onEnter }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--ink)' }}>

      {/* ── Hero ─────────────────────────────── */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-12 overflow-hidden">

        {/* Background radial accents */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #0EA5C9 0%, transparent 70%)' }} />
          <div className="absolute bottom-[-80px] right-[-100px] w-[400px] h-[400px] rounded-full opacity-6"
            style={{ background: 'radial-gradient(circle, #EF4444 0%, transparent 70%)' }} />
        </div>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mb-6"
        >
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-xs font-medium tracking-widest uppercase"
            style={{ color: '#0EA5C9', fontFamily: 'var(--font-body)' }}>
            India's river health — graded and explained
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center max-w-3xl mb-6"
          style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', lineHeight: 1.15, color: 'var(--sand)' }}
        >
          Our rivers are drowning.<br />
          <span style={{ color: '#EF4444', fontStyle: 'italic' }}>The data proves it.</span><br />
          Nobody told you.
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center max-w-xl mb-10 text-base leading-relaxed"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-body)' }}
        >
          The CPCB monitors 603 rivers. The reports live in PDFs no official wants you to read.
          Watershed takes that data and gives every Indian river a grade — A to F —
          in plain language anyone can understand and act on.
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-8 mb-10 flex-wrap justify-center"
        >
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', color: 'var(--sand)', lineHeight: 1 }}>
                {s.num} <span style={{ fontSize: '1rem', color: '#0EA5C9', fontFamily: 'var(--font-body)', fontWeight: 500 }}>{s.unit}</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--hint)', marginTop: 4, fontFamily: 'var(--font-body)' }}>{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
          onClick={onEnter}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-white text-base transition-all hover:scale-105 active:scale-98"
          style={{
            background: 'linear-gradient(135deg, #0EA5C9 0%, #0284C7 100%)',
            fontFamily: 'var(--font-body)',
            boxShadow: '0 0 32px rgba(14,165,201,0.3), 0 4px 16px rgba(0,0,0,0.3)',
          }}
        >
          <Droplets size={18} />
          Check your river
          <ArrowDown size={16} className="opacity-70" />
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-4 text-xs"
          style={{ color: 'var(--hint)', fontFamily: 'var(--font-body)' }}
        >
          50+ rivers · CPCB 2021 data · 2026 research estimates for major rivers
        </motion.p>
      </section>

      {/* ── Grade Distribution Strip ────────────── */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex"
      >
        {GRADE_STRIPS.map(({ g, color, label, count }) => (
          <div key={g} className="flex-1 py-4 text-center"
            style={{ background: color + '14', borderTop: `2px solid ${color}30` }}>
            <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-head)', color, lineHeight: 1 }}>{g}</div>
            <div style={{ fontSize: '11px', color: color + 'AA', marginTop: 2, fontFamily: 'var(--font-body)' }}>{label}</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color, marginTop: 3, fontFamily: 'var(--font-body)' }}>{count}</div>
          </div>
        ))}
      </motion.section>

      {/* ── Why This Matters ─────────────────────── */}
      <section className="px-6 py-14 max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs font-medium tracking-widest uppercase mb-8"
            style={{ color: 'var(--hint)', fontFamily: 'var(--font-body)' }}>
            Why this matters
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FACTS.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="card p-5 space-y-3"
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: f.color + '18', color: f.color }}>
                  {f.icon}
                </div>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', color: f.color, lineHeight: 1.1 }}>
                  {f.headline}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--muted)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
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

        {/* Kumbh callout */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 rounded-2xl p-6"
          style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)' }}
        >
          <p style={{ fontFamily: 'var(--font-head)', fontSize: '1.15rem', color: '#f87171', marginBottom: 8 }}>
            "The river is completely dead."
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, fontFamily: 'var(--font-body)' }}>
            At Maha Kumbh 2025 — the world's largest human gathering — fecal coliform in the Yamuna reached
            4.9 million MPN/100mL. The safe bathing limit is 500. Over 660 million pilgrims participated.
            The NGT ordered biweekly testing. The foam returned by November.
          </p>
          <p className="mt-3" style={{ fontSize: '11px', color: 'var(--hint)', fontFamily: 'var(--font-body)' }}>
            Sources: Energy Tracker Asia Dec 2025 · CPCB real-time monitoring Jan 2025 · Down to Earth Feb 2025
          </p>
        </motion.div>
      </section>

      {/* ── Data Transparency Notice ──────────────── */}
      <section className="px-6 pb-10 max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="rounded-2xl p-5 flex gap-4"
          style={{ background: 'rgba(14,165,201,0.06)', border: '1px solid rgba(14,165,201,0.15)' }}
        >
          <FileText size={16} style={{ color: '#0EA5C9', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--sand)', fontFamily: 'var(--font-body)', marginBottom: 4 }}>
              Data transparency
            </p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
              Grades are calculated from <strong style={{ color: 'var(--sand)' }}>CPCB NWMP 2021</strong> — the most recent publicly available national monitoring data.
              For 10 major rivers, Watershed also shows <strong style={{ color: '#fb923c' }}>2025–2026 estimates</strong> based on published research papers,
              CPCB trend data, and NGT reports. Estimates are clearly labelled and sourced — they are not official readings.
              Real conditions may have changed.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── River Conditions Gallery ──────────────── */}
      <section className="px-6 py-14 max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-medium tracking-widest uppercase mb-8"
            style={{ color: 'var(--hint)', fontFamily: 'var(--font-body)' }}>
            The reality on ground
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Yamuna - Delhi */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="overflow-hidden rounded-2xl group cursor-pointer"
            >
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 aspect-video overflow-hidden">
                <img 
                  src="/images/yamuna.jpg" 
                  alt="Yamuna River" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
              <div className="p-5" style={{ background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', color: '#F87171', marginBottom: 4 }}>
                  Yamuna River
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
                  Delhi's lifeline carries 1,800 MLD of untreated sewage daily. Fecal coliform levels reach 4.9M MPN/100mL — 10,000x safe limits.
                </p>
              </div>
            </motion.div>

            {/* Ganga - Kanpur */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="overflow-hidden rounded-2xl group cursor-pointer"
            >
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 aspect-video overflow-hidden">
                <img 
                  src="/images/ganga.jpg" 
                  alt="Ganga River" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
              <div className="p-5" style={{ background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', color: '#FBBF24', marginBottom: 4 }}>
                  Ganga River
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
                  India's holiest river fails WHO bathing standards in Kanpur. Industries dump 960 MLD of waste directly. Grade: F (Critical).
                </p>
              </div>
            </motion.div>

            {/* Musi - Hyderabad */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="overflow-hidden rounded-2xl group cursor-pointer"
            >
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 aspect-video overflow-hidden">
                <img 
                  src="/images/musi.jpg" 
                  alt="Musi River" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
              <div className="p-5" style={{ background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', color: '#FB923C', marginBottom: 4 }}>
                  Musi River
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
                  Hyderabad's sewage flows untreated into Musi. Oxygen levels critically depleted at monitoring sites. Fecal coliform: 240 CFU/100mL. Grade: F.
                </p>
              </div>
            </motion.div>

            {/* Narmada - Gujarat */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="overflow-hidden rounded-2xl group cursor-pointer"
            >
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 aspect-video overflow-hidden">
                <img 
                  src="/images/narmada.jpg" 
                  alt="Narmada River" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
              <div className="p-5" style={{ background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', color: '#F97316', marginBottom: 4 }}>
                  Narmada River
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
                  Textile mills and chemical plants turn the water brown. Dam silt has destroyed fisheries. 50,000+ tribal livelihoods lost.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Enter Button (bottom) ──────────────── */}
      <div className="pb-16 flex flex-col items-center gap-3">
        <button
          onClick={onEnter}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all hover:scale-105"
          style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            color: 'var(--sand)', fontFamily: 'var(--font-body)',
          }}
        >
          Open the river map →
        </button>
        <p style={{ fontSize: '11px', color: 'var(--hint)', fontFamily: 'var(--font-body)' }}>
          No login · No ads · Open data
        </p>
      </div>

      {/* Footer */}
      <div className="border-t py-5 text-center"
        style={{ borderColor: 'var(--border)' }}>
        <p style={{ fontSize: '11px', color: 'var(--hint)', fontFamily: 'var(--font-body)' }}>
          Watershed · CPCB NWMP 2021 · Built for public awareness, not profit
        </p>
      </div>
    </div>
  )
}
