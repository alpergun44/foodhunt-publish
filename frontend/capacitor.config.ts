import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.foodhunt.app',
  appName: 'FoodHunt',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0D0D0D',
    preferredContentMode: 'mobile',
    scheme: 'FoodHunt',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchFadeOutDuration: 3000,
      backgroundColor: '#0D0D0D',
      androidScaleType: 'centerCrop',
      showSpinner: false,
      iosSpinnerStyle: 'white',
      spinnerColor: '#FF6B35',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Geolocation: {
      permissions: ['location'],
    },
  },
};

export default config;
