import { motion } from "framer-motion";
import { ChefHat, Flame, Leaf, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api";
import FruitImage from "../components/FruitImage";
import LoadingScreen from "../components/LoadingScreen";
import PageTransition from "../components/PageTransition";

export default function RecipesPage() {
  const [filters, setFilters] = useState({ diet: "", region: "", allergies: "" });
  const [recipes, setRecipes] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(filters);
    api.get(`/recommendations/recipes?${params.toString()}`)
      .then(({ data }) => setRecipes(data.recipes))
      .catch(() => setRecipes([]));
  }, [filters]);

  if (!recipes) return <LoadingScreen />;

  return (
    <PageTransition className="page-shell pb-24 pt-8">
      <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-amber-200">Recipe intelligence</p>
          <h1 className="mt-3 text-5xl font-black sm:text-7xl">Personalized fruit recipes with allergy-safe logic.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/62">
            Filter recipes by dietary pattern, region, and allergies. The backend scores each recommendation so the most aligned cards rise to the top.
          </p>
          <div className="glass mt-8 grid gap-3 rounded-[2rem] p-4">
            {[
              ["diet", "Diet style", "vegan, vegetarian, low-glycemic"],
              ["region", "Region", "Asia, Europe, Mediterranean"],
              ["allergies", "Allergies", "nut, dairy, gluten"]
            ].map(([key, label, placeholder]) => (
              <label key={key} className="grid gap-2 rounded-2xl bg-black/22 p-4">
                <span className="text-sm text-white/48">{label}</span>
                <input
                  value={filters[key]}
                  onChange={(event) => setFilters((current) => ({ ...current, [key]: event.target.value }))}
                  placeholder={placeholder}
                  className="bg-transparent text-white outline-none placeholder:text-white/26"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-5">
          {recipes.map((recipe, index) => (
            <motion.article
              key={recipe.id}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              whileHover={{ y: -8 }}
              className="glass grid overflow-hidden rounded-[2rem] md:grid-cols-[240px_1fr]"
            >
              <div className="relative min-h-[230px]">
                <FruitImage src={recipe.image} alt={recipe.title} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute left-4 top-4 rounded-full bg-black/42 px-3 py-1 text-xs backdrop-blur-xl">{recipe.score} match</div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-amber-200">
                  <ChefHat size={18} />
                  <span className="text-sm uppercase tracking-[0.2em]">Curated recipe</span>
                </div>
                <h2 className="mt-3 text-3xl font-black">{recipe.title}</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {recipe.diet.map((item) => <span key={item} className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/70">{item}</span>)}
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-black/22 p-3"><Flame size={15} /><p className="mt-2 font-bold">{recipe.category || "Recipe"}</p><p className="text-xs text-white/42">type</p></div>
                  <div className="rounded-2xl bg-black/22 p-3"><Leaf size={15} /><p className="mt-2 font-bold">{recipe.diet?.[0] || "balanced"}</p><p className="text-xs text-white/42">diet</p></div>
                  <div className="rounded-2xl bg-black/22 p-3"><Search size={15} /><p className="mt-2 font-bold">{recipe.fruitSlugs?.length || 1}</p><p className="text-xs text-white/42">fruits</p></div>
                </div>
                {recipe.method && <p className="mt-4 text-sm leading-6 text-white/60">{recipe.method}</p>}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
