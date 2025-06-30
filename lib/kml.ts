import { Location } from './types';

export function generateKML(locations: Location[]): string {
  const placemarks = locations
    .map((location) => {
      const { name, address, coordinates } = location;
      const { longitude, latitude } = coordinates;
      
      return `    <Placemark>
      <name><![CDATA[${name}]]></name>
      <description><![CDATA[${address}]]></description>
      <Point>
        <coordinates>${longitude},${latitude},0</coordinates>
      </Point>
    </Placemark>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>KMLchemy Export</name>
    <description>Places exported from KMLchemy - Transform your searches into powerful KML files</description>
${placemarks}
  </Document>
</kml>`;
}

export function downloadKML(locations: Location[], filename: string = 'kmlchemy_export.kml'): void {
  if (locations.length === 0) {
    throw new Error('No locations to export');
  }

  const kmlContent = generateKML(locations);
  const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}