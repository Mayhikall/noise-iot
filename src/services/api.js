import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

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

    // Combine the data
    const latestLaeq = {
      laeq: laeqResponse.data[0]?.laeq || 0,
      L10: realTimeResponse.data[0]?.L10 || 0,
      L50: realTimeResponse.data[0]?.L50 || 0,
      L90: realTimeResponse.data[0]?.L90 || 0,
      Lmax: hourlyResponse.data[0]?.Lmax || 0,
      Lmin: hourlyResponse.data[0]?.Lmin || 0
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
      maxLaeq: Math.max(...todayData.map(item => item.laeq || 0), 0),
      minLaeq: todayData.length > 0 
        ? Math.min(...todayData.map(item => item.laeq || 0)) 
        : 0,
      avgLaeq: todayData.length > 0
        ? (todayData.reduce((sum, item) => sum + (item.laeq || 0), 0) / todayData.length).toFixed(1)
        : 0
    };

    return {
      latestLaeq,
      todayStats
    };
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    throw error;
  }
};

export const fetchLaeqData = async (params = {}) => {
  try {
    // Fetch from tbl_laeq for Realtime LAeq
    const response = await api.get('/tbl-laeq', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching LAeq data:', error);
    throw error;
  }
};

export const fetchLaeqMinuteData = async (params = {}) => {
  try {
    // Fetch from laeq_data for Minute LAeq
    const response = await api.get('/laeq-data', { 
      params: { ...params, type: '1min' } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching LAeq minute data:', error);
    throw error;
  }
};

export const fetchLaeqHourlyData = async (params = {}) => {
  try {
    // Fetch from laeq_hourly for Hourly LAeq
    const response = await api.get('/laeq-hourly', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching LAeq hourly data:', error);
    throw error;
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
      const rtTimestamp = new Date(rtItem.created_at).getTime();
      
      // Find closest LAeq entry
      const laeqItem = laeqResponse.data.reduce((closest, item) => {
        const itemTime = new Date(item.created_at).getTime();
        const closestTime = closest ? new Date(closest.created_at).getTime() : null;
        
        if (!closest || Math.abs(itemTime - rtTimestamp) < Math.abs(closestTime - rtTimestamp)) {
          return item;
        }
        return closest;
      }, null);
      
      // Find closest hourly entry
      const hourlyItem = hourlyResponse.data.reduce((closest, item) => {
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
    });
    
    return combinedData;
  } catch (error) {
    console.error('Error fetching realtime data:', error);
    throw error;
  }
};

export const fetchMqttStatus = async () => {
  try {
    const response = await api.get('/mqtt-status', { params: { limit: 1 } });
    const mqttData = response.data[0] || { status: 'Offline' };
    
    // If online, fetch LAeq to determine signal strength
    if (mqttData.status === 'Online') {
      const laeqResponse = await api.get('/tbl-laeq', { params: { limit: 1 } });
      const laeqValue = laeqResponse.data[0]?.laeq || 0;
      
      // Logic to determine MQTT signal quality based on LAeq value
      if (laeqValue > 0 && laeqValue < 45) {
        mqttData.quality = 'Baik';
      } else if (laeqValue >= 45 && laeqValue < 55) {
        mqttData.quality = 'Sedang';
      } else {
        mqttData.quality = 'Lemah';
      }
    } else {
      mqttData.quality = 'Offline';
    }
    
    return mqttData;
  } catch (error) {
    console.error('Error fetching MQTT status:', error);
    return { status: 'Offline', quality: 'Offline' };
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
    
    // Combine data by timestamp (closest match)
    const trendData = realtimeResponse.data.map(rtItem => {
      const rtTimestamp = new Date(rtItem.created_at).getTime();
      
      // Find closest LAeq entry
      const laeqItem = laeqResponse.data.reduce((closest, item) => {
        const itemTime = new Date(item.created_at).getTime();
        const closestTime = closest ? new Date(closest.created_at).getTime() : null;
        
        if (!closest || Math.abs(itemTime - rtTimestamp) < Math.abs(closestTime - rtTimestamp)) {
          return item;
        }
        return closest;
      }, null);
      
      // Find closest hourly entry for Lmin/Lmax
      const hourlyItem = hourlyResponse.data.reduce((closest, item) => {
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