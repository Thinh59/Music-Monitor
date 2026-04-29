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
          scrollWheelZoom: false,
          attributionControl: true,
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
  VN: [14.06, 108.28], JP: [36.2, 138.25], KR: [35.91, 127.77],
  TH: [15.87, 100.99], ID: [-0.79, 113.92], PH: [12.88, 121.77],
  IN: [20.59, 78.96], TW: [23.7, 120.96], SG: [1.35, 103.82],
  MY: [4.21, 101.97], CN: [35.86, 104.2],
  US: [37.09, -95.71], CA: [56.13, -106.35], BR: [-14.24, -51.93],
  MX: [23.63, -102.55], AR: [-38.42, -63.62], CO: [4.57, -74.3],
  CL: [-35.68, -71.54], PE: [-9.19, -75.02],
  GB: [55.38, -3.44], FR: [46.23, 2.21], DE: [51.17, 10.45],
  ES: [40.46, -3.75], IT: [41.87, 12.57], NL: [52.13, 5.29],
  SE: [60.13, 18.64], NO: [60.47, 8.47], PL: [51.92, 19.15],
  PT: [39.4, -8.22], BE: [50.5, 4.47], CH: [46.82, 8.23],
  AT: [47.52, 14.55], DK: [56.26, 9.5], FI: [61.92, 25.75],
  TR: [38.96, 35.24], RU: [61.52, 105.32],
  NG: [9.08, 8.68], ZA: [-30.56, 22.94], EG: [26.82, 30.8],
  AU: [-25.27, 133.78], NZ: [-40.9, 174.89],
};
