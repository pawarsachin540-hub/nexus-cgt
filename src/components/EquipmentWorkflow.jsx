import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  PROCUREMENT_STEPS, QUALIFICATION_DOCS, OPTIONAL_DOCS,
  SIGNATURE_CHAIN, nextDocNumber, STATUS_COLORS
} from '../lib/workflowConfig'
import DocumentForm from './DocumentForm'

// ---------- Demo seed data (used when Supabase empty) ----------
const DEMO_REQUESTS = [
  {
    id:'demo-1', request_no:'EQR-2026-001', equipment_name:'QuantStudio 5 Real-Time PCR System',
    make_model:'Applied Biosystems QS5', serial_number:'QS5-2026-0087', department:'QC2',
    requested_by:'Sachin Pawar', justification:'VCN & RCL dPCR/qPCR testing for CD19/BCMA CAR-T batch release',
    in_erp:false, capex_id:'CAPEX-2026-014', pr_number:'PR-2026-0231',
    impact_category:'Direct Impact', equipment_id:'MIC/QC2/0019',
    current_phase:'Qualification — IQ/OQ', overall_status:'Active', created_at:'2026-06-10'
  },
  {
    id:'demo-2', request_no:'EQR-2026-002', equipment_name:'QIAgility Automated PCR Setup',
    make_model:'QIAGEN QIAgility', serial_number:'QIAG-2026-0043', department:'QC2',
    requested_by:'Sachin Pawar', justification:'Automated PCR reaction setup for dPCR workflows',
    in_erp:true, capex_id:'CAPEX-2026-009', pr_number:'PR-2026-0198',
    impact_category:'Indirect Impact', equipment_id:'MIC/QC2/0020',
    current_phase:'Procurement — Purchase Review', overall_status:'Active', created_at:'2026-06-20'
  },
]

export default function EquipmentWorkflow() {
  const [requests, setRequests] = useState(DEMO_REQUESTS)
  const [selected, setSelected] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [tab, setTab] = useState('procurement')
  const [activeDoc, setActiveDoc] = useState(null)
  const [form, setForm] = useState({
    equipment_name:'', make_model:'', serial_number:'', department:'QC2',
    requested_by:'Sachin Pawar', justification:'', in_erp:false
  })

  useEffect(() => {
    supabase.from('eq_requests').select('*').order('created_at',{ascending:false}).then(({ data }) => {
      if (data && data.length > 0) setRequests(data)
    })
  }, [])

  // ---- Create a new equipment request (initiates procurement) ----
  const createRequest = async () => {
    const request_no = `EQR-2026-${String(requests.length + 1).padStart(3,'0')}`
    const payload = {
      ...form, request_no,
      current_phase: form.in_erp ? 'Procurement — Purchase Review' : 'Procurement — CAPEX Request',
      overall_status:'Active'
    }
    const { data } = await supabase.from('eq_requests').insert([payload]).select()
    const nr = data?.[0] || { ...payload, id:`local-${Date.now()}` }
    setRequests(prev => [nr, ...prev])
    // seed procurement steps
    const steps = PROCUREMENT_STEPS.map(s => ({
      request_id: nr.id, step_order:s.order, step_name:s.step_name, role:s.role,
      status: s.order===1 ? 'In Progress' : 'Pending'
    }))
    await supabase.from('eq_procurement_steps').insert(steps)
    await supabase.from('eq_activity_log').insert([{
      request_id: nr.id, actor: form.requested_by, action:'Request Created',
      detail:`New equipment request ${request_no} for ${form.equipment_name}`
    }])
    setShowNew(false)
    setSelected(nr)
    setForm({ equipment_name:'', make_model:'', serial_number:'', department:'QC2', requested_by:'Sachin Pawar', justification:'', in_erp:false })
  }

  const phaseColor = (p) => {
    if (p?.includes('Qualification')) return '#8B5CF6'
    if (p?.includes('Procurement')) return '#F59E0B'
    if (p?.includes('Complete')) return '#10B981'
    return '#3B82F6'
  }

  // ============ Detail view ============
  if (selected) {
    return (
      <RequestDetail
        request={selected}
        onBack={() => { setSelected(null); setActiveDoc(null) }}
        tab={tab} setTab={setTab}
        activeDoc={activeDoc} setActiveDoc={setActiveDoc}
      />
    )
  }

  // ============ List view ============
  return (
    <div>
      <div className="page-title">Equipment Lifecycle Workflow</div>
      <div className="page-sub">Procurement (CAPEX/ERP) → Qualification (URS·IA·IQ·OQ·PQ) — online prepare · review · approve · authorize · print · per QA-SOP-006 / DQA-SOP-014</div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <span className="kpi-badge badge-info">{requests.filter(r=>r.overall_status==='Active').length} Active</span>
          <span className="kpi-badge badge-success">{requests.filter(r=>r.overall_status==='Completed').length} Completed</span>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>+ New Equipment Request</button>
      </div>

      {/* Process overview banner */}
      <div className="card mb-4" style={{background:'linear-gradient(135deg,#0F2044,#1A3A6B)',color:'#fff',border:'none'}}>
        <div style={{fontWeight:700,fontSize:14,marginBottom:12}}>End-to-End Process Flow</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:8,alignItems:'center',fontSize:11}}>
          {['Request','Availability Check','CAPEX ID','Manager','Purchase','Store Head','PR Raised','URS','Impact Assessment','Equipment ID','DQ/FAT/SAT','IQ','OQ','PQ','Master List'].map((s,i,arr) => (
            <span key={i} style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{background:'rgba(255,255,255,0.12)',padding:'4px 10px',borderRadius:6,whiteSpace:'nowrap',
                border: i>=7?'1px solid rgba(139,92,246,0.6)':'1px solid rgba(245,158,11,0.5)'}}>{s}</span>
              {i<arr.length-1 && <span style={{opacity:0.4}}>→</span>}
            </span>
          ))}
        </div>
        <div style={{fontSize:10,marginTop:10,opacity:0.7}}>
          🟠 Procurement track (ERP/CAPEX) &nbsp;·&nbsp; 🟣 QA Qualification track &nbsp;·&nbsp; Every document: Prepared → Reviewed (User) → Reviewed (QA) → Approved (HOD) → Authorized (QA Head)
        </div>
      </div>

      {/* Request cards */}
      <div className="grid-2">
        {requests.map(r => (
          <div key={r.id} className="card" style={{cursor:'pointer'}} onClick={() => setSelected(r)}>
            <div className="flex items-center justify-between mb-2">
              <span style={{fontWeight:700,color:'#2563EB',fontSize:12}}>{r.request_no}</span>
              <span className="kpi-badge" style={{background:'#F3F4F6',color:phaseColor(r.current_phase)}}>{r.overall_status}</span>
            </div>
            <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>{r.equipment_name}</div>
            <div style={{fontSize:12,color:'var(--text-2)',marginBottom:10}}>{r.make_model} · {r.department}</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:10}}>
              {r.equipment_id && <span className="chip chip-cart">{r.equipment_id}</span>}
              {r.capex_id && <span className="chip chip-crispr">{r.capex_id}</span>}
              {r.impact_category && <span className="chip chip-aav">{r.impact_category}</span>}
            </div>
            <div style={{padding:'8px 10px',background:'#F9FAFB',borderRadius:6,borderLeft:`3px solid ${phaseColor(r.current_phase)}`}}>
              <div style={{fontSize:10,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'0.05em'}}>Current Phase</div>
              <div style={{fontSize:13,fontWeight:600}}>{r.current_phase}</div>
            </div>
          </div>
        ))}
      </div>

      {showNew && (
        <div className="modal-bg" onClick={() => setShowNew(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">New Equipment Request</div>
              <button className="modal-close" onClick={() => setShowNew(false)}>×</button>
            </div>
            <div className="form-group">
              <label className="form-label">Equipment Name</label>
              <input className="form-input" value={form.equipment_name} onChange={e => setForm({...form, equipment_name:e.target.value})} placeholder="e.g. QuantStudio 5 Real-Time PCR"/>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Make & Model</label>
                <input className="form-input" value={form.make_model} onChange={e => setForm({...form, make_model:e.target.value})}/>
              </div>
              <div className="form-group">
                <label className="form-label">Serial Number</label>
                <input className="form-input" value={form.serial_number} onChange={e => setForm({...form, serial_number:e.target.value})}/>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Department</label>
                <input className="form-input" value={form.department} onChange={e => setForm({...form, department:e.target.value})}/>
              </div>
              <div className="form-group">
                <label className="form-label">Requested By</label>
                <input className="form-input" value={form.requested_by} onChange={e => setForm({...form, requested_by:e.target.value})}/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Justification / Intended Use</label>
              <textarea className="form-textarea" value={form.justification} onChange={e => setForm({...form, justification:e.target.value})}/>
            </div>
            <div className="form-group">
              <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
                <input type="checkbox" checked={form.in_erp} onChange={e => setForm({...form, in_erp:e.target.checked})}/>
                <span className="form-label" style={{margin:0}}>Equipment already exists in ERP purchase list</span>
              </label>
              <div style={{fontSize:11,color:'var(--text-2)',marginTop:4}}>
                {form.in_erp ? 'Will skip CAPEX creation → route directly to Purchase Review' : 'Will route to ERP for CAPEX ID creation first'}
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="btn btn-primary" onClick={createRequest} disabled={!form.equipment_name}>Initiate Request</button>
              <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ==================================================================
// REQUEST DETAIL — procurement chain + qualification docs + activity
// ==================================================================
function RequestDetail({ request, onBack, tab, setTab, activeDoc, setActiveDoc }) {
  const [procSteps, setProcSteps] = useState([])
  const [docs, setDocs] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAll()
  }, [request.id])

  async function loadAll() {
    setLoading(true)
    const [{ data:ps }, { data:dc }, { data:al }] = await Promise.all([
      supabase.from('eq_procurement_steps').select('*').eq('request_id', request.id).order('step_order'),
      supabase.from('eq_documents').select('*').eq('request_id', request.id).order('created_at'),
      supabase.from('eq_activity_log').select('*').eq('request_id', request.id).order('created_at',{ascending:false}),
    ])
    // fall back to demo seeds if empty
    setProcSteps(ps && ps.length ? ps : seedProcSteps(request))
    setDocs(dc && dc.length ? dc : seedDocs(request))
    setActivity(al && al.length ? al : seedActivity(request))
    setLoading(false)
  }

  if (activeDoc) {
    return <DocumentForm doc={activeDoc} request={request} onBack={() => { setActiveDoc(null); loadAll() }} />
  }

  return (
    <div>
      <button className="btn btn-secondary btn-sm mb-4" onClick={onBack}>← Back to all requests</button>

      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="page-title" style={{marginBottom:2}}>{request.equipment_name}</div>
          <div style={{fontSize:12,color:'var(--text-2)'}}>{request.request_no} · {request.make_model} · {request.department}</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          {request.equipment_id && <span className="chip chip-cart">{request.equipment_id}</span>}
          {request.capex_id && <span className="chip chip-crispr">{request.capex_id}</span>}
        </div>
      </div>

      <div className="flex gap-2 mb-4" style={{borderBottom:'1px solid var(--border)',paddingBottom:0}}>
        {[
          {k:'procurement',l:'🟠 Procurement Chain'},
          {k:'qualification',l:'🟣 QA Qualification'},
          {k:'activity',l:'📋 Live Activity'},
        ].map(t => (
          <button key={t.k}
            onClick={() => setTab(t.k)}
            style={{
              padding:'10px 16px', border:'none', background:'none', cursor:'pointer',
              fontSize:13, fontWeight:600,
              color: tab===t.k ? '#2563EB' : 'var(--text-2)',
              borderBottom: tab===t.k ? '2px solid #2563EB' : '2px solid transparent',
            }}>{t.l}</button>
        ))}
      </div>

      {loading ? <div className="card">Loading workflow…</div> : (
        <>
          {tab==='procurement' && <ProcurementChain request={request} steps={procSteps} reload={loadAll}/>}
          {tab==='qualification' && <QualificationTrack request={request} docs={docs} onOpenDoc={setActiveDoc} reload={loadAll}/>}
          {tab==='activity' && <ActivityFeed activity={activity}/>}
        </>
      )}
    </div>
  )
}

// ---------------- Procurement chain ----------------
function ProcurementChain({ request, steps, reload }) {
  const [actioning, setActioning] = useState(null)
  const [comment, setComment] = useState('')

  const act = async (step, decision) => {
    const patch = { status: decision, comments: comment, acted_by:'Sachin Pawar', acted_at: new Date().toISOString() }
    await supabase.from('eq_procurement_steps').update(patch).eq('id', step.id)
    // advance next step
    const next = steps.find(s => s.step_order === step.step_order + 1)
    if (next && decision==='Approved') {
      await supabase.from('eq_procurement_steps').update({ status:'In Progress' }).eq('id', next.id)
    }
    await supabase.from('eq_activity_log').insert([{
      request_id: request.id, actor:'Sachin Pawar',
      action:`Procurement: ${step.step_name} ${decision}`, detail: comment
    }])
    setActioning(null); setComment(''); reload()
  }

  return (
    <div className="card">
      <div className="alert alert-warn mb-4">
        Procurement / CAPEX track — each step routes to the next role only after approval. Live status shown below.
      </div>
      <div style={{position:'relative'}}>
        {steps.map((s,i) => {
          const done = s.status==='Approved'
          const active = s.status==='In Progress'
          const rejected = s.status==='Rejected'
          const color = done?'#10B981':active?'#3B82F6':rejected?'#EF4444':'#D1D5DB'
          return (
            <div key={s.id||i} style={{display:'flex',gap:14,paddingBottom:i<steps.length-1?18:0,position:'relative'}}>
              {/* vertical line */}
              {i<steps.length-1 && <div style={{position:'absolute',left:15,top:32,bottom:0,width:2,background:done?'#10B981':'#E5E7EB'}}/>}
              <div style={{width:32,height:32,borderRadius:'50%',background:color,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13,flexShrink:0,zIndex:1}}>
                {done?'✓':s.step_order}
              </div>
              <div style={{flex:1,background: active?'#EFF6FF':'#F9FAFB',borderRadius:8,padding:'10px 14px',border: active?'1px solid #93C5FD':'1px solid var(--border)'}}>
                <div className="flex items-center justify-between">
                  <div>
                    <div style={{fontWeight:600,fontSize:13}}>{s.step_name}</div>
                    <div style={{fontSize:11,color:'var(--text-2)'}}>Role: {s.role}{s.acted_by?` · by ${s.acted_by}`:''}</div>
                  </div>
                  <span className="kpi-badge" style={{background:`${color}22`,color}}>{s.status}</span>
                </div>
                {s.comments && <div style={{fontSize:11,marginTop:6,padding:'4px 8px',background:'#fff',borderRadius:4,color:'var(--text-2)'}}>💬 {s.comments}</div>}
                {active && (
                  actioning===s.id ? (
                    <div style={{marginTop:8}}>
                      <textarea className="form-textarea" style={{minHeight:50}} placeholder="Add comment…" value={comment} onChange={e=>setComment(e.target.value)}/>
                      <div className="flex gap-2 mt-4">
                        <button className="btn btn-success btn-sm" onClick={()=>act(s,'Approved')}>Approve →</button>
                        <button className="btn btn-danger btn-sm" onClick={()=>act(s,'Rejected')}>Reject</button>
                        <button className="btn btn-secondary btn-sm" onClick={()=>{setActioning(null);setComment('')}}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn btn-primary btn-sm" style={{marginTop:8}} onClick={()=>setActioning(s.id)}>Take Action</button>
                  )
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------- Qualification track ----------------
function QualificationTrack({ request, docs, onOpenDoc, reload }) {
  const createDoc = async (cfg) => {
    // determine number
    let doc_number = cfg.prefix
    if (cfg.numbered) {
      const { data:reg } = await supabase.from('eq_number_register').select('number_issued').eq('doc_type', cfg.numberType)
      const existing = (reg||[]).map(r=>r.number_issued)
      doc_number = nextDocNumber(cfg.numberType, existing)
      await supabase.from('eq_number_register').insert([{ doc_type:cfg.numberType, number_issued:doc_number, request_id:request.id, issued_by:'QA' }])
    }
    const payload = {
      request_id:request.id, doc_type:cfg.type, doc_number, template_ref:cfg.template,
      title:cfg.label, status:'Draft', current_stage:'Prepared', content:{}
    }
    const { data } = await supabase.from('eq_documents').insert([payload]).select()
    const nd = data?.[0] || { ...payload, id:`local-${Date.now()}` }
    // seed signature chain
    const sigs = SIGNATURE_CHAIN.map(s => ({
      document_id: nd.id, role_label:s.role_label, step_order:s.order,
      status: s.order===1 ? 'Pending' : 'Pending'
    }))
    await supabase.from('eq_doc_signatures').insert(sigs)
    await supabase.from('eq_activity_log').insert([{
      request_id:request.id, actor:'Sachin Pawar', action:`Document initiated: ${cfg.label}`, detail:`${doc_number}`
    }])
    reload()
    onOpenDoc(nd)
  }

  const docByType = (type) => docs.find(d => d.doc_type === type)

  return (
    <div>
      <div className="alert alert-info mb-4">
        QA Qualification track — documents issued & filled online. Each follows Prepared → Reviewed (User) → Reviewed (QA) → Approved (HOD) → Authorized (QA Head). Finalized copies can be printed.
      </div>

      <div className="card" style={{padding:0,overflow:'hidden'}}>
        <table className="data-table">
          <thead>
            <tr><th>#</th><th>Document</th><th>Doc No.</th><th>Template</th><th>Status</th><th>Stage</th><th>Action</th></tr>
          </thead>
          <tbody>
            {QUALIFICATION_DOCS.map((cfg,i) => {
              const existing = docByType(cfg.type)
              return (
                <tr key={cfg.type}>
                  <td style={{fontWeight:700,color:'var(--text-2)'}}>{i+1}</td>
                  <td>
                    <div style={{fontWeight:600,fontSize:13}}>{cfg.label}</div>
                    {cfg.note && <div style={{fontSize:10,color:'var(--text-2)'}}>{cfg.note}</div>}
                  </td>
                  <td style={{fontSize:12,fontWeight:600,color:'#2563EB'}}>{existing?.doc_number || (cfg.numbered?'— pending —':'N/A')}</td>
                  <td style={{fontSize:11,color:'var(--text-2)'}}>{cfg.template}</td>
                  <td>
                    {existing
                      ? <span className="kpi-badge" style={{background:`${STATUS_COLORS[existing.status]||'#9CA3AF'}22`,color:STATUS_COLORS[existing.status]||'#9CA3AF'}}>{existing.status}</span>
                      : <span className="kpi-badge badge-gray">Not started</span>}
                  </td>
                  <td style={{fontSize:11}}>{existing?.current_stage || '—'}</td>
                  <td>
                    {existing
                      ? <button className="btn btn-secondary btn-sm" onClick={()=>onOpenDoc(existing)}>Open →</button>
                      : <button className="btn btn-primary btn-sm" onClick={()=>createDoc(cfg)}>Initiate</button>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="section-title mt-4" style={{marginTop:20}}>Optional / On-Demand Documents</div>
      <div className="grid-4">
        {OPTIONAL_DOCS.map(cfg => (
          <div key={cfg.type} className="card card-sm flex items-center justify-between">
            <div>
              <div style={{fontWeight:600,fontSize:12}}>{cfg.label}</div>
              <div style={{fontSize:10,color:'var(--text-2)'}}>{cfg.template}</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={()=>createDoc(cfg)}>+</button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------- Activity feed ----------------
function ActivityFeed({ activity }) {
  return (
    <div className="card">
      <div className="section-title">Live Activity & Audit Trail</div>
      <div className="alert alert-success mb-4">21 CFR Part 11 style — every prepare/review/approve/authorize event is logged with actor & timestamp.</div>
      {activity.length===0 && <div style={{color:'var(--text-2)',fontSize:13}}>No activity yet.</div>}
      {activity.map((a,i) => (
        <div key={a.id||i} style={{display:'flex',gap:12,padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:'#2563EB',marginTop:5,flexShrink:0}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:600}}>{a.actor} <span style={{fontWeight:400,color:'var(--text-2)'}}>— {a.action}</span></div>
            {a.detail && <div style={{fontSize:11,color:'var(--text-2)',marginTop:2}}>{a.detail}</div>}
            <div style={{fontSize:10,color:'var(--text-3)',marginTop:2}}>{new Date(a.created_at).toLocaleString('en-IN')}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------- Demo seed helpers ----------------
function seedProcSteps(request) {
  const advanced = request.id==='demo-1'
  return PROCUREMENT_STEPS.map((s,i) => ({
    id:`seed-p-${request.id}-${i}`, request_id:request.id, step_order:s.order, step_name:s.step_name, role:s.role,
    status: advanced ? 'Approved' : (s.order<=3?'Approved':s.order===4?'In Progress':'Pending'),
    acted_by: advanced || s.order<=3 ? 'Sachin Pawar':null,
    comments: s.order===3?'Justified for GMP batch release testing — approved.':null
  }))
}
function seedDocs(request) {
  if (request.id!=='demo-1') return []
  return [
    { id:'seed-d-1', request_id:request.id, doc_type:'URS', doc_number:'URS/0019', template_ref:'T/QA/SOP/006/01', title:'User Requirement Specification', status:'Authorized', current_stage:'Authorized', content:{} },
    { id:'seed-d-2', request_id:request.id, doc_type:'IA', doc_number:'IA/0019', template_ref:'T/QA/SOP/006/02', title:'Impact Assessment', status:'Authorized', current_stage:'Authorized', content:{impact:'Direct Impact'} },
    { id:'seed-d-3', request_id:request.id, doc_type:'EquipmentID', doc_number:'MIC/QC2/0019', template_ref:'T/QA/SOP/006/08', title:'Equipment ID Request', status:'Approved', current_stage:'Approved', content:{} },
    { id:'seed-d-4', request_id:request.id, doc_type:'IQ', doc_number:'PQP/0019', template_ref:'T/QA/SOP/006/03', title:'Installation Qualification', status:'Under Review', current_stage:'Reviewed (QA / CFT)', content:{} },
  ]
}
function seedActivity(request) {
  if (request.id==='demo-1') return [
    { id:'a1', actor:'Head QA', action:'Impact Assessment IA/0019 Authorized', detail:'Direct impact confirmed', created_at:'2026-06-15T10:20:00' },
    { id:'a2', actor:'Sachin Pawar', action:'IQ protocol PQP/0019 submitted for QA review', detail:'', created_at:'2026-06-18T14:05:00' },
    { id:'a3', actor:'QA Reviewer', action:'URS/0019 Authorized', detail:'', created_at:'2026-06-12T09:30:00' },
  ]
  return [{ id:'a0', actor:request.requested_by, action:'Request Created', detail:request.request_no, created_at:request.created_at }]
}
