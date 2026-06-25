import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const MOCK_PROJECTS = [
  { id:'1', name:'CD19 CAR-T Program',  type:'CART',    stage:'Phase I/II', status:'Active', owner:'Sachin Pawar' },
  { id:'2', name:'BCMA CAR-T Program',  type:'CART',    stage:'Process Dev', status:'Active', owner:'R&D Team' },
  { id:'3', name:'LV CD19 Vector Mfg',  type:'LV',      stage:'Tech Transfer', status:'Active', owner:'MFG Team' },
  { id:'4', name:'AAV9 CRISPR TCR KO',  type:'AAV',     stage:'Early Dev', status:'Active', owner:'R&D Team' },
  { id:'5', name:'LNP-mRNA Oncology',   type:'mRNA',    stage:'R&D Screen', status:'Active', owner:'R&D Team' },
  { id:'6', name:'CRISPR Base Edit HSC',type:'CRISPR',  stage:'R&D Screen', status:'Active', owner:'R&D Team' },
  { id:'7', name:'iPSC Cardiac Regen',  type:'StemCell',stage:'Discovery',  status:'Active', owner:'R&D Team' },
  { id:'8', name:'AAV8 Hemophilia B',   type:'AAV',     stage:'Construct Dev', status:'Active', owner:'R&D Team' },
  { id:'9', name:'LV BCMA Vector Mfg',  type:'LV',      stage:'Process Dev', status:'Paused', owner:'MFG Team' },
  { id:'10',name:'Plasmid MTPRS Design',type:'Plasmid', stage:'Dev',        status:'Active', owner:'Sachin Pawar' },
]

const STAGE_COLORS = {
  'Discovery':'chip-stem','R&D Screen':'chip-crispr','Construct Dev':'chip-mrna',
  'Early Dev':'chip-lv','Process Dev':'chip-lv','Tech Transfer':'chip-cart',
  'Phase I/II':'chip-aav','Dev':'chip-plasmid','Manufacturing':'chip-cart'
}

export default function Projects() {
  const [projects, setProjects] = useState(MOCK_PROJECTS)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name:'', type:'AAV', stage:'Discovery', owner:'' })
  const [filterType, setFilterType] = useState('All')

  useEffect(() => {
    supabase.from('projects').select('*').then(({ data }) => {
      if (data && data.length > 0) setProjects(data)
    })
  }, [])

  const saveProject = async () => {
    const { data } = await supabase.from('projects').insert([form]).select()
    if (data) setProjects(prev => [...prev, ...data])
    else setProjects(prev => [...prev, { ...form, id: Date.now().toString(), status:'Active' }])
    setShowModal(false)
    setForm({ name:'', type:'AAV', stage:'Discovery', owner:'' })
  }

  const filtered = filterType === 'All' ? projects : projects.filter(p => p.type === filterType)

  return (
    <div>
      <div className="page-title">Projects</div>
      <div className="page-sub">All CGT development programs — Plasmid · AAV · LV · CAR-T · CRISPR · mRNA · Stem Cell</div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {['All','CART','LV','AAV','CRISPR','mRNA','StemCell','Plasmid'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`btn btn-sm ${filterType === t ? 'btn-primary' : 'btn-secondary'}`}
            >{t}</button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
      </div>

      <div className="grid-3">
        {filtered.map(p => (
          <div key={p.id} className="card">
            <div className="flex items-center justify-between mb-3">
              <span className={`chip chip-${p.type?.toLowerCase()}`}>{p.type}</span>
              <span className="text-sm text-muted">{p.status}</span>
            </div>
            <div style={{fontWeight:700, fontSize:14, marginBottom:4}}>{p.name}</div>
            <div style={{fontSize:12, color:'var(--text-2)', marginBottom:10}}>{p.owner}</div>
            <div className="flex items-center justify-between">
              <span className={`chip ${STAGE_COLORS[p.stage]||'chip-plasmid'}`}>{p.stage}</span>
              <button className="btn btn-secondary btn-sm">Open →</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-bg" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">New Project</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="form-group">
              <label className="form-label">Project Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="e.g. CD19 CAR-T Phase II"/>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Modality</label>
                <select className="form-select" value={form.type} onChange={e => setForm({...form, type:e.target.value})}>
                  {['AAV','LV','CART','Plasmid','CRISPR','mRNA','StemCell'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Stage</label>
                <select className="form-select" value={form.stage} onChange={e => setForm({...form, stage:e.target.value})}>
                  {['Discovery','R&D Screen','Construct Dev','Early Dev','Process Dev','Tech Transfer','Phase I/II','Manufacturing'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Owner</label>
              <input className="form-input" value={form.owner} onChange={e => setForm({...form, owner:e.target.value})} placeholder="Scientist name"/>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="btn btn-primary" onClick={saveProject}>Create Project</button>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
