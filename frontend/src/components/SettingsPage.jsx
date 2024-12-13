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
      {/* Your existing JSX */}
      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
};

export default SettingsPage;
