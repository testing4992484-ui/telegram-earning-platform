import React, { createContext, useContext, useEffect, useState } from 'react';
import { database } from '@/lib/firebase';
import { ref, get, set, update } from 'firebase/database';
import { getTelegramUser, waitForTelegramEnvironment, getTelegramWebApp } from '@/lib/telegram';

export interface UserData {
  telegramId: number;
  username: string | null;
  firstName: string;
  lastName: string | null;
  photoUrl: string | null;
  coins: number;
  totalEarnings: number;
  referralCount: number;
  tasksCompleted: number;
  joinDate: number;
  lastCheckIn: number | null;
  referralLink: string;
  withdrawalRequests: any[];
  transactionHistory: any[];
}

interface UserContextType {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  isBlocked: boolean;
  updateCoins: (amount: number) => Promise<void>;
  addTransaction: (transaction: any) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  addReferral: (referredUserId: number) => Promise<void>;
  requestWithdrawal: (amount: number, method: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

/** Parse user data from Telegram's URL hash fragment (fallback for some clients). */
function parseUserFromHash(): { id: number; first_name: string; username?: string } | null {
  try {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const raw = params.get('tgWebAppData');
    if (!raw) return null;
    const data = new URLSearchParams(decodeURIComponent(raw));
    const userStr = data.get('user');
    if (!userStr) return null;
    return JSON.parse(decodeURIComponent(userStr));
  } catch {
    return null;
  }
}

/** Wait up to `ms` for getTelegramUser() to return a user object. */
async function waitForTelegramUser(ms = 3000) {
  const step = 200;
  let elapsed = 0;
  while (elapsed < ms) {
    const u = getTelegramUser();
    if (u) return u;
    await new Promise((r) => setTimeout(r, step));
    elapsed += step;
  }
  return null;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // 1. Wait for Telegram SDK to be available (up to 4 s)
        const inTelegram = await waitForTelegramEnvironment(4000);
        if (!inTelegram) {
          setIsBlocked(true);
          setLoading(false);
          return;
        }

        // 2. Wait for user data (up to 3 s — some clients inject it slightly late)
        let tgUser = await waitForTelegramUser(3000);

        // 3. Fallback: parse from URL hash (Telegram passes data here in some flows)
        if (!tgUser) {
          const hashUser = parseUserFromHash();
          if (hashUser) {
            tgUser = { id: hashUser.id, first_name: hashUser.first_name, username: hashUser.username };
          }
        }

        if (!tgUser) {
          // 4. Last resort: try reading initData string directly
          const webApp = getTelegramWebApp();
          if (webApp?.initData) {
            try {
              const params = new URLSearchParams(webApp.initData);
              const userStr = params.get('user');
              if (userStr) {
                const parsed = JSON.parse(userStr);
                tgUser = parsed;
              }
            } catch {}
          }
        }

        if (!tgUser) {
          setError('Could not load your Telegram profile. Please close and re-open the app from the bot menu button.');
          setLoading(false);
          return;
        }

        const userId = tgUser.id;
        const userRef = ref(database, `users/${userId}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          setUser(snapshot.val());
        } else {
          const newUser: UserData = {
            telegramId: userId,
            username: tgUser.username || null,
            firstName: tgUser.first_name,
            lastName: tgUser.last_name || null,
            photoUrl: tgUser.photo_url || null,
            coins: 100,
            totalEarnings: 100,
            referralCount: 0,
            tasksCompleted: 0,
            joinDate: Date.now(),
            lastCheckIn: null,
            referralLink: `https://t.me/SabkaMastiBazaar_Bot?start=ref_${userId}`,
            withdrawalRequests: [],
            transactionHistory: [
              { type: 'signup_bonus', amount: 100, timestamp: Date.now(), description: 'Welcome bonus' },
            ],
          };
          await set(userRef, newUser);
          setUser(newUser);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error initializing user:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize user');
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  const updateCoins = async (amount: number) => {
    if (!user) return;
    try {
      const newCoins = user.coins + amount;
      const userRef = ref(database, `users/${user.telegramId}`);
      await update(userRef, { coins: newCoins, totalEarnings: user.totalEarnings + (amount > 0 ? amount : 0) });
      setUser((p) => p ? { ...p, coins: newCoins, totalEarnings: p.totalEarnings + (amount > 0 ? amount : 0) } : null);
    } catch (err) { console.error(err); throw err; }
  };

  const addTransaction = async (transaction: any) => {
    if (!user) return;
    try {
      const userRef = ref(database, `users/${user.telegramId}`);
      const newTx = [...user.transactionHistory, transaction];
      await update(userRef, { transactionHistory: newTx });
      setUser((p) => p ? { ...p, transactionHistory: newTx } : null);
    } catch (err) { console.error(err); throw err; }
  };

  const completeTask = async (_taskId: string) => {
    if (!user) return;
    try {
      const userRef = ref(database, `users/${user.telegramId}`);
      await update(userRef, { tasksCompleted: user.tasksCompleted + 1 });
      setUser((p) => p ? { ...p, tasksCompleted: p.tasksCompleted + 1 } : null);
    } catch (err) { console.error(err); throw err; }
  };

  const addReferral = async (_referredUserId: number) => {
    if (!user) return;
    try {
      const userRef = ref(database, `users/${user.telegramId}`);
      await update(userRef, { referralCount: user.referralCount + 1 });
      setUser((p) => p ? { ...p, referralCount: p.referralCount + 1 } : null);
    } catch (err) { console.error(err); throw err; }
  };

  const requestWithdrawal = async (amount: number, method: string) => {
    if (!user || amount > user.coins) throw new Error('Insufficient balance');
    try {
      const req = { id: Date.now(), amount, method, status: 'pending', requestedAt: Date.now() };
      const newReqs = [...user.withdrawalRequests, req];
      const userRef = ref(database, `users/${user.telegramId}`);
      await update(userRef, { withdrawalRequests: newReqs, coins: user.coins - amount });
      setUser((p) => p ? { ...p, coins: p.coins - amount, withdrawalRequests: newReqs } : null);
    } catch (err) { console.error(err); throw err; }
  };

  return (
    <UserContext.Provider value={{ user, loading, error, isBlocked, updateCoins, addTransaction, completeTask, addReferral, requestWithdrawal }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
}
