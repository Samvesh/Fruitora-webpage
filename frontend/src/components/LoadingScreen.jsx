import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.12, 1] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        className="h-16 w-16 rounded-full border border-white/20 border-t-amber-300 shadow-glow"
      />
    </div>
  );
}
