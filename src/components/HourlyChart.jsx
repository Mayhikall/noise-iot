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

const HourlyChart = ({ data }) => {
  // Sort data based on actual time (created_at)
  const sortedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    // Create copy of data to avoid mutating original data
    return [...data].sort((a, b) => {
      // Use created_at for precise sorting
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      return timeA - timeB; // Sort from earliest to latest
    });
  }, [data]);

  // Determine dynamic domain based on actual data values
  const getYDomain = () => {
    if (!sortedData || sortedData.length === 0) return [40, 85];

    const values = sortedData.map((item) => item.value);
    const validValues = values.filter((val) => val > 0);

    if (validValues.length === 0) return [40, 85];

    const minValue = Math.floor(Math.min(...validValues));
    const maxValue = Math.ceil(Math.max(...validValues));

    return [Math.max(0, minValue - 5), maxValue + 5];
  };

  // Format time for display on X axis
  const formatTime = (time) => {
    if (!time) return "";
    // Ensure consistent time format
    const timeParts = time.split(":");
    if (timeParts.length >= 2) {
      return `${timeParts[0]}:${timeParts[1]}`; // Format "HH:MM"
    }
    return time;
  };

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-gray-800 p-3 border border-gray-600 rounded shadow-lg text-left">
          <p className="text-blue-300 font-medium mb-1">{`Waktu: ${label}`}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <p className="text-gray-200">
                <span>{entry.name}: </span>
                <span className="text-white font-medium">
                  {typeof entry.value === "number"
                    ? entry.value.toFixed(1)
                    : entry.value}{" "}
                  dB
                </span>
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom legend component
  const CustomLegend = (props) => {
    const { payload } = props;

    return (
      <div className="flex justify-center items-center mt-2 mb-4">
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
        <h3 className="text-blue-300 text-sm font-medium">Tren LAeq Per Jam</h3>
      </div>
      <div className="p-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            barGap={0}
            barCategoryGap="20%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              opacity={0.5}
            />
            <XAxis
              dataKey="time"
              stroke="#9CA3AF"
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              tickFormatter={formatTime}
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
              fill="#86efac"
              name="LAeq"
              animationDuration={1000}
              radius={[2, 2, 0, 0]}
              activeBar={{ fill: "#a7f3bd", stroke: "#86efac", strokeWidth: 2 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HourlyChart;
