import React, { useEffect, useRef } from "react";

const MapPanel = ({ currentStatus, currentDateTime, deviceId, location }) => {
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
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapInstance.current);

    const marker = L.marker([latitude, longitude]).addTo(mapInstance.current);
    marker.bindPopup(`<b>${location}</b><br>Status: ${currentStatus.status}<br>Device ID: ${deviceId}`).openPopup();
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg h-full">
      <div className="p-4 bg-gray-700 font-semibold flex items-center justify-between">
        <span>Lokasi Monitoring</span>
      </div>
      <div ref={mapRef} className="h-64" style={{ zIndex: 0 }}></div>
      <div className="p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Status</span>
          <span className={`px-2 py-0.5 rounded ${currentStatus.color.replace('bg-', 'text-')}`}>
            {currentStatus.status}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Terakhir Update</span>
          <span>{formattedTime}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Device ID</span>
          <span>{deviceId}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Koordinat</span>
          <span>{latitude}, {longitude}</span>
        </div>
      </div>
    </div>
  );
};

export default MapPanel;
