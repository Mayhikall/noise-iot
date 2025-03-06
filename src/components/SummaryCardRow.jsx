// components/SummaryCardsRow.js
import React from "react";
import SummaryCard from "./SummaryCard";
import { Volume2 } from "lucide-react";

const SummaryCardsRow = ({ currentLaeq, currentL10, currentL50, currentL90, currentStatus }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <SummaryCard
        title="LAeq Realtime"
        value={currentLaeq}
        unit="dB"
        changePercent={-20.9}
        icon={Volume2}
        color={currentStatus.color}
        showIcon={true}
      />
      <SummaryCard
        title="L10"
        value={currentL10}
        unit="dB"
        changePercent={36.4}
      />
      <SummaryCard
        title="L50"
        value={currentL50}
        unit="dB"
        changePercent={31}
      />
      <SummaryCard
        title="L90"
        value={currentL90}
        unit="dB"
        changePercent={23}
      />
    </div>
  );
};

export default SummaryCardsRow;