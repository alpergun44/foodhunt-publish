/**
 * FoodHunt — Native Platform Utilities
 *
 * Provides Capacitor-based native features with web fallbacks.
 * All functions are safe to call on both web and native.
 */

/**
 * Check if running in Capacitor native shell (iOS/Android)
 */
export function isNative(): boolean {
  try {
    return !!(window as any).Capacitor?.isNativePlatform?.();
  } catch {
    return false;
  }
}

/**
 * Check if running on iOS specifically
 */
export function isIOS(): boolean {
  try {
    return (window as any).Capacitor?.getPlatform?.() === 'ios';
  } catch {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }
}

/**
 * Trigger haptic feedback (native only, silent on web)
 */
export async function hapticImpact(style: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
  if (!isNative()) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    const styleMap = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    };
    await Haptics.impact({ style: styleMap[style] });
  } catch {
    // Silently fail on web or if plugin not available
  }
}

/**
 * Trigger haptic notification feedback
 */
export async function hapticNotification(type: 'success' | 'warning' | 'error' = 'success'): Promise<void> {
  if (!isNative()) return;
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    const typeMap = {
      success: NotificationType.Success,
      warning: NotificationType.Warning,
      error: NotificationType.Error,
    };
    await Haptics.notification({ type: typeMap[type] });
  } catch {}
}

/**
 * Native share (iOS share sheet) with web fallback
 */
export async function nativeShare(data: { title: string; text: string; url?: string }): Promise<boolean> {
  if (isNative()) {
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share({
        title: data.title,
        text: data.text,
        url: data.url || 'https://foodhunt.app',
        dialogTitle: 'FoodHunt Paylas',
      });
      return true;
    } catch {
      // User cancelled or error — fall through to web
    }
  }

  // Web fallback
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url || window.location.href,
      });
      return true;
    } catch {
      // User cancelled
    }
  }

  return false;
}

/**
 * Configure status bar for dark theme (native only)
 */
export async function configureStatusBar(): Promise<void> {
  if (!isNative()) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    if (isIOS()) {
      await StatusBar.setOverlaysWebView({ overlay: true });
    }
  } catch {}
}

/**
 * Hide splash screen after app is ready
 */
export async function hideSplashScreen(): Promise<void> {
  if (!isNative()) return;
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide({ fadeOutDuration: 300 });
  } catch {}
}
