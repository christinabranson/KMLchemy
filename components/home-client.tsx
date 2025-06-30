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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="relative">
              <Image
                src={process.env.NODE_ENV === 'production' ? '/KMLchemy/logo.png' : '/logo.png'}
                alt="KMLchemy Logo"
                width={72}
                height={72}
                className="rounded-xl"
              />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-kmlchemy-green to-kmlchemy-navy bg-clip-text text-transparent">
              KMLchemy
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
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
            >
              <Image
                src={process.env.NODE_ENV === 'production' ? '/KMLchemy/black_circle_360x360.svg' : '/black_circle_360x360.svg'}
                alt="Built with Bolt"
                width={120}
                height={120}
                className="rounded-full"
              />
            </a>
          </div>
        </div>

        {/* Configuration Alert */}
        {!mapboxToken && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <Settings className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Setup Required:</strong> Please add your Mapbox token to <code>.env.local</code> to enable location search.
              <br />
              <span className="text-sm">Copy <code>.env.local.example</code> and add your token from the Mapbox dashboard.</span>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">
          {/* Search Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Individual Search */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-kmlchemy-green/10 shadow-sm">
              <h2 className="text-xl font-semibold mb-2 text-kmlchemy-navy">Search Locations</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Find businesses like "Starbucks Philadelphia" or "McDonald's Times Square". Also works with addresses and landmarks.
              </p>
              <LocationSearch onLocationAdd={handleLocationAdd} mapboxToken={mapboxToken} />
            </div>

            {/* Bulk Import */}
            <div className="space-y-4">
              <BulkImport onLocationsAdd={handleLocationsAdd} mapboxToken={mapboxToken} />
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Location List */}
            <div className="space-y-4">
              <LocationList 
                locations={locations} 
                onLocationRemove={handleLocationRemove} 
              />
            </div>

            {/* Export Section */}
            <div className="space-y-4">
              <ExportSection locations={locations} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-kmlchemy-green/20 text-center text-sm text-muted-foreground">
          <p>
            Powered by{' '}
            <a 
              href="https://docs.mapbox.com/api/search/geocoding/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-kmlchemy-navy hover:text-kmlchemy-green underline transition-colors"
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