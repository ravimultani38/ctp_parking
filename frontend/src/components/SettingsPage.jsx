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
        // Ensure full URL is used
        const response = await fetch("/user/info", {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        // Log full response for debugging
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          // Try to parse error response
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }

        const data = await response.json();
        
        // Validate data structure
        if (!data.username || data.tokens === undefined) {
          throw new Error('Invalid user data received');
        }

        setUsername(data.username);
        setTokens(data.tokens);
      } catch (error) {
        console.error('Fetch user info error:', error);
        setErrorMessage(`Error fetching user info: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    // Check for auth token before fetching
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      fetchUserInfo();
    } else {
      setErrorMessage("No authentication token found. Please log in again.");
    }
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    // Enhanced password validation
    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/user/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ 
          oldPassword, 
          newPassword 
        }),
      });

      // Improved error handling
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to change password");
      }

      setSuccessMessage("Password changed successfully");
      // Reset password fields
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error('Password change error:', err);
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Settings</h1>
      
      {isLoading && <p className="loading">Loading user information...</p>}
      
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
              disabled={isLoading}
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
              disabled={isLoading}
              minLength={8}
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
              disabled={isLoading}
              minLength={8}
            />
          </div>

          <button 
            type="submit" 
            className="button"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Change Password'}
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
