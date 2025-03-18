import React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

const SummaryCard = ({
  title,
  value,
  unit,
  changePercent,
  icon: Icon,
  color,
  showIcon = false,
  status,
  description,
  isLoading = false,
}) => {
  // Parse changePercent to ensure it's a number
  const percentChange = parseFloat(changePercent);

  // Determine if change is positive, negative or zero
  const isPositive = percentChange > 0;
  const isNegative = percentChange < 0;
  const isZero = percentChange === 0 || isNaN(percentChange);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      {isLoading ? (
        <div className="animate-pulse flex flex-col">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
        </div>
      ) : (
        <div className="flex flex-col">
          <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="text-2xl font-bold">
                {value} {unit}
              </div>
              <div className="flex items-center text-sm">
                {!isZero &&
                  (isNegative ? (
                    <TrendingDown className="text-red-500 mr-1" size={16} />
                  ) : (
                    <TrendingUp className="text-green-500 mr-1" size={16} />
                  ))}
                <span
                  className={
                    isNegative
                      ? "text-red-500"
                      : isPositive
                      ? "text-green-500"
                      : "text-gray-400"
                  }
                >
                  {isZero ? "0%" : `${Math.abs(percentChange).toFixed(1)}%`}
                </span>
              </div>
              {description && (
                <div className="text-xs text-gray-400 mt-1">{description}</div>
              )}
              {status && (
                <div className="text-xs font-medium mt-1" style={{ color }}>
                  {status}
                </div>
              )}
            </div>

            {showIcon && Icon && (
              <div className={`p-2 rounded-full ${color}`}>
                <Icon size={24} className="text-white" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryCard;