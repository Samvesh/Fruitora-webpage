import {
  ArrowRight,
  Eye,
  EyeOff,
  Globe,
  Heart,
  Lock,
  Mail,
  Scale,
  Ruler,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { mode } = useParams();
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const demoLoginEnabled = import.meta.env.VITE_ENABLE_DEMO_LOGIN === "true";
  const demoEmail = import.meta.env.VITE_DEMO_EMAIL;
  const demoPassword = import.meta.env.VITE_DEMO_PASSWORD;

  if (demoLoginEnabled && (!demoEmail || !demoPassword)) {
    throw new Error("VITE_DEMO_EMAIL and VITE_DEMO_PASSWORD must be set when demo login is enabled.");
  }

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    region: "Asia / India",
    weightKg: "68",
    heightCm: "175",
    healthConditions: "Borderline Diabetic",
    allergies: "None",
    fitnessGoals: "Blood Sugar Balance, Immunity"
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          region: form.region.trim(),
          weightKg: Number(form.weightKg) || null,
          heightCm: Number(form.heightCm) || null,
          healthConditions: form.healthConditions,
          allergies: form.allergies,
          fitnessGoals: form.fitnessGoals
        });
      } else {
        await login({
          email: form.email.trim(),
          password: form.password
        });
      }
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Authentication failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Demo Login Handler
  const handleDemoLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await login({
        email: demoEmail,
        password: demoPassword
      });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to log in with demo account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="w-full max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-14 py-8 lg:py-14 min-h-[calc(100vh-100px)] flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center w-full max-w-5xl">
          {/* Left Column: Value Proposition & Aesthetics */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E2ECDC] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#1F3D1F]">
              <ShieldCheck size={14} />
              Secure JWT Authentication
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#141814] tracking-tight leading-[1.08]">
              {isRegister
                ? "Join Fruitora's Health Intelligence."
                : "Welcome back to your fruit universe."}
            </h1>

            <p className="text-base sm:text-lg text-[#656E62] leading-relaxed max-w-lg">
              Unlock personalized fruit guidance based on your actual height, weight, health conditions, and dietary history.
            </p>

            {/* Feature Badges */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-white rounded-2xl p-4 border border-[#E8E6DD] shadow-2xs">
                <div className="h-9 w-9 rounded-xl bg-[#E2ECDC] text-[#1F3D1F] grid place-items-center mb-2">
                  <Heart size={18} />
                </div>
                <h4 className="text-sm font-bold text-[#141814]">Personalized RAG</h4>
                <p className="text-xs text-[#7C8579] mt-0.5">Biometrics & health constraints</p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#E8E6DD] shadow-2xs">
                <div className="h-9 w-9 rounded-xl bg-[#E2ECDC] text-[#1F3D1F] grid place-items-center mb-2">
                  <Scale size={18} />
                </div>
                <h4 className="text-sm font-bold text-[#141814]">Data-Driven Health</h4>
                <p className="text-xs text-[#7C8579] mt-0.5">BMI & search history tracking</p>
              </div>
            </div>

            {demoLoginEnabled && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#E2ECDC] border border-[#D5E1CE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1F3D1F] uppercase tracking-wider">
                    <Sparkles size={13} />
                    <span>Instant Demo Account</span>
                  </div>
                  <p className="text-xs text-[#52604F] mt-0.5">
                    Test with pre-filled metrics (Alex Morgan, 68kg, 175cm, India)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-[#1F3D1F] hover:bg-[#162E16] text-white text-xs font-bold shadow-xs transition"
                >
                  <UserCheck size={14} />
                  <span>1-Click Demo Login</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Authentication Card */}
          <div className="bg-white rounded-[2.5rem] p-7 sm:p-10 border border-[#E8E5DC] shadow-sm">
            {/* Header Switcher */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-[#141814]">
                  {isRegister ? "Create Account" : "Sign In"}
                </h2>
                <p className="text-xs text-[#7C8579] mt-0.5">
                  {isRegister
                    ? "Enter your credentials & biometrics"
                    : "Access your nutrition cockpit"}
                </p>
              </div>

              {/* Mode Switcher Pill */}
              <div className="flex items-center p-1 rounded-full bg-[#F3F2EC] border border-[#E8E6DD]">
                <button
                  type="button"
                  onClick={() => navigate("/auth/login")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                    !isRegister
                      ? "bg-[#1F3D1F] text-white shadow-xs"
                      : "text-[#656E62] hover:text-[#141814]"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/auth/register")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                    isRegister
                      ? "bg-[#1F3D1F] text-white shadow-xs"
                      : "text-[#656E62] hover:text-[#141814]"
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5">
                <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-3.5">
              {isRegister && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C8579] mb-1.5">
                    Your Full Name
                  </label>
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#FAF9F5] border border-[#E5E3DA] focus-within:border-[#1F3D1F] focus-within:bg-white transition">
                    <User size={16} className="text-[#868F83] shrink-0" />
                    <input
                      required
                      type="text"
                      placeholder="e.g. Alex Morgan"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-transparent text-sm text-[#141814] outline-none placeholder:text-[#9DA69B]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C8579] mb-1.5">
                  Email Address
                </label>
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#FAF9F5] border border-[#E5E3DA] focus-within:border-[#1F3D1F] focus-within:bg-white transition">
                  <Mail size={16} className="text-[#868F83] shrink-0" />
                  <input
                    required
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-transparent text-sm text-[#141814] outline-none placeholder:text-[#9DA69B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C8579] mb-1.5">
                  Password
                </label>
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#FAF9F5] border border-[#E5E3DA] focus-within:border-[#1F3D1F] focus-within:bg-white transition">
                  <Lock size={16} className="text-[#868F83] shrink-0" />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-transparent text-sm text-[#141814] outline-none placeholder:text-[#9DA69B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#868F83] hover:text-[#141814] p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {isRegister && (
                <>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#7C8579] mb-1.5">
                        Region
                      </label>
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-[#FAF9F5] border border-[#E5E3DA] focus-within:border-[#1F3D1F] focus-within:bg-white transition">
                        <Globe size={15} className="text-[#868F83] shrink-0" />
                        <input
                          type="text"
                          placeholder="e.g. Asia / India"
                          value={form.region}
                          onChange={(e) => setForm({ ...form, region: e.target.value })}
                          className="w-full bg-transparent text-xs sm:text-sm text-[#141814] outline-none placeholder:text-[#9DA69B]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#7C8579] mb-1.5">
                        Weight (kg)
                      </label>
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-[#FAF9F5] border border-[#E5E3DA] focus-within:border-[#1F3D1F] focus-within:bg-white transition">
                        <Scale size={15} className="text-[#868F83] shrink-0" />
                        <input
                          type="number"
                          placeholder="68"
                          value={form.weightKg}
                          onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                          className="w-full bg-transparent text-xs sm:text-sm text-[#141814] outline-none placeholder:text-[#9DA69B]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#7C8579] mb-1.5">
                        Height (cm)
                      </label>
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-[#FAF9F5] border border-[#E5E3DA] focus-within:border-[#1F3D1F] focus-within:bg-white transition">
                        <Ruler size={15} className="text-[#868F83] shrink-0" />
                        <input
                          type="number"
                          placeholder="175"
                          value={form.heightCm}
                          onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
                          className="w-full bg-transparent text-xs sm:text-sm text-[#141814] outline-none placeholder:text-[#9DA69B]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#7C8579] mb-1.5">
                        Health Issues
                      </label>
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-[#FAF9F5] border border-[#E5E3DA] focus-within:border-[#1F3D1F] focus-within:bg-white transition">
                        <Heart size={15} className="text-[#868F83] shrink-0" />
                        <input
                          type="text"
                          placeholder="e.g. Diabetes, None"
                          value={form.healthConditions}
                          onChange={(e) => setForm({ ...form, healthConditions: e.target.value })}
                          className="w-full bg-transparent text-xs sm:text-sm text-[#141814] outline-none placeholder:text-[#9DA69B]"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#1F3D1F] hover:bg-[#162E16] text-white py-3.5 px-5 font-bold text-sm shadow-sm transition disabled:opacity-50"
              >
                <span>{loading ? "Processing..." : isRegister ? "Create Free Account" : "Sign In"}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-[#7C8579]">
              {isRegister ? "Already registered?" : "Don't have an account yet?"}{" "}
              <Link
                to={isRegister ? "/auth/login" : "/auth/register"}
                className="text-[#1F3D1F] font-bold hover:underline"
              >
                {isRegister ? "Sign in here" : "Create an account in 30s"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
