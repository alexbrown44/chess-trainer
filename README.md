# ♟ Chess Opening Coach

A personal chess coaching app that works alongside your **physical board**. You play your moves on the real board, report them to the app, and Claude acts as both opponent and coach — calibrated to your chosen skill level.

At the end of the session you receive a full coaching report with move-by-move analysis, opening assessment, key mistakes, and a performance score.

![Chess Opening Coach](https://img.shields.io/badge/powered%20by-Claude%20AI-d4af37?style=flat-square)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square)

---

## Features

- **Four skill levels** — Beginner, Intermediate, Club Player, Advanced
- **Play as White or Black**
- **Adjustable game length** — 5 to 10 moves
- **Legal move enforcement** — chess.js validates every move; illegal engine moves are automatically retried
- **Challenge any ruling** — if the app flags your move as illegal (or the engine plays something suspicious), you can challenge it and Claude will review the position using the real board state
- **Post-game coaching report** — move-by-move commentary, opening identification, key mistakes, and a 1–100 performance score
- **Restart at any time** during a game

---

## Prerequisites

| Requirement | Version |
|---|---|
| [Node.js](https://nodejs.org/) | 18 or later |
| [Anthropic API key](https://console.anthropic.com/) | Free to sign up |

---

## Setup

```bash
# 1. Clone the repo
git clone https://github.com/alexbrown44/chess-trainer.git
cd chess-trainer

# 2. Install dependencies
npm install

# 3. Set your Anthropic API key
#    Windows (PowerShell)
$env:ANTHROPIC_API_KEY="sk-ant-..."

#    macOS / Linux
export ANTHROPIC_API_KEY="sk-ant-..."

# 4. Start the server
node server.js
```

Then open **http://localhost:3000** in your browser.

> **Tip:** To avoid setting the environment variable every session, create a `.env` file (see `.env.example`) and load it with a tool like [dotenv-cli](https://www.npmjs.com/package/dotenv-cli):
> ```bash
> npx dotenv-cli node server.js
> ```

---

## How to play

1. **Configure** your opponent's skill level, your colour, and how many moves to play.
2. **Start the game** — if you're Black, the engine moves first.
3. **Make moves on your physical board**, then type each move into the app in standard algebraic notation (e.g. `e4`, `Nf3`, `O-O`, `exd5`).
4. The app displays the **opponent's reply** — make that move on your board too.
5. After the set number of moves, Claude generates a **full coaching report**.

### Challenging a move

- **Opponent's move looks wrong?** Click **⚑ Challenge Move** in the gold callout box, explain your reasoning, and Claude will verify the position using the actual board state (FEN).
- **App says your move is illegal?** Click **⚑ Challenge this ruling**, explain why you think it's valid, and Claude will review it — if accepted, the move is played immediately.

---

## Project structure

```
chess-trainer/
├── chess_trainer.html   # Full React app (CDN React + Babel, no build step)
├── server.js            # Express server — proxies API calls, serves the HTML
├── package.json
└── .env.example
```

The app uses no build tooling — `chess_trainer.html` is a single self-contained file using CDN React, Babel Standalone, and chess.js.

---

## API usage & cost

Each move generates one small API call (~150 tokens output). The post-game report uses up to 4,096 output tokens. A typical 10-move game costs roughly **$0.03–0.08** at current Claude pricing.

---

## License

MIT
