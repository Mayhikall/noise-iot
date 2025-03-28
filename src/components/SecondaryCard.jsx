import React from "react";

const SecondaryCard = ({ title, value, unit, status, bgColor, textColor }) => {
  return (
    <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700 transform transition-all duration-300 hover:scale-105">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-blue-300 text-sm font-medium">{title}</h3>
      </div>
      <div className="p-4 flex items-center justify-between">
        <div className="text-3xl font-bold text-white">
          {value} <span className="text-xl text-gray-300">{unit}</span>
        </div>
        <div className={`px-3 py-1.5 ${bgColor} rounded-lg`}>
          <span className={`${textColor} text-sm font-medium`}>{status}</span>
        </div>
      </div>
    </div>
  );
};

export default SecondaryCard;
