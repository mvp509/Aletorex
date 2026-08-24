import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const initMobileApp = async (): Promise<void> => {
  if (!isNativePlatform()) return;

  try {
    // Configure Status Bar
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#030712' });
  } catch (err) {
    console.debug('StatusBar not supported on this platform', err);
  }

  try {
    // Hide Splash Screen once webview is ready
    await SplashScreen.hide({ fadeOutDuration: 400 });
  } catch (err) {
    console.debug('SplashScreen not supported on this platform', err);
  }
};

export const triggerHapticFeedback = async (
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'
): Promise<void> => {
  if (!isNativePlatform()) return;

  try {
    switch (type) {
      case 'light':
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
      case 'medium':
        await Haptics.impact({ style: ImpactStyle.Medium });
        break;
      case 'heavy':
        await Haptics.impact({ style: ImpactStyle.Heavy });
        break;
      case 'success':
        await Haptics.notification({ type: NotificationType.Success });
        break;
      case 'warning':
        await Haptics.notification({ type: NotificationType.Warning });
        break;
      case 'error':
        await Haptics.notification({ type: NotificationType.Error });
        break;
    }
  } catch (err) {
    console.debug('Haptics not supported on this platform', err);
  }
};
