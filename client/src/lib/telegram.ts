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
    impactOccurred: (style: "light" | "medium" | "heavy") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
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

/**
 * Check if the URL contains Telegram Mini App launch parameters.
 * Telegram passes data in the hash fragment: #tgWebAppData=...
 */
function hasTelegramHashParams(): boolean {
  if (typeof window === "undefined") return false;
  const hash = window.location.hash;
  return hash.includes("tgWebAppData") || hash.includes("tgWebAppVersion") || hash.includes("tgWebAppPlatform");
}

/**
 * Check if running inside Telegram Mini App environment.
 * Uses multiple signals for robustness:
 *   1. window.Telegram.WebApp (SDK injected by Telegram native client)
 *   2. URL hash parameters (passed by Telegram on launch)
 */
export function isTelegramEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  if (window.Telegram?.WebApp) return true;
  if (hasTelegramHashParams()) return true;
  return false;
}

/** Wait up to `timeoutMs` for the Telegram SDK to be ready. */
export function waitForTelegramEnvironment(timeoutMs = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    if (isTelegramEnvironment()) {
      resolve(true);
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      if (isTelegramEnvironment()) {
        clearInterval(interval);
        resolve(true);
      } else if (Date.now() - start >= timeoutMs) {
        clearInterval(interval);
        resolve(false);
      }
    }, 100);
  });
}

// Get Telegram WebApp instance
export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp || null;
}

// Initialize Telegram WebApp
export function initializeTelegram(): TelegramWebApp | null {
  const webApp = getTelegramWebApp();
  if (!webApp) return null;

  webApp.ready();
  webApp.expand();

  try { webApp.setBackgroundColor("#e3f2fd"); } catch {}
  try { webApp.setHeaderColor("#1e88e5"); } catch {}

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

// Get user's Telegram username
export function getTelegramUsername(): string | null {
  const user = getTelegramUser();
  return user?.username || null;
}

// Get user's full name
export function getTelegramFullName(): string {
  const user = getTelegramUser();
  if (!user) return "User";
  return user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name;
}

// Get user's profile photo URL
export function getTelegramPhotoUrl(): string | null {
  const user = getTelegramUser();
  return user?.photo_url || null;
}
