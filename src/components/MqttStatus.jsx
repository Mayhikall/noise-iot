import { Wifi, WifiOff } from "lucide-react";

const MqttStatus = ({ mqttStatus, toggleMqttStatus }) => {
  return (
    <div className="flex items-center space-x-2">
      {mqttStatus === "online" ? (
        <Wifi className="text-green-500" size={18} />
      ) : (
        <WifiOff className="text-gray-500" size={18} />
      )}
      <span className={mqttStatus === "online" ? "text-green-500" : "text-gray-500"}>
        {mqttStatus === "online" ? "Online" : "Offline"}
      </span>
    </div>
  );
};

export default MqttStatus;