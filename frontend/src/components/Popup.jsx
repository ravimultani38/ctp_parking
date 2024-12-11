import "./Popup.css";
import FetchUsername from "./FetchUsername";
const Popup = ({ coordinates, onClose ,location,fetchAvailableLocations}) => {
 
  const claimParking = async (locationId) => {
    try {
     
      const response = await fetch("http://localhost:3000/locations/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ locationId }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Parking spot claimed successfully!");
        fetchAvailableLocations();
        onClose();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to claim parking spot.");
    }
  };


  return (
    <div className="popup">
      <div className="popup-content">
        <h2>Location Details</h2>
        <strong>
        <FetchUsername  userId={coordinates.userId}/>
        </strong>
        <button className="popup-close" onClick={() => claimParking(coordinates.locationId)}>
          Claim
        </button>
        <button className="popup-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Popup;
