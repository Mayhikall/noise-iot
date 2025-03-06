import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const HourlyChart = ({ data }) => {
  return (
    <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-blue-300 text-sm font-medium">Tren LAeq Per Jam</h3>
      </div>
      <div className="p-4 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" />
            <YAxis domain={[40, 45]} stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
              }}
              labelStyle={{ color: "#F3F4F6" }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 1 }}
              activeDot={{ r: 5 }}
              name="LAeq"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HourlyChart;