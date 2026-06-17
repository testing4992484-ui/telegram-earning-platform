import React, { createContext, useContext, useEffect, useState } from 'react';
import { database } from '@/lib/firebase';
import { ref, get, set, update } from 'firebase/database';
import {
  getTelegramUser,
  waitForTelegramEnvironment,
} from '@/lib/telegram';

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

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Wait up to 4 seconds for Telegram SDK to inject window.Telegram.WebApp
        const inTelegram = await waitForTelegramEnvironment(4000);

        if (!inTelegram) {
          setIsBlocked(true);
          setLoading(false);
          return;
        }

        const telegramUser = getTelegramUser();
        if (!telegramUser) {
          // SDK present but no user data — might be an older Telegram version
          // Try again once after a short delay
          await new Promise((r) => setTimeout(r, 500));
          const retryUser = getTelegramUser();
          if (!retryUser) {
            setError('Failed to get Telegram user data. Please restart the app.');
            setLoading(false);
            return;
          }
        }

        const tgUser = getTelegramUser()!;
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
              {
                type: 'signup_bonus',
                amount: 100,
                timestamp: Date.now(),
                description: 'Welcome bonus',
              },
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
      await update(userRef, {
        coins: newCoins,
        totalEarnings: user.totalEarnings + (amount > 0 ? amount : 0),
      });
      setUser((prev) =>
        prev ? { ...prev, coins: newCoins, totalEarnings: prev.totalEarnings + (amount > 0 ? amount : 0) } : null
      );
    } catch (err) {
      console.error('Error updating coins:', err);
      throw err;
    }
  };

  const addTransaction = async (transaction: any) => {
    if (!user) return;
    try {
      const userRef = ref(database, `users/${user.telegramId}`);
      const newTransactions = [...user.transactionHistory, transaction];
      await update(userRef, { transactionHistory: newTransactions });
      setUser((prev) => (prev ? { ...prev, transactionHistory: newTransactions } : null));
    } catch (err) {
      console.error('Error adding transaction:', err);
      throw err;
    }
  };

  const completeTask = async (taskId: string) => {
    if (!user) return;
    try {
      const userRef = ref(database, `users/${user.telegramId}`);
      await update(userRef, { tasksCompleted: user.tasksCompleted + 1 });
      setUser((prev) => (prev ? { ...prev, tasksCompleted: prev.tasksCompleted + 1 } : null));
    } catch (err) {
      console.error('Error completing task:', err);
      throw err;
    }
  };

  const addReferral = async (referredUserId: number) => {
    if (!user) return;
    try {
      const userRef = ref(database, `users/${user.telegramId}`);
      await update(userRef, { referralCount: user.referralCount + 1 });
      setUser((prev) => (prev ? { ...prev, referralCount: prev.referralCount + 1 } : null));
    } catch (err) {
      console.error('Error adding referral:', err);
      throw err;
    }
  };

  const requestWithdrawal = async (amount: number, method: string) => {
    if (!user || amount > user.coins) throw new Error('Insufficient balance');
    try {
      const userRef = ref(database, `users/${user.telegramId}`);
      const newRequest = {
        id: Date.now(),
        amount,
        method,
        status: 'pending',
        requestedAt: Date.now(),
      };
      const newRequests = [...user.withdrawalRequests, newRequest];
      await update(userRef, { withdrawalRequests: newRequests, coins: user.coins - amount });
      setUser((prev) =>
        prev ? { ...prev, coins: prev.coins - amount, withdrawalRequests: newRequests } : null
      );
    } catch (err) {
      console.error('Error requesting withdrawal:', err);
      throw err;
    }
  };

  return (
    <UserContext.Provider
      value={{ user, loading, error, isBlocked, updateCoins, addTransaction, completeTask, addReferral, requestWithdrawal }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
}
