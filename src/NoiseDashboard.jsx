import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Clock, MapPin, Volume2, TrendingDown, BarChart2, Calendar, Menu, X, AlertCircle, Clock3, Wifi, WifiOff } from 'lucide-react';

// Sample data generation
const generateTimeSeriesData = (count, baseValue, variance) => {
  const data = [];
  const now = new Date();
  
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60000);
    const time = timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const value = baseValue + (Math.random() * variance * 2) - variance;
    data.push({
      time,
      value: parseFloat(value.toFixed(1)),
      l10: parseFloat((value - 1.5 + Math.random() * 3).toFixed(1)),
      l50: parseFloat((value - 2 + Math.random() * 2.5).toFixed(1)),
      l90: parseFloat((value - 2.5 + Math.random() * 2).toFixed(1)),
      lmin: parseFloat((value - 3 + Math.random() * 2).toFixed(1)),
      lmax: parseFloat((value + 2 + Math.random() * 3).toFixed(1))
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
    const timeString = timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    reportData.push({
      l10: 42.3,
      l50: 41.4,
      l90: 40.9,
      value: 41.3 + (Math.random() * 2 - 1),
      timestamp: timeString,
      lmax: 53.3 + (Math.random() * 2 - 1),
      lmin: 40.2 + (Math.random() * 0.5 - 0.25)
    });
  }
  
  return reportData;
};

// Indonesian month and day translations
const getBulanIndonesia = (monthNumber) => {
  const bulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return bulan[monthNumber];
};

const getHariIndonesia = (dayNumber) => {
  const hari = [
    'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
  ];
  return hari[dayNumber];
};

const NoiseDashboard = () => {
  // State Management
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [mqttStatus, setMqttStatus] = useState('online');
  const [timeFilter, setTimeFilter] = useState('daytime');
  
  // Data States
  const [trendingData, setTrendingData] = useState(generateTimeSeriesData(60, 42, 5));
  const [minuteData, setMinuteData] = useState(generateTimeSeriesData(60, 42, 2));
  const [hourlyData, setHourlyData] = useState(generateTimeSeriesData(24, 41.5, 0.5));
  const [reportData, setReportData] = useState(generateReportData());

  // Sidebar Toggle Function
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
    if (mqttStatus === 'offline') {
      return { 
        status: 'Offline', 
        color: 'bg-gray-500', 
        icon: WifiOff,
        description: 'Koneksi perangkat terputus'
      };
    }

    // If MQTT is online, then check noise level
    if (noiseLevel < 45) {
      return { 
        status: 'Baik', 
        color: 'bg-green-500',
        icon: Volume2,
        description: 'Tingkat kebisingan rendah'
      };
    }
    
    if (noiseLevel < 55) {
      return { 
        status: 'Sedang', 
        color: 'bg-yellow-500',
        icon: Volume2,
        description: 'Tingkat kebisingan normal'
      };
    }
    
    return { 
      status: 'Tinggi', 
      color: 'bg-red-500',
      icon: Volume2,
      description: 'Tingkat kebisingan tinggi'
    };
  };

  // Derive current status
  const currentStatus = getStatus(mqttStatus, currentLaeq);

  // Time and Date Formatting
  const formattedDate = `${getHariIndonesia(currentDateTime.getDay())}, ${currentDateTime.getDate()} ${getBulanIndonesia(currentDateTime.getMonth())} ${currentDateTime.getFullYear()}`;
  
  const formattedTime = currentDateTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Data Filtering Function
  const filterDataByTimePeriod = (data) => {
    return data.filter((_, index) => {
      const simulatedHour = (7 + Math.floor(index / 2.5)) % 24;
      return timeFilter === 'daytime' 
        ? (simulatedHour >= 7 && simulatedHour < 19)
        : (simulatedHour < 7 || simulatedHour >= 19);
    });
  };

  // Toggle MQTT Status (for demonstration)
  const toggleMqttStatus = () => {
    setMqttStatus(mqttStatus === 'online' ? 'offline' : 'online');
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
      {/* Sidebar */}
      <div className={`bg-gray-800 ${isSidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 flex flex-col border-r border-gray-700 shadow-xl`}>
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-md flex items-center justify-center">
                <Volume2 size={18} />
              </div>
              <span className="ml-2 font-bold">EcoSound</span>
            </div>
          )}
          <button 
            onClick={toggleSidebar} 
            className="p-1 rounded-md hover:bg-gray-700"
          >
            {isSidebarOpen ? <Menu size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <div className="mt-6">
          <nav>
            {isSidebarOpen ? (
              <>
                <a href="#" className="flex items-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-r-full">
                  <BarChart2 size={18} className="mr-3" />
                  <span>Dashboard</span>
                </a>
                <a href="#" className="flex items-center px-4 py-3 text-gray-400 hover:bg-gray-700 hover:text-white rounded-r-full mt-1">
                  <TrendingDown size={18} className="mr-3" />
                  <span>Tren</span>
                </a>
                <a href="#" className="flex items-center px-4 py-3 text-gray-400 hover:bg-gray-700 hover:text-white rounded-r-full mt-1">
                  <MapPin size={18} className="mr-3" />
                  <span>Lokasi</span>
                </a>
                <a href="#" className="flex items-center px-4 py-3 text-gray-400 hover:bg-gray-700 hover:text-white rounded-r-full mt-1">
                  <AlertCircle size={18} className="mr-3" />
                  <span>Peringatan</span>
                </a>
                <a href="#" className="flex items-center px-4 py-3 text-gray-400 hover:bg-gray-700 hover:text-white rounded-r-full mt-1">
                  <Calendar size={18} className="mr-3" />
                  <span>Laporan</span>
                </a>
              </>
            ) : (
              <>
                <a href="#" className="flex justify-center py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                  <BarChart2 size={18} />
                </a>
                <a href="#" className="flex justify-center py-3 text-gray-400 hover:bg-gray-700 hover:text-white mt-1">
                  <TrendingDown size={18} />
                </a>
                <a href="#" className="flex justify-center py-3 text-gray-400 hover:bg-gray-700 hover:text-white mt-1">
                  <MapPin size={18} />
                </a>
                <a href="#" className="flex justify-center py-3 text-gray-400 hover:bg-gray-700 hover:text-white mt-1">
                  <AlertCircle size={18} />
                </a>
                <a href="#" className="flex justify-center py-3 text-gray-400 hover:bg-gray-700 hover:text-white mt-1">
                  <Calendar size={18} />
                </a>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-gray-800 bg-opacity-70 backdrop-blur-md border-b border-gray-700 py-4 px-6 flex justify-between items-center shadow-lg">
          <h1 className="text-xl font-semibold">Dashboard Monitoring Kebisingan</h1>
          
          {/* MQTT Status Toggle (for demonstration) */}
          <div className="flex items-center space-x-4">
            <div 
              onClick={toggleMqttStatus} 
              className="cursor-pointer flex items-center space-x-2 bg-gray-700 px-3 py-2 rounded-md"
            >
              {mqttStatus === 'online' ? <Wifi size={20} className="text-green-400" /> : <WifiOff size={20} className="text-red-400" />}
              <span>{mqttStatus === 'online' ? 'Online' : 'Offline'}</span>
            </div>

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
          </div>
        </header>

        {/* Dashboard content */}
        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Realtime LAeq */}
            <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700 transform transition-all duration-300 hover:scale-105">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-blue-300 text-sm font-medium">LAeq Realtime</h3>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{currentLaeq} <span className="text-xl">dB</span></div>
                  <div className={`flex items-center mt-1 ${changePercent < 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <TrendingDown size={16} className="mr-1" />
                    <span>{Math.abs(changePercent)}%</span>
                  </div>
                </div>
                <div className={`h-16 w-16 rounded-full flex items-center justify-center ${currentStatus.color} bg-opacity-80 shadow-lg`}>
                  <Volume2 size={24} />
                </div>
              </div>
            </div>
            
            {/* L10 */}
            <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700 transform transition-all duration-300 hover:scale-105">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-blue-300 text-sm font-medium">L10</h3>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold">{currentL10} <span className="text-xl">dB</span></div>
                <div className="flex items-center mt-1 text-green-400">
                  <TrendingDown size={16} className="mr-1" />
                  <span>36.4%</span>
                </div>
              </div>
            </div>
            
            {/* L50 */}
            <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700 transform transition-all duration-300 hover:scale-105">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-blue-300 text-sm font-medium">L50</h3>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold">{currentL50} <span className="text-xl">dB</span></div>
                <div className="flex items-center mt-1 text-green-400">
                  <TrendingDown size={16} className="mr-1" />
                  <span>31%</span>
                </div>
              </div>
            </div>
            
            {/* L90 */}
            <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700 transform transition-all duration-300 hover:scale-105">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-blue-300 text-sm font-medium">L90</h3>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold">{currentL90} <span className="text-xl">dB</span></div>
                <div className="flex items-center mt-1 text-green-400">
                  <TrendingDown size={16} className="mr-1" />
                  <span>23%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Secondary Cards Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* LMin */}
            <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700 transform transition-all duration-300 hover:scale-105">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-blue-300 text-sm font-medium">Level Minimum</h3>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="text-3xl font-bold">{currentLMin} <span className="text-xl">dB</span></div>
                <div className="p-2 bg-green-100 bg-opacity-20 rounded-lg">
                  <span className="text-green-400">Rendah</span>
                </div>
              </div>
            </div>
            
            {/* LMax */}
            <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700 transform transition-all duration-300 hover:scale-105">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-blue-300 text-sm font-medium">Level Maksimum</h3>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="text-3xl font-bold">{currentLMax} <span className="text-xl">dB</span></div>
                <div className="p-2 bg-yellow-100 bg-opacity-20 rounded-lg">
                  <span className="text-yellow-400">Sedang</span>
                </div>
              </div>
            </div>
            
            {/* Status Card */}
            <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700 transform transition-all duration-300 hover:scale-105">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-blue-300 text-sm font-medium">Status</h3>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="text-3xl font-bold">{currentStatus.status}</div>
                <div className={`p-2 rounded-lg ${currentStatus.color} bg-opacity-20`}>
                  <MapPin size={20} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Charts Section */}
          <div className="mb-6">
            <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700 mb-6">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-blue-300 text-sm font-medium">Tren LAeq</h3>
                <div className="flex space-x-2">
                  <button 
                    className={`px-3 py-1 rounded-md text-xs font-medium shadow-md 
                      ${timeFilter === 'daytime' 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500' 
                        : 'bg-gray-700'}`}
                    onClick={() => setTimeFilter('daytime')}
                  >
                    Siang (07:00 - 19:00)
                  </button>
                  <button 
                    className={`px-3 py-1 rounded-md text-xs font-medium shadow-md 
                      ${timeFilter === 'nighttime' 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500' 
                        : 'bg-gray-700'}`}
                    onClick={() => setTimeFilter('nighttime')}
                  >
                    Malam (19:00 - 07:00)
                  </button>
                </div>
              </div>
              <div className="p-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filterDataByTimePeriod(trendingData)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" />
                    <YAxis domain={[35, 65]} stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} dot={false} name="LAeq" />
                    <Line type="monotone" dataKey="l10" stroke="#3B82F6" strokeWidth={1.5} dot={false} name="L10" />
                    <Line type="monotone" dataKey="l50" stroke="#8B5CF6" strokeWidth={1.5} dot={false} name="L50" />
                    <Line type="monotone" dataKey="l90" stroke="#EC4899" strokeWidth={1.5} dot={false} name="L90" />
                    <Line type="monotone" dataKey="lmin" stroke="#F59E0B" strokeWidth={1.5} dot={false} name="LMin" />
                    <Line type="monotone" dataKey="lmax" stroke="#EF4444" strokeWidth={1.5} dot={false} name="LMax" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-blue-300 text-sm font-medium">LAeq 1 Menit</h3>
                </div>
                <div className="p-4 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={minuteData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" />
                      <YAxis domain={[35, 50]} stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                        labelStyle={{ color: '#F3F4F6' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#10B981" fill="#10B98133" name="LAeq" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-blue-300 text-sm font-medium">Tren LAeq Per Jam</h3>
                </div>
                <div className="p-4 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" />
                      <YAxis domain={[40, 45]} stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                        labelStyle={{ color: '#F3F4F6' }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} dot={{ r: 1 }} activeDot={{ r: 5 }} name="LAeq" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          
          {/* Report Section */}
          <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-blue-300 text-sm font-medium">Data Laporan</h3>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-gradient-to-r from-blue-600 to-blue-500 rounded-md text-xs font-medium shadow-md">Ekspor CSV</button>
                <button className="px-3 py-1 bg-gray-700 rounded-md text-xs font-medium shadow-md">Filter</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Waktu</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">LAeq</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">L10</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">L50</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">L90</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">LMaks</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">LMin</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {reportData.map((item, index) => {
                    const formattedDate = `${currentDateTime.getDate()} ${getBulanIndonesia(currentDateTime.getMonth())} ${currentDateTime.getFullYear()}`;
                    
                    return (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formattedDate} {item.timestamp}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.value.toFixed(1)} dB</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.l10} dB</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.l50} dB</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.l90} dB</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.lmax.toFixed(1)} dB</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.lmin.toFixed(1)} dB</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-700 bg-gray-800 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button className="px-4 py-2 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700">Sebelumnya</button>
                <button className="ml-3 px-4 py-2 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700">Selanjutnya</button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    Menampilkan <span className="font-medium">1</span> sampai <span className="font-medium">9</span> dari <span className="font-medium">1984</span> hasil
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex shadow-sm -space-x-px" aria-label="Pagination">
                    <button className="px-3 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700">
                      Sebelumnya
                    </button>
                    <button className="px-3 py-2 border border-gray-700 bg-blue-500 text-white hover:bg-blue-600">
                      1
                    </button>
                    <button className="px-3 py-2 border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700">
                      2
                    </button>
                    <button className="px-3 py-2 border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700">
                      3
                    </button>
                    <span className="px-3 py-2 border border-gray-700 bg-gray-800 text-gray-300">
                      ...
                    </span>
                    <button className="px-3 py-2 rounded-r-md border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700">
                      Selanjutnya
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Map Panel - in a collapsible side panel */}
      <div className="bg-gray-800 w-64 border-l border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-sm font-medium text-gray-400">Location Map</h3>
        </div>
        <div className="flex-1 bg-gray-700 p-1">
          {/* Map placeholder */}
          <div className="h-full w-full bg-gray-600 rounded-md flex items-center justify-center">
            <div className="text-center">
              <MapPin size={32} className="mx-auto mb-2 text-green-500" />
              <div className="text-sm">Jalan Raya 72</div>
              <div className="text-xs text-gray-400">Active Monitoring</div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-700">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Status</span>
              <span className="text-sm font-medium">{currentStatus.status}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Last Update</span>
              <span className="text-sm font-medium">
                {currentDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Device ID</span>
              <span className="text-sm font-medium">ENV-2354</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoiseDashboard;