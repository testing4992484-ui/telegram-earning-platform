import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { triggerHapticFeedback } from '@/lib/telegram';
import { TrendingUp, Users, CheckCircle2, Gift } from 'lucide-react';
import { database } from '@/lib/firebase';
import { ref, update } from 'firebase/database';

export default function HomePage() {
  const { user, loading, updateCoins, addTransaction } = useUser();
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [checkInCountdown, setCheckInCountdown] = useState<number | null>(null);

  // Check if user has already checked in today
  useEffect(() => {
    if (!user?.lastCheckIn) return;

    const today = new Date().toDateString();
    const lastCheckInDate = new Date(user.lastCheckIn).toDateString();

    if (today === lastCheckInDate) {
      setHasCheckedInToday(true);
      // Calculate countdown to next check-in
      const nextCheckIn = new Date(user.lastCheckIn);
      nextCheckIn.setDate(nextCheckIn.getDate() + 1);
      const now = new Date();
      const diff = Math.max(0, nextCheckIn.getTime() - now.getTime());
      setCheckInCountdown(Math.floor(diff / 1000 / 60)); // minutes
    }
  }, [user?.lastCheckIn]);

  const handleDailyCheckIn = async () => {
    if (hasCheckedInToday || !user) return;

    try {
      triggerHapticFeedback('success');
      const checkInReward = 50;
      const now = Date.now();

      // Update Firebase with new check-in time
      const userRef = ref(database, `users/${user.telegramId}`);
      await update(userRef, {
        lastCheckIn: now,
      });

      await updateCoins(checkInReward);
      await addTransaction({
        type: 'daily_checkin',
        amount: checkInReward,
        timestamp: now,
        description: 'Daily check-in bonus',
      });

      setHasCheckedInToday(true);
      setCheckInCountdown(1440); // 24 hours in minutes
    } catch (error) {
      console.error('Check-in failed:', error);
      triggerHapticFeedback('error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Failed to load user data</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="pb-24 bg-gradient-to-b from-blue-50 to-white min-h-screen"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-blue-100 text-sm">Welcome back</p>
            <h1 className="text-3xl font-bold">{user.firstName}! 👋</h1>
          </div>
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-xl">💰</span>
          </div>
        </div>

        {/* Coin Balance */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20"
        >
          <p className="text-blue-100 text-sm mb-2">Total Balance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{user.coins}</span>
            <span className="text-blue-100 text-lg">coins</span>
          </div>
          <p className="text-blue-100 text-xs mt-2">
            Total Earnings: {user.totalEarnings} coins
          </p>
        </motion.div>
      </div>

      {/* Daily Check-in Section */}
      <div className="px-4 mt-6">
        <motion.div
          whileHover={{ scale: hasCheckedInToday ? 1 : 1.02 }}
          whileTap={{ scale: hasCheckedInToday ? 1 : 0.98 }}
          onClick={handleDailyCheckIn}
          className={`rounded-2xl p-6 cursor-pointer transition-all ${
            hasCheckedInToday
              ? 'bg-gray-100 border-2 border-gray-300'
              : 'bg-gradient-to-br from-yellow-300 to-yellow-400 border-2 border-yellow-500 shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gift size={32} className={hasCheckedInToday ? 'text-gray-400' : 'text-yellow-700'} />
              <div>
                <h3 className={`font-bold text-lg ${hasCheckedInToday ? 'text-gray-500' : 'text-yellow-900'}`}>
                  {hasCheckedInToday ? 'Checked In Today' : 'Daily Check-in'}
                </h3>
                <p className={`text-sm ${hasCheckedInToday ? 'text-gray-400' : 'text-yellow-800'}`}>
                  {hasCheckedInToday
                    ? `Next check-in in ${checkInCountdown} minutes`
                    : 'Tap to claim 50 coins'}
                </p>
              </div>
            </div>
            {!hasCheckedInToday && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-3xl"
              >
                ✨
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Earnings */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-2xl p-4 shadow-md border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-blue-600" />
              </div>
              <span className="text-gray-600 text-sm font-medium">Earnings</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{user.totalEarnings}</p>
            <p className="text-xs text-gray-500 mt-1">Total coins earned</p>
          </motion.div>

          {/* Referrals */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-2xl p-4 shadow-md border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-purple-600" />
              </div>
              <span className="text-gray-600 text-sm font-medium">Referrals</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{user.referralCount}</p>
            <p className="text-xs text-gray-500 mt-1">Friends joined</p>
          </motion.div>

          {/* Tasks Completed */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-2xl p-4 shadow-md border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 size={20} className="text-green-600" />
              </div>
              <span className="text-gray-600 text-sm font-medium">Tasks</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{user.tasksCompleted}</p>
            <p className="text-xs text-gray-500 mt-1">Completed</p>
          </motion.div>

          {/* Join Date */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-2xl p-4 shadow-md border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">📅</span>
              </div>
              <span className="text-gray-600 text-sm font-medium">Joined</span>
            </div>
            <p className="text-sm font-bold text-gray-900">
              {new Date(user.joinDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {Math.floor((Date.now() - user.joinDate) / (1000 * 60 * 60 * 24))} days ago
            </p>
          </motion.div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 mt-8 mb-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
        >
          Start Earning Now 🚀
        </motion.button>
      </div>
    </motion.div>
  );
}
