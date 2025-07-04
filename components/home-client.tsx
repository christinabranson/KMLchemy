'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import { LocationSearch } from '@/components/location-search';
import { LocationList } from '@/components/location-list';
import { ExportSection } from '@/components/export-section';
import { BulkImport } from '@/components/bulk-import';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Location } from '@/lib/types';
import Image from 'next/image';

export function HomeClient({ mapboxToken }: { mapboxToken?: string }) {
  const [locations, setLocations] = useState<Location[]>([]);

  const handleLocationAdd = (location: Location) => {
    if (locations.some(loc => loc.id === location.id)) {
      return;
    }
    setLocations(prev => [...prev, location]);
  };

  const handleLocationsAdd = (newLocations: Location[]) => {
    const filteredLocations = newLocations.filter(newLoc => {
      return !locations.some(existingLoc => {
        const latDiff = Math.abs(existingLoc.coordinates.latitude - newLoc.coordinates.latitude);
        const lonDiff = Math.abs(existingLoc.coordinates.longitude - newLoc.coordinates.longitude);
        return latDiff < 0.0001 && lonDiff < 0.0001;
      });
    });
    if (filteredLocations.length > 0) {
      setLocations(prev => [...prev, ...filteredLocations]);
    }
  };

  const handleLocationRemove = (id: string) => {
    setLocations(prev => prev.filter(loc => loc.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-slate-100" data-testid="home-client">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8" data-testid="app-header">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="relative">
              <Image
                src={process.env.NODE_ENV === 'production' ? '/KMLchemy/logo.png' : '/logo.png'}
                alt="KMLchemy Logo"
                width={72}
                height={72}
                className="rounded-xl"
                data-testid="app-logo"
              />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-kmlchemy-green to-kmlchemy-navy bg-clip-text text-transparent" data-testid="app-title">
              KMLchemy
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed" data-testid="app-description">
            Transform your location searches into powerful KML files. Search for businesses, places, and addresses worldwide, 
            then export them for use in Google Earth, Google Maps, and other mapping applications.
          </p>
          {/* Badge */}
          <div className="mt-6">
            <a 
              href="https://bolt.new/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block hover:opacity-80 transition-opacity"
              data-testid="bolt-badge-link"
            >
              <Image
                src={process.env.NODE_ENV === 'production' ? '/KMLchemy/black_circle_360x360.svg' : '/black_circle_360x360.svg'}
                alt="Built with Bolt"
                width={120}
                height={120}
                className="rounded-full"
                data-testid="bolt-badge"
              />
            </a>
          </div>
        </div>

        {/* Configuration Alert */}
        {!mapboxToken && (
          <Alert className="mb-6 border-amber-200 bg-amber-50" data-testid="setup-alert">
            <Settings className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800" data-testid="setup-alert-description">
              <strong>Setup Required:</strong> Please add your Mapbox token to <code>.env.local</code> to enable location search.
              <br />
              <span className="text-sm">Copy <code>.env.local.example</code> and add your token from the Mapbox dashboard.</span>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6" data-testid="main-content">
          {/* Search Section */}
          <div className="grid md:grid-cols-2 gap-6" data-testid="search-section">
            {/* Individual Search */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-kmlchemy-green/10 shadow-sm" data-testid="individual-search-container">
              <h2 className="text-xl font-semibold mb-2 text-kmlchemy-navy" data-testid="search-locations-title">Search Locations</h2>
              <p className="text-sm text-muted-foreground mb-4" data-testid="search-locations-description">
                Find businesses like "Starbucks Philadelphia" or "McDonald's Times Square". Also works with addresses and landmarks.
              </p>
              <LocationSearch onLocationAdd={handleLocationAdd} mapboxToken={mapboxToken} />
            </div>

            {/* Bulk Import */}
            <div className="space-y-4" data-testid="bulk-import-container">
              <BulkImport onLocationsAdd={handleLocationsAdd} mapboxToken={mapboxToken} />
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-6" data-testid="results-section">
            {/* Location List */}
            <div className="space-y-4" data-testid="location-list-container">
              <LocationList 
                locations={locations} 
                onLocationRemove={handleLocationRemove} 
              />
            </div>

            {/* Export Section */}
            <div className="space-y-4" data-testid="export-section-container">
              <ExportSection locations={locations} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-kmlchemy-green/20 text-center text-sm text-muted-foreground" data-testid="app-footer">
          <p data-testid="footer-text">
            Powered by{' '}
            <a 
              href="https://docs.mapbox.com/api/search/geocoding/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-kmlchemy-navy hover:text-kmlchemy-green underline transition-colors"
              data-testid="mapbox-api-link"
            >
              Mapbox Geocoding API
            </a>
            {' '}• Export format: KML 2.2
          </p>
        </div>
      </div>
    </div>
  );
} 