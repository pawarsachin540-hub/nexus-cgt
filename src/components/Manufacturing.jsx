import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const MOCK_BATCHES = [
  { id:'1', batch_number:'CD19-CAR-T-024', product_type:'CART', stage:'CAR-T Manufacturing', status:'In Progress', operator:'MFG-04', start_date:'2024-05-20', viability:94.2, car_expression:76.3, vcn:2.1 },
  { id:'2', batch_number:'BCMA-CAR-T-009', product_type:'CART', stage:'QC Testing', status:'QC Hold', operator:'MFG-02', start_date:'2024-05-15', viability:88.5, car_expression:68.1, vcn:1.8 },
  { id:'3', batch_number:'LV-CD19-031', product_type:'LV', stage:'Batch Release', status:'Released', operator:'MFG-01', start_date:'2024-05-10', yield_value:3.2, yield_unit:'E8 TU/mL' },
  { id:'4', batch_number:'AAV9-CRISPR-006', product_type:'AAV', stage:'Downstream Processing', status:'In Progress', operator:'MFG-03', start_date:'2024-05-18', yield_value:1.9, yield_unit:'E12 vg/mL' },
]

const MFG_STAGES = ['Cell Expansion','Activation','Transduction / Transfection','Expansion','Harvest','Purification','Fill & Finish','QC Testing','Batch Release']

export default function Manufacturing() {
  const [batches, setBatches] = useState(MOCK_BATCHES)
  const [selected, setSelected] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ batch_number:'', product_type:'CART', operator:'', notes:'' })

  useEffect(() => {
    supabase.from('batches').select('*').then(({ data }) => {
      if (data && data.length > 0) setBatches(data)
    })
  }, [])

  const createBatch = async () => {
    const payload = { ...form, status:'In Progress', stage:'Cell Expansion', start_date: new Date().toISOString().split('T')[0] }
    const { data } = await supabase.from('batches').insert([payload]).select()
    const nb = data?.[0] || { ...payload, id: Date.now().toString() }
    setBatches(prev => [nb, ...prev])
    setShowNew(false)
  }

  const stageIndex = (s) => MFG_STAGES.findIndex(x => x.toLowerCase().includes((s||'').toLowerCase().slice(0,8)))

  const statusDot = { 'In Progress':'dot-blue', 'Released':'dot-green', 'QC Hold':'dot-red', 'Pending Release':'dot-amber', 'Failed':'dot-red' }

  return (
    <div>
      <div className="page-title">GMP Manufacturing</div>
      <div className="page-sub">Electronic Batch Records · Process Tracking · Chain of Identity · Deviation Management</div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {['All','CART','LV','AAV'].map(t => (
            <button key={t} className="btn btn-secondary btn-sm">{t}</button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>+ New Batch Record</button>
      </div>

      <div className="grid-2 mb-6">
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          <div style={{padding:'14px 16px', borderBottom:'1px solid var(--border)', fontWeight:600, fontSize:13}}>Active Batch Records ({batches.length})</div>
          {batches.map(b => (
            <div
              key={b.id}
              onClick={() => setSelected(b)}
              style={{
                padding:'12px 16px', cursor:'pointer', borderBottom:'1px solid var(--border)',
                background: selected?.id === b.id ? '#EFF6FF' : 'white',
                borderLeft: selected?.id === b.id ? '3px solid #2563EB' : '3px solid transparent',
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span style={{fontWeight:700,fontSize:13}}>{b.batch_number}</span>
                <span className={`chip chip-${b.product_type?.toLowerCase()}`}>{b.product_type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{fontSize:11,color:'var(--text-2)'}}>{b.stage} · {b.operator}</span>
                <span><span className={`status-dot ${statusDot[b.status]||'dot-gray'}`}/><span style={{fontSize:11}}>{b.status}</span></span>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          {selected ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div style={{fontWeight:700,fontSize:16}}>{selected.batch_number}</div>
                  <div style={{fontSize:12,color:'var(--text-2)'}}>{selected.product_type} · Started: {selected.start_date}</div>
                </div>
                <span className={`chip chip-${selected.status==='Released'?'lv':selected.status==='QC Hold'?'cart':'aav'}`}>{selected.status}</span>
              </div>

              <div className="mb-4">
                <div style={{fontWeight:600,fontSize:12,marginBottom:8,color:'var(--text-2)'}}>MANUFACTURING STAGE PROGRESS</div>
                <div style={{overflowX:'auto'}}>
                  <div style={{display:'flex',alignItems:'center',gap:0,minWidth:500}}>
                    {MFG_STAGES.map((s,i) => {
                      const ci = stageIndex(selected.stage)
                      const done = i < ci
                      const active = i === ci
                      return (
                        <div key={i} style={{display:'flex',alignItems:'center'}}>
                          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                            <div style={{
                              width:24,height:24,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                              fontSize:10,fontWeight:700,
                              background: done?'#10B981':active?'#2563EB':'#E5E7EB',
                              color: (done||active)?'#fff':'#9CA3AF'
                            }}>{i+1}</div>
                            <div style={{fontSize:9,color:'var(--text-2)',textAlign:'center',width:52,lineHeight:1.2}}>{s}</div>
                          </div>
                          {i < MFG_STAGES.length-1 && <div style={{width:20,height:2,background:done?'#10B981':'#E5E7EB',margin:'0 0 16px'}}/>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="grid-3 mb-4">
                <div style={{background:'#F0FDF4',borderRadius:8,padding:'10px 12px',textAlign:'center'}}>
                  <div style={{fontSize:10,color:'#065F46',fontWeight:600,textTransform:'uppercase'}}>Viability</div>
                  <div style={{fontSize:22,fontWeight:700,color:selected.viability>85?'#10B981':'#EF4444'}}>{selected.viability || '—'}%</div>
                  <div style={{fontSize:10,color:'#065F46'}}>Spec ≥85%</div>
                </div>
                <div style={{background:'#EFF6FF',borderRadius:8,padding:'10px 12px',textAlign:'center'}}>
                  <div style={{fontSize:10,color:'#1E40AF',fontWeight:600,textTransform:'uppercase'}}>CAR+ %</div>
                  <div style={{fontSize:22,fontWeight:700,color:selected.car_expression>50?'#2563EB':'#EF4444'}}>{selected.car_expression || '—'}%</div>
                  <div style={{fontSize:10,color:'#1E40AF'}}>Spec ≥50%</div>
                </div>
                <div style={{background:'#FFFBEB',borderRadius:8,padding:'10px 12px',textAlign:'center'}}>
                  <div style={{fontSize:10,color:'#92400E',fontWeight:600,textTransform:'uppercase'}}>VCN</div>
                  <div style={{fontSize:22,fontWeight:700,color:'#F59E0B'}}>{selected.vcn || selected.yield_value || '—'}</div>
                  <div style={{fontSize:10,color:'#92400E'}}>Spec 1.5–3.0</div>
                </div>
              </div>

              {selected.product_type === 'CART' && (
                <div style={{background:'#F9FAFB',borderRadius:8,padding:12,marginBottom:12,borderLeft:'3px solid #2563EB'}}>
                  <div style={{fontWeight:600,fontSize:12,marginBottom:6}}>🔒 Chain of Identity (COI)</div>
                  {[
                    {label:'Patient ID (Encrypted)', value:'PT-2024-0034'},
                    {label:'Apheresis Lot', value:'APH-0034-001'},
                    {label:'Receipt Confirmed', value:'✅ 2024-05-15 14:32'},
                    {label:'COI Integrity', value:'✅ Intact'},
                  ].map((r,i) => (
                    <div key={i} className="flex items-center justify-between" style={{fontSize:12,padding:'3px 0',borderBottom:'1px solid var(--border)'}}>
                      <span style={{color:'var(--text-2)'}}>{r.label}</span>
                      <span style={{fontWeight:600}}>{r.value}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm">Edit Batch Record</button>
                <button className="btn btn-secondary btn-sm">Log Deviation</button>
                <button className="btn btn-secondary btn-sm">Release →</button>
              </div>
            </>
          ) : (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:300,color:'var(--text-2)'}}>
              <div style={{fontSize:32,marginBottom:8}}>🏭</div>
              <div style={{fontWeight:600}}>Select a batch to view electronic batch record</div>
            </div>
          )}
        </div>
      </div>

      {showNew && (
        <div className="modal-bg" onClick={() => setShowNew(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">New Batch Record</div>
              <button className="modal-close" onClick={() => setShowNew(false)}>×</button>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Batch Number</label>
                <input className="form-input" value={form.batch_number} onChange={e => setForm({...form, batch_number:e.target.value})} placeholder="e.g. CD19-CAR-T-025"/>
              </div>
              <div className="form-group">
                <label className="form-label">Product Type</label>
                <select className="form-select" value={form.product_type} onChange={e => setForm({...form, product_type:e.target.value})}>
                  {['CART','LV','AAV','Plasmid','mRNA'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Operator</label>
              <input className="form-input" value={form.operator} onChange={e => setForm({...form, operator:e.target.value})} placeholder="Operator ID or name"/>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" value={form.notes} onChange={e => setForm({...form, notes:e.target.value})}/>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="btn btn-primary" onClick={createBatch}>Open Batch Record</button>
              <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
