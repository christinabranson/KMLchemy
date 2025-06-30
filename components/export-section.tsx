'use client';

import { useState } from 'react';
import { Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { downloadKML } from '@/lib/kml';
import { Location } from '@/lib/types';

interface ExportSectionProps {
  locations: Location[];
}

export function ExportSection({ locations }: ExportSectionProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleExport = async () => {
    if (locations.length === 0) return;

    setIsExporting(true);
    setExportStatus('idle');

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `kmlchemy_export_${timestamp}.kml`;
      
      downloadKML(locations, filename);
      setExportStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="border-kmlchemy-green/20 shadow-sm bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-kmlchemy-navy">
          <FileText className="h-5 w-5 text-kmlchemy-green" />
          Export to KML
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Transform your selected locations into a KML file that can be opened in Google Earth, 
          Google Maps, or other mapping applications. Perfect for sharing routes, marking points of interest, 
          or creating custom maps.
        </div>

        {exportStatus === 'success' && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              KML file exported successfully! Your locations have been transformed into a portable map file.
            </AlertDescription>
          </Alert>
        )}

        {exportStatus === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to export KML file. Please try again.
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleExport}
          disabled={locations.length === 0 || isExporting}
          className="w-full bg-gradient-to-r from-kmlchemy-green to-kmlchemy-navy hover:from-kmlchemy-green/90 hover:to-kmlchemy-navy/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
          size="lg"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Transforming...' : `Export ${locations.length} Location${locations.length === 1 ? '' : 's'}`}
        </Button>

        {locations.length === 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Add some locations to enable KML transformation
          </p>
        )}
      </CardContent>
    </Card>
  );
}