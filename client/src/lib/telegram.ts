// Telegram Mini App SDK Integration
// This module handles Telegram WebApp initialization and user data extraction

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    auth_date?: number;
    hash?: string;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  onEvent: (eventType: string, callback: () => void) => void;
  offEvent: (eventType: string, callback: () => void) => void;
  sendData: (data: string) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  showPopup: (params: any) => void;
  showAlert: (message: string) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  showScanQrPopup: (params: any) => void;
  closeScanQrPopup: () => void;
  readTextFromClipboard: (callback?: (text: string | null) => void) => void;
  requestWriteAccess: (callback?: (granted: boolean) => void) => void;
  requestContactAccess: (callback?: (granted: boolean) => void) => void;
  invokeCustomMethod: (method: string, params: any, callback?: (result: any) => void) => void;
  isVersionAtLeast: (version: string) => boolean;
  setBottomBarColor: (color: string) => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  setTextStyle: (style: string) => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
  };
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  CloudStorage: {
    getItem: (key: string, callback?: (error: any, value: string | null) => void) => void;
    setItem: (key: string, value: string, callback?: (error: any) => void) => void;
    removeItem: (key: string, callback?: (error: any) => void) => void;
    getKeys: (callback?: (error: any, keys: string[]) => void) => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

// Check if app is running in Telegram environment
export function isTelegramEnvironment(): boolean {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp;
}

// Get Telegram WebApp instance
export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp || null;
}

// Initialize Telegram WebApp
export function initializeTelegram(): TelegramWebApp | null {
  const webApp = getTelegramWebApp();
  if (!webApp) return null;

  // Notify Telegram that the app is ready
  webApp.ready();

  // Expand the app to full height
  webApp.expand();

  // Set color scheme
  webApp.setBackgroundColor('#e3f2fd'); // Light blue background
  webApp.setHeaderColor('#1e88e5'); // Darker blue header

  return webApp;
}

// Get current Telegram user
export function getTelegramUser(): TelegramUser | null {
  const webApp = getTelegramWebApp();
  if (!webApp) return null;

  return webApp.initDataUnsafe?.user || null;
}

// Get user's Telegram ID
export function getTelegramUserId(): number | null {
  const user = getTelegramUser();
  return user?.id || null;
}

// Get user's username
export function getTelegramUsername(): string | null {
  const user = getTelegramUser();
  return user?.username || null;
}

// Get user's full name
export function getTelegramFullName(): string {
  const user = getTelegramUser();
  if (!user) return '';
  
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  return `${firstName} ${lastName}`.trim();
}

// Get user's first name
export function getTelegramFirstName(): string {
  const user = getTelegramUser();
  return user?.first_name || '';
}

// Get user's photo URL
export function getTelegramPhotoUrl(): string | null {
  const user = getTelegramUser();
  return user?.photo_url || null;
}

// Get init data for backend verification
export function getTelegramInitData(): string {
  const webApp = getTelegramWebApp();
  return webApp?.initData || '';
}

// Show alert in Telegram
export function showTelegramAlert(message: string): void {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.showAlert(message);
  }
}

// Show confirm dialog in Telegram
export function showTelegramConfirm(
  message: string,
  callback?: (confirmed: boolean) => void
): void {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.showConfirm(message, callback);
  }
}

// Trigger haptic feedback
export function triggerHapticFeedback(
  type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning'
): void {
  const webApp = getTelegramWebApp();
  if (!webApp?.HapticFeedback) return;

  if (type === 'light' || type === 'medium' || type === 'heavy') {
    webApp.HapticFeedback.impactOccurred(type);
  } else if (type === 'success' || type === 'error' || type === 'warning') {
    webApp.HapticFeedback.notificationOccurred(type);
  }
}

// Copy text to clipboard
export function copyToClipboard(text: string): void {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

// Open link in Telegram
export function openTelegramLink(url: string): void {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.openLink(url);
  } else {
    window.open(url, '_blank');
  }
}

// Get Telegram init data hash for backend verification
export function getTelegramHash(): string | undefined {
  const webApp = getTelegramWebApp();
  return webApp?.initDataUnsafe?.hash;
}
