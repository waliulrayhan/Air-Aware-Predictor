// Types for the API response
interface APIResponse {
  status: string;
  data: {
    aqi: number;
    city: {
      name: string;
      geo: [number, number];
    };
    time: {
      iso: string;
    };
    iaqi: {
      pm25?: { v: number };
      pm10?: { v: number };
      o3?: { v: number };
      no2?: { v: number };
      so2?: { v: number };
      co?: { v: number };
      t?: { v: number };
      h?: { v: number };
    };
    forecast: {
      daily: {
        o3: Array<{ day: string; avg: number; max: number; min: number }>;
        pm10: Array<{ day: string; avg: number; max: number; min: number }>;
        pm25: Array<{ day: string; avg: number; max: number; min: number }>;
        uvi: Array<{ day: string; avg: number; max: number; min: number }>;
      };
    };
  };
}

// Function to fetch air quality data
export async function fetchAirQualityData(latitude?: number, longitude?: number) {
  const API_TOKEN = 'd8b5c9b5223bf382763b492cedc85e217fb27993';
  const baseUrl = 'https://api.waqi.info/feed';
  
  // Use provided coordinates or 'here' for current location
  const location = latitude && longitude ? `@${latitude};${longitude}` : 'here';
  const url = `${baseUrl}/${location}/?token=${API_TOKEN}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch air quality data');
    }

    const apiData: APIResponse = await response.json();
    
    if (apiData.status !== 'ok') {
      throw new Error('Invalid data received from API');
    }

    // Transform the data to match your interface
    return {
      aqi: apiData.data.aqi,
      location: apiData.data.city.name,
      coordinates: apiData.data.city.geo,
      timestamp: apiData.data.time.iso,
      pollutants: {
        pm25: apiData.data.iaqi.pm25?.v,
        pm10: apiData.data.iaqi.pm10?.v,
        o3: apiData.data.iaqi.o3?.v,
        no2: apiData.data.iaqi.no2?.v,
        so2: apiData.data.iaqi.so2?.v,
        co: apiData.data.iaqi.co?.v,
      },
      weather: {
        temperature: apiData.data.iaqi.t?.v,
        humidity: apiData.data.iaqi.h?.v,
      },
      forecast: {
        daily: {
          o3: apiData.data.forecast.daily.o3,
          pm10: apiData.data.forecast.daily.pm10,
          pm25: apiData.data.forecast.daily.pm25,
          uvi: apiData.data.forecast.daily.uvi,
        }
      }
    };
  } catch (error) {
    console.error('Error fetching air quality data:', error);
    throw error;
  }
} 