# 🚀 SkillChallenge Ladder — Render Deployment Guide

This project is configured for **Single-Service Full-Stack Deployment** on [Render](https://render.com/). Render builds the React frontend with Vite, serves it statically through the Express production server, and runs the REST API and database automatically.

---

## Step 1: Push Project to GitHub

1. Create a new GitHub repository named `skillchallenge-ladder` at [github.com/new](https://github.com/new) (keep it empty, without a README or .gitignore).
2. Run the following commands in your terminal to link and push your code:

```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/skillchallenge-ladder.git
git push -u origin main
```

---

## Step 2: Deploy on Render

1. Go to [dashboard.render.com](https://dashboard.render.com/) and sign in with GitHub.
2. Click **New +** > **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your `skillchallenge-ladder` repository.
4. Fill in the following settings:
   - **Name**: `skillchallenge-ladder` (or any custom name)
   - **Region**: Choose the closest region (e.g. Frankfurt, Oregon, Singapore)
   - **Branch**: `main`
   - **Root Directory**: Leave blank (default)
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm --prefix client install && npm --prefix client run build && npm --prefix server install
     ```
   - **Start Command**:
     ```bash
     node server/server.js
     ```
   - **Instance Type**: `Free`

---

## Step 3: Configure Environment Variables

In the **Environment Variables** section on Render, add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production mode & caching |
| `PORT` | `5000` | Port listened to by Express |
| `JWT_SECRET` | *(Click "Generate" or enter a 32+ char secret)* | Secret for signing JWT authentication tokens |
| `CLIENT_URL` | `https://your-app-name.onrender.com` | Your live Render application URL |
| `MONGODB_URI` | *(Optional, see below)* | MongoDB Atlas Connection String |

> **MongoDB Tip**:
> - If you provide a free **MongoDB Atlas URI** (`mongodb+srv://...`), data will permanently persist across server spin-downs.
> - If you leave `MONGODB_URI` blank, the app's dynamic fallback engine will automatically activate and auto-seed the demo curriculum on first startup!

---

## Step 4: Click "Create Web Service"

Render will:
1. Pull your code from branch `main`.
2. Install frontend and backend dependencies.
3. Build the production React SPA into `client/dist`.
4. Start the Express server on port 5000.
5. Provide you with a live HTTPS URL: `https://skillchallenge-ladder-xxxx.onrender.com`.

---

## 🎯 Production Checklist
- [x] Multi-stage build and SPA static fallback configured in `server/server.js`.
- [x] Zero-config blueprint file `render.yaml` created.
- [x] Initial seed script runs automatically if database has 0 challenges.
- [x] Demo accounts (`student@skillladder.com` / `reviewer@skillladder.com`) ready for testing.
