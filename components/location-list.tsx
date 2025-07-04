'use client';

import { Trash2, MapPin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Location } from '@/lib/types';

interface LocationListProps {
  locations: Location[];
  onLocationRemove: (id: string) => void;
}

export function LocationList({ locations, onLocationRemove }: LocationListProps) {
  if (locations.length === 0) {
    return (
      <Card className="border-dashed border-kmlchemy-green/30 bg-white/60 backdrop-blur-sm" data-testid="location-list-empty">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <MapPin className="h-12 w-12 text-kmlchemy-green/60 mb-4" data-testid="location-list-empty-icon" />
          <h3 className="text-lg font-semibold text-kmlchemy-navy mb-2" data-testid="location-list-empty-title">No locations added</h3>
          <p className="text-sm text-muted-foreground max-w-sm" data-testid="location-list-empty-description">
            Search for places, addresses, or businesses above to start building your location list.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-kmlchemy-green/20 shadow-sm bg-white/80 backdrop-blur-sm" data-testid="location-list">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-kmlchemy-navy" data-testid="location-list-title">
          <Globe className="h-5 w-5 text-kmlchemy-green" data-testid="location-list-title-icon" />
          Selected Locations
          <Badge variant="secondary" className="ml-auto bg-kmlchemy-green/10 text-kmlchemy-navy border-kmlchemy-green/20" data-testid="location-list-count">
            {locations.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3" data-testid="location-list-content">
        {locations.map((location) => (
          <div
            key={location.id}
            className="flex items-start gap-3 p-3 border border-kmlchemy-green/10 rounded-lg hover:bg-kmlchemy-green/5 hover:border-kmlchemy-green/20 transition-all duration-200"
            data-testid={`location-item-${location.id}`}
          >
            <MapPin className="h-4 w-4 mt-1 text-kmlchemy-green flex-shrink-0" data-testid={`location-item-icon-${location.id}`} />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate text-kmlchemy-navy" data-testid={`location-item-name-${location.id}`}>{location.name}</div>
              <div className="text-xs text-muted-foreground truncate mt-0.5" data-testid={`location-item-address-${location.id}`}>
                {location.address}
              </div>
              <div className="text-xs text-kmlchemy-green/70 mt-1 font-mono" data-testid={`location-item-coordinates-${location.id}`}>
                {location.coordinates.latitude.toFixed(6)}, {location.coordinates.longitude.toFixed(6)}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLocationRemove(location.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
              data-testid={`location-item-remove-${location.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}