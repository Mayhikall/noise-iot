import { Wifi, WifiOff } from "lucide-react";

const MqttStatus = ({ mqttStatus, toggleMqttStatus }) => {
  return (
    <div
      onClick={toggleMqttStatus}
      className="cursor-pointer flex items-center space-x-2 bg-gray-700 px-3 py-2 rounded-md"
    >
      {mqttStatus === "online" ? (
        <Wifi size={20} className="text-green-400" />
      ) : (
        <WifiOff size={20} className="text-red-400" />
      )}
      <span>{mqttStatus === "online" ? "Online" : "Offline"}</span>
    </div>
  );
};

export default MqttStatus;
