import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/gap')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 60px)', padding: '32px' }}>
      <div style={{ background: '#1e293b', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '400px', border: '1px solid #334155' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Welcome back</h2>
        <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '14px' }}>Login to access gap analysis</p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>Email</label>
            <input type="email" placeholder="aryan@example.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required
              style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px', color: '#e2e8f0', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#94a3b8' }}>Password</label>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required
              style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px', color: '#e2e8f0', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          {error && <div style={{ color: '#fca5a5', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '12px', background: '#6366f1', border: 'none', borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#94a3b8' }}>
          Don't have an account? <Link to="/register" style={{ color: '#6366f1' }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}