import { useState } from 'react'
import api from '../api'

const ROLES = ['backend', 'frontend', 'fullstack', 'ml', 'data', 'devops']

export default function GapAnalysis() {
  const [file, setFile] = useState(null)
  const [role, setRole] = useState('backend')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file) return setError('Please upload your resume PDF')
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('resume', file)
      formData.append('target_role', role)
      const res = await api.post('/gap/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed')
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>Resume Gap Analysis</h1>
      <p style={{ color: '#94a3b8', marginBottom: '32px' }}>Upload your resume and find which skills you need for your target role</p>

      <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid #334155', marginBottom: '24px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>Target Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px', color: '#e2e8f0', fontSize: '14px', width: '100%', outline: 'none' }}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>Resume PDF</label>
            <div onClick={() => document.getElementById('resume-input').click()}
              style={{ border: '2px dashed #334155', borderRadius: '8px', padding: '32px', textAlign: 'center', cursor: 'pointer', background: file ? '#064e3b22' : 'transparent' }}>
              <input id="resume-input" type="file" accept=".pdf" style={{ display: 'none' }}
                onChange={e => setFile(e.target.files[0])} />
              {file ? (
                <div>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅</div>
                  <div style={{ color: '#6ee7b7', fontWeight: '500' }}>{file.name}</div>
                  <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>Click to change</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
                  <div style={{ color: '#94a3b8' }}>Click to upload your resume PDF</div>
                  <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>Max 5MB</div>
                </div>
              )}
            </div>
          </div>

          {error && <div style={{ color: '#fca5a5', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '12px', background: '#6366f1', border: 'none', borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
            {loading ? 'Analyzing your resume...' : 'Analyze My Resume'}
          </button>
        </form>
      </div>

      {result && (
        <div>
          <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid #334155', marginBottom: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', fontWeight: '800', color: result.match_score >= 70 ? '#10b981' : result.match_score >= 40 ? '#f59e0b' : '#ef4444' }}>
              {result.match_score}%
            </div>
            <div style={{ fontSize: '18px', fontWeight: '600', marginTop: '8px', textTransform: 'capitalize' }}>Match for {result.target_role} roles</div>
            <div style={{ color: '#94a3b8', marginTop: '8px', fontSize: '14px' }}>{result.summary}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid #334155' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#fca5a5' }}>❌ Missing Skills ({result.missing_skills.length})</h3>
              {result.missing_skills.map((skill, i) => (
                <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#7f1d1d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fca5a5', flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: '14px', textTransform: 'capitalize' }}>{skill}</span>
                </div>
              ))}
            </div>

            <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid #334155' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#6ee7b7' }}>✅ You Have ({result.matching_skills.length})</h3>
              {result.matching_skills.map(skill => (
                <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }}></div>
                  <span style={{ fontSize: '14px', textTransform: 'capitalize' }}>{skill}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid #334155', marginTop: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>📋 All Skills Found in Your Resume</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {result.user_skills.map(skill => (
                <span key={skill} style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: '#1e3a5f', color: '#93c5fd' }}>{skill}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}