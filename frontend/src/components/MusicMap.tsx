"use client";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

const cities = [
  { name: "HCMC", lat: 10.8231, lng: 106.6297, intensity: 20 },
  { name: "New York", lat: 40.7128, lng: -74.006, intensity: 35 },
  { name: "London", lat: 51.5074, lng: -0.1278, intensity: 25 },
];

const TILE_DARK = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_LIGHT = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

export default function MusicMap() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === "dark" : true;
  const bg = isDark ? "rgb(12 13 15)" : "rgb(244 244 248)";
  const tileUrl = isDark ? TILE_DARK : TILE_LIGHT;

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-border">
      <MapContainer
        center={[20, 0] as any}
        zoom={2}
        style={{ height: "100%", width: "100%", background: bg }}
      >
        <TileLayer url={tileUrl} key={tileUrl} />
        {cities.map((city, idx) => (
          <CircleMarker
            key={idx}
            center={[city.lat, city.lng]}
            radius={city.intensity}
            pathOptions={{ color: "#a855f7", fillColor: "#a855f7", fillOpacity: 0.5 }}
          >
            <Popup>{city.name}: Top Trending</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
