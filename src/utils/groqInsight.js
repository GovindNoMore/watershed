const GROQ_BASE = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL     = import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile'

export function buildPrompt(river) {
  const na = (v) => (v !== null && v !== undefined ? v : 'Not available')

  return {
    system: `You are an environmental scientist explaining Indian river pollution to the general public.
Respond ONLY in valid JSON. No markdown. No preamble. No extra text outside the JSON object.`,

    user: `River: ${river.river_name}
State: ${river.state}
Monitoring station: ${river.station_name}
Data year: 2021
Overall grade: ${river.grade} (${river.gradeMeta?.label})

Parameters measured:
- BOD: ${na(river.bod_max)} mg/L          (safe: < 3 mg/L)
- Dissolved Oxygen: ${na(river.do_min)} mg/L  (safe: > 5 mg/L)
- pH range: ${na(river.ph_min)} – ${na(river.ph_max)}         (safe: 6.5–8.5)
- Fecal Coliform: ${na(river.fecal_coliform_max)} MPN/100mL (safe: < 500)

Respond with this exact JSON structure:
{
  "summary": "2-3 sentences explaining the river's health in plain English for a non-scientist. Be specific about the numbers.",
  "causes": ["Most likely cause 1", "Most likely cause 2", "Most likely cause 3"],
  "recommendation": "One specific, realistic policy or community action that could help within 1-2 years.",
  "severity": "low|moderate|high|critical"
}`,
  }
}

export async function fetchRiverInsight(river) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new Error('GROQ_API_KEY not set. Add it to your .env file.')
  }

  const { system, user } = buildPrompt(river)

  const response = await fetch(GROQ_BASE, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model:       MODEL,
      max_tokens:  512,
      temperature: 0.3,
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: user   },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Groq API error ${response.status}: ${err}`)
  }

  const data    = await response.json()
  const content = data.choices?.[0]?.message?.content ?? ''

  // Strip any accidental markdown fences
  const cleaned = content.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    throw new Error('Groq returned non-JSON response: ' + content.slice(0, 100))
  }
}

export function getFallbackInsight(river) {
  const grade = river.grade
  const summaries = {
    A: `${river.river_name} is in good health with water quality meeting most safety standards. Low pollution levels suggest limited industrial or sewage discharge in this stretch.`,
    B: `${river.river_name} shows moderate water quality with some parameters approaching unsafe levels. The river is functional but needs monitoring and preventive action.`,
    C: `${river.river_name} is polluted and unsafe to drink or swim in without treatment. Key parameters exceed safe thresholds, indicating significant sewage or industrial discharge.`,
    D: `${river.river_name} is severely polluted. Multiple parameters are well beyond safe limits, indicating heavy untreated sewage and likely industrial effluents in this stretch.`,
    F: `${river.river_name} is in critical condition at this location. Near-zero dissolved oxygen and extremely high contamination levels indicate an ecological dead zone. Urgent intervention required.`,
    '?': `Insufficient data available to assess ${river.river_name}'s water quality at this station.`,
  }

  return {
    summary:        summaries[grade] ?? summaries['?'],
    causes:         ['Untreated municipal sewage discharge', 'Industrial effluents upstream', 'Agricultural runoff and fertilizer use'],
    recommendation: 'Demand STP (Sewage Treatment Plant) capacity audits from your local municipality under the Right to Information Act.',
    severity:       grade === 'A' ? 'low' : grade === 'B' ? 'moderate' : grade === 'C' ? 'high' : 'critical',
  }
}
