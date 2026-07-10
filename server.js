const express   = require('express');
const path      = require('path');
const rateLimit = require('express-rate-limit');

const app    = express();
const PORT   = process.env.PORT || 3000;
const APIKEY = process.env.ANTHROPIC_API_KEY;

if (!APIKEY) {
  console.error('Error: ANTHROPIC_API_KEY environment variable is not set.');
  process.exit(1);
}

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'chess_trainer.html'));
});

// Max 30 API calls per IP per hour
app.use('/api/chat', rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many requests — please try again in an hour.' } },
}));

app.post('/api/chat', async (req, res) => {
  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':    'application/json',
        'x-api-key':       APIKEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return res.status(upstream.status).json(data);
    }

    res.json(data);
  } catch (err) {
    res.status(502).json({ error: { message: `Proxy error: ${err.message}` } });
  }
});

app.listen(PORT, () => {
  console.log(`Chess Trainer running at http://localhost:${PORT}`);
});
