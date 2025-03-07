import React from "react";
import SummaryCard from "./SummaryCard";
import { Volume2 } from "lucide-react";

const SummaryCardsRow = ({ currentLaeq, currentL10, currentL50, currentL90, currentStatus }) => {
  // This should ideally come from state/props rather than hardcoded
  const previousValues = {
    laeq: 65.2,
    l10: 68.5,
    l50: 62.0,
    l90: 55.7
  };
  
  // Calculate percentage changes for each metric
  const changes = {
    laeq: ((currentLaeq - previousValues.laeq) / previousValues.laeq) * 100,
    l10: ((currentL10 - previousValues.l10) / previousValues.l10) * 100,
    l50: ((currentL50 - previousValues.l50) / previousValues.l50) * 100,
    l90: ((currentL90 - previousValues.l90) / previousValues.l90) * 100
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <SummaryCard
        title="LAeq Realtime"
        value={currentLaeq.toFixed(1)}
        unit="dB"
        changePercent={changes.laeq}
        icon={Volume2}
        color={currentStatus.color}
        showIcon={true}
        status={currentStatus.status}
      />
      <SummaryCard
        title="L10"
        value={currentL10.toFixed(1)}
        unit="dB"
        changePercent={changes.l10}
        color="bg-blue-500"
        description="10% of time above this level"
      />
      <SummaryCard
        title="L50"
        value={currentL50.toFixed(1)}
        unit="dB"
        changePercent={changes.l50}
        color="bg-purple-500"
        description="Median noise level"
      />
      <SummaryCard
        title="L90"
        value={currentL90.toFixed(1)}
        unit="dB"
        changePercent={changes.l90}
        color="bg-pink-500"
        description="Background noise level"
      />
    </div>
  );
};

export default SummaryCardsRow;