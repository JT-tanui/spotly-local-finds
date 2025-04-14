
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core';
import App from './App.tsx'
import './index.css'

// Wait for the device to be ready before mounting the app when running on native platforms
const mount = () => {
  createRoot(document.getElementById("root")!).render(<App />);
};

if (Capacitor.isNativePlatform()) {
  // Wait for device ready event on native platform
  document.addEventListener('deviceready', mount, false);
} else {
  // Mount immediately on web
  mount();
}
