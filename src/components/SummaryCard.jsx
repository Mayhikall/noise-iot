import React from "react";
import { TrendingDown, TrendingUp, Volume2 } from "lucide-react";

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
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <div className="flex flex-col">
        <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="text-2xl font-bold">
              {value} {unit}
            </div>
            <div className="flex items-center text-sm">
              {changePercent < 0 ? <TrendingDown className="text-red-500 mr-1" size={16} /> : <TrendingUp className="text-green-500 mr-1" size={16} />}
              <span className={changePercent < 0 ? "text-red-500" : "text-green-500"}>
                {Math.abs(changePercent)}%
              </span>
            </div>
          </div>
          
          {/* Tampilkan ikon hanya jika showIcon true */}
          {showIcon && (
            <div className={`p-2 rounded-full ${color}`}>
              <Icon size={24} className="text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;