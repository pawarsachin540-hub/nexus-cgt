import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const MOCK_QC = [
  { id:'1', batch_id:'CD19-CAR-T-024', test_name:'VCN by dPCR (MiQuant)', method:'QIAcuity dPCR', result_value:'2.1', unit:'copies/genome', specification:'1.5–3.0', status:'Pass', analyst:'Sachin Pawar', tested_at:'2024-05-22' },
  { id:'2', batch_id:'CD19-CAR-T-024', test_name:'CAR Expression by Flow', method:'BD FACSCanto', result_value:'76.3', unit:'%', specification:'≥50%', status:'Pass', analyst:'QC-02', tested_at:'2024-05-22' },
  { id:'3', batch_id:'CD19-CAR-T-024', test_name:'Viability (Vi-Cell)', method:'Vi-Cell BLU', result_value:'94.2', unit:'%', specification:'≥85%', status:'Pass', analyst:'QC-01', tested_at:'2024-05-21' },
  { id:'4', batch_id:'CD19-CAR-T-024', test_name:'Endotoxin (LAL KTA)', method:'Kinetic Turbidimetric', result_value:'0.18', unit:'EU/mL', specification:'<1.0 EU/mL', status:'Pass', analyst:'Sachin Pawar', tested_at:'2024-05-22' },
  { id:'5', batch_id:'BCMA-CAR-T-009', test_name:'VCN by dPCR (MiQuant)', method:'QIAcuity dPCR', result_value:'1.8', unit:'copies/genome', specification:'1.5–3.0', status:'Pass', analyst:'Sachin Pawar', tested_at:'2024-05-20' },
  { id:'6', batch_id:'BCMA-CAR-T-009', test_name:'Mycoplasma qPCR', method:'MycoAlert Plus', result_value:'Negative', unit:'', specification:'Negative', status:'Pass', analyst:'QC-03', tested_at:'2024-05-20' },
  { id:'7', batch_id:'BCMA-CAR-T-009', test_name:'RCL by dPCR (VSVG/PTBP2)', method:'QIAcuity dPCR', result_value:'Negative', unit:'', specification:'Negative', status:'Pending', analyst:'Sachin Pawar', tested_at:'2024-05-22' },
  { id:'8', batch_id:'LV-CD19-031', test_name:'p24 Antigen ELISA', method:'Alliance HIV-1 p24', result_value:'<1.0', unit:'pg/mL', specification:'<10 pg/mL', status:'Pass', analyst:'QC-02', tested_at:'2024-05-18' },
]

const ASSAY_LIBRARY = [
  { name:'VCN by dPCR', platform:'QIAcuity One', product_type:'CAR-T/LV', status:'Qualified' },
  { name:'CAR Expression by Flow', platform:'BD FACSCanto II', product_type:'CAR-T', status:'Qualified' },
  { name:'Viability (Vi-Cell)', platform:'Vi-Cell BLU', product_type:'All', status:'Qualified' },
  { name:'Endotoxin LAL KTA', platform:'Microplate Reader', product_type:'All', status:'Qualified' },
  { name:'Mycoplasma qPCR', platform:'qPCR', product_type:'All', status:'Qualified' },
  { name:'RCL by dPCR', platform:'QIAcuity One', product_type:'LV', status:'Qualified' },
  { name:'p24 ELISA', platform:'ELISA Reader', product_type:'LV/CAR-T', status:'Qualified' },
  { name:'BSA Residual ELISA', platform:'ELISA Reader', product_type:'LV', status:'Qualified' },
  { name:'Sterility by Membrane Filtration', platform:'Isolator', product_type:'All', status:'Qualified' },
  { name:'Full/Empty Particle Ratio (AUC-FFF)', platform:'ÄKTA Pure', product_type:'AAV', status:'In Development' },
]

export default function QCModule() {
  const [results, setResults] = useState(MOCK_QC)
  const [tab, setTab] = useState('results')
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ test_name:'', batch_id:'', method:'', result_value:'', unit:'', specification:'', analyst:'Sachin Pawar', status:'Pending' })

  useEffect(() => {
    supabase.from('qc_results').select('*').then(({ data }) => {
      if (data && data.length > 0) setResults(data)
    })
  }, [])

  const saveResult = async () => {
    const { data } = await supabase.from('qc_results').insert([{ ...form, tested_at: new Date().toISOString() }]).select()
    const nr = data?.[0] || { ...form, id: Date.now().toString() }
    setResults(prev => [nr, ...prev])
    setShowNew(false)
  }

  const statusChip = { Pass:'badge-success', Fail:'badge-danger', Pending:'badge-warn', 'In Progress':'badge-info' }

  return (
    <div>
      <div className="page-title">QC Module</div>
      <div className="page-sub">Analytical results · Method library · Specifications · Batch release testing</div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {[{k:'results',l:'Test Results'},{k:'library',l:'Assay Library'},{k:'specs',l:'Specifications'}].map(t => (
            <button key={t.k} className={`btn ${tab===t.k?'btn-primary':'btn-secondary'}`} onClick={() => setTab(t.k)}>{t.l}</button>
          ))}
        </div>
        <button className="btn btn-success" onClick={() => setShowNew(true)}>+ Log Result</button>
      </div>

      <div className="grid-4 mb-6">
        {[
          { label:'Total Tests', value: results.length, sub:'This period' },
          { label:'Pass', value: results.filter(r=>r.status==='Pass').length, sub:`${Math.round(results.filter(r=>r.status==='Pass').length/results.length*100)}%`, color:'#10B981' },
          { label:'Fail', value: results.filter(r=>r.status==='Fail').length, sub:'OOS', color:'#EF4444' },
          { label:'Pending', value: results.filter(r=>r.status==='Pending').length, sub:'Awaiting', color:'#F59E0B' },
        ].map((k,i) => (
          <div key={i} className="kpi-card">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={k.color?{color:k.color}:{}}>{k.value}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {tab === 'results' && (
        <div className="card" style={{padding:0,overflow:'hidden'}}>
          <div className="overflow-auto">
            <table className="data-table">
              <thead>
                <tr><th>Batch</th><th>Test</th><th>Method</th><th>Result</th><th>Specification</th><th>Status</th><th>Analyst</th><th>Date</th></tr>
              </thead>
              <tbody>
                {results.map((r,i) => (
                  <tr key={i}>
                    <td style={{fontWeight:600,fontSize:12}}>{r.batch_id}</td>
                    <td style={{fontWeight:500}}>{r.test_name}</td>
                    <td style={{fontSize:12,color:'var(--text-2)'}}>{r.method}</td>
                    <td style={{fontWeight:600}}>{r.result_value} {r.unit}</td>
                    <td style={{fontSize:12,color:'var(--text-2)'}}>{r.specification}</td>
                    <td><span className={`kpi-badge ${statusChip[r.status]||'badge-gray'}`}>{r.status}</span></td>
                    <td style={{fontSize:12}}>{r.analyst}</td>
                    <td style={{fontSize:12,color:'var(--text-2)'}}>{r.tested_at?.slice(0,10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'library' && (
        <div className="card" style={{padding:0,overflow:'hidden'}}>
          <table className="data-table">
            <thead>
              <tr><th>Assay Name</th><th>Platform</th><th>Product Type</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {ASSAY_LIBRARY.map((a,i) => (
                <tr key={i}>
                  <td style={{fontWeight:600}}>{a.name}</td>
                  <td style={{fontSize:12,color:'var(--text-2)'}}>{a.platform}</td>
                  <td><span className="chip chip-aav" style={{fontSize:10}}>{a.product_type}</span></td>
                  <td><span className={`kpi-badge ${a.status==='Qualified'?'badge-success':'badge-warn'}`}>{a.status}</span></td>
                  <td><button className="btn btn-secondary btn-sm">Open SOP</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'specs' && (
        <div className="card">
          <div className="alert alert-info mb-4">Specifications are linked to Master Batch Records and validated analytical methods per ICH Q2(R2) guidelines.</div>
          <table className="data-table">
            <thead>
              <tr><th>Parameter</th><th>CAR-T</th><th>LV</th><th>AAV</th><th>Regulatory Basis</th></tr>
            </thead>
            <tbody>
              {[
                ['Viability','≥85%','—','—','ICH Q6B'],
                ['CAR Expression','≥50%','—','—','Product Spec'],
                ['VCN','1.5–3.0 copies/genome','—','—','EMA GTMP Guideline'],
                ['Endotoxin','<1.0 EU/mL','<1.0 EU/mL','<1.0 EU/mL','USP <85>'],
                ['Sterility','No growth 14d','No growth 14d','No growth 14d','USP <71>'],
                ['Mycoplasma','Negative','Negative','Negative','ICH Q9'],
                ['RCL','Negative','Negative','—','FDA/EMA'],
                ['Viral Titer','—','>1E8 TU/mL','>1E12 vg/mL','Product Spec'],
              ].map((row,i) => (
                <tr key={i}>
                  {row.map((cell,j) => <td key={j} style={{fontWeight:j===0?600:400,fontSize:j>0?12:13}}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showNew && (
        <div className="modal-bg" onClick={() => setShowNew(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Log QC Result</div>
              <button className="modal-close" onClick={() => setShowNew(false)}>×</button>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Batch Number</label>
                <input className="form-input" value={form.batch_id} onChange={e => setForm({...form, batch_id:e.target.value})}/>
              </div>
              <div className="form-group">
                <label className="form-label">Test Name</label>
                <select className="form-select" value={form.test_name} onChange={e => setForm({...form, test_name:e.target.value})}>
                  <option value="">Select assay...</option>
                  {ASSAY_LIBRARY.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Result Value</label>
                <input className="form-input" value={form.result_value} onChange={e => setForm({...form, result_value:e.target.value})}/>
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <input className="form-input" value={form.unit} onChange={e => setForm({...form, unit:e.target.value})} placeholder="%  copies/genome  EU/mL..."/>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Specification</label>
                <input className="form-input" value={form.specification} onChange={e => setForm({...form, specification:e.target.value})}/>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => setForm({...form, status:e.target.value})}>
                  {['Pass','Fail','Pending','In Progress'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="btn btn-primary" onClick={saveResult}>Save Result</button>
              <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
