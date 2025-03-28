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

const TrendChart = ({
  data,
  timeFilter,
  onTimeFilterChange,
  year,
  month,
  day,
}) => {
  const hasData = Array.isArray(data) && data.length > 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-gray-800 p-3 border border-gray-700 rounded shadow-lg">
          <p className="time text-gray-300 mb-2">{`${label}`}</p>
          {payload.map((entry, index) => (
            <div
              key={`item-${index}`}
              className="flex items-center space-x-2 mb-1"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <p className="text-sm">
                <span className="text-gray-300">{entry.name}: </span>
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

  const getDynamicYDomain = () => {
    if (!hasData) return [35, 65];

    const allValues = data
      .flatMap((item) => [
        item.value,
        item.l10,
        item.l50,
        item.l90,
        item.lmin,
        item.lmax,
      ])
      .filter((val) => typeof val === "number" && !isNaN(val) && val > 0);

    if (allValues.length === 0) return [35, 65];

    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);

    const yMin = Math.floor((minValue - 5) / 5) * 5;
    const yMax = Math.ceil((maxValue + 5) / 5) * 5;

    return [Math.max(yMin, 0), Math.min(yMax, 90)];
  };

  const yAxisDomain = getDynamicYDomain();

  const getTimeRangeDescription = () => {
    return timeFilter === "daytime"
      ? "Pagi (07:00 - 18:00)"
      : "Malam (19:00 - 06:00)";
  };

  return (
    <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700 mb-6">
      <div className="p-4 border-b border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-blue-300 text-sm font-medium">
          Tren LAeq {getTimeRangeDescription()}
        </h3>
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
            Pagi
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
            Malam
          </button>
        </div>
      </div>
      <div className="p-4 h-64">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="time"
                stroke="#9CA3AF"
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={yAxisDomain}
                stroke="#9CA3AF"
                tick={{ fontSize: 11 }}
                label={{
                  value: "dB",
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    textAnchor: "middle",
                    fill: "#9CA3AF",
                    fontSize: 11,
                  },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                name="LAeq"
                isAnimationActive={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="l10"
                stroke="#3B82F6"
                strokeWidth={1.5}
                dot={false}
                name="L10"
                isAnimationActive={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="l50"
                stroke="#8B5CF6"
                strokeWidth={1.5}
                dot={false}
                name="L50"
                isAnimationActive={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="l90"
                stroke="#EC4899"
                strokeWidth={1.5}
                dot={false}
                name="L90"
                isAnimationActive={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="lmin"
                stroke="#F59E0B"
                strokeWidth={1.5}
                dot={false}
                name="LMin"
                isAnimationActive={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="lmax"
                stroke="#EF4444"
                strokeWidth={1.5}
                dot={false}
                name="LMax"
                isAnimationActive={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <p>No data available for the selected time period</p>
            <button
              onClick={() =>
                onTimeFilterChange(
                  timeFilter === "daytime" ? "nighttime" : "daytime"
                )
              }
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700"
            >
              Try {timeFilter === "daytime" ? "nighttime" : "daytime"} period
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendChart;
