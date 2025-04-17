
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.dinex.food',
  appName: 'Dinex',
  webDir: 'dist',
  server: {
    url: "https://a1430bc8-a632-4cb5-83d5-9f40e2a9da87.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#FFFFFF",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP"
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#E11D48"
    },
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
