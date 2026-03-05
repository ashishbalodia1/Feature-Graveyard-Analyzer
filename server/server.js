const express = require('express');
const cors = require('cors');
const path = require('path');

const featuresRouter = require('./routes/features');
const insightsRouter = require('./routes/insights');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/api/features', featuresRouter);
app.use('/api/insights', insightsRouter);

// Fallback — serve index.html for any non-API route
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Feature Graveyard server running on http://localhost:${PORT}`);
});
