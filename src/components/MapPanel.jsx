import React, { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import MqttStatus from "./MqttStatus";

const MapPanel = ({ currentStatus, deviceId, mqttStatus }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  
  // Get the last updated timestamp
  const lastUpdatedTimestamp = mqttStatus?.lastUpdated 
    ? new Date(mqttStatus.lastUpdated) 
    : new Date();
  
  // Get the last online timestamp (if status is offline)
  const lastOnlineTimestamp = mqttStatus?.lastOnlineTimestamp
    ? new Date(mqttStatus.lastOnlineTimestamp)
    : null;
  
  // Format time for display (using Indonesian locale format)
  const formattedTime = lastUpdatedTimestamp.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  // Format date for display (using Indonesian locale format)
  const formattedDate = lastUpdatedTimestamp.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Format last online time if available (for offline status)
  const formattedLastOnlineTime = lastOnlineTimestamp
    ? lastOnlineTimestamp.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      })
    : "N/A";

  // Format last online date if available (for offline status)
  const formattedLastOnlineDate = lastOnlineTimestamp
    ? lastOnlineTimestamp.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "N/A";

  const latitude = 3.020755;
  const longitude = 101.714141;

  // Function to load Leaflet if not already loaded
  const loadLeaflet = () => {
    return new Promise((resolve, reject) => {
      if (window.L) {
        resolve(window.L);
        return;
      }

      const leafletScript = document.createElement("script");
      leafletScript.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/leaflet.js";
      leafletScript.crossOrigin = "anonymous";
      
      const leafletCSS = document.createElement("link");
      leafletCSS.rel = "stylesheet";
      leafletCSS.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/leaflet.css";
      leafletCSS.crossOrigin = "anonymous";
      
      document.head.appendChild(leafletCSS);
      document.head.appendChild(leafletScript);
      
      leafletScript.onload = () => resolve(window.L);
      leafletScript.onerror = reject;
    });
  };

  // Initialize map
  const initMap = async () => {
    // Make sure Leaflet is loaded
    const L = await loadLeaflet();
    
    // Always remove previous map instance if it exists
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    // Check if the ref is available
    if (!mapRef.current) return;
    
    // Create new map
    mapInstance.current = L.map(mapRef.current).setView([latitude, longitude], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Â© OpenStreetMap contributors',
    }).addTo(mapInstance.current);

    // Determine status text to display in popup
    let statusText = "Offline";

    // If current status is online, show Online
    if (mqttStatus?.status === "Online") {
      statusText = "Online";
    } 
    // If offline and we have lastOnlineTimestamp, show the last online time
    else if (mqttStatus?.lastOnlineTimestamp) {
      try {
        // Format using Indonesian locale
        const formattedLastOnline = `${formattedLastOnlineDate} ${formattedLastOnlineTime}`;
        statusText = `Offline (Terakhir Online: ${formattedLastOnline})`;
      } catch (e) {
        console.error("Error formatting lastOnlineTimestamp:", e);
        statusText = "Offline";
      }
    }

    const marker = L.marker([latitude, longitude]).addTo(mapInstance.current);
    marker.bindPopup(`
      <b>Lokasi: ${latitude}, ${longitude}</b><br>
      Status: ${statusText}<br>
      Device ID: ${deviceId}
    `).openPopup();
  };

  useEffect(() => {
    // Initialize map when component mounts
    if (mapRef.current) {
      initMap();
    }
    
    // Cleanup function to remove map when component unmounts
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [deviceId, mqttStatus]); // Re-initialize map when these props change

  // Determine what to show in the right panel
  const showLastOnlineInfo = mqttStatus?.status === "Offline" && lastOnlineTimestamp;

  // CSS classes for status indicator
  const statusIndicatorClass = mqttStatus?.status === "Online" 
    ? "w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse shadow-lg shadow-green-500/50" 
    : "w-3 h-3 rounded-full bg-red-500 mr-2";

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gray-700 font-semibold flex items-center">
        <MapPin className="mr-2" size={20} />
        Lokasi Monitoring
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div ref={mapRef} className="h-64 lg:col-span-2"></div>
        
        <div className="p-4 flex flex-col justify-center space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={statusIndicatorClass}></div>
              <span className="font-semibold">Status</span>
            </div>
            <MqttStatus status={mqttStatus} />
          </div>
          
          <div className="flex flex-col space-y-2">          
            {/* Show last online time if status is offline */}
            {showLastOnlineInfo && (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Terakhir Online</span>
                  <span>{formattedLastOnlineTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Tanggal Online</span>
                  <span>{formattedLastOnlineDate}</span>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Device ID</span>
            <span>{deviceId}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPanel;