import React, { useState, useEffect } from "react";
import SummaryCard from "./SummaryCard";
import { Volume2 } from "lucide-react";
import { fetchLaeqData, fetchRealtimeData } from "../services/api"; // Import your API functions

const SummaryCardsRow = ({
  currentLaeq,
  currentL10,
  currentL50,
  currentL90,
  currentStatus,
}) => {
  // State to store previous values from database
  const [previousValues, setPreviousValues] = useState({
    laeq: 0,
    l10: 0,
    l50: 0,
    l90: 0,
  });

  // State to track if data is loading
  const [isLoading, setIsLoading] = useState(true);

  // Fetch previous values from database on component mount and when current values change
  useEffect(() => {
    const fetchPreviousValues = async () => {
      try {
        setIsLoading(true);

        // Get the previous LAeq value (second most recent)
        const laeqResponse = await fetchLaeqData({
          limit: 2, // Fetch 2 most recent records
          sort: "created_at,desc",
        });

        // Get the previous L10, L50, L90 values (second most recent)
        const realtimeResponse = await fetchRealtimeData({
          limit: 2, // Fetch 2 most recent records
          sort: "created_at,desc",
        });

        // Extract previous values (second item in each array if available)
        const prevLaeq = laeqResponse.length > 1 ? laeqResponse[1].laeq : 0;

        // For L10, L50, L90 values
        let prevL10 = 0,
          prevL50 = 0,
          prevL90 = 0;
        if (realtimeResponse.length > 1) {
          prevL10 = realtimeResponse[1].L10 || 0;
          prevL50 = realtimeResponse[1].L50 || 0;
          prevL90 = realtimeResponse[1].L90 || 0;
        }

        // Store these values in local storage as a backup in case of API failures
        const prevValues = {
          laeq: prevLaeq,
          l10: prevL10,
          l50: prevL50,
          l90: prevL90,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem("previousNoiseValues", JSON.stringify(prevValues));

        // Update state with values from database
        setPreviousValues({
          laeq: prevLaeq,
          l10: prevL10,
          l50: prevL50,
          l90: prevL90,
        });
      } catch (error) {
        console.error("Error fetching previous values:", error);

        // Try to recover previous values from local storage if API fails
        try {
          const storedValues = localStorage.getItem("previousNoiseValues");
          if (storedValues) {
            const parsedValues = JSON.parse(storedValues);
            setPreviousValues({
              laeq: parsedValues.laeq || 0,
              l10: parsedValues.l10 || 0,
              l50: parsedValues.l50 || 0,
              l90: parsedValues.l90 || 0,
            });
          }
        } catch (storageError) {
          console.error("Error recovering from local storage:", storageError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // When current values update, store the previous ones before fetching new previous values
    if (
      !isLoading &&
      (currentLaeq > 0 || currentL10 > 0 || currentL50 > 0 || currentL90 > 0)
    ) {
      // Store current values as previous values in local storage before updating
      localStorage.setItem(
        "previousNoiseValues",
        JSON.stringify({
          laeq: currentLaeq,
          l10: currentL10,
          l50: currentL50,
          l90: currentL90,
          timestamp: new Date().toISOString(),
        })
      );
    }

    // Only fetch if we have valid current values to avoid unnecessary API calls
    if (currentLaeq > 0 || currentL10 > 0 || currentL50 > 0 || currentL90 > 0) {
      fetchPreviousValues();
    }
  }, [currentLaeq, currentL10, currentL50, currentL90]); // Update when current values change

  // Calculate percentage changes for each metric with proper increase/decrease handling
  const calculatePercentageChange = (current, previous) => {
    // Ensure values are numbers
    const curr = parseFloat(current);
    const prev = parseFloat(previous);

    // If both values are 0 or invalid, return 0% change
    if (!curr && !prev) return 0;

    // If previous value is 0 but current is not, this is a new reading (100% increase)
    if (prev === 0 && curr !== 0) return 100;

    // Calculate change as percentage of previous value
    const change = ((curr - prev) / Math.abs(prev)) * 100;

    // Return the value rounded to 1 decimal place
    return parseFloat(change.toFixed(1));
  };

  // Calculate changes based on current and previous values
  const changes = {
    laeq: calculatePercentageChange(currentLaeq, previousValues.laeq),
    l10: calculatePercentageChange(currentL10, previousValues.l10),
    l50: calculatePercentageChange(currentL50, previousValues.l50),
    l90: calculatePercentageChange(currentL90, previousValues.l90),
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
        isLoading={isLoading}
      />
      <SummaryCard
        title="L10"
        value={currentL10.toFixed(1)}
        unit="dB"
        changePercent={changes.l10}
        color="bg-blue-500"
        isLoading={isLoading}
      />
      <SummaryCard
        title="L50"
        value={currentL50.toFixed(1)}
        unit="dB"
        changePercent={changes.l50}
        color="bg-purple-500"
        isLoading={isLoading}
      />
      <SummaryCard
        title="L90"
        value={currentL90.toFixed(1)}
        unit="dB"
        changePercent={changes.l90}
        color="bg-pink-500"
        isLoading={isLoading}
      />
    </div>
  );
};

export default SummaryCardsRow;
