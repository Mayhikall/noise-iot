import React from "react";
import SecondaryCard from "./SecondaryCard";

const SecondaryCardsRow = ({ currentLMin, currentLMax, currentStatus }) => {
  // Determine status and colors for LMin based on value
  const getLMinStatus = (value) => {
    // Berdasarkan standar WHO dan standar kebisingan lingkungan umum untuk Lmin
    if (value < 30) {
      return {
        status: "Sangat Rendah",
        bgColor: "bg-green-500/20",
        textColor: "text-green-400",
      };
    } else if (value < 40) {
      return {
        status: "Rendah",
        bgColor: "bg-green-300/20",
        textColor: "text-green-500",
      };
    } else if (value < 50) {
      return {
        status: "Sedang",
        bgColor: "bg-yellow-500/20",
        textColor: "text-yellow-400",
      };
    } else if (value < 60) {
      return {
        status: "Tinggi",
        bgColor: "bg-orange-500/20",
        textColor: "text-orange-400",
      };
    } else {
      return {
        status: "Sangat Tinggi",
        bgColor: "bg-red-500/20",
        textColor: "text-red-400",
      };
    }
  };

  // Determine status and colors for LMax based on value
  const getLMaxStatus = (value) => {
    // Berdasarkan standar WHO, ISO dan standar kebisingan lingkungan umum untuk Lmax
    if (value < 50) {
      return {
        status: "Sangat Rendah",
        bgColor: "bg-green-500/20",
        textColor: "text-green-400",
      };
    } else if (value < 65) {
      return {
        status: "Rendah",
        bgColor: "bg-green-300/20",
        textColor: "text-green-500",
      };
    } else if (value < 75) {
      return {
        status: "Sedang",
        bgColor: "bg-yellow-500/20",
        textColor: "text-yellow-400",
      };
    } else if (value < 85) {
      return {
        status: "Tinggi",
        bgColor: "bg-orange-500/20",
        textColor: "text-orange-400",
      };
    } else {
      return {
        status: "Sangat Tinggi",
        bgColor: "bg-red-500/20",
        textColor: "text-red-400",
      };
    }
  };

  // Get dynamic status for LMin and LMax
  const lMinStatus = getLMinStatus(currentLMin);
  const lMaxStatus = getLMaxStatus(currentLMax);

  // Create a status background color mapping
  const getStatusBgColor = (color) => {
    // Map the original background colors to their 20% opacity versions
    const colorMap = {
      "bg-green-800": "bg-green-800/20",
      "bg-green-600": "bg-green-600/20",
      "bg-green-400": "bg-green-400/20",
      "bg-yellow-500": "bg-yellow-500/20",
      "bg-orange-500": "bg-orange-500/20",
      "bg-orange-700": "bg-orange-700/20",
      "bg-red-700": "bg-red-700/20",
    };

    // Find the matching color or return a default
    for (const [original, opacity] of Object.entries(colorMap)) {
      if (color === original) return opacity;
    }

    // If no match is found, create a 20% opacity version of the original color
    return `${color}/20`;
  };

  // Get status text color based on the original background color
  const getStatusTextColor = (color) => {
    const colorMap = {
      "bg-green-800": "text-green-700",
      "bg-green-600": "text-green-500",
      "bg-green-400": "text-green-300",
      "bg-yellow-500": "text-yellow-400",
      "bg-orange-500": "text-orange-400",
      "bg-orange-700": "text-orange-600",
      "bg-red-700": "text-red-600",
    };

    for (const [bg, text] of Object.entries(colorMap)) {
      if (color === bg) return text;
    }

    return "text-white";
  };

  // Get the background and text colors for the current status
  const statusBgColor = getStatusBgColor(currentStatus.color);
  const statusTextColor = getStatusTextColor(currentStatus.color);

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
        title="Status LAeq"
        value={currentStatus.status}
        unit=""
        status={currentStatus.description || currentStatus.status}
        bgColor={statusBgColor}
        textColor={statusTextColor}
      />
    </div>
  );
};

export default SecondaryCardsRow;
