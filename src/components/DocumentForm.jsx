import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { SIGNATURE_CHAIN, STATUS_COLORS } from '../lib/workflowConfig'
import { TEMPLATE_FIELDS } from '../lib/templateFields'

export default function DocumentForm({ doc, request, onBack }) {
  const [content, setContent] = useState(doc.content || {})
  const [sigs, setSigs] = useState([])
  const [signOpen, setSignOpen] = useState(null)
  const [signData, setSignData] = useState({ name:'', designation:'', department:'QC2', comments:'' })
  const [saving, setSaving] = useState(false)

  const fields = TEMPLATE_FIELDS[doc.doc_type] || TEMPLATE_FIELDS.GENERIC

  useEffect(() => {
    supabase.from('eq_doc_signatures').select('*').eq('document_id', doc.id).order('step_order').then(({ data }) => {
      setSigs(data && data.length ? data : SIGNATURE_CHAIN.map((s,i)=>({ id:`local-${i}`, role_label:s.role_label, step_order:s.order, status:'Pending' })))
    })
  }, [doc.id])

  const saveContent = async () => {
    setSaving(true)
    await supabase.from('eq_documents').update({ content }).eq('id', doc.id)
    await supabase.from('eq_activity_log').insert([{ request_id:request.id, actor:'Sachin Pawar', action:`${doc.title} (${doc.doc_number}) saved`, detail:'Form content updated' }])
    setSaving(false)
  }

  const signStep = async (sig, decision) => {
    const patch = {
      status: decision, name:signData.name, designation:signData.designation,
      department:signData.department, comments:signData.comments, signed_at:new Date().toISOString()
    }
    await supabase.from('eq_doc_signatures').update(patch).eq('id', sig.id)
    setSigs(prev => prev.map(s => s.id===sig.id ? { ...s, ...patch } : s))

    // update document status based on chain progress
    let newStatus = doc.status, newStage = sig.role_label
    if (decision==='Signed') {
      if (sig.step_order === 5) { newStatus='Authorized'; newStage='Authorized' }
      else if (sig.step_order === 4) { newStatus='Approved'; newStage='Approved' }
      else if (sig.step_order === 3) { newStatus='Reviewed'; newStage='Reviewed (QA / CFT)' }
      else if (sig.step_order === 2) { newStatus='Under Review'; newStage='Reviewed (User Dept)' }
      else { newStatus='Under Review'; newStage='Prepared' }
    } else if (decision==='Rejected') { newStatus='Rejected' }

    await supabase.from('eq_documents').update({ status:newStatus, current_stage:newStage }).eq('id', doc.id)
    await supabase.from('eq_activity_log').insert([{
      request_id:request.id, actor:signData.name||'Sachin Pawar',
      action:`${doc.doc_number}: ${sig.role_label} ${decision}`, detail:signData.comments
    }])
    setSignOpen(null)
    setSignData({ name:'', designation:'', department:'QC2', comments:'' })
  }

  const isFinalized = doc.status==='Authorized' || doc.status==='Effective'
  const currentStepOrder = sigs.find(s => s.status==='Pending')?.step_order || 99

  const setField = (key, val) => setContent(prev => ({ ...prev, [key]: val }))

  const printDoc = () => window.print()

  return (
    <div>
      {/* print styles */}
      <style>{`
        @media print {
          .no-print { display:none !important; }
          .print-area { box-shadow:none !important; border:none !important; }
          body { background:#fff !important; }
        }
      `}</style>

      <div className="no-print">
        <button className="btn btn-secondary btn-sm mb-4" onClick={onBack}>← Back to qualification track</button>
      </div>

      <div className="flex items-center justify-between mb-4 no-print">
        <div>
          <div className="page-title" style={{marginBottom:2}}>{doc.title}</div>
          <div style={{fontSize:12,color:'var(--text-2)'}}>
            {doc.doc_number} · Template {doc.template_ref} · {request.equipment_name}
          </div>
        </div>
        <span className="kpi-badge" style={{background:`${STATUS_COLORS[doc.status]||'#9CA3AF'}22`,color:STATUS_COLORS[doc.status]||'#9CA3AF',fontSize:13,padding:'6px 14px'}}>
          {doc.status}
        </span>
      </div>

      {isFinalized && (
        <div className="alert alert-success mb-4 no-print">
          ✅ Document fully authorized. This is the finalized record — you can print a controlled copy.
        </div>
      )}

      <div className="grid-2" style={{gridTemplateColumns:'1.6fr 1fr',alignItems:'flex-start'}}>
        {/* ===== FORM ===== */}
        <div className="card print-area">
          {/* Document header block (prints) */}
          <div style={{borderBottom:'2px solid #0F2044',paddingBottom:12,marginBottom:16}}>
            <div className="flex items-center justify-between">
              <div style={{fontWeight:700,fontSize:16,color:'#0F2044'}}>{doc.title}</div>
              <div style={{textAlign:'right',fontSize:11,color:'var(--text-2)'}}>
                <div><strong>Doc No:</strong> {doc.doc_number}</div>
                <div><strong>Template:</strong> {doc.template_ref}</div>
              </div>
            </div>
            <div style={{fontSize:12,color:'var(--text-2)',marginTop:4}}>
              {request.equipment_name} · {request.make_model} · ID: {request.equipment_id||'—'}
            </div>
          </div>

          {fields.map(section => (
            <div key={section.section} style={{marginBottom:18}}>
              <div style={{fontWeight:700,fontSize:13,color:'#1A3A6B',marginBottom:8,paddingBottom:4,borderBottom:'1px solid var(--border)'}}>{section.section}</div>
              {section.fields.map(f => (
                <div className="form-group" key={f.key} style={{marginBottom:10}}>
                  <label className="form-label">{f.label}</label>
                  {f.type==='textarea'
                    ? <textarea className="form-textarea" disabled={isFinalized} value={content[f.key]||''} onChange={e=>setField(f.key,e.target.value)} placeholder={f.placeholder||''}/>
                    : f.type==='select'
                    ? <select className="form-select" disabled={isFinalized} value={content[f.key]||''} onChange={e=>setField(f.key,e.target.value)}>
                        <option value="">Select…</option>
                        {f.options.map(o => <option key={o}>{o}</option>)}
                      </select>
                    : <input className="form-input" disabled={isFinalized} value={content[f.key]||''} onChange={e=>setField(f.key,e.target.value)} placeholder={f.placeholder||''}/>
                  }
                </div>
              ))}
            </div>
          ))}

          {/* Signatory block (prints) */}
          <div style={{marginTop:20,borderTop:'2px solid #0F2044',paddingTop:12}}>
            <div style={{fontWeight:700,fontSize:13,color:'#1A3A6B',marginBottom:10}}>APPROVALS</div>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
              <thead>
                <tr style={{background:'#F9FAFB'}}>
                  <th style={{textAlign:'left',padding:'6px 8px',border:'1px solid var(--border)'}}>Role</th>
                  <th style={{textAlign:'left',padding:'6px 8px',border:'1px solid var(--border)'}}>Name</th>
                  <th style={{textAlign:'left',padding:'6px 8px',border:'1px solid var(--border)'}}>Designation</th>
                  <th style={{textAlign:'left',padding:'6px 8px',border:'1px solid var(--border)'}}>Signature & Date</th>
                </tr>
              </thead>
              <tbody>
                {sigs.map(s => (
                  <tr key={s.id}>
                    <td style={{padding:'6px 8px',border:'1px solid var(--border)',fontWeight:600}}>{s.role_label}</td>
                    <td style={{padding:'6px 8px',border:'1px solid var(--border)'}}>{s.name||'—'}</td>
                    <td style={{padding:'6px 8px',border:'1px solid var(--border)'}}>{s.designation||'—'}</td>
                    <td style={{padding:'6px 8px',border:'1px solid var(--border)'}}>
                      {s.status==='Signed' ? `✔ ${s.name} · ${new Date(s.signed_at).toLocaleDateString('en-IN')}` : s.status==='Rejected'?'✗ Rejected':'—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2 mt-4 no-print">
            {!isFinalized && <button className="btn btn-primary btn-sm" onClick={saveContent} disabled={saving}>{saving?'Saving…':'Save Form'}</button>}
            <button className="btn btn-secondary btn-sm" onClick={printDoc}>🖨 Print{isFinalized?' Controlled Copy':' Draft'}</button>
          </div>
        </div>

        {/* ===== ROUTING PANEL ===== */}
        <div className="card no-print">
          <div className="section-title">Routing & Signatures</div>
          <div style={{fontSize:11,color:'var(--text-2)',marginBottom:12}}>
            Live status. Each role signs in sequence. The next role can act only after the previous signs.
          </div>
          {sigs.map((s,i) => {
            const canAct = s.status==='Pending' && s.step_order===currentStepOrder
            const done = s.status==='Signed'
            const rejected = s.status==='Rejected'
            const color = done?'#10B981':rejected?'#EF4444':canAct?'#3B82F6':'#D1D5DB'
            return (
              <div key={s.id} style={{marginBottom:10}}>
                <div style={{display:'flex',gap:10}}>
                  <div style={{width:26,height:26,borderRadius:'50%',background:color,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:11,flexShrink:0}}>
                    {done?'✓':rejected?'✗':s.step_order}
                  </div>
                  <div style={{flex:1,background:canAct?'#EFF6FF':'#F9FAFB',borderRadius:8,padding:'8px 10px',border:canAct?'1px solid #93C5FD':'1px solid var(--border)'}}>
                    <div className="flex items-center justify-between">
                      <span style={{fontWeight:600,fontSize:12}}>{s.role_label}</span>
                      <span className="kpi-badge" style={{background:`${color}22`,color,fontSize:10}}>{s.status}</span>
                    </div>
                    {done && <div style={{fontSize:10,color:'var(--text-2)',marginTop:2}}>{s.name} · {s.designation}</div>}
                    {s.comments && <div style={{fontSize:10,marginTop:4,padding:'3px 6px',background:'#fff',borderRadius:4}}>💬 {s.comments}</div>}
                    {canAct && signOpen!==s.id && (
                      <button className="btn btn-primary btn-sm" style={{marginTop:6}} onClick={()=>setSignOpen(s.id)}>Sign / Act</button>
                    )}
                    {canAct && signOpen===s.id && (
                      <div style={{marginTop:8}}>
                        <input className="form-input" style={{marginBottom:6}} placeholder="Name" value={signData.name} onChange={e=>setSignData({...signData,name:e.target.value})}/>
                        <input className="form-input" style={{marginBottom:6}} placeholder="Designation" value={signData.designation} onChange={e=>setSignData({...signData,designation:e.target.value})}/>
                        <input className="form-input" style={{marginBottom:6}} placeholder="Department" value={signData.department} onChange={e=>setSignData({...signData,department:e.target.value})}/>
                        <textarea className="form-textarea" style={{minHeight:44,marginBottom:6}} placeholder="Comments (optional)" value={signData.comments} onChange={e=>setSignData({...signData,comments:e.target.value})}/>
                        <div className="flex gap-2">
                          <button className="btn btn-success btn-sm" onClick={()=>signStep(s,'Signed')} disabled={!signData.name}>Sign</button>
                          <button className="btn btn-danger btn-sm" onClick={()=>signStep(s,'Rejected')} disabled={!signData.name}>Reject</button>
                          <button className="btn btn-secondary btn-sm" onClick={()=>setSignOpen(null)}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {i<sigs.length-1 && <div style={{width:2,height:8,background:'#E5E7EB',marginLeft:12}}/>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
