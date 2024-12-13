import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import { Feature } from "ol";
import Point from "ol/geom/Point";
import { Style, Icon } from "ol/style";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import FetchUsername from "./components/FetchUsername";
import Popup from "./components/Popup";

const LocationPage = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popupData, setPopupData] = useState(null);

  const mapRef = useRef(null);
  const markersLayer = useRef(null);
  const socketRef = useRef(null);

  // Socket.IO Initialization
  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    const token = localStorage.getItem("authToken");
    if (token) {
      const userId = JSON.parse(atob(token.split(".")[1])).id;
      socket.emit("registerUser", userId);
    }

    socket.on("parkingClaimed", (data) => {
      alert(data.message);
      fetchAvailableLocations(); // Refresh locations when a spot is claimed
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Get Current Location
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication failed. Please log in.");
      setLoading(false);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCurrentLocation(location);
          fetchAvailableLocations(); // Fetch locations after getting current location
          setLoading(false);
        },
        (err) => {
          console.error("Error obtaining location:", err);
          setError("Failed to get your location. Please enable location services.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
    }
  }, []);

  // Map Initialization
  useEffect(() => {
    if (currentLocation && mapRef.current) {
      const map = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: fromLonLat([
            currentLocation.longitude,
            currentLocation.latitude,
          ]),
          zoom: 15,
        }),
      });

      const marker = new Feature({
        geometry: new Point(
          fromLonLat([currentLocation.longitude, currentLocation.latitude])
        ),
      });

      marker.setStyle(
        new Style({
          image: new Icon({
            src: "https://cdn.jsdelivr.net/npm/heroicons/24/solid/map-pin.svg",
            scale: 0.05,
            color: "blue"
          }),
        })
      );

      const vectorLayer = new VectorLayer({
        source: new VectorSource({
          features: [marker],
        }),
      });

      map.addLayer(vectorLayer);

      markersLayer.current = new VectorLayer({
        source: new VectorSource(),
      });
      map.addLayer(markersLayer.current);

      map.on("click", (event) => {
        map.forEachFeatureAtPixel(event.pixel, (feature) => {
          if (feature.get("isMarker")) {
            setPopupData({
              latitude: feature.get("latitude"),
              longitude: feature.get("longitude"),
              locationId: feature.get("locationId"),
              userId: feature.get("userId"),
            });
          }
        });
      });
    }
  }, [currentLocation]);

  // Update Markers on Map
  const updateMarkers = (locations) => {
    const features = locations.map((location) => {
      const marker = new Feature({
        geometry: new Point(
          fromLonLat([location.longitude, location.latitude])
        ),
      });
      marker.setStyle(
        new Style({
          image: new Icon({
            src: "https://cdn.jsdelivr.net/npm/heroicons/24/solid/map-pin.svg",
            scale: 0.05,
            color: "red"
          }),
        })
      );
      marker.setProperties({
        latitude: location.latitude,
        longitude: location.longitude,
        locationId: location._id,
        userId: location.offeredBy,
        isMarker: true,
      });
      return marker;
    });

    if (markersLayer.current) {
      markersLayer.current.getSource().clear();
      markersLayer.current.getSource().addFeatures(features);
    }
  };

  // Offer Parking Spot
  const offerParking = async () => {
    try {
      const response = await fetch("/locations/offer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          tokensOffered: 5,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Parking spot offered successfully!");
        fetchAvailableLocations();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to offer parking spot.");
    }
  };

  // Claim Parking Spot
  const claimParking = async (locationId) => {
    try {
      const response = await fetch("/locations/claim", {
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
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to claim parking spot.");
    }
  };

  // Fetch Available Locations
  const fetchAvailableLocations = async () => {
    try {
      const response = await fetch("/locations/available", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch available locations');
      }
      
      const data = await response.json();
      setAvailableLocations(data);
      updateMarkers(data);
    } catch (err) {
      console.error("Error fetching locations:", err);
      setError("Failed to fetch available parking spots");
    }
  };

  if (loading) {
    return <div style={styles.loadingContainer}>Loading...</div>;
  }

  if (error) {
    return <div style={styles.errorContainer}>Error: {error}</div>;
  }

  return (
    <div>
      <div 
        ref={mapRef} 
        style={{ 
          width: "100%", 
          height: "400px", 
          marginTop: "2vh", 
          marginLeft: "2vh", 
          marginRight: "10vh"
        }} 
      />
      
      {popupData && (
        <Popup
          coordinates={popupData}
          locationId={popupData.locationId}
          fetchAvailableLocations={fetchAvailableLocations}
          claimParking={() => claimParking(popupData.locationId)}
          onClose={() => setPopupData(null)}
        />
      )}
      
      <div style={styles.buttonContainer}>
        <button style={styles.actionButton} onClick={fetchAvailableLocations}>
          Find Nearby Parking
        </button>
        <button style={styles.actionButton} onClick={offerParking}>
          Leave Parking
        </button>
      </div>
      
      {availableLocations.length > 0 && (
        <div style={{ padding: "20px" }}>
          <h2>Available Parking Spots:</h2>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {availableLocations.map((location) => (
              <li 
                key={location._id} 
                style={{ 
                  marginBottom: "10px", 
                  padding: "10px", 
                  border: "1px solid #ddd", 
                  borderRadius: "5px" 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    Offered by: <FetchUsername userId={location.offeredBy} />
                  </span>
                  <button
                    onClick={() => claimParking(location._id)}
                    style={styles.claimButton}
                  >
                    Claim Spot
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <LocationPage />
            </ProtectedRoute>
          }
        />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
const styles = {
  appContainer: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    textAlign: "center",
  },
  loadingContainer: {
    textAlign: "center",
    marginTop: "50px",
    fontSize: "18px",
    color: "#555",
  },
  errorContainer: {
    textAlign: "center",
    marginTop: "50px",
    fontSize: "18px",
    color: "red",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  mapContainer: {
    margin: "20px 0",
    textAlign: "center",
  },
  map: {
    width: "100%",
    height: "400px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: "15px",
  },
  actionButton: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    transition: "background-color 0.2s, transform 0.1s",
  },
  claimButton: {
    marginLeft: "10px",
    backgroundColor: "#28a745",
    color: "white",
    padding: "5px 10px",
    border: "none",
    borderRadius: "4px",
    fontSize: "24px",
    cursor: "pointer",
  },
};

export default App;
