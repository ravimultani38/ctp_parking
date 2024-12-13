import { useState, useEffect } from "react";
import './SettingsPage.css';

const SettingsPage = () => {
  const [username, setUsername] = useState("");
  const [tokens, setTokens] = useState(0);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          throw new Error("No authentication token found");
        }

        const response = await fetch("http://localhost:3000/user/info", {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma': 'no-cache'
          }
        });

        // Log full response details for debugging
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        // Check if response is ok
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }

        // Detailed content type checking
        const contentType = response.headers.get('content-type');
        console.log('Content Type:', contentType);

        if (!contentType || !contentType.includes('application/json')) {
          // Try to parse as text to see what's actually being returned
          const text = await response.text();
          console.error('Non-JSON response:', text);
          throw new Error(`Expected JSON, got ${contentType}`);
        }

        // Parse JSON
        const data = await response.json();
        
        console.log('Parsed user data:', data);

        // Validate data structure
        if (!data.username || data.tokens === undefined) {
          throw new Error('Invalid user data structure');
        }

        setUsername(data.username);
        setTokens(data.tokens);

      } catch (error) {
        console.error('Detailed fetch user info error:', error);
        setErrorMessage(`Error fetching user info: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Rest of the component remains the same...
  return (
    <div className="container">
      <h1 className="title">Settings</h1>
      {username && <h2 className="username">Welcome, {username}!</h2>}
      
      <div className="section">
        <h2 className="subtitle">Total Tokens</h2>
        <p className="tokens">{tokens}</p>
      </div>
      
      <div className="section">
        <h2 className="subtitle">Change Password</h2>
        
        <form onSubmit={handlePasswordChange}>
          <div className="formGroup">
            <label className="label">Old Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="input"
            />
          </div>

          <div className="formGroup">
            <label className="label">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="input"
            />
          </div>

          <div className="formGroup">
            <label className="label">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="input"
            />
          </div>

          <button type="submit" className="button">
            Change Password
          </button>
        </form>

        {successMessage && (
          <p className="successMessage">{successMessage}</p>
        )}

        {errorMessage && <p className="errorMessage">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default SettingsPage;
