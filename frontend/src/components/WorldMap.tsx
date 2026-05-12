"use client";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import type { ClusterCountry } from "@/types";

const CLUSTER_COLORS = [
  "#a855f7", "#ec4899", "#f59e0b", "#10b981",
  "#3b82f6", "#ef4444", "#8b5cf6", "#14b8a6",
  "#f97316", "#84cc16",
];

const TILE_DARK = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_LIGHT = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

interface WorldMapProps {
  clusters: ClusterCountry[];
  onCountryClick?: (isoCode: string) => void;
}

export default function WorldMap({ clusters, onCountryClick }: WorldMapProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const mapRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<any>(null);

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === "dark" : true;
  const tileUrl = isDark ? TILE_DARK : TILE_LIGHT;
  const bg = isDark ? "rgb(26 27 30)" : "rgb(244 244 248)";

  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then((Lmod) => {
      const L = Lmod.default;

      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const container = document.getElementById("world-map") as any;
      if (!container) return;

      if (!mapRef.current) {
        if (container._leaflet_id) {
          container._leaflet_id = null;
          container.innerHTML = "";
        }
        const map = L.map("world-map", {
          center: [20, 0],
          zoom: 2,
          minZoom: 2,
          scrollWheelZoom: false,
          attributionControl: true,
          maxBounds: [[-90, -180], [90, 180]],
          maxBoundsViscosity: 1.0
        });
        tileLayerRef.current = L.tileLayer(tileUrl, {
          attribution: "&copy; OpenStreetMap &copy; CARTO",
          maxZoom: 19,
        }).addTo(map);

        markersRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;
      } else if (tileLayerRef.current) {
        // Theme switch — swap tile URL without rebuilding map
        tileLayerRef.current.setUrl(tileUrl);
      }

      markersRef.current.clearLayers();
      if (!clusters || clusters.length === 0) return;

      const labelColor = isDark ? "#888" : "#6e6e7d";

      clusters.forEach((c) => {
        const coords = COUNTRY_COORDS[c.iso_code];
        if (!coords) return;

        const color = CLUSTER_COLORS[c.cluster % CLUSTER_COLORS.length];
        const marker = L.circleMarker(coords, {
          radius: 10,
          fillColor: color,
          color: isDark ? "#fff" : "#222",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.85,
        });

        const displayName = c.country
          .split(" ")
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        marker.bindPopup(`
          <div style="min-width:180px;font-family:system-ui,sans-serif">
            <b style="font-size:13px">${displayName}</b>
            <br/><span style="color:${color};font-weight:600">● ${c.cluster_label}</span>
            <br/><small style="color:${labelColor}">Cluster ${c.cluster + 1}</small>
            <br/><small style="color:#a855f7;cursor:pointer;margin-top:4px;display:block">
              Click để xem top charts →
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
        mapRef.current = markersRef.current = tileLayerRef.current = null;
        const el = document.getElementById("world-map") as any;
        if (el) {
          el._leaflet_id = null;
          el.innerHTML = "";
        }
      }
    };
  }, [clusters, onCountryClick, tileUrl, isDark]);

  return (
    <div
      id="world-map"
      className="w-full rounded-xl overflow-hidden border border-border"
      style={{ height: "440px", background: bg }}
    />
  );
}

const COUNTRY_COORDS: Record<string, [number, number]> = {
  // Asia
  VN: [14.06, 108.28], JP: [36.2, 138.25], KR: [35.91, 127.77],
  TH: [15.87, 100.99], ID: [-0.79, 113.92], PH: [12.88, 121.77],
  IN: [20.59, 78.96], TW: [23.7, 120.96], SG: [1.35, 103.82],
  MY: [4.21, 101.97], CN: [35.86, 104.2], HK: [22.32, 114.17],
  MM: [21.91, 95.96], KH: [12.57, 104.99], LA: [19.86, 102.5],
  BD: [23.68, 90.36], PK: [30.38, 69.35], LK: [7.87, 80.77],
  NP: [28.39, 84.12], MN: [46.86, 103.85], KZ: [48.02, 66.92],
  // Middle East
  AE: [23.42, 53.85], SA: [23.89, 45.08], IL: [31.05, 34.85],
  IR: [32.43, 53.69], IQ: [33.22, 43.68], JO: [30.59, 36.24],
  LB: [33.85, 35.86],
  // Americas
  US: [37.09, -95.71], CA: [56.13, -106.35], BR: [-14.24, -51.93],
  MX: [23.63, -102.55], AR: [-38.42, -63.62], CO: [4.57, -74.3],
  CL: [-35.68, -71.54], PE: [-9.19, -75.02], VE: [6.42, -66.59],
  BO: [-16.29, -63.59], EC: [-1.83, -78.18], UY: [-32.52, -55.77],
  PY: [-23.44, -58.44], GT: [15.78, -90.23], CR: [9.75, -83.75],
  PA: [8.54, -80.78], PR: [18.22, -66.59], DO: [18.74, -70.16],
  JM: [18.11, -77.3], CU: [21.52, -77.78],
  // Europe
  GB: [55.38, -3.44], FR: [46.23, 2.21], DE: [51.17, 10.45],
  ES: [40.46, -3.75], IT: [41.87, 12.57], NL: [52.13, 5.29],
  SE: [60.13, 18.64], NO: [60.47, 8.47], PL: [51.92, 19.15],
  PT: [39.4, -8.22], BE: [50.5, 4.47], CH: [46.82, 8.23],
  AT: [47.52, 14.55], DK: [56.26, 9.5], FI: [61.92, 25.75],
  TR: [38.96, 35.24], RU: [61.52, 105.32], IE: [53.41, -8.24],
  IS: [64.96, -19.02], GR: [39.07, 21.82], CZ: [49.82, 15.47],
  HU: [47.16, 19.5], RO: [45.94, 24.97], SK: [48.67, 19.7],
  HR: [45.1, 15.2], BG: [42.73, 25.49], RS: [44.02, 21.0],
  UA: [48.38, 31.17],
  // Africa
  NG: [9.08, 8.68], ZA: [-30.56, 22.94], EG: [26.82, 30.8],
  KE: [-0.02, 37.91], MA: [31.79, -7.09], DZ: [28.03, 1.66],
  TN: [33.89, 9.54], ET: [9.15, 40.49], GH: [7.95, -1.03],
  SN: [14.5, -14.45], CI: [7.54, -5.55], TZ: [-6.37, 34.89],
  UG: [1.37, 32.29], ZW: [-19.02, 29.15],
  // Oceania
  AU: [-25.27, 133.78], NZ: [-40.9, 174.89], FJ: [-17.71, 178.07],
};
