import { motion } from 'framer-motion';
import { Home, Zap, Share2, Wallet, User } from 'lucide-react';
import { Link, useLocation } from 'wouter';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: <Home size={24} />, path: '/' },
  { id: 'tasks', label: 'Tasks', icon: <Zap size={24} />, path: '/tasks' },
  { id: 'referral', label: 'Referral', icon: <Share2 size={24} />, path: '/referral' },
  { id: 'wallet', label: 'Wallet', icon: <Wallet size={24} />, path: '/wallet' },
  { id: 'profile', label: 'Profile', icon: <User size={24} />, path: '/profile' },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40"
    >
      <div className="flex justify-around items-center h-20 max-w-2xl mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location === item.path;

          return (
            <Link key={item.id} href={item.path}>
              <motion.a
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                <motion.div
                  animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {item.icon}
                </motion.div>
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="w-1 h-1 bg-blue-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 300 }}
                  />
                )}
              </motion.a>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
