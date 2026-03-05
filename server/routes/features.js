const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', '..', 'data', 'features.json');

// In-memory store for user submissions (resets on server restart)
const submissions = [];

function loadFeatures() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

// GET /api/features — return seed features + in-memory submissions
router.get('/', (req, res) => {
  try {
    const features = loadFeatures();
    res.json([...features, ...submissions]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load features data.' });
  }
});

// POST /api/features — submit a new failed feature
router.post('/', (req, res) => {
  const { company, feature, launched, shutdown, reason, lesson } = req.body;

  // Validate required fields
  const missing = ['company', 'feature', 'launched', 'reason', 'lesson']
    .filter(k => !req.body[k] || String(req.body[k]).trim() === '');
  if (missing.length) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
  }

  const launchedNum  = parseInt(launched, 10);
  const shutdownNum  = shutdown ? parseInt(shutdown, 10) : null;

  if (isNaN(launchedNum) || launchedNum < 1990 || launchedNum > 2030) {
    return res.status(400).json({ error: 'Invalid launch year.' });
  }
  if (shutdownNum !== null && (isNaN(shutdownNum) || shutdownNum < launchedNum || shutdownNum > 2030)) {
    return res.status(400).json({ error: 'Invalid shutdown year.' });
  }

  const entry = {
    company:    String(company).trim().slice(0, 80),
    feature:    String(feature).trim().slice(0, 120),
    launched:   launchedNum,
    shutdown:   shutdownNum,
    reason:     String(reason).trim().slice(0, 500),
    lesson:     String(lesson).trim().slice(0, 500),
    submittedAt: new Date().toISOString(),
    userSubmitted: true,
  };

  submissions.push(entry);
  res.status(201).json({ success: true, data: entry });
});

module.exports = router;
