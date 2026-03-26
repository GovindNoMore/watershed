/**
 * ShareCard.jsx — Generate & download a shareable river report image
 */
import { useRef, useState } from 'react'
import { Share2, Download, Check } from 'lucide-react'
import { GRADE_META } from '../utils/grading'

export default function ShareCard({ river }) {
  const cardRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const meta = GRADE_META[river.grade] ?? GRADE_META['?']

  async function download() {
    setLoading(true)
    try {
      const h2c = (await import('html2canvas')).default
      const canvas = await h2c(cardRef.current, { backgroundColor:'#1F2D45', scale:2, useCORS:true, logging:false })
      const a = document.createElement('a')
      a.download = `${river.river_name.toLowerCase().replace(/\s+/g,'-')}-riverlens.png`
      a.href = canvas.toDataURL('image/png'); a.click()
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  async function copyText() {
    const t = `🌊 RiverLens\n\n${river.river_name} (${river.state})\nGrade: ${river.grade} — ${meta.label}\n\nBOD: ${river.bod_max??'N/A'} mg/L | DO: ${river.do_min??'N/A'} mg/L | Fecal Coliform: ${river.fecal_coliform_max??'N/A'} MPN/100mL\n\nData: CPCB NWMP 2021 · riverlens.in`
    await navigator.clipboard.writeText(t)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-2">
      {/* Hidden render target */}
      <div ref={cardRef} style={{ position:'absolute', left:'-9999px', width:'600px', background:'#1F2D45', padding:'28px', borderRadius:'16px', fontFamily:'Inter,sans-serif', color:'#F5F0E8' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:20, fontWeight:700, marginBottom:3 }}>{river.river_name}</div>
            <div style={{ fontSize:12, color:'rgba(245,240,232,0.45)', marginBottom:2 }}>{river.station_name}</div>
            <div style={{ fontSize:11, color:'rgba(245,240,232,0.3)' }}>{river.state} · CPCB NWMP 2021</div>
          </div>
          <div style={{ width:64, height:64, borderRadius:'50%', background:meta.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, fontWeight:900, color:'#fff', boxShadow:`0 0 28px ${meta.color}60` }}>{river.grade}</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[{ l:'BOD', v:river.bod_max, u:'mg/L', s:'<3' },{ l:'Dissolved O₂', v:river.do_min, u:'mg/L', s:'>5' },{ l:'Fecal Coliform', v:river.fecal_coliform_max, u:'MPN/100mL', s:'<500' },{ l:'pH', v:river.ph_min!=null?`${river.ph_min}–${river.ph_max}`:null, u:'', s:'6.5–8.5' }].map(p => (
            <div key={p.l} style={{ background:'rgba(14,165,201,0.08)', borderRadius:8, padding:'10px 12px' }}>
              <div style={{ fontSize:10, color:'rgba(245,240,232,0.35)', marginBottom:3 }}>{p.l}</div>
              <div style={{ fontSize:17, fontWeight:600 }}>{p.v??'—'} <span style={{ fontSize:10, color:'rgba(245,240,232,0.3)' }}>{p.u}</span></div>
              <div style={{ fontSize:10, color:'rgba(245,240,232,0.25)', marginTop:2 }}>Safe: {p.s}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:16, fontSize:10, color:'rgba(245,240,232,0.2)', textAlign:'center' }}>riverlens.in · CPCB NWMP 2021</div>
      </div>

      <div className="rounded-xl p-3 flex items-center justify-between" style={{ background:'var(--card)', border:'1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <Share2 size={13} style={{ color:'var(--hint)' }} />
          <span className="text-xs uppercase tracking-widest" style={{ color:'var(--hint)', fontFamily:'var(--font-body)' }}>Share</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyText} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-white/5"
            style={{ color:'rgba(245,240,232,0.5)', fontFamily:'var(--font-body)' }}>
            {copied ? <><Check size={11} style={{color:'#22C55E'}}/> Copied!</> : <><Share2 size={11}/> Copy</>}
          </button>
          <button onClick={download} disabled={loading} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{ background:'rgba(14,165,201,0.15)', color:'#38BDF8', border:'1px solid rgba(14,165,201,0.25)', fontFamily:'var(--font-body)' }}>
            <Download size={11}/> {loading ? 'Saving…' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  )
}
