const requiredInProduction = ["JWT_SECRET", "CLIENT_URL"];

export const validateEnv = () => {
  const missing = requiredInProduction.filter((key) => process.env.NODE_ENV === "production" && !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required production environment variables: ${missing.join(", ")}`);
  }

  if (!process.env.USDA_API_KEY) {
    console.warn("USDA_API_KEY is not set. Nutrition live lookups will use DEMO_KEY with strict public limits.");
  }

  if (!process.env.GOOGLE_TRENDS_API_URL) console.warn("Trend API is not available. Live trend data will be omitted.");
};

export const env = {
  port: process.env.PORT || 5050,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  usdaApiKey: process.env.USDA_API_KEY || "DEMO_KEY",
  googleTrendsApiUrl: process.env.GOOGLE_TRENDS_API_URL,
  googleTrendsApiKey: process.env.GOOGLE_TRENDS_API_KEY,
  faostatApiUrl: process.env.FAOSTAT_API_URL || "https://fenixservices.fao.org/faostat/api/v1"
};
