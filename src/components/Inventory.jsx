import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const MOCK_REAGENTS = [
  { id:'1', name:'MiQuant CAR-T Cell Lenti dPCR Kit', catalog_number:'MI-001', supplier:'Miltenyi Biotec', lot_number:'LOT-2024-0451', quantity:2, unit:'kit', location:'QC2 -20°C Fridge-1', expiry_date:'2025-03-15', status:'Low Stock', critical_material:true },
  { id:'2', name:'NucleoSpin Tissue gDNA Kit', catalog_number:'740952.250', supplier:'Macherey-Nagel', lot_number:'LOT-2024-0312', quantity:5, unit:'kit', location:'QC2 Store', expiry_date:'2026-01-10', status:'Available', critical_material:true },
  { id:'3', name:'QIAcuity 96-well Nanoplate 26k', catalog_number:'250003', supplier:'QIAGEN', lot_number:'LOT-2024-0089', quantity:8, unit:'plate', location:'QC2 Store', expiry_date:'2025-09-01', status:'Available', critical_material:true },
  { id:'4', name:'Limulus Amebocyte Lysate (LAL) KTA', catalog_number:'N/A', supplier:'Associates of Cape Cod', lot_number:'LOT-2024-0201', quantity:3, unit:'kit', location:'QC1 4°C', expiry_date:'2025-06-20', status:'Available', critical_material:true },
  { id:'5', name:'CD3/CD28 Dynabeads', catalog_number:'11141D', supplier:'Thermo Fisher', lot_number:'LOT-2024-0115', quantity:10, unit:'vial', location:'MFG -20°C', expiry_date:'2025-11-30', status:'Available', critical_material:false },
  { id:'6', name:'RetroNectin (rhFibronectin)', catalog_number:'T100A', supplier:'Takara', lot_number:'LOT-2024-0302', quantity:4, unit:'vial', location:'MFG -20°C', expiry_date:'2025-08-15', status:'Available', critical_material:true },
  { id:'7', name:'Human AB Serum', catalog_number:'14-490E', supplier:'Lonza', lot_number:'LOT-2024-0220', quantity:1, unit:'lot', location:'MFG -80°C', expiry_date:'2025-12-01', status:'Low Stock', critical_material:false },
]

export default function Inventory() {
  const [reagents, setReagents] = useState(MOCK_REAGENTS)
  const [tab, setTab] = useState('reagents')
  const [showNew, setShowNew] = useState(false)
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState({ name:'', catalog_number:'', supplier:'', lot_number:'', quantity:'', unit:'', location:'', expiry_date:'', critical_material:false })

  useEffect(() => {
    supabase.from('reagents').select('*').then(({ data }) => {
      if (data && data.length > 0) setReagents(data)
    })
  }, [])

  const addReagent = async () => {
    const { data } = await supabase.from('reagents').insert([{ ...form, status:'Available' }]).select()
    setReagents(prev => [...prev, data?.[0] || { ...form, id: Date.now().toString(), status:'Available' }])
    setShowNew(false)
  }

  const filtered = reagents.filter(r => r.name?.toLowerCase().includes(filter.toLowerCase()) || r.supplier?.toLowerCase().includes(filter.toLowerCase()))
  const lowStock = reagents.filter(r => r.status === 'Low Stock')
  const expiringSoon = reagents.filter(r => {
    if (!r.expiry_date) return false
    const diff = (new Date(r.expiry_date) - new Date()) / (1000*60*60*24)
    return diff < 90
  })

  const statusDot = { Available:'dot-green', 'Low Stock':'dot-amber', 'Out of Stock':'dot-red', Expired:'dot-red', Quarantine:'dot-amber' }

  return (
    <div>
      <div className="page-title">Inventory Management</div>
      <div className="page-sub">GMP reagents · Critical materials · Expiry tracking · Purchase requests</div>

      <div className="grid-4 mb-6">
        <div className="kpi-card">
          <div className="kpi-label">Total Items</div>
          <div className="kpi-value">{reagents.length}</div>
          <div className="kpi-sub">Across all stores</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Critical Materials</div>
          <div className="kpi-value">{reagents.filter(r => r.critical_material).length}</div>
          <div className="kpi-sub">GMP critical</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Low Stock Alerts</div>
          <div className="kpi-value" style={{color:'#F59E0B'}}>{lowStock.length}</div>
          <div className="kpi-sub">Need reorder</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Expiring &lt;90d</div>
          <div className="kpi-value" style={{color:'#EF4444'}}>{expiringSoon.length}</div>
          <div className="kpi-sub">Check usage</div>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="alert alert-warn mb-4">
          ⚠️ <strong>Low Stock Alert:</strong> {lowStock.map(r => r.name).join(' · ')}
          <button className="btn btn-secondary btn-sm" style={{marginLeft:'auto'}}>Raise Purchase Order</button>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {[{k:'reagents',l:'Reagents'},{k:'purchase',l:'Purchase Orders'},{k:'store',l:'Store Locations'}].map(t => (
            <button key={t.k} className={`btn ${tab===t.k?'btn-primary':'btn-secondary'}`} onClick={() => setTab(t.k)}>{t.l}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="form-input" style={{width:200}} placeholder="Search reagents..." value={filter} onChange={e => setFilter(e.target.value)}/>
          <button className="btn btn-primary" onClick={() => setShowNew(true)}>+ Add Item</button>
        </div>
      </div>

      {tab === 'reagents' && (
        <div className="card" style={{padding:0,overflow:'hidden'}}>
          <div className="overflow-auto">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Catalog #</th><th>Supplier</th><th>Lot #</th><th>Qty</th><th>Location</th><th>Expiry</th><th>Status</th><th>Critical</th></tr>
              </thead>
              <tbody>
                {filtered.map((r,i) => (
                  <tr key={i}>
                    <td style={{fontWeight:600,maxWidth:200}}>{r.name}</td>
                    <td style={{fontSize:12,color:'var(--text-2)'}}>{r.catalog_number}</td>
                    <td style={{fontSize:12}}>{r.supplier}</td>
                    <td style={{fontSize:11,color:'var(--text-2)'}}>{r.lot_number}</td>
                    <td style={{fontWeight:600}}>{r.quantity} {r.unit}</td>
                    <td style={{fontSize:12}}>{r.location}</td>
                    <td style={{fontSize:12}}>{r.expiry_date}</td>
                    <td><span className={`status-dot ${statusDot[r.status]||'dot-gray'}`}/>{r.status}</td>
                    <td>{r.critical_material ? '⭐ Yes' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'purchase' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="section-title" style={{marginBottom:0}}>Purchase Orders</div>
            <button className="btn btn-primary btn-sm">+ New PO</button>
          </div>
          {[
            { po:'PR-2024-0234', item:'MiQuant CAR-T Lenti dPCR Kit (×5)', supplier:'Miltenyi Biotec', status:'Ordered', date:'2024-05-20', amount:'₹2,45,000' },
            { po:'PR-2024-0230', item:'QIAcuity 96-well Nanoplate 26k (×20)', supplier:'QIAGEN', status:'Delivered', date:'2024-05-15', amount:'₹1,80,000' },
            { po:'PR-2024-0228', item:'NucleoSpin Tissue Kit ×10', supplier:'Macherey-Nagel', status:'Delivered', date:'2024-05-08', amount:'₹95,000' },
          ].map((po,i) => (
            <div key={i} style={{border:'1px solid var(--border)',borderRadius:8,padding:12,marginBottom:8}}>
              <div className="flex items-center justify-between mb-1">
                <span style={{fontWeight:700,color:'#2563EB',fontSize:13}}>{po.po}</span>
                <span className={`kpi-badge ${po.status==='Delivered'?'badge-success':'badge-info'}`}>{po.status}</span>
              </div>
              <div style={{fontWeight:500,fontSize:13,marginBottom:4}}>{po.item}</div>
              <div className="flex items-center justify-between" style={{fontSize:12,color:'var(--text-2)'}}>
                <span>{po.supplier} · {po.date}</span>
                <span style={{fontWeight:600,color:'var(--text)'}}>{po.amount}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'store' && (
        <div className="grid-3">
          {[
            { loc:'QC2 -20°C Fridge-1', items:['MiQuant Kit','QIAcuity Plates'], count:3, temp:'-20°C' },
            { loc:'QC2 Store (Ambient)', items:['NucleoSpin Kit','Consumables'], count:8, temp:'15–25°C' },
            { loc:'MFG -80°C', items:['Human AB Serum','Plasmid stocks'], count:5, temp:'-80°C' },
            { loc:'MFG -20°C', items:['CD3/CD28 Dynabeads','RetroNectin'], count:7, temp:'-20°C' },
            { loc:'QC1 4°C', items:['LAL Kit','ELISA reagents'], count:4, temp:'2–8°C' },
            { loc:'Common Store', items:['Lab consumables','Plasticware'], count:42, temp:'Ambient' },
          ].map((s,i) => (
            <div key={i} className="card card-sm">
              <div style={{fontWeight:700,fontSize:13,marginBottom:6}}>{s.loc}</div>
              <div className="kpi-badge badge-info" style={{fontSize:11,marginBottom:8}}>{s.temp}</div>
              <div style={{fontSize:12,color:'var(--text-2)',marginBottom:4}}>{s.items.join(' · ')}</div>
              <div style={{fontSize:11,color:'var(--text-2)'}}>{s.count} items tracked</div>
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <div className="modal-bg" onClick={() => setShowNew(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add Inventory Item</div>
              <button className="modal-close" onClick={() => setShowNew(false)}>×</button>
            </div>
            <div className="form-group">
              <label className="form-label">Item Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({...form, name:e.target.value})}/>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Catalog #</label>
                <input className="form-input" value={form.catalog_number} onChange={e => setForm({...form, catalog_number:e.target.value})}/>
              </div>
              <div className="form-group">
                <label className="form-label">Supplier</label>
                <input className="form-input" value={form.supplier} onChange={e => setForm({...form, supplier:e.target.value})}/>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Lot Number</label>
                <input className="form-input" value={form.lot_number} onChange={e => setForm({...form, lot_number:e.target.value})}/>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input className="form-input" value={form.quantity} onChange={e => setForm({...form, quantity:e.target.value})}/>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Unit</label>
                <input className="form-input" value={form.unit} onChange={e => setForm({...form, unit:e.target.value})} placeholder="kit / vial / plate ..."/>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" value={form.location} onChange={e => setForm({...form, location:e.target.value})}/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Expiry Date</label>
              <input type="date" className="form-input" value={form.expiry_date} onChange={e => setForm({...form, expiry_date:e.target.value})}/>
            </div>
            <div className="form-group">
              <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
                <input type="checkbox" checked={form.critical_material} onChange={e => setForm({...form, critical_material:e.target.checked})}/>
                <span className="form-label" style={{margin:0}}>GMP Critical Material</span>
              </label>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="btn btn-primary" onClick={addReagent}>Add Item</button>
              <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
