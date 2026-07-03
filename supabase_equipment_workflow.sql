-- ============================================================
-- NEXUS CGT — Equipment Lifecycle Workflow Module
-- Run this in Supabase > SQL Editor (in addition to base schema)
-- Covers: Procurement (CAPEX/ERP) + QA Qualification (URS→IA→IQ→OQ→PQ)
-- with Prepared/Reviewed/Approved/Authorized routing & live status
-- ============================================================

-- Master equipment request record (the "case file" that ties everything)
CREATE TABLE IF NOT EXISTS eq_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_no TEXT UNIQUE NOT NULL,              -- e.g. EQR-2026-001
  equipment_name TEXT NOT NULL,
  make_model TEXT,
  serial_number TEXT,
  department TEXT,
  requested_by TEXT NOT NULL,
  justification TEXT,
  in_erp BOOLEAN DEFAULT FALSE,                 -- already in ERP purchase list?
  capex_id TEXT,                                -- assigned once ERP raises it
  pr_number TEXT,                               -- purchase requisition no.
  impact_category TEXT,                         -- Direct / Indirect / No Impact
  equipment_id TEXT,                            -- MIC/DEP/0001 once QA assigns
  current_phase TEXT DEFAULT 'Procurement Request', 
  overall_status TEXT DEFAULT 'Active',         -- Active / On Hold / Completed / Rejected
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Procurement approval chain (ERP / CAPEX track)
CREATE TABLE IF NOT EXISTS eq_procurement_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES eq_requests(id) ON DELETE CASCADE,
  step_order INT NOT NULL,
  step_name TEXT NOT NULL,        -- 'Availability Check','Manager Approval','Purchase Review','Purchase Head Approval','Store Head','CAPEX ID','PR Raised'
  role TEXT NOT NULL,             -- who acts: User / Manager / Purchase / Purchase Head / Store Head / ERP
  assignee TEXT,
  status TEXT DEFAULT 'Pending',  -- Pending / In Progress / Approved / Rejected / Skipped
  comments TEXT,
  acted_by TEXT,
  acted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Qualification documents (URS, IA, DQ, IQ, OQ, PQ, RQ, Amendment, Master List, etc.)
CREATE TABLE IF NOT EXISTS eq_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES eq_requests(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,         -- URS / IA / EquipmentID / DQ / FAT / SAT / IQ / OQ / PQ_Protocol / PQ_Report / RQ_Protocol / RQ_Report / Amendment / InstallChecklist / MasterList / PrePostApproval
  doc_number TEXT,                -- URS/0001, IA/0001, PQP/0001, PQR/0001, MIC/DEP/0001 ...
  template_ref TEXT,              -- T/QA/SOP/006/01 etc.
  title TEXT,
  content JSONB DEFAULT '{}',     -- filled form fields
  status TEXT DEFAULT 'Draft',    -- Draft / Under Review / Reviewed / Approved / Authorized / Effective / Rejected
  current_stage TEXT DEFAULT 'Prepared',  -- Prepared / Reviewed-User / Reviewed-QA / Approved / Authorized
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Signature / routing chain for each document (Prepared→Reviewed→Approved→Authorized)
CREATE TABLE IF NOT EXISTS eq_doc_signatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES eq_documents(id) ON DELETE CASCADE,
  role_label TEXT NOT NULL,       -- 'Prepared','Reviewed (User)','Reviewed (QA/CFT)','Approved (User HOD)','Authorized (QA Head)'
  step_order INT NOT NULL,
  assignee TEXT,
  name TEXT,
  designation TEXT,
  department TEXT,
  status TEXT DEFAULT 'Pending',  -- Pending / Signed / Rejected
  comments TEXT,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Numbering registers (QA issues numbers) — mirrors F/QA/SOP/001/02 & 006/02,03
CREATE TABLE IF NOT EXISTS eq_number_register (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doc_type TEXT NOT NULL,         -- URS / IA / EQID / PQP / PQR / RQP / RQR
  number_issued TEXT NOT NULL,
  request_id UUID REFERENCES eq_requests(id),
  issued_by TEXT,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity / audit feed (live status "who did what")
CREATE TABLE IF NOT EXISTS eq_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES eq_requests(id) ON DELETE CASCADE,
  actor TEXT,
  action TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE eq_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE eq_procurement_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE eq_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE eq_doc_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE eq_number_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE eq_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON eq_requests FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow all" ON eq_procurement_steps FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow all" ON eq_documents FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow all" ON eq_doc_signatures FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow all" ON eq_number_register FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow all" ON eq_activity_log FOR ALL USING (TRUE) WITH CHECK (TRUE);

SELECT 'Equipment Workflow schema created successfully!' AS result;
