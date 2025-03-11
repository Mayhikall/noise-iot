import React from "react";
import DateTimeDisplay from "./DateTimeDisplay";

const Header = ({ formattedDate, formattedTime }) => {
  return (
    <header className="bg-gray-800 bg-opacity-70 backdrop-blur-md border-b border-gray-700 py-4 px-6 flex justify-between items-center shadow-lg">
      <h1 className="text-xl font-semibold">Dashboard Monitoring Kebisingan</h1>
      <div className="flex items-center space-x-4">
        
        <DateTimeDisplay 
          formattedDate={formattedDate} 
          formattedTime={formattedTime} 
        />
      </div>
    </header>
  );
};

export default Header;