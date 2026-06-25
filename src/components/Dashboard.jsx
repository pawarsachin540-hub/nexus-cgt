import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

const MOCK = {
  batches: [
    { batch_number:'CD19-CAR-T-024', product_type:'CART', status:'In Progress', viability:94.2, car_expression:76.3, vcn:2.1 },
    { batch_number:'BCMA-CAR-T-009', product_type:'CART', status:'QC Hold', viability:88.5, car_expression:68.1, vcn:1.8 },
    { batch_number:'LV-CD19-031',    product_type:'LV',   status:'Released',    yield_value:3.2, yield_unit:'E8 TU/mL' },
    { batch_number:'AAV9-CRISPR-006', product_type:'AAV', status:'In Progress', yield_value:1.9, yield_unit:'E12 vg/mL' },
  ],
  qcChart: [
    { name:'Jan', pass:18, fail:1, pending:3 },
    { name:'Feb', pass:22, fail:2, pending:2 },
    { name:'Mar', pass:25, fail:0, pending:4 },
    { name:'Apr', pass:19, fail:3, pending:5 },
    { name:'May', pass:28, fail:1, pending:2 },
  ],
  yieldTrend: [
    { batch:'018', vcn:1.9 }, { batch:'019', vcn:2.0 }, { batch:'020', vcn:1.8 },
    { batch:'021', vcn:2.2 }, { batch:'022', vcn:2.1 }, { batch:'023', vcn:2.3 }, { batch:'024', vcn:2.1 },
  ],
  projectMix: [
    { name:'CAR-T', value:4, color:'#3B82F6' },
    { name:'LV',    value:3, color:'#10B981' },
    { name:'AAV',   value:2, color:'#8B5CF6' },
    { name:'CRISPR',value:2, color:'#F59E0B' },
    { name:'mRNA',  value:1, color:'#EC4899' },
  ],
  notifications: [
    { type:'warn',    msg:'BCMA-CAR-T-009: OOT VCN result — investigation required', time:'2h ago' },
    { type:'info',    msg:'LV-CD19-031 batch released successfully', time:'4h ago' },
    { type:'danger',  msg:'QIAcuity One PM due — book ASAP', time:'1d ago' },
    { type:'success', msg:'CD19 dPCR MVFP training completed — 3 analysts', time:'2d ago' },
    { type:'warn',    msg:'Reagent low stock: MiQuant CAR-T Lenti dPCR Kit (2 left)', time:'3d ago' },
  ],
  tasks: [
    { title:'Review VCN data for BCMA batch 009', due:'Today', priority:'High' },
    { title:'Update MVFP for QIAcuity One platform', due:'Tomorrow', priority:'High' },
    { title:'Equipment booking — Flow Cytometer', due:'Today', priority:'Med' },
    { title:'Endotoxin method verification report sign-off', due:'This week', priority:'Med' },
    { title:'Update SOP-QC-VCN-003 v2.0', due:'This week', priority:'Low' },
  ]
}

export default function Dashboard() {
  const [batches, setBatches] = useState(MOCK.batches)

  useEffect(() => {
    supabase.from('batches').select('*').limit(6).then(({ data }) => {
      if (data && data.length > 0) setBatches(data)
    })
  }, [])

  const statuses = {
    'In Progress': 'dot-blue',
    'Released': 'dot-green',
    'QC Hold': 'dot-red',
    'Pending Release': 'dot-amber',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="page-title">NEXUS CGT Platform</div>
          <div className="page-sub">Integrated Cell &amp; Gene Therapy Development — GMP Compliant Enterprise</div>
        </div>
        <div className="text-sm text-muted">{new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
      </div>

      <div className="mb-6">
        {MOCK.notifications.slice(0,2).map((n,i) => (
          <div key={i} className={`alert alert-${n.type}`}>
            <span style={{fontSize:16}}>
              {n.type==='warn'?'⚠️':n.type==='danger'?'🔴':n.type==='success'?'✅':'ℹ️'}
            </span>
            <span style={{flex:1}}>{n.msg}</span>
            <span className="text-sm" style={{opacity:0.6}}>{n.time}</span>
          </div>
        ))}
      </div>

      <div className="grid-4 mb-6">
        <div className="kpi-card">
          <div className="kpi-label">Active Batches</div>
          <div className="kpi-value">4</div>
          <div className="kpi-sub">CAR-T: 2 · LV: 1 · AAV: 1</div>
          <span className="kpi-badge badge-info">2 In Progress</span>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">QC Tests This Month</div>
          <div className="kpi-value">28</div>
          <div className="kpi-sub">Pass rate: 96.4%</div>
          <span className="kpi-badge badge-success">96.4% Pass</span>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Open Deviations</div>
          <div className="kpi-value">3</div>
          <div className="kpi-sub">1 major · 2 minor</div>
          <span className="kpi-badge badge-warn">1 Major</span>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Active Projects</div>
          <div className="kpi-value">12</div>
          <div className="kpi-sub">5 platforms · 12 programs</div>
          <span className="kpi-badge badge-gray">Multi-Platform</span>
        </div>
      </div>

      <div className="grid-3 mb-6">
        <div className="card" style={{gridColumn:'span 2'}}>
          <div className="section-title">QC Results — Monthly Trend</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={MOCK.qcChart} margin={{top:0,right:0,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0"/>
              <XAxis dataKey="name" style={{fontSize:11}}/>
              <YAxis style={{fontSize:11}}/>
              <Tooltip/>
              <Bar dataKey="pass"    fill="#10B981" radius={[3,3,0,0]}/>
              <Bar dataKey="fail"    fill="#EF4444" radius={[3,3,0,0]}/>
              <Bar dataKey="pending" fill="#F59E0B" radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2" style={{fontSize:11,color:'var(--text-2)'}}>
            <span><span style={{display:'inline-block',width:8,height:8,borderRadius:2,background:'#10B981',marginRight:4}}/>Pass</span>
            <span><span style={{display:'inline-block',width:8,height:8,borderRadius:2,background:'#EF4444',marginRight:4}}/>Fail</span>
            <span><span style={{display:'inline-block',width:8,height:8,borderRadius:2,background:'#F59E0B',marginRight:4}}/>Pending</span>
          </div>
        </div>

        <div className="card">
          <div className="section-title">Project Mix</div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={MOCK.projectMix} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={3}>
                {MOCK.projectMix.map((e,i) => <Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip/>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 mt-2">
            {MOCK.projectMix.map((p,i) => (
              <div key={i} className="flex items-center justify-between" style={{fontSize:11}}>
                <span><span style={{display:'inline-block',width:8,height:8,borderRadius:2,background:p.color,marginRight:6}}/>{p.name}</span>
                <span style={{fontWeight:600}}>{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2 mb-6">
        <div className="card">
          <div className="section-title">VCN Trend — CD19 CAR-T Batches</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={MOCK.yieldTrend} margin={{top:0,right:0,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0"/>
              <XAxis dataKey="batch" style={{fontSize:11}}/>
              <YAxis style={{fontSize:11}} domain={[1.5,2.5]}/>
              <Tooltip/>
              <Line type="monotone" dataKey="vcn" stroke="#2563EB" strokeWidth={2} dot={{r:4,fill:'#2563EB'}}/>
            </LineChart>
          </ResponsiveContainer>
          <div style={{fontSize:11,color:'var(--text-2)',marginTop:4}}>Target: 1.5–3.0 copies/genome (spec)</div>
        </div>

        <div className="card">
          <div className="section-title">My Tasks Today</div>
          <div className="flex flex-col gap-2">
            {MOCK.tasks.map((t,i) => (
              <div key={i} style={{
                display:'flex', justifyContent:'space-between', alignItems:'flex-start',
                padding:'8px 10px', background:'#F9FAFB', borderRadius:6,
                borderLeft:`3px solid ${t.priority==='High'?'#EF4444':t.priority==='Med'?'#F59E0B':'#9CA3AF'}`
              }}>
                <div>
                  <div style={{fontSize:12,fontWeight:500}}>{t.title}</div>
                  <div style={{fontSize:11,color:'var(--text-2)',marginTop:2}}>{t.due}</div>
                </div>
                <span className={`chip chip-${t.priority==='High'?'cart':t.priority==='Med'?'crispr':'plasmid'}`}>{t.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="section-title" style={{marginBottom:0}}>Active Batch Status</div>
          <button className="btn btn-secondary btn-sm">View All in MFG →</button>
        </div>
        <div className="overflow-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Batch</th><th>Type</th><th>Status</th>
                <th>Viability (%)</th><th>CAR+ (%)</th><th>VCN</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b,i) => (
                <tr key={i}>
                  <td style={{fontWeight:600}}>{b.batch_number}</td>
                  <td><span className={`chip chip-${b.product_type?.toLowerCase()}`}>{b.product_type}</span></td>
                  <td>
                    <span className={`status-dot ${statuses[b.status]||'dot-gray'}`}/>
                    {b.status}
                  </td>
                  <td>{b.viability ? `${b.viability}%` : '—'}</td>
                  <td>{b.car_expression ? `${b.car_expression}%` : '—'}</td>
                  <td>{b.vcn || (b.yield_value ? `${b.yield_value} ${b.yield_unit}` : '—')}</td>
                  <td><button className="btn btn-secondary btn-sm">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
