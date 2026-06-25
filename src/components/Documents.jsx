import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const MOCK_DOCS = [
  { id:'1', doc_id:'SOP-QC-VCN-003', title:'VCN Determination by dPCR (MiQuant CAR-T Cell Lenti Kit)', type:'SOP', version:'v2.0', status:'Approved', owner:'Sachin Pawar', effective_date:'2024-04-01', review_date:'2025-04-01' },
  { id:'2', doc_id:'WI-QC-GDNA-001', title:'gDNA Extraction from CAR-T Cells using NucleoSpin Tissue', type:'WI', version:'v1.1', status:'Approved', owner:'Sachin Pawar', effective_date:'2024-03-15', review_date:'2025-03-15' },
  { id:'3', doc_id:'MVFP-QC-VCN-001', title:'Method Verification Feasibility Protocol — MiQuant dPCR', type:'Protocol', version:'v1.0', status:'In Review', owner:'Sachin Pawar', effective_date:'2024-05-01', review_date:'2024-11-01' },
  { id:'4', doc_id:'SOP-QC-LAL-002', title:'Endotoxin Testing by LAL Kinetic Turbidimetric Assay', type:'SOP', version:'v1.2', status:'Approved', owner:'QC-Analyst', effective_date:'2024-02-01', review_date:'2025-02-01' },
  { id:'5', doc_id:'SOP-MFG-CART-001', title:'CAR-T Autologous Manufacturing — CD19 Program', type:'SOP', version:'v3.0', status:'Approved', owner:'MFG-Lead', effective_date:'2024-01-15', review_date:'2025-01-15' },
  { id:'6', doc_id:'TR-QC-VCN-2024-01', title:'Technical Report: VCN Optimization gDNA Input Study', type:'Report', version:'v1.0', status:'Final', owner:'Sachin Pawar', effective_date:'2024-05-10', review_date:'N/A' },
  { id:'7', doc_id:'SPEC-QC-CART-001', title:'CD19 CAR-T Product Release Specifications', type:'Specification', version:'v2.1', status:'Approved', owner:'QA-Manager', effective_date:'2024-03-01', review_date:'2025-03-01' },
  { id:'8', doc_id:'SOP-QC-RCL-001', title:'RCL Testing by dPCR (VSVG/PTBP2 Duplex Assay)', type:'SOP', version:'v1.0', status:'Draft', owner:'Sachin Pawar', effective_date:'', review_date:'' },
]

const TRAINING_RECORDS = [
  { employee:'Sachin Pawar', doc:'SOP-QC-VCN-003', date:'2024-04-05', expiry:'2025-04-05', status:'Current' },
  { employee:'Sachin Pawar', doc:'WI-QC-GDNA-001', date:'2024-03-20', expiry:'2025-03-20', status:'Current' },
  { employee:'QC-02', doc:'SOP-QC-VCN-003', date:'2024-04-06', expiry:'2025-04-06', status:'Current' },
  { employee:'QC-03', doc:'SOP-QC-VCN-003', date:'2024-04-08', expiry:'2025-04-08', status:'Current' },
  { employee:'MFG-04', doc:'SOP-MFG-CART-001', date:'2024-01-20', expiry:'2025-01-20', status:'Current' },
]

export default function Documents() {
  const [docs, setDocs] = useState(MOCK_DOCS)
  const [tab, setTab] = useState('documents')
  const [showNew, setShowNew] = useState(false)
  const [filter, setFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [form, setForm] = useState({ doc_id:'', title:'', type:'SOP', version:'v1.0', owner:'Sachin Pawar', effective_date:'', review_date:'' })

  useEffect(() => {
    supabase.from('documents').select('*').then(({ data }) => {
      if (data && data.length > 0) setDocs(data)
    })
  }, [])

  const addDoc = async () => {
    const { data } = await supabase.from('documents').insert([{ ...form, status:'Draft' }]).select()
    setDocs(prev => [...prev, data?.[0] || { ...form, id: Date.now().toString(), status:'Draft' }])
    setShowNew(false)
  }

  const filtered = docs.filter(d => {
    const matchText = d.title?.toLowerCase().includes(filter.toLowerCase()) || d.doc_id?.toLowerCase().includes(filter.toLowerCase())
    const matchType = typeFilter === 'All' || d.type === typeFilter
    return matchText && matchType
  })

  const statusBadge = { Approved:'badge-success', Draft:'badge-gray', 'In Review':'badge-warn', Final:'badge-info', Obsolete:'badge-danger' }
  const typeBadge   = { SOP:'chip-cart', WI:'chip-lv', Protocol:'chip-aav', Report:'chip-crispr', Specification:'chip-plasmid', Other:'chip-stem' }

  return (
    <div>
      <div className="page-title">Document Management System</div>
      <div className="page-sub">SOPs · Work Instructions · Protocols · Reports · Specifications · Training Records</div>

      <div className="grid-4 mb-6">
        <div className="kpi-card">
          <div className="kpi-label">Total Documents</div>
          <div className="kpi-value">{docs.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Approved</div>
          <div className="kpi-value" style={{color:'#10B981'}}>{docs.filter(d=>d.status==='Approved'||d.status==='Final').length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">In Review / Draft</div>
          <div className="kpi-value" style={{color:'#F59E0B'}}>{docs.filter(d=>d.status==='Draft'||d.status==='In Review').length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Due for Review</div>
          <div className="kpi-value" style={{color:'#EF4444'}}>{docs.filter(d => { const diff = (new Date(d.review_date) - new Date()) / (1000*60*60*24); return diff < 90 && diff > 0 }).length}</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 flex-wrap">
          {[{k:'documents',l:'Documents'},{k:'training',l:'Training Records'},{k:'regulatory',l:'Regulatory'}].map(t => (
            <button key={t.k} className={`btn ${tab===t.k?'btn-primary':'btn-secondary'}`} onClick={() => setTab(t.k)}>{t.l}</button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>+ New Document</button>
      </div>

      {tab === 'documents' && (
        <>
          <div className="flex gap-2 mb-4 flex-wrap">
            <input className="form-input" style={{width:220}} placeholder="Search documents..." value={filter} onChange={e => setFilter(e.target.value)}/>
            {['All','SOP','WI','Protocol','Report','Specification'].map(t => (
              <button key={t} className={`btn btn-sm ${typeFilter===t?'btn-primary':'btn-secondary'}`} onClick={() => setTypeFilter(t)}>{t}</button>
            ))}
          </div>
          <div className="card" style={{padding:0,overflow:'hidden'}}>
            <div className="overflow-auto">
              <table className="data-table">
                <thead>
                  <tr><th>Doc ID</th><th>Type</th><th>Title</th><th>Version</th><th>Status</th><th>Owner</th><th>Effective</th><th>Review Due</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {filtered.map((d,i) => (
                    <tr key={i}>
                      <td style={{fontWeight:700,color:'#2563EB',fontSize:12}}>{d.doc_id}</td>
                      <td><span className={`chip ${typeBadge[d.type]||'chip-plasmid'}`}>{d.type}</span></td>
                      <td style={{fontWeight:500,maxWidth:240,fontSize:13}}>{d.title}</td>
                      <td style={{fontSize:12}}>{d.version}</td>
                      <td><span className={`kpi-badge ${statusBadge[d.status]||'badge-gray'}`}>{d.status}</span></td>
                      <td style={{fontSize:12}}>{d.owner}</td>
                      <td style={{fontSize:12,color:'var(--text-2)'}}>{d.effective_date}</td>
                      <td style={{fontSize:12,color:'var(--text-2)'}}>{d.review_date}</td>
                      <td><button className="btn btn-secondary btn-sm">Open</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'training' && (
        <div className="card" style={{padding:0,overflow:'hidden'}}>
          <table className="data-table">
            <thead>
              <tr><th>Employee</th><th>Document</th><th>Training Date</th><th>Expiry</th><th>Status</th></tr>
            </thead>
            <tbody>
              {TRAINING_RECORDS.map((r,i) => (
                <tr key={i}>
                  <td style={{fontWeight:600}}>{r.employee}</td>
                  <td style={{color:'#2563EB',fontSize:12}}>{r.doc}</td>
                  <td style={{fontSize:12}}>{r.date}</td>
                  <td style={{fontSize:12}}>{r.expiry}</td>
                  <td><span className={`kpi-badge ${r.status==='Current'?'badge-success':'badge-danger'}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'regulatory' && (
        <div className="card">
          <div className="section-title">Regulatory Submissions & References</div>
          <div className="alert alert-info mb-4">Linked to FDA · EMA · CDSCO · ICH Q2(R2) · ICH Q10 · 21 CFR Part 11 frameworks</div>
          <div className="grid-2">
            {[
              { agency:'FDA', type:'IND', title:'CD19 CAR-T — Analytical Methods Package', status:'Active', date:'2024-01' },
              { agency:'EMA', type:'CTA', title:'LV CD19 Process Analytical Technology', status:'In Prep', date:'2024-Q3' },
              { agency:'CDSCO', type:'CTA', title:'CD19 CAR-T India Phase I Application', status:'Draft', date:'2024-Q4' },
              { agency:'ICH', type:'Guideline', title:'Q2(R2) Method Validation — VCN, Flow, Endotoxin', status:'Implemented', date:'2024-03' },
            ].map((r,i) => (
              <div key={i} style={{border:'1px solid var(--border)',borderRadius:8,padding:14}}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="chip chip-aav">{r.agency}</span>
                  <span className="chip chip-plasmid">{r.type}</span>
                  <span className={`kpi-badge ${r.status==='Active'||r.status==='Implemented'?'badge-success':r.status==='Draft'||r.status==='In Prep'?'badge-warn':'badge-gray'}`}>{r.status}</span>
                </div>
                <div style={{fontWeight:600,fontSize:13,marginBottom:4}}>{r.title}</div>
                <div style={{fontSize:12,color:'var(--text-2)'}}>{r.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showNew && (
        <div className="modal-bg" onClick={() => setShowNew(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">New Document</div>
              <button className="modal-close" onClick={() => setShowNew(false)}>×</button>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Document ID</label>
                <input className="form-input" value={form.doc_id} onChange={e => setForm({...form, doc_id:e.target.value})} placeholder="SOP-QC-XXX-001"/>
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={form.type} onChange={e => setForm({...form, type:e.target.value})}>
                  {['SOP','WI','Protocol','Report','Specification','Other'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" value={form.title} onChange={e => setForm({...form, title:e.target.value})}/>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Version</label>
                <input className="form-input" value={form.version} onChange={e => setForm({...form, version:e.target.value})}/>
              </div>
              <div className="form-group">
                <label className="form-label">Owner</label>
                <input className="form-input" value={form.owner} onChange={e => setForm({...form, owner:e.target.value})}/>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Effective Date</label>
                <input type="date" className="form-input" value={form.effective_date} onChange={e => setForm({...form, effective_date:e.target.value})}/>
              </div>
              <div className="form-group">
                <label className="form-label">Review Date</label>
                <input type="date" className="form-input" value={form.review_date} onChange={e => setForm({...form, review_date:e.target.value})}/>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="btn btn-primary" onClick={addDoc}>Create Document</button>
              <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
