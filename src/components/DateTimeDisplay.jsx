import React, { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";

const DateTimeDisplay = ({ formattedDate: initialDate, formattedTime: initialTime }) => {
  // Create state for the current time and date
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [currentDate, setCurrentDate] = useState(initialDate);

  useEffect(() => {
    // Function to update the time and date
    const updateDateTime = () => {
      const now = new Date();
      
      // Format time
      const formattedTime = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      
      // Format date
      const formattedDate = now.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
      
      setCurrentTime(formattedTime);
      setCurrentDate(formattedDate);
    };

    // Update time immediately
    updateDateTime();
    
    // Set up interval to update time every second
    const intervalId = setInterval(updateDateTime, 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div className="flex items-center bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl p-3 shadow-lg">
      <div className="flex flex-col items-end mr-6 border-r border-blue-600 pr-6">
        <span className="text-xs text-green-300 font-medium">TANGGAL</span>
        <div className="flex items-center mt-1">
          <Calendar size={16} className="mr-2 text-blue-300" />
          <span className="text-sm font-medium">{currentDate}</span>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-xs text-green-300 font-medium animate-pulse">LIVE</span>
        <div className="flex items-center mt-1">
          <Clock size={16} className="mr-2 text-blue-300" />
          <span className="text-sm font-medium">{currentTime} WIB</span>
        </div>
      </div>
    </div>
  );
};

export default DateTimeDisplay;