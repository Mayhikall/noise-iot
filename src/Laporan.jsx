import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
  CloudRain,
  Cloud,
  Droplets,
  Volume,
  VolumeX,
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
  fetchLaeqMinuteData,
  fetchLaeqHourlyData,
  fetchMqttStatus,
  fetchTrendData,
  exportReportData,
  fetchCombinedRealtimeData,
} from "./services/api";

// Enhanced RainDrop component with more variations
const RainDrop = ({ intensity, index }) => {
  const left = `${Math.random() * 100}%`;
  const animationDuration = `${0.3 + Math.random() * 0.7}s`;
  const delay = `${Math.random() * 0.5}s`;
  const opacity =
    intensity === "heavy" ? 0.9 : intensity === "medium" ? 0.7 : 0.5;

  // Different sizes based on intensity
  let size;
  if (intensity === "heavy") {
    size = `${2 + Math.random() * 3}px`;
  } else if (intensity === "medium") {
    size = `${1.5 + Math.random() * 2}px`;
  } else {
    size = `${1 + Math.random() * 1.5}px`;
  }

  // Add some variation to the animation
  const animationName = `fall-${index % 3}`;
  const animationStyle = {
    left,
    width: size,
    height: size,
    opacity,
    top: "-20px",
    animation: `${animationName} ${animationDuration} linear infinite`,
    animationDelay: delay,
  };

  // Add slight horizontal movement for some drops
  if (index % 5 === 0) {
    animationStyle.transform = `translateX(${Math.random() * 20 - 10}px)`;
  }

  return (
    <div
      className="absolute bg-blue-300 rounded-full pointer-events-none"
      style={animationStyle}
    />
  );
};

// Enhanced RainAnimation component with more control
const RainAnimation = ({ intensity = "heavy", count = 120 }) => {
  // Adjust count based on intensity
  const dropCount =
    intensity === "heavy" ? 200 : intensity === "medium" ? 120 : 60;

  // Create different animation styles
  const animationStyles = `
    @keyframes fall-0 {
      to { transform: translateY(100vh) translateX(0); }
    }
    @keyframes fall-1 {
      to { transform: translateY(100vh) translateX(10px); }
    }
    @keyframes fall-2 {
      to { transform: translateY(100vh) translateX(-10px); }
    }
  `;

  return (
    <>
      <style>{animationStyles}</style>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {Array.from({ length: dropCount }).map((_, i) => (
          <RainDrop key={i} intensity={intensity} index={i} />
        ))}
      </div>
    </>
  );
};

const Laporan = () => {
  // State Management
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [timeFilter, setTimeFilter] = useState("daytime");
  const [activeSidebarSection, setActiveSidebarSection] = useState("laporan");
  const [activeReportTab, setActiveReportTab] = useState("all");
  const [reportTimeRange, setReportTimeRange] = useState("15minutes");
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [weatherIntensity, setWeatherIntensity] = useState("heavy"); // Default to heavy rain

  // Audio state
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMusicLoaded, setIsMusicLoaded] = useState(false);
  const audioRef = useRef(null);

  // Data States
  const [summaryData, setSummaryData] = useState({
    latestLaeq: { laeq: 0, L10: 0, L50: 0, L90: 0, Lmax: 0, Lmin: 0 },
    todayStats: { maxLaeq: 0, minLaeq: 0, avgLaeq: 0 },
  });
  const [trendingData, setTrendingData] = useState({
    daytime: [],
    nighttime: [],
  });
  const [minuteData, setMinuteData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [mqttStatus, setMqttStatus] = useState({
    status: "Offline",
    quality: "Offline",
  });
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState({
    summary: false,
    trend: false,
    minute: false,
    hourly: false,
    report: false,
    mqtt: false,
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize audio
  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio("src/assets/gala-gala.mp3"); // Update with your music file path
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    // Handle when music is loaded
    audioRef.current.addEventListener("canplaythrough", () => {
      setIsMusicLoaded(true);
    });

    // Handle errors
    audioRef.current.addEventListener("error", () => {
      console.error("Error loading audio file");
      setIsMusicLoaded(false);
    });

    // Auto-play handling
    const handleFirstInteraction = () => {
      // On first user interaction, try to play music if not already playing
      if (!isMusicPlaying && isMusicLoaded) {
        toggleMusic();
      }
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };

    // Add event listeners for first interaction
    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);

    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("canplaythrough", () => {});
        audioRef.current.removeEventListener("error", () => {});
        audioRef.current = null;
      }
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [isMusicLoaded]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Toggle music play/pause
  const toggleMusic = useCallback(() => {
    if (!audioRef.current || !isMusicLoaded) return;

    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsMusicPlaying(true);
        })
        .catch((error) => {
          console.error("Audio playback failed:", error);
          // Show a message to user if needed
        });
    }
  }, [isMusicPlaying, isMusicLoaded]);

  // Handle volume change
  const handleVolumeChange = useCallback(
    (e) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);

      // If volume is set to 0 and music is playing, pause it
      if (newVolume === 0 && isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      }
      // If volume is > 0 and music is not playing, play it
      else if (newVolume > 0 && !isMusicPlaying && isMusicLoaded) {
        audioRef.current
          .play()
          .then(() => {
            setIsMusicPlaying(true);
          })
          .catch((error) => {
            console.error("Audio playback failed:", error);
          });
      }
    },
    [isMusicPlaying, isMusicLoaded]
  );

  // Sidebar Toggle Function
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleSectionChange = useCallback((section) => {
    setActiveSidebarSection(section);
    console.log(`Navigating to: ${section}`);
  }, []);

  // Format API data for charts
  const formatTrendData = useCallback((data) => {
    if (!data || !Array.isArray(data)) return [];

    return data.map((item) => ({
      time:
        item.time ||
        new Date(item.created_at).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      value: item.value || item.laeq || item.laeq1h || 0,
      l10: item.L10 || item.l10 || 0,
      l50: item.L50 || item.l50 || 0,
      l90: item.L90 || item.l90 || 0,
      lmin: item.Lmin || item.lmin || 0,
      lmax: item.Lmax || item.lmax || 0,
    }));
  }, []);

  // Status Determination Function
  const getStatus = useCallback((noiseLevel) => {
    if (noiseLevel <= 15)
      return {
        status: "Silent",
        color: "bg-green-800",
        icon: Volume2,
        description: "Hening, hampir tidak ada suara",
      };
    if (noiseLevel <= 20)
      return {
        status: "Quiet",
        color: "bg-green-600",
        icon: Volume2,
        description: "Suara sangat pelan",
      };
    if (noiseLevel <= 40)
      return {
        status: "Whispered",
        color: "bg-green-400",
        icon: Volume2,
        description: "Berbisik, sangat tenang",
      };
    if (noiseLevel <= 60)
      return {
        status: "Normal",
        color: "bg-yellow-500",
        icon: Volume2,
        description: "Percakapan normal",
      };
    if (noiseLevel <= 90)
      return {
        status: "High",
        color: "bg-orange-500",
        icon: Volume2,
        description: "Mulai merusak pendengaran",
      };
    if (noiseLevel <= 100)
      return {
        status: "Very High",
        color: "bg-orange-700",
        icon: Volume2,
        description: "Kehilangan pendengaran bisa terjadi",
      };
    return {
      status: "Extreme",
      color: "bg-red-700",
      icon: Volume2,
      description: "Bahaya! Kerusakan pendengaran serius",
    };
  }, []);

  // MQTT Status Icon and Color
  const getMqttStatusDisplay = useCallback(() => {
    if (!mqttStatus || mqttStatus.status === "Offline") {
      return { icon: WifiOff, color: "text-gray-500", text: "Offline" };
    }
    switch (mqttStatus.quality) {
      case "Baik":
        return { icon: Wifi, color: "text-green-500", text: "Sinyal Baik" };
      case "Sedang":
        return { icon: Wifi, color: "text-yellow-500", text: "Sinyal Sedang" };
      case "Lemah":
        return { icon: Wifi, color: "text-red-500", text: "Sinyal Lemah" };
      default:
        return { icon: WifiOff, color: "text-gray-500", text: "Unknown" };
    }
  }, [mqttStatus]);

  // Memoized current values from summary data
  const currentLaeq = useMemo(
    () => summaryData?.latestLaeq?.laeq || 0,
    [summaryData]
  );
  const currentL10 = useMemo(
    () => summaryData?.latestLaeq?.L10 || 0,
    [summaryData]
  );
  const currentL50 = useMemo(
    () => summaryData?.latestLaeq?.L50 || 0,
    [summaryData]
  );
  const currentL90 = useMemo(
    () => summaryData?.latestLaeq?.L90 || 0,
    [summaryData]
  );
  const currentLMax = useMemo(
    () => summaryData?.latestLaeq?.Lmax || 0,
    [summaryData]
  );
  const currentLMin = useMemo(
    () => summaryData?.latestLaeq?.Lmin || 0,
    [summaryData]
  );

  // Derive current status
  const currentStatus = useMemo(
    () => getStatus(currentLaeq),
    [currentLaeq, getStatus]
  );

  // Time and Date Formatting
  const formattedDate = useMemo(() => {
    return `${getHariIndonesia(
      currentDateTime.getDay()
    )}, ${currentDateTime.getDate()} ${getBulanIndonesia(
      currentDateTime.getMonth()
    )} ${currentDateTime.getFullYear()}`;
  }, [currentDateTime]);

  const formattedTime = useMemo(() => {
    return currentDateTime.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, [currentDateTime]);

  // Fetch dashboard summary data
  const fetchSummaryData = useCallback(async () => {
    try {
      setDataLoading((prev) => ({ ...prev, summary: true }));
      const summary = await fetchDashboardSummary();
      setSummaryData(summary);

      // Change weather intensity based on noise level
      if (summary.latestLaeq.laeq > 70) {
        setWeatherIntensity("heavy");
      } else if (summary.latestLaeq.laeq > 50) {
        setWeatherIntensity("medium");
      } else {
        setWeatherIntensity("light");
      }

      console.log("Summary data loaded:", summary);
    } catch (err) {
      console.error("Error loading summary data:", err);
      if (initialLoading) {
        setError("Failed to load dashboard data");
      }
    } finally {
      setDataLoading((prev) => ({ ...prev, summary: false }));
    }
  }, [initialLoading]);

  // Pre-fetch both daytime and nighttime trend data
  const loadAllTrendData = useCallback(async () => {
    try {
      setDataLoading((prev) => ({ ...prev, trend: true }));

      // Fetch daytime and nighttime data in parallel
      const [daytimeData, nighttimeData] = await Promise.all([
        fetchTrendData({
          timeFilter: "daytime",
          year: selectedYear,
          month: selectedMonth,
          day: selectedDay,
        }),
        fetchTrendData({
          timeFilter: "nighttime",
          year: selectedYear,
          month: selectedMonth,
          day: selectedDay,
        }),
      ]);

      setTrendingData({
        daytime: daytimeData,
        nighttime: nighttimeData,
      });

      console.log("All trend data loaded");
    } catch (err) {
      console.error("Error loading trend data:", err);
    } finally {
      setDataLoading((prev) => ({ ...prev, trend: false }));
    }
  }, [selectedYear, selectedMonth, selectedDay]);

  // Fetch minute data with debounce
  const fetchMinuteData = useCallback(async () => {
    try {
      setDataLoading((prev) => ({ ...prev, minute: true }));
      const response = await fetchLaeqMinuteData();
      setMinuteData(response);
      console.log("Minute data loaded");
    } catch (err) {
      console.error("Error loading minute data:", err);
    } finally {
      setDataLoading((prev) => ({ ...prev, minute: false }));
    }
  }, []);

  // Fetch hourly data with debounce
  const fetchHourlyData = useCallback(async () => {
    try {
      setDataLoading((prev) => ({ ...prev, hourly: true }));
      const response = await fetchLaeqHourlyData({ limit: 24 });
      setHourlyData(response);
      console.log("Hourly data loaded");
    } catch (err) {
      console.error("Error loading hourly data:", err);
    } finally {
      setDataLoading((prev) => ({ ...prev, hourly: false }));
    }
  }, []);

  // Fetch report data
  const fetchReportData = useCallback(async () => {
    try {
      setDataLoading((prev) => ({ ...prev, report: true }));
      const response = await fetchCombinedRealtimeData({
        timeRange: reportTimeRange,
      });

      if (!response || !Array.isArray(response)) {
        setReportData([]);
        return;
      }

      // Process data for ReportTable
      const processedData = response.map((item) => {
        const baseObject = {
          created_at: item.created_at,
          timestamp: new Date(item.created_at).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          dataType: item.dataType,
        };

        // Add data according to type
        switch (item.dataType) {
          case "realtime":
            return {
              ...baseObject,
              l10: item.L10,
              l50: item.L50,
              l90: item.L90,
            };

          case "laeq":
            return {
              ...baseObject,
              value: item.laeq,
            };

          case "hourly":
            return {
              ...baseObject,
              lmin: item.Lmin,
              lmax: item.Lmax,
            };

          default:
            return baseObject;
        }
      });

      setReportData(processedData);
      console.log("Report data loaded");
    } catch (err) {
      console.error("Error loading report data:", err);
      setReportData([]);
    } finally {
      setDataLoading((prev) => ({ ...prev, report: false }));
    }
  }, [reportTimeRange]);

  // Fetch MQTT status data
  const fetchMqttStatusData = useCallback(async () => {
    try {
      setDataLoading((prev) => ({ ...prev, mqtt: true }));
      const status = await fetchMqttStatus();
      setMqttStatus(status);
      console.log("MQTT status loaded");
    } catch (err) {
      console.error("Error loading MQTT status:", err);
      setMqttStatus({
        status: "Offline",
        quality: "Offline",
        lastUpdated: new Date().toISOString(),
        lastOnlineTimestamp: null,
      });
    } finally {
      setDataLoading((prev) => ({ ...prev, mqtt: false }));
    }
  }, []);

  // Handle time filter change for trend data
  const handleTimeFilterChange = useCallback((newFilter) => {
    setTimeFilter(newFilter);
    // No need to fetch data again, we already have both daytime and nighttime data
  }, []);

  // Handle export report
  const handleExportReport = useCallback(
    async (format, reportType) => {
      try {
        setExportLoading(true);
        // Use the reportType passed from ReportTable
        await exportReportData(format, reportType, reportTimeRange);
        setExportLoading(false);
      } catch (err) {
        console.error(`Error exporting ${format} report:`, err);
        setExportLoading(false);
        alert(`Failed to export ${format} report. Please try again.`);
      }
    },
    [reportTimeRange]
  );

  // Handle report time range change
  const handleReportTabChange = useCallback((tab) => {
    setActiveReportTab(tab);
  }, []);

  // Effect to monitor reportTimeRange changes
  useEffect(() => {
    fetchReportData();
  }, [reportTimeRange, fetchReportData]);

  // Effect to monitor date changes
  useEffect(() => {
    loadAllTrendData();
  }, [selectedYear, selectedMonth, selectedDay, loadAllTrendData]);

  // Initial data loading with improved parallelization
  useEffect(() => {
    const loadAllData = async () => {
      setInitialLoading(true);
      try {
        // Load data in parallel
        await Promise.all([
          fetchSummaryData(),
          loadAllTrendData(),
          fetchMqttStatusData(),
          fetchMinuteData(),
          fetchHourlyData(),
          fetchReportData(),
        ]);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error("Error loading data:", err);
      } finally {
        setInitialLoading(false);
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  // Staggered data updates to prevent UI freezing
  useEffect(() => {
    const updateDateTime = () => {
      setCurrentDateTime(new Date());
    };

    let updateSummaryInterval;
    let updateTrendInterval;
    let updateMqttInterval;

    // Set up staggered intervals
    const setupIntervals = () => {
      // Update time every second
      const timeInterval = setInterval(updateDateTime, 1000);

      // Update summary every 15 seconds
      updateSummaryInterval = setInterval(fetchSummaryData, 1000);

      // Update trend data every 30 seconds
      updateTrendInterval = setInterval(loadAllTrendData, 30000);

      // Update MQTT status every 20 seconds
      updateMqttInterval = setInterval(fetchMqttStatusData, 20000);

      return () => {
        clearInterval(timeInterval);
        clearInterval(updateSummaryInterval);
        clearInterval(updateTrendInterval);
        clearInterval(updateMqttInterval);
      };
    };

    return setupIntervals();
  }, [fetchSummaryData, loadAllTrendData, fetchMqttStatusData]);

  // Update report data every minute
  useEffect(() => {
    const timer = setInterval(fetchReportData, 60000);
    return () => clearInterval(timer);
  }, [fetchReportData]);

  // Update minute data every 5 minutes
  useEffect(() => {
    const timer = setInterval(fetchMinuteData, 60000);
    return () => clearInterval(timer);
  }, [fetchMinuteData]);

  // Update hourly data every hour
  useEffect(() => {
    const timer = setInterval(fetchHourlyData, 3600000);
    return () => clearInterval(timer);
  }, [fetchHourlyData]);

  // Memoized data for chart components
  const currentTrendData = useMemo(() => {
    return trendingData[timeFilter] || [];
  }, [trendingData, timeFilter]);

  // Memoized MQTT status display
  const mqttStatusDisplay = useMemo(
    () => getMqttStatusDisplay(),
    [getMqttStatusDisplay]
  );

  // Determine if there's any data loading operation in progress
  const isAnyDataLoading = useMemo(
    () => Object.values(dataLoading).some((status) => status),
    [dataLoading]
  );

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
        <div className="text-center p-8 bg-gray-800 rounded-lg relative z-10">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-xl mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white overflow-hidden relative">
      {/* Enhanced Rain Animation */}
      <RainAnimation
        intensity={weatherIntensity}
        count={
          weatherIntensity === "heavy"
            ? 200
            : weatherIntensity === "medium"
            ? 120
            : 60
        }
      />
      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes fall-0 {
          to {
            transform: translateY(100vh) translateX(0);
          }
        }
        @keyframes fall-1 {
          to {
            transform: translateY(100vh) translateX(10px);
          }
        }
        @keyframes fall-2 {
          to {
            transform: translateY(100vh) translateX(-10px);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateX(0) translateY(0);
          }
          50% {
            transform: translateX(20px) translateY(-5px);
          }
        }
      `}</style>

      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          activeSection={activeSidebarSection}
          onSectionChange={handleSectionChange}
        />
        <div className="flex-1 flex flex-col overflow-auto">
          <Header
            formattedDate={formattedDate}
            formattedTime={formattedTime}
            mqttStatus={mqttStatusDisplay}
            isLoading={isAnyDataLoading}
          />
          <div className="p-6 flex-1">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Data Laporan</h2>
              </div>
              <ReportTable
                reportData={reportData}
                currentDateTime={currentDateTime.toLocaleString("id-ID")}
                timeRange={reportTimeRange}
                fetchMoreData={fetchReportData}
                onExport={handleExportReport}
                onTabChange={handleReportTabChange}
                isLoading={dataLoading.report || exportLoading}
              />
            </div>

            {/* Music Controls with tighter spacing */}
            <div className="sticky float-right bottom-4 z-50">
              <div className="bg-gray-800 bg-opacity-70 p-2 rounded-lg flex items-center space-x-2 shadow-lg backdrop-blur-sm">
                <button
                  onClick={toggleMusic}
                  className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                  aria-label={isMusicPlaying ? "Pause music" : "Play music"}
                >
                  {isMusicPlaying ? (
                    <Volume size={20} className="text-blue-400" />
                  ) : (
                    <VolumeX size={20} className="text-gray-400" />
                  )}
                </button>

                {isMusicPlaying && (
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24 accent-blue-500"
                    aria-label="Volume control"
                  />
                )}
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Laporan;
