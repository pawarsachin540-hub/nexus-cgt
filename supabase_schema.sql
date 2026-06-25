-- ============================================================
-- NEXUS CGT Platform — Supabase Database Schema
-- Run this entire file in: Supabase > SQL Editor > New Query
-- ============================================================

CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('AAV','LV','CART','Plasmid','CRISPR','mRNA','StemCell')),
  stage TEXT DEFAULT 'R&D',
  status TEXT DEFAULT 'Active',
  owner TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS experiments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  exp_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'General',
  status TEXT DEFAULT 'Draft',
  scientist TEXT,
  objective TEXT,
  hypothesis TEXT,
  doe_type TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_number TEXT UNIQUE NOT NULL,
  project_id UUID REFERENCES projects(id),
  product_type TEXT NOT NULL,
  stage TEXT DEFAULT 'Manufacturing',
  status TEXT DEFAULT 'In Progress',
  operator TEXT,
  start_date DATE,
  release_date DATE,
  yield_value NUMERIC,
  yield_unit TEXT DEFAULT 'vg/mL',
  viability NUMERIC,
  vcn NUMERIC,
  car_expression NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS qc_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id TEXT,
  test_name TEXT NOT NULL,
  method TEXT,
  result_value TEXT,
  unit TEXT,
  specification TEXT,
  status TEXT CHECK (status IN ('Pass','Fail','Pending','In Progress')),
  analyst TEXT,
  tested_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deviations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id TEXT,
  dev_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT CHECK (severity IN ('Minor','Major','Critical')),
  status TEXT DEFAULT 'Open',
  owner TEXT,
  root_cause TEXT,
  capa TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reagents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  catalog_number TEXT,
  supplier TEXT,
  lot_number TEXT,
  quantity NUMERIC,
  unit TEXT,
  location TEXT,
  expiry_date DATE,
  status TEXT DEFAULT 'Available',
  critical_material BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equipment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  equipment_id TEXT UNIQUE NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'Available',
  last_pm DATE,
  next_pm DATE,
  qualification_status TEXT DEFAULT 'Qualified',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equipment_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id TEXT NOT NULL,
  booked_by TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  purpose TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doc_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('SOP','WI','Protocol','Report','Specification','Other')),
  version TEXT DEFAULT 'v1.0',
  status TEXT DEFAULT 'Draft',
  owner TEXT,
  effective_date DATE,
  review_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_name TEXT NOT NULL,
  department TEXT,
  doc_id TEXT,
  training_date DATE,
  expiry_date DATE,
  status TEXT DEFAULT 'Current',
  trainer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE qc_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE deviations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reagents ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON projects FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow all" ON experiments FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow all" ON batches FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow all" ON qc_results FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow all" ON deviations FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow all" ON reagents FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow all" ON equipment FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow all" ON equipment_bookings FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow all" ON documents FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow all" ON training_records FOR ALL USING (TRUE) WITH CHECK (TRUE);

SELECT 'NEXUS CGT Schema created successfully!' AS result;
