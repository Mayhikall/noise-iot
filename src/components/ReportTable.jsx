import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  TrendingUp,
  TrendingDown,
  ArrowDownUp,
  Download,
  FileText,
  RefreshCw,
} from "lucide-react";

const ReportTable = ({
  reportData,
  currentDateTime,
  fetchMoreData,
  onRefresh,
  onExport,
  timeRange,
  isLoading,
}) => {
  // Separate pagination state for each tab
  const [paginationState, setPaginationState] = useState({
    all: { currentPage: 1, itemsPerPage: 10 },
    laeq: { currentPage: 1, itemsPerPage: 10 },
    percentiles: { currentPage: 1, itemsPerPage: 10 },
    extremes: { currentPage: 1, itemsPerPage: 10 },
  });
  const [activeTab, setActiveTab] = useState("all");
  // Filter data based on type
  const filteredData = useMemo(() => {
    return {
      all: reportData,
      laeq: reportData.filter((item) => item.dataType === "laeq"),
      percentiles: reportData.filter((item) => item.dataType === "realtime"),
      extremes: reportData.filter((item) => item.dataType === "hourly"),
    };
  }, [reportData]);

  // Get current pagination settings based on active tab
  const getCurrentPagination = () => {
    return paginationState[activeTab];
  };

  // Get display data based on current tab and pagination
  const getDisplayData = () => {
    const { currentPage, itemsPerPage } = getCurrentPagination();
    const relevantData = filteredData[activeTab];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return relevantData.slice(startIndex, endIndex);
  };

  // Calculate total pages based on current tab
  const getTotalPages = () => {
    const { itemsPerPage } = getCurrentPagination();
    const relevantData = filteredData[activeTab];
    return Math.max(1, Math.ceil(relevantData.length / itemsPerPage));
  };

  // Update pagination for a specific tab
  const updatePagination = (tab, updates) => {
    setPaginationState((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], ...updates },
    }));
  };

  // Handle page changes
  const goToPage = (page) => {
    const totalPages = getTotalPages();
    if (page < 1 || page > totalPages) return;

    updatePagination(activeTab, { currentPage: page });

    // Fetch more data if needed
    if (
      page >= totalPages &&
      fetchMoreData &&
      typeof fetchMoreData === "function"
    ) {
      fetchMoreData();
    }
  };

  // Handle tab changes
  useEffect(() => {
    // Reset to first page when changing tabs
    const { currentPage } = getCurrentPagination();
    const totalPages = getTotalPages();

    if (currentPage > totalPages) {
      updatePagination(activeTab, { currentPage: 1 });
    }
  }, [activeTab, reportData]);

  const handleExport = (format) => {
    if (onExport && typeof onExport === "function") {
      onExport(format, activeTab);
    }
  };

  // Helper function to format date - using the timestamp from each data item
  const getBulanIndonesia = (month) => {
    const bulan = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return bulan[month];
  };

  // Helper function to determine cell background color based on value
  const getBackgroundColor = (value, type) => {
    if (!value || value === 0) return "bg-gray-800";

    if (type === "laeq") {
      if (value < 45) return "bg-green-900 bg-opacity-30";
      if (value < 60) return "bg-yellow-900 bg-opacity-30";
      if (value < 75) return "bg-orange-900 bg-opacity-30";
      return "bg-red-900 bg-opacity-30";
    }

    if (type === "l10") return "bg-blue-900 bg-opacity-30";
    if (type === "l50") return "bg-indigo-900 bg-opacity-30";
    if (type === "l90") return "bg-purple-900 bg-opacity-30";
    if (type === "lmin") return "bg-cyan-900 bg-opacity-30";
    if (type === "lmax") return "bg-amber-900 bg-opacity-30";

    return "bg-gray-800";
  };

  // Format and render date - using the timestamp from each record
  const formatDate = (dateString) => {
    try {
      const itemDate = new Date(dateString);
      if (isNaN(itemDate.getTime())) {
        // Handle invalid date
        return { date: "Invalid Date", time: "00.00.00" };
      }

      const day = itemDate.getDate();
      const month = getBulanIndonesia(itemDate.getMonth());
      const year = itemDate.getFullYear();
      const hours = itemDate.getHours().toString().padStart(2, "0");
      const minutes = itemDate.getMinutes().toString().padStart(2, "0");
      const seconds = itemDate.getSeconds().toString().padStart(2, "0");

      return {
        date: `${day} ${month} ${year}`,
        time: `${hours}.${minutes}.${seconds}`,
      };
    } catch (error) {
      console.error("Error formatting date:", error);
      return { date: "Error", time: "00.00.00" };
    }
  };

  // Render action buttons for the report with working refresh button
  const renderActions = () => (
    <div className="flex justify-end mb-4 gap-2">
      <button
        onClick={() => handleExport("excel")}
        disabled={isLoading}
        className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download size={16} className="mr-2" />
        Export Excel
      </button>
      <button
        onClick={() => handleExport("pdf")}
        disabled={isLoading}
        className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FileText size={16} className="mr-2" />
        Export PDF
      </button>
    </div>
  );

  // Improved pagination controls
  const renderPagination = () => {
    const { currentPage, itemsPerPage } = getCurrentPagination();
    const totalItems = filteredData[activeTab].length;
    const totalPages = getTotalPages();

    // Calculate page numbers to display
    const pageNumbers = [];
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    // Adjust if near the end
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="p-3 bg-gray-800 flex justify-between items-center">
        <div className="text-sm text-gray-300">
          Showing{" "}
          {Math.min(
            itemsPerPage,
            totalItems - (currentPage - 1) * itemsPerPage
          )}{" "}
          of {totalItems} entries
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 text-sm"
            title="First Page"
          >
            <div className="flex items-center">
              <ChevronLeft size={14} />
              <ChevronLeft size={14} className="-ml-1" />
            </div>
          </button>

          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300"
            title="Previous Page"
          >
            <ChevronLeft size={14} />
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => goToPage(1)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700 text-sm text-gray-300"
              >
                1
              </button>
              {startPage > 2 && <span className="text-gray-500 px-1">...</span>}
            </>
          )}

          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => goToPage(number)}
              className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium ${
                currentPage === number
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              {number}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="text-gray-500 px-1">...</span>
              )}
              <button
                onClick={() => goToPage(totalPages)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700 text-sm text-gray-300"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300"
            title="Next Page"
          >
            <ChevronRight size={14} />
          </button>

          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 text-sm"
            title="Last Page"
          >
            <div className="flex items-center">
              <ChevronRight size={14} />
              <ChevronRight size={14} className="-ml-1" />
            </div>
          </button>
        </div>
      </div>
    );
  };

  // Render the LAeq table
  const renderLAeqTable = () => {
    const displayData =
      activeTab === "laeq"
        ? getDisplayData()
        : filteredData.laeq.slice(0, getCurrentPagination().itemsPerPage);

    return (
      <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700 mb-6">
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-4">
          <h3 className="text-lg font-medium text-white flex items-center">
            <Volume2 size={18} className="mr-2" />
            Report LAeq
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  created_at
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  value
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {displayData.length > 0 ? (
                displayData.map((item, index) => {
                  const { date, time } = formatDate(item.created_at);
                  return (
                    <tr key={`laeq-${index}`} className="hover:bg-gray-750">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {date} {time}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getBackgroundColor(
                          item.value,
                          "laeq"
                        )}`}
                      >
                        {item.value ? item.value.toFixed(1) : "0.0"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="2"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {activeTab === "laeq" && renderPagination()}
      </div>
    );
  };

  // Render the L10, L50, L90 table (percentiles)
  const renderPercentilesTable = () => {
    const displayData =
      activeTab === "percentiles"
        ? getDisplayData()
        : filteredData.percentiles.slice(
            0,
            getCurrentPagination().itemsPerPage
          );

    return (
      <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700 mb-6">
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-4">
          <h3 className="text-lg font-medium text-white flex items-center">
            <ArrowDownUp size={18} className="mr-2" />
            Report L10, L50 & L90
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  created_at
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider"
                >
                  <div className="flex items-center">
                    <TrendingUp size={16} className="mr-2" />
                    L10
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider"
                >
                  <div className="flex items-center">
                    <ArrowDownUp size={16} className="mr-2" />
                    L50
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider"
                >
                  <div className="flex items-center">
                    <TrendingDown size={16} className="mr-2" />
                    L90
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {displayData.length > 0 ? (
                displayData.map((item, index) => {
                  const { date, time } = formatDate(item.created_at);
                  return (
                    <tr
                      key={`percentiles-${index}`}
                      className="hover:bg-gray-750"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {date} {time}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-100 ${getBackgroundColor(
                          item.l10,
                          "l10"
                        )}`}
                      >
                        {item.l10 ? item.l10.toFixed(1) : "0.0"}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-100 ${getBackgroundColor(
                          item.l50,
                          "l50"
                        )}`}
                      >
                        {item.l50 ? item.l50.toFixed(1) : "0.0"}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-100 ${getBackgroundColor(
                          item.l90,
                          "l90"
                        )}`}
                      >
                        {item.l90 ? item.l90.toFixed(1) : "0.0"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {activeTab === "percentiles" && renderPagination()}
      </div>
    );
  };

  // Render the Lmin & Lmax table (extremes)
  const renderExtremesTable = () => {
    const displayData =
      activeTab === "extremes"
        ? getDisplayData()
        : filteredData.extremes.slice(0, getCurrentPagination().itemsPerPage);

    return (
      <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700 mb-6">
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-4">
          <h3 className="text-lg font-medium text-white flex items-center">
            <TrendingUp size={18} className="mr-2" />
            Report LMin & LMax
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  created_at
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider"
                >
                  <div className="flex items-center">
                    <TrendingDown size={16} className="mr-2" />
                    Lmin
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-amber-300 uppercase tracking-wider"
                >
                  <div className="flex items-center">
                    <TrendingUp size={16} className="mr-2" />
                    Lmax
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {displayData.length > 0 ? (
                displayData.map((item, index) => {
                  const { date, time } = formatDate(item.created_at);
                  return (
                    <tr key={`extremes-${index}`} className="hover:bg-gray-750">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {date} {time}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-cyan-100 ${getBackgroundColor(
                          item.lmin,
                          "lmin"
                        )}`}
                      >
                        {item.lmin ? item.lmin.toFixed(1) : "0.0"}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-amber-100 ${getBackgroundColor(
                          item.lmax,
                          "lmax"
                        )}`}
                      >
                        {item.lmax ? item.lmax.toFixed(1) : "0.0"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {activeTab === "extremes" && renderPagination()}
      </div>
    );
  };

  // Tab navigation component
  const renderTabNavigation = () => (
    <div className="flex space-x-1 bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl p-1 mb-2 border border-gray-700">
      <button
        onClick={() => setActiveTab("all")}
        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all 
        ${
          activeTab === "all"
            ? "bg-blue-600 text-white"
            : "text-gray-300 hover:bg-gray-700"
        }`}
      >
        All Reports
      </button>
      <button
        onClick={() => setActiveTab("laeq")}
        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center
        ${
          activeTab === "laeq"
            ? "bg-blue-600 text-white"
            : "text-gray-300 hover:bg-gray-700"
        }`}
      >
        <Volume2 size={16} className="mr-2" />
        LAeq
      </button>
      <button
        onClick={() => setActiveTab("percentiles")}
        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center
        ${
          activeTab === "percentiles"
            ? "bg-blue-600 text-white"
            : "text-gray-300 hover:bg-gray-700"
        }`}
      >
        <ArrowDownUp size={16} className="mr-2" />
        L10, L50, L90
      </button>
      <button
        onClick={() => setActiveTab("extremes")}
        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center
        ${
          activeTab === "extremes"
            ? "bg-blue-600 text-white"
            : "text-gray-300 hover:bg-gray-700"
        }`}
      >
        <TrendingUp size={16} className="mr-2" />
        LMin & LMax
      </button>
    </div>
  );

  // Display the current date and time - removed "Invalid Date" issue
  const renderDateTime = () => {
    try {
      // Check if currentDateTime is valid
      const dateObj = new Date(currentDateTime);
      if (isNaN(dateObj.getTime())) {
        // Return empty div if date is invalid - prevents "Invalid Date" display
        return <div className="text-right text-sm mb-3"></div>;
      }

      return (
        <div className="text-right text-sm text-gray-400 mb-3">
          {dateObj.toLocaleString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>
      );
    } catch (error) {
      // Return empty div to prevent displaying errors
      return <div className="text-right text-sm mb-3"></div>;
    }
  };

  // Items per page selector - now dynamically changed per tab
  const renderItemsPerPageSelector = () => {
    const { itemsPerPage } = getCurrentPagination();
    const totalItems = filteredData[activeTab].length;

    // Calculate appropriate options based on data size
    const options = [5, 10, 25, 50].filter(
      (option) => option <= totalItems * 2
    );
    if (options.length === 0) options.push(5);

    // Add an option for all items if it's reasonable
    if (totalItems <= 100 && !options.includes(totalItems)) {
      options.push(totalItems);
    }

    // Sort options numerically
    options.sort((a, b) => a - b);

    return (
      <div className="flex justify-end mt-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Items per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) =>
              updatePagination(activeTab, {
                itemsPerPage: parseInt(e.target.value),
                currentPage: 1, // Reset to first page when changing items per page
              })
            }
            className="bg-gray-700 text-white rounded px-2 py-1 text-sm"
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option === totalItems ? `All (${totalItems})` : option}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      {renderDateTime()}
      {renderActions()}
      {renderTabNavigation()}

      {/* Render tables based on active tab */}
      {(activeTab === "all" || activeTab === "laeq") && renderLAeqTable()}
      {(activeTab === "all" || activeTab === "percentiles") &&
        renderPercentilesTable()}
      {(activeTab === "all" || activeTab === "extremes") &&
        renderExtremesTable()}

      {/* Items per page selector */}
      {renderItemsPerPageSelector()}
    </div>
  );
};

export default ReportTable;
