import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChefHat,
  Clock,
  Edit3,
  Globe,
  Heart,
  Info,
  LogIn,
  Ruler,
  Save,
  Scale,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, fetchWithRetry, prewarmBackend } from "../api";
import DottedGlobe from "../components/DottedGlobe";
import FruitCard from "../components/FruitCard";
import LoadingScreen from "../components/LoadingScreen";
import PageTransition from "../components/PageTransition";
import { useAuth } from "../context/AuthContext";
import { fallbackFruits } from "../data/fallback";
import { getCachedFruits, isCacheValid, setCachedFruits } from "../data/fruitCache";

const CACHE_KEY = "trending";

const RECIPE_FRUITS = [
  { name: "All", emoji: "✨" },
  { name: "Mango", emoji: "🥭" },
  { name: "Banana", emoji: "🍌" },
  { name: "Kiwi", emoji: "🥝" },
  { name: "Avocado", emoji: "🥑" },
  { name: "Strawberry", emoji: "🍓" },
  { name: "Apple", emoji: "🍎" },
  { name: "Orange", emoji: "🍊" },
  { name: "Pineapple", emoji: "🍍" },
  { name: "Papaya", emoji: "🍈" },
  { name: "Grapes", emoji: "🍇" }
];

export default function Home() {
  const { user, updateUser } = useAuth();
  const [fruits, setFruits] = useState(() => getCachedFruits(CACHE_KEY) || []);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(() => !isCacheValid(CACHE_KEY));

  // Active section in feature option bar: "global" | "datadriven" | "personalized" | "delicious"
  const [activeTab, setActiveTab] = useState("global");

  // AI Fruit Search State ("SEARCH MORE with AI")
  const [aiSearchInput, setAiSearchInput] = useState("");
  const [aiSearchResult, setAiSearchResult] = useState(null);
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [aiSearchError, setAiSearchError] = useState("");

  // Data-driven user profile state
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editingMetrics, setEditingMetrics] = useState(false);
  const [metricForm, setMetricForm] = useState({
    weightKg: "68",
    heightCm: "175",
    region: "Asia / India",
    healthConditions: "Borderline Diabetic, Mild Hypertension",
    allergies: "Latex-fruit allergy",
    fitnessGoals: "Blood Sugar Balance, Active Recovery"
  });
  const [metricSaveSuccess, setMetricSaveSuccess] = useState(false);

  // Delicious section state (Recipes)
  const [selectedRecipeFruit, setSelectedRecipeFruit] = useState("All");
  const [recipes, setRecipes] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(false);

  const sectionRef = useRef(null);

  // Scroll smoothly when switching tabs
  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  // Sync with searchParams if url changes
  useEffect(() => {
    const q = searchParams.get("q") || "";
    if (q !== query) {
      setQuery(q);
    }
  }, [searchParams]);

  // Wake a cold backend and load trending fruits with retry and session caching.
  useEffect(() => {
    prewarmBackend();
    const hasCachedData = fruits.length > 0;
    if (!hasCachedData) setLoading(true);

    fetchWithRetry(() => api.get("/fruits/trending"), 2, 2000)
      .then(({ data }) => {
        const fetched = Array.isArray(data?.fruits) ? data.fruits : [];
        if (fetched.length > 0) {
          setFruits(fetched);
          setCachedFruits(CACHE_KEY, fetched);
        } else if (!hasCachedData) {
          setFruits(fallbackFruits);
        }
      })
      .catch(() => {
        if (!hasCachedData) setFruits(fallbackFruits);
      })
      .finally(() => setLoading(false));
    // This should run only when the home page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch real data for Data-Driven tab
  useEffect(() => {
    if (activeTab === "datadriven") {
      setProfileLoading(true);
      const token = localStorage.getItem("fruitora_token");
      if (token && user) {
        api
          .get("/auth/profile")
          .then(({ data }) => {
            setProfileData(data);
            const hp = data.user?.healthProfile || {};
            setMetricForm({
              weightKg: hp.weightKg ? String(hp.weightKg) : "68",
              heightCm: hp.heightCm ? String(hp.heightCm) : "175",
              region: data.user?.region || hp.region || "Asia / India",
              healthConditions: Array.isArray(hp.healthConditions)
                ? hp.healthConditions.join(", ")
                : hp.healthConditions || "None",
              allergies: Array.isArray(hp.allergies) ? hp.allergies.join(", ") : hp.allergies || "None",
              fitnessGoals: Array.isArray(hp.fitnessGoals)
                ? hp.fitnessGoals.join(", ")
                : hp.fitnessGoals || "General Vitality"
            });
          })
          .catch((err) => {
            console.warn("Could not load user profile:", err);
          })
          .finally(() => setProfileLoading(false));
      } else {
        // Guest mode profile data
        setProfileData({
          user: {
            name: "Guest Explorer",
            region: "Global",
            healthProfile: {
              weightKg: 68,
              heightCm: 175,
              region: "Global",
              healthConditions: ["Active Explorer"],
              allergies: ["None"],
              fitnessGoals: ["Optimal Energy & Vitality"]
            }
          },
          recentSearches: ["Dragon Fruit", "Kiwi", "Mango", "Avocado"]
        });
        setProfileLoading(false);
      }
    }
  }, [activeTab, user]);

  // Fetch recipes for Delicious tab
  useEffect(() => {
    if (activeTab === "delicious") {
      setRecipesLoading(true);
      const fruitParam = selectedRecipeFruit === "All" ? "" : selectedRecipeFruit;
      api
        .get(`/recommendations/recipes?fruit=${encodeURIComponent(fruitParam)}`)
        .then(({ data }) => setRecipes(Array.isArray(data?.recipes) ? data.recipes : []))
        .catch(() => setRecipes([]))
        .finally(() => setRecipesLoading(false));
    }
  }, [activeTab, selectedRecipeFruit]);

  // AI Fruit Search Handler (Search bar format, not chatbot)
  const handleAISearch = async (e) => {
    if (e) e.preventDefault();
    const term = aiSearchInput.trim();
    if (!term || aiSearchLoading) return;

    setAiSearchLoading(true);
    setAiSearchError("");
    setAiSearchResult(null);

    try {
      const { data } = await api.post("/ai/fruit-search", { fruitName: term });
      if (data?.fruit) {
        setAiSearchResult(data.fruit);
      } else {
        setAiSearchError("Could not retrieve botanical data for this fruit.");
      }
    } catch (err) {
      setAiSearchError(err.response?.data?.message || "Search failed. Please try again.");
    } finally {
      setAiSearchLoading(false);
    }
  };

  // Save updated metrics in Data-Driven tab
  const handleSaveMetrics = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        region: metricForm.region,
        healthProfile: {
          weightKg: Number(metricForm.weightKg) || null,
          heightCm: Number(metricForm.heightCm) || null,
          region: metricForm.region,
          healthConditions: metricForm.healthConditions.split(",").map((s) => s.trim()).filter(Boolean),
          allergies: metricForm.allergies.split(",").map((s) => s.trim()).filter(Boolean),
          fitnessGoals: metricForm.fitnessGoals.split(",").map((s) => s.trim()).filter(Boolean)
        }
      };

      const token = localStorage.getItem("fruitora_token");
      if (token && user) {
        const { data } = await api.put("/auth/profile", payload);
        if (data?.user) {
          updateUser(data.user);
          setProfileData((prev) => ({ ...prev, user: data.user }));
        }
      } else {
        // Guest mode local update
        setProfileData((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            region: metricForm.region,
            healthProfile: payload.healthProfile
          }
        }));
      }

      setEditingMetrics(false);
      setMetricSaveSuccess(true);
      setTimeout(() => setMetricSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Metric update error:", err);
    }
  };

  // Calculate live BMI
  const bmiInfo = useMemo(() => {
    const hp = profileData?.user?.healthProfile || {};
    const w = hp.weightKg || Number(metricForm.weightKg) || 0;
    const h = hp.heightCm || Number(metricForm.heightCm) || 0;
    if (!w || !h) return null;
    const val = Number((w / ((h / 100) * (h / 100))).toFixed(1));
    let status = "Healthy Weight";
    let color = "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (val < 18.5) {
      status = "Underweight";
      color = "text-amber-700 bg-amber-50 border-amber-200";
    } else if (val >= 25 && val < 29.9) {
      status = "Overweight";
      color = "text-amber-700 bg-amber-50 border-amber-200";
    } else if (val >= 30) {
      status = "High Range";
      color = "text-red-700 bg-red-50 border-red-200";
    }
    return { val, status, color };
  }, [profileData, metricForm]);

  // Standard filter for fruit catalog
  const filteredFruits = useMemo(() => {
    if (!query.trim()) return fruits;
    const term = query.toLowerCase();
    return fruits.filter(
      (fruit) =>
        fruit.name.toLowerCase().includes(term) ||
        fruit.description?.toLowerCase().includes(term) ||
        fruit.vitamins?.some((v) => v.toLowerCase().includes(term))
    );
  }, [fruits, query]);

  // Personalized suitable fruits
  const personalizedFruits = useMemo(() => {
    const hp = profileData?.user?.healthProfile || user?.healthProfile || {};
    const conditions = Array.isArray(hp.healthConditions)
      ? hp.healthConditions.join(" ").toLowerCase()
      : String(hp.healthConditions || "").toLowerCase();

    if (conditions.includes("diabet") || conditions.includes("sugar")) {
      return fruits.filter((f) => ["jamun", "guava", "amla", "apple", "kiwi"].includes(f.slug));
    }
    if (conditions.includes("pressure") || conditions.includes("hypertens")) {
      return fruits.filter((f) => ["pomegranate", "watermelon", "banana"].includes(f.slug));
    }
    return fruits.slice(0, 6);
  }, [fruits, profileData, user]);

  if (loading) return <LoadingScreen />;

  return (
    <PageTransition>
      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 py-8 lg:py-12">
        {/* ========================================================= */}
        {/* 1. HERO SECTION                                           */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.35fr] xl:grid-cols-[1fr_1.4fr] items-center gap-10 lg:gap-8 xl:gap-12 min-h-[540px]">
          {/* Left Column: Headline & Subtext */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col justify-center max-w-xl xl:max-w-2xl"
          >
            <p className="text-[12px] sm:text-[13px] font-bold tracking-[0.24em] text-[#868F83] uppercase mb-4 sm:mb-6 select-none">
              FRUITS CONNECT PEOPLE
            </p>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[70px] xl:text-[80px] font-black tracking-[-0.035em] text-[#141814] leading-[1.02]">
              A healthier<br />
              tomorrow,<br />
              <span className="text-[#1F3D1F]">one fruit</span><br />
              at a time.
            </h1>

            <p className="mt-7 sm:mt-9 text-base sm:text-lg text-[#656E62] max-w-md font-normal leading-relaxed">
              Explore fruits from around the world. Discover their nutrition, origin, recipes, and more — all in one place.
            </p>
          </motion.div>

          {/* Right Column: Hero Collage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="flex flex-col md:flex-row items-stretch md:items-start gap-4 lg:gap-4 xl:gap-5 justify-end w-full"
          >
            <div className="relative flex-1 rounded-[2.25rem] overflow-hidden shadow-card hover:shadow-lg transition-shadow duration-300 bg-transparent group">
              <img
                src="/hero-bento.png"
                alt="Fruitoria fruit nutrition collage"
                className="w-full h-auto object-cover rounded-[2.25rem] select-none pointer-events-auto"
                loading="eager"
              />
            </div>

            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="w-full md:w-[210px] xl:w-[230px] shrink-0 bg-[#E2ECDC] rounded-[2rem] p-6 xl:p-7 flex flex-col justify-between shadow-card border border-[#D5E1CE] min-h-[220px] md:min-h-[280px]"
            >
              <div>
                <h3 className="text-[22px] xl:text-[24px] font-bold text-[#141814] leading-[1.18] tracking-tight">
                  Real<br />
                  Nutrition.<br />
                  Real Impact.
                </h3>
                <div className="w-9 h-[2px] bg-[#141814]/20 my-5" />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link
                  to="/recommendations"
                  className="text-sm font-semibold text-[#141814] leading-snug hover:underline"
                >
                  Explore<br />Now
                </Link>
                <Link
                  to="/recommendations"
                  className="w-11 h-11 rounded-full bg-[#1F3D1F] hover:bg-[#162E16] text-white flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-sm"
                  aria-label="Explore Now"
                >
                  <ArrowRight size={17} />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ========================================================= */}
        {/* 2. INTERACTIVE FEATURE OPTION BAR                         */}
        {/* ========================================================= */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full bg-[#E2ECDC] rounded-[2.25rem] sm:rounded-[2.75rem] px-6 sm:px-10 lg:px-12 py-7 sm:py-8 border border-[#D5E1CE] shadow-sm my-10 lg:my-14"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* 4 Interactive Feature Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 flex-1 w-full">
              {/* Button 1: Global */}
              <button
                type="button"
                onClick={() => handleTabClick("global")}
                className={`flex flex-col text-left p-4 sm:p-5 rounded-2xl sm:rounded-3xl transition-all duration-200 ${
                  activeTab === "global"
                    ? "bg-[#1F3D1F] text-white shadow-md scale-[1.02]"
                    : "bg-white/50 hover:bg-white/90 text-[#141814] border border-[#D5E1CE]/50"
                }`}
              >
                <div className={`${activeTab === "global" ? "text-white" : "text-[#141814]"} mb-3`}>
                  <Globe size={26} strokeWidth={1.75} />
                </div>
                <h4 className="text-[17px] font-bold tracking-tight">Global</h4>
                <p className={`text-[12px] sm:text-[13px] mt-0.5 ${activeTab === "global" ? "text-white/80" : "text-[#556453]"}`}>
                  Fruits from every region
                </p>
                {activeTab === "global" && (
                  <span className="mt-2.5 inline-block text-[10px] font-extrabold uppercase tracking-widest text-[#E2ECDC]">
                    ● Active View
                  </span>
                )}
              </button>

              {/* Button 2: Data Driven */}
              <button
                type="button"
                onClick={() => handleTabClick("datadriven")}
                className={`flex flex-col text-left p-4 sm:p-5 rounded-2xl sm:rounded-3xl transition-all duration-200 ${
                  activeTab === "datadriven"
                    ? "bg-[#1F3D1F] text-white shadow-md scale-[1.02]"
                    : "bg-white/50 hover:bg-white/90 text-[#141814] border border-[#D5E1CE]/50"
                }`}
              >
                <div className={`${activeTab === "datadriven" ? "text-white" : "text-[#141814]"} mb-3`}>
                  <BarChart3 size={26} strokeWidth={1.75} />
                </div>
                <h4 className="text-[17px] font-bold tracking-tight">Data Driven</h4>
                <p className={`text-[12px] sm:text-[13px] mt-0.5 ${activeTab === "datadriven" ? "text-white/80" : "text-[#556453]"}`}>
                  Real user health metrics
                </p>
                {activeTab === "datadriven" && (
                  <span className="mt-2.5 inline-block text-[10px] font-extrabold uppercase tracking-widest text-[#E2ECDC]">
                    ● Active View
                  </span>
                )}
              </button>

              {/* Button 3: Personalized */}
              <button
                type="button"
                onClick={() => handleTabClick("personalized")}
                className={`flex flex-col text-left p-4 sm:p-5 rounded-2xl sm:rounded-3xl transition-all duration-200 ${
                  activeTab === "personalized"
                    ? "bg-[#1F3D1F] text-white shadow-md scale-[1.02]"
                    : "bg-white/50 hover:bg-white/90 text-[#141814] border border-[#D5E1CE]/50"
                }`}
              >
                <div className={`${activeTab === "personalized" ? "text-white" : "text-[#141814]"} mb-3`}>
                  <Heart size={26} strokeWidth={1.75} />
                </div>
                <h4 className="text-[17px] font-bold tracking-tight">Personalized</h4>
                <p className={`text-[12px] sm:text-[13px] mt-0.5 ${activeTab === "personalized" ? "text-white/80" : "text-[#556453]"}`}>
                  Recommendations for you
                </p>
                {activeTab === "personalized" && (
                  <span className="mt-2.5 inline-block text-[10px] font-extrabold uppercase tracking-widest text-[#E2ECDC]">
                    ● Active View
                  </span>
                )}
              </button>

              {/* Button 4: Delicious */}
              <button
                type="button"
                onClick={() => handleTabClick("delicious")}
                className={`flex flex-col text-left p-4 sm:p-5 rounded-2xl sm:rounded-3xl transition-all duration-200 ${
                  activeTab === "delicious"
                    ? "bg-[#1F3D1F] text-white shadow-md scale-[1.02]"
                    : "bg-white/50 hover:bg-white/90 text-[#141814] border border-[#D5E1CE]/50"
                }`}
              >
                <div className={`${activeTab === "delicious" ? "text-white" : "text-[#141814]"} mb-3`}>
                  <ChefHat size={26} strokeWidth={1.75} />
                </div>
                <h4 className="text-[17px] font-bold tracking-tight">Delicious</h4>
                <p className={`text-[12px] sm:text-[13px] mt-0.5 ${activeTab === "delicious" ? "text-white/80" : "text-[#556453]"}`}>
                  Choose fruit for recipes
                </p>
                {activeTab === "delicious" && (
                  <span className="mt-2.5 inline-block text-[10px] font-extrabold uppercase tracking-widest text-[#E2ECDC]">
                    ● Active View
                  </span>
                )}
              </button>
            </div>

            {/* Right Section: Dotted Map & Slogan */}
            <div className="flex items-center gap-6 shrink-0 pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l border-[#141814]/15 pl-0 lg:pl-8 w-full lg:w-auto justify-start lg:justify-end">
              <DottedGlobe className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 text-[#2C3E2B]" />
              <div className="flex flex-col">
                <p className="text-[11px] font-bold tracking-[0.22em] text-[#556453] uppercase leading-[1.35]">
                  A HEALTHIER<br />
                  WORLD IS A<br />
                  BRIGHTER ONE.
                </p>
                <div className="w-8 h-[2px] bg-[#556453]/40 mt-2" />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Scroll anchor for option sections */}
        <div ref={sectionRef} />

        {/* ========================================================= */}
        {/* 3. DYNAMIC CONTENT BASED ON ACTIVE OPTION BAR TAB         */}
        {/* ========================================================= */}

        {/* --------------------------------------------------------- */}
        {/* TAB 1: GLOBAL (Catalog + SEARCH MORE with AI)             */}
        {/* --------------------------------------------------------- */}
        {activeTab === "global" && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="py-6"
          >
            {/* SEARCH MORE with AI Box (Search Bar Format, Not Chatbot) */}
            <div className="bg-white rounded-[2.25rem] p-6 sm:p-8 border border-[#E8E6DD] shadow-sm mb-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E2ECDC] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1F3D1F] mb-2">
                    <Sparkles size={13} />
                    AI Botanical Intelligence
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#141814]">
                    Search More with AI
                  </h3>
                  <p className="text-sm text-[#656E62] mt-1">
                    Enter any rare, exotic, or seasonal fruit to generate an instant verified nutritional dossier.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#868F83] hidden sm:inline">
                    Examples:
                  </span>
                  {["Mangosteen", "Dragon Fruit", "Durian", "Amla"].map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => {
                        setAiSearchInput(example);
                      }}
                      className="px-2.5 py-1 rounded-full bg-[#FAF9F5] hover:bg-[#EBECE5] text-xs font-medium text-[#1F3D1F] border border-[#E2E0D5] transition"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar Input */}
              <form onSubmit={handleAISearch} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 flex items-center">
                  <Search size={18} className="absolute left-4 text-[#868F83]" />
                  <input
                    type="text"
                    value={aiSearchInput}
                    onChange={(e) => setAiSearchInput(e.target.value)}
                    placeholder="Enter any fruit name (e.g. Passion Fruit, Cherimoya, Feijoa, Persimmon)..."
                    className="w-full bg-[#FAF9F5] focus:bg-white text-sm sm:text-base text-[#141814] placeholder:text-[#9DA69B] pl-11 pr-4 py-3.5 rounded-full border border-[#E0DED3] focus:border-[#1F3D1F] focus:ring-2 focus:ring-[#1F3D1F]/15 outline-none transition shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!aiSearchInput.trim() || aiSearchLoading}
                  className="px-6 py-3.5 rounded-full bg-[#1F3D1F] hover:bg-[#162E16] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-40"
                >
                  <Sparkles size={16} />
                  <span>{aiSearchLoading ? "Analyzing with AI..." : "Search More"}</span>
                </button>
              </form>

              {aiSearchError && (
                <div className="mt-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center gap-2">
                  <Info size={16} />
                  <span>{aiSearchError}</span>
                </div>
              )}

              {/* Instant AI Fruit Dossier Card (Search Format, Not Chatbot) */}
              {aiSearchResult && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-6 sm:p-7 rounded-3xl bg-[#FAF9F5] border border-[#D5E1CE] relative"
                >
                  <button
                    type="button"
                    onClick={() => setAiSearchResult(null)}
                    className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#EBEAE3] text-[#7C8579] hover:text-[#141814] transition"
                    title="Close intelligence sheet"
                  >
                    <X size={18} />
                  </button>

                  <div className="flex flex-wrap items-baseline gap-3 mb-2">
                    <h4 className="text-2xl sm:text-3xl font-black text-[#141814]">
                      {aiSearchResult.name}
                    </h4>
                    <span className="text-sm italic font-serif text-[#656E62]">
                      {aiSearchResult.scientificName}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E2ECDC] text-xs font-semibold text-[#1F3D1F]">
                      🌍 {aiSearchResult.origin}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base text-[#4E5C4B] leading-relaxed mb-6">
                    {aiSearchResult.description}
                  </p>

                  {/* Nutrients Metric Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="bg-white p-3.5 rounded-2xl border border-[#E5E3DA] text-center">
                      <span className="text-xs text-[#7C8579] block uppercase tracking-wider">Calories</span>
                      <span className="text-lg font-black text-[#141814]">{aiSearchResult.calories} kcal</span>
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-[#E5E3DA] text-center">
                      <span className="text-xs text-[#7C8579] block uppercase tracking-wider">Dietary Fiber</span>
                      <span className="text-lg font-black text-[#141814]">{aiSearchResult.fiber}g</span>
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-[#E5E3DA] text-center">
                      <span className="text-xs text-[#7C8579] block uppercase tracking-wider">Natural Sugar</span>
                      <span className="text-lg font-black text-[#141814]">{aiSearchResult.sugar}g</span>
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-[#E5E3DA] text-center">
                      <span className="text-xs text-[#7C8579] block uppercase tracking-wider">Glycemic Index</span>
                      <span className="text-sm font-bold text-emerald-800 block mt-1">{aiSearchResult.glycemicIndex}</span>
                    </div>
                  </div>

                  {/* Key Insights Two Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm">
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E3DA] space-y-3">
                      <div>
                        <span className="font-bold text-[#141814] block mb-1">Vitamins & Minerals:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(aiSearchResult.vitamins)
                            ? aiSearchResult.vitamins.map((v, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-md bg-[#EBECE5] text-[#1F3D1F] font-semibold text-xs">
                                  {v}
                                </span>
                              ))
                            : <span>{aiSearchResult.vitamins}</span>}
                        </div>
                      </div>

                      <div>
                        <span className="font-bold text-[#141814] block mb-1">Top Health Benefits:</span>
                        <ul className="space-y-1.5 text-[#556453]">
                          {Array.isArray(aiSearchResult.benefits)
                            ? aiSearchResult.benefits.map((b, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                                  <span>{b}</span>
                                </li>
                              ))
                            : <li>{aiSearchResult.benefits}</li>}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E3DA] space-y-3">
                      <div>
                        <span className="font-bold text-[#141814] block mb-1">Optimal Consumption Timing:</span>
                        <p className="text-[#556453]">{aiSearchResult.timing}</p>
                      </div>
                      <div>
                        <span className="font-bold text-[#141814] block mb-1">Culinary Pairings & Tips:</span>
                        <p className="text-[#556453]">{aiSearchResult.culinaryTips}</p>
                      </div>
                      <div>
                        <span className="font-bold text-[#9C382A] block mb-1">Allergies & Cautions:</span>
                        <p className="text-[#656E62]">{aiSearchResult.cautions}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-[11px] text-[#868F83] text-right">
                    Source: {aiSearchResult.source || "Fruitora Intelligence"}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Complete Global Catalog Header & Filter */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#1F3D1F]">
                  Global Fruit Catalog
                </p>
                <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#141814]">
                  All Verified Fruits ({filteredFruits.length})
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white border border-[#E8E5DC] focus-within:ring-2 focus-within:ring-[#1F3D1F]/20 rounded-full px-4 py-2.5 shadow-sm w-full sm:w-72">
                  <Search size={16} className="text-[#868F83]" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setSearchParams(e.target.value ? { q: e.target.value } : {});
                    }}
                    placeholder="Filter by name or vitamin..."
                    className="w-full bg-transparent text-sm text-[#141814] placeholder:text-[#8C9589] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Fruits Grid */}
            {filteredFruits.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredFruits.map((fruit, index) => (
                  <FruitCard key={fruit.slug} fruit={fruit} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-[#EBE8DF]">
                <p className="text-lg font-semibold text-[#141814]">No fruits matching "{query}"</p>
                <p className="text-sm text-[#656E62] mt-1">Try searching for mango, banana, or vitamin C</p>
                <button
                  onClick={() => {
                    setQuery("");
                    setSearchParams({});
                  }}
                  className="mt-4 px-4 py-2 bg-[#1F3D1F] text-white text-sm font-medium rounded-full hover:bg-[#162E16] transition"
                >
                  Clear filter
                </button>
              </div>
            )}
          </motion.section>
        )}

        {/* --------------------------------------------------------- */}
        {/* TAB 2: DATA DRIVEN (Real User Data, Height/Weight, Region) */}
        {/* --------------------------------------------------------- */}
        {activeTab === "datadriven" && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="py-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E2ECDC] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1F3D1F] mb-2">
                  <BarChart3 size={13} />
                  Biometrics & Search Intelligence
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-[#141814]">
                  Your Personal Nutrition Cockpit
                </h2>
                <p className="text-sm sm:text-base text-[#656E62] mt-1">
                  Real data stored in your profile: physical metrics, recent searches, health conditions, and calculated BMI.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingMetrics(!editingMetrics)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1F3D1F] hover:bg-[#162E16] text-white text-xs font-bold shadow-xs transition"
                >
                  <Edit3 size={14} />
                  <span>{editingMetrics ? "Close Editor" : "Edit Metrics"}</span>
                </button>

                {!user && (
                  <Link
                    to="/auth/login"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-[#E5E3DA] text-xs font-semibold text-[#141814] hover:bg-[#FAF9F5] transition"
                  >
                    <LogIn size={14} />
                    <span>Sign In to Sync</span>
                  </Link>
                )}
              </div>
            </div>

            {metricSaveSuccess && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
                <Check size={16} className="text-emerald-700" />
                <span>Health metrics updated and saved to your profile!</span>
              </div>
            )}

            {/* Editable Metrics Form */}
            {editingMetrics && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSaveMetrics}
                className="bg-white rounded-[2rem] p-6 sm:p-8 border border-[#E5E3DA] shadow-sm mb-8 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[#EBE8DF] pb-4">
                  <h3 className="text-lg font-bold text-[#141814]">Edit Your Biometric Profile</h3>
                  <span className="text-xs text-[#7C8579]">Updates your personalized fruit scoring</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#7C8579] mb-1.5">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      required
                      value={metricForm.weightKg}
                      onChange={(e) => setMetricForm({ ...metricForm, weightKg: e.target.value })}
                      className="w-full bg-[#FAF9F5] text-sm text-[#141814] px-4 py-2.5 rounded-xl border border-[#E2E0D5] outline-none focus:border-[#1F3D1F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#7C8579] mb-1.5">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      required
                      value={metricForm.heightCm}
                      onChange={(e) => setMetricForm({ ...metricForm, heightCm: e.target.value })}
                      className="w-full bg-[#FAF9F5] text-sm text-[#141814] px-4 py-2.5 rounded-xl border border-[#E2E0D5] outline-none focus:border-[#1F3D1F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#7C8579] mb-1.5">
                      Region
                    </label>
                    <input
                      type="text"
                      required
                      value={metricForm.region}
                      onChange={(e) => setMetricForm({ ...metricForm, region: e.target.value })}
                      className="w-full bg-[#FAF9F5] text-sm text-[#141814] px-4 py-2.5 rounded-xl border border-[#E2E0D5] outline-none focus:border-[#1F3D1F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#7C8579] mb-1.5">
                      Health Conditions (comma separated)
                    </label>
                    <input
                      type="text"
                      value={metricForm.healthConditions}
                      onChange={(e) => setMetricForm({ ...metricForm, healthConditions: e.target.value })}
                      placeholder="e.g. Diabetes, Hypertension, None"
                      className="w-full bg-[#FAF9F5] text-sm text-[#141814] px-4 py-2.5 rounded-xl border border-[#E2E0D5] outline-none focus:border-[#1F3D1F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#7C8579] mb-1.5">
                      Allergies (comma separated)
                    </label>
                    <input
                      type="text"
                      value={metricForm.allergies}
                      onChange={(e) => setMetricForm({ ...metricForm, allergies: e.target.value })}
                      placeholder="e.g. Latex, Citrus, None"
                      className="w-full bg-[#FAF9F5] text-sm text-[#141814] px-4 py-2.5 rounded-xl border border-[#E2E0D5] outline-none focus:border-[#1F3D1F]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingMetrics(false)}
                    className="px-4 py-2 rounded-full border border-[#E0DED5] text-xs font-semibold text-[#656E62]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#1F3D1F] hover:bg-[#162E16] text-white text-xs font-bold shadow-xs transition"
                  >
                    <Save size={13} />
                    <span>Save Profile</span>
                  </button>
                </div>
              </motion.form>
            )}

            {/* Dashboard 4-Card Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {/* Card 1: User & Region */}
              <div className="bg-white rounded-[2rem] p-6 border border-[#E8E6DD] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-2xl bg-[#E2ECDC] text-[#1F3D1F] grid place-items-center">
                    <Globe size={20} />
                  </div>
                  <span className="text-[11px] font-bold text-[#868F83] uppercase tracking-wider">Region</span>
                </div>
                <h4 className="text-xl font-black text-[#141814]">
                  {profileData?.user?.region || profileData?.user?.healthProfile?.region || "Asia / India"}
                </h4>
                <p className="text-xs text-[#7C8579] mt-1">
                  User: {profileData?.user?.name || "Guest User"}
                </p>
              </div>

              {/* Card 2: Weight */}
              <div className="bg-white rounded-[2rem] p-6 border border-[#E8E6DD] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-2xl bg-[#E2ECDC] text-[#1F3D1F] grid place-items-center">
                    <Scale size={20} />
                  </div>
                  <span className="text-[11px] font-bold text-[#868F83] uppercase tracking-wider">Body Weight</span>
                </div>
                <h4 className="text-xl font-black text-[#141814]">
                  {profileData?.user?.healthProfile?.weightKg || metricForm.weightKg} kg
                </h4>
                <p className="text-xs text-[#7C8579] mt-1">
                  Calibrated daily energy balance
                </p>
              </div>

              {/* Card 3: Height */}
              <div className="bg-white rounded-[2rem] p-6 border border-[#E8E6DD] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-2xl bg-[#E2ECDC] text-[#1F3D1F] grid place-items-center">
                    <Ruler size={20} />
                  </div>
                  <span className="text-[11px] font-bold text-[#868F83] uppercase tracking-wider">Height</span>
                </div>
                <h4 className="text-xl font-black text-[#141814]">
                  {profileData?.user?.healthProfile?.heightCm || metricForm.heightCm} cm
                </h4>
                <p className="text-xs text-[#7C8579] mt-1">
                  Standard physiological scale
                </p>
              </div>

              {/* Card 4: Calculated BMI */}
              <div className="bg-white rounded-[2rem] p-6 border border-[#E8E6DD] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-2xl bg-[#E2ECDC] text-[#1F3D1F] grid place-items-center">
                    <Activity size={20} />
                  </div>
                  <span className="text-[11px] font-bold text-[#868F83] uppercase tracking-wider">BMI Diagnostic</span>
                </div>
                {bmiInfo ? (
                  <div>
                    <h4 className="text-xl font-black text-[#141814]">{bmiInfo.val}</h4>
                    <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1 border ${bmiInfo.color}`}>
                      {bmiInfo.status}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-[#7C8579]">Height & weight needed</p>
                )}
              </div>
            </div>

            {/* Health Conditions & Real Search History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Logged Health Conditions & Allergies */}
              <div className="bg-white rounded-[2.25rem] p-6 sm:p-8 border border-[#E8E6DD] shadow-sm space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Heart size={18} className="text-[#1F3D1F]" />
                    <h4 className="text-lg font-bold text-[#141814]">Logged Health Conditions</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const conds = profileData?.user?.healthProfile?.healthConditions;
                      const arr = Array.isArray(conds)
                        ? conds
                        : typeof conds === "string"
                        ? conds.split(",")
                        : ["Borderline Diabetic", "Mild Hypertension"];
                      return arr.map((item, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-red-50 text-red-900 border border-red-200 text-xs font-semibold">
                          🩺 {item.trim()}
                        </span>
                      ));
                    })()}
                  </div>
                </div>

                <div className="border-t border-[#EBE8DF] pt-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7C8579] block mb-2">
                    Allergies & Sensitivities
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const allgs = profileData?.user?.healthProfile?.allergies;
                      const arr = Array.isArray(allgs)
                        ? allgs
                        : typeof allgs === "string"
                        ? allgs.split(",")
                        : ["Latex-fruit allergy"];
                      return arr.map((item, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
                          ⚠️ {item.trim()}
                        </span>
                      ));
                    })()}
                  </div>
                </div>

                <div className="border-t border-[#EBE8DF] pt-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7C8579] block mb-2">
                    Active Fitness & Wellness Goals
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const goals = profileData?.user?.healthProfile?.fitnessGoals;
                      const arr = Array.isArray(goals)
                        ? goals
                        : typeof goals === "string"
                        ? goals.split(",")
                        : ["Blood Sugar Balance", "Immunity", "Active Recovery"];
                      return arr.map((item, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-[#E2ECDC] text-[#1F3D1F] font-semibold text-xs">
                          🎯 {item.trim()}
                        </span>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              {/* Real Fruits Searched History */}
              <div className="bg-white rounded-[2.25rem] p-6 sm:p-8 border border-[#E8E6DD] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Search size={18} className="text-[#1F3D1F]" />
                    <h4 className="text-lg font-bold text-[#141814]">Recent Fruits Searched</h4>
                  </div>
                  <span className="text-xs text-[#868F83]">Live history</span>
                </div>
                <p className="text-xs sm:text-sm text-[#656E62] mb-5">
                  Fruits you or your session queried across search bars and AI intelligence:
                </p>

                <div className="flex flex-wrap gap-2.5">
                  {profileData?.recentSearches && profileData.recentSearches.length > 0 ? (
                    profileData.recentSearches.map((fruitQuery, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuery(fruitQuery);
                          setActiveTab("global");
                        }}
                        className="px-4 py-2 rounded-2xl bg-[#FAF9F5] hover:bg-[#EBECE5] text-[#1F3D1F] border border-[#E0DED3] text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 shadow-2xs"
                      >
                        <Search size={12} className="text-[#868F83]" />
                        <span>{fruitQuery}</span>
                        <ArrowUpRight size={12} className="text-[#868F83]" />
                      </button>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-[#7C8579] w-full bg-[#FAF9F5] rounded-2xl border border-dashed border-[#E5E3DA]">
                      No recorded fruit searches in this session yet. Try searching above!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* --------------------------------------------------------- */}
        {/* TAB 3: DELICIOUS (Choose a fruit to see its recipes)      */}
        {/* --------------------------------------------------------- */}
        {activeTab === "delicious" && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="py-6"
          >
            <div className="bg-white rounded-[2.25rem] p-6 sm:p-8 border border-[#E8E6DD] shadow-sm mb-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E2ECDC] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1F3D1F] mb-2">
                    <ChefHat size={13} />
                    Chef Culinary Intelligence
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-[#141814]">
                    Choose a Fruit for Delicious Recipes
                  </h2>
                  <p className="text-sm sm:text-base text-[#656E62] mt-1">
                    Select your fruit of choice below to reveal matching smoothies, breakfast bowls, and healthy snacks.
                  </p>
                </div>
              </div>

              {/* Fruit Selector Bar */}
              <div className="flex flex-wrap gap-2 sm:gap-2.5 mb-2">
                {RECIPE_FRUITS.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setSelectedRecipeFruit(item.name)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                      selectedRecipeFruit === item.name
                        ? "bg-[#1F3D1F] text-white shadow-sm scale-105"
                        : "bg-[#FAF9F5] hover:bg-[#EBECE5] text-[#141814] border border-[#E0DED3]"
                    }`}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipes Grid */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-bold text-[#141814]">
                  Recipes for {selectedRecipeFruit === "All" ? "All Fruits" : selectedRecipeFruit} ({recipes.length})
                </h3>
              </div>

              {recipesLoading ? (
                <div className="py-16 text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1F3D1F] border-t-transparent mx-auto mb-3" />
                  <p className="text-sm text-[#7C8579]">Loading verified recipes...</p>
                </div>
              ) : recipes.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {recipes.map((recipe, index) => (
                    <div
                      key={recipe.id || index}
                      className="bg-white rounded-[2rem] p-6 border border-[#E8E6DD] shadow-sm flex flex-col justify-between hover:shadow-md transition"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="px-3 py-1 rounded-full bg-[#E2ECDC] text-[#1F3D1F] text-xs font-bold">
                            {recipe.category || "Healthy Dish"}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-[#7C8579]">
                            <Clock size={12} />
                            <span>{recipe.prepTime || "10 mins"}</span>
                          </span>
                        </div>

                        <h4 className="text-xl font-bold text-[#141814] leading-snug mb-2">
                          {recipe.title}
                        </h4>

                        <div className="mb-4">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#868F83] block mb-1">
                            Key Ingredients:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {(recipe.ingredients || []).slice(0, 5).map((ing, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-[#FAF9F5] border border-[#EBE8DF] text-[11px] text-[#4E5C4B]">
                                {ing}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#868F83] block mb-1">
                            Method:
                          </span>
                          <p className="text-xs sm:text-sm text-[#556453] leading-relaxed line-clamp-3">
                            {recipe.method}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-[#EBE8DF] pt-3 flex items-center justify-between text-xs text-[#868F83]">
                        <span>Servings: {recipe.servings || "1-2"}</span>
                        <Link
                          to={`/recipes`}
                          className="font-bold text-[#1F3D1F] hover:underline flex items-center gap-1"
                        >
                          <span>Full Recipe</span>
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-14 bg-white rounded-3xl border border-[#EBE8DF]">
                  <p className="text-lg font-semibold text-[#141814]">No specific recipes listed for {selectedRecipeFruit}</p>
                  <p className="text-sm text-[#656E62] mt-1">Try selecting Mango, Kiwi, Banana, or Avocado above!</p>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* --------------------------------------------------------- */}
        {/* TAB 4: PERSONALIZED (Tailored recommendations for profile) */}
        {/* --------------------------------------------------------- */}
        {activeTab === "personalized" && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="py-6"
          >
            <div className="bg-white rounded-[2.25rem] p-6 sm:p-8 border border-[#E8E6DD] shadow-sm mb-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E2ECDC] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1F3D1F] mb-2">
                    <Heart size={13} />
                    Clinically Tailored
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-[#141814]">
                    Personalized For Your Health Profile
                  </h2>
                  <p className="text-sm sm:text-base text-[#656E62] mt-1">
                    Based on your saved health profile ({user?.name || "Active Session"}), here are optimal fruit choices.
                  </p>
                </div>

                <Link
                  to="/recommendations"
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#1F3D1F] hover:bg-[#162E16] text-white font-bold text-xs sm:text-sm shadow-sm transition shrink-0"
                >
                  <Sparkles size={15} />
                  <span>Open Health AI Assistant</span>
                </Link>
              </div>
            </div>

            {/* Personalized Fruit Recommendations Grid */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {personalizedFruits.map((fruit, index) => (
                <FruitCard key={fruit.slug} fruit={fruit} index={index} />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </PageTransition>
  );
}
