import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:3000/login', { email, password });

      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        alert('Login successful!');
        navigate('/');
      } else {
        throw new Error('No token received');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <div style={styles.header}>
          <img
            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg"
            alt="logo"
            style={styles.logo}
          />
          <h1>Parking Finder</h1>
        </div>
        <div style={styles.card}>
          <h2 style={styles.title}>Sign in to your account</h2>
          <form onSubmit={handleLogin}>
            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>
                Your email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={styles.input}
              />
            </div>
            <div style={styles.actions}>
              <label style={styles.remember}>
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" style={styles.forgot}>
                Forgot password?
              </a>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                backgroundColor: loading ? '#9e9e9e' : '#4CAF50',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Logging in...' : 'Sign in'}
            </button>
            {error && <p style={styles.error}>{error}</p>}
          </form>
          <p style={styles.signupText}>
            Don’t have an account yet?{' '}
            <a href="#" style={styles.signupLink}>
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

// Inline Styles
const styles = {
  body: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f4f4f9',
    margin: 0,
    padding: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  container: {
    textAlign: 'center',
    width: '100%',
    maxWidth: '400px',
    margin: '20px auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  logo: {
    width: '40px',
  },
  card: {
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  title: {
    marginBottom: '20px',
    color: '#333',
  },
  formGroup: {
    marginBottom: '15px',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    fontSize: '14px',
  },
  remember: {
    color: '#555',
  },
  forgot: {
    color: '#007BFF',
    textDecoration: 'none',
  },
  button: {
    width: '100%',
    padding: '10px',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    fontSize: '16px',
    marginTop: '10px',
  },
  error: {
    color: 'red',
    fontSize: '14px',
    marginTop: '10px',
  },
  signupText: {
    fontSize: '14px',
    color: '#555',
    marginTop: '20px',
  },
  signupLink: {
    color: '#007BFF',
    textDecoration: 'none',
  },
};

export default LoginPage;