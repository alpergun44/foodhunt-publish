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
    backgroundColor: '#0A1628',
    preferredContentMode: 'mobile',
    scheme: 'FoodHunt',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchFadeOutDuration: 3000,
      backgroundColor: '#0A1628',
      androidScaleType: 'centerCrop',
      showSpinner: false,
      iosSpinnerStyle: 'white',
      spinnerColor: '#E23744',
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
