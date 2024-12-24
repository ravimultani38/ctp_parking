import { useState, useEffect } from "react";
import axios from "axios";
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

        const response = await axios.get("/user/info", {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma': 'no-cache'
          }
        });

        const data = response.data;
        console.log("API Response Data:", data); // Log response data for debugging

        // TEMPORARILY DISABLE VALIDATION FOR DEBUGGING
        // if (!data.username || data.tokens === undefined) {
        //   throw new Error('Invalid user data structure');
        // }

        setUsername(data.username || ""); // Default to empty string if undefined
        setTokens(data.tokens || 0);     // Default to 0 if undefined

      } catch (error) {
        console.error("Fetch User Info Error:", error); // Log full error for debugging
        setErrorMessage(`Error fetching user info: ${error.response?.data?.message || error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      const authToken = localStorage.getItem("authToken");
      const response = await axios.put(
        "/user/change-password",
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccessMessage("Password changed successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message);
    }
  };

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
