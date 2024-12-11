import  { useState, useEffect } from "react";

const FetchUsername = ({ userId }) => {
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch(`http://localhost:3000/user/username/${userId}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`, 
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        setUsername(data.username);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsername();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>Username: {username}</div>;
};

export default FetchUsername;
