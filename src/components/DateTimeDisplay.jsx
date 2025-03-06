import { Calendar, Clock } from "lucide-react";

const DateTimeDisplay = ({ formattedDate, formattedTime }) => {
  return (
    <div className="flex items-center bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl p-3 shadow-lg">
      <div className="flex flex-col items-end mr-6 border-r border-blue-600 pr-6">
        <span className="text-xs text-green-300 font-medium">TANGGAL</span>
        <div className="flex items-center mt-1">
          <Calendar size={16} className="mr-2 text-blue-300" />
          <span className="text-sm font-medium">{formattedDate}</span>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-1xs text-green-300 font-medium animate-pulse">LIVE</span>
        <div className="flex items-center mt-1">
          <Clock size={16} className="mr-2 text-blue-300" />
          <span className="text-sm font-medium">{formattedTime} WIB</span>
        </div>
      </div>
    </div>
  );
};

export default DateTimeDisplay;
