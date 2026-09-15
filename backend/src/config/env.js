const requiredOnStartup = [
  "DEMO_USER_EMAIL",
  "DEMO_USER_PASSWORD",
  "SEED_ADMIN_EMAIL",
  "SEED_ADMIN_PASSWORD"
];
const requiredInProduction = ["JWT_SECRET", "CLIENT_URL"];

export const validateEnv = () => {
  const missing = [
    ...requiredOnStartup.filter((key) => !process.env[key]),
    ...requiredInProduction.filter((key) => process.env.NODE_ENV === "production" && !process.env[key])
  ];
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
  port: process.env.PORT || 5050,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  usdaApiKey: process.env.USDA_API_KEY || "DEMO_KEY",
  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  googleTrendsApiUrl: process.env.GOOGLE_TRENDS_API_URL,
  googleTrendsApiKey: process.env.GOOGLE_TRENDS_API_KEY,
  faostatApiUrl: process.env.FAOSTAT_API_URL || "https://fenixservices.fao.org/faostat/api/v1"
};
