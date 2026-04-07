"use client";
import { useEffect, useRef, useState } from "react";
import type { ClusterCountry } from "@/types";

const CLUSTER_COLORS = [
  "#6366f1","#ec4899","#f59e0b","#10b981",
  "#3b82f6","#ef4444","#8b5cf6","#14b8a6",
  "#f97316","#84cc16",
];

interface WorldMapProps {
  clusters:       ClusterCountry[];
  onCountryClick?: (isoCode: string) => void;
}

export default function WorldMap({ clusters, onCountryClick }: WorldMapProps) {
  const mapRef     = useRef<any>(null);
  const markersRef = useRef<any>(null);

  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id   = "leaflet-css";
      link.rel  = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then((Lmod) => {
      const L = Lmod.default;

      // Fix icon broken in Next.js
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const container = document.getElementById("world-map") as any;
      if (!container) return;

      // ── Init map only once ──────────────────────────────────────────────
      if (!mapRef.current) {
        if (container._leaflet_id) {
          container._leaflet_id = null;
          container.innerHTML   = "";
        }
        const map = L.map("world-map", {
          center: [20, 0], zoom: 2,
          scrollWheelZoom: false,
          attributionControl: true,
        });
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          maxZoom: 19,
        }).addTo(map);

        markersRef.current = L.layerGroup().addTo(map);
        mapRef.current     = map;
      }

      // ── Clear + redraw markers ──────────────────────────────────────────
      markersRef.current.clearLayers();

      if (!clusters || clusters.length === 0) {
        console.warn("[WorldMap] clusters rỗng");
        return;
      }
      console.log(`[WorldMap] Vẽ ${clusters.length} markers`);

      clusters.forEach((c) => {
        const coords = COUNTRY_COORDS[c.iso_code];
        if (!coords) return;

        const color  = CLUSTER_COLORS[c.cluster % CLUSTER_COLORS.length];
        const marker = L.circleMarker(coords, {
          radius: 10, fillColor: color,
          color: "#fff", weight: 2,
          opacity: 1, fillOpacity: 0.85,
        });

        const displayName = c.country.split(" ")
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        marker.bindPopup(`
          <div style="min-width:180px;font-family:system-ui,sans-serif">
            <b style="font-size:13px">${displayName}</b>
            <br/><span style="color:${color};font-weight:600">● ${c.cluster_label}</span>
            <br/><small style="color:#888">Cluster ${c.cluster + 1}</small>
            <br/><small style="color:#6366f1;cursor:pointer;margin-top:4px;display:block">
              🎵 Click để xem top charts →
            </small>
          </div>
        `);

        marker.addTo(markersRef.current);
        if (onCountryClick) {
          marker.on("click", () => onCountryClick(c.iso_code));
        }
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = markersRef.current = null;
        const el = document.getElementById("world-map") as any;
        if (el) { el._leaflet_id = null; el.innerHTML = ""; }
      }
    };
  }, [clusters, onCountryClick]);

  return (
    <div
      id="world-map"
      className="w-full rounded-xl overflow-hidden border border-gray-700"
      style={{ height: "440px", background: "#1a1b1e" }}
    />
  );
}

// ── Toạ độ 40+ quốc gia ─────────────────────────────────────────────────────
const COUNTRY_COORDS: Record<string, [number, number]> = {
  // Asia
  VN:[ 14.06, 108.28], JP:[ 36.20, 138.25], KR:[ 35.91, 127.77],
  TH:[ 15.87, 100.99], ID:[ -0.79, 113.92], PH:[ 12.88, 121.77],
  IN:[ 20.59,  78.96], TW:[ 23.70, 120.96], SG:[  1.35, 103.82],
  MY:[  4.21, 101.97], CN:[ 35.86, 104.20],
  // Americas
  US:[ 37.09, -95.71], CA:[ 56.13,-106.35], BR:[-14.24, -51.93],
  MX:[ 23.63,-102.55], AR:[-38.42, -63.62], CO:[  4.57, -74.30],
  CL:[-35.68, -71.54], PE:[ -9.19, -75.02],
  // Europe
  GB:[ 55.38,  -3.44], FR:[ 46.23,   2.21], DE:[ 51.17,  10.45],
  ES:[ 40.46,  -3.75], IT:[ 41.87,  12.57], NL:[ 52.13,   5.29],
  SE:[ 60.13,  18.64], NO:[ 60.47,   8.47], PL:[ 51.92,  19.15],
  PT:[ 39.40,  -8.22], BE:[ 50.50,   4.47], CH:[ 46.82,   8.23],
  AT:[ 47.52,  14.55], DK:[ 56.26,   9.50], FI:[ 61.92,  25.75],
  TR:[ 38.96,  35.24], RU:[ 61.52,  105.32],
  // Africa / Middle East
  NG:[  9.08,   8.68], ZA:[-30.56,  22.94], EG:[ 26.82,  30.80],
  // Oceania
  AU:[-25.27, 133.78], NZ:[-40.90, 174.89],
};