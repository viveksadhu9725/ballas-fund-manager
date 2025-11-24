# Deploy Ballas Fund Manager to Render.com (Complete App)

## Why Render?
- ✅ Supports full-stack Node.js apps (frontend + backend together)
- ✅ Free tier available
- ✅ Automatic GitHub deployments
- ✅ PostgreSQL database included
- ✅ No API routing issues (everything runs on same server)

---

## Step-by-Step Deployment

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### Step 2: Create Render Account
1. Go to https://render.com
2. Click "Get started" 
3. Sign up with GitHub (connect your account)

### Step 3: Deploy to Render
1. Click **New +** → **Web Service**
2. Select your GitHub repository
3. Fill in the form:

   **Name:** `ballas-fund-manager`
   
   **Environment:** `Node`
   
   **Build Command:** 
   ```
   npm install
   ```
   
   **Start Command:** 
   ```
   npm start
   ```
   
   **Plan:** `Free` (or Starter if free tier unavailable)

### Step 4: Add PostgreSQL Database
1. In Render dashboard, click **New +** → **PostgreSQL**
2. Fill in:
   - **Name:** `ballas-db`
   - **Database:** `ballas_db`
   - **User:** `ballas_user`
   - **Plan:** `Free`
3. Click "Create Database"
4. Wait for creation (~1 minute)
5. Copy the **External Database URL** (looks like: `postgresql://ballas_user:xxxxx@xxxxx.render.com:5432/ballas_db`)

### Step 5: Connect Database to App
1. Go back to your **Web Service** (ballas-fund-manager)
2. Click **Environment**
3. Add new Environment Variable:
   - **Key:** `DATABASE_URL`
   - **Value:** (Paste the PostgreSQL URL from Step 4)
4. Click "Save"

### Step 6: Automatic Deployment
1. Your app should automatically redeploy with the new DATABASE_URL
2. Wait for deployment to complete (status should change to "Live")
3. Your app URL will appear: `https://ballas-fund-manager.onrender.com`

### Step 7: Login & Test
- **URL:** `https://ballas-fund-manager.onrender.com`
- **Username:** `Ballas`
- **Password:** `Webleedpurple`

---

## ✅ Done!
Your complete app is now live. Frontend + Backend running together on the same server with no routing issues.

---

## Troubleshooting

**If deployment fails:**
1. Click **Logs** in Render to see what went wrong
2. Check if `npm start` works locally: `npm run build && npm start`
3. Verify DATABASE_URL environment variable is set correctly

**If login doesn't work after deployment:**
1. Check Render Logs for errors
2. Verify DATABASE_URL is correct in Environment
3. The admin user "Ballas" will be created automatically on first run

---

## Auto-Deployment Bonus
Once connected to GitHub:
- Any push to your `main` branch automatically redeploys
- No manual deployment needed
