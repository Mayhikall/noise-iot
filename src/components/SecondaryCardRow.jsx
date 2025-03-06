// components/SecondaryCardsRow.js
import React from "react";
import SecondaryCard from "./SecondaryCard";

const SecondaryCardsRow = ({ currentLMin, currentLMax, currentStatus }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <SecondaryCard
        title="Level Minimum"
        value={currentLMin}
        unit="dB"
        status="Rendah"
        bgColor="bg-green-100"
        textColor="text-green-400"
      />
      <SecondaryCard
        title="Level Maksimum"
        value={currentLMax}
        unit="dB"
        status="Sedang"
        bgColor="bg-yellow-100"
        textColor="text-yellow-400"
      />
      <SecondaryCard
        title="Status"
        value={currentStatus.status}
        unit=""
        status={currentStatus.status}
        bgColor={currentStatus.color}
        textColor={currentStatus.color.replace("bg", "text")}
      />
    </div>
  );
};

export default SecondaryCardsRow;