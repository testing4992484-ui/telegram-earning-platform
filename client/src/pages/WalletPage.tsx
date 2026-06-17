import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { triggerHapticFeedback } from '@/lib/telegram';
import { CreditCard, DollarSign, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';

const MINIMUM_WITHDRAWAL = 500;
const WITHDRAWAL_METHODS = [
  { id: 'upi', name: 'UPI', icon: '💳', description: 'Instant transfer to your UPI' },
  { id: 'bank', name: 'Bank Transfer', icon: '🏦', description: 'Transfer to your bank account' },
  { id: 'paypal', name: 'PayPal', icon: '🌐', description: 'Send to your PayPal account' },
];

export default function WalletPage() {
  const { user, loading, requestWithdrawal } = useUser();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [accountDetails, setAccountDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const canWithdraw = user && user.coins >= MINIMUM_WITHDRAWAL;
  const isValidAmount = withdrawAmount && parseInt(withdrawAmount) >= MINIMUM_WITHDRAWAL && parseInt(withdrawAmount) <= (user?.coins || 0);

  const handleWithdrawalRequest = async () => {
    if (!user || !isValidAmount || !accountDetails.trim()) {
      toast.error('Please fill all fields correctly');
      triggerHapticFeedback('error');
      return;
    }

    setIsSubmitting(true);
    triggerHapticFeedback('light');

    try {
      await requestWithdrawal(parseInt(withdrawAmount), selectedMethod);

      toast.success('Withdrawal request submitted!', {
        description: `${withdrawAmount} coins will be transferred to your ${selectedMethod.toUpperCase()}`,
      });

      triggerHapticFeedback('success');
      setWithdrawAmount('');
      setAccountDetails('');
      setShowForm(false);
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error('Failed to submit withdrawal request');
      triggerHapticFeedback('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Failed to load wallet data</p>
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
        <h1 className="text-3xl font-bold mb-4">Wallet 💼</h1>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20"
        >
          <p className="text-blue-100 text-sm mb-2">Available Balance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{user.coins}</span>
            <span className="text-blue-100 text-lg">coins</span>
          </div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 mt-6">
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-2xl p-4 shadow-md border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign size={20} className="text-green-600" />
              </div>
              <span className="text-gray-600 text-sm font-medium">Total Earned</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{user.totalEarnings}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-2xl p-4 shadow-md border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Send size={20} className="text-orange-600" />
              </div>
              <span className="text-gray-600 text-sm font-medium">Pending</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{user.withdrawalRequests.filter((r: any) => r.status === 'pending').length}</p>
          </motion.div>
        </div>
      </div>

      {/* Withdrawal Info */}
      <div className="px-4 mt-8">
        <div className={`rounded-2xl p-4 border-2 flex gap-3 ${
          canWithdraw
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <AlertCircle size={24} className={canWithdraw ? 'text-green-600' : 'text-yellow-600'} />
          <div>
            <h3 className={`font-bold ${canWithdraw ? 'text-green-900' : 'text-yellow-900'}`}>
              {canWithdraw ? 'Ready to Withdraw' : 'Minimum Balance Required'}
            </h3>
            <p className={`text-sm mt-1 ${canWithdraw ? 'text-green-700' : 'text-yellow-700'}`}>
              {canWithdraw
                ? `You have ${user.coins} coins. Minimum: ${MINIMUM_WITHDRAWAL} coins`
                : `You need ${MINIMUM_WITHDRAWAL - user.coins} more coins to withdraw`}
            </p>
          </div>
        </div>
      </div>

      {/* Withdrawal Form */}
      {canWithdraw && (
        <div className="px-4 mt-8">
          {!showForm ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              Request Withdrawal 🚀
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Withdrawal Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={`Minimum: ${MINIMUM_WITHDRAWAL}`}
                    min={MINIMUM_WITHDRAWAL}
                    max={user.coins}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-bold">
                    coins
                  </span>
                </div>
                {withdrawAmount && (
                  <p className="text-xs text-gray-500 mt-2">
                    You'll receive: {withdrawAmount} coins
                  </p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
                  {WITHDRAWAL_METHODS.map((method) => (
                    <motion.label
                      key={method.id}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all"
                      style={{
                        borderColor: selectedMethod === method.id ? '#3b82f6' : '#e5e7eb',
                        backgroundColor: selectedMethod === method.id ? '#eff6ff' : 'white',
                      }}
                    >
                      <input
                        type="radio"
                        name="method"
                        value={method.id}
                        checked={selectedMethod === method.id}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-2xl">{method.icon}</span>
                      <div>
                        <p className="font-bold text-gray-900">{method.name}</p>
                        <p className="text-xs text-gray-600">{method.description}</p>
                      </div>
                    </motion.label>
                  ))}
                </div>
              </div>

              {/* Account Details */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Account Details
                </label>
                <textarea
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  placeholder={`Enter your ${selectedMethod.toUpperCase()} details`}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowForm(false)}
                  disabled={isSubmitting}
                  className="py-3 px-4 rounded-xl font-bold border-2 border-gray-300 text-gray-900 hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWithdrawalRequest}
                  disabled={!isValidAmount || !accountDetails.trim() || isSubmitting}
                  className="py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Submit Request'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Recent Withdrawals */}
      <div className="px-4 mt-8 mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Withdrawal History</h2>
        {user.withdrawalRequests.length > 0 ? (
          <div className="space-y-3">
            {user.withdrawalRequests.map((request: any, index: number) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    request.status === 'completed'
                      ? 'bg-green-100'
                      : request.status === 'pending'
                      ? 'bg-yellow-100'
                      : 'bg-red-100'
                  }`}>
                    {request.status === 'completed' && <CheckCircle2 size={20} className="text-green-600" />}
                    {request.status === 'pending' && <Send size={20} className="text-yellow-600" />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{request.amount} coins</p>
                    <p className="text-xs text-gray-500 capitalize">{request.method} • {request.status}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(request.requestedAt).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No withdrawals yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
