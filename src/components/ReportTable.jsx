import React from 'react';
import { getBulanIndonesia } from '../utils';

const ReportTable = ({ 
  reportData, 
  currentDateTime,
  timeRange 
}) => {
  return (
    <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-gray-700">
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
          <tbody className="divide-y divide-gray-700">
            {reportData.length > 0 ? (
              reportData.map((item, index) => {
                const itemDate = new Date(item.created_at);
                const formattedDate = `${itemDate.getDate()} ${getBulanIndonesia(
                  itemDate.getMonth()
                )} ${itemDate.getFullYear()}`;

                return (
                  <tr
                    key={index}
                    className={
                      index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formattedDate} {item.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.value.toFixed(1)} dB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.l10.toFixed(1)} dB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.l50.toFixed(1)} dB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.l90.toFixed(1)} dB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.lmax.toFixed(1)} dB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.lmin.toFixed(1)} dB
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-400">
                  Tidak ada data yang tersedia
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-gray-700 bg-gray-800 flex items-center justify-between">
        <div className="flex-1 flex items-center justify-between sm:justify-between">
          <div>
            <p className="text-sm text-gray-400">
              Menampilkan {reportData.length > 0 ? (
                <>
                  <span className="font-medium">1</span> sampai{" "}
                  <span className="font-medium">{reportData.length}</span> dari{" "}
                  <span className="font-medium">{reportData.length}</span> hasil
                </>
              ) : (
                <span className="font-medium">0 hasil</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">
              Rentang Waktu: {timeRange === "15minutes" ? "15 Menit" : "1 Jam"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportTable;