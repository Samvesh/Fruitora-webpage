import { motion } from "framer-motion";
import { Activity, Globe2, Search, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api";
import LoadingScreen from "../components/LoadingScreen";
import PageTransition from "../components/PageTransition";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api.get("/analytics/overview")
      .then(({ data }) => setAnalytics(data))
      .catch(() => setFailed(true));
  }, []);

  if (failed) {
    return (
      <PageTransition className="page-shell pb-24 pt-8">
        <div className="glass rounded-[2rem] p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-amber-200">Admin analytics</p>
          <h1 className="mt-3 text-4xl font-black">No verified live data available</h1>
        </div>
      </PageTransition>
    );
  }

  if (!analytics) return <LoadingScreen />;

  const stats = [
    { label: "Fruits", value: analytics.totals.fruits, icon: Activity },
    { label: "Recipes", value: analytics.totals.recipes, icon: TrendingUp },
    { label: "Searches", value: analytics.totals.searches, icon: Search },
    { label: "Users", value: analytics.totals.activeUsers, icon: Users }
  ];

  const displayValue = (value) => (typeof value === "number" ? value.toLocaleString() : "No verified live data available");

  return (
    <PageTransition className="page-shell pb-24 pt-8">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.28em] text-amber-200">Admin analytics</p>
        <h1 className="mt-3 text-5xl font-black sm:text-7xl">Search behavior, recipe demand, and health trends.</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <motion.div key={label} whileHover={{ y: -7 }} className="glass rounded-[2rem] p-6">
            <Icon className="text-amber-200" />
            <p className="mt-5 text-4xl font-black">{displayValue(value)}</p>
            <p className="mt-1 text-sm text-white/48">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <section className="glass rounded-[2rem] p-6">
          <h2 className="text-2xl font-bold">Trending searches</h2>
          <div className="mt-5 grid gap-3">
            {analytics.searches.length ? analytics.searches.map((item, index) => (
              <div key={item._id} className="grid grid-cols-[32px_1fr_auto] items-center gap-3 rounded-2xl bg-white/7 p-4">
                <span className="text-white/42">{index + 1}</span>
                <span>{item._id}</span>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-night">{item.count}</span>
              </div>
            )) : <p className="rounded-2xl bg-white/7 p-4 text-white/60">No verified live data available</p>}
          </div>
        </section>

        <section className="glass rounded-[2rem] p-6">
          <h2 className="text-2xl font-bold">User regions</h2>
          <div className="mt-5 grid gap-3">
            {analytics.usersByRegion.length ? analytics.usersByRegion.map((item) => (
              <div key={item._id} className="rounded-2xl bg-white/7 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2"><Globe2 size={16} /> {item._id}</span>
                  <span>{item.users}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-amber-200" style={{ width: `${Math.min(100, item.users / 20)}%` }} />
                </div>
              </div>
            )) : <p className="rounded-2xl bg-white/7 p-4 text-white/60">No verified live data available</p>}
          </div>
        </section>

        <section className="glass rounded-[2rem] p-6 lg:col-span-2">
          <h2 className="text-2xl font-bold">Health trend statistics</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {analytics.healthTrends.length ? analytics.healthTrends.map((trend) => (
              <div key={trend.label} className="rounded-3xl bg-black/22 p-5">
                <p className="text-sm text-white/50">{trend.label}</p>
                <p className="mt-3 text-4xl font-black">{trend.value}%</p>
              </div>
            )) : <p className="rounded-2xl bg-white/7 p-4 text-white/60 md:col-span-4">{analytics.note || "No health trend events have been captured yet."}</p>}
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
