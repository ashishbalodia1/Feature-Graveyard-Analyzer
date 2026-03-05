# 🪦 Feature Graveyard — Product Failure Intelligence Platform

> *Every dead feature is a lesson waiting to be learned.*

Feature Graveyard is a full-stack product intelligence platform that catalogues abandoned product features from the world's most innovative companies. Built for product managers who learn from failure.

---

## Why It Matters

Product teams repeat the same mistakes — chasing the wrong user behavior, launching hardware into a software culture, building content platforms without creator ecosystems. Feature Graveyard makes those patterns visible, searchable, and learnable.

If you're a PM, this is your competitive advantage: study what failed, understand why, and ship better.

---

## What's Inside

| Section | Description |
|---|---|
| **The Graveyard** | Searchable, filterable cards for each failed feature |
| **Product Insights** | Auto-generated KPIs: top failure reason, average lifespan, worst year |
| **Timeline** | Chronological view of every experiment, launch to shutdown |
| **Company Leaderboard** | Ranked by experiment count — who ships (and kills) the most |
| **Lessons Library** | Distilled lessons from each failure, tagged by theme |
| **Submit a Feature** | Contribute your own failed feature via the form |

---

## Architecture

```
Feature-Graveyard-Analyzer/
├── server/
│   ├── server.js           Express app entry point
│   └── routes/
│       ├── features.js     GET /api/features, POST /api/features
│       └── insights.js     GET /api/insights (analysis engine)
├── data/
│   └── features.json       Seed dataset (10 real failed features)
├── public/
│   ├── index.html          Single-page app shell
│   ├── app.js              Vanilla JS — renders all sections + form logic
│   └── style.css           Design system (dark theme, CSS custom properties)
├── package.json
└── README.md
```

**Stack:**
- **Backend**: Node.js + Express v5
- **Frontend**: Vanilla HTML/CSS/JS (no framework, no bundler)
- **Data**: Flat JSON file (no database)
- **Fonts**: Inter via Google Fonts
- **Deployment target**: Any Node.js host (Railway, Fly.io, Render, etc.)

**API Routes:**

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/features` | Returns all seed + user-submitted features |
| `POST` | `/api/features` | Submit a new feature (in-memory) |
| `GET` | `/api/insights` | Returns aggregated analysis of the dataset |

---

## How to Run

### Prerequisites
- Node.js ≥ 18

### Install & Start

```bash
git clone https://github.com/ashishbalodia1/Feature-Graveyard-Analyzer.git
cd Feature-Graveyard-Analyzer
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

### Development (auto-reload)

```bash
npm run dev
```

---

## Dataset

10 real failed features are pre-loaded at `data/features.json`:

| Feature | Company | Launched | Shutdown |
|---|---|---|---|
| Google+ | Google | 2011 | 2019 |
| Amazon Fire Phone | Amazon | 2014 | 2015 |
| Quibi | Quibi | 2020 | 2020 |
| IGTV | Meta | 2018 | 2022 |
| Microsoft Zune | Microsoft | 2006 | 2012 |
| Facebook Poke | Facebook | 2012 | 2014 |
| Clubhouse Payments | Clubhouse | 2021 | 2022 |
| Twitter Fleets | Twitter | 2020 | 2021 |
| Snap Originals | Snap | 2018 | 2020 |
| Google Stadia | Google | 2019 | 2023 |

---

## Intelligence Layer

`GET /api/insights` runs these analyses automatically:

- **Keyword frequency** — extract top failure reason from `reason` fields
- **Lifespan calculation** — average years between `launched` and `shutdown`
- **Company ranking** — count features per company
- **Category risk scoring** — maps reason text to product risk categories
- **Worst shutdown year** — year with most failures

---

## Submission Flow

1. User fills the form (company, feature, launch year, shutdown year, reason, lesson)
2. Frontend POSTs to `POST /api/features`
3. Backend validates, sanitizes, and appends to the in-memory `submissions[]` array
4. The response (with `userSubmitted: true`) is merged into the live dataset immediately
5. Cards, Timeline, Leaderboard, and Lessons Library all update without a page reload

> Note: Submissions are stored in-memory and are lost on server restart. For persistence, wire to a database.

---

## Contributing

1. Fork the repo
2. Add your feature to `data/features.json`
3. Or use the in-app Submit form
4. PRs welcome

---

*Built as a portfolio project demonstrating full-stack Node.js, REST API design, data analysis, and modern vanilla frontend development.*
