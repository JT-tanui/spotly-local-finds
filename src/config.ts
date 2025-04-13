
// App configuration settings

type EnvironmentConfig = {
  debug: boolean;
  skipAuthentication: boolean;
  apiUrl: string;
  openAiApiUrl: string;
  useDummyAuth: boolean;  // New field for dummy auth
  dummyAuthCredentials: {  // New field for dummy credentials
    email: string;
    password: string;
  };
};

// Default to production settings
const defaultConfig: EnvironmentConfig = {
  debug: false,
  skipAuthentication: false,
  apiUrl: "https://eawzznzovrgfxdbcdwzv.supabase.co",
  openAiApiUrl: "https://eawzznzovrgfxdbcdwzv.supabase.co/functions/v1/ai-recommendation",
  useDummyAuth: false,
  dummyAuthCredentials: {
    email: "test@gmail.com",
    password: "test@1234"
  }
};

// Load from environment variables if available (for development)
// In a browser environment, these would typically be set via .env files
const envConfig: EnvironmentConfig = {
  debug: import.meta.env.VITE_DEBUG === "true",
  skipAuthentication: import.meta.env.VITE_SKIP_AUTH === "true",
  apiUrl: import.meta.env.VITE_API_URL || defaultConfig.apiUrl,
  openAiApiUrl: import.meta.env.VITE_OPENAI_API_URL || defaultConfig.openAiApiUrl,
  useDummyAuth: import.meta.env.VITE_USE_DUMMY_AUTH === "true",
  dummyAuthCredentials: {
    email: import.meta.env.VITE_DUMMY_AUTH_EMAIL || defaultConfig.dummyAuthCredentials.email,
    password: import.meta.env.VITE_DUMMY_AUTH_PASSWORD || defaultConfig.dummyAuthCredentials.password
  }
};

// Final configuration
const AppConfig = {
  ...defaultConfig,
  ...envConfig,
  isProduction: !envConfig.debug,
};

export default AppConfig;
