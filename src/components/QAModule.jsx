import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const MOCK_DEVIATIONS = [
  { id:'1', dev_id:'DEV-2024-018', batch_id:'BCMA-CAR-T-009', title:'Low gDNA OD260/280 — Low Input Cell Count', severity:'Major', status:'Open', owner:'Sachin Pawar', created_at:'2024-05-20' },
  { id:'2', dev_id:'DEV-2024-017', batch_id:'CD19-CAR-T-023', title:'CAR Expression borderline (51.2%) — Investigation', severity:'Minor', status:'Closed', owner:'QC-01', created_at:'2024-05-14' },
  { id:'3', dev_id:'DEV-2024-015', batch_id:'LV-CD19-030', title:'Endotoxin spike recovery OOT — reagent lot change', severity:'Minor', status:'Closed', owner:'Sachin Pawar', created_at:'2024-05-08' },
]

const MOCK_CAPAS = [
  { id:'1', capa_id:'CAPA-2024-009', deviation_id:'DEV-2024-018', title:'Update gDNA extraction protocol — minimum cell input specification', status:'In Progress', owner:'Sachin Pawar', due_date:'2024-06-10' },
  { id:'2', capa_id:'CAPA-2024-008', deviation_id:'DEV-2024-017', title:'Flow cytometry compensation QC check addition', status:'Complete', owner:'QC-01', due_date:'2024-05-28' },
]

export default function QAModule() {
  const [tab, setTab] = useState('deviations')
  const [deviations, setDeviations] = useState(MOCK_DEVIATIONS)
  const [capas, setCapas] = useState(MOCK_CAPAS)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ dev_id:'', title:'', batch_id:'', severity:'Minor', description:'', owner:'Sachin Pawar' })

  useEffect(() => {
    supabase.from('deviations').select('*').then(({ data }) => {
      if (data && data.length > 0) setDeviations(data)
    })
  }, [])

  const saveDeviation = async () => {
    const payload = { ...form, status:'Open', created_at: new Date().toISOString() }
    const { data } = await supabase.from('deviations').insert([payload]).select()
    setDeviations(prev => [data?.[0] || { ...payload, id: Date.now().toString() }, ...prev])
    setShowNew(false)
  }

  const severityChip = { Minor:'badge-warn', Major:'badge-danger', Critical:'badge-danger' }
  const statusChip   = { Open:'badge-danger', 'In Progress':'badge-info', Closed:'badge-success', Complete:'badge-success' }

  const QMS_ITEMS = [
    { label:'Open Deviations', value: deviations.filter(d=>d.status==='Open').length, color:'#EF4444' },
    { label:'Open CAPAs', value: capas.filter(c=>c.status==='In Progress').length, color:'#F59E0B' },
    { label:'SOPs Due for Review', value: 3, color:'#F59E0B' },
    { label:'Training Overdue', value: 0, color:'#10B981' },
  ]

  return (
    <div>
      <div className="page-title">QA Module</div>
      <div className="page-sub">Deviation Management · CAPA · Change Control · Document Control · Training</div>

      <div className="grid-4 mb-6">
        {QMS_ITEMS.map((k,i) => (
          <div key={i} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{color:k.color}}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {[{k:'deviations',l:'Deviations'},{k:'capa',l:'CAPA'},{k:'changecontrol',l:'Change Control'},{k:'audittrail',l:'Audit Trail'}].map(t => (
            <button key={t.k} className={`btn ${tab===t.k?'btn-primary':'btn-secondary'}`} onClick={() => setTab(t.k)}>{t.l}</button>
          ))}
        </div>
        {tab==='deviations' && <button className="btn btn-danger" onClick={() => setShowNew(true)}>+ Log Deviation</button>}
      </div>

      {tab === 'deviations' && (
        <div className="card" style={{padding:0,overflow:'hidden'}}>
          <table className="data-table">
            <thead>
              <tr><th>Dev ID</th><th>Batch</th><th>Description</th><th>Severity</th><th>Status</th><th>Owner</th><th>Date</th><th>Action</th></tr>
            </thead>
            <tbody>
              {deviations.map((d,i) => (
                <tr key={i}>
                  <td style={{fontWeight:700,color:'#2563EB'}}>{d.dev_id}</td>
                  <td style={{fontSize:12}}>{d.batch_id}</td>
                  <td style={{fontWeight:500,maxWidth:220}}>{d.title}</td>
                  <td><span className={`kpi-badge ${severityChip[d.severity]||'badge-gray'}`}>{d.severity}</span></td>
                  <td><span className={`kpi-badge ${statusChip[d.status]||'badge-gray'}`}>{d.status}</span></td>
                  <td style={{fontSize:12}}>{d.owner}</td>
                  <td style={{fontSize:12,color:'var(--text-2)'}}>{d.created_at?.slice(0,10)}</td>
                  <td><button className="btn btn-secondary btn-sm">Open</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'capa' && (
        <div className="card" style={{padding:0,overflow:'hidden'}}>
          <table className="data-table">
            <thead>
              <tr><th>CAPA ID</th><th>Linked Deviation</th><th>Action Title</th><th>Status</th><th>Owner</th><th>Due Date</th></tr>
            </thead>
            <tbody>
              {capas.map((c,i) => (
                <tr key={i}>
                  <td style={{fontWeight:700,color:'#2563EB'}}>{c.capa_id}</td>
                  <td style={{fontSize:12,color:'var(--text-2)'}}>{c.deviation_id}</td>
                  <td style={{fontWeight:500}}>{c.title}</td>
                  <td><span className={`kpi-badge ${statusChip[c.status]||'badge-gray'}`}>{c.status}</span></td>
                  <td style={{fontSize:12}}>{c.owner}</td>
                  <td style={{fontSize:12}}>{c.due_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'changecontrol' && (
        <div className="card">
          <div className="alert alert-info mb-4">Change Control system for GMP-compliant process, method, and equipment changes per ICH Q10 / EMA guidelines.</div>
          {[
            { id:'CC-2024-012', title:'QIAcuity One Software Upgrade v2.5 → v3.0', type:'Equipment/Software', status:'Approved', raised:'2024-05-10' },
            { id:'CC-2024-011', title:'NucleoSpin Tissue Kit — Alternate Supplier Qualification', type:'Reagent', status:'In Review', raised:'2024-05-05' },
            { id:'CC-2024-010', title:'VCN SOP v1.0 → v2.0 — Updated calculation formula', type:'Document', status:'Implemented', raised:'2024-04-28' },
          ].map((cc,i) => (
            <div key={i} style={{border:'1px solid var(--border)',borderRadius:8,padding:14,marginBottom:10}}>
              <div className="flex items-center justify-between mb-2">
                <span style={{fontWeight:700,color:'#2563EB',fontSize:13}}>{cc.id}</span>
                <span className={`kpi-badge ${cc.status==='Approved'||cc.status==='Implemented'?'badge-success':cc.status==='In Review'?'badge-warn':'badge-gray'}`}>{cc.status}</span>
              </div>
              <div style={{fontWeight:500,marginBottom:4}}>{cc.title}</div>
              <div style={{fontSize:12,color:'var(--text-2)'}}>{cc.type} · Raised: {cc.raised}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'audittrail' && (
        <div className="card">
          <div className="alert alert-success mb-4">21 CFR Part 11 compliant — all actions logged with timestamp, user ID, and IP.</div>
          {[
            { user:'Sachin Pawar', action:'QC Result logged: VCN 2.1 copies/genome — CD19-CAR-T-024', time:'2024-05-22 14:32:11', type:'Data Entry' },
            { user:'QC-Reviewer', action:'QC Result reviewed and approved — CD19-CAR-T-024 Viability', time:'2024-05-22 09:15:44', type:'Approval' },
            { user:'MFG-04', action:'Batch Record step completed: Transduction — CD19-CAR-T-024', time:'2024-05-21 16:48:02', type:'MBR' },
            { user:'Sachin Pawar', action:'Deviation logged: DEV-2024-018 — BCMA low gDNA', time:'2024-05-20 11:02:55', type:'Deviation' },
            { user:'QA-Manager', action:'CAPA approved: CAPA-2024-008 — Flow cytometry QC check', time:'2024-05-19 15:30:10', type:'CAPA' },
          ].map((a,i) => (
            <div key={i} style={{display:'flex',gap:12,padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:'#2563EB',marginTop:5,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600}}>{a.user} <span style={{fontWeight:400,color:'var(--text-2)'}}>— {a.action}</span></div>
                <div style={{fontSize:11,color:'var(--text-2)',marginTop:2}}>{a.time} · {a.type}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <div className="modal-bg" onClick={() => setShowNew(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Log Deviation</div>
              <button className="modal-close" onClick={() => setShowNew(false)}>×</button>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Deviation ID</label>
                <input className="form-input" value={form.dev_id} onChange={e => setForm({...form, dev_id:e.target.value})} placeholder="DEV-2024-XXX"/>
              </div>
              <div className="form-group">
                <label className="form-label">Batch / System</label>
                <input className="form-input" value={form.batch_id} onChange={e => setForm({...form, batch_id:e.target.value})}/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" value={form.title} onChange={e => setForm({...form, title:e.target.value})}/>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description:e.target.value})}/>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Severity</label>
                <select className="form-select" value={form.severity} onChange={e => setForm({...form, severity:e.target.value})}>
                  {['Minor','Major','Critical'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Owner</label>
                <input className="form-input" value={form.owner} onChange={e => setForm({...form, owner:e.target.value})}/>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="btn btn-danger" onClick={saveDeviation}>Log Deviation</button>
              <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
