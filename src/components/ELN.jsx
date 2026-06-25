import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const MOCK_EXPS = [
  { id:'1', exp_id:'EXP-CD19-024', title:'VCN dPCR MiQuant Method Verification', type:'Analytical', status:'In Progress', scientist:'Sachin Pawar', project:'CD19 CAR-T', started_at:'2024-05-20' },
  { id:'2', exp_id:'EXP-LV-039',   title:'LV Transduction DoE — MOI Optimization', type:'Process Dev', status:'Complete', scientist:'Sachin Pawar', project:'LV CD19', started_at:'2024-05-15' },
  { id:'3', exp_id:'EXP-AAV9-042', title:'AAV9 Upstream Transfection Conditions', type:'Process Dev', status:'In Progress', scientist:'R&D Team', project:'AAV9 CRISPR', started_at:'2024-05-18' },
  { id:'4', exp_id:'EXP-BCMA-011', title:'BCMA VCN Low gDNA Root Cause Investigation', type:'Analytical', status:'In Progress', scientist:'Sachin Pawar', project:'BCMA CAR-T', started_at:'2024-05-22' },
  { id:'5', exp_id:'EXP-mRNA-003', title:'LNP Encapsulation Efficiency Screen', type:'Formulation', status:'Draft', scientist:'R&D Team', project:'LNP-mRNA', started_at:'2024-05-23' },
]

const DOE_TYPES = ['Full Factorial','Fractional Factorial','Plackett-Burman','Central Composite','Box-Behnken','D-Optimal','Definitive Screening']

export default function ELN() {
  const [exps, setExps] = useState(MOCK_EXPS)
  const [selected, setSelected] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ exp_id:'', title:'', type:'Analytical', objective:'', hypothesis:'', scientist:'Sachin Pawar', doe_type:'' })
  const [tab, setTab] = useState('notebook')

  useEffect(() => {
    supabase.from('experiments').select('*').then(({ data }) => {
      if (data && data.length > 0) setExps(data)
    })
  }, [])

  const createExp = async () => {
    const payload = { ...form, status:'Draft', started_at: new Date().toISOString() }
    const { data } = await supabase.from('experiments').insert([payload]).select()
    const newExp = data?.[0] || { ...payload, id: Date.now().toString() }
    setExps(prev => [newExp, ...prev])
    setSelected(newExp)
    setShowNew(false)
  }

  const statusColor = { 'Draft':'dot-gray', 'In Progress':'dot-blue', 'Complete':'dot-green', 'Signed Off':'dot-green' }

  return (
    <div>
      <div className="page-title">Electronic Lab Notebook (ELN)</div>
      <div className="page-sub">Research experiments, DoE design, data capture — AAV · LV · CAR-T · CRISPR · mRNA · iPSC</div>

      <div className="flex gap-3 mb-4">
        {['notebook','doe','templates'].map(t => (
          <button key={t} className={`btn ${tab===t?'btn-primary':'btn-secondary'}`} onClick={() => setTab(t)}>
            {t==='notebook'?'Experiments':t==='doe'?'DoE Engine':'Templates'}
          </button>
        ))}
        <button className="btn btn-success" style={{marginLeft:'auto'}} onClick={() => setShowNew(true)}>+ New Experiment</button>
      </div>

      {tab === 'notebook' && (
        <div className="grid-2">
          <div className="card" style={{padding:0, overflow:'hidden'}}>
            <div style={{padding:'14px 16px', borderBottom:'1px solid var(--border)', fontWeight:600, fontSize:13}}>Experiments ({exps.length})</div>
            {exps.map(e => (
              <div
                key={e.id}
                onClick={() => setSelected(e)}
                style={{
                  padding:'12px 16px', cursor:'pointer', borderBottom:'1px solid var(--border)',
                  background: selected?.id === e.id ? '#EFF6FF' : 'white',
                  borderLeft: selected?.id === e.id ? '3px solid #2563EB' : '3px solid transparent',
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span style={{fontWeight:600,fontSize:12,color:'#2563EB'}}>{e.exp_id}</span>
                  <span className={`status-dot ${statusColor[e.status]||'dot-gray'}`}/>
                </div>
                <div style={{fontSize:13,fontWeight:500,marginBottom:2}}>{e.title}</div>
                <div style={{fontSize:11,color:'var(--text-2)'}}>{e.scientist} · {e.type} · {e.project || 'General'}</div>
              </div>
            ))}
          </div>

          <div className="card">
            {selected ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div style={{fontWeight:700,fontSize:16}}>{selected.exp_id}</div>
                    <div style={{fontSize:12,color:'var(--text-2)'}}>{selected.type} · {selected.scientist}</div>
                  </div>
                  <span className={`chip chip-${selected.status==='Complete'?'lv':selected.status==='In Progress'?'cart':'plasmid'}`}>{selected.status}</span>
                </div>
                <div style={{fontWeight:600,fontSize:15,marginBottom:8}}>{selected.title}</div>
                <div className="form-group">
                  <label className="form-label">Objective</label>
                  <div style={{fontSize:13,padding:'8px',background:'#F9FAFB',borderRadius:6}}>
                    {selected.objective || 'Determine VCN by MiQuant® dPCR — method verification on QIAcuity One platform for GMP batch release.'}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Hypothesis</label>
                  <div style={{fontSize:13,padding:'8px',background:'#F9FAFB',borderRadius:6}}>
                    {selected.hypothesis || 'MiQuant dPCR will demonstrate >80% recovery with CV <15% across CD19 CAR-T batches.'}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Experiment Steps</label>
                  {['gDNA Extraction (NucleoSpin Tissue)','dPCR Setup — MiQuant CAR-T Lenti Kit','QIAcuity One Run — 96-well Nanoplate','Data Analysis — Quantasoft','Statistical Evaluation & Report'].map((s,i) => (
                    <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 10px',background:'#F9FAFB',borderRadius:6,marginBottom:4}}>
                      <span style={{width:20,height:20,borderRadius:'50%',background:'#2563EB',color:'#fff',fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</span>
                      <span style={{fontSize:12}}>{s}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="btn btn-primary btn-sm">Edit Entry</button>
                  <button className="btn btn-secondary btn-sm">Sign &amp; Lock</button>
                  <button className="btn btn-secondary btn-sm">Export PDF</button>
                </div>
              </>
            ) : (
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:300,color:'var(--text-2)'}}>
                <div style={{fontSize:32,marginBottom:8}}>📓</div>
                <div style={{fontWeight:600,marginBottom:4}}>Select an experiment</div>
                <div style={{fontSize:12}}>Click any experiment to view details</div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'doe' && (
        <div className="card">
          <div className="section-title">Design of Experiments (DoE) Engine</div>
          <div className="alert alert-info mb-4">Supports: Full Factorial · Fractional Factorial · Plackett-Burman · RSM · D-Optimal for AAV, LV, CAR-T, CRISPR, mRNA processes</div>
          <div className="grid-2">
            <div>
              <div className="form-group">
                <label className="form-label">Design Type</label>
                <select className="form-select">
                  {DOE_TYPES.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Process Platform</label>
                <select className="form-select">
                  <option>AAV Upstream Transfection</option>
                  <option>LV Transduction</option>
                  <option>CAR-T Activation &amp; Expansion</option>
                  <option>LNP Formulation</option>
                  <option>CRISPR Editing</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Number of Factors</label>
                <input type="number" className="form-input" defaultValue={4} min={2} max={12}/>
              </div>
              <button className="btn btn-primary">Generate Run Table</button>
            </div>
            <div style={{background:'#F9FAFB',borderRadius:8,padding:16}}>
              <div style={{fontWeight:600,fontSize:13,marginBottom:12}}>CPP → CQA Impact Matrix</div>
              <table className="data-table" style={{fontSize:11}}>
                <thead>
                  <tr><th>CPP</th><th>Yield</th><th>Viability</th><th>VCN</th><th>Purity</th></tr>
                </thead>
                <tbody>
                  <tr><td>Cell Density</td><td>🔴 High</td><td>🔴 High</td><td>🟡 Med</td><td>🟢 Low</td></tr>
                  <tr><td>DNA:PEI Ratio</td><td>🔴 High</td><td>🟡 Med</td><td>🔴 High</td><td>🟡 Med</td></tr>
                  <tr><td>Harvest Time</td><td>🔴 High</td><td>🔴 High</td><td>🟡 Med</td><td>🔴 High</td></tr>
                  <tr><td>Temperature</td><td>🟡 Med</td><td>🔴 High</td><td>🟢 Low</td><td>🟢 Low</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'templates' && (
        <div className="grid-3">
          {[
            { title:'AAV Upstream Transfection', type:'Process', steps:18 },
            { title:'LV Transduction Protocol', type:'Process', steps:14 },
            { title:'CAR-T Activation & Expansion', type:'Process', steps:22 },
            { title:'VCN by dPCR (MiQuant)', type:'Analytical', steps:10 },
            { title:'RCL Testing (VSVG/PTBP2)', type:'Analytical', steps:8 },
            { title:'Flow Cytometry CAR Expression', type:'Analytical', steps:12 },
            { title:'Endotoxin LAL KTA', type:'QC', steps:9 },
            { title:'Sterility Testing', type:'QC', steps:7 },
            { title:'BSA Residual ELISA', type:'QC', steps:11 },
          ].map((t,i) => (
            <div key={i} className="card card-sm flex items-center justify-between">
              <div>
                <div style={{fontWeight:600,fontSize:13}}>{t.title}</div>
                <div style={{fontSize:11,color:'var(--text-2)',marginTop:2}}>{t.type} · {t.steps} steps</div>
              </div>
              <button className="btn btn-secondary btn-sm">Use</button>
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <div className="modal-bg" onClick={() => setShowNew(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">New Experiment</div>
              <button className="modal-close" onClick={() => setShowNew(false)}>×</button>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Experiment ID</label>
                <input className="form-input" value={form.exp_id} onChange={e => setForm({...form, exp_id:e.target.value})} placeholder="EXP-2024-XXX-001"/>
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={form.type} onChange={e => setForm({...form, type:e.target.value})}>
                  {['Analytical','Process Dev','Formulation','Screening','Qualification','General'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" value={form.title} onChange={e => setForm({...form, title:e.target.value})} placeholder="Experiment title"/>
            </div>
            <div className="form-group">
              <label className="form-label">Objective</label>
              <textarea className="form-textarea" value={form.objective} onChange={e => setForm({...form, objective:e.target.value})}/>
            </div>
            <div className="form-group">
              <label className="form-label">Hypothesis</label>
              <textarea className="form-textarea" value={form.hypothesis} onChange={e => setForm({...form, hypothesis:e.target.value})}/>
            </div>
            <div className="form-group">
              <label className="form-label">Scientist</label>
              <input className="form-input" value={form.scientist} onChange={e => setForm({...form, scientist:e.target.value})}/>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="btn btn-primary" onClick={createExp}>Create Experiment</button>
              <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
