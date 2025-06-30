import { MapboxResponse } from './types';

const MAPBOX_BASE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

export class MapboxError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'MapboxError';
  }
}

export async function searchPlaces(
  query: string,
  token: string
): Promise<MapboxResponse> {
  if (!query.trim()) {
    throw new MapboxError('Query cannot be empty');
  }

  if (!token) {
    throw new MapboxError('Mapbox token is required');
  }

  const encodedQuery = encodeURIComponent(query.trim());
  
  // First try: Search with POI focus for business queries
  let url = `${MAPBOX_BASE_URL}/${encodedQuery}.json?access_token=${token}&autocomplete=true&limit=10&types=poi`;
  
  try {
    let response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new MapboxError('Invalid Mapbox token', 401);
      }
      if (response.status === 429) {
        throw new MapboxError('Rate limit exceeded. Please try again later.', 429);
      }
      throw new MapboxError(`HTTP ${response.status}: ${response.statusText}`, response.status);
    }

    let data: MapboxResponse = await response.json();
    
    // If POI search returns few results, try a broader search
    if (data.features.length < 3) {
      const broadUrl = `${MAPBOX_BASE_URL}/${encodedQuery}.json?access_token=${token}&autocomplete=true&limit=10&types=poi,address,place`;
      
      try {
        const broadResponse = await fetch(broadUrl);
        if (broadResponse.ok) {
          const broadData: MapboxResponse = await broadResponse.json();
          // Combine results, prioritizing POI results
          const poiResults = data.features.filter(f => f.place_type.includes('poi'));
          const otherResults = broadData.features.filter(f => !f.place_type.includes('poi'));
          data.features = [...poiResults, ...otherResults].slice(0, 10);
        }
      } catch (error) {
        // If broad search fails, continue with original results
        console.warn('Broad search failed, using POI results only');
      }
    }
    
    // Sort results by relevance and POI preference
    if (data.features) {
      data.features.sort((a, b) => {
        // Prioritize POI results
        const aIsPOI = a.place_type.includes('poi');
        const bIsPOI = b.place_type.includes('poi');
        
        if (aIsPOI && !bIsPOI) return -1;
        if (!aIsPOI && bIsPOI) return 1;
        
        // Then sort by relevance
        const scoreA = a.properties?.relevance || a.relevance || 0;
        const scoreB = b.properties?.relevance || b.relevance || 0;
        return scoreB - scoreA;
      });
    }
    
    return data;
  } catch (error) {
    if (error instanceof MapboxError) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new MapboxError('Network error. Please check your connection.');
    }
    
    throw new MapboxError('An unexpected error occurred while searching places.');
  }
}