# rialai

An AI-powered interactive learning studio. Describe any topic and get back structured explanations, study notes, interactive quizzes, and balanced debates — all generated in parallel by four specialized AI systems.

---

## What it does

**Playground** — Generates a fully playable quiz or interactive simulation from any topic. Built to learn by doing.

**Lens** — Breaks down any concept into a structured explanation: simple version, core ideas, analogies, and real-world examples.

**Studio** — Transforms any topic into clean study notes — summary, key vocabulary, core concepts, and self-check questions.

**Debate** — Explores both sides of any topic. Arguments for, arguments against, key tensions, and a nuanced synthesis.

All four run in parallel from a single prompt.

---

## Stack

- **Frontend** — React 18, TypeScript, Vite
- **Styling** — Tailwind CSS, custom design system (Plus Jakarta Sans + Space Mono)
- **Auth** — Firebase Authentication (email/password + Google)
- **AI** — Groq API (`llama-3.3-70b-versatile`) via Supabase Edge Functions
- **Persistence** — localStorage for History and Memory screens

---

## Getting started

```bash
npm install
npm run dev
```

The app runs on `http://localhost:8080`.

You'll need a `.env` with your Supabase project URL and anon key for the AI backend to work.

---

## Features

- **History** — Every prompt you run is saved locally. Re-explore any past topic in one click.
- **Memory** — Lens analyses are auto-saved for review. Collapsible cards, per-entry delete.
- **Auth gate** — Sign in with Google or email/password before accessing the studio.
- **Warm editorial design** — Cream palette, frosted glass sidebar, premium typography.
