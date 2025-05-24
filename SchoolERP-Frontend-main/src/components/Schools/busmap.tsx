// Add declaration for leaflet
declare module 'leaflet';
declare module 'react-leaflet';

import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Bus } from './BusTrackingContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix the icon issue with Leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Create a custom interface that extends the Bus type with the properties needed for the map
interface BusMapData {
  id: string;
  location: [number, number]; // Latitude and longitude
  route?: Array<[number, number]>; // Route as array of [lat, lng] points
  routeNumber: string;
  driverName?: string;
  speed?: number;
  fuelLevel?: number;
  nextStop?: string;
  estimatedArrival?: string;
  status: 'active' | 'maintenance' | 'inactive';
}

interface BusMapProps {
  buses: BusMapData[];
  selectedBus: BusMapData | null;
  onBusSelect: (bus: BusMapData) => void;
}

// This component handles updating the map view when the selected bus changes
const MapController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
};

const BusMap: React.FC<BusMapProps> = ({ buses, selectedBus, onBusSelect }) => {
  // @ts-ignore - Ignoring the type error for MapContainer props
  return (
    <MapContainer
      center={selectedBus?.location || [28.7041, 77.1025]}
      zoom={13}
      className="h-[700px] rounded-lg shadow-lg"
      style={{ height: '500px', width: '100%' }}
    >
      {selectedBus && <MapController center={selectedBus.location} />}
      
      {/* @ts-ignore - Ignoring the type error for TileLayer props */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {buses.map((bus) => (
        <React.Fragment key={bus.id}>
          <Marker
            position={bus.location}
            eventHandlers={{ click: () => onBusSelect(bus) }}
          >
            <Popup>
              <BusPopupContent bus={bus} />
            </Popup>
          </Marker>
          {bus.route && (
            <Polyline
              pathOptions={{ color: bus.status === 'active' ? '#22c55e' : '#ef4444' }}
              positions={bus.route}
            />
          )}
        </React.Fragment>
      ))}
    </MapContainer>
  );
};

const BusPopupContent: React.FC<{ bus: BusMapData }> = ({ bus }) => (
  <div className="p-3">
    <h3 className="font-bold text-lg">Bus {bus.routeNumber}</h3>
    <div className="grid grid-cols-2 gap-2 mt-2">
      <div>
        <p className="text-sm font-semibold">Driver</p>
        <p className="text-sm">{bus.driverName || 'Not assigned'}</p>
      </div>
      <div>
        <p className="text-sm font-semibold">Status</p>
        <p className="text-sm">{bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}</p>
      </div>
      <div>
        <p className="text-sm font-semibold">Speed</p>
        <p className="text-sm">{bus.speed || 0} km/h</p>
      </div>
      <div>
        <p className="text-sm font-semibold">Fuel</p>
        <p className="text-sm">{bus.fuelLevel || 0}%</p>
      </div>
    </div>
    <div className="mt-2">
      <p className="text-sm font-semibold">Next Stop</p>
      <p className="text-sm">{bus.nextStop || 'N/A'}</p>
      <p className="text-sm text-gray-500">ETA: {bus.estimatedArrival || 'N/A'}</p>
    </div>
  </div>
);

export default BusMap;