// src/components/MusicMap.tsx
"use client";
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const cities = [
  { name: "HCMC", lat: 10.8231, lng: 106.6297, intensity: 20 },
  { name: "New York", lat: 40.7128, lng: -74.0060, intensity: 35 },
  { name: "London", lat: 51.5074, lng: -0.1278, intensity: 25 },
];

export default function MusicMap() {
  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-gray-800">
      <MapContainer center={[20, 0] as any} zoom={2} style={{ height: '100%', width: '100%', background: '#0c0d0f' }}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        {cities.map((city, idx) => (
          <CircleMarker key={idx} center={[city.lat, city.lng]} radius={city.intensity} pathOptions={{ color: '#a855f7', fillColor: '#a855f7', fillOpacity: 0.5 }}>
            <Popup>{city.name}: Top Trending</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}