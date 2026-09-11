# LabelLens AI — Trust Before You Buy

SLAB Browser Agent Hackathon MVP (Phase 1)

## Features (Phase 1)

- React + Vite + Tailwind dashboard (purple glassmorphism UI)
- Node.js + Express API
- webcmd-powered Explorer Agent
- Supports Amazon and Blinkit product pages
- Extracts: brand, product name, ingredients, claims, basic nutrition

## Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Browser Automation: webcmd + Chromium
- Memory: prepared folder (used in Phase 2)

## Setup

### 1. Install dependencies

Frontend:

```bash
cd frontend
npm install
```

Backend:

```bash
cd backend
npm install
```

### 2. Install webcmd

```bash
npm install -g @agentrhq/webcmd
webcmd doctor
webcmd skills add
```

### 3. Configure environment

In `backend/`:

```bash
cp .env.example .env
```

Edit `.env` and set `PORT` (and later `OPENAI_API_KEY`).

### 4. Run backend

From `backend/`:

```bash
npm run dev
```

Server runs on `http://localhost:3001`.

### 5. Run frontend

From `frontend/`:

```bash
npm run dev
```

Open the URL shown (usually `http://localhost:5173`).

## Usage

1. Open the frontend in your browser.
2. Paste an Amazon or Blinkit product URL.
3. Click “Analyze”.
4. See extracted product data and investigation log.

## Next Phases

- Phase 2: Memory & workflow learning (faster second visits)
- Phase 3: Verifier Agent (official site cross-check)
- Phase 4: Personalization + GPT Trust Score