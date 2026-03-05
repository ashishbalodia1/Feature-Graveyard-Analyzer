const API_BASE = '/api/features';

let allFeatures = [];
let activeFilter = 'all';

// ─── Fetch & Bootstrap ────────────────────────────────────────────
async function init() {
  try {
    const res = await fetch(API_BASE);
    const json = await res.json();
    allFeatures = json.data;
    renderStats(allFeatures);
    renderCards(allFeatures);
  } catch (err) {
    document.getElementById('featuresGrid').innerHTML =
      '<p class="loading-text">Failed to load features. Is the server running?</p>';
  }
}

// ─── Stats ────────────────────────────────────────────────────────
function renderStats(features) {
  document.getElementById('statTotal').textContent   = features.length;
  document.getElementById('statDead').textContent    = features.filter(f => f.status === 'dead').length;
  document.getElementById('statAtRisk').textContent  = features.filter(f => f.status === 'at-risk').length;
  document.getElementById('statHealthy').textContent = features.filter(f => f.status === 'healthy').length;
}

// ─── Cards ────────────────────────────────────────────────────────
function renderCards(features) {
  const grid = document.getElementById('featuresGrid');
  if (!features.length) {
    grid.innerHTML = '<p class="loading-text">No features match this filter.</p>';
    return;
  }
  grid.innerHTML = features.map(f => cardHTML(f)).join('');

  grid.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.id));
  });
}

function cardHTML(f) {
  const fhsColor = fhsToColor(f.featureHealthScore);
  const tags = (f.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
  const reason = f.reasonAbandoned || 'No issues reported — feature is performing well.';

  return `
    <article class="feature-card" data-id="${f.id}" tabindex="0" role="button"
             aria-label="View details for ${f.name}">
      <div class="card-header">
        <div>
          <div class="card-name">${f.name}</div>
          <div class="card-company">${f.company} &middot; ${f.category}</div>
        </div>
        <span class="status-badge ${f.status}">${f.status.replace('-', ' ')}</span>
      </div>
      <div class="card-metrics">
        <div class="metric">
          <span class="metric-value">${f.adoptionRatePct}%</span>
          <span class="metric-label">Adoption</span>
        </div>
        <div class="metric">
          <span class="metric-value">${f.retentionRatePct}%</span>
          <span class="metric-label">Retention</span>
        </div>
        <div class="metric">
          <span class="metric-value">${f.estimatedEngineeringCostDays}d</span>
          <span class="metric-label">Eng. Cost</span>
        </div>
      </div>
      <div class="fhs-bar-wrap">
        <div class="fhs-label-row">
          <span>Feature Health Score</span>
          <span style="color:${fhsColor}">${f.featureHealthScore} / 100</span>
        </div>
        <div class="fhs-bar">
          <div class="fhs-fill" style="width:${f.featureHealthScore}%;background:${fhsColor}"></div>
        </div>
      </div>
      <p class="card-reason">${reason}</p>
      <div class="card-tags">${tags}</div>
    </article>`;
}

// ─── Modal ────────────────────────────────────────────────────────
function openModal(id) {
  const f = allFeatures.find(x => x.id === id);
  if (!f) return;

  const fhsColor = fhsToColor(f.featureHealthScore);
  const lessons = (f.lessonsLearned || [])
    .map(l => `<li>${l}</li>`).join('');
  const tags = (f.tags || []).map(t => `<span class="tag">${t}</span>`).join('');

  document.getElementById('modalBody').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:4px;">
      <h2>${f.name}</h2>
      <span class="status-badge ${f.status}">${f.status.replace('-', ' ')}</span>
    </div>
    <p class="modal-meta">
      ${f.company} &middot; ${f.category}
      &nbsp;&bull;&nbsp; Launched ${f.launchedAt}
      ${f.abandonedAt ? ` &nbsp;&bull;&nbsp; Abandoned ${f.abandonedAt}` : ''}
    </p>

    <div class="modal-metrics">
      <div class="modal-metric">
        <span class="metric-value">${f.adoptionRatePct}%</span>
        <span class="metric-label">Adoption Rate</span>
      </div>
      <div class="modal-metric">
        <span class="metric-value">${f.retentionRatePct}%</span>
        <span class="metric-label">Retention Rate</span>
      </div>
      <div class="modal-metric">
        <span class="metric-value">${f.estimatedEngineeringCostDays}d</span>
        <span class="metric-label">Eng. Cost Est.</span>
      </div>
      <div class="modal-metric">
        <span class="metric-value" style="color:${fhsColor}">${f.featureHealthScore}</span>
        <span class="metric-label">Health Score</span>
      </div>
    </div>

    ${f.reasonAbandoned ? `
    <div class="modal-section">
      <h3>Why It Failed</h3>
      <p>${f.reasonAbandoned}</p>
    </div>` : ''}

    <div class="modal-section">
      <h3>Lessons Learned</h3>
      <ul class="lessons-list">${lessons}</ul>
    </div>

    <div class="modal-section">
      <h3>Tags</h3>
      <div class="card-tags">${tags}</div>
    </div>`;

  document.getElementById('modalOverlay').hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').hidden = true;
  document.body.style.overflow = '';
}

// ─── Filters ──────────────────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    activeFilter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filtered = activeFilter === 'all'
      ? allFeatures
      : allFeatures.filter(f => f.status === activeFilter);
    renderCards(filtered);
  });
});

// ─── Modal close handlers ─────────────────────────────────────────
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ─── Helpers ──────────────────────────────────────────────────────
function fhsToColor(score) {
  if (score >= 60) return '#3ecf8e';
  if (score >= 40) return '#e09f3e';
  return '#e05c5c';
}

// ─── Bootstrap ────────────────────────────────────────────────────
init();
