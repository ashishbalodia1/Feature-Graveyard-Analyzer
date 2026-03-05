const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', '..', 'data', 'features.json');

function loadFeatures() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

// GET /api/features — return all failed features
router.get('/', (req, res) => {
  try {
    const features = loadFeatures();
    res.json(features);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load features data.' });
  }
});

module.exports = router;
