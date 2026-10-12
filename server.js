const express   = require('express');
const path      = require('path');
const rateLimit = require('express-rate-limit');
const { Pool }  = require('pg');

const app    = express();
const PORT   = process.env.PORT || 3000;
const APIKEY = process.env.ANTHROPIC_API_KEY;

if (!APIKEY) {
  console.error('Error: ANTHROPIC_API_KEY environment variable is not set.');
  process.exit(1);
}

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : null;

if (!pool) console.warn('Warning: DATABASE_URL not set — game history disabled.');

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

// ── Game history endpoints ────────────────────────────────────────────────────

app.get('/api/games/leaderboard', async (req, res) => {
  if (!pool) return res.json([]);
  try {
    const result = await pool.query(`
      SELECT player_name,
             COUNT(*)::int          AS games_played,
             ROUND(AVG(score))::int AS avg_score,
             MAX(score)             AS best_score
      FROM games
      WHERE score IS NOT NULL
      GROUP BY player_name
      ORDER BY avg_score DESC
      LIMIT 20
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/games', async (req, res) => {
  if (!pool) return res.json([]);
  try {
    const { player } = req.query;
    const result = player
      ? await pool.query(
          'SELECT * FROM games WHERE LOWER(player_name) = LOWER($1) ORDER BY played_at DESC LIMIT 50',
          [player]
        )
      : await pool.query('SELECT * FROM games ORDER BY played_at DESC LIMIT 50');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/games', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Database not configured' });
  try {
    const { player_name, skill_level, player_color, move_count, moves, score, opening_name, coaching_report } = req.body;
    const result = await pool.query(
      `INSERT INTO games (player_name, skill_level, player_color, move_count, moves, score, opening_name, coaching_report)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [player_name, skill_level, player_color, move_count, moves, score, opening_name, coaching_report]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Chess Trainer running at http://localhost:${PORT}`);
});
