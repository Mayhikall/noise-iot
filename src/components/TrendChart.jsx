// components/TrendChart.js
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const TrendChart = ({ data, timeFilter, onTimeFilterChange }) => {
  return (
    <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700 mb-6">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-blue-300 text-sm font-medium">Tren LAeq</h3>
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded-md text-xs font-medium shadow-md 
              ${
                timeFilter === "daytime"
                  ? "bg-gradient-to-r from-blue-600 to-blue-500"
                  : "bg-gray-700"
              }`}
            onClick={() => onTimeFilterChange("daytime")}
          >
            Siang (07:00 - 19:00)
          </button>
          <button
            className={`px-3 py-1 rounded-md text-xs font-medium shadow-md 
              ${
                timeFilter === "nighttime"
                  ? "bg-gradient-to-r from-blue-600 to-blue-500"
                  : "bg-gray-700"
              }`}
            onClick={() => onTimeFilterChange("nighttime")}
          >
            Malam (19:00 - 07:00)
          </button>
        </div>
      </div>
      <div className="p-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" />
            <YAxis domain={[35, 65]} stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
              }}
              labelStyle={{ color: "#F3F4F6" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              name="LAeq"
            />
            <Line
              type="monotone"
              dataKey="l10"
              stroke="#3B82F6"
              strokeWidth={1.5}
              dot={false}
              name="L10"
            />
            <Line
              type="monotone"
              dataKey="l50"
              stroke="#8B5CF6"
              strokeWidth={1.5}
              dot={false}
              name="L50"
            />
            <Line
              type="monotone"
              dataKey="l90"
              stroke="#EC4899"
              strokeWidth={1.5}
              dot={false}
              name="L90"
            />
            <Line
              type="monotone"
              dataKey="lmin"
              stroke="#F59E0B"
              strokeWidth={1.5}
              dot={false}
              name="LMin"
            />
            <Line
              type="monotone"
              dataKey="lmax"
              stroke="#EF4444"
              strokeWidth={1.5}
              dot={false}
              name="LMax"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;