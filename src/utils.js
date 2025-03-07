/**
 * Returns Indonesian month name from month number (0-11)
 * @param {number} monthNumber - Month number (0-11)
 * @returns {string} Indonesian month name
 */
export const getBulanIndonesia = (monthNumber) => {
  const bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  
  return bulan[monthNumber];
};

/**
 * Returns Indonesian day name from day number (0-6)
 * @param {number} dayNumber - Day number (0-6, starting from Sunday)
 * @returns {string} Indonesian day name
 */
export const getHariIndonesia = (dayNumber) => {
  const hari = [
    "Minggu", "Senin", "Selasa", "Rabu", 
    "Kamis", "Jumat", "Sabtu"
  ];
  
  return hari[dayNumber];
};