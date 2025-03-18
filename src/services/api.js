import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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
    const laeqResponse = await api.get("/tbl-laeq", { params: { limit: 1 } });

    // Fetch L10, L50, L90 from laeq_realtime
    const realTimeResponse = await api.get("/laeq-realtime", {
      params: { limit: 1 },
    });

    // Fetch Lmin, Lmax from laeq_hourly for today's stats
    const hourlyResponse = await api.get("/laeq-hourly", {
      params: {
        limit: 1,
        // Get the latest hourly record
        sort: "created_at,desc",
      },
    });

    // Combine the data with proper null checks
    const latestLaeq = {
      laeq: laeqResponse.data?.[0]?.laeq || 0,
      L10: realTimeResponse.data?.[0]?.L10 || 0,
      L50: realTimeResponse.data?.[0]?.L50 || 0,
      L90: realTimeResponse.data?.[0]?.L90 || 0,
      Lmax: hourlyResponse.data?.[0]?.Lmax || 0,
      Lmin: hourlyResponse.data?.[0]?.Lmin || 0,
    };

    // Get today's stats - calculate from hourly data
    const today = new Date().toISOString().split("T")[0];
    const todayHourlyResponse = await api.get("/laeq-hourly", {
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
    const response = await api.get("/tbl-laeq", { params });
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
      lmax: item.Lmax || 0,
      lmin: item.Lmin || 0,
      created_at: item.created_at,
    }));

    return formattedData || [];
  } catch (error) {
    console.error("Error fetching LAeq hourly data:", error);
    return [];
  }
};

export const fetchRealtimeData = async (params = {}) => {
  try {
    const { timeRange, ...otherParams } = params;
    const now = new Date();
    const timeAgo = new Date(
      now.getTime() -
        (timeRange === "15minutes" ? 15 * 60 * 1000 : 60 * 60 * 1000)
    );

    const response = await api.get("/laeq-realtime", {
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
        const laeqResponse = await api.get("/tbl-laeq", {
          params: { limit: 1 },
        });
        const laeqValue = laeqResponse.data?.[0]?.laeq || 0;

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
      // Fetch LAeq from tbl_laeq (hourly aggregated)
      api.get("/tbl-laeq", { params: queryParams }),

      // Fetch L10, L50, L90 from laeq_realtime (hourly aggregated)
      api.get("/laeq-realtime", { params: queryParams }),

      // Fetch Lmin, Lmax from laeq_hourly
      api.get("/laeq-hourly", { params: queryParams }),
    ]);

    // Initialize map to store hourly data
    const hourlyDataMap = new Map();

    // Determine which hours to include based on time filter
    const hoursToInclude = [];

    if (timeFilter === "daytime") {
      // For daytime: 7am to 6pm (7, 8, 9, ..., 18)
      for (let i = startHour; i < endHour; i++) {
        hoursToInclude.push(i);
      }
    } else {
      // For nighttime: 7pm to 6am (19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6)
      for (let i = startHour; i < 24; i++) {
        hoursToInclude.push(i);
      }
      for (let i = 0; i < endHour; i++) {
        hoursToInclude.push(i);
      }
    }

    // Initialize with slots for each hour in our range
    hoursToInclude.forEach((hour) => {
      const timeStr = `${hour.toString().padStart(2, "0")}:00`;

      hourlyDataMap.set(timeStr, {
        time: timeStr,
        value: null, // LAeq
        l10: null,
        l50: null,
        l90: null,
        lmin: null,
        lmax: null,
        hour: hour,
      });
    });

    // Process LAeq data from tbl_laeq
    if (laeqResponse.data && Array.isArray(laeqResponse.data)) {
      laeqResponse.data.forEach((item) => {
        if (!item || !item.created_at) return;

        const date = new Date(item.created_at);
        const hour = date.getHours();
        const timeKey = `${hour.toString().padStart(2, "0")}:00`;

        // Check if this hour is in our target range
        if (hourlyDataMap.has(timeKey)) {
          const existingData = hourlyDataMap.get(timeKey);
          hourlyDataMap.set(timeKey, {
            ...existingData,
            value: parseFloat(item.laeq) || 0,
          });
        }
      });
    }

    // Process L10, L50, L90 data from laeq_realtime
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

    // Process Lmin, Lmax from laeq_hourly
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

    // Convert map to array and sort by hour in the correct sequence
    let resultArray = Array.from(hourlyDataMap.values());

    // For daytime, sort from 7:00 to 18:00
    if (timeFilter === "daytime") {
      resultArray.sort((a, b) => a.hour - b.hour);
    }
    // For nighttime, sort from 19:00 to 06:00
    else {
      resultArray.sort((a, b) => {
        // This handles the wrap-around at midnight (19, 20, 21..., 0, 1, 2...)
        const hourA = a.hour < startHour ? a.hour + 24 : a.hour;
        const hourB = b.hour < startHour ? b.hour + 24 : b.hour;
        return hourA - hourB;
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
