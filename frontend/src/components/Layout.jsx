import { ArrowRight, LogOut, Menu, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/history", label: "History" },
  { to: "/recipes", label: "Recipes" },
  { to: "/recommendations", label: "Health AI" },
  { to: "/analytics", label: "Analytics" }
];

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F1] text-[#141814] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#F7F6F1]/95 backdrop-blur-md px-6 sm:px-10 lg:px-14 py-4 border-b border-[#EBE8DF]/80">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
          {/* Logo Wordmark */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <span className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-[#141814] transition group-hover:opacity-85">
              Fruitoria
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[#E2ECDC] text-[#1F3D1F] font-semibold"
                      : "text-[#555E53] hover:text-[#141814] hover:bg-[#EBECE5]/60"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Search bar & Login Button */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="flex items-center gap-2 bg-[#EBEAE4] hover:bg-[#E5E4DC] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1F3D1F]/20 rounded-full px-3.5 py-1.5 transition-all w-48 xl:w-56">
                <Search size={16} className="text-[#7C8579] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search fruits..."
                  className="w-full bg-transparent text-sm text-[#141814] placeholder:text-[#8C9589] outline-none"
                />
              </div>
            </form>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#1F3D1F] bg-[#E2ECDC] px-3 py-1 rounded-full">
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="rounded-full p-2 text-[#555E53] hover:text-[#1F3D1F] hover:bg-[#EBECE5] transition"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-2 rounded-full bg-[#1F3D1F] hover:bg-[#162E16] text-white px-5 py-2 text-sm font-medium shadow-sm transition-all duration-200 hover:shadow"
              >
                <span>Login</span>
                <ArrowRight size={15} />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-full bg-[#EBEAE4] text-[#141814] hover:bg-[#E2E1D8] transition"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-3 pt-3 border-t border-[#E8E6DC] flex flex-col gap-2 overflow-hidden"
            >
              <form onSubmit={handleSearchSubmit} className="mb-2">
                <div className="flex items-center gap-2 bg-[#EBEAE4] rounded-full px-3.5 py-2">
                  <Search size={16} className="text-[#7C8579]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search fruits..."
                    className="w-full bg-transparent text-sm text-[#141814] outline-none"
                  />
                </div>
              </form>

              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? "bg-[#E2ECDC] text-[#1F3D1F] font-semibold"
                        : "text-[#555E53] hover:bg-[#EBECE5]"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}

              <div className="pt-2">
                {user ? (
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50"
                  >
                    Sign out ({user.name})
                  </button>
                ) : (
                  <Link
                    to="/auth/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-full bg-[#1F3D1F] text-white py-2.5 text-sm font-medium"
                  >
                    <span>Login</span>
                    <ArrowRight size={15} />
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}
