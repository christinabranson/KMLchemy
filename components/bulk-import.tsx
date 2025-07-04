'use client';

import { useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, X, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { searchPlaces, MapboxError } from '@/lib/mapbox';
import { Location } from '@/lib/types';
import { cn } from '@/lib/utils';

export interface BulkImportProps {
  onLocationsAdd: (locations: Location[]) => void;
  mapboxToken?: string;
}

interface ImportResult {
  original: string;
  location?: Location;
  error?: string;
  status: 'pending' | 'success' | 'error';
}

export function BulkImport({ onLocationsAdd, mapboxToken }: BulkImportProps) {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const parseAddresses = (text: string): string[] => {
    if (!text.trim()) return [];
    
    const addresses: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      // Handle CSV format: "name", "address"
      if (trimmedLine.includes('","')) {
        const parts = trimmedLine.split('","');
        if (parts.length >= 2) {
          const address = parts[1].replace(/"/g, '').trim();
          if (address) addresses.push(address);
          continue;
        }
      }
      
      // Handle quoted strings
      if (trimmedLine.startsWith('"') && trimmedLine.endsWith('"')) {
        const address = trimmedLine.slice(1, -1).trim();
        if (address) addresses.push(address);
        continue;
      }
      
      // Single address per line
      addresses.push(trimmedLine);
    }
    
    return Array.from(new Set(addresses)); // Remove duplicates
  };

  const geocodeAddress = async (address: string): Promise<Location | null> => {
    if (!mapboxToken) return null;
    
    try {
      const response = await searchPlaces(address, mapboxToken);
      if (response.features && response.features.length > 0) {
        const feature = response.features[0];
        return {
          id: `bulk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: feature.text,
          address: feature.place_name,
          coordinates: {
            longitude: feature.geometry.coordinates[0],
            latitude: feature.geometry.coordinates[1],
          },
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const handleBulkImport = async () => {
    if (!inputText.trim() || !mapboxToken) return;

    const addresses = parseAddresses(inputText);
    if (addresses.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setShowResults(true);

    // Initialize results
    const initialResults: ImportResult[] = addresses.map(addr => ({
      original: addr,
      status: 'pending' as const,
    }));
    setResults(initialResults);

    const processedResults: ImportResult[] = [];
    
    // Process addresses with rate limiting (1 request per 100ms)
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];
      
      try {
        const location = await geocodeAddress(address);
        
        if (location) {
          processedResults.push({
            original: address,
            location,
            status: 'success',
          });
        } else {
          processedResults.push({
            original: address,
            error: 'No results found',
            status: 'error',
          });
        }
      } catch (error) {
        processedResults.push({
          original: address,
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'error',
        });
      }

      // Update progress and results
      const currentProgress = ((i + 1) / addresses.length) * 100;
      setProgress(currentProgress);
      setResults([...processedResults, ...initialResults.slice(i + 1)]);

      // Rate limiting delay
      if (i < addresses.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    }

    setIsProcessing(false);
    
    // Add successful locations
    const successfulLocations = processedResults
      .filter(result => result.location)
      .map(result => result.location!);
    
    if (successfulLocations.length > 0) {
      onLocationsAdd(successfulLocations);
    }
  };

  const handleClear = () => {
    setInputText('');
    setResults([]);
    setShowResults(false);
    setProgress(0);
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  const exampleText = `"Starbucks", "123 Main St, Philadelphia, PA"
"McDonald's", "456 Market St, New York, NY"
"Central Park, New York, NY"
"Golden Gate Bridge, San Francisco, CA"`;

  return (
    <Card className="border-kmlchemy-green/20 shadow-sm bg-white/80 backdrop-blur-sm" data-testid="bulk-import">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-kmlchemy-navy" data-testid="bulk-import-title">
          <Upload className="h-5 w-5 text-kmlchemy-green" data-testid="bulk-import-title-icon" />
          Bulk Import Addresses
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4" data-testid="bulk-import-content">
        <div className="text-sm text-muted-foreground" data-testid="bulk-import-description">
          Paste a list of addresses, business names, or places. Supports CSV format, 
          one address per line, or mixed formats. Each address will be geocoded automatically.
        </div>

        {!mapboxToken && (
          <Alert variant="destructive" data-testid="bulk-import-no-token-alert">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription data-testid="bulk-import-no-token-message">
              Mapbox token is required for bulk geocoding. Please configure your API token.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-kmlchemy-navy" data-testid="bulk-import-label">
              Addresses to Import
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setInputText(exampleText)}
              className="text-xs text-kmlchemy-green hover:text-kmlchemy-navy hover:bg-kmlchemy-green/10"
              data-testid="bulk-import-use-example-button"
            >
              <Copy className="h-3 w-3 mr-1" />
              Use Example
            </Button>
          </div>
          <Textarea
            placeholder="Paste your addresses here...&#10;&#10;Examples:&#10;• 123 Main St, Philadelphia, PA&#10;• Starbucks, Times Square, NY&#10;• &quot;Business Name&quot;, &quot;Full Address&quot;&#10;• Central Park, New York"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-32 border-kmlchemy-green/20 focus:border-kmlchemy-green focus:ring-kmlchemy-green/20"
            disabled={isProcessing}
            data-testid="bulk-import-textarea"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleBulkImport}
            disabled={!inputText.trim() || isProcessing || !mapboxToken}
            className="flex-1 bg-gradient-to-r from-kmlchemy-green to-kmlchemy-navy hover:from-kmlchemy-green/90 hover:to-kmlchemy-navy/90 text-white"
            data-testid="bulk-import-button"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import & Geocode
              </>
            )}
          </Button>
          {(inputText || showResults) && (
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={isProcessing}
              className="border-kmlchemy-green/20 text-kmlchemy-navy hover:bg-kmlchemy-green/10"
              data-testid="bulk-import-clear-button"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isProcessing && (
          <div className="space-y-2" data-testid="bulk-import-progress">
            <div className="flex items-center justify-between text-sm">
              <span className="text-kmlchemy-navy" data-testid="bulk-import-progress-text">Processing addresses...</span>
              <span className="text-kmlchemy-green font-medium" data-testid="bulk-import-progress-percentage">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2" data-testid="bulk-import-progress-bar">
              <div 
                className="bg-kmlchemy-green h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
                data-testid="bulk-import-progress-fill"
              />
            </div>
          </div>
        )}

        {showResults && results.length > 0 && (
          <div className="space-y-3" data-testid="bulk-import-results">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-700 font-medium" data-testid="bulk-import-success-count">{successCount} successful</span>
              </div>
              {errorCount > 0 && (
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-600 font-medium" data-testid="bulk-import-error-count">{errorCount} failed</span>
                </div>
              )}
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 border border-kmlchemy-green/10 rounded-lg p-3 bg-kmlchemy-green/5" data-testid="bulk-import-results-list">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-2 p-2 rounded text-sm",
                    result.status === 'success' && "bg-green-50 border border-green-200",
                    result.status === 'error' && "bg-red-50 border border-red-200",
                    result.status === 'pending' && "bg-gray-50 border border-gray-200"
                  )}
                  data-testid={`bulk-import-result-${index}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {result.status === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {result.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                    {result.status === 'pending' && <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-kmlchemy-navy" data-testid={`bulk-import-result-original-${index}`}>
                      {result.original}
                    </div>
                    {result.location && (
                      <div className="text-xs text-kmlchemy-green mt-1 truncate" data-testid={`bulk-import-result-location-${index}`}>
                        → {result.location.name} • {result.location.address}
                      </div>
                    )}
                    {result.error && (
                      <div className="text-xs text-red-600 mt-1" data-testid={`bulk-import-result-error-${index}`}>
                        {result.error}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {successCount > 0 && !isProcessing && (
              <Alert className="border-green-200 bg-green-50" data-testid="bulk-import-success-alert">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800" data-testid="bulk-import-success-message">
                  Successfully imported {successCount} location{successCount === 1 ? '' : 's'}! 
                  {errorCount > 0 && ` ${errorCount} address${errorCount === 1 ? '' : 'es'} could not be found.`}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}