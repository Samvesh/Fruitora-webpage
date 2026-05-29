import { motion } from "framer-motion";
import { Clock3, Landmark, Route, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api";
import FruitImage from "../components/FruitImage";
import LoadingScreen from "../components/LoadingScreen";
import PageTransition from "../components/PageTransition";

export default function HistoryPage() {
  const [items, setItems] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.get("/fruits/history").then(({ data }) => setItems(data.history)).catch(() => setItems([]));
  }, []);

  if (!items) return <LoadingScreen />;

  return (
    <PageTransition className="page-shell pb-24 pt-8">
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.28em] text-amber-200">Fruit civilizations</p>
        <h1 className="mt-3 text-5xl font-black sm:text-7xl">Ancient origins, cultural rituals, global spread.</h1>
      </div>

      <div className="glass mt-8 flex max-w-2xl items-center gap-3 rounded-full p-2">
        <Search className="ml-4 text-white/45" size={21} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search fruit history"
          className="min-w-0 flex-1 bg-transparent py-3 text-white outline-none placeholder:text-white/36"
        />
      </div>

      <div className="mt-12 grid gap-6">
        {items.filter((fruit) => [fruit.name, fruit.origin, fruit.culture].join(" ").toLowerCase().includes(query.toLowerCase())).map((fruit, index) => (
          <motion.article
            key={fruit.slug}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="glass grid overflow-hidden rounded-[2rem] lg:grid-cols-[360px_1fr]"
          >
            <div className="relative min-h-[300px]">
              <FruitImage src={fruit.image} alt={fruit.name} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-night/80 to-transparent" />
              <h2 className="absolute bottom-6 left-6 font-display text-5xl font-bold">{fruit.name}</h2>
            </div>
            <div className="p-7">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl bg-white/7 p-5">
                  <Route className="text-amber-200" />
                  <p className="mt-3 text-sm text-white/48">Origin</p>
                  <p className="mt-1 font-semibold">{fruit.origin}</p>
                </div>
                <div className="rounded-3xl bg-white/7 p-5 md:col-span-2">
                  <Landmark className="text-amber-200" />
                  <p className="mt-3 text-sm text-white/48">Cultural significance</p>
                  <p className="mt-1 leading-7 text-white/70">{fruit.culture}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-4">
                {fruit.timeline?.map((event) => (
                  <div key={`${fruit.slug}-${event.year}`} className="flex gap-4 rounded-3xl border border-white/10 bg-black/18 p-4">
                    <Clock3 className="mt-1 shrink-0 text-white/46" size={18} />
                    <div>
                      <p className="font-bold" style={{ color: fruit.color }}>{event.year}</p>
                      <p className="mt-1 text-white/66">{event.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </PageTransition>
  );
}
