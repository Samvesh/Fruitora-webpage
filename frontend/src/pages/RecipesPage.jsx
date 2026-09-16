import { motion } from "framer-motion";
import { ChefHat, Flame, Leaf, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import LoadingScreen from "../components/LoadingScreen";
import PageTransition from "../components/PageTransition";

export default function RecipesPage() {
  const [filters, setFilters] = useState({ diet: "", region: "", allergies: "" });
  const [recipes, setRecipes] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(filters);
    api.get(`/recommendations/recipes?${params.toString()}`)
      .then(({ data }) => setRecipes(Array.isArray(data.recipes) ? data.recipes : []))
      .catch(() => setRecipes([]));
  }, [filters]);

  const filteredRecipes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return recipes || [];

    return (recipes || []).filter((recipe) =>
      [recipe.title, ...(recipe.fruitSlugs || []), ...(recipe.ingredients || [])]
        .some((value) => value?.toLowerCase().includes(query))
    );
  }, [recipes, search]);

  if (!recipes) return <LoadingScreen />;

  return (
    <PageTransition className="page-shell pb-24 pt-8">
      <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[#A96C00]">Recipe intelligence</p>
          <h1 className="mt-3 text-5xl font-black sm:text-7xl">Personalized fruit recipes with allergy-safe logic.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#556453]">
            Filter recipes by dietary pattern, region, and allergies. The backend scores each recommendation so the most aligned cards rise to the top.
          </p>
          <label className="mt-6 flex items-center gap-3 rounded-full border border-[#E2E0D5] bg-white px-4 py-3 shadow-sm focus-within:border-[#1F3D1F] focus-within:ring-2 focus-within:ring-[#1F3D1F]/15">
            <Search size={19} className="shrink-0 text-[#7C8579]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search recipes, fruits, or ingredients"
              className="min-w-0 flex-1 bg-transparent text-[#141814] outline-none placeholder:text-[#8C9589]"
            />
          </label>
          <div className="glass mt-8 grid gap-3 rounded-[2rem] p-4">
            {[
              ["diet", "Diet style", "vegan, vegetarian, low-glycemic"],
              ["region", "Region", "Asia, Europe, Mediterranean"],
              ["allergies", "Allergies", "nut, dairy, gluten"]
            ].map(([key, label, placeholder]) => (
              <label key={key} className="grid gap-2 rounded-2xl bg-[#FAF9F5] p-4">
                <span className="text-sm text-[#656E62]">{label}</span>
                <input
                  value={filters[key]}
                  onChange={(event) => setFilters((current) => ({ ...current, [key]: event.target.value }))}
                  placeholder={placeholder}
                  className="bg-transparent text-[#141814] outline-none placeholder:text-[#8C9589]"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="max-h-[600px] overflow-y-auto pr-2">
          <div className="grid gap-5">
            {filteredRecipes.map((recipe, index) => (
              <motion.article
                key={recipe.id}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index, 8) * 0.06 }}
                whileHover={{ y: -4 }}
                className="glass rounded-[2rem] p-6"
              >
                <div className="flex items-center gap-2 text-[#A96C00]">
                  <ChefHat size={18} />
                  <span className="text-sm uppercase tracking-[0.2em]">Curated recipe</span>
                </div>
                <h2 className="mt-3 text-3xl font-black">{recipe.title}</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(recipe.diet || []).map((item) => <span key={item} className="rounded-full bg-[#E2ECDC] px-3 py-1 text-xs text-[#1F3D1F]">{item}</span>)}
                </div>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[#FAF9F5] p-3"><Flame size={15} /><p className="mt-2 font-bold">{recipe.category || "Recipe"}</p><p className="text-xs text-[#656E62]">category</p></div>
                  <div className="rounded-2xl bg-[#FAF9F5] p-3"><Leaf size={15} /><p className="mt-2 font-bold">{recipe.prepTime || "10 min"}</p><p className="text-xs text-[#656E62]">prep time</p></div>
                </div>
                <section className="mt-5">
                  <h3 className="font-bold">Ingredients</h3>
                  <ul className="mt-2 grid gap-1 text-sm leading-6 text-[#556453]">
                    {(recipe.ingredients || []).map((ingredient) => <li key={ingredient}>• {ingredient}</li>)}
                  </ul>
                </section>
                <section className="mt-5">
                  <h3 className="font-bold">Instructions</h3>
                  <p className="mt-2 text-sm leading-6 text-[#556453]">{recipe.instructions || recipe.method || "Instructions are coming soon."}</p>
                </section>
              </motion.article>
            ))}
            {!filteredRecipes.length && (
              <div className="rounded-[2rem] border border-dashed border-[#D5E1CE] bg-[#FAF9F5] p-8 text-center text-[#556453]">
                No recipes match “{search}”. Try a fruit, ingredient, or recipe type such as “mango” or “smoothie”.
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
