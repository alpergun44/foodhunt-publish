import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.foodhunt.app',
  appName: 'FoodHunt',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0D0D0D',
    preferredContentMode: 'mobile',
    scheme: 'FoodHunt',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0D0D0D',
      showSpinner: false,
      launchAutoHide: true,
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
