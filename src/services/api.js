import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API request failed:', error);
    // Enhanced error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    }
    return Promise.reject(error);
  }
);

export const fetchDashboardSummary = async () => {
  try {
    // Fetch LAeq from tbl_laeq for latest LAeq
    const laeqResponse = await api.get('/tbl-laeq', { params: { limit: 1 } });
    
    // Fetch L10, L50, L90 from laeq_realtime
    const realTimeResponse = await api.get('/laeq-realtime', { params: { limit: 1 } });
    
    // Fetch Lmin, Lmax from laeq_hourly for today's stats
    const hourlyResponse = await api.get('/laeq-hourly', { 
      params: { 
        limit: 1,
        // Get the latest hourly record
        sort: 'created_at,desc'
      } 
    });

    // Combine the data with proper null checks
    const latestLaeq = {
      laeq: laeqResponse.data?.[0]?.laeq || 0,
      L10: realTimeResponse.data?.[0]?.L10 || 0,
      L50: realTimeResponse.data?.[0]?.L50 || 0,
      L90: realTimeResponse.data?.[0]?.L90 || 0,
      Lmax: hourlyResponse.data?.[0]?.Lmax || 0,
      Lmin: hourlyResponse.data?.[0]?.Lmin || 0
    };
    
    // Get today's stats - calculate from hourly data
    const today = new Date().toISOString().split('T')[0];
    const todayHourlyResponse = await api.get('/laeq-hourly', {
      params: {
        date: today
      }
    });

    const todayData = todayHourlyResponse.data || [];
    
    const todayStats = {
      maxLaeq: todayData.length > 0 
        ? Math.max(...todayData.map(item => item?.laeq || 0), 0)
        : 0,
      minLaeq: todayData.length > 0 
        ? Math.min(...todayData.filter(item => item?.laeq != null).map(item => item.laeq), 0)
        : 0,
      avgLaeq: todayData.length > 0
        ? (todayData.reduce((sum, item) => sum + (item?.laeq || 0), 0) / todayData.length).toFixed(1)
        : 0
    };

    return {
      latestLaeq,
      todayStats
    };
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    // Return default values on error
    return {
      latestLaeq: { laeq: 0, L10: 0, L50: 0, L90: 0, Lmax: 0, Lmin: 0 },
      todayStats: { maxLaeq: 0, minLaeq: 0, avgLaeq: 0 }
    };
  }
};

export const fetchLaeqData = async (params = {}) => {
  try {
    // Fetch from tbl_laeq for Realtime LAeq
    const response = await api.get('/tbl-laeq', { params });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching LAeq data:', error);
    return [];
  }
};

export const fetchLaeqMinuteData = async (params = {}) => {
  try {
    // Fetch from laeq_data for Minute LAeq
    const response = await api.get('/laeq-data', { 
      params: { ...params, type: '1min' } 
    });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching LAeq minute data:', error);
    return [];
  }
};

export const fetchLaeqHourlyData = async (params = {}) => {
  try {
    // Fetch from laeq_hourly for Hourly LAeq
    const response = await api.get('/laeq-hourly', { params });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching LAeq hourly data:', error);
    return [];
  }
};

export const fetchRealtimeData = async (params = {}) => {
  try {
    // Fetch from laeq_realtime for L10, L50, L90
    const realtimeResponse = await api.get('/laeq-realtime', { 
      params: { 
        ...params, 
        sort: 'created_at,desc' 
      } 
    });
    
    // If no data, return early
    if (!realtimeResponse.data || realtimeResponse.data.length === 0) {
      return [];
    }
    
    // Fetch corresponding LAeq data from tbl_laeq
    const laeqResponse = await api.get('/tbl-laeq', { 
      params: { 
        limit: params.limit || 10,
        sort: 'created_at,desc'
      } 
    });
    
    // Fetch Lmin, Lmax from laeq_hourly
    const hourlyResponse = await api.get('/laeq-hourly', { 
      params: { 
        limit: params.limit || 10,
        sort: 'created_at,desc'
      } 
    });
    
    // Combine data by timestamp (closest match)
    const combinedData = realtimeResponse.data.map(rtItem => {
      if (!rtItem || !rtItem.created_at) return null;
      
      const rtTimestamp = new Date(rtItem.created_at).getTime();
      
      // Find closest LAeq entry
      const laeqItem = (laeqResponse.data || []).reduce((closest, item) => {
        if (!item || !item.created_at) return closest;
        
        const itemTime = new Date(item.created_at).getTime();
        const closestTime = closest ? new Date(closest.created_at).getTime() : null;
        
        if (!closest || Math.abs(itemTime - rtTimestamp) < Math.abs(closestTime - rtTimestamp)) {
          return item;
        }
        return closest;
      }, null);
      
      // Find closest hourly entry
      const hourlyItem = (hourlyResponse.data || []).reduce((closest, item) => {
        if (!item || !item.created_at) return closest;
        
        const itemTime = new Date(item.created_at).getTime();
        const closestTime = closest ? new Date(closest.created_at).getTime() : null;
        
        if (!closest || Math.abs(itemTime - rtTimestamp) < Math.abs(closestTime - rtTimestamp)) {
          return item;
        }
        return closest;
      }, null);
      
      return {
        ...rtItem,
        laeq: laeqItem?.laeq || 0,
        Lmin: hourlyItem?.Lmin || 0,
        Lmax: hourlyItem?.Lmax || 0,
      };
    }).filter(Boolean); // Remove any null entries
    
    return combinedData;
  } catch (error) {
    console.error('Error fetching realtime data:', error);
    return [];
  }
};

export const fetchMqttStatus = async () => {
  try {
    // Get the most recent MQTT status record
    const response = await api.get('/mqtt-status', { 
      params: { 
        limit: 1,
        sort: 'updated_at,desc'  // Ensure we get the most recent record by updated_at
      } 
    });
    
    // Default values if no data is found
    let mqttData = { 
      status: 'Offline', 
      quality: 'Offline', 
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      lastOnlineTimestamp: null
    };
    
    // If we have data from response, use it
    if (response.data && response.data.length > 0) {
      mqttData = response.data[0];
      
      // Parse combined status if necessary (e.g., "Online2025-03-03 11:51:53")
      if (mqttData.status && mqttData.status.startsWith("Online")) {
        // Extract timestamp from status if it's embedded
        if (mqttData.status.length > 6) { // "Online" + something else
          const timestampMatch = mqttData.status.match(/Online(.*)/);
          if (timestampMatch && timestampMatch[1]) {
            try {
              // Extract the timestamp part and trim it
              const timestampPart = timestampMatch[1].trim();
              // Store the original timestamp
              mqttData.statusTimestamp = timestampPart;
              
              // Convert timestamp to the correct format using proper date parsing
              // This properly handles various date formats that might be in the database
              const parsedDate = new Date(timestampPart);
              if (!isNaN(parsedDate.getTime())) {
                mqttData.lastOnlineTimestamp = parsedDate.toISOString();
              }
            } catch (e) {
              console.error("Error parsing embedded timestamp:", e);
            }
          }
        }
        
        // Set clean status regardless of timestamp extraction success
        mqttData.status = "Online";
      }
      
      // Use updated_at field as the lastUpdated property
      mqttData.lastUpdated = mqttData.updated_at || mqttData.created_at;
      
      // If current status is online, use this as the last online timestamp too
      if (mqttData.status === 'Online') {
        // If we didn't extract lastOnlineTimestamp from status, use lastUpdated
        if (!mqttData.lastOnlineTimestamp) {
          mqttData.lastOnlineTimestamp = mqttData.lastUpdated;
        }
      }
    }
    
    // If current status is offline, fetch the last online record
    if (mqttData.status === 'Offline') {
      try {
        // Query for the most recent 'Online' status record
        const lastOnlineResponse = await api.get('/mqtt-status', { 
          params: { 
            status: 'Online',  // This might need to be adjusted to match your actual DB
            limit: 1,
            sort: 'updated_at,desc' // Get the most recent by updated_at
          } 
        });
        
        // If we found a last online record, use its timestamp
        if (lastOnlineResponse.data && lastOnlineResponse.data.length > 0) {
          const lastOnlineRecord = lastOnlineResponse.data[0];
          
          // Check if the status contains an embedded timestamp
          if (lastOnlineRecord.status && lastOnlineRecord.status.startsWith("Online") && lastOnlineRecord.status.length > 6) {
            const timestampMatch = lastOnlineRecord.status.match(/Online(.*)/);
            if (timestampMatch && timestampMatch[1]) {
              try {
                // Extract the timestamp part and trim it
                const timestampPart = timestampMatch[1].trim();
                
                // Convert timestamp to the correct format using proper date parsing
                const parsedDate = new Date(timestampPart);
                if (!isNaN(parsedDate.getTime())) {
                  mqttData.lastOnlineTimestamp = parsedDate.toISOString();
                } else {
                  // If parsing fails, fall back to the record's timestamp
                  mqttData.lastOnlineTimestamp = lastOnlineRecord.updated_at || lastOnlineRecord.created_at;
                }
              } catch (e) {
                console.error("Error parsing embedded timestamp from last online record:", e);
                mqttData.lastOnlineTimestamp = lastOnlineRecord.updated_at || lastOnlineRecord.created_at;
              }
            } else {
              mqttData.lastOnlineTimestamp = lastOnlineRecord.updated_at || lastOnlineRecord.created_at;
            }
          } else {
            mqttData.lastOnlineTimestamp = lastOnlineRecord.updated_at || lastOnlineRecord.created_at;
          }
        }
      } catch (innerError) {
        console.error('Error fetching last online MQTT status:', innerError);
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
    if (mqttData.status === 'Online') {
      try {
        const laeqResponse = await api.get('/tbl-laeq', { params: { limit: 1 } });
        const laeqValue = laeqResponse.data?.[0]?.laeq || 0;
        
        // Logic to determine MQTT signal quality based on LAeq value
        if (laeqValue > 0 && laeqValue < 45) {
          mqttData.quality = 'Baik';
        } else if (laeqValue >= 45 && laeqValue < 55) {
          mqttData.quality = 'Sedang';
        } else {
          mqttData.quality = 'Lemah';
        }
      } catch (qualityError) {
        console.error('Error determining signal quality:', qualityError);
        mqttData.quality = 'Unknown';
      }
    } else {
      mqttData.quality = 'Offline';
    }
    
    return mqttData;
  } catch (error) {
    console.error('Error fetching MQTT status:', error);
    // Include default values on error
    return { 
      status: 'Offline', 
      quality: 'Offline',
      lastUpdated: new Date().toISOString(),
      lastOnlineTimestamp: null
    };
  }
};

export const fetchTrendData = async (params = {}) => {
  try {
    // Fetch realtime data with all required fields
    const realtimeResponse = await api.get('/laeq-realtime', { 
      params: { 
        ...params,
        sort: 'created_at,desc'
      } 
    });
    
    // If no data, return early
    if (!realtimeResponse.data || realtimeResponse.data.length === 0) {
      return [];
    }
    
    // Fetch LAeq from tbl_laeq
    const laeqResponse = await api.get('/tbl-laeq', { 
      params: { 
        limit: params.limit || 60,
        sort: 'created_at,desc'
      } 
    });
    
    // Fetch Lmin, Lmax from laeq_hourly (closest hourly data)
    const hourlyResponse = await api.get('/laeq-hourly', { 
      params: { 
        limit: 24, // Get 24 hours of data to match with timestamps
        sort: 'created_at,desc'
      } 
    });
    
    // Combine data by timestamp (closest match) with proper null checks
    const trendData = realtimeResponse.data.map(rtItem => {
      if (!rtItem || !rtItem.created_at) return null;
      
      const rtTimestamp = new Date(rtItem.created_at).getTime();
      
      // Find closest LAeq entry
      const laeqItem = (laeqResponse.data || []).reduce((closest, item) => {
        if (!item || !item.created_at) return closest;
        
        const itemTime = new Date(item.created_at).getTime();
        const closestTime = closest ? new Date(closest.created_at).getTime() : null;
        
        if (!closest || Math.abs(itemTime - rtTimestamp) < Math.abs(closestTime - rtTimestamp)) {
          return item;
        }
        return closest;
      }, null);
      
      // Find closest hourly entry for Lmin/Lmax
      const hourlyItem = (hourlyResponse.data || []).reduce((closest, item) => {
        if (!item || !item.created_at) return closest;
        
        const itemTime = new Date(item.created_at).getTime();
        const closestTime = closest ? new Date(closest.created_at).getTime() : null;
        
        if (!closest || Math.abs(itemTime - rtTimestamp) < Math.abs(closestTime - rtTimestamp)) {
          return item;
        }
        return closest;
      }, null);
      
      return {
        created_at: rtItem.created_at,
        laeq: laeqItem?.laeq || 0,
        L10: rtItem.L10 || 0,
        L50: rtItem.L50 || 0,
        L90: rtItem.L90 || 0,
        Lmin: hourlyItem?.Lmin || 0,
        Lmax: hourlyItem?.Lmax || 0,
      };
    });
    
    return trendData;
  } catch (error) {
    console.error('Error fetching trend data:', error);
    throw error;
  }
};

export const exportReportData = async (format, timeRange, params = {}) => {
  try {
    const endpoint = format === 'excel' ? '/export-excel' : '/export-pdf';
    
    const response = await api.get(endpoint, {
      params: {
        ...params,
        timeRange, // 15minutes or 1hour
      },
      responseType: format === 'excel' ? 'blob' : 'blob',
    });
    
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `noise_report.${format === 'excel' ? 'xlsx' : 'pdf'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error(`Error exporting ${format} report:`, error);
    throw error;
  }
};