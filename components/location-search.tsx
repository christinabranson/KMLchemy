'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Loader2, AlertCircle, Store, Navigation, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { searchPlaces, MapboxError } from '@/lib/mapbox';
import { MapboxFeature, Location } from '@/lib/types';
import { cn } from '@/lib/utils';

export interface LocationSearchProps {
  onLocationAdd: (location: Location) => void;
  mapboxToken?: string;
}

export function LocationSearch({ onLocationAdd, mapboxToken }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MapboxFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || !mapboxToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await searchPlaces(searchQuery, mapboxToken);
      console.log('Search results:', response.features); // Debug log
      setResults(response.features);
      setShowDropdown(response.features.length > 0);
    } catch (err) {
      if (err instanceof MapboxError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      setResults([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => performSearch(value), 300);
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  };

  const handleResultSelect = (feature: MapboxFeature) => {
    const location: Location = {
      id: feature.id,
      name: feature.text,
      address: feature.place_name,
      coordinates: {
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1],
      },
    };

    onLocationAdd(location);
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query);
    }
  };

  const getPlaceIcon = (placeTypes: string[], properties: any) => {
    if (placeTypes.includes('poi')) {
      // Check for specific business categories
      const category = properties?.category;
      if (category) {
        if (category.includes('coffee') || category.includes('cafe')) {
          return <Store className="h-4 w-4 text-amber-600" />;
        }
        if (category.includes('restaurant') || category.includes('food')) {
          return <Store className="h-4 w-4 text-red-500" />;
        }
        if (category.includes('shop') || category.includes('retail')) {
          return <Store className="h-4 w-4 text-purple-500" />;
        }
      }
      return <Building className="h-4 w-4 text-kmlchemy-navy" />;
    }
    if (placeTypes.includes('address')) {
      return <Navigation className="h-4 w-4 text-kmlchemy-green" />;
    }
    return <MapPin className="h-4 w-4 text-muted-foreground" />;
  };

  const getPlaceTypeLabel = (placeTypes: string[], properties: any) => {
    if (placeTypes.includes('poi')) {
      const category = properties?.category;
      if (category) {
        return category.split('_').map((word: string) => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      }
      return 'Business';
    }
    if (placeTypes.includes('address')) return 'Address';
    if (placeTypes.includes('place')) return 'Place';
    if (placeTypes.includes('locality')) return 'City';
    return 'Location';
  };

  if (!mapboxToken) {
    return (
      <Alert variant="destructive" data-testid="location-search-no-token-alert">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription data-testid="location-search-no-token-message">
          Mapbox token is not configured. Please add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local file.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="relative" ref={dropdownRef} data-testid="location-search-container">
      <form onSubmit={handleSubmit} className="flex gap-2" data-testid="location-search-form">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-kmlchemy-green h-4 w-4" data-testid="location-search-icon" />
          <Input
            placeholder="Search businesses: 'Starbucks Philadelphia' or 'pizza near Times Square'"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            className="pl-10 pr-10 border-kmlchemy-green/20 focus:border-kmlchemy-green focus:ring-kmlchemy-green/20"
            data-testid="location-search-input"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-kmlchemy-green" data-testid="location-search-loading" />
          )}
        </div>
        <Button 
          type="submit" 
          disabled={isLoading || !query.trim()}
          className="bg-kmlchemy-navy hover:bg-kmlchemy-navy/90 text-white"
          data-testid="location-search-button"
        >
          Search
        </Button>
      </form>

      {error && (
        <Alert variant="destructive" className="mt-2" data-testid="location-search-error">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription data-testid="location-search-error-message">{error}</AlertDescription>
        </Alert>
      )}

      {showDropdown && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto shadow-lg border-2 border-kmlchemy-green/20 bg-white/95 backdrop-blur-sm" data-testid="location-search-dropdown">
          <div className="p-1">
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleResultSelect(result)}
                className={cn(
                  "w-full text-left p-3 rounded-md hover:bg-kmlchemy-green/10 hover:text-kmlchemy-navy",
                  "transition-colors duration-150 focus:outline-none focus:bg-kmlchemy-green/10 focus:text-kmlchemy-navy",
                  "border-b border-kmlchemy-green/10 last:border-b-0"
                )}
                data-testid={`location-search-result-${result.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getPlaceIcon(result.place_type, result.properties)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-semibold text-sm truncate text-kmlchemy-navy" data-testid={`location-search-result-name-${result.id}`}>{result.text}</div>
                      <Badge 
                        variant={result.place_type.includes('poi') ? 'default' : 'secondary'} 
                        className={cn(
                          "text-xs",
                          result.place_type.includes('poi') 
                            ? "bg-kmlchemy-navy text-white" 
                            : "bg-kmlchemy-green/10 text-kmlchemy-green border-kmlchemy-green/20"
                        )}
                        data-testid={`location-search-result-type-${result.id}`}
                      >
                        {getPlaceTypeLabel(result.place_type, result.properties)}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground truncate" data-testid={`location-search-result-address-${result.id}`}>
                      {result.place_name}
                    </div>
                    {result.properties?.category && (
                      <div className="text-xs text-kmlchemy-green mt-1 font-medium" data-testid={`location-search-result-category-${result.id}`}>
                        {result.properties.category.replace(/_/g, ' ').toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {showDropdown && results.length === 0 && !isLoading && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg border-kmlchemy-green/20 bg-white/95 backdrop-blur-sm" data-testid="location-search-no-results">
          <div className="p-4 text-center text-sm text-muted-foreground" data-testid="location-search-no-results-message">
            No results found. Try a different search term.
          </div>
        </Card>
      )}
    </div>
  );
}