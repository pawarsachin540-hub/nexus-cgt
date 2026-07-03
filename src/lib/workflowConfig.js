// ============================================================
// Equipment Lifecycle Workflow — configuration
// Encodes the SOP QA-SOP-006 / DQA-SOP-014 process
// ============================================================

// --- Procurement / CAPEX chain (ERP track) ---
export const PROCUREMENT_STEPS = [
  { order:1, step_name:'Availability Check',       role:'User',          desc:'User checks if equipment exists in ERP purchase list' },
  { order:2, step_name:'CAPEX Request to ERP',     role:'User',          desc:'If not in ERP, user requests CAPEX ID creation' },
  { order:3, step_name:'Manager / Senior Approval', role:'Manager',      desc:'Reporting manager / senior reviews & approves the need' },
  { order:4, step_name:'Purchase Review',          role:'Purchase',      desc:'Purchase dept reviews request & specifications' },
  { order:5, step_name:'Purchase Head Approval',   role:'Purchase Head', desc:'Sr. Purchase head approves' },
  { order:6, step_name:'Store Head Confirmation',  role:'Store Head',    desc:'Store head confirms & routes back to ERP' },
  { order:7, step_name:'CAPEX ID Assignment',      role:'ERP',           desc:'ERP assigns final CAPEX ID' },
  { order:8, step_name:'PR Raised',                role:'ERP',           desc:'Purchase Requisition (PR) raised in ERP' },
]

// --- QA Qualification document lifecycle (in sequence) ---
// Each has: type, label, number prefix, template ref, whether pre/post approval
export const QUALIFICATION_DOCS = [
  { type:'URS',            label:'User Requirement Specification', prefix:'URS',  template:'T/QA/SOP/006/01', numbered:true,  numberType:'URS' },
  { type:'IA',             label:'Impact Assessment',              prefix:'IA',   template:'T/QA/SOP/006/02', numbered:true,  numberType:'IA' },
  { type:'EquipmentID',    label:'Equipment ID Request',           prefix:'MIC',  template:'T/QA/SOP/006/08', numbered:true,  numberType:'EQID' },
  { type:'DQ',             label:'Design Qualification',           prefix:'DQ',   template:'T/QA/SOP/006/—',  numbered:false, note:'Required for customized equipment; waived for COTS' },
  { type:'FAT',            label:'Factory Acceptance Test',        prefix:'FAT',  template:'—',               numbered:false, note:'Applicable if customization done per URS' },
  { type:'SAT',            label:'Site Acceptance Test',           prefix:'SAT',  template:'—',               numbered:false, note:'On receipt of equipment at user site' },
  { type:'InstallChecklist', label:'Installation Checklist',       prefix:'IC',   template:'T/QA/SOP/006/13', numbered:false },
  { type:'IQ',             label:'Installation Qualification',     prefix:'IQ',   template:'T/QA/SOP/006/03', numbered:true,  numberType:'PQP', prePost:true },
  { type:'OQ',             label:'Operational Qualification',      prefix:'OQ',   template:'T/QA/SOP/006/04', numbered:true,  numberType:'PQP', prePost:true },
  { type:'PQ_Protocol',    label:'PQ Protocol',                    prefix:'PQP',  template:'T/QA/SOP/006/05', numbered:true,  numberType:'PQP', prePost:true },
  { type:'PQ_Report',      label:'PQ Report',                      prefix:'PQR',  template:'T/QA/SOP/006/06', numbered:true,  numberType:'PQR' },
  { type:'MasterList',     label:'Equipment Master List',          prefix:'EML',  template:'T/QA/SOP/006/12', numbered:false },
]

// Optional / on-demand docs
export const OPTIONAL_DOCS = [
  { type:'RQ_Protocol',  label:'Re-Qualification Protocol', prefix:'RQP', template:'T/QA/SOP/006/05', numberType:'RQP' },
  { type:'RQ_Report',    label:'Re-Qualification Report',   prefix:'RQR', template:'T/QA/SOP/006/06', numberType:'RQR' },
  { type:'Amendment',    label:'Protocol Amendment',        prefix:'AM',  template:'T/QA/SOP/006/07' },
  { type:'PrePostApproval', label:'Qual/Requal Pre-Post Approval', prefix:'PPA', template:'T/QA/SOP/006/10' },
]

// --- The universal signature/routing chain (from templates) ---
export const SIGNATURE_CHAIN = [
  { order:1, role_label:'Prepared',            actor:'User',      color:'#3B82F6' },
  { order:2, role_label:'Reviewed (User Dept)', actor:'User Dept', color:'#8B5CF6' },
  { order:3, role_label:'Reviewed (QA / CFT)',  actor:'QA',        color:'#F59E0B' },
  { order:4, role_label:'Approved (User HOD)',  actor:'User HOD',  color:'#10B981' },
  { order:5, role_label:'Authorized (QA Head)', actor:'QA Head',   color:'#EF4444' },
]

// Document numbering — generate next number given existing list
export function nextDocNumber(numberType, existingNumbers = []) {
  const prefixMap = {
    URS:'URS', IA:'IA', EQID:'MIC/QC2', PQP:'PQP', PQR:'PQR', RQP:'RQP', RQR:'RQR'
  }
  const p = prefixMap[numberType] || numberType
  const nums = existingNumbers
    .filter(n => n && n.startsWith(p))
    .map(n => parseInt(n.split('/').pop(), 10))
    .filter(n => !isNaN(n))
  const next = (nums.length ? Math.max(...nums) : 0) + 1
  const padded = String(next).padStart(4, '0')
  return numberType === 'EQID' ? `MIC/QC2/${padded}` : `${p}/${padded}`
}

export const STATUS_COLORS = {
  'Draft':'#9CA3AF', 'Pending':'#9CA3AF', 'In Progress':'#3B82F6',
  'Under Review':'#F59E0B', 'Reviewed':'#8B5CF6', 'Approved':'#10B981',
  'Authorized':'#059669', 'Effective':'#059669', 'Signed':'#10B981',
  'Rejected':'#EF4444', 'On Hold':'#F59E0B', 'Completed':'#059669', 'Active':'#3B82F6', 'Skipped':'#D1D5DB'
}
