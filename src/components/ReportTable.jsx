import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ReportTable = ({ reportData, currentDateTime, timeRange, fetchMoreData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [displayData, setDisplayData] = useState([]);

  // Filter data berdasarkan timeRange
  const filterDataByTimeRange = (data) => {
    const now = new Date();
    const timeAgo = new Date(now.getTime() - (timeRange === "15minutes" ? 15 * 60 * 1000 : 60 * 60 * 1000));
    return data.filter(item => new Date(item.created_at) >= timeAgo);
  };

  // Update display data when page changes or data changes
  useEffect(() => {
    const filteredData = filterDataByTimeRange(reportData);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayData(filteredData.slice(startIndex, endIndex));
    setTotalPages(Math.max(1, Math.ceil(filteredData.length / itemsPerPage)));
  }, [currentPage, reportData, itemsPerPage, timeRange]);

  // Handle page changes
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);

    // Fetch more data if needed
    if (page >= totalPages && fetchMoreData && typeof fetchMoreData === "function") {
      fetchMoreData();
    }
  };

  return (
    <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700">
      {/* Simple control panel */}
      <div className="bg-gray-700 p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-gray-300">
          <span className="font-medium">Menampilkan Data:</span> {timeRange === "15minutes" ? "15 Menit Terakhir" : "1 Jam Terakhir"}
        </div>

        <div className="flex items-center">
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="bg-gray-800 border border-gray-600 rounded-md py-1 px-2 text-sm text-gray-300"
          >
            <option value={10}>10 baris</option>
            <option value={25}>25 baris</option>
            <option value={50}>50 baris</option>
            <option value={100}>100 baris</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              {["Waktu", "LAeq", "L10", "L50", "L90", "LMaks", "LMin"].map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {displayData.length > 0 ? (
              displayData.map((item, index) => {
                const itemDate = new Date(item.created_at);
                const formattedDate = `${itemDate.getDate()} ${getBulanIndonesia(itemDate.getMonth())} ${itemDate.getFullYear()}`;

                return (
                  <tr key={index} className="hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="font-medium">{formattedDate}</div>
                      <div className="text-gray-400">{item.timestamp}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="text-blue-400 font-medium">{item.value.toFixed(1)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.l10.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.l50.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.l90.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.lmax.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.lmin.toFixed(1)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-400">
                  {reportData.length === 0 ? "Tidak ada data tersedia" : "Tidak ada data yang cocok dengan kriteria"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-gray-750 px-4 py-3 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Menampilkan{" "}
          <span className="font-medium text-gray-300">
            {reportData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
          </span>{" "}
          -{" "}
          <span className="font-medium text-gray-300">
            {Math.min(currentPage * itemsPerPage, reportData.length)}
          </span>{" "}
          dari{" "}
          <span className="font-medium text-gray-300">{reportData.length}</span> data
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-1 rounded-md ${
              currentPage === 1 ? "text-gray-500 cursor-not-allowed" : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {[...Array(Math.min(5, totalPages))].map((_, idx) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = idx + 1;
            } else if (currentPage <= 3) {
              pageNum = idx + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + idx;
            } else {
              pageNum = currentPage - 2 + idx;
            }

            return (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                className={`px-3 py-1 text-sm rounded-md ${
                  currentPage === pageNum ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-1 rounded-md ${
              currentPage === totalPages ? "text-gray-500 cursor-not-allowed" : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportTable;