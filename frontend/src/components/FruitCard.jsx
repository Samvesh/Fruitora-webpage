import { motion } from "framer-motion";
import { ArrowUpRight, Flame, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import FruitImage from "./FruitImage";

export default function FruitCard({ fruit, index = 0 }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -10, rotateX: 4, rotateY: -4 }}
      className="glass group noise relative min-h-[410px] overflow-hidden rounded-[2rem] p-4"
    >
      <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full opacity-40 blur-3xl" style={{ background: fruit.color }} />
      <div className="relative h-56 overflow-hidden rounded-[1.5rem]">
        <FruitImage src={fruit.image} alt={fruit.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-black/35 px-3 py-1 text-xs text-white/80 backdrop-blur-xl">
          {fruit.nutrition?.calories ?? fruit.calories ?? "No verified live data available"} kcal / 100g
        </span>
      </div>
      <div className="relative mt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-3xl font-bold">{fruit.name}</h3>
            <p className="mt-2 text-sm leading-6 text-white/62">{fruit.benefits?.slice(0, 2).join(" • ")}</p>
          </div>
          <Link to={`/fruit/${fruit.slug}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-night transition group-hover:rotate-12">
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {fruit.vitamins?.slice(0, 3).map((vitamin) => (
            <span key={vitamin} className="flex items-center gap-1 rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs text-white/74">
              <Sparkles size={12} />
              {vitamin}
            </span>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {["fiber", "sugar", "protein"].map((key) => (
            <div key={key} className="rounded-2xl bg-black/22 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/38">{key}</p>
              <p className="mt-1 font-semibold">{fruit.nutrition?.[key] ?? "-"}g</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-amber-200">
          <Flame size={14} />
          {fruit.trendSignal?.value ? `Trend signal ${fruit.trendSignal.value}` : "No verified live data available"}
        </div>
      </div>
    </motion.article>
  );
}
