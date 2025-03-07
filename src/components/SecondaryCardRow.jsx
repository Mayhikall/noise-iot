import React from "react";
import SecondaryCard from "./SecondaryCard";

const SecondaryCardsRow = ({ currentLMin, currentLMax, currentStatus }) => {
  // Determine status and colors for LMin based on value
  const getLMinStatus = (value) => {
    if (value < 35) return { status: "Rendah", bgColor: "bg-green-500/20", textColor: "text-green-400" };
    if (value < 45) return { status: "Sedang", bgColor: "bg-yellow-500/20", textColor: "text-yellow-400" };
    return { status: "Tinggi", bgColor: "bg-red-500/20", textColor: "text-red-400" };
  };

  // Determine status and colors for LMax based on value
  const getLMaxStatus = (value) => {
    if (value < 55) return { status: "Rendah", bgColor: "bg-green-500/20", textColor: "text-green-400" };
    if (value < 65) return { status: "Sedang", bgColor: "bg-yellow-500/20", textColor: "text-yellow-400" };
    return { status: "Tinggi", bgColor: "bg-red-500/20", textColor: "text-red-400" };
  };

  // Get dynamic status for LMin and LMax
  const lMinStatus = getLMinStatus(currentLMin);
  const lMaxStatus = getLMaxStatus(currentLMax);

  // Handle status text color conversion
  const getTextColorFromBg = (bgColor) => {
    if (!bgColor) return "text-gray-400";
    
    // Map background colors to text colors
    const colorMap = {
      "bg-green-500": "text-green-400",
      "bg-yellow-500": "text-yellow-400",
      "bg-red-500": "text-red-400",
      "bg-gray-500": "text-gray-400"
    };
    
    // Find the matching color or return a default
    for (const [bg, text] of Object.entries(colorMap)) {
      if (bgColor.includes(bg)) return text;
    }
    
    return "text-white";
  };
  
  // Get the text color from the background color
  const statusTextColor = getTextColorFromBg(currentStatus.color);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <SecondaryCard
        title="Level Minimum"
        value={currentLMin.toFixed(1)}
        unit="dB"
        status={lMinStatus.status}
        bgColor={lMinStatus.bgColor}
        textColor={lMinStatus.textColor}
      />
      <SecondaryCard
        title="Level Maksimum"
        value={currentLMax.toFixed(1)}
        unit="dB"
        status={lMaxStatus.status}
        bgColor={lMaxStatus.bgColor}
        textColor={lMaxStatus.textColor}
      />
      <SecondaryCard
        title="Status"
        value={currentStatus.status}
        unit=""
        status={currentStatus.description || currentStatus.status}
        bgColor={currentStatus.color ? `${currentStatus.color}/20` : "bg-gray-500/20"}
        textColor={statusTextColor}
      />
    </div>
  );
};

export default SecondaryCardsRow;