import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../api'

const ROLES = ['backend', 'frontend', 'fullstack', 'ml', 'data', 'devops']
const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Dashboard() {
  const [selectedRole, setSelectedRole] = useState('backend')
  const [skills, setSkills] = useState([])
  const [jobCounts, setJobCounts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchJobCounts() }, [])
  useEffect(() => { fetchSkills() }, [selectedRole])

  async function fetchSkills() {
    setLoading(true)
    try {
      const res = await api.get(`/skills/trending?role=${selectedRole}&limit=10`)
      setSkills(res.data.skills.map(s => ({ name: s.skill, count: parseInt(s.job_count) })))
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  async function fetchJobCounts() {
    try {
      const res = await api.get('/jobs/count')
      setJobCounts(res.data.counts.map(c => ({ name: c.role_category, count: parseInt(c.count) })))
    } catch (err) { console.error(err) }
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>Job Market Intelligence</h1>
      <p style={{ color: '#94a3b8', marginBottom: '32px' }}>Real-time skill demand from 49+ job postings</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {jobCounts.map((item, i) => (
          <div key={item.name} onClick={() => setSelectedRole(item.name)}
            style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: 'pointer', border: selectedRole === item.name ? '1px solid #6366f1' : '1px solid #334155' }}>
            <div style={{ fontSize: '28px', fontWeight: '700', color: COLORS[i % COLORS.length] }}>{item.count}</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', textTransform: 'capitalize' }}>{item.name}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {ROLES.map((role, i) => (
          <button key={role} onClick={() => setSelectedRole(role)}
            style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: selectedRole === role ? COLORS[i] : '#1e293b', color: selectedRole === role ? 'white' : '#94a3b8', fontSize: '13px', fontWeight: '500', textTransform: 'capitalize' }}>
            {role}
          </button>
        ))}
      </div>

      <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid #334155' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', textTransform: 'capitalize' }}>
          Top Skills for {selectedRole} roles
        </h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={skills} layout="vertical" margin={{ left: 20, right: 30 }}>
              <XAxis type="number" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis type="category" dataKey="name" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} width={120} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {skills.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}