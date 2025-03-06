import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Clock,
  MapPin,
  Volume2,
  TrendingDown,
  BarChart2,
  Calendar,
  Menu,
  X,
  AlertCircle,
  Clock3,
  Wifi,
  WifiOff,
} from "lucide-react";
import Sidebar from "./components/Sidebar";
import ReportTable from "./components/ReportTable";
import Header from "./components/Header";
import { getBulanIndonesia, getHariIndonesia } from "./utils";
import SummaryCard from "./components/SummaryCard";
import SecondaryCard from "./components/SecondaryCard";
import TrendChart from "./components/TrendChart";
import SummaryCardsRow from "./components/SummaryCardRow";
import SecondaryCardsRow from "./components/SecondaryCardRow";
import HourlyChart from "./components/HourlyChart";
import MinuteChart from "./components/MinuteChart";
import MapPanel from "./components/MapPanel";

// Sample data generation
const generateTimeSeriesData = (count, baseValue, variance) => {
  const data = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60000);
    const time = timestamp.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const value = baseValue + Math.random() * variance * 2 - variance;
    data.push({
      time,
      value: parseFloat(value.toFixed(1)),
      l10: parseFloat((value - 1.5 + Math.random() * 3).toFixed(1)),
      l50: parseFloat((value - 2 + Math.random() * 2.5).toFixed(1)),
      l90: parseFloat((value - 2.5 + Math.random() * 2).toFixed(1)),
      lmin: parseFloat((value - 3 + Math.random() * 2).toFixed(1)),
      lmax: parseFloat((value + 2 + Math.random() * 3).toFixed(1)),
    });
  }
  return data;
};

// Sample report data generation
const generateReportData = () => {
  const now = new Date();
  const baseTime = new Date(now);
  const reportData = [];

  for (let i = 0; i < 9; i++) {
    const timestamp = new Date(baseTime.getTime() - i * 5000);
    const timeString = timestamp.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    reportData.push({
      l10: 42.3,
      l50: 41.4,
      l90: 40.9,
      value: 41.3 + (Math.random() * 2 - 1),
      timestamp: timeString,
      lmax: 53.3 + (Math.random() * 2 - 1),
      lmin: 40.2 + (Math.random() * 0.5 - 0.25),
    });
  }

  return reportData;
};

const NoiseDashboard = () => {
  // State Management
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [mqttStatus, setMqttStatus] = useState("online");
  const [timeFilter, setTimeFilter] = useState("daytime");
  const [activeSidebarSection, setActiveSidebarSection] = useState("dashboard");

  // Data States
  const [trendingData, setTrendingData] = useState(
    generateTimeSeriesData(60, 42, 5)
  );
  const [minuteData, setMinuteData] = useState(
    generateTimeSeriesData(60, 42, 2)
  );
  const [hourlyData, setHourlyData] = useState(
    generateTimeSeriesData(24, 41.5, 0.5)
  );
  const [reportData, setReportData] = useState(generateReportData());

  // Sidebar Toggle Function
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSectionChange = (section) => {
    setActiveSidebarSection(section);
    // Tambahkan logika navigasi atau perubahan konten sesuai kebutuhan
    console.log(`Navigating to: ${section}`);
  };

  // Current Measurement Values
  const currentLaeq = 42;
  const currentL10 = 42.3;
  const currentL50 = 41.4;
  const currentL90 = 40.9;
  const currentLMax = 53.3;
  const currentLMin = 40.2;
  const changePercent = -20.9;

  // Status Determination Function
  const getStatus = (mqttStatus, noiseLevel) => {
    // First check MQTT connection status
    if (mqttStatus === "offline") {
      return {
        status: "Offline",
        color: "bg-gray-500",
        icon: WifiOff,
        description: "Koneksi perangkat terputus",
      };
    }

    // If MQTT is online, then check noise level
    if (noiseLevel < 45) {
      return {
        status: "Baik",
        color: "bg-green-500",
        icon: Volume2,
        description: "Tingkat kebisingan rendah",
      };
    }

    if (noiseLevel < 55) {
      return {
        status: "Sedang",
        color: "bg-yellow-500",
        icon: Volume2,
        description: "Tingkat kebisingan normal",
      };
    }

    return {
      status: "Tinggi",
      color: "bg-red-500",
      icon: Volume2,
      description: "Tingkat kebisingan tinggi",
    };
  };

  // Derive current status
  const currentStatus = getStatus(mqttStatus, currentLaeq);

  // Time and Date Formatting
  const formattedDate = `${getHariIndonesia(
    currentDateTime.getDay()
  )}, ${currentDateTime.getDate()} ${getBulanIndonesia(
    currentDateTime.getMonth()
  )} ${currentDateTime.getFullYear()}`;

  const formattedTime = currentDateTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Data Filtering Function
  const filterDataByTimePeriod = (data) => {
    return data.filter((_, index) => {
      const simulatedHour = (7 + Math.floor(index / 2.5)) % 24;
      return timeFilter === "daytime"
        ? simulatedHour >= 7 && simulatedHour < 19
        : simulatedHour < 7 || simulatedHour >= 19;
    });
  };

  // Toggle MQTT Status (for demonstration)
  const toggleMqttStatus = () => {
    setMqttStatus(mqttStatus === "online" ? "offline" : "online");
  };

  // Periodic Data and Time Updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
      setTrendingData(generateTimeSeriesData(60, 42, 5));
      setMinuteData(generateTimeSeriesData(60, 42, 2));
      setReportData(generateReportData());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white overflow-hidden">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        activeSection={activeSidebarSection}
        onSectionChange={handleSectionChange}
      />

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <Header
          mqttStatus={mqttStatus}
          toggleMqttStatus={toggleMqttStatus}
          formattedDate={formattedDate}
          formattedTime={formattedTime}
        />

        {/* Dashboard content */}
        <div className="p-6">
        <div className="lg:col-span-1 mb-6">
            <MapPanel
              currentStatus={currentStatus}
              currentDateTime={currentDateTime}
              deviceId="EETSB"
              location="Jalan Raya 72"
            />
          </div>
          {/* Summary Cards */}
          <div className="lg:col-span-3">
            <SummaryCardsRow
              currentLaeq={currentLaeq}
              currentL10={currentL10}
              currentL50={currentL50}
              currentL90={currentL90}
              currentStatus={currentStatus}
            />

            <div className="mt-6">
              <SecondaryCardsRow
                currentLMin={currentLMin}
                currentLMax={currentLMax}
                currentStatus={currentStatus}
              />
            </div>
          </div>

          

          {/* Charts Section */}
          <div className="mb-6">
            <TrendChart
              data={filterDataByTimePeriod(trendingData)}
              timeFilter={timeFilter}
              onTimeFilterChange={setTimeFilter}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MinuteChart data={minuteData} />
              <HourlyChart data={hourlyData} />
            </div>
          </div>
          {/* Report Section */}
          <ReportTable
            reportData={reportData}
            currentDateTime={currentDateTime}
          />
        </div>
      </div>

      {/* Map Panel - in a collapsible side panel */}
    </div>
  );
};

export default NoiseDashboard;
