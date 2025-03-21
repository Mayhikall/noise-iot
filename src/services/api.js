import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  retry: 3,
  retryDelay: 1000,
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API request failed:", error);
    // Enhanced error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Error data:", error.response.data);
      console.error("Error status:", error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    }
    return Promise.reject(error);
  }
);

export const fetchDashboardSummary = async () => {
  try {
    // Fetch LAeq from tbl_laeq for latest LAeq
    const laeqResponse = await api.get("/laeq", { params: { limit: 1 } });

    // Fetch L10, L50, L90 from laeq_realtime
    const realTimeResponse = await api.get("/laeq-metrics", {
      params: { limit: 1 },
    });

    // Fetch Lmin, Lmax from laeq_hourly for today's stats
    const hourlyResponse = await api.get("/laeq-lmin-lmax", {
      params: {
        limit: 1,
        // Get the latest hourly record
        sort: "created_at,desc",
      },
    });

    // Combine the data with proper null checks
    const latestLaeq = {
      laeq: laeqResponse.data?.[0]?.value || 0,
      L10: realTimeResponse.data?.[0]?.L10 || 0,
      L50: realTimeResponse.data?.[0]?.L50 || 0,
      L90: realTimeResponse.data?.[0]?.L90 || 0,
      Lmax: hourlyResponse.data?.[0]?.Lmax || 0,
      Lmin: hourlyResponse.data?.[0]?.Lmin || 0,
    };

    // Get today's stats - calculate from hourly data
    const today = new Date().toISOString().split("T")[0];
    const todayHourlyResponse = await api.get("/laeq-lmin-lmax", {
      params: {
        date: today,
      },
    });

    const todayData = todayHourlyResponse.data || [];

    const todayStats = {
      maxLaeq:
        todayData.length > 0
          ? Math.max(...todayData.map((item) => item?.laeq || 0), 0)
          : 0,
      minLaeq:
        todayData.length > 0
          ? Math.min(
              ...todayData
                .filter((item) => item?.laeq != null)
                .map((item) => item.laeq),
              0
            )
          : 0,
      avgLaeq:
        todayData.length > 0
          ? (
              todayData.reduce((sum, item) => sum + (item?.laeq || 0), 0) /
              todayData.length
            ).toFixed(1)
          : 0,
    };

    return {
      latestLaeq,
      todayStats,
    };
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    // Return default values on error
    return {
      latestLaeq: { laeq: 0, L10: 0, L50: 0, L90: 0, Lmax: 0, Lmin: 0 },
      todayStats: { maxLaeq: 0, minLaeq: 0, avgLaeq: 0 },
    };
  }
};

export const fetchLaeqData = async (params = {}) => {
  try {
    // Fetch from tbl_laeq for Realtime LAeq
    const response = await api.get("/laeq", { params });
    return response.data || [];
  } catch (error) {
    console.error("Error fetching LAeq data:", error);
    return [];
  }
};

export const fetchLaeqMinuteData = async (params = {}) => {
  try {
    // Fetch from laeq_data for Minute LAeq
    // Ensure we request 60 data points (1 hour of minute data)
    const response = await api.get("/laeq-data", {
      params: {
        ...params,
        type: "1m",
        limit: 60, // Explicitly request 60 minutes of data
        sort: "created_at,desc", // Get most recent data first
      },
    });

    if (!response.data || !Array.isArray(response.data)) {
      return [];
    }

    // Format the data for the chart
    const formattedData = response.data.map((item) => ({
      time: new Date(item.created_at).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      value: item.value || 0,
      created_at: item.created_at,
    }));

    // Reverse to show chronological order for the chart
    return formattedData.reverse() || [];
  } catch (error) {
    console.error("Error fetching LAeq minute data:", error);
    return [];
  }
};

export const fetchLaeqHourlyData = async (params = {}) => {
  try {
    // Fetch from laeq_hourly for Hourly LAeq
    const response = await api.get("/laeq-hourly", { params });

    // Map the data to the format expected by the component
    const formattedData = response.data.map((item) => ({
      time: new Date(item.created_at).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      value: item.laeq1h || 0,
      created_at: item.created_at,
    }));

    return formattedData || [];
  } catch (error) {
    console.error("Error fetching LAeq hourly data:", error);
    return [];
  }
};

// Fungsi asli tetap tidak berubah
export const fetchRealtimeData = async (params = {}) => {
  try {
    const { timeRange, ...otherParams } = params;
    const now = new Date();
    const timeAgo = new Date(
      now.getTime() -
        (timeRange === "15minutes" ? 15 * 60 * 1000 : 60 * 60 * 1000)
    );
    const response = await api.get("/laeq-metrics", {
      params: {
        ...otherParams,
        created_at: { $gte: timeAgo.toISOString() },
        sort: "created_at,desc",
      },
    });
    return response.data || [];
  } catch (error) {
    console.error("Error fetching real-time data:", error);
    return [];
  }
};

// Tambahkan fungsi baru untuk mengambil data dari ketiga endpoint
export const fetchCombinedRealtimeData = async (params = {}) => {
  try {
    // Parse timeRange dari parameter
    const { timeRange, ...otherParams } = params;
    const now = new Date();
    const timeAgo = new Date(
      now.getTime() -
        (timeRange === "15minutes" ? 15 * 60 * 1000 : 60 * 60 * 1000)
    );

    // Fetch data from all three endpoints in parallel using Promise.all
    const [realtimeData, laeqData, hourlyData] = await Promise.all([
      // Original realtime data (L10, L50, L90)
      api.get("/laeq-metrics", {
        params: {
          ...otherParams,
          created_at: { $gte: timeAgo.toISOString() },
          sort: "created_at,desc",
        },
      }),

      // LAeq data from tbl-laeq
      api.get("/laeq", {
        params: {
          ...otherParams,
          created_at: { $gte: timeAgo.toISOString() },
          sort: "created_at,desc",
        },
      }),

      // Lmin, Lmax from laeq-hourly
      api.get("/laeq-lmin-lmax", {
        params: {
          ...otherParams,
          created_at: { $gte: timeAgo.toISOString() },
          sort: "created_at,desc",
        },
      }),
    ]);

    // Memproses data dari ketiga endpoint
    const processedData = {
      realtime: (realtimeData.data || []).map((item) => ({
        created_at: item.created_at,
        dataType: "realtime",
        L10: item.L10 || 0,
        L50: item.L50 || 0,
        L90: item.L90 || 0,
      })),

      laeq: (laeqData.data || []).map((item) => ({
        created_at: item.created_at,
        dataType: "laeq",
        laeq: item.value || 0,
      })),

      hourly: (hourlyData.data || []).map((item) => ({
        created_at: item.created_at,
        dataType: "hourly",
        Lmin: item.Lmin || 0,
        Lmax: item.Lmax || 0,
      })),
    };

    // Gabungkan semua data dan urutkan berdasarkan timestamp tanpa mencocokkan
    const allData = [
      ...processedData.realtime,
      ...processedData.laeq,
      ...processedData.hourly,
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return allData;
  } catch (error) {
    console.error("Error fetching combined realtime data:", error);
    return [];
  }
};

export const fetchMqttStatus = async () => {
  try {
    // Get the most recent MQTT status record
    const response = await api.get("/mqtt-status", {
      params: {
        limit: 1,
        sort: "updated_at,desc", // Ensure we get the most recent record by updated_at
      },
    });

    // Default values if no data is found
    let mqttData = {
      status: "Offline",
      quality: "Offline",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      lastOnlineTimestamp: null,
    };

    // If we have data from response, use it
    if (response.data && response.data.length > 0) {
      mqttData = response.data[0];

      // Clean up status if necessary (e.g., "Online2025-03-03 11:51:53")
      if (mqttData.status && mqttData.status.startsWith("Online")) {
        mqttData.status = "Online";
      }

      // Use updated_at field as the lastUpdated property
      mqttData.lastUpdated = mqttData.updated_at || mqttData.created_at;

      // If current status is online, use this as the last online timestamp too
      if (mqttData.status === "Online") {
        mqttData.lastOnlineTimestamp = mqttData.lastUpdated;
      }
    }

    // If current status is offline, fetch the last online record
    if (mqttData.status === "Offline") {
      try {
        // Query for the most recent 'Online' status record
        const lastOnlineResponse = await api.get("/mqtt-status", {
          params: {
            status: "Online", // This needs to match the exact column values in DB
            limit: 1,
            sort: "updated_at,desc", // Get the most recent by updated_at
          },
        });

        // If we found a last online record, use its timestamp
        if (lastOnlineResponse.data && lastOnlineResponse.data.length > 0) {
          const lastOnlineRecord = lastOnlineResponse.data[0];
          mqttData.lastOnlineTimestamp =
            lastOnlineRecord.updated_at || lastOnlineRecord.created_at;
        }
      } catch (innerError) {
        console.error("Error fetching last online MQTT status:", innerError);
      }
    }

    // Ensure the lastOnlineTimestamp is properly formatted
    if (mqttData.lastOnlineTimestamp) {
      try {
        // Make sure it's a valid date
        const validDate = new Date(mqttData.lastOnlineTimestamp);
        if (!isNaN(validDate.getTime())) {
          mqttData.lastOnlineTimestamp = validDate.toISOString();
        }
      } catch (e) {
        console.error("Error formatting last online timestamp:", e);
      }
    }

    // If online, fetch LAeq to determine signal strength
    if (mqttData.status === "Online") {
      try {
        const laeqResponse = await api.get("/laeq", {
          params: { limit: 1 },
        });
        const laeqValue = laeqResponse.data?.[0]?.value || 0;

        // Logic to determine MQTT signal quality based on LAeq value
        if (laeqValue > 0 && laeqValue < 45) {
          mqttData.quality = "Baik";
        } else if (laeqValue >= 45 && laeqValue < 55) {
          mqttData.quality = "Sedang";
        } else {
          mqttData.quality = "Lemah";
        }
      } catch (qualityError) {
        console.error("Error determining signal quality:", qualityError);
        mqttData.quality = "Unknown";
      }
    } else {
      mqttData.quality = "Offline";
    }

    return mqttData;
  } catch (error) {
    console.error("Error fetching MQTT status:", error);
    // Include default values on error
    return {
      status: "Offline",
      quality: "Offline",
      lastUpdated: new Date().toISOString(),
      lastOnlineTimestamp: null,
    };
  }
};

export const fetchTrendData = async (params = {}) => {
  try {
    const { timeFilter = "daytime", year, month, day } = params;

    // Determine time range based on filter
    let startHour, endHour;

    if (timeFilter === "daytime") {
      startHour = 7; // 07:00
      endHour = 19; // 19:00 (7pm)
    } else {
      startHour = 19; // 19:00 (7pm)
      endHour = 7; // 07:00 (next day)
    }

    // Build query parameters for hourly data
    const queryParams = {
      year,
      month,
      day,
      sort: "created_at,asc",
    };

    // Fetch all required data in parallel
    const [laeqResponse, realtimeResponse, hourlyResponse] = await Promise.all([
      // Fetch LAeq from tbl_laeq (minute data)
      api.get("/laeq", { params: { ...queryParams, interval: "minute" } }),

      // Fetch L10, L50, L90 from laeq_realtime (hourly data)
      api.get("/laeq-metrics", { params: queryParams }),

      // Fetch Lmin, Lmax from laeq_hourly (hourly data)
      api.get("/laeq-lmin-lmax", { params: queryParams }),
    ]);

    // Initialize map to store minute data
    const minuteDataMap = new Map();

    // Determine which hours to include based on time filter
    const hoursToInclude = [];

    if (timeFilter === "daytime") {
      // For daytime: 7am to 6:59pm (7, 8, 9, ..., 18)
      for (let i = startHour; i < endHour; i++) {
        hoursToInclude.push(i);
      }
    } else {
      // Untuk waktu malam: 19:00 sampai 06:59 (19, 20, 21, ..., 23, 0, 1, ..., 6)
      // Jam malam dimulai dari 19:00 hingga 23:59
      for (let i = startHour; i < 24; i++) {
        hoursToInclude.push(i);
      }
      // Lalu dilanjutkan dari 00:00 hingga 06:59
      for (let i = 0; i < endHour; i++) {
        hoursToInclude.push(i);
      }
    }

    // Initialize with slots for each minute in our range
    hoursToInclude.forEach((hour) => {
      for (let minute = 0; minute < 60; minute++) {
        const timeStr = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;

        minuteDataMap.set(timeStr, {
          time: timeStr,
          value: null, // LAeq
          l10: null,
          l50: null,
          l90: null,
          lmin: null,
          lmax: null,
          hour: hour,
          minute: minute,
        });
      }
    });

    // Process LAeq data from tbl_laeq (minute data)
    if (laeqResponse.data && Array.isArray(laeqResponse.data)) {
      laeqResponse.data.forEach((item) => {
        if (!item || !item.created_at) return;

        const date = new Date(item.created_at);
        const hour = date.getHours();
        const minute = date.getMinutes();
        const timeKey = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;

        // Check if this minute is in our target range
        if (minuteDataMap.has(timeKey)) {
          const existingData = minuteDataMap.get(timeKey);
          minuteDataMap.set(timeKey, {
            ...existingData,
            value: parseFloat(item.value) || 0,
          });
        }
      });
    }

    // Initialize map to store hourly data for L10, L50, L90, Lmin, and Lmax
    const hourlyDataMap = new Map();

    // Initialize with slots for each hour in our range
    hoursToInclude.forEach((hour) => {
      const timeStr = `${hour.toString().padStart(2, "0")}:00`;

      hourlyDataMap.set(timeStr, {
        time: timeStr,
        l10: null,
        l50: null,
        l90: null,
        lmin: null,
        lmax: null,
        hour: hour,
      });
    });

    // Process L10, L50, L90 data from laeq_realtime (hourly data)
    if (realtimeResponse.data && Array.isArray(realtimeResponse.data)) {
      realtimeResponse.data.forEach((item) => {
        if (!item || !item.created_at) return;

        const date = new Date(item.created_at);
        const hour = date.getHours();
        const timeKey = `${hour.toString().padStart(2, "0")}:00`;

        // Check if this hour is in our target range
        if (hourlyDataMap.has(timeKey)) {
          const existingData = hourlyDataMap.get(timeKey);
          hourlyDataMap.set(timeKey, {
            ...existingData,
            l10: parseFloat(item.L10) || existingData.l10 || 0,
            l50: parseFloat(item.L50) || existingData.l50 || 0,
            l90: parseFloat(item.L90) || existingData.l90 || 0,
          });
        }
      });
    }

    // Process Lmin, Lmax from laeq_hourly (hourly data)
    if (hourlyResponse.data && Array.isArray(hourlyResponse.data)) {
      hourlyResponse.data.forEach((item) => {
        if (!item || !item.created_at) return;

        const date = new Date(item.created_at);
        const hour = date.getHours();
        const timeKey = `${hour.toString().padStart(2, "0")}:00`;

        // Check if this hour is in our target range
        if (hourlyDataMap.has(timeKey)) {
          const existingData = hourlyDataMap.get(timeKey);
          hourlyDataMap.set(timeKey, {
            ...existingData,
            lmin: parseFloat(item.Lmin) || existingData.lmin || 0,
            lmax: parseFloat(item.Lmax) || existingData.lmax || 0,
          });
        }
      });
    }

    // Merge minute data with hourly data for L10, L50, L90, Lmin, and Lmax
    minuteDataMap.forEach((minuteData, timeKey) => {
      const hourKey = `${minuteData.hour.toString().padStart(2, "0")}:00`;
      if (hourlyDataMap.has(hourKey)) {
        const hourlyData = hourlyDataMap.get(hourKey);
        minuteData.l10 = hourlyData.l10;
        minuteData.l50 = hourlyData.l50;
        minuteData.l90 = hourlyData.l90;
        minuteData.lmin = hourlyData.lmin;
        minuteData.lmax = hourlyData.lmax;
      }
    });

    // Convert map to array and sort by time in the correct sequence
    let resultArray = Array.from(minuteDataMap.values());

    // Sort by hour and minute untuk menampilkan dengan urutan yang benar
    if (timeFilter === "nighttime") {
      // Untuk nighttime, kita perlu mengurutkan dengan benar:
      // 19:00, 20:00, 21:00, ..., 23:59, 00:00, 01:00, ..., 06:59
      resultArray.sort((a, b) => {
        // Konversi jam untuk perbandingan yang benar
        const adjustedHourA = a.hour < 19 ? a.hour + 24 : a.hour;
        const adjustedHourB = b.hour < 19 ? b.hour + 24 : b.hour;

        if (adjustedHourA !== adjustedHourB) {
          return adjustedHourA - adjustedHourB;
        }

        // Jika jam sama, urutkan berdasarkan menit
        return a.minute - b.minute;
      });
    } else {
      // Untuk daytime, urutkan normal
      resultArray.sort((a, b) => {
        const timeA = a.hour * 60 + a.minute;
        const timeB = b.hour * 60 + b.minute;
        return timeA - timeB;
      });
    }

    // Replace any null values with 0 for chart rendering
    resultArray = resultArray.map((item) => ({
      ...item,
      value: item.value ?? 0,
      l10: item.l10 ?? 0,
      l50: item.l50 ?? 0,
      l90: item.l90 ?? 0,
      lmin: item.lmin ?? 0,
      lmax: item.lmax ?? 0,
    }));

    return resultArray;
  } catch (error) {
    console.error("Error fetching trend data:", error);
    throw error;
  }
};

export const exportReportData = async (format, timeRange, params = {}) => {
  try {
    const endpoint = format === "excel" ? "/export-excel" : "/export-pdf";

    const response = await api.get(endpoint, {
      params: {
        ...params,
        timeRange, // 15minutes or 1hour
      },
      responseType: format === "excel" ? "blob" : "blob",
    });

    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `noise_report.${format === "excel" ? "xlsx" : "pdf"}`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error(`Error exporting ${format} report:`, error);
    throw error;
  }
};
