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
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="group relative min-h-[400px] overflow-hidden rounded-[2rem] bg-white border border-[#EBE8DF] p-4 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="relative h-52 overflow-hidden rounded-[1.5rem] bg-[#F7F6F1]">
        <FruitImage src={fruit.image} alt={fruit.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-3.5 top-3.5 rounded-full bg-[#141814]/75 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
          {fruit.nutrition?.calories ?? fruit.calories ?? "Verified"} kcal / 100g
        </span>
      </div>

      <div className="relative mt-5 px-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-[#141814]">{fruit.name}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[#656E62] line-clamp-2">
              {fruit.benefits?.slice(0, 2).join(" • ") || fruit.description}
            </p>
          </div>
          <Link
            to={`/fruit/${fruit.slug}`}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#1F3D1F] text-white transition hover:bg-[#162E16] group-hover:rotate-12 shadow-sm"
          >
            <ArrowUpRight size={18} />
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {fruit.vitamins?.slice(0, 3).map((vitamin) => (
            <span key={vitamin} className="flex items-center gap-1 rounded-full bg-[#E2ECDC] border border-[#D5E1CE] px-2.5 py-0.5 text-xs font-medium text-[#1F3D1F]">
              <Sparkles size={11} />
              {vitamin}
            </span>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {["fiber", "sugar", "protein"].map((key) => (
            <div key={key} className="rounded-xl bg-[#F7F6F1] p-2.5 border border-[#EBE8DF]">
              <p className="text-[10px] uppercase font-semibold tracking-wider text-[#8C9589]">{key}</p>
              <p className="mt-0.5 text-sm font-bold text-[#141814]">{fruit.nutrition?.[key] ?? "-"}g</p>
            </div>
          ))}
        </div>

        {fruit.trendSignal?.value && (
          <div className="mt-3.5 flex items-center gap-1.5 text-xs font-semibold text-[#1F3D1F]">
            <Flame size={13} className="text-[#1F3D1F]" />
            <span>Trend signal {fruit.trendSignal.value}</span>
          </div>
        )}
      </div>
    </motion.article>
  );
}
