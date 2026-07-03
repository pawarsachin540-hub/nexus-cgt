import { useState } from 'react'
import Dashboard from './components/Dashboard'
import ELN from './components/ELN'
import Manufacturing from './components/Manufacturing'
import QCModule from './components/QCModule'
import QAModule from './components/QAModule'
import Inventory from './components/Inventory'
import Equipment from './components/Equipment'
import EquipmentWorkflow from './components/EquipmentWorkflow'
import Documents from './components/Documents'
import Projects from './components/Projects'
import './App.css'

const modules = [
  { id: 'dashboard', label: 'Dashboard', icon: '⬡' },
  { id: 'projects',  label: 'Projects',  icon: '⬡' },
  { id: 'eln',       label: 'ELN',       icon: '⬡' },
  { id: 'mfg',       label: 'MFG',       icon: '⬡' },
  { id: 'qc',        label: 'QC',        icon: '⬡' },
  { id: 'qa',        label: 'QA',        icon: '⬡' },
  { id: 'inventory', label: 'Inventory', icon: '⬡' },
  { id: 'equipment', label: 'Equipment', icon: '⬡' },
  { id: 'eqworkflow', label: 'Eq. Workflow', icon: '⬡' },
  { id: 'documents', label: 'Documents', icon: '⬡' },
]

export default function App() {
  const [active, setActive] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const view = {
    dashboard: <Dashboard />,
    projects:  <Projects />,
    eln:       <ELN />,
    mfg:       <Manufacturing />,
    qc:        <QCModule />,
    qa:        <QAModule />,
    inventory: <Inventory />,
    equipment: <Equipment />,
    eqworkflow: <EquipmentWorkflow />,
    documents: <Documents />,
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-mark">N</div>
            {sidebarOpen && <span className="brand-name">NEXUS CGT</span>}
          </div>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '‹' : '›'}
          </button>
        </div>
        <nav className="sidebar-nav">
          {modules.map(m => (
            <button
              key={m.id}
              className={`nav-item ${active === m.id ? 'active' : ''}`}
              onClick={() => setActive(m.id)}
              title={m.label}
            >
              <span className="nav-icon">{m.icon}</span>
              {sidebarOpen && <span className="nav-label">{m.label}</span>}
            </button>
          ))}
        </nav>
        {sidebarOpen && (
          <div className="sidebar-footer">
            <div className="user-badge">
              <div className="user-avatar">SP</div>
              <div>
                <div className="user-name">Sachin Pawar</div>
                <div className="user-role">Sr. Analytical Dev &amp; QC</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      <main className="main-content">
        <div className="module-content">
          {view[active]}
        </div>
      </main>
    </div>
  )
}
