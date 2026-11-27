import React, { useState } from 'react';
import { ExternalLink, Navigation } from 'lucide-react';

interface MapComponentProps {
  userLat: number;
  userLng: number;
  destLat: number;
  destLng: number;
  officeName: string;
  distanceText?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({
  userLat,
  userLng,
  destLat,
  destLng,
  officeName,
  distanceText,
}) => {
  // Only enable Google Maps Embed if a real key is present (Google keys begin with "AIza")
  const rawKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
  const hasValidGoogleKey = Boolean(rawKey && rawKey.startsWith('AIza') && rawKey.length > 20);
  const googleMapsKey = hasValidGoogleKey ? rawKey : '';
  
  // Google Maps navigation redirect URL
  const googleMapsNavUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destLat},${destLng}&travelmode=driving`;

  // HTML content for Leaflet map embedded inside an iframe
  // This avoids build tool clashes with Leaflet NPM assets.
  const leafletSrcDoc = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="referrer" content="strict-origin-when-cross-origin">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; font-family: -apple-system, sans-serif; background: #0f1b35; }
        .popup-label { font-weight: bold; font-size: 12px; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const uLat = ${userLat};
        const uLng = ${userLng};
        const dLat = ${destLat};
        const dLng = ${destLng};

        // Initialize map
        const map = L.map('map', { zoomControl: false }).setView([uLat, uLng], 12);
        
        // Add zoom control to bottom right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Wikimedia tiles: 100% free, high-speed, zero API key required, no "API KEY REQUIRED" watermark
        const primaryTileLayer = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          attribution: '© Wikimedia Foundation, © OpenStreetMap contributors'
        });

        // OpenStreetMap mirror fallback
        const fallbackTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team'
        });

        // OpenTopoMap 2nd fallback
        const topoTileLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          maxZoom: 17,
          attribution: '© OpenStreetMap contributors, SRTM'
        });

        primaryTileLayer.on('tileerror', function() {
          if (!map.hasLayer(fallbackTileLayer)) {
            fallbackTileLayer.addTo(map);
          }
        });

        fallbackTileLayer.on('tileerror', function() {
          if (!map.hasLayer(topoTileLayer)) {
            topoTileLayer.addTo(map);
          }
        });

        primaryTileLayer.addTo(map);

        // Styled HTML Markers
        const userMarkerHtml = \`
          <div style="
            background-color: #2563eb; 
            width: 14px; 
            height: 14px; 
            border-radius: 50%; 
            border: 3px solid white; 
            box-shadow: 0 0 8px rgba(37,99,235,0.6);
            position: relative;
          ">
            <div style="
              position: absolute;
              top: -3px; left: -3px;
              width: 14px; height: 14px;
              border-radius: 50%;
              border: 3px solid #2563eb;
              animation: pulse 2s infinite;
              opacity: 0;
            "></div>
          </div>
        \`;

        const officeMarkerHtml = \`
          <div style="
            background-color: #dc2626; 
            width: 14px; 
            height: 14px; 
            border-radius: 50%; 
            border: 3px solid white; 
            box-shadow: 0 0 8px rgba(220,38,38,0.6);
          "></div>
        \`;

        const userIcon = L.divIcon({
          html: userMarkerHtml,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const officeIcon = L.divIcon({
          html: officeMarkerHtml,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const uMarker = L.marker([uLat, uLng], { icon: userIcon }).addTo(map)
          .bindPopup("<div class='popup-label'>Your Location</div>");
        
        const oMarker = L.marker([dLat, dLng], { icon: officeIcon }).addTo(map)
          .bindPopup("<div class='popup-label'>${officeName.replace(/"/g, '&quot;')}</div>");

        // Fit bound on markers initially
        const group = new L.featureGroup([uMarker, oMarker]);
        map.fitBounds(group.getBounds().pad(0.2));

        // Fetch routing geometry from public OSRM API
        const routingUrl = \`https://router.project-osrm.org/route/v1/driving/\${uLng},\${uLat};\${dLng},\${dLat}?geometries=geojson\`;
        
        fetch(routingUrl)
          .then(res => res.json())
          .then(data => {
            if (data.routes && data.routes.length > 0) {
              const routeCoords = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
              const routeLine = L.polyline(routeCoords, {
                color: '#2563eb',
                weight: 5,
                opacity: 0.75,
                lineJoin: 'round'
              }).addTo(map);

              // Refit bounds with the actual route
              map.fitBounds(routeLine.getBounds().pad(0.15));
            } else {
              // Direct straight line fallback
              drawStraightLine();
            }
          })
          .catch(err => {
            console.error('OSRM route fetching failed, drawing straight line.', err);
            drawStraightLine();
          });

        function drawStraightLine() {
          const fallbackLine = L.polyline([[uLat, uLng], [dLat, dLng]], {
            color: '#dc2626',
            weight: 3,
            opacity: 0.6,
            dashArray: '5, 8'
          }).addTo(map);
          map.fitBounds(fallbackLine.getBounds().pad(0.2));
        }
      </script>
      <style>
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); opacity: 0.8; }
          70% { transform: scale(1.6); box-shadow: 0 0 0 10px rgba(37, 99, 235, 0); opacity: 0; }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); opacity: 0; }
        }
      </style>
    </body>
    </html>
  `;

  const [mapMode, setMapMode] = useState<'google' | 'osm'>('google');

  // Google Maps Free Direct Directions embed URL (requires NO API key!)
  const googleMapsDirectionsEmbedUrl = `https://www.google.com/maps?saddr=${userLat},${userLng}&daddr=${destLat},${destLng}&output=embed`;

  return (
    <div className="relative w-full h-[380px] md:h-[440px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm dark:border-slate-800 bg-[#0f1b35]">
      
      {mapMode === 'google' ? (
        // Direct Google Maps Directions Embed (No API key required)
        <iframe
          title="Google Maps Driving Route"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={googleMapsDirectionsEmbedUrl}
        />
      ) : (
        // Interactive OSM / Leaflet mode
        <iframe
          title="OpenStreetMap Driving Route"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          srcDoc={leafletSrcDoc}
          sandbox="allow-scripts allow-same-origin"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      )}

      {/* Floating navigation utilities */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <a
          href={googleMapsNavUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-extrabold text-slate-800 shadow-md hover:bg-slate-50 border border-slate-100 transition-all dark:bg-[#0f1b35] dark:text-slate-100 dark:border-slate-800 dark:hover:bg-[#152445]"
        >
          <Navigation className="h-4 w-4 text-govBlue-600 dark:text-sky-400 fill-govBlue-600/10" />
          <span>Start Navigation</span>
          <ExternalLink className="h-3 w-3 text-slate-400" />
        </a>

        {/* View Switcher: Google vs OpenStreetMap */}
        <div className="flex rounded-xl bg-white/90 p-1 shadow-md backdrop-blur-md border border-slate-200 dark:bg-[#0f1b35]/90 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setMapMode('google')}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
              mapMode === 'google'
                ? 'bg-govBlue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Google Route
          </button>
          <button
            type="button"
            onClick={() => setMapMode('osm')}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
              mapMode === 'osm'
                ? 'bg-govBlue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            OpenStreetMap
          </button>
        </div>
      </div>

      {distanceText && (
        <div className="absolute bottom-4 left-4 z-10 rounded-xl bg-slate-900/90 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-white shadow-lg flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Approx. Distance: {distanceText}</span>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
