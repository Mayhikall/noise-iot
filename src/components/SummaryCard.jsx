import React from "react";
import { TrendingDown, Volume2 } from "lucide-react";

const SummaryCard = ({
  title,
  value,
  unit,
  changePercent,
  icon: Icon,
  color,
  showIcon = false, // Prop opsional, default false
}) => {
  return (
    <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700 transform transition-all duration-300 hover:scale-105">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-blue-300 text-sm font-medium">{title}</h3>
      </div>
      <div className="p-4 flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold">
            {value} <span className="text-xl">{unit}</span>
          </div>
          <div
            className={`flex items-center mt-1 ${
              changePercent < 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            <TrendingDown size={16} className="mr-1" />
            <span>{Math.abs(changePercent)}%</span>
          </div>
        </div>
        {/* Tampilkan ikon hanya jika showIcon true */}
        {showIcon && (
          <div
            className={`h-16 w-16 rounded-full flex items-center justify-center ${color} bg-opacity-80 shadow-lg`}
          >
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryCard;