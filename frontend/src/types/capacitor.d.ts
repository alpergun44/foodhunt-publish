/**
 * Capacitor module declarations for TypeScript
 * These provide minimal type stubs so the project compiles
 * even when @capacitor/* packages are not yet installed.
 * Once packages are installed, these are overridden by real types.
 */

declare module '@capacitor/haptics' {
  export enum ImpactStyle {
    Heavy = 'HEAVY',
    Medium = 'MEDIUM',
    Light = 'LIGHT',
  }
  export enum NotificationType {
    Success = 'SUCCESS',
    Warning = 'WARNING',
    Error = 'ERROR',
  }
  export const Haptics: {
    impact(options: { style: ImpactStyle }): Promise<void>;
    notification(options: { type: NotificationType }): Promise<void>;
  };
}

declare module '@capacitor/share' {
  export const Share: {
    share(options: {
      title?: string;
      text?: string;
      url?: string;
      dialogTitle?: string;
    }): Promise<{ activityType?: string }>;
  };
}

declare module '@capacitor/status-bar' {
  export enum Style {
    Dark = 'DARK',
    Light = 'LIGHT',
    Default = 'DEFAULT',
  }
  export const StatusBar: {
    setStyle(options: { style: Style }): Promise<void>;
    setBackgroundColor(options: { color: string }): Promise<void>;
    setOverlaysWebView(options: { overlay: boolean }): Promise<void>;
  };
}

declare module '@capacitor/splash-screen' {
  export const SplashScreen: {
    hide(options?: { fadeOutDuration?: number }): Promise<void>;
    show(options?: { fadeInDuration?: number; autoHide?: boolean }): Promise<void>;
  };
}

declare module '@capacitor/geolocation' {
  export const Geolocation: {
    getCurrentPosition(options?: {
      enableHighAccuracy?: boolean;
      timeout?: number;
      maximumAge?: number;
    }): Promise<{
      coords: {
        latitude: number;
        longitude: number;
        accuracy: number;
        altitude: number | null;
        altitudeAccuracy: number | null;
        heading: number | null;
        speed: number | null;
      };
      timestamp: number;
    }>;
    requestPermissions(): Promise<{
      location: 'granted' | 'denied' | 'prompt';
      coarseLocation: 'granted' | 'denied' | 'prompt';
    }>;
  };
}

declare module '@capacitor/keyboard' {
  export const Keyboard: {
    setResizeMode(options: { mode: string }): Promise<void>;
  };
}

declare module '@capacitor/core' {
  export const Capacitor: {
    isNativePlatform(): boolean;
    getPlatform(): string;
    isPluginAvailable(name: string): boolean;
  };
}
