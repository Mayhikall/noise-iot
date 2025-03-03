import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Clock, MapPin, Volume2, TrendingDown, BarChart2, Calendar, Menu, X, AlertCircle, Clock3 } from 'lucide-react';

// Sample data generation
const generateTimeSeriesData = (count, baseValue, variance) => {
  const data = [];
  const now = new Date();
  
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60000);
    const time = timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const value = baseValue + (Math.random() * variance * 2) - variance;
    data.push({
      time,
      value: parseFloat(value.toFixed(1)),
      l10: parseFloat((value - 1.5 + Math.random() * 3).toFixed(1)),
      l50: parseFloat((value - 2 + Math.random() * 2.5).toFixed(1)),
      l90: parseFloat((value - 2.5 + Math.random() * 2).toFixed(1))
    });
  }
  return data;
};

const trendingData = generateTimeSeriesData(60, 42, 5);
const minuteData = generateTimeSeriesData(60, 42, 2);
const hourlyData = generateTimeSeriesData(24, 41.5, 0.5);

// Sample report data
const reportData = [
  { l10: 42.3, l50: 41.4, l90: 40.9, value: 41.3, timestamp: '04:55:57', lmax: 53.3, lmin: 40.2 },
  { l10: 42.3, l50: 41.4, l90: 40.9, value: 42.0, timestamp: '04:55:51', lmax: 61.5, lmin: 40.4 },
  { l10: 42.3, l50: 41.4, l90: 40.9, value: 41.7, timestamp: '04:55:46', lmax: 54.0, lmin: 40.1 },
  { l10: 42.3, l50: 41.4, l90: 40.9, value: 41.5, timestamp: '04:55:42', lmax: 53.3, lmin: 40.2 },
  { l10: 42.3, l50: 41.4, l90: 40.9, value: 40.8, timestamp: '04:55:35', lmax: 53.3, lmin: 40.2 },
  { l10: 42.3, l50: 41.4, l90: 40.9, value: 41.1, timestamp: '04:55:30', lmax: 53.3, lmin: 40.2 },
  { l10: 42.3, l50: 41.4, l90: 40.9, value: 40.5, timestamp: '04:55:24', lmax: 53.3, lmin: 40.2 },
  { l10: 42.3, l50: 41.4, l90: 40.9, value: 41.4, timestamp: '04:55:19', lmax: 53.3, lmin: 40.2 },
  { l10: 42.3, l50: 41.4, l90: 40.9, value: 41.1, timestamp: '04:55:14', lmax: 53.3, lmin: 40.2 },
];

const NoiseDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Current values
  const currentLaeq = 42;
  const currentL10 = 42.3;
  const currentL50 = 41.4;
  const currentL90 = 40.9;
  const currentLMax = 53.3;
  const currentLMin = 40.2;
  const changePercent = -20.9;
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Status determination based on noise level
  const getStatus = (value) => {
    if (value < 45) return { status: 'Good', color: 'bg-green-500' };
    if (value < 55) return { status: 'Moderate', color: 'bg-yellow-500' };
    return { status: 'High', color: 'bg-red-500' };
  };
  
  const currentStatus = getStatus(currentLaeq);
  
  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <div className={`bg-gray-800 ${isSidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 flex flex-col border-r border-gray-700`}>
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-md flex items-center justify-center">
                <Volume2 size={18} />
              </div>
              <span className="ml-2 font-bold">EnviroTech</span>
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
                <a href="#" className="flex items-center px-4 py-3 bg-gray-700 text-white">
                  <BarChart2 size={18} className="mr-3" />
                  <span>Dashboard</span>
                </a>
                <a href="#" className="flex items-center px-4 py-3 text-gray-400 hover:bg-gray-700 hover:text-white">
                  <TrendingDown size={18} className="mr-3" />
                  <span>Trends</span>
                </a>
                <a href="#" className="flex items-center px-4 py-3 text-gray-400 hover:bg-gray-700 hover:text-white">
                  <MapPin size={18} className="mr-3" />
                  <span>Locations</span>
                </a>
                <a href="#" className="flex items-center px-4 py-3 text-gray-400 hover:bg-gray-700 hover:text-white">
                  <AlertCircle size={18} className="mr-3" />
                  <span>Alerts</span>
                </a>
                <a href="#" className="flex items-center px-4 py-3 text-gray-400 hover:bg-gray-700 hover:text-white">
                  <Calendar size={18} className="mr-3" />
                  <span>Reports</span>
                </a>
              </>
            ) : (
              <>
                <a href="#" className="flex justify-center py-3 bg-gray-700 text-white">
                  <BarChart2 size={18} />
                </a>
                <a href="#" className="flex justify-center py-3 text-gray-400 hover:bg-gray-700 hover:text-white">
                  <TrendingDown size={18} />
                </a>
                <a href="#" className="flex justify-center py-3 text-gray-400 hover:bg-gray-700 hover:text-white">
                  <MapPin size={18} />
                </a>
                <a href="#" className="flex justify-center py-3 text-gray-400 hover:bg-gray-700 hover:text-white">
                  <AlertCircle size={18} />
                </a>
                <a href="#" className="flex justify-center py-3 text-gray-400 hover:bg-gray-700 hover:text-white">
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
        <header className="bg-gray-800 border-b border-gray-700 py-4 px-6 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Noise Monitoring Dashboard</h1>
          <div className="flex items-center">
            <Clock size={16} className="mr-2" />
            <span>2025-03-03 04:56:38</span>
          </div>
        </header>

        {/* Dashboard content */}
        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Realtime LAeq */}
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-gray-400 text-sm font-medium">Realtime LAeq</h3>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{currentLaeq} <span className="text-xl">dB</span></div>
                  <div className={`flex items-center mt-1 ${changePercent < 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <TrendingDown size={16} className="mr-1" />
                    <span>{Math.abs(changePercent)}%</span>
                  </div>
                </div>
                <div className={`h-16 w-16 rounded-full flex items-center justify-center ${currentStatus.color}`}>
                  <Volume2 size={24} />
                </div>
              </div>
            </div>
            
            {/* L10 */}
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-gray-400 text-sm font-medium">L10</h3>
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
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-gray-400 text-sm font-medium">L50</h3>
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
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-gray-400 text-sm font-medium">L90</h3>
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
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-gray-400 text-sm font-medium">LMin</h3>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="text-3xl font-bold">{currentLMin} <span className="text-xl">dB</span></div>
                <div className="p-2 bg-green-100 bg-opacity-20 rounded-md">
                  <span className="text-green-400">Low</span>
                </div>
              </div>
            </div>
            
            {/* LMax */}
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-gray-400 text-sm font-medium">LMax</h3>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="text-3xl font-bold">{currentLMax} <span className="text-xl">dB</span></div>
                <div className="p-2 bg-yellow-100 bg-opacity-20 rounded-md">
                  <span className="text-yellow-400">Moderate</span>
                </div>
              </div>
            </div>
            
            {/* Status Card */}
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-gray-400 text-sm font-medium">Status</h3>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="text-3xl font-bold">{currentStatus.status}</div>
                <div className={`p-2 rounded-md ${currentStatus.color} bg-opacity-20`}>
                  <MapPin size={20} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Charts Section */}
          <div className="mb-6">
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 mb-6">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-gray-400 text-sm font-medium">Trending LAeq</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-500 rounded-md text-xs">1H</button>
                  <button className="px-3 py-1 bg-gray-700 rounded-md text-xs">6H</button>
                  <button className="px-3 py-1 bg-gray-700 rounded-md text-xs">24H</button>
                </div>
              </div>
              <div className="p-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendingData}>
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
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-gray-400 text-sm font-medium">LAeq 1 Minute</h3>
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
              
              <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-gray-400 text-sm font-medium">LAeq Hourly Trend</h3>
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
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-gray-400 text-sm font-medium">Report Data</h3>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-blue-500 rounded-md text-xs">Export CSV</button>
                <button className="px-3 py-1 bg-gray-700 rounded-md text-xs">Filter</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Timestamp</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">LAeq</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">L10</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">L50</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">L90</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">LMax</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">LMin</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {reportData.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">2025-03-03 {item.timestamp}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.value} dB</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.l10} dB</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.l50} dB</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.l90} dB</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.lmax} dB</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.lmin} dB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-700 bg-gray-800 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button className="px-4 py-2 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700">Previous</button>
                <button className="ml-3 px-4 py-2 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700">Next</button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">9</span> of <span className="font-medium">1984</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex shadow-sm -space-x-px" aria-label="Pagination">
                    <button className="px-3 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700">
                      Previous
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
                      Next
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
              <span className="text-sm font-medium">04:56:38</span>
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