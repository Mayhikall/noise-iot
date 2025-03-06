export const getBulanIndonesia = (monthNumber) => {
    const bulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    
    return bulan[monthNumber];
};

export const getHariIndonesia = (dayNumber) => {
    const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return hari[dayNumber];
};

