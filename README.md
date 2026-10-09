# Student Dropout Early Warning System 🎓

Predictive analytics platform for educational institutions (universities, engineering colleges, and government skill development programs) that identifies students at high risk of dropping out **2-3 months in advance** using Gradient Boosting Classifiers.

---

## 🚀 Instant Render Deployment Guide

This project is pre-configured with a `render.yaml` Blueprint for 1-click deployment on [Render](https://render.com).

### Step 1: Push Project to GitHub
Open your terminal inside this project directory and run:

```bash
# 1. Create a new repository on GitHub (e.g. "student-dropout-warning-system")
# 2. Add your GitHub remote URL:
git remote add origin https://github.com/YOUR_USERNAME/student-dropout-warning-system.git

# 3. Rename branch to main and push:
git branch -M main
git push -u origin main
```

---

### Step 2: Deploy on Render

#### Option A: Using Render Blueprints (Recommended - 1-Click Setup)
1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** in the top right and select **Blueprint**.
3. Connect your GitHub repository (`student-dropout-warning-system`).
4. Render will read `render.yaml` automatically and configure the project.
5. Click **Apply** to deploy!

#### Option B: Manual Static Site Deployment
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Static Site**.
3. Select your GitHub repository.
4. Fill in the following deployment settings:
   - **Name**: `student-dropout-warning`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. Under **Redirects / Rewrites**, add:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
6. Click **Create Static Site**!

#### Option C: Manual Web Service Deployment (Node.js Server)
1. Click **New +** -> **Web Service**.
2. Build Command: `npm install && npm run build`
3. Start Command: `npm start`
4. Click **Create Web Service**.

---

## 💻 Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Train Python Gradient Boosting Classifier
python train_early_warning_model.py
```

---

## 📊 Features & Architecture
- **Gradient Boosting Classifier**: Predicts dropout risk ($0-100\%$) and 2-3 month early warning horizon.
- **SHAP Feature Attribution**: Breakdown of positive vs negative risk drivers per student.
- **Counselor Risk Dashboard**: Interactive risk ranking, cohort filters, student profile deep-dives.
- **Outcome Tracking**: Measure pre/post intervention risk score reduction and student retention rates.
