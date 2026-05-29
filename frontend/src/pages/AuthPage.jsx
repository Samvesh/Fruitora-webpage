import { motion } from "framer-motion";
import { Lock, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";

export default function AuthPage() {
  const { mode } = useParams();
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", region: "Global" });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      if (isRegister) await register(form);
      else await login({ email: form.email, password: form.password });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed");
    }
  };

  return (
    <PageTransition className="page-shell grid min-h-[calc(100vh-96px)] items-center gap-8 pb-16 lg:grid-cols-[1fr_480px]">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-amber-200">Secure account</p>
        <h1 className="mt-3 text-5xl font-black sm:text-7xl">{isRegister ? "Create your nutrition cockpit." : "Welcome back to your fruit universe."}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/62">
          JWT authentication, encrypted passwords, profile persistence, and health preferences are ready for production MongoDB storage.
        </p>
      </div>

      <form onSubmit={submit} className="glass rounded-[2.5rem] p-7">
        <h2 className="text-3xl font-black">{isRegister ? "Register" : "Login"}</h2>
        <div className="mt-6 grid gap-4">
          {isRegister && (
            <label className="flex items-center gap-3 rounded-2xl bg-black/22 px-4 py-3">
              <UserRound className="text-white/38" />
              <input className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
          )}
          <label className="flex items-center gap-3 rounded-2xl bg-black/22 px-4 py-3">
            <Mail className="text-white/38" />
            <input className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </label>
          <label className="flex items-center gap-3 rounded-2xl bg-black/22 px-4 py-3">
            <Lock className="text-white/38" />
            <input className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </label>
          {isRegister && (
            <input className="rounded-2xl bg-black/22 px-4 py-4 outline-none" placeholder="Region" value={form.region} onChange={(event) => setForm({ ...form, region: event.target.value })} />
          )}
        </div>
        {error && <p className="mt-4 rounded-2xl bg-red-500/12 p-3 text-sm text-red-200">{error}</p>}
        <button className="mt-6 w-full rounded-full bg-white px-5 py-4 font-bold text-night">{isRegister ? "Create account" : "Login"}</button>
        <p className="mt-5 text-center text-sm text-white/50">
          {isRegister ? "Already have an account?" : "New here?"}{" "}
          <Link className="text-white underline" to={isRegister ? "/auth/login" : "/auth/register"}>
            {isRegister ? "Login" : "Register"}
          </Link>
        </p>
      </form>
    </PageTransition>
  );
}
