/* ═══════════════════════════════════════════════════════════════
   Feature Graveyard — app.js
   ═══════════════════════════════════════════════════════════════ */

const API          = '/api/features';
const INSIGHTS_API = '/api/insights';

let allFeatures = [];
let insights    = {};

// ── XSS safety ─────────────────────────────────────────────────
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Entry point ─────────────────────────────────────────────────
async function init() {
  try {
    const [featRes, insRes] = await Promise.all([
      fetch(API),
      fetch(INSIGHTS_API),
    ]);
    allFeatures = await featRes.json();
    insights    = await insRes.json();
  } catch (err) {
    console.error('Failed to load data:', err);
    allFeatures = [];
    insights    = {};
  }

  bootstrap();
}

// ── Bootstrap ───────────────────────────────────────────────────
function bootstrap() {
  populateFilter();
  renderHeroStats();
  renderCards(allFeatures);
  renderInsights();
  renderTimeline();
  renderLeaderboard();
  renderLessonsLibrary();
  setupSearch();
  setupForm();
}

// ── Hero stats ──────────────────────────────────────────────────
function renderHeroStats() {
  const companies = new Set(allFeatures.map(f => f.company));
  const years     = allFeatures.flatMap(f => [f.launched, f.shutdown]).filter(Boolean);
  const span      = years.length ? Math.max(...years) - Math.min(...years) : 0;

  document.getElementById('hstatTotal').textContent     = allFeatures.length;
  document.getElementById('hstatCompanies').textContent = companies.size;
  document.getElementById('hstatSpan').textContent      = span + '+';
}

// ── Company filter dropdown ──────────────────────────────────────
function populateFilter() {
  const sel       = document.getElementById('companyFilter');
  const companies = [...new Set(allFeatures.map(f => f.company))].sort();
  companies.forEach(c => {
    const opt = document.createElement('option');
    opt.value       = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });
}

// ── Feature Cards ───────────────────────────────────────────────
function renderCards(features) {
  const grid   = document.getElementById('cardsGrid');
  const empty  = document.getElementById('emptyState');
  const count  = document.getElementById('resultCount');

  count.textContent = `${features.length} feature${features.length !== 1 ? 's' : ''}`;

  if (!features.length) {
    grid.innerHTML = '';
    empty.hidden   = false;
    return;
  }
  empty.hidden = true;

  grid.innerHTML = features.map((f, i) => {
    const lifespan = f.shutdown && f.launched
      ? `${f.shutdown - f.launched} yr${f.shutdown - f.launched !== 1 ? 's' : ''}`
      : 'Ongoing';
    return `
      <article class="card" style="--i:${i}">
        <div class="card-header">
          <span class="company-badge">${esc(f.company)}</span>
          ${f.userSubmitted ? '<span class="community-badge">Community</span>' : ''}
        </div>
        <h3 class="card-title">${esc(f.feature)}</h3>
        <div class="card-meta">
          <span class="meta-chip">🚀 ${esc(String(f.launched))}</span>
          ${f.shutdown ? `<span class="meta-chip meta-chip--red">💀 ${esc(String(f.shutdown))}</span>` : ''}
          <span class="meta-chip meta-chip--amber">⏱ ${lifespan}</span>
        </div>
        <p class="card-reason"><strong>Why:</strong> ${esc(f.reason)}</p>
        <div class="card-lesson">
          <span class="lesson-icon" aria-hidden="true">💡</span>
          <p>${esc(f.lesson)}</p>
        </div>
      </article>`;
  }).join('');
}

// ── Search + filter ─────────────────────────────────────────────
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  const filterSel   = document.getElementById('companyFilter');

  function applyFilters() {
    const q       = searchInput.value.trim().toLowerCase();
    const company = filterSel.value;
    const results = allFeatures.filter(f => {
      const matchC = company === 'all' || f.company === company;
      const matchQ = !q || [f.company, f.feature, f.reason, f.lesson]
        .some(v => String(v ?? '').toLowerCase().includes(q));
      return matchC && matchQ;
    });
    renderCards(results);
  }

  searchInput.addEventListener('input',  applyFilters);
  filterSel.addEventListener('change', applyFilters);
}

// ── Insights ────────────────────────────────────────────────────
function renderInsights() {
  if (!insights || !Object.keys(insights).length) return;

  // KPI cards
  const kpiData = [
    { label: 'Top Failure Reason',    value: insights.topFailureReason,       icon: '🔍' },
    { label: 'Average Lifespan',       value: insights.averageLifespan,         icon: '⏳' },
    { label: 'Most Experimental Co.',  value: insights.mostExperimentalCompany, icon: '🏢' },
    { label: 'Highest-Risk Category',  value: insights.topRiskCategory,         icon: '⚠️' },
  ];
  document.getElementById('insightsKpiRow').innerHTML = kpiData.map(k => `
    <div class="kpi-card">
      <span class="kpi-icon">${k.icon}</span>
      <p class="kpi-value">${esc(k.value)}</p>
      <p class="kpi-label">${esc(k.label)}</p>
    </div>`).join('');

  // Bar chart
  const breakdown = insights.companyBreakdown ?? [];
  const max       = Math.max(...breakdown.map(b => b.count), 1);
  document.getElementById('barChart').innerHTML = breakdown.map(b => `
    <div class="bar-row">
      <span class="bar-label">${esc(b.company)}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width:${(b.count / max) * 100}%"></div>
      </div>
      <span class="bar-count">${b.count}</span>
    </div>`).join('');

  // Fact rows
  const facts = [
    { label: 'Shortest-Lived Feature',     value: insights.shortestLivedFeature     },
    { label: 'Worst Shutdown Year',         value: `${insights.worstShutdownYear} (${insights.worstShutdownYearCount} features)` },
    { label: 'Total Features Analyzed',     value: insights.totalAnalyzed            },
    { label: 'Most Experimental Company',   value: `${insights.mostExperimentalCompany} (${insights.mostExperimentalCompanyCount} experiments)` },
  ];
  document.getElementById('insightFacts').innerHTML = facts.map(f => `
    <div class="fact-row">
      <span class="fact-label">${esc(f.label)}</span>
      <span class="fact-value">${esc(String(f.value ?? '—'))}</span>
    </div>`).join('');
}

// ── Timeline ────────────────────────────────────────────────────
function renderTimeline() {
  const sorted = [...allFeatures].sort((a, b) => (a.launched || 0) - (b.launched || 0));
  const wrap   = document.getElementById('timelineWrap');

  wrap.innerHTML = `
    <div class="timeline">
      ${sorted.map((f, i) => `
        <div class="tl-item tl-item--${i % 2 === 0 ? 'left' : 'right'}">
          <div class="tl-dot"></div>
          <div class="tl-card">
            <div class="tl-year">${esc(String(f.launched))}</div>
            <h4 class="tl-feature">${esc(f.feature)}</h4>
            <span class="tl-company">${esc(f.company)}</span>
            ${f.shutdown
              ? `<div class="tl-shutdown">Shut down: <strong>${esc(String(f.shutdown))}</strong></div>`
              : ''}
          </div>
        </div>`).join('')}
    </div>`;
}

// ── Leaderboard ─────────────────────────────────────────────────
function renderLeaderboard() {
  const tally = {};
  allFeatures.forEach(f => {
    tally[f.company] = (tally[f.company] || 0) + 1;
  });

  const ranked = Object.entries(tally)
    .sort((a, b) => b[1] - a[1])
    .map(([company, count], idx) => ({ company, count, rank: idx + 1 }));

  const max = ranked[0]?.count || 1;
  const medals = ['🥇', '🥈', '🥉'];

  document.getElementById('leaderboardGrid').innerHTML = ranked.map(r => `
    <div class="lb-row">
      <span class="lb-rank">${medals[r.rank - 1] ?? `#${r.rank}`}</span>
      <div class="lb-info">
        <span class="lb-company">${esc(r.company)}</span>
        <div class="lb-bar-track">
          <div class="lb-bar-fill" style="width:${(r.count / max) * 100}%"></div>
        </div>
      </div>
      <span class="lb-count">${r.count} experiment${r.count !== 1 ? 's' : ''}</span>
    </div>`).join('');
}

// ── Lessons Library ─────────────────────────────────────────────
const LESSON_THEMES = [
  { kw: ['user adoption', 'adoption', 'users'],       theme: 'Adoption',      icon: '👥' },
  { kw: ['competition', 'competitors', 'incumbent'],  theme: 'Competition',   icon: '⚔️' },
  { kw: ['business model', 'monetiz', 'revenue'],     theme: 'Monetization',  icon: '💰' },
  { kw: ['platform', 'ecosystem'],                    theme: 'Platform Fit',  icon: '🔗' },
  { kw: ['content', 'creator'],                       theme: 'Content',       icon: '🎬' },
  { kw: ['hardware', 'device'],                       theme: 'Hardware',      icon: '🔧' },
  { kw: ['behavior', 'habit', 'timing'],              theme: 'Timing',        icon: '⏰' },
  { kw: ['engage', 'retention', 'usage'],             theme: 'Engagement',    icon: '📊' },
];

function tagTheme(lesson) {
  const lower = lesson.toLowerCase();
  for (const t of LESSON_THEMES) {
    if (t.kw.some(k => lower.includes(k))) return t;
  }
  return { theme: 'Strategy', icon: '🧭' };
}

function renderLessonsLibrary() {
  const lessons = allFeatures.map((f, i) => ({ ...f, _idx: i }));

  document.getElementById('lessonsGrid').innerHTML = lessons.map(f => {
    const { theme, icon } = tagTheme(f.lesson);
    return `
      <div class="lesson-card">
        <div class="lesson-theme-row">
          <span class="lesson-icon-badge">${icon}</span>
          <span class="lesson-theme-tag">${esc(theme)}</span>
        </div>
        <blockquote class="lesson-quote">"${esc(f.lesson)}"</blockquote>
        <footer class="lesson-source">— ${esc(f.feature)} · ${esc(f.company)}</footer>
      </div>`;
  }).join('');
}

// ── Submit Form ─────────────────────────────────────────────────
function setupForm() {
  const form       = document.getElementById('submitForm');
  const submitBtn  = document.getElementById('submitBtn');
  const msgEl      = document.getElementById('formMsg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msgEl.hidden = true;

    const company  = document.getElementById('fCompany').value.trim();
    const feature  = document.getElementById('fFeature').value.trim();
    const launched = parseInt(document.getElementById('fLaunched').value, 10);
    const shutdown = document.getElementById('fShutdown').value
      ? parseInt(document.getElementById('fShutdown').value, 10)
      : undefined;
    const reason   = document.getElementById('fReason').value.trim();
    const lesson   = document.getElementById('fLesson').value.trim();

    if (!company || !feature || !launched || !reason || !lesson) {
      showMsg(msgEl, 'error', 'Please fill in all required fields.');
      return;
    }

    const body = { company, feature, launched, reason, lesson };
    if (shutdown) body.shutdown = shutdown;

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Submitting…';

    try {
      const res = await fetch(API, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const body    = await res.json();
      const created = body.data ?? body;
      allFeatures = [...allFeatures, created];
      renderCards(allFeatures);
      renderTimeline();
      renderLeaderboard();
      renderLessonsLibrary();
      renderHeroStats();
      populateFilterAfterSubmit(company);

      form.reset();
      showMsg(msgEl, 'success', `"${esc(feature)}" has been added to the Graveyard.`);
    } catch (err) {
      showMsg(msgEl, 'error', `Submission failed: ${err.message}`);
    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Submit Feature';
    }
  });
}

function populateFilterAfterSubmit(company) {
  const sel = document.getElementById('companyFilter');
  const exists = [...sel.options].some(o => o.value === company);
  if (!exists) {
    const opt = document.createElement('option');
    opt.value       = company;
    opt.textContent = company;
    sel.appendChild(opt);
  }
}

function showMsg(el, type, text) {
  el.hidden    = false;
  el.className = `form-msg form-msg--${type}`;
  el.textContent = text;
}

// ── Start ───────────────────────────────────────────────────────
init();
