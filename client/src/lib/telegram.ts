// Telegram Mini App SDK Integration

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
  showAlert: (message: string, callback?: () => void) => void;
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

// ─── Environment detection ────────────────────────────────────────────────────

function hasTelegramHashParams(): boolean {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash;
  return (
    hash.includes('tgWebAppData') ||
    hash.includes('tgWebAppVersion') ||
    hash.includes('tgWebAppPlatform')
  );
}

/** Returns true when running inside Telegram Mini App WebView. */
export function isTelegramEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.Telegram?.WebApp) return true;
  if (hasTelegramHashParams()) return true;
  return false;
}

/** Wait up to `timeoutMs` ms for Telegram SDK to inject window.Telegram.WebApp. */
export function waitForTelegramEnvironment(timeoutMs = 4000): Promise<boolean> {
  return new Promise((resolve) => {
    if (isTelegramEnvironment()) { resolve(true); return; }
    const start = Date.now();
    const id = setInterval(() => {
      if (isTelegramEnvironment()) { clearInterval(id); resolve(true); }
      else if (Date.now() - start >= timeoutMs) { clearInterval(id); resolve(false); }
    }, 100);
  });
}

// ─── Core helpers ─────────────────────────────────────────────────────────────

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp || null;
}

export function initializeTelegram(): TelegramWebApp | null {
  const webApp = getTelegramWebApp();
  if (!webApp) return null;
  webApp.ready();
  webApp.expand();
  try { webApp.setBackgroundColor('#e3f2fd'); } catch {}
  try { webApp.setHeaderColor('#1e88e5'); } catch {}
  return webApp;
}

export function getTelegramUser(): TelegramUser | null {
  const webApp = getTelegramWebApp();
  if (!webApp) return null;
  return webApp.initDataUnsafe?.user || null;
}

export function getTelegramUserId(): number | null {
  return getTelegramUser()?.id || null;
}

export function getTelegramUsername(): string | null {
  return getTelegramUser()?.username || null;
}

export function getTelegramFullName(): string {
  const user = getTelegramUser();
  if (!user) return 'User';
  return user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name;
}

export function getTelegramPhotoUrl(): string | null {
  return getTelegramUser()?.photo_url || null;
}

// ─── Haptic feedback ──────────────────────────────────────────────────────────

export function triggerHapticFeedback(
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection' = 'light'
): void {
  const webApp = getTelegramWebApp();
  if (!webApp?.HapticFeedback) return;
  try {
    if (type === 'selection') {
      webApp.HapticFeedback.selectionChanged();
    } else if (type === 'success' || type === 'warning' || type === 'error') {
      webApp.HapticFeedback.notificationOccurred(type);
    } else {
      webApp.HapticFeedback.impactOccurred(type);
    }
  } catch {}
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export function openTelegramLink(url: string): void {
  const webApp = getTelegramWebApp();
  if (webApp) {
    try { webApp.openTelegramLink(url); return; } catch {}
    try { webApp.openLink(url); return; } catch {}
  }
  window.open(url, '_blank');
}

export function openExternalLink(url: string): void {
  const webApp = getTelegramWebApp();
  if (webApp) {
    try { webApp.openLink(url); return; } catch {}
  }
  window.open(url, '_blank');
}

// ─── Alerts / dialogs ─────────────────────────────────────────────────────────

export function showTelegramAlert(message: string): Promise<void> {
  return new Promise((resolve) => {
    const webApp = getTelegramWebApp();
    if (webApp) {
      try { webApp.showAlert(message, resolve); return; } catch {}
    }
    alert(message);
    resolve();
  });
}

// ─── Clipboard ────────────────────────────────────────────────────────────────

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers / Telegram WebView
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      return true;
    } catch {
      return false;
    }
  }
}
