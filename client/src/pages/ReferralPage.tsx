import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { triggerHapticFeedback, copyToClipboard, showTelegramAlert } from '@/lib/telegram';
import { Copy, Share2, Users, TrendingUp } from 'lucide-react';
import { Toaster, toast } from 'sonner';

export default function ReferralPage() {
  const { user, loading } = useUser();
  const [copied, setCopied] = useState(false);
  // NOTE: Replace 'YourBotUsername' in user.referralLink with actual Telegram bot username

  const handleCopyLink = () => {
    if (!user) return;

    triggerHapticFeedback('success');
    copyToClipboard(user.referralLink);
    setCopied(true);

    toast.success('Referral link copied!', {
      description: 'Share it with your friends',
    });

    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLink = () => {
    if (!user) return;

    triggerHapticFeedback('light');

    const text = `Join me on EarnHub and start earning coins! 💰\n\nClick here: ${user.referralLink}`;

    // Try to use native share if available
    if (navigator.share) {
      navigator.share({
        title: 'Join EarnHub',
        text: text,
        url: user.referralLink,
      }).catch((err) => console.log('Share cancelled:', err));
    } else {
      // Fallback: copy to clipboard
      copyToClipboard(text);
      toast.success('Share text copied!');
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
        <p className="text-gray-600">Failed to load referral data</p>
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

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Referral Program 🔗</h1>
        <p className="text-blue-100">Earn coins by inviting friends</p>
      </div>

      {/* Referral Stats */}
      <div className="px-4 mt-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Total Referrals */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-2xl p-4 shadow-md border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-purple-600" />
              </div>
              <span className="text-gray-600 text-sm font-medium">Friends</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{user.referralCount}</p>
            <p className="text-xs text-gray-500 mt-1">Total referrals</p>
          </motion.div>

          {/* Referral Earnings */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-2xl p-4 shadow-md border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-green-600" />
              </div>
              <span className="text-gray-600 text-sm font-medium">Earnings</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{user.referralCount * 100}</p>
            <p className="text-xs text-gray-500 mt-1">From referrals</p>
          </motion.div>
        </div>
      </div>

      {/* How It Works */}
      <div className="px-4 mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">How It Works</h2>
        <div className="space-y-3">
          {[
            { step: 1, title: 'Share Your Link', desc: 'Copy and share your unique referral link' },
            { step: 2, title: 'Friend Joins', desc: 'Your friend clicks the link and signs up' },
            { step: 3, title: 'Earn Rewards', desc: 'You both get 100 coins bonus!' },
          ].map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-4 bg-white rounded-xl p-4 border border-gray-100"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {item.step}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="px-4 mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Referral Link</h2>

        {/* Link Display */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4 border-2 border-blue-200 mb-4"
        >
          <p className="text-xs text-gray-600 mb-2">Your unique link:</p>
          <p className="text-sm font-mono text-blue-900 break-all">{user.referralLink}</p>
          <p className="text-xs text-gray-500 mt-2">💡 Replace 'YourBotUsername' with your actual bot username</p>
        </motion.div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopyLink}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <Copy size={18} />
            {copied ? 'Copied!' : 'Copy Link'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShareLink}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold bg-purple-500 text-white hover:bg-purple-600 transition-all"
          >
            <Share2 size={18} />
            Share
          </motion.button>
        </div>
      </div>

      {/* Rewards Info */}
      <div className="px-4 mt-8 mb-4">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
          <h3 className="font-bold text-lg text-gray-900 mb-3">💰 Referral Rewards</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Your friend signs up:</span>
              <span className="font-bold text-green-600">+100 coins</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Your friend completes first task:</span>
              <span className="font-bold text-green-600">+50 coins</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Your friend reaches 1000 coins:</span>
              <span className="font-bold text-green-600">+200 coins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Preview */}
      <div className="px-4 mt-8 mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Top Referrers 🏆</h2>
        <div className="space-y-2">
          {[
            { rank: 1, name: 'Ali Khan', referrals: 45 },
            { rank: 2, name: 'Fatima Ahmed', referrals: 38 },
            { rank: 3, name: 'Hassan Ali', referrals: 32 },
          ].map((item) => (
            <motion.div
              key={item.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: item.rank * 0.1 }}
              className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center font-bold text-white text-sm">
                {item.rank}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">{item.referrals} referrals</p>
              </div>
              <span className="text-lg">
                {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : '🥉'}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
