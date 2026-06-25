# NEXUS CGT Platform
## Integrated GMP-Grade Cell & Gene Therapy Enterprise Platform

A full-stack, GMP-compliant integrated platform for Cell & Gene Therapy organizations covering:

**Modalities supported:** Plasmid · AAV · Lentiviral Vector (LV) · CAR-T · CRISPR · mRNA · Stem Cell / iPSC

### Modules
| Module | Description |
|--------|-------------|
| Dashboard | KPIs, active batches, QC trends, tasks |
| Projects | All CGT programs across modalities |
| ELN | Electronic Lab Notebook + DoE Engine |
| Manufacturing | eBatch Records, stage tracking, COI |
| QC | Test results, assay library, specifications |
| QA | Deviations, CAPA, Change Control, Audit Trail |
| Inventory | Reagents, critical materials, expiry tracking |
| Equipment | Booking, PM schedule, qualification status |
| Documents | SOPs, WIs, Protocols, Training Records |

### Tech Stack
- **Frontend:** React + Vite
- **Backend / DB:** Supabase (PostgreSQL + REST API)
- **Charts:** Recharts
- **Deployment:** Run locally via Termux or any Node.js environment

---

## Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Go to **SQL Editor** → paste the schema from `src/lib/supabase.js` (the SCHEMA export)
3. Go to **Settings → API** → copy your **Project URL** and **anon public key**

---

## Environment Setup

```bash
cp .env.example .env
# Edit .env and add your Supabase credentials
```

`.env` file:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

---

## Running on Termux (Android Mobile)

### Step 1: Install Termux
Download **Termux** from [F-Droid](https://f-droid.org/en/packages/com.termux/) (not Play Store — Play Store version is outdated).

### Step 2: Setup Termux
```bash
pkg update && pkg upgrade -y
pkg install nodejs git -y
```

### Step 3: Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/nexus-cgt.git
cd nexus-cgt
```

### Step 4: Install dependencies
```bash
npm install
```

### Step 5: Configure environment
```bash
cp .env.example .env
nano .env
# Add your Supabase URL and key, then Ctrl+X to save
```

### Step 6: Run the platform
```bash
npm run dev
```

Open your phone browser and go to: **http://localhost:5173**

### Step 7: Build for production (optional)
```bash
npm run build
npm run preview
```

---

## GitHub Push (from Termux)

```bash
cd nexus-cgt
git init
git add .
git commit -m "Initial NEXUS CGT Platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nexus-cgt.git
git push -u origin main
```

### On subsequent changes:
```bash
git add .
git commit -m "Your update message"
git push
```

---

## Supabase Database Schema

Run this SQL in Supabase SQL Editor to set up all tables:

```sql
-- See src/lib/supabase.js for complete schema
-- Tables: projects, experiments, batches, qc_results, 
--         deviations, reagents, equipment, equipment_bookings,
--         documents, training_records
```

---

## Developed for
**Micro Crispr Pvt. Ltd.** — Vapi, Gujarat, India  
Cell & Gene Therapy QC2 Department  
CD19 CAR-T · BCMA CAR-T · Lentiviral Vector Programs

