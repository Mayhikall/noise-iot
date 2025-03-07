import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const HourlyChart = ({ data }) => {
  // Determine dynamic domain based on actual data values
  const getYDomain = () => {
    if (!data || data.length === 0) return [40, 85];
    
    const values = data.map(item => item.value);
    const minValue = Math.floor(Math.min(...values, 40));
    const maxValue = Math.ceil(Math.max(...values, 85));
    
    return [Math.max(0, minValue - 5), maxValue + 5];
  };

  return (
    <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-blue-300 text-sm font-medium">Tren LAeq Per Jam</h3>
      </div>
      <div className="p-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9CA3AF" 
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => value.split(':')[0] + 'h'}
            />
            <YAxis 
              domain={getYDomain()} 
              stroke="#9CA3AF"
              tickFormatter={(value) => `${value} dB`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                color: "#F3F4F6",
                borderRadius: "4px",
              }}
              labelStyle={{ color: "#F3F4F6" }}
              formatter={(value) => [`${value.toFixed(1)} dB`, "LAeq"]}
              labelFormatter={(label) => `Waktu: ${label}`}
            />
            <Legend verticalAlign="top" height={36} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 1, strokeWidth: 2 }}
              activeDot={{ r: 5, stroke: "#10B981", strokeWidth: 1 }}
              name="LAeq (dB)"
              isAnimationActive={true}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HourlyChart;