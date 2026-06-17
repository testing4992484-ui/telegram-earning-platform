import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { triggerHapticFeedback } from '@/lib/telegram';
import { User, Mail, Calendar, TrendingUp, LogOut, Settings, Download } from 'lucide-react';
import { Toaster, toast } from 'sonner';

export default function ProfilePage() {
  const { user, loading } = useUser();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    triggerHapticFeedback('warning');
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    triggerHapticFeedback('success');
    toast.success('Logged out successfully');
    // In a real app, you would clear auth here
    setShowLogoutConfirm(false);
  };

  const handleDownloadData = () => {
    triggerHapticFeedback('light');
    if (!user) return;

    const data = {
      user: user,
      exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `earnhub-data-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Data downloaded successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Failed to load profile data</p>
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
      <Toaster position="top-center" />

      {/* Header with User Info */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-start gap-4 mb-6">
          {/* User Avatar */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-2 border-white border-opacity-30"
          >
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.firstName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User size={32} />
            )}
          </motion.div>

          {/* User Name */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user.firstName}</h1>
            {user.username && (
              <p className="text-blue-100 text-sm">@{user.username}</p>
            )}
            <p className="text-blue-100 text-xs mt-1">Telegram ID: {user.telegramId}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-3 border border-white border-opacity-20 text-center">
            <p className="text-blue-100 text-xs">Coins</p>
            <p className="text-2xl font-bold">{user.coins}</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-3 border border-white border-opacity-20 text-center">
            <p className="text-blue-100 text-xs">Earned</p>
            <p className="text-2xl font-bold">{user.totalEarnings}</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-3 border border-white border-opacity-20 text-center">
            <p className="text-blue-100 text-xs">Tasks</p>
            <p className="text-2xl font-bold">{user.tasksCompleted}</p>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="px-4 mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
        <div className="space-y-3">
          {/* First Name */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">First Name</p>
              <p className="font-bold text-gray-900">{user.firstName}</p>
            </div>
          </motion.div>

          {/* Username */}
          {user.username && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">@</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Username</p>
                <p className="font-bold text-gray-900">@{user.username}</p>
              </div>
            </motion.div>
          )}

          {/* Telegram ID */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">🆔</span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Telegram ID</p>
              <p className="font-bold text-gray-900">{user.telegramId}</p>
            </div>
          </motion.div>

          {/* Join Date */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Joined</p>
              <p className="font-bold text-gray-900">
                {new Date(user.joinDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Statistics */}
      <div className="px-4 mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics</h2>
        <div className="space-y-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Earnings</p>
                <p className="font-bold text-gray-900">{user.totalEarnings} coins</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">👥</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Referrals</p>
                <p className="font-bold text-gray-900">{user.referralCount} friends</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">✅</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tasks Completed</p>
                <p className="font-bold text-gray-900">{user.tasksCompleted} tasks</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="px-4 mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Transactions</h2>
        {user.transactionHistory.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {user.transactionHistory.slice().reverse().map((transaction: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg p-3 border border-gray-100 flex items-center justify-between text-sm"
              >
                <div>
                  <p className="font-bold text-gray-900 capitalize">
                    {transaction.description || transaction.type.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <p className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-600">No transactions yet</p>
          </div>
        )}
      </div>

      {/* Settings & Actions */}
      <div className="px-4 mt-8 mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Settings</h2>
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadData}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50 transition-all"
          >
            <Download size={20} />
            Download My Data
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold bg-white border-2 border-gray-300 text-gray-900 hover:bg-gray-50 transition-all"
          >
            <Settings size={20} />
            Account Settings
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold bg-red-50 border-2 border-red-200 text-red-600 hover:bg-red-100 transition-all"
          >
            <LogOut size={20} />
            Logout
          </motion.button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">Logout?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 px-4 rounded-lg font-bold border-2 border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={confirmLogout}
                className="flex-1 py-2 px-4 rounded-lg font-bold bg-red-500 text-white hover:bg-red-600"
              >
                Logout
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
