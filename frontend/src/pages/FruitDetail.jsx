import { motion } from "framer-motion";
import { AlertTriangle, Archive, Beaker, CalendarDays, Clock, HeartPulse, Leaf, MapPin, Pill, Sparkles, Utensils } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CircleMarker, GeoJSON, MapContainer, Popup } from "react-leaflet";
import { useParams } from "react-router-dom";
import { api } from "../api";
import FruitImage from "../components/FruitImage";
import LoadingScreen from "../components/LoadingScreen";
import { MacroRadar } from "../components/NutritionChart";
import PageTransition from "../components/PageTransition";
import { fallbackFruits } from "../data/fallback";
import { countryCoordinates, indiaRecognizedWorldGeo, layerColors, mapCountryStyle } from "../data/geoMapData";

const cleanNutrition = (fruit) => {
  const live = fruit.liveNutrition?.nutrients || {};
  return {
    calories: live.calories ?? fruit.nutrition?.calories,
    carbs: live.carbs ?? fruit.nutrition?.carbs,
    fiber: live.fiber ?? fruit.nutrition?.fiber,
    sugar: live.sugar ?? fruit.nutrition?.sugar,
    protein: live.protein ?? fruit.nutrition?.protein,
    fat: live.fat ?? fruit.nutrition?.fat
  };
};

export default function FruitDetail() {
  const { slug } = useParams();
  const [fruit, setFruit] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setFruit(null);
    setError("");
    api.get(`/fruits/${slug}`)
      .then(({ data }) => setFruit(data.fruit))
      .catch((err) => {
        setError(err.response?.data?.message || "No verified live data available");
        setFruit(fallbackFruits.find((item) => item.slug === slug) || fallbackFruits[0]);
      });
  }, [slug]);

  const nutrition = useMemo(() => (fruit ? cleanNutrition(fruit) : {}), [fruit]);
  const mapMarkers = useMemo(() => {
    if (!fruit) return [];
    return [
      ...(fruit.productionRegions || []).map((country) => ({ country, type: "Production" })),
      ...(fruit.exportRegions || []).map((country) => ({ country, type: "Export" })),
      ...(fruit.importRegions || []).map((country) => ({ country, type: "Import" }))
    ].map((item) => ({ ...item, point: countryCoordinates[item.country] })).filter((item) => item.point);
  }, [fruit]);

  if (!fruit) return <LoadingScreen />;

  const panels = [
    { icon: HeartPulse, title: "Health benefits", list: fruit.benefits || [] },
    { icon: Beaker, title: "Scientific explanations", list: fruit.science || fruit.scientificFacts || [] },
    { icon: AlertTriangle, title: "Allergies and side effects", list: [...(fruit.allergies || []), ...(fruit.sideEffects || [])] },
    { icon: Pill, title: "Drug interaction warnings", list: fruit.drugInteractions || [] },
    { icon: Leaf, title: "Who should avoid", list: fruit.avoidFor || [] },
    { icon: Archive, title: "Storage methods", list: fruit.storage || [] }
  ];

  return (
    <PageTransition>
      <section className="page-shell grid gap-8 pb-16 pt-8 lg:grid-cols-[1.05fr_.95fr]">
        <div className="relative overflow-hidden rounded-[2.5rem]">
          <FruitImage src={fruit.image} alt={fruit.name} className="h-[650px] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/20 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <p className="text-sm uppercase tracking-[0.28em] text-white/58">{fruit.scientificName}</p>
            <h1 className="mt-3 font-display text-6xl font-bold sm:text-8xl">{fruit.name}</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/70">{fruit.culture}</p>
          </div>
        </div>

        <div className="grid content-start gap-5">
          {error && <div className="rounded-3xl border border-red-300/20 bg-red-500/10 p-4 text-red-100">{error}</div>}
          <div className="glass rounded-[2rem] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-white/42">Nutrition source</p>
                <h2 className="mt-2 text-2xl font-bold">{fruit.liveNutrition?.source || "Fruitora nutrition profile"}</h2>
                <p className="mt-2 text-sm text-white/48">{fruit.liveNutrition?.description || `${fruit.name} per 100g edible portion`}</p>
              </div>
              <div className="grid h-16 w-16 place-items-center rounded-full" style={{ background: `${fruit.color}33`, color: fruit.color }}>
                <Sparkles />
              </div>
            </div>
          </div>
          <div className="glass rounded-[2rem] p-6">
            <h2 className="text-2xl font-bold">Complete nutrition profile</h2>
            <div className="mt-4 h-[320px]">
              <MacroRadar nutrition={nutrition} color={fruit.color} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(nutrition).map(([key, value]) => (
              <motion.div whileHover={{ scale: 1.03 }} key={key} className="glass rounded-3xl p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-white/38">{key}</p>
                <p className="mt-2 text-3xl font-black">{value ?? "No verified live data available"}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell grid gap-5 pb-16 md:grid-cols-4">
        <Info icon={CalendarDays} label="Season" value={fruit.seasonality?.India || fruit.seasonality?.global} />
        <Info icon={Clock} label="Best timing" value={fruit.timing} />
        <Info icon={Leaf} label="Glycemic index" value={fruit.glycemicIndex?.value ? `${fruit.glycemicIndex.value} (${fruit.glycemicIndex.category})` : fruit.glycemicIndex?.category} />
        <Info icon={MapPin} label="Climate" value={fruit.climateZones?.join(", ")} />
      </section>

      <section className="page-shell grid gap-5 pb-16 md:grid-cols-2">
        {panels.map(({ icon: Icon, title, list }) => (
          <motion.div key={title} whileHover={{ y: -8 }} className="glass rounded-[2rem] p-7">
            <Icon className="text-amber-200" />
            <h3 className="mt-4 text-2xl font-bold">{title}</h3>
            <div className="mt-5 grid gap-3">
              {(list.length ? list : ["No verified live data available"]).map((item) => (
                <p key={item} className="rounded-2xl bg-white/7 p-4 leading-7 text-white/66">{item}</p>
              ))}
            </div>
          </motion.div>
        ))}
      </section>

      <section className="page-shell grid gap-6 pb-16 lg:grid-cols-[.9fr_1.1fr]">
        <div className="glass rounded-[2rem] p-6">
          <h2 className="text-3xl font-black">Varieties and market identity</h2>
          <div className="mt-5 grid gap-4">
            {fruit.varieties.map((variety) => (
              <div key={variety.name} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <h3 className="text-xl font-bold" style={{ color: fruit.color }}>{variety.name}</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">{variety.taste} texture: {variety.texture || "varies"}. Region: {variety.region}. Season: {variety.season}.</p>
                <p className="mt-2 text-sm text-white/45">{variety.uniqueness} {variety.marketValue && `Market: ${variety.marketValue}.`} {variety.exportPopularity && `Export: ${variety.exportPopularity}.`}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass overflow-hidden rounded-[2rem] p-3">
          <div className="mb-3 flex flex-wrap gap-3 px-2 text-sm text-white/70">
            <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-emerald-400" />Growing regions</span>
            <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-blue-400" />Export destinations</span>
            <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-orange-400" />Import dependency</span>
          </div>
          <MapContainer center={[20, 40]} zoom={2} minZoom={2} maxZoom={6} scrollWheelZoom className="h-[560px] w-full rounded-[1.5rem]">
            <GeoJSON data={indiaRecognizedWorldGeo} style={mapCountryStyle} />
            {mapMarkers.map((marker) => (
              <CircleMarker key={`${marker.type}-${marker.country}`} center={marker.point} radius={marker.type === "Production" ? 12 : 8} pathOptions={{ color: layerColors[marker.type], fillColor: layerColors[marker.type], fillOpacity: 0.48, weight: 2 }}>
                <Popup>{fruit.name}<br />{marker.type}: {marker.country}</Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </section>

      <section className="page-shell pb-24">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-amber-200">Fruit recipes</p>
            <h2 className="mt-3 text-4xl font-black">Traditional, modern, juice, smoothie, and meal uses</h2>
          </div>
          <Utensils className="text-white/40" />
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {(fruit.recipes?.length ? fruit.recipes : []).map((recipe) => (
            <motion.article key={recipe.id} whileHover={{ y: -8 }} className="glass rounded-[2rem] p-6">
              <p className="text-sm uppercase tracking-[0.2em]" style={{ color: fruit.color }}>{recipe.category}</p>
              <h3 className="mt-3 text-2xl font-bold">{recipe.title}</h3>
              <p className="mt-4 text-sm leading-6 text-white/62">{recipe.method}</p>
              <p className="mt-4 rounded-2xl bg-white/7 p-3 text-sm text-white/52">{recipe.note}</p>
            </motion.article>
          ))}
        </div>
      </section>
    </PageTransition>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="glass rounded-[2rem] p-5">
      <Icon className="text-amber-200" />
      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/38">{label}</p>
      <p className="mt-2 text-sm leading-6 text-white/70">{value || "No verified live data available"}</p>
    </div>
  );
}
