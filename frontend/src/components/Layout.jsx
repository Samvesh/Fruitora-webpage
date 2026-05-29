import { Apple, BarChart3, Compass, History, LogIn, Map, Menu, Sparkles, Utensils, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const nav = [
  { to: "/", label: "Home", icon: Apple },
  { to: "/history", label: "History", icon: History },
  { to: "/maps", label: "Maps", icon: Map },
  { to: "/recipes", label: "Recipes", icon: Utensils },
  { to: "/recommendations", label: "Health AI", icon: Compass },
  { to: "/analytics", label: "Analytics", icon: BarChart3 }
];

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed left-0 right-0 top-0 z-50 px-4 py-4"
      >
        <nav className="glass mx-auto flex max-w-7xl items-center justify-between rounded-full px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-night shadow-glow">
              <Sparkles size={19} />
            </span>
            <span className="font-display text-2xl font-bold tracking-normal">Fruitora</span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                    isActive ? "bg-white text-night" : "text-white/72 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {user ? (
              <>
                <span className="text-sm text-white/70">{user.name}</span>
                <button className="rounded-full bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/18" onClick={logout}>
                  Sign out
                </button>
              </>
            ) : (
              <Link className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-night" to="/auth/login">
                <LogIn size={16} />
                Login
              </Link>
            )}
          </div>

          <button className="grid h-10 w-10 place-items-center rounded-full bg-white/10 lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Open navigation">
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </nav>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass mx-auto mt-3 grid max-w-7xl gap-2 rounded-3xl p-3 lg:hidden">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-2xl px-4 py-3 text-white/80">
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </motion.div>
        )}
      </motion.header>

      <main className="min-h-screen pt-24">{children}</main>
    </>
  );
}
