import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Brain, Globe2, Search, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import FruitCard from "../components/FruitCard";
import FruitImage from "../components/FruitImage";
import LoadingScreen from "../components/LoadingScreen";
import PageTransition from "../components/PageTransition";
import { fallbackFruits } from "../data/fallback";

export default function Home() {
  const [fruits, setFruits] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, 130]);
  const heroScale = useTransform(scrollYProgress, [0, 0.35], [1, 0.92]);

  useEffect(() => {
    api.get("/fruits/trending")
      .then(({ data }) => setFruits(data.fruits))
      .catch(() => setFruits(fallbackFruits))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!query) return fruits;
    return fruits.filter((fruit) => fruit.name.toLowerCase().includes(query.toLowerCase()));
  }, [fruits, query]);

  if (loading) return <LoadingScreen />;

  return (
    <PageTransition>
      <section className="relative -mt-24 min-h-screen overflow-hidden pt-24">
        <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0">
          <div className="absolute inset-0 bg-radial-stage" />
          <motion.div animate={{ x: [0, 38, 0], y: [0, -26, 0] }} transition={{ repeat: Infinity, duration: 8 }} className="orb absolute left-[8%] top-[24%] h-56 w-56 rounded-full bg-amber-300/35" />
          <motion.div animate={{ x: [0, -44, 0], y: [0, 36, 0] }} transition={{ repeat: Infinity, duration: 10 }} className="orb absolute right-[12%] top-[18%] h-64 w-64 rounded-full bg-fuchsia-400/30" />
          <motion.div animate={{ y: [0, -30, 0], rotate: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 7 }} className="absolute bottom-[18%] left-[12%] hidden h-28 w-28 rounded-[2rem] bg-white/10 backdrop-blur-2xl md:block" />
        </motion.div>

        <div className="page-shell relative grid min-h-[calc(100vh-96px)] items-center gap-12 py-16 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass mb-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/74">
              <Sparkles size={16} className="text-amber-200" />
              Personalized fruit intelligence for modern wellness
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="max-w-4xl text-5xl font-black leading-[0.95] tracking-normal sm:text-7xl lg:text-8xl">
              Nutrition, history, and health guidance in one <span className="aurora-text">cinematic fruit universe.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mt-7 max-w-2xl text-lg leading-8 text-white/66">
              Explore fruits like a premium wellness lab: micronutrients, cultural timelines, global production maps, allergy-aware recipes, and personal recommendations shaped by your goals.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="glass mt-8 flex max-w-2xl items-center gap-3 rounded-full p-2">
              <Search className="ml-4 text-white/45" size={21} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search mango, antioxidants, vitamin C..."
                className="min-w-0 flex-1 bg-transparent py-3 text-white outline-none placeholder:text-white/36"
              />
              <Link to="/recommendations" className="hidden items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-night sm:flex">
                Health AI <ArrowRight size={17} />
              </Link>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="relative min-h-[520px]">
            {fruits.slice(0, 4).map((fruit, index) => (
              <motion.div
                key={fruit.slug}
                animate={{ y: [0, index % 2 ? 22 : -18, 0], rotate: [0, index % 2 ? -2 : 2, 0] }}
                transition={{ repeat: Infinity, duration: 6 + index, delay: index * 0.4 }}
                className="absolute overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 shadow-aura backdrop-blur-2xl"
                style={{
                  width: index === 0 ? "62%" : "42%",
                  height: index === 0 ? "62%" : "38%",
                  left: ["16%", "0%", "54%", "42%"][index],
                  top: ["10%", "52%", "0%", "58%"][index]
                }}
              >
                <FruitImage src={fruit.image} alt={fruit.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/52">{fruit.nutrition?.calories ?? "No verified live data available"} kcal</p>
                  <h2 className="font-display text-3xl font-bold">{fruit.name}</h2>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="page-shell py-20">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-amber-200">Trending intelligence</p>
            <h2 className="mt-3 text-4xl font-black sm:text-5xl">Fruits people are searching now</h2>
          </div>
          <Link to="/maps" className="inline-flex items-center gap-2 text-white/70 transition hover:text-white">
            Explore global production <ArrowRight size={18} />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((fruit, index) => <FruitCard key={fruit.slug} fruit={fruit} index={index} />)}
        </div>
      </section>

      <section className="page-shell grid gap-5 pb-24 md:grid-cols-3">
        {[
          { icon: Brain, title: "Health engine", text: "Age, region, allergies, health conditions, and fitness goals shape fruit guidance." },
          { icon: Globe2, title: "World maps", text: "Heatmap-style production markers and country-wise comparisons for global fruit supply." },
          { icon: ShieldCheck, title: "Allergy-aware", text: "Recipes and fruit suggestions surface potential sensitivity risks and safer choices." },
          { icon: Zap, title: "Realtime analytics", text: "Searches, regions, recipe demand, and wellness trends feed an admin insight layer." }
        ].map(({ icon: Icon, title, text }) => (
          <motion.div key={title} whileHover={{ y: -8 }} className="glass rounded-[2rem] p-7 md:last:col-span-3 xl:last:col-span-1">
            <Icon className="text-amber-200" />
            <h3 className="mt-5 text-2xl font-bold">{title}</h3>
            <p className="mt-3 leading-7 text-white/58">{text}</p>
          </motion.div>
        ))}
      </section>
    </PageTransition>
  );
}
