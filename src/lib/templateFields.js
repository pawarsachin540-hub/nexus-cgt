// ============================================================
// Online form field definitions for each qualification template
// Derived from QA-SOP-006 / DQA-SOP-014 template structures
// ============================================================

export const TEMPLATE_FIELDS = {
  URS: [
    { section:'1. Generic Name & Description', fields:[
      { key:'generic_name', label:'Generic Name', type:'text' },
      { key:'description', label:'Equipment / System Description & Intended Use', type:'textarea' },
    ]},
    { section:'2. General & Technical Requirements', fields:[
      { key:'general_req', label:'General Requirements', type:'textarea' },
      { key:'technical_req', label:'Technical Requirements', type:'textarea' },
      { key:'operating_range', label:'Operating Range / Capacity', type:'text' },
      { key:'utilities', label:'Utilities Required (power, gas, water)', type:'text' },
    ]},
    { section:'3. Qualification Requirements', fields:[
      { key:'qual_req', label:'Qualification Requirements (DQ/IQ/OQ/PQ)', type:'textarea' },
    ]},
    { section:'4. Documentation & Safety', fields:[
      { key:'doc_req', label:'Documentation Requirements', type:'textarea' },
      { key:'safety_req', label:'Safety, Health & Environmental Requirements', type:'textarea' },
      { key:'training_req', label:'Training Requirements', type:'textarea' },
    ]},
  ],

  IA: [
    { section:'Equipment Details', fields:[
      { key:'equipment_name', label:'Equipment Name', type:'text' },
      { key:'ref_urs', label:'Reference URS No.', type:'text' },
    ]},
    { section:'Impact Assessment', fields:[
      { key:'q1', label:'Direct contact with product (air quality, MOC)?', type:'select', options:['Yes','No'] },
      { key:'q2', label:'Provides material/ingredient with direct product contact?', type:'select', options:['Yes','No'] },
      { key:'q3', label:'Used for cleaning/sterilization/de-pyrogenation?', type:'select', options:['Yes','No'] },
      { key:'q4', label:'Preserves product status (temp/humidity as CPP)?', type:'select', options:['Yes','No'] },
      { key:'q5', label:'Produces/monitors/stores data to accept/reject product?', type:'select', options:['Yes','No'] },
      { key:'q6', label:'Process control system (PLC/DCS/SCADA)?', type:'select', options:['Yes','No'] },
      { key:'q7', label:'Provides product identification info (lot/expiry)?', type:'select', options:['Yes','No'] },
    ]},
    { section:'Categorization', fields:[
      { key:'impact', label:'Impact Status', type:'select', options:['Direct Impact','Indirect Impact','No Impact'] },
      { key:'impact_justification', label:'Intended use & impact on product quality / patient safety', type:'textarea' },
      { key:'remarks', label:'Remarks, if any', type:'textarea' },
    ]},
  ],

  EquipmentID: [
    { section:'Equipment ID Request', fields:[
      { key:'equipment_name', label:'Equipment Name', type:'text' },
      { key:'component_details', label:'Component details (if any)', type:'text' },
      { key:'ref_urs', label:'Ref URS No.', type:'text' },
      { key:'ref_ia', label:'Ref IA No.', type:'text' },
      { key:'equipment_category', label:'Equipment Category', type:'select', options:['Major Equipment','Minor Equipment','Instrument','Utility'] },
      { key:'make_model', label:'Make & Model', type:'text' },
      { key:'serial_number', label:'Serial Number', type:'text' },
      { key:'remarks', label:'Remarks, if any', type:'text' },
    ]},
  ],

  DQ: [
    { section:'Design Qualification', fields:[
      { key:'design_spec', label:'Design Specifications (vendor)', type:'textarea' },
      { key:'urs_match', label:'URS Requirement Matching Verification', type:'textarea' },
      { key:'cots_waiver', label:'COTS Waiver Applicable?', type:'select', options:['Yes - DQ Waived (COTS)','No - DQ Required (Customized)'] },
    ]},
  ],

  FAT: [
    { section:'Factory Acceptance Test', fields:[
      { key:'vendor_site', label:'Vendor Site / Location', type:'text' },
      { key:'fat_date', label:'FAT Date', type:'text' },
      { key:'fat_results', label:'FAT Results & Observations', type:'textarea' },
      { key:'fat_outcome', label:'Outcome', type:'select', options:['Satisfactory','Not Satisfactory'] },
    ]},
  ],

  SAT: [
    { section:'Site Acceptance Test', fields:[
      { key:'receipt_date', label:'Equipment Receipt Date at Site', type:'text' },
      { key:'physical_verification', label:'Physical Verification Observations', type:'textarea' },
      { key:'tests_performed', label:'Tests Performed (in-house/vendor)', type:'textarea' },
      { key:'sat_outcome', label:'Outcome', type:'select', options:['Satisfactory','Not Satisfactory'] },
    ]},
  ],

  InstallChecklist: [
    { section:'Installation Details', fields:[
      { key:'install_location', label:'Location of Installation', type:'text' },
      { key:'install_date', label:'Date of Installation', type:'text' },
    ]},
    { section:'Checkpoints (Ok / Not Ok / NA)', fields:[
      { key:'chk_condition', label:'Equipment condition (Damaged/Undamaged)', type:'select', options:['Ok','Not Ok','NA'] },
      { key:'chk_components', label:'Main components installed (sensor, PLC, HMI, filters)', type:'select', options:['Ok','Not Ok','NA'] },
      { key:'chk_screws', label:'All screw connections tight', type:'select', options:['Ok','Not Ok','NA'] },
      { key:'chk_panel', label:'Control panel secured properly', type:'select', options:['Ok','Not Ok','NA'] },
      { key:'chk_power', label:'Equipment powers up on "On"', type:'select', options:['Ok','Not Ok','NA'] },
    ]},
  ],

  IQ: [
    { section:'IQ — Pre-Approval', fields:[
      { key:'protocol_no', label:'Protocol cum Report No.', type:'text' },
      { key:'iq_scope', label:'Scope of Installation Qualification', type:'textarea' },
    ]},
    { section:'IQ Verification', fields:[
      { key:'iq_utilities', label:'Utility connections verified', type:'select', options:['Complies','Does Not Comply'] },
      { key:'iq_documents', label:'Vendor documents / manuals available', type:'select', options:['Complies','Does Not Comply'] },
      { key:'iq_components', label:'Component checklist verified', type:'select', options:['Complies','Does Not Comply'] },
      { key:'iq_observations', label:'Observations', type:'textarea' },
      { key:'iq_completion', label:'IQ Completion Date', type:'text' },
    ]},
  ],

  OQ: [
    { section:'OQ — Pre-Approval', fields:[
      { key:'protocol_no', label:'Protocol cum Report No.', type:'text' },
      { key:'oq_scope', label:'Scope of Operational Qualification', type:'textarea' },
    ]},
    { section:'OQ Tests', fields:[
      { key:'oq_functional', label:'Functional / operational tests', type:'textarea' },
      { key:'oq_alarms', label:'Alarms & safety interlocks verified', type:'select', options:['Complies','Does Not Comply'] },
      { key:'oq_range', label:'Operating range challenge results', type:'textarea' },
      { key:'oq_completion', label:'OQ Completion Date', type:'text' },
    ]},
  ],

  PQ_Protocol: [
    { section:'PQ Protocol — Pre-Approval', fields:[
      { key:'protocol_no', label:'PQ Protocol No.', type:'text' },
      { key:'pq_objective', label:'Objective', type:'textarea' },
      { key:'pq_acceptance', label:'Acceptance Criteria', type:'textarea' },
      { key:'pq_test_runs', label:'Number of Performance Runs', type:'text' },
    ]},
  ],

  PQ_Report: [
    { section:'PQ Report — Post-Activity', fields:[
      { key:'report_no', label:'PQ Report No.', type:'text' },
      { key:'pq_results', label:'Performance Results', type:'textarea' },
      { key:'pq_deviation', label:'Deviations, if any', type:'textarea' },
      { key:'pq_conclusion', label:'Conclusion', type:'select', options:['Qualified','Not Qualified'] },
      { key:'pq_completion', label:'PQ Completion Date', type:'text' },
    ]},
  ],

  MasterList: [
    { section:'Equipment Master List Entry', fields:[
      { key:'ml_impact', label:'Impact Category', type:'select', options:['Direct Impact','Indirect Impact','No Impact'] },
      { key:'ml_urs', label:'URS (Yes/No)', type:'select', options:['Yes','No'] },
      { key:'ml_iq_date', label:'IQ Approval Date', type:'text' },
      { key:'ml_oq_date', label:'OQ Approval Date', type:'text' },
      { key:'ml_pq_date', label:'PQ Approval Date', type:'text' },
      { key:'ml_remarks', label:'Remarks', type:'text' },
    ]},
  ],

  RQ_Protocol: [
    { section:'Re-Qualification Protocol', fields:[
      { key:'protocol_no', label:'RQ Protocol No.', type:'text' },
      { key:'rq_reason', label:'Reason for Re-Qualification', type:'textarea' },
      { key:'rq_scope', label:'Scope', type:'textarea' },
    ]},
  ],
  RQ_Report: [
    { section:'Re-Qualification Report', fields:[
      { key:'report_no', label:'RQ Report No.', type:'text' },
      { key:'rq_results', label:'Results', type:'textarea' },
      { key:'rq_conclusion', label:'Conclusion', type:'select', options:['Qualified','Not Qualified'] },
    ]},
  ],
  Amendment: [
    { section:'Protocol Amendment', fields:[
      { key:'amendment_no', label:'Amendment No. (max 3)', type:'select', options:['AM01','AM02','AM03'] },
      { key:'original_doc', label:'Original Document No.', type:'text' },
      { key:'amendment_desc', label:'Description of Amendment', type:'textarea' },
      { key:'amendment_reason', label:'Reason', type:'textarea' },
    ]},
  ],
  PrePostApproval: [
    { section:'Qualification / Requalification Pre-Post Approval', fields:[
      { key:'qual_type', label:'Qualification Type', type:'select', options:['IQ','OQ','PQ','Re-Qualification'] },
      { key:'frequency', label:'Frequency', type:'text' },
      { key:'iq_date', label:'IQ Completion Date', type:'text' },
      { key:'oq_date', label:'OQ Completion Date', type:'text' },
      { key:'pq_date', label:'PQ Completion Date', type:'text' },
      { key:'cfr_compliance', label:'21 CFR Compliance', type:'select', options:['Applicable','Not Applicable'] },
    ]},
  ],

  GENERIC: [
    { section:'Document Content', fields:[
      { key:'content', label:'Details', type:'textarea' },
      { key:'remarks', label:'Remarks', type:'textarea' },
    ]},
  ],
}
