import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { CircleMarker, GeoJSON, MapContainer, Popup } from "react-leaflet";
import { api } from "../api";
import LoadingScreen from "../components/LoadingScreen";
import PageTransition from "../components/PageTransition";
import { indiaRecognizedWorldGeo, layerColors, mapCountryStyle, toFruitMapMarkers } from "../data/geoMapData";

export default function MapsPage() {
  const [payload, setPayload] = useState(null);
  const [layer, setLayer] = useState("Growing");

  useEffect(() => {
    api.get("/fruits/maps/production").then(({ data }) => setPayload(data)).catch(() => setPayload({ fruits: [], regions: [] }));
  }, []);

  const markers = useMemo(() => toFruitMapMarkers(payload?.fruits || []).filter((item) => item.layer === layer), [payload, layer]);

  if (!payload) return <LoadingScreen />;

  return (
    <PageTransition className="page-shell pb-24 pt-8">
      <div className="mb-10 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.28em] text-amber-200">Fruit geography</p>
          <h1 className="mt-3 text-5xl font-black sm:text-7xl">Growing, export, and import regions on an interactive world map.</h1>
          <p className="mt-5 leading-7 text-white/60">
            Locations are shown in English on a clean vector geopolitical map with fruit growing, export, and import layers.
          </p>
        </div>
        <div className="glass rounded-3xl p-5">
          <p className="text-sm text-white/52">Visible geographic points</p>
          <p className="text-4xl font-black">{markers.length}</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {["Growing", "Export", "Import"].map((item) => (
          <button
            key={item}
            onClick={() => setLayer(item)}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${layer === item ? "bg-white text-night" : "bg-white/10 text-white/70 hover:bg-white/15"}`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="glass overflow-hidden rounded-[2.5rem] p-3">
        <div className="mb-3 flex flex-wrap gap-4 px-3 text-sm text-white/70">
          <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-emerald-400" />Growing regions</span>
          <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-blue-400" />Export destinations</span>
          <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-orange-400" />Import dependency</span>
        </div>
        <MapContainer center={[20, 20]} zoom={2} minZoom={2} maxZoom={6} scrollWheelZoom className="h-[660px] w-full rounded-[2rem]">
          <GeoJSON data={indiaRecognizedWorldGeo} style={mapCountryStyle} />
          {markers.map((marker) => (
            <CircleMarker
              key={`${marker.slug}-${marker.layer}-${marker.country}`}
              center={marker.coords}
              radius={layer === "Growing" ? 11 : 8}
              pathOptions={{ color: layerColors[marker.layer], fillColor: layerColors[marker.layer], fillOpacity: 0.44, weight: 2 }}
            >
              <Popup>
                <strong>{marker.name}</strong>
                <br />
                {marker.layer}: {marker.country}
                <br />
                {marker.scientificName}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {payload.fruits.slice(0, 9).map((fruit) => (
          <motion.div key={fruit.slug} whileHover={{ y: -6 }} className="glass rounded-[2rem] p-5">
            <p className="font-display text-2xl font-bold" style={{ color: fruit.color }}>{fruit.name}</p>
            <p className="mt-3 text-sm leading-6 text-white/58">{fruit.climateZones?.join(", ")}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/35">{fruit.productionRegions?.slice(0, 4).join(" / ")}</p>
          </motion.div>
        ))}
      </div>
    </PageTransition>
  );
}
