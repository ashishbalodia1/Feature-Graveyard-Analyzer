const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', '..', 'data', 'features.json');

function loadFeatures() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

// ─── Helpers ─────────────────────────────────────────────────────

/** Return the key with the highest count in a frequency map. */
function topKey(map) {
  return [...map.entries()].sort((a, b) => b[1] - a[1])[0];
}

/** Build a frequency map from an array of string values. */
function freq(arr) {
  return arr.reduce((m, v) => m.set(v, (m.get(v) || 0) + 1), new Map());
}

// ─── Analysis engine ──────────────────────────────────────────────

function analyze(features) {
  // ── Average lifespan ─────────────────────────────────────────
  const lifespans = features
    .filter(f => f.launched && f.shutdown)
    .map(f => f.shutdown - f.launched);

  const avgLifespan = lifespans.length
    ? (lifespans.reduce((s, n) => s + n, 0) / lifespans.length).toFixed(1)
    : null;

  // ── Most experimental company (most entries) ─────────────────
  const companyFreq = freq(features.map(f => f.company));
  const [mostExpCompany, mostExpCount] = topKey(companyFreq);

  // ── Company failure breakdown (sorted desc) ───────────────────
  const companyBreakdown = [...companyFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([company, count]) => ({ company, count }));

  // ── Top failure reason keywords ───────────────────────────────
  // Tokenise the `reason` field and count meaningful words (>4 chars,
  // skip stop-words) to surface the most common failure theme.
  const STOP = new Set([
    'that', 'with', 'this', 'from', 'they', 'have', 'were',
    'been', 'when', 'already', 'before', 'never', 'their',
    'more', 'than', 'also', 'over', 'after', 'into', 'would',
    'could', 'which', 'there', 'about', 'other', 'during'
  ]);

  const words = features
    .flatMap(f => f.reason.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/))
    .filter(w => w.length > 4 && !STOP.has(w));

  const wordFreq = freq(words);
  const [topWord] = topKey(wordFreq);

  // Map common keyword fragments to a human-readable insight phrase
  const reasonMap = [
    [['adoption', 'users', 'usage'],         'Low user adoption'],
    [['competition', 'competitor', 'tiktok', 'snapchat', 'netflix'], 'Competitor dominance'],
    [['content', 'creator', 'library'],      'Insufficient content / creator ecosystem'],
    [['format', 'mobile', 'viewing'],        'Wrong format for the platform'],
    [['ecosystem', 'market', 'itunes'],      'Lost the ecosystem battle'],
    [['latency', 'infrastructure', 'cloud'], 'Infrastructure not ready for launch'],
  ];

  let topFailureReason = 'Low user adoption'; // sensible default
  outer: for (const [keywords, label] of reasonMap) {
    for (const kw of keywords) {
      if (topWord.includes(kw) || kw.includes(topWord)) {
        topFailureReason = label;
        break outer;
      }
    }
    // also scan raw reasons
    const hits = features.filter(f =>
      keywords.some(kw => f.reason.toLowerCase().includes(kw))
    ).length;
    if (hits >= 2) { topFailureReason = label; break; }
  }

  // ── Riskiest "category" — derived from shared lesson themes ───
  const categoryHints = [
    [['social', 'network', 'chat', 'messaging', 'poke', 'fleet'], 'Social Experiments'],
    [['streaming', 'video', 'content', 'originals', 'igtv'],      'Video & Streaming'],
    [['hardware', 'phone', 'device', 'zune'],                      'Consumer Hardware'],
    [['cloud', 'gaming', 'stadia'],                                'Cloud Services'],
    [['payment', 'monetis'],                                       'Payments & Monetisation'],
  ];

  const catScores = categoryHints.map(([kws, label]) => ({
    label,
    score: features.filter(f =>
      kws.some(kw => (f.feature + ' ' + f.reason + ' ' + f.lesson).toLowerCase().includes(kw))
    ).length
  }));
  catScores.sort((a, b) => b.score - a.score);
  const topRiskCategory = catScores[0].label;

  // ── Shortest-lived feature ────────────────────────────────────
  const shortest = features
    .filter(f => f.launched && f.shutdown)
    .reduce((min, f) =>
      (f.shutdown - f.launched) < (min.shutdown - min.launched) ? f : min
    );

  // ── Year with most shutdowns ──────────────────────────────────
  const shutdownYears = features.map(f => f.shutdown).filter(Boolean);
  const [worstYear, worstYearCount] = topKey(freq(shutdownYears));

  return {
    topFailureReason,
    averageLifespan: avgLifespan ? `${avgLifespan} years` : 'N/A',
    mostExperimentalCompany: mostExpCompany,
    mostExperimentalCompanyCount: mostExpCount,
    topRiskCategory,
    companyBreakdown,
    shortestLivedFeature: `${shortest.feature} (${shortest.shutdown - shortest.launched} yr${shortest.shutdown - shortest.launched === 1 ? '' : 's'})`,
    worstShutdownYear: worstYear,
    worstShutdownYearCount: worstYearCount,
    totalAnalyzed: features.length,
  };
}

// ─── Route ────────────────────────────────────────────────────────

// GET /api/insights
router.get('/', (req, res) => {
  try {
    const features = loadFeatures();
    const insights = analyze(features);
    res.json(insights);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate insights.' });
  }
});

module.exports = router;
