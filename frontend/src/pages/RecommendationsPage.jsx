import { motion } from "framer-motion";
import {
  Activity,
  BadgeCheck,
  Ban,
  Bot,
  Send,
  Sparkles,
  Zap
} from "lucide-react";
import { useState } from "react";
import { api } from "../api";
import ChatAssistant from "../components/ChatAssistant";
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
  const [activeTab, setActiveTab] = useState("chat"); // "chat" | "assessment"
  const [profile, setProfile] = useState(emptyProfile);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...profile,
        age: Number(profile.age),
        allergies: profile.allergies
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        healthConditions: profile.healthConditions
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        fitnessGoals: profile.fitnessGoals
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      };
      const { data } = await api.post("/recommendations/health", payload);
      setResult(data);
    } catch (err) {
      console.error("Health assessment error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 py-8 lg:py-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E2ECDC] px-3.5 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#1F3D1F] mb-3">
              <Sparkles size={13} />
              Health AI Suite
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#141814] tracking-tight">
              Intelligent Fruit Health
            </h1>
            <p className="mt-3 text-base sm:text-lg text-[#656E62] max-w-2xl font-normal">
              Get instant RAG-powered answers from our Groq AI assistant or generate a full dietary profile assessment.
            </p>
          </div>

          {/* Navigation Pill Switcher */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#EBECE5] border border-[#E0E2D8] self-start md:self-auto shrink-0 shadow-inner">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === "chat"
                  ? "bg-[#1F3D1F] text-white shadow-sm"
                  : "text-[#555E53] hover:text-[#141814] hover:bg-white/60"
              }`}
            >
              <Bot size={16} />
              <span>AI Nutritionist</span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  activeTab === "chat" ? "bg-[#E2ECDC] text-[#1F3D1F]" : "bg-[#DDE1D7] text-[#4A5547]"
                }`}
              >
                RAG
              </span>
            </button>

            <button
              onClick={() => setActiveTab("assessment")}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === "assessment"
                  ? "bg-[#1F3D1F] text-white shadow-sm"
                  : "text-[#555E53] hover:text-[#141814] hover:bg-white/60"
              }`}
            >
              <Activity size={16} />
              <span>Health Assessment</span>
            </button>
          </div>
        </div>

        {/* Tab 1: AI Nutritionist (Chatbot) */}
        {activeTab === "chat" && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 items-start"
          >
            {/* Left Sidebar: Assistant Info & Capabilities */}
            <div className="space-y-6">
              <div className="bg-white rounded-[2rem] p-6 border border-[#EBE8DF] shadow-sm">
                <div className="h-12 w-12 rounded-2xl bg-[#E2ECDC] text-[#1F3D1F] grid place-items-center mb-4">
                  <Sparkles size={24} />
                </div>
                <h2 className="text-xl font-bold text-[#141814] mb-2">
                  All-in-One Nutritionist
                </h2>
                <p className="text-sm text-[#656E62] leading-relaxed mb-5">
                  Fruitora's AI merges verified fruit science, seasonality, nutrition facts, and your personal profile in real-time.
                </p>

                <div className="space-y-3 border-t border-[#EBE8DF] pt-4">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#141814]">Personalized RAG</p>
                      <p className="text-xs text-[#7C8579]">
                        Reads your favorite fruits, dietary constraints, and recent nutrition queries.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#141814]">Fruit Q&A & Pairings</p>
                      <p className="text-xs text-[#7C8579]">
                        Get delicious recipes, optimal eating times, and glycemic index breakdowns.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#141814]">Guest & Member Support</p>
                      <p className="text-xs text-[#7C8579]">
                        Works instantly for anyone with optional sign-in personalization.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Model Tech Card */}
              <div className="bg-[#E2ECDC] rounded-[2rem] p-6 border border-[#D5E1CE] shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1F3D1F] mb-2">
                  <Zap size={14} />
                  <span>Ultra-Fast Groq Inference</span>
                </div>
                <h3 className="text-base font-extrabold text-[#141814] mb-1">
                  Powered by Llama 3.3 70B
                </h3>
                <p className="text-xs text-[#4E5C4B] leading-relaxed">
                  Streaming chunked responses at 300+ tokens/sec with strict backend key isolation and injection guardrails.
                </p>
              </div>
            </div>

            {/* Right Main Column: Chat Assistant Widget */}
            <div>
              <ChatAssistant />
            </div>
          </motion.div>
        )}

        {/* Tab 2: Health Assessment Engine */}
        {activeTab === "assessment" && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="grid gap-8 lg:grid-cols-[400px_1fr]"
          >
            {/* Form Column */}
            <form onSubmit={submit} className="bg-white rounded-[2rem] p-6 border border-[#EBE8DF] shadow-sm h-fit sticky top-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#E2ECDC] text-[#1F3D1F]">
                  <Activity size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#868F83]">Assessment Engine</p>
                  <h2 className="text-xl font-bold text-[#141814]">Tell Fruitora about you</h2>
                </div>
              </div>

              <div className="grid gap-3">
                {[
                  ["age", "Age", "28"],
                  ["region", "Region", "Asia"],
                  ["allergies", "Allergies", "latex, dairy"],
                  ["healthConditions", "Health conditions", "heart health, diabetes"],
                  ["fitnessGoals", "Fitness goals", "fitness recovery, immunity"]
                ].map(([key, label, placeholder]) => (
                  <label key={key} className="grid gap-1.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE8DE] p-3.5 focus-within:border-[#1F3D1F] focus-within:bg-white transition">
                    <span className="text-xs font-semibold text-[#656E62]">{label}</span>
                    <input
                      value={profile[key]}
                      onChange={(event) => setProfile((current) => ({ ...current, [key]: event.target.value }))}
                      placeholder={placeholder}
                      className="bg-transparent text-sm text-[#141814] outline-none placeholder:text-[#9EA79C]"
                    />
                  </label>
                ))}
              </div>

              <button
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#1F3D1F] hover:bg-[#162E16] px-5 py-3.5 font-bold text-white shadow-sm transition disabled:opacity-60"
                disabled={loading}
              >
                <Send size={16} />
                <span>{loading ? "Calculating guidance..." : "Generate guidance"}</span>
              </button>
            </form>

            {/* Results Column */}
            <div>
              {result ? (
                <div className="grid gap-6">
                  <div className="grid gap-5 xl:grid-cols-2">
                    {result.suitable.map((fruit, index) => (
                      <FruitCard key={fruit.slug} fruit={fruit} index={index} />
                    ))}
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="bg-white rounded-[2rem] p-6 border border-[#EBE8DF] shadow-sm">
                      <div className="h-10 w-10 rounded-xl bg-red-100 text-red-700 grid place-items-center mb-3">
                        <Ban size={20} />
                      </div>
                      <h3 className="text-xl font-bold text-[#141814]">Fruits to avoid or review</h3>
                      <div className="mt-4 grid gap-2">
                        {(result.avoid.length ? result.avoid : ["No verified live cautions found for this profile."]).map(
                          (item) => (
                            <p key={item} className="rounded-2xl bg-[#FAF9F5] border border-[#EBE8DF] p-3.5 text-sm text-[#555E53]">
                              {item}
                            </p>
                          )
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-6 border border-[#EBE8DF] shadow-sm">
                      <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-800 grid place-items-center mb-3">
                        <BadgeCheck size={20} />
                      </div>
                      <h3 className="text-xl font-bold text-[#141814]">Daily guidance</h3>
                      <div className="mt-4 grid gap-2">
                        {result.dailyGuidance.map((item) => (
                          <p key={item} className="rounded-2xl bg-[#FAF9F5] border border-[#EBE8DF] p-3.5 text-sm text-[#555E53]">
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[2rem] p-12 text-center border border-[#EBE8DF] shadow-sm">
                  <div className="h-16 w-16 rounded-3xl bg-[#E2ECDC] text-[#1F3D1F] grid place-items-center mx-auto mb-4">
                    <Activity size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-[#141814] mb-2">
                    Custom Nutrition Assessment
                  </h3>
                  <p className="mx-auto max-w-md text-sm text-[#656E62] leading-relaxed">
                    Submit your profile to receive suitable fruits, daily serving guidance, allergy-aware cautions, and nutritional reasoning.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
