'use strict';

const API          = '/api/features';
const INSIGHTS_API = '/api/insights';

let allFeatures = [];

// ─── Fetch & Bootstrap ────────────────────────────────────────────
async function init() {
  try {
    const [featRes, insRes] = await Promise.all([
      fetch(API),
      fetch(INSIGHTS_API),
    ]);
    if (!featRes.ok) throw new Error(`Features HTTP ${featRes.status}`);
    if (!insRes.ok)  throw new Error(`Insights HTTP ${insRes.status}`);

    allFeatures      = await featRes.json();
    const insights   = await insRes.json();

    bootstrap();
    renderInsights(insights);
  } catch (err) {
    document.getElementById('cardsGrid').innerHTML =
      '<p class="empty-state" style="display:block">Failed to load data — is the server running?</p>';
  }
}

function bootstrap() {
  populateCompanyFilter();
  updateStats(allFeatures);
  renderCards(allFeatures);

  // header badge
  document.getElementById('totalBadge').textContent =
    `${allFeatures.length} features indexed`;

  // wire up controls
  document.getElementById('searchInput').addEventListener('input', applyFilters);
  document.getElementById('companyFilter').addEventListener('change', applyFilters);
}

// ─── Stats ────────────────────────────────────────────────────────
function updateStats(features) {
  const years    = features.map(f => f.shutdown).filter(Boolean);
  const companies = new Set(features.map(f => f.company)).size;

  document.getElementById('statTotal').textContent    = features.length;
  document.getElementById('statEarliest').textContent = years.length ? Math.min(...years) : '—';
  document.getElementById('statLatest').textContent   = years.length ? Math.max(...years) : '—';
  document.getElementById('statCompanies').textContent = companies;
}

// ─── Company filter dropdown ──────────────────────────────────────
function populateCompanyFilter() {
  const sel = document.getElementById('companyFilter');
  const companies = [...new Set(allFeatures.map(f => f.company))].sort();
  companies.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });
}

// ─── Filter & Search ──────────────────────────────────────────────
function applyFilters() {
  const query   = document.getElementById('searchInput').value.trim().toLowerCase();
  const company = document.getElementById('companyFilter').value;

  const filtered = allFeatures.filter(f => {
    const matchesCompany = company === 'all' || f.company === company;
    const matchesSearch  = !query ||
      f.feature.toLowerCase().includes(query) ||
      f.company.toLowerCase().includes(query) ||
      f.reason.toLowerCase().includes(query)  ||
      f.lesson.toLowerCase().includes(query);
    return matchesCompany && matchesSearch;
  });

  renderCards(filtered);

  const countEl = document.getElementById('resultCount');
  countEl.textContent = filtered.length < allFeatures.length
    ? `${filtered.length} of ${allFeatures.length} results`
    : '';
}

// ─── Render cards ─────────────────────────────────────────────────
function renderCards(features) {
  const grid  = document.getElementById('cardsGrid');
  const empty = document.getElementById('emptyState');

  if (!features.length) {
    grid.innerHTML = '';
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  grid.innerHTML = features.map(cardHTML).join('');
}

function cardHTML(f) {
  const shutdown = f.shutdown ?? 'Active';
  return `
    <article class="card">
      <div class="card-top">
        <div class="card-company-wrap">
          <span class="card-company">${esc(f.company)}</span>
          <span class="card-feature">${esc(f.feature)}</span>
        </div>
        <div class="card-timeline" title="Launch year → Shutdown year">
          <span class="tl-year">${esc(String(f.launched))}</span>
          <span class="tl-arrow">→</span>
          <span class="tl-year shutdown">${esc(String(shutdown))}</span>
        </div>
      </div>

      <div class="card-divider"></div>

      <p class="card-section-label">Why it failed</p>
      <p class="card-reason">${esc(f.reason)}</p>

      <div class="card-lesson-wrap">
        <p class="card-section-label">Product lesson</p>
        <p class="card-lesson">${esc(f.lesson)}</p>
      </div>
    </article>`;
}

// XSS-safe escaping for dynamic content inserted via innerHTML
function esc(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── Go ───────────────────────────────────────────────────────────
init();

// ─── Insights renderer ───────────────────────────────────────────
function renderInsights(d) {
  // KPI cards
  const kpis = [
    {
      icon: '📊',
      label: 'Top Failure Reason',
      value: d.topFailureReason,
      color: 'red',
    },
    {
      icon: '⏱️',
      label: 'Avg Feature Lifespan',
      value: d.averageLifespan,
      color: 'amber',
    },
    {
      icon: '🧪',
      label: 'Most Experimental Co.',
      value: d.mostExperimentalCompany,
      sub: `${d.mostExperimentalCompanyCount} features`,
      color: 'purple',
    },
    {
      icon: '⚠️',
      label: 'Riskiest Category',
      value: d.topRiskCategory,
      color: 'green',
    },
  ];

  document.getElementById('insightsKpiRow').innerHTML = kpis.map(k => `
    <div class="kpi-card kpi-${k.color}">
      <span class="kpi-icon" aria-hidden="true">${k.icon}</span>
      <div class="kpi-body">
        <p class="kpi-label">${esc(k.label)}</p>
        <p class="kpi-value">${esc(k.value)}</p>
        ${k.sub ? `<p class="kpi-sub">${esc(k.sub)}</p>` : ''}
      </div>
    </div>`).join('');

  // Bar chart — company breakdown
  const max = d.companyBreakdown[0].count;
  document.getElementById('barChart').innerHTML = d.companyBreakdown.map(item => `
    <div class="bar-row">
      <span class="bar-company">${esc(item.company)}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width:${(item.count / max) * 100}%" aria-label="${item.count} feature${item.count > 1 ? 's' : ''}"></div>
      </div>
      <span class="bar-count">${item.count}</span>
    </div>`).join('');

  // Additional fact pills
  const facts = [
    { label: 'Shortest-lived feature',  value: d.shortestLivedFeature },
    { label: 'Worst shutdown year',      value: `${d.worstShutdownYear} (${d.worstShutdownYearCount} features)` },
    { label: 'Total features analyzed', value: String(d.totalAnalyzed) },
  ];

  document.getElementById('insightFacts').innerHTML = facts.map(f => `
    <div class="fact-row">
      <span class="fact-label">${esc(f.label)}</span>
      <span class="fact-value">${esc(f.value)}</span>
    </div>`).join('');
}
