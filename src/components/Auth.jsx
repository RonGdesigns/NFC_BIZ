import { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', padding: '24px', alignItems: 'center', justifyContent: 'center' }}>
      
      <div style={{ width: '100%', maxWidth: '400px', border: '4px solid var(--text-primary)', padding: '32px', position: 'relative', backgroundColor: 'white' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '24px', letterSpacing: '-1px' }}>
          {isLogin ? 'ACCESS.' : 'INITIALIZE.'}
        </h1>

        {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '16px', fontWeight: 'bold' }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ borderBottom: '2px solid var(--text-primary)', borderRadius: 0, padding: '8px 0', width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ borderBottom: '2px solid var(--text-primary)', borderRadius: 0, padding: '8px 0', width: '100%' }}
            />
          </div>
          
          <button type="submit" disabled={loading} style={{ marginTop: '16px', width: '100%' }}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
          <div style={{ flex: 1, borderBottom: '1px solid var(--text-primary)', opacity: 0.2 }}></div>
          <span style={{ padding: '0 16px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Or</span>
          <div style={{ flex: 1, borderBottom: '1px solid var(--text-primary)', opacity: 0.2 }}></div>
        </div>

        <button 
          type="button" 
          onClick={handleGoogleSignIn} 
          disabled={loading}
          style={{ width: '100%', backgroundColor: 'transparent', color: 'var(--text-primary)', border: '2px solid var(--text-primary)' }}
        >
          Continue with Google
        </button>

        <p 
          style={{ marginTop: '24px', fontSize: '14px', textAlign: 'center', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }} 
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? 'Need an account? Initialize here.' : 'Already initialized? Access here.'}
        </p>
      </div>

    </div>
  );
}
