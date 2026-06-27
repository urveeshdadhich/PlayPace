<div align="center">
  <img src="docs/hero-flat.jpg" alt="PlayPace Logo" width="250" style="border-radius: 20px; box-shadow: 0 10px 30px rgba(0, 210, 255, 0.2);" />
</div>

<h1 align="center">PlayPace</h1>

<p align="center">
  <strong>Intelligent Game Backlog Management & Pacing</strong>
</p>

<br />

## Overview

PlayPace is a sleek, AI-driven web application designed to help gamers manage their growing backlog of games. Instead of simply listing what you own, PlayPace intelligently calculates realistic completion timelines based on your available free time and personal gaming habits. 

Featuring a modern glassmorphic interface, cloud synchronization, and personalized AI recommendations, PlayPace transforms overwhelming game libraries into structured, manageable experiences.

## Features

- **Pacing Controller:** Dynamically set your available gaming hours per day, week, or month. PlayPace instantly recalculates how long it will take to complete each game in your library.
- **AI Mood Discovery:** Select your current mood or desired game style, and our integrated AI will suggest curated titles perfectly tailored to your preferences.
- **Cloud Synchronization:** Secure, authenticated accounts ensure your library and pacing configurations are safely stored in the cloud and synchronized across all your devices.
- **Dynamic Estimates:** Automatically fetches accurate completion time estimates for every game added to your library.
- **Elegant Interface:** Built with a beautiful, responsive, neon-accented glassmorphic design system that feels native and premium.

## Architecture

PlayPace is built using a modern, full-stack architecture:

- **Frontend:** React, TypeScript, and Vite for a lightning-fast, highly responsive single-page application.
- **Backend:** Python and FastAPI providing a robust, high-performance REST API.
- **Database:** SQLite with secure bcrypt password hashing and JWT-based authentication.
- **AI Integration:** Google Gemini API for intelligent, context-aware game recommendations.

## Deployment

The application is fully containerized and production-ready. The included `Dockerfile` builds the optimized React frontend and configures the FastAPI server to serve both the API and the static web assets from a single port.

To deploy on platforms like Render, Railway, or AWS:
1. Set the **Build Context** or **Root Directory** to the PlayPace repository root.
2. Provide your `GEMINI_API_KEY` as a cloud environment variable.
3. Deploy directly using the provided `Dockerfile`.

## Local Development

1. **Install Backend Dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Set Environment Variables:**
   Create a `.env` file in the `backend` directory and add your API key:
   ```env
   GEMINI_API_KEY=your_key_here
   ```

3. **Start the Backend Server:**
   ```bash
   uvicorn app.main:app --reload
   ```

4. **Start the Frontend Client:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
