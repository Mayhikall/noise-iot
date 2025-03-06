import React from 'react';
import {
  BarChart2,
  TrendingDown,
  MapPin,
  AlertCircle,
  Calendar,
  Volume2,
  Menu
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, isActive = false, isSidebarOpen, onClick }) => {
  return (
    <a
      href="#"
      onClick={onClick}
      className={`
        flex items-center 
        ${isSidebarOpen ? 'px-4 py-3 rounded-r-full' : 'justify-center py-3'}
        ${isActive 
          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white' 
          : 'text-gray-400 hover:bg-gray-700 hover:text-white'}
        ${isSidebarOpen ? 'mt-1' : ''}
      `}
    >
      <Icon size={18} className={isSidebarOpen ? 'mr-3' : ''} />
      {isSidebarOpen && <span>{label}</span>}
    </a>
  );
};

const Sidebar = ({ 
  isSidebarOpen, 
  toggleSidebar, 
  activeSection = 'dashboard',
  onSectionChange 
}) => {
  const sidebarItems = [
    { 
      icon: BarChart2, 
      label: 'Dashboard', 
      key: 'dashboard' 
    },
    { 
      icon: TrendingDown, 
      label: 'Tren', 
      key: 'trend' 
    },
    { 
      icon: MapPin, 
      label: 'Lokasi', 
      key: 'location' 
    },
    { 
      icon: AlertCircle, 
      label: 'Peringatan', 
      key: 'alerts' 
    },
    { 
      icon: Calendar, 
      label: 'Laporan', 
      key: 'reports' 
    }
  ];

  return (
    <div
      className={`bg-gray-800 ${
        isSidebarOpen ? "w-64" : "w-16"
      } transition-all duration-300 flex flex-col border-r border-gray-700 shadow-xl`}
    >
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
          <Menu size={20} />
        </button>
      </div>

      <div className="mt-6">
        <nav>
          {sidebarItems.map(item => (
            <SidebarItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              isActive={activeSection === item.key}
              isSidebarOpen={isSidebarOpen}
              onClick={() => onSectionChange(item.key)}
            />
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;