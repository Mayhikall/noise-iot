import React from 'react';
import { getBulanIndonesia } from '../utils';

const ReportTable = ({ 
  reportData, 
  currentDateTime 
}) => {
  return (
    <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-blue-300 text-sm font-medium">
          Data Laporan
        </h3>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-gradient-to-r from-blue-600 to-blue-500 rounded-md text-xs font-medium shadow-md">
            Ekspor CSV
          </button>
          <button className="px-3 py-1 bg-gray-700 rounded-md text-xs font-medium shadow-md">
            Filter
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              {[
                'Waktu', 'LAeq', 'L10', 'L50', 
                'L90', 'LMaks', 'LMin'
              ].map(header => (
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
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {reportData.map((item, index) => {
              const formattedDate = `${currentDateTime.getDate()} ${getBulanIndonesia(
                currentDateTime.getMonth()
              )} ${currentDateTime.getFullYear()}`;

              return (
                <tr
                  key={index}
                  className={
                    index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formattedDate} {item.timestamp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {item.value.toFixed(1)} dB
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {item.l10} dB
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {item.l50} dB
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {item.l90} dB
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {item.lmax.toFixed(1)} dB
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {item.lmin.toFixed(1)} dB
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-gray-700 bg-gray-800 flex items-center justify-between">
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-400">
              Menampilkan <span className="font-medium">1</span> sampai{" "}
              <span className="font-medium">9</span> dari{" "}
              <span className="font-medium">1984</span> hasil
            </p>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex shadow-sm -space-x-px"
              aria-label="Pagination"
            >
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
  );
};

export default ReportTable;