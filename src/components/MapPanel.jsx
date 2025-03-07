import React, { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

const MapPanel = ({ currentStatus, currentDateTime, deviceId, location, mqttStatus }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null); // Simpan referensi peta agar tidak diinisialisasi ulang

  const formattedTime = currentDateTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const latitude = 3.020755;
  const longitude = 101.714141;

  useEffect(() => {
    // Cek apakah Leaflet sudah dimuat
    if (!window.L) {
      const leafletScript = document.createElement("script");
      leafletScript.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/leaflet.js";
      leafletScript.crossOrigin = "anonymous";
      document.head.appendChild(leafletScript);

      const leafletCSS = document.createElement("link");
      leafletCSS.rel = "stylesheet";
      leafletCSS.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/leaflet.css";
      leafletCSS.crossOrigin = "anonymous";
      document.head.appendChild(leafletCSS);

      leafletScript.onload = () => {
        initMap();
      };
    } else {
      initMap();
    }
    
    return () => {
      // Cleanup hanya jika peta telah dibuat
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
    };
  }, []);

  const initMap = () => {
    if (!mapRef.current || mapInstance.current) return; // Hindari duplikasi inisialisasi

    const L = window.L;
    mapInstance.current = L.map(mapRef.current).setView([latitude, longitude], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapInstance.current);

    const marker = L.marker([latitude, longitude]).addTo(mapInstance.current);
    marker.bindPopup(`<b>${location}</b><br>Status: ${currentStatus.status}<br>Device ID: ${deviceId}`).openPopup();
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gray-700 font-semibold flex items-center">
        <MapPin className="mr-2" size={20} />
        Lokasi Monitoring
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div ref={mapRef} className="h-64 lg:col-span-2"></div>
        
        <div className="p-4 flex flex-col justify-center space-y-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${currentStatus.color} mr-2`}></div>
            <span className="font-semibold">Status</span>
            <span className="ml-auto">{currentStatus.status}</span>
          </div>
          
          <div className="flex items-center">
            <mqttStatus.icon className={`${mqttStatus.color} mr-2`} size={16} />
            <span className="font-semibold">Terakhir Update</span>
            <span className="ml-auto">{formattedTime}</span>
          </div>
          
          <div className="flex items-center">
            <span className="font-semibold">Device ID</span>
            <span className="ml-auto">{deviceId}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPanel;