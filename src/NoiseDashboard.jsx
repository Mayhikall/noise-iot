import React, { useState, useEffect } from "react";
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
  Download,
  FileText,
} from "lucide-react";
import Sidebar from "./components/Sidebar";
import ReportTable from "./components/ReportTable";
import Header from "./components/Header";
import { getBulanIndonesia, getHariIndonesia } from "./utils";
import SummaryCardsRow from "./components/SummaryCardRow";
import SecondaryCardsRow from "./components/SecondaryCardRow";
import TrendChart from "./components/TrendChart";
import HourlyChart from "./components/HourlyChart";
import MinuteChart from "./components/MinuteChart";
import MapPanel from "./components/MapPanel";
import Footer from "./components/Footer";

// Import API services
import {
  fetchDashboardSummary,
  fetchLaeqData,
  fetchLaeqMinuteData,
  fetchLaeqHourlyData,
  fetchRealtimeData,
  fetchMqttStatus,
  fetchTrendData,
  exportReportData,
} from "./services/api";

const NoiseDashboard = () => {
  // State Management
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [timeFilter, setTimeFilter] = useState("daytime");
  const [activeSidebarSection, setActiveSidebarSection] = useState("dashboard");
  const [reportTimeRange, setReportTimeRange] = useState("15minutes");
  const [exportLoading, setExportLoading] = useState(false);

  // Data States
  const [summaryData, setSummaryData] = useState({
    latestLaeq: { laeq: 0, L10: 0, L50: 0, L90: 0, Lmax: 0, Lmin: 0 },
    todayStats: { maxLaeq: 0, minLaeq: 0, avgLaeq: 0 },
  });
  const [trendingData, setTrendingData] = useState([]);
  const [minuteData, setMinuteData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [mqttStatus, setMqttStatus] = useState({
    status: "Offline",
    quality: "Offline",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sidebar Toggle Function
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSectionChange = (section) => {
    setActiveSidebarSection(section);
    console.log(`Navigating to: ${section}`);
  };

  // Format API data for charts
  const formatTrendData = (data) => {
    if (!data || !Array.isArray(data)) return [];

    return data.map((item) => ({
      time: new Date(item.created_at).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      value: item.laeq || 0,
      l10: item.L10 || 0,
      l50: item.L50 || 0,
      l90: item.L90 || 0,
      lmin: item.Lmin || 0,
      lmax: item.Lmax || 0,
    }));
  };

  // Status Determination Function
  const getStatus = (noiseLevel) => {
    if (noiseLevel <= 15) {
      return {
        status: "Silent",
        color: "bg-green-800",
        icon: Volume2,
        description: "Hening, hampir tidak ada suara",
      };
    }
  
    if (noiseLevel <= 20) {
      return {
        status: "Quiet",
        color: "bg-green-600",
        icon: Volume2,
        description: "Suara sangat pelan",
      };
    }
  
    if (noiseLevel <= 40) {
      return {
        status: "Whispered",
        color: "bg-green-400",
        icon: Volume2,
        description: "Berbisik, sangat tenang",
      };
    }
  
    if (noiseLevel <= 60) {
      return {
        status: "Normal",
        color: "bg-yellow-500",
        icon: Volume2,
        description: "Percakapan normal",
      };
    }
  
    if (noiseLevel <= 90) {
      return {
        status: "High",
        color: "bg-orange-500",
        icon: Volume2,
        description: "Mulai merusak pendengaran",
      };
    }
  
    if (noiseLevel <= 100) {
      return {
        status: "Very High",
        color: "bg-orange-700",
        icon: Volume2,
        description: "Kehilangan pendengaran bisa terjadi",
      };
    }
  
    return {
      status: "Extreme",
      color: "bg-red-700",
      icon: Volume2,
      description: "Bahaya! Kerusakan pendengaran serius",
    };
  };
  
  // MQTT Status Icon and Color
  const getMqttStatusDisplay = () => {
    if (!mqttStatus || mqttStatus.status === "Offline") {
      return {
        icon: WifiOff,
        color: "text-gray-500",
        text: "Offline",
      };
    }

    switch (mqttStatus.quality) {
      case "Baik":
        return {
          icon: Wifi,
          color: "text-green-500",
          text: "Sinyal Baik",
        };
      case "Sedang":
        return {
          icon: Wifi,
          color: "text-yellow-500",
          text: "Sinyal Sedang",
        };
      case "Lemah":
        return {
          icon: Wifi,
          color: "text-red-500",
          text: "Sinyal Lemah",
        };
      default:
        return {
          icon: WifiOff,
          color: "text-gray-500",
          text: "Unknown",
        };
    }
  };

  // Get current values from summary data
  const currentLaeq = summaryData?.latestLaeq?.laeq || 0;
  const currentL10 = summaryData?.latestLaeq?.L10 || 0;
  const currentL50 = summaryData?.latestLaeq?.L50 || 0;
  const currentL90 = summaryData?.latestLaeq?.L90 || 0;
  const currentLMax = summaryData?.latestLaeq?.Lmax || 0;
  const currentLMin = summaryData?.latestLaeq?.Lmin || 0;

  // Derive current status
  const currentStatus = getStatus(currentLaeq);

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
    if (!data || !Array.isArray(data)) return [];
    return data;
  };

  // Fetch dashboard summary data
  const fetchSummaryData = async () => {
    try {
      const summary = await fetchDashboardSummary();
      setSummaryData(summary);
      console.log("Summary data loaded:", summary);
    } catch (err) {
      console.error("Error loading summary data:", err);
      setError("Failed to load dashboard data");
    }
  };

  // Update the loadTrendData function
const loadTrendData = async () => {
  try {
    const response = await fetchTrendData({ 
      timeFilter: timeFilter, // Pass the current time filter
      limit: 12 // We want 12 hours of data
    });
    
    setTrendingData(response);
    console.log("Trend data loaded:", response);
  } catch (err) {
    console.error("Error loading trend data:", err);
  }
};

  // Fetch minute data
  const fetchMinuteData = async () => {
    try {
      const response = await fetchLaeqMinuteData({ limit: 60 });
      const minuteData = formatTrendData(response);
      setMinuteData(minuteData);
      console.log("Minute data loaded:", minuteData);
    } catch (err) {
      console.error("Error loading minute data:", err);
    }
  };

  // Fetch hourly data
  const fetchHourlyData = async () => {
    try {
      const response = await fetchLaeqHourlyData({ limit: 24 });
      const hourlyData = formatTrendData(response);
      setHourlyData(hourlyData);
      console.log("Hourly data loaded:", hourlyData);
    } catch (err) {
      console.error("Error loading hourly data:", err);
    }
  };

  // Fetch report data - will now include all needed fields
  const fetchReportData = async () => {
    try {
      const response = await fetchRealtimeData({
        limit: 10,
        timeRange: reportTimeRange,
      });

      if (!response || !Array.isArray(response)) {
        setReportData([]);
        return;
      }

      const reportData = response.map((item) => ({
        l10: item.L10 || 0,
        l50: item.L50 || 0,
        l90: item.L90 || 0,
        value: item.laeq || 0,
        timestamp: new Date(item.created_at).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        lmax: item.Lmax || 0,
        lmin: item.Lmin || 0,
        created_at: item.created_at,
      }));

      setReportData(reportData);
      console.log("Report data loaded:", reportData);
    } catch (err) {
      console.error("Error loading report data:", err);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  // Update the fetchMqttStatusData function
  const fetchMqttStatusData = async () => {
    try {
      const status = await fetchMqttStatus();
      setMqttStatus(status);
      console.log("MQTT status loaded:", status);
    } catch (err) {
      console.error("Error loading MQTT status:", err);
      setMqttStatus({
        status: "Offline",
        quality: "Offline",
        lastUpdated: new Date().toISOString(),
        lastOnlineTimestamp: null,
      });
    }
  };

  // Handle export report
  const handleExportReport = async (format) => {
    try {
      setExportLoading(true);
      await exportReportData(format, reportTimeRange);
      setExportLoading(false);
    } catch (err) {
      console.error(`Error exporting ${format} report:`, err);
      setExportLoading(false);
      // Show error notification
      alert(`Failed to export ${format} report. Please try again.`);
    }
  };

  // Handle report time range change
  const handleReportTimeRangeChange = (range) => {
    setReportTimeRange(range);
    // Reload report data with new time range
    fetchReportData();
  };

  // Initial data loading
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchSummaryData(),
          loadTrendData(),
          fetchMinuteData(),
          fetchHourlyData(),
          fetchReportData(),
          fetchMqttStatusData(),
        ]);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Reload report data when time range changes
  useEffect(() => {
    fetchReportData();
  }, [reportTimeRange]);

  // Periodic data and time updates (every 30 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
      fetchSummaryData();
      loadTrendData();
      fetchReportData();
      fetchMqttStatusData();
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  // Update minute data every 5 minutes
  useEffect(() => {
    const timer = setInterval(() => {
      fetchMinuteData();
    }, 300000); // 5 minutes

    return () => clearInterval(timer);
  }, []);

  // Update hourly data every hour
  useEffect(() => {
    const timer = setInterval(() => {
      fetchHourlyData();
    }, 3600000); // 1 hour

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="text-center p-8 bg-gray-800 rounded-lg">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-xl mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Refresh Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Get MQTT status display properties
  const mqttStatusDisplay = getMqttStatusDisplay();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          activeSection={activeSidebarSection}
          onSectionChange={handleSectionChange}
        />
  
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-auto">
          <Header
            formattedDate={formattedDate}
            formattedTime={formattedTime}
            mqttStatus={mqttStatusDisplay}
          />
  
          {/* Dashboard content */}
          <div className="p-6 flex-1">
            <div className="lg:col-span-1 mb-6">
              <MapPanel
                currentStatus={currentStatus}
                deviceId="EETSB"
                mqttStatus={{
                  ...mqttStatus,
                  text: mqttStatusDisplay.text,
                  color: mqttStatusDisplay.color,
                  icon: mqttStatusDisplay.icon,
                  // Ensure we have the correct timestamp properties
                  lastUpdated:
                    mqttStatus.lastUpdated ||
                    mqttStatus.updated_at ||
                    new Date().toISOString(),
                  lastOnlineTimestamp:
                    mqttStatus.lastOnlineTimestamp || mqttStatus.lastUpdated,
                  // Make sure status is properly parsed from combined string if needed
                  status:
                    mqttStatus.status && mqttStatus.status.startsWith("Online")
                      ? "Online"
                      : mqttStatus.status,
                }}
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
  
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <MinuteChart data={minuteData} />
                <HourlyChart data={hourlyData} />
              </div>
            </div>
  
            {/* Report Section */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Data Laporan</h2>
  
                <div className="flex space-x-2">
                  {/* Time Range Selector */}
                  <select
                    value={reportTimeRange}
                    onChange={(e) => handleReportTimeRangeChange(e.target.value)}
                    className="bg-gray-700 text-white border border-gray-600 rounded px-2 py-1"
                  >
                    <option value="15minutes">15 Menit</option>
                    <option value="1hour">1 Jam</option>
                  </select>
  
                  {/* Export Buttons */}
                  <button
                    onClick={() => handleExportReport("excel")}
                    disabled={exportLoading}
                    className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileText size={16} />
                    <span>Excel</span>
                  </button>
  
                  <button
                    onClick={() => handleExportReport("pdf")}
                    disabled={exportLoading}
                    className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download size={16} />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
  
              <ReportTable
                reportData={reportData}
                currentDateTime={currentDateTime}
                timeRange={reportTimeRange}
              />
            </div>
          </div>
  
          {/* Non-sticky Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default NoiseDashboard;