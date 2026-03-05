const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', '..', 'data', 'features.json');

function loadFeatures() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

// GET /api/features — return all features
router.get('/', (req, res) => {
  try {
    const features = loadFeatures();
    res.json({ success: true, count: features.length, data: features });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load features data.' });
  }
});

// GET /api/features/:id — return a single feature by id
router.get('/:id', (req, res) => {
  try {
    const features = loadFeatures();
    const feature = features.find(f => f.id === req.params.id);
    if (!feature) {
      return res.status(404).json({ success: false, message: 'Feature not found.' });
    }
    res.json({ success: true, data: feature });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load features data.' });
  }
});

// GET /api/features/filter/status/:status — filter by status (dead | at-risk | healthy)
router.get('/filter/status/:status', (req, res) => {
  try {
    const features = loadFeatures();
    const filtered = features.filter(
      f => f.status.toLowerCase() === req.params.status.toLowerCase()
    );
    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load features data.' });
  }
});

module.exports = router;
