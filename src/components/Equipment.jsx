import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const MOCK_EQ = [
  { id:'1', name:'QIAcuity One (5-plex)', equipment_id:'EQ-QIA-001', location:'QC2 Lab', status:'Available', last_pm:'2024-02-15', next_pm:'2024-08-15', qualification_status:'Qualified' },
  { id:'2', name:'BD FACSCanto II', equipment_id:'EQ-BD-001', location:'QC1 Lab', status:'In Use', last_pm:'2024-03-01', next_pm:'2024-09-01', qualification_status:'Qualified' },
  { id:'3', name:'Vi-Cell BLU (Beckman)', equipment_id:'EQ-BC-001', location:'QC1 Lab', status:'Available', last_pm:'2024-04-10', next_pm:'2024-10-10', qualification_status:'Qualified' },
  { id:'4', name:'QX200 ddPCR System', equipment_id:'EQ-BIO-001', location:'QC2 Lab', status:'Maintenance', last_pm:'2024-05-01', next_pm:'2024-11-01', qualification_status:'Qualified' },
  { id:'5', name:'LAL Microplate Reader', equipment_id:'EQ-LAL-001', location:'QC1 Lab', status:'Available', last_pm:'2024-01-20', next_pm:'2024-07-20', qualification_status:'Qualified' },
  { id:'6', name:'G-Rex 6M Bioreactor System', equipment_id:'EQ-MFG-001', location:'MFG Suite 3A', status:'In Use', last_pm:'2024-04-01', next_pm:'2024-10-01', qualification_status:'Qualified' },
]

const MOCK_BOOKINGS = [
  { equipment_id:'EQ-QIA-001', booked_by:'Sachin Pawar', start_time:'2024-05-23 10:00', end_time:'2024-05-23 13:00', purpose:'VCN dPCR — BCMA-CAR-T-009' },
  { equipment_id:'EQ-BD-001', booked_by:'QC-02', start_time:'2024-05-23 09:00', end_time:'2024-05-23 12:00', purpose:'CAR Expression Flow — CD19 batch 024' },
  { equipment_id:'EQ-QIA-001', booked_by:'QC-03', start_time:'2024-05-24 09:00', end_time:'2024-05-24 12:00', purpose:'RCL dPCR — LV-CD19-031' },
]

export default function Equipment() {
  const [equipment, setEquipment] = useState(MOCK_EQ)
  const [bookings, setBookings] = useState(MOCK_BOOKINGS)
  const [showBook, setShowBook] = useState(false)
  const [selectedEq, setSelectedEq] = useState(null)
  const [bookForm, setBookForm] = useState({ booked_by:'Sachin Pawar', start_time:'', end_time:'', purpose:'' })
  const [tab, setTab] = useState('equipment')

  useEffect(() => {
    supabase.from('equipment').select('*').then(({ data }) => {
      if (data && data.length > 0) setEquipment(data)
    })
    supabase.from('equipment_bookings').select('*').then(({ data }) => {
      if (data && data.length > 0) setBookings(data)
    })
  }, [])

  const bookEquipment = async () => {
    if (!selectedEq) return
    const payload = { ...bookForm, equipment_id: selectedEq.id || selectedEq.equipment_id }
    const { data } = await supabase.from('equipment_bookings').insert([payload]).select()
    setBookings(prev => [...prev, data?.[0] || { ...payload, id: Date.now().toString() }])
    setShowBook(false)
  }

  const statusStyle = { Available:'dot-green', 'In Use':'dot-blue', Maintenance:'dot-red', 'Out of Service':'dot-red' }
  const qualBadge   = { Qualified:'badge-success', 'Requalification Due':'badge-warn', 'Out of Qualification':'badge-danger' }

  const pmDaysDue = (date) => {
    if (!date) return 999
    return Math.round((new Date(date) - new Date()) / (1000*60*60*24))
  }

  return (
    <div>
      <div className="page-title">Equipment Management</div>
      <div className="page-sub">GMP equipment · Qualification status · PM scheduling · Booking calendar</div>

      <div className="grid-4 mb-6">
        <div className="kpi-card">
          <div className="kpi-label">Total Equipment</div>
          <div className="kpi-value">{equipment.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Available</div>
          <div className="kpi-value" style={{color:'#10B981'}}>{equipment.filter(e=>e.status==='Available').length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">In Use</div>
          <div className="kpi-value" style={{color:'#2563EB'}}>{equipment.filter(e=>e.status==='In Use').length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">PM Overdue</div>
          <div className="kpi-value" style={{color:'#EF4444'}}>{equipment.filter(e=>pmDaysDue(e.next_pm)<0).length}</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {[{k:'equipment',l:'Equipment List'},{k:'bookings',l:'Bookings'},{k:'pm',l:'PM Schedule'}].map(t => (
            <button key={t.k} className={`btn ${tab===t.k?'btn-primary':'btn-secondary'}`} onClick={() => setTab(t.k)}>{t.l}</button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setShowBook(true)}>+ Book Equipment</button>
      </div>

      {tab === 'equipment' && (
        <div className="grid-2">
          {equipment.map((e,i) => (
            <div key={i} className="card">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div style={{fontWeight:700,fontSize:14}}>{e.name}</div>
                  <div style={{fontSize:11,color:'var(--text-2)'}}>{e.equipment_id} · {e.location}</div>
                </div>
                <span><span className={`status-dot ${statusStyle[e.status]||'dot-gray'}`}/>{e.status}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className={`kpi-badge ${qualBadge[e.qualification_status]||'badge-gray'}`}>{e.qualification_status}</span>
                <span style={{fontSize:11,color: pmDaysDue(e.next_pm)<30?'#EF4444':'var(--text-2)'}}>
                  PM: {e.next_pm} ({pmDaysDue(e.next_pm)}d)
                </span>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedEq(e); setShowBook(true) }}>Book</button>
                <button className="btn btn-secondary btn-sm">Logbook</button>
                <button className="btn btn-secondary btn-sm">PM Record</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'bookings' && (
        <div className="card" style={{padding:0,overflow:'hidden'}}>
          <table className="data-table">
            <thead>
              <tr><th>Equipment</th><th>Booked By</th><th>Start</th><th>End</th><th>Purpose</th></tr>
            </thead>
            <tbody>
              {bookings.map((b,i) => (
                <tr key={i}>
                  <td style={{fontWeight:600}}>{b.equipment_id}</td>
                  <td>{b.booked_by}</td>
                  <td style={{fontSize:12}}>{b.start_time}</td>
                  <td style={{fontSize:12}}>{b.end_time}</td>
                  <td style={{fontSize:12,maxWidth:250}}>{b.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'pm' && (
        <div className="card">
          <div className="section-title">Preventive Maintenance Schedule</div>
          <table className="data-table">
            <thead>
              <tr><th>Equipment</th><th>Equipment ID</th><th>Last PM</th><th>Next PM Due</th><th>Days Until Due</th><th>Status</th></tr>
            </thead>
            <tbody>
              {equipment.map((e,i) => {
                const days = pmDaysDue(e.next_pm)
                return (
                  <tr key={i}>
                    <td style={{fontWeight:600}}>{e.name}</td>
                    <td style={{fontSize:12,color:'var(--text-2)'}}>{e.equipment_id}</td>
                    <td style={{fontSize:12}}>{e.last_pm}</td>
                    <td style={{fontSize:12}}>{e.next_pm}</td>
                    <td style={{fontWeight:600,color:days<0?'#EF4444':days<30?'#F59E0B':'#10B981'}}>{days < 0 ? `${Math.abs(days)}d OVERDUE` : `${days}d`}</td>
                    <td><span className={`kpi-badge ${days<0?'badge-danger':days<30?'badge-warn':'badge-success'}`}>{days<0?'Overdue':days<30?'Due Soon':'OK'}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showBook && (
        <div className="modal-bg" onClick={() => setShowBook(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Book Equipment</div>
              <button className="modal-close" onClick={() => setShowBook(false)}>×</button>
            </div>
            <div className="form-group">
              <label className="form-label">Equipment</label>
              <select className="form-select" onChange={e => setSelectedEq(equipment.find(eq => eq.equipment_id === e.target.value))}>
                <option value="">Select equipment...</option>
                {equipment.filter(e=>e.status==='Available').map(e => <option key={e.equipment_id} value={e.equipment_id}>{e.name} — {e.location}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Booked By</label>
              <input className="form-input" value={bookForm.booked_by} onChange={e => setBookForm({...bookForm, booked_by:e.target.value})}/>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input type="datetime-local" className="form-input" value={bookForm.start_time} onChange={e => setBookForm({...bookForm, start_time:e.target.value})}/>
              </div>
              <div className="form-group">
                <label className="form-label">End Time</label>
                <input type="datetime-local" className="form-input" value={bookForm.end_time} onChange={e => setBookForm({...bookForm, end_time:e.target.value})}/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Purpose / Batch</label>
              <input className="form-input" value={bookForm.purpose} onChange={e => setBookForm({...bookForm, purpose:e.target.value})} placeholder="e.g. VCN dPCR — CD19-CAR-T-024"/>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="btn btn-primary" onClick={bookEquipment}>Confirm Booking</button>
              <button className="btn btn-secondary" onClick={() => setShowBook(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
