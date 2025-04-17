
/**
 * Deployment configuration for Dinex application
 * 
 * This file contains settings for both web and mobile deployment
 */

export const WebDeploymentConfig = {
  // Web-specific settings
  title: "Dinex - Discover Local Food & Events",
  description: "Find and book the best local restaurants, cafes, and food events in your area.",
  metaTags: {
    ogTitle: "Dinex - Discover Local Food & Events",
    ogDescription: "Find and book the best local restaurants, cafes, and food events in your area.",
    ogImage: "/og-image.jpg",
    twitterCard: "summary_large_image",
  },
  // PWA settings
  pwa: {
    enabled: true,
    manifestFile: "manifest.webmanifest",
    serviceWorker: "service-worker.js",
    icons: {
      favicon: "/favicon.ico",
      appleTouchIcon: "/apple-touch-icon.png",
      maskIcon: "/safari-pinned-tab.svg",
    }
  },
  // Security headers
  securityHeaders: {
    contentSecurityPolicy: {
      // Modify as needed for your specific app requirements
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.gpteng.co"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "https://i.pravatar.cc"],
        connectSrc: ["'self'", "https:", "wss:"]
      }
    },
    xFrameOptions: "DENY",
    xContentTypeOptions: "nosniff",
    referrerPolicy: "strict-origin-when-cross-origin",
    permissionsPolicy: "camera=(), microphone=(), geolocation=(self)"
  }
};

export const MobileDeploymentConfig = {
  android: {
    // Google Play Store submission details
    packageName: "app.dinex.food",
    versionCode: 1,
    versionName: "1.0.0",
    minSdkVersion: 21, // Android 5.0
    targetSdkVersion: 30, // Android 11
    permissions: [
      "android.permission.INTERNET",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.CAMERA",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE"
    ],
    // Google Play Store listing
    playStore: {
      appName: "Dinex - Food Discovery",
      shortDescription: "Discover and book local restaurants & food events",
      fullDescription: 
        "Dinex helps you discover amazing local restaurants, cafes, and culinary events in your area. " +
        "Browse menus, see photos, read reviews, and book tables directly through the app. " +
        "Join food events and connect with other food enthusiasts in your community.",
      category: "FOOD_AND_DRINK",
      contentRating: "Everyone",
      countries: "all",
      contactEmail: "support@dinex.app",
      privacyPolicyUrl: "https://dinex.app/privacy-policy"
    }
  },
  ios: {
    // App Store submission details
    bundleId: "app.dinex.food",
    version: "1.0.0",
    buildNumber: "1",
    minimumOSVersion: "13.0",
    deviceFamily: ["1", "2"], // iPhone and iPad
    capabilities: [
      "LOCATION_WHEN_IN_USE",
      "CAMERA",
      "PHOTO_LIBRARY"
    ],
    // App Store listing
    appStore: {
      appName: "Dinex - Food Discovery",
      subtitle: "Discover Local Food & Events",
      category: "Food & Drink",
      secondaryCategory: "Lifestyle",
      keywords: "food,restaurants,dining,events,local,discovery,booking",
      promotionalText: "Discover amazing local food experiences and events!",
      description: 
        "Dinex helps you discover amazing local restaurants, cafes, and culinary events in your area. " +
        "Browse menus, see photos, read reviews, and book tables directly through the app. " +
        "Join food events and connect with other food enthusiasts in your community.\n\n" +
        "Features:\n" +
        "• Discover restaurants and cafes near you\n" +
        "• View detailed menus, photos, and reviews\n" +
        "• Book tables directly through the app\n" +
        "• Join and create local food events\n" +
        "• Save favorite places for quick access\n" +
        "• Get personalized food recommendations",
      privacyPolicyUrl: "https://dinex.app/privacy-policy",
      supportUrl: "https://dinex.app/support",
      marketingUrl: "https://dinex.app"
    }
  },
  // Common settings for both platforms
  common: {
    deepLinking: {
      enabled: true,
      appScheme: "dinex",
      universalLinks: ["https://dinex.app/share"]
    },
    pushNotifications: {
      enabled: true
    },
    analytics: {
      enabled: true
    }
  }
};
