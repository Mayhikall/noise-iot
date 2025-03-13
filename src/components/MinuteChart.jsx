import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const MinuteChart = ({ data }) => {
  // Determine dynamic domain based on actual data values
  const getYDomain = () => {
    if (!data || data.length === 0) return [35, 50];
    
    const values = data.map((item) => item.value);
    const minValue = Math.floor(Math.min(...values, 35));
    const maxValue = Math.ceil(Math.max(...values, 50));
    
    return [Math.max(0, minValue - 5), maxValue + 5];
  };

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-gray-800 p-3 border border-gray-600 rounded shadow-lg text-left">
          <p className="text-blue-300 font-medium mb-1">Waktu: {label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <p className="text-gray-200">
                {entry.name}: <span className="text-white font-medium">{entry.value.toFixed(1)} dB</span>
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Format X-axis labels to remove "undefined"
  const formatXAxis = (value) => {
    if (value && value.includes("undefined")) {
      // Hanya tampilkan bagian waktu yang valid (format jam:menit)
      const timeParts = value.split("undefined")[0].trim();
      return timeParts;
    }
    return value;
  };

  // Custom legend component
  const CustomLegend = (props) => {
    const { payload } = props;
    
    return (
      <div className="flex justify-center items-center mt-2 mb-1">
        {payload.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center mx-4">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-gray-200 text-sm">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700 mb-6">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-blue-300 text-sm font-medium">Tren LAeq Per Menit</h3>
      </div>
      <div className="p-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            barGap={0}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
            <XAxis
              dataKey="time"
              stroke="#9CA3AF"
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              tickFormatter={formatXAxis}
              interval={4}
            />
            <YAxis
              domain={getYDomain()}
              stroke="#9CA3AF"
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              tickFormatter={(value) => `${value} dB`}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ opacity: 0.3, fill: "#4B5563" }}
              wrapperStyle={{ outline: "none" }}
            />
            <Legend content={<CustomLegend />} />
            <Bar
              dataKey="value"
              fill="#3B82F6"
              name="LAeq (Per Menit)"
              animationDuration={1000}
              radius={[2, 2, 0, 0]}
              activeBar={{ fill: "#60A5FA", stroke: "#2563EB", strokeWidth: 2 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MinuteChart;