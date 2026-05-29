import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import LoadingScreen from "./components/LoadingScreen";

const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const FruitDetail = lazy(() => import("./pages/FruitDetail"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const Home = lazy(() => import("./pages/Home"));
const MapsPage = lazy(() => import("./pages/MapsPage"));
const RecommendationsPage = lazy(() => import("./pages/RecommendationsPage"));
const RecipesPage = lazy(() => import("./pages/RecipesPage"));

export default function App() {
  const location = useLocation();

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingScreen />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/fruit/:slug" element={<FruitDetail />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/maps" element={<MapsPage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/analytics" element={<AdminDashboard />} />
            <Route path="/auth/:mode" element={<AuthPage />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </Layout>
  );
}
