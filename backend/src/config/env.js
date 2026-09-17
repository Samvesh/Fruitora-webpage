import "dotenv/config";

const requiredInProduction = ["JWT_SECRET", "CLIENT_URL"];

export const validateEnv = () => {
  const missing = requiredInProduction.filter((key) => process.env.NODE_ENV === "production" && !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  if (!process.env.USDA_API_KEY) {
    console.warn("USDA_API_KEY is not set. Nutrition live lookups will use DEMO_KEY with strict public limits.");
  }

  if (!process.env.GROQ_API_KEY) {
    console.warn("GROQ_API_KEY is not set. AI assistant endpoints will be unavailable.");
  }

  if (!process.env.GOOGLE_TRENDS_API_URL) console.warn("Trend API is not available. Live trend data will be omitted.");
};

export const env = {
  get port() {
    return process.env.PORT || 5050;
  },
  get clientUrl() {
    return process.env.CLIENT_URL || "http://localhost:5173";
  },
  get usdaApiKey() {
    return process.env.USDA_API_KEY || "DEMO_KEY";
  },
  get groqApiKey() {
    const raw = process.env.GROQ_API_KEY;
    if (!raw) return undefined;
    const cleaned = String(raw).trim().replace(/^["']|["']$/g, "");
    return cleaned || undefined;
  },
  get groqModel() {
    return process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  },
  get googleTrendsApiUrl() {
    return process.env.GOOGLE_TRENDS_API_URL;
  },
  get googleTrendsApiKey() {
    return process.env.GOOGLE_TRENDS_API_KEY;
  },
  get faostatApiUrl() {
    return process.env.FAOSTAT_API_URL || "https://fenixservices.fao.org/faostat/api/v1";
  }
};
