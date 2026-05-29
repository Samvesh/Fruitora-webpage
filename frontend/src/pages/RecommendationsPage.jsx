import { motion } from "framer-motion";
import { Activity, BadgeCheck, Ban, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { api } from "../api";
import FruitCard from "../components/FruitCard";
import PageTransition from "../components/PageTransition";

const emptyProfile = {
  age: "28",
  region: "Asia",
  allergies: "",
  healthConditions: "",
  fitnessGoals: "fitness recovery, immunity"
};

export default function RecommendationsPage() {
  const [profile, setProfile] = useState(emptyProfile);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const payload = {
      ...profile,
      age: Number(profile.age),
      allergies: profile.allergies.split(",").map((item) => item.trim()).filter(Boolean),
      healthConditions: profile.healthConditions.split(",").map((item) => item.trim()).filter(Boolean),
      fitnessGoals: profile.fitnessGoals.split(",").map((item) => item.trim()).filter(Boolean)
    };
    const { data } = await api.post("/recommendations/health", payload);
    setResult(data);
    setLoading(false);
  };

  return (
    <PageTransition className="page-shell pb-24 pt-8">
      <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
        <form onSubmit={submit} className="glass sticky top-28 h-fit rounded-[2rem] p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-200 text-night">
              <Activity />
            </div>
            <div>
              <p className="text-sm text-white/48">Health recommendation engine</p>
              <h1 className="text-2xl font-black">Tell Fruitora about you</h1>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            {[
              ["age", "Age", "28"],
              ["region", "Region", "Asia"],
              ["allergies", "Allergies", "latex, dairy"],
              ["healthConditions", "Health conditions", "heart health, diabetes"],
              ["fitnessGoals", "Fitness goals", "fitness recovery, immunity"]
            ].map(([key, label, placeholder]) => (
              <label key={key} className="grid gap-2 rounded-2xl bg-black/22 p-4">
                <span className="text-sm text-white/46">{label}</span>
                <input
                  value={profile[key]}
                  onChange={(event) => setProfile((current) => ({ ...current, [key]: event.target.value }))}
                  placeholder={placeholder}
                  className="bg-transparent text-white outline-none placeholder:text-white/25"
                />
              </label>
            ))}
          </div>
          <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-4 font-bold text-night disabled:opacity-60" disabled={loading}>
            <Send size={17} />
            {loading ? "Calculating..." : "Generate guidance"}
          </button>
        </form>

        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-amber-200">Personalized nutrition</p>
          <h2 className="mt-3 text-5xl font-black sm:text-7xl">Fruit guidance shaped by your body, goals, and constraints.</h2>

          {result ? (
            <div className="mt-10 grid gap-6">
              <div className="grid gap-5 xl:grid-cols-2">
                {result.suitable.map((fruit, index) => <FruitCard key={fruit.slug} fruit={fruit} index={index} />)}
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="glass rounded-[2rem] p-6">
                  <Ban className="text-red-300" />
                  <h3 className="mt-4 text-2xl font-bold">Fruits to avoid or review</h3>
                  <div className="mt-4 grid gap-2">
                    {(result.avoid.length ? result.avoid : ["No verified live data available"]).map((item) => (
                      <p key={item} className="rounded-2xl bg-white/7 p-4 text-white/66">{item}</p>
                    ))}
                  </div>
                </div>
                <div className="glass rounded-[2rem] p-6">
                  <BadgeCheck className="text-emerald-300" />
                  <h3 className="mt-4 text-2xl font-bold">Daily guidance</h3>
                  <div className="mt-4 grid gap-2">
                    {result.dailyGuidance.map((item) => <p key={item} className="rounded-2xl bg-white/7 p-4 text-white/66">{item}</p>)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass mt-10 rounded-[2rem] p-10 text-center">
              <Sparkles className="mx-auto text-amber-200" size={44} />
              <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-white/62">
                Submit your profile to receive suitable fruits, daily serving guidance, allergy-aware cautions, and nutrition reasoning.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
