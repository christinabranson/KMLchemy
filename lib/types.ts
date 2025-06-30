export interface MapboxFeature {
  id: string;
  type: 'Feature';
  place_type: string[];
  place_name: string;
  properties: {
    text: string;
    place_name: string;
    relevance?: number;
    category?: string;
    maki?: string;
    context?: Array<{
      id: string;
      text: string;
    }>;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  center: [number, number];
  text: string;
  relevance?: number;
  context?: Array<{
    id: string;
    text: string;
  }>;
}

export interface MapboxResponse {
  type: 'FeatureCollection';
  query: string[];
  features: MapboxFeature[];
  attribution: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
}