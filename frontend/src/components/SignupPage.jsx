import  { useState } from 'react';
import axios from 'axios';
import './SignupPage.css';  // Import the external CSS file

const SignupPage = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post('http://localhost:3000/register', formData);
      setSuccess(response.data.message);
      setFormData({ username: '', email: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="body">
      <div className="container">
        <div className="header">
          <img
            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg"
            alt="logo"
            className="logo"
          />
          <h1>Parking Finder</h1>
        </div>
        <div className="card">
          <h2 className="title">Signup</h2>
          <form onSubmit={handleSubmit}>
            <div className="formGroup">
              <label htmlFor="username" className="label">
                Username
              </label>
              <input
                type="text"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                required
                className="input"
              />
            </div>
            <div className="formGroup">
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="input"
              />
            </div>
            <div className="formGroup">
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="input"
              />
            </div>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
            <button
              type="submit"
              disabled={loading}
              className="button"
              style={{
                backgroundColor: loading ? '#9e9e9e' : '#4CAF50',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Signing up...' : 'Signup'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
