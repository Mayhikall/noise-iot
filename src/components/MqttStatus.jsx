import React, { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { fetchMqttStatus } from "../services/api";

const MqttStatus = () => {
  const [mqttStatus, setMqttStatus] = useState({ status: "Offline", quality: "Offline" });
  const [loading, setLoading] = useState(true);

  // Fetch MQTT status on component mount and set up interval
  useEffect(() => {
    const getMqttStatus = async () => {
      try {
        const status = await fetchMqttStatus();
        setMqttStatus(status);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching MQTT status:", err);
        setMqttStatus({ status: "Offline", quality: "Offline" });
        setLoading(false);
      }
    };

    // Initial fetch
    getMqttStatus();

    // Set up interval to refresh status (every 30 seconds)
    const intervalId = setInterval(getMqttStatus, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Generate display properties based on status
  const getMqttStatusDisplay = () => {
    if (mqttStatus.status === "Offline") {
      return {
        icon: WifiOff,
        color: "text-gray-500",
        text: "Offline"
      };
    } else {
      return {
        icon: Wifi,
        color: "text-green-500",
        text: "Online"
      };
    }
  };

  const statusDisplay = getMqttStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  return (
    <div className="flex items-center space-x-2">
      {loading ? (
        <div className="animate-pulse flex items-center space-x-2">
          <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
          <div className="h-4 w-16 bg-gray-300 rounded"></div>
        </div>
      ) : (
        <>
          <StatusIcon className={statusDisplay.color} size={18} />
          <span className={statusDisplay.color}>
            {statusDisplay.text}
          </span>
        </>
      )}
    </div>
  );
};

export default MqttStatus;