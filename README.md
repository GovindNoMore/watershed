# 🌊 Watershed — River Quality Report Card

> Instant water quality grades for Indian rivers — powered by CPCB 2021 data + Groq AI + Interactive Maps

## ✨ Features

- **Interactive Map**: Professional Leaflet-based map with 50+ monitored river stations
- **River Directory Menu**: Browse and filter all rivers with advanced search
- **Smart Filtering**: Filter by grade (A-F), state, pollution zone, and search alphabetically
- **Water Quality Grades**: AI-calculated letter grades (A → F) based on CPCB parameters
- **AI Insights**: Groq-powered analysis with real-time summaries
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Data Visualization**: Charts, parameter breakdowns, and trend analysis
- **Share & Export**: Generate shareable cards and downloadable PDF reports

## 🚀 Quickstart

### Prerequisites
- **Node.js** 16+ (LTS recommended)
- **npm** 8+
- **Groq API key** (free at [console.groq.com](https://console.groq.com))

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Groq API key:
   ```env
   VITE_GROQ_API_KEY=gsk_your_key_here
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser

4. **Build for production**:
   ```bash
   npm run build
   npm run preview  # Test production build locally
   ```

## 📖 User Guide

### Browsing Rivers

1. **View Map**: Main dashboard displays all river stations as interactive dots
2. **Open Menu**: 
   - **Desktop**: Left sidebar is always visible
   - **Mobile**: Click the ☰ menu icon to toggle the river list
3. **Filter & Search**:
   - Type to search by river name, station, or state
   - Filter by **Grade** (A-F)
   - Filter by **State/Region** (20+ states)
   - Filter by **Pollution Zone** (Red = high pollution, Green = better)
   - Sort by Name (A-Z), Grade, or Pollution Level
4. **View Details**: Click a river to open the detailed report card
5. **Navigate to Map**: Click "Go to map location" to center map on selected river

### Report Card Panel

Each river's report includes:
- **Grade Badge**: Overall water quality (A-F with color coding)
- **Water Parameters**: BAD, Dissolved O₂, Fecal Coliform, pH (numerical + visual)
- **Trend Chart**: Historical data visualization
- **AI Summary**: Generated insights from Groq AI
- **Metadata**: Station name, state, monitoring agency
- **Actions**: Share image, download PDF, copy link

### Map Features

- **Color-Coded Markers**: Each dot shows water quality grade
- **Interactive Dots**: Click to view report, hover for quick info
- **River Polylines**: Major river paths shown in color
- **Responsive Layout**: Adjusts for menu and side panels
- **Dark Theme**: Professional Stadia Maps tile layer
- **Zoom Controls**: Bottom-right corner controls

## 🎯 Navigation Flow

```
Landing Page
    ↓ (Enter App)
Main Map View
    ├── Left Sidebar (Menu)
    │   ├── Search
    │   ├── Filter by Grade/State/Zone
    │   └── River List (clickable)
    └── Right Panel (on selection)
        ├── Report Card
        ├── Charts & Data
        └── Action Buttons
```

## 📊 Project Structure

```
watershed/
├── src/
│   ├── components/
│   │   ├── App.jsx            # Main app with dual-view & menu integration
│   │   ├── RiverMap.jsx       # Leaflet interactive map
│   │   ├── RiverMenu.jsx      # NEW: River browser with filtering
│   │   ├── ReportCard.jsx     # Detailed river information panel
│   │   ├── LandingPage.jsx    # Entry/splash screen
│   │   ├── AIInsight.jsx      # Groq AI insight display
│   │   ├── TrendChart.jsx     # Water quality trend chart
│   │   ├── SearchBar.jsx      # Global search component
│   │   ├── GradeBadge.jsx     # Grade indicator component
│   │   ├── ShareCard.jsx      # Share/export functionality
│   │   ├── ParameterGrid.jsx  # Water parameter display
│   │   └── Estimate2026.jsx   # Future projection component
│   ├── data/
│   │   └── rivers.json        # 50+ river stations with parameters
│   ├── hooks/
│   │   └── useRiverData.js    # Data loading & processing
│   ├── utils/
│   │   ├── grading.js         # Grade calculation algorithm
│   │   └── groqInsight.js     # Groq API integration
│   ├── App.jsx                # Entry point
│   ├── main.jsx               # React render
│   └── index.css              # Global styles + design tokens
├── public/                    # Static assets
├── dist/                      # Production build (after npm run build)
├── package.json
├── vite.config.js
├── tailwind.config.js
├── .env.example
└── README.md
```

## 🎨 Design System

### Color Palette
| Grade | Color | RGB | Usage |
|-------|-------|-----|-------|
| **A (Clean)** | #22C55E | Green | Pristine water |
| **B (Moderate)** | #84CC16 | Lime | Acceptable |
| **C (Polluted)** | #F59E0B | Amber | Warning |
| **D (Severely)** | #F97316 | Orange | Critical |
| **F (Critical)** | #EF4444 | Red | Emergency |

### Typography
- **Headings**: Lora (serif) — elegant, readable
- **Body**: Inter (sans-serif) — modern, clean
- **Code/Data**: JetBrains Mono (monospace) — precise

## 📋 Water Quality Standards

### Grading Formula

| Parameter | Weight | Clean (A) | Safe (B) | Caution (C) | Danger (D) | Critical (F) |
|-----------|--------|-----------|----------|------------|------------|--------------|
| **BOD** (mg/L) | 33% | ≤ 2 | ≤ 3 | ≤ 5 | ≤ 15 | > 15 |
| **Dissolved O₂** (mg/L) | 28% | ≥ 8 | ≥ 6 | ≥ 5 | ≥ 2 | < 2 |
| **Fecal Coliform** (MPN/100mL) | 28% | ≤ 100 | ≤ 500 | ≤ 2500 | ≤ 100k | > 100k |
| **pH** | 11% | 6.5 – 8.5 | ↓ | ↓ | Deviation | Critical |

**Final Grade**:
- A: Score 3.5 – 4.0 (Clean)
- B: Score 2.5 – 3.4 (Moderate)
- C: Score 1.5 – 2.4 (Polluted)
- D: Score 0.5 – 1.4 (Severely Polluted)
- F: Score 0 – 0.4 (Critical)

## 🛠️ Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | React | 18.2.0 |
| **Build** | Vite | 5.4.21 |
| **Styling** | Tailwind CSS | 3.x |
| **Maps** | Leaflet + react-leaflet | 1.9.4 |
| **Animation** | Framer Motion | 11.0.0 |
| **Charts** | Recharts | 2.12.0 |
| **Icons** | Lucide React | 0.383.0 |
| **Export** | html2canvas, jsPDF | latest |
| **AI** | Groq API | llama-3.3-70b |
| **State** | React Hooks | built-in |
| **CSS** | Tailwind + PostCSS | 3.x |

## 📡 Environment Variables

```env
# Groq AI API (get free at https://console.groq.com)
VITE_GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxx

# Optional: Custom model (default: llama-3.3-70b-versatile)
VITE_GROQ_MODEL=llama-3.3-70b-versatile
```

**Note**: Without Groq key, app works with pre-computed summaries (offline mode).

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import repository in [Vercel Dashboard](https://vercel.com/dashboard)
3. Add environment variable: `VITE_GROQ_API_KEY`
4. Deploy automatically ✓

**Benefits**: Free tier, fast CDN, auto-scaling, git integration

### Netlify

1. Build locally: `npm run build`
2. Connect GitHub repo or drag `dist/` folder → Netlify
3. Add env var in Netlify dashboard: `VITE_GROQ_API_KEY`
4. Auto-deploys on push ✓

### Traditional Hosting

```bash
# Build production bundle
npm run build

# Output in dist/ — upload to any web server
# Configure server for SPA routing (404 → index.html)
```

**Server Config (Apache)**:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [L]
</IfModule>
```

**Server Config (Nginx)**:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Map not showing** | Check internet (Stadia Maps requires online), clear cache, refresh |
| **AI insights not working** | Verify `VITE_GROQ_API_KEY` in `.env`, check Groq quota at console.groq.com |
| **Menu filters not responding** | Close/reopen menu, `localStorage.clear()`, refresh page |
| **Slow load on mobile** | Reduce resolution, ensure 4G/WiFi, check DevTools throttling settings |
| **Build fails** | Delete `node_modules`, `npm install`, `npm run build` |
| **Styling looks broken** | Clear browser cache, `rm -rf node_modules/.cache`, rebuild |

## 📊 Performance Metrics

- **Bundle Size**: ~720KB (minified) → ~212KB (gzipped)
- **Initial Load**: ~2-3 seconds (includes Leaflet)
- **Map Render**: ~800ms
- **API Response**: ~2-5 seconds (Groq AI, depends on tier)
- **Lighthouse Score**: 85+ (desktop)

## 🔒 Data & Privacy

- **Data Source**: CPCB Public Database (open data)
- **API**: Groq Cloud (encrypted in transit, HTTPS only)
- **Storage**: Browser localStorage only (no backend)
- **Sharing**: Generated URLs are read-only, no account tracking

## 📞 Support & Issues

- **GitHub Issues**: Report bugs or request features
- **Forum**: Community Q&A (if applicable)
- **Email**: Development team contact

## 📝 License

- **Application Code**: Internal use
- **Data**: CPCB (Central Pollution Control Board) — public domain
- **Dependencies**: As per package.json (MIT, Apache 2.0, etc.)

## 📚 Resources

- [Groq Console](https://console.groq.com) — API keys & quota
- [Vite Docs](https://vitejs.dev/) — Build tool documentation  
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first styling
- [Leaflet Docs](https://leafletjs.com/) — Map library
- [React Docs](https://react.dev/) — React latest docs
- [CPCB NWMP](https://www.cpcb.gov.in/) — Water monitoring data

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production-Ready ✓  
**Maintained**: Active
