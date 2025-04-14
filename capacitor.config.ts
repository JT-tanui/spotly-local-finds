
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a1430bc8a6324cb583d59f40e2a9da87',
  appName: 'spotly-local-finds',
  webDir: 'dist',
  server: {
    url: "https://a1430bc8-a632-4cb5-83d5-9f40e2a9da87.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
    },
  }
};

export default config;
