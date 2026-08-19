import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem('token')

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav style={{
      background: '#1e293b',
      borderBottom: '1px solid #334155',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '60px'
    }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <span style={{ fontSize: '20px', fontWeight: '700', color: '#6366f1' }}>
          Hire<span style={{ color: '#e2e8f0' }}>Signal</span>
        </span>
      </Link>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Dashboard</Link>
        {isLoggedIn ? (
          <>
            <Link to="/gap" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Gap Analysis</Link>
            <button onClick={logout} style={{ padding: '6px 14px', background: 'transparent', border: '1px solid #475569', borderRadius: '8px', color: '#e2e8f0', cursor: 'pointer', fontSize: '14px' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login"><button style={{ padding: '6px 14px', background: 'transparent', border: '1px solid #475569', borderRadius: '8px', color: '#e2e8f0', cursor: 'pointer', fontSize: '14px' }}>Login</button></Link>
            <Link to="/register"><button style={{ padding: '6px 14px', background: '#6366f1', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '14px' }}>Sign Up</button></Link>
          </>
        )}
      </div>
    </nav>
  )
}