import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { triggerHapticFeedback, openTelegramLink } from '@/lib/telegram';
import { CheckCircle2, Play, Share2, Heart } from 'lucide-react';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: 'watch_ad' | 'visit_link' | 'social_follow' | 'invite_friend';
  icon: string;
  action?: string;
  completed?: boolean;
}

const AVAILABLE_TASKS: Task[] = [
  {
    id: 'task_1',
    title: 'Watch Video Ad',
    description: 'Watch a short video advertisement',
    reward: 10,
    type: 'watch_ad',
    icon: '🎬',
    action: 'https://example.com/ad',
  },
  {
    id: 'task_2',
    title: 'Visit Website',
    description: 'Visit our partner website',
    reward: 15,
    type: 'visit_link',
    icon: '🌐',
    action: 'https://example.com',
  },
  {
    id: 'task_3',
    title: 'Follow on Instagram',
    description: 'Follow us on Instagram for daily updates',
    reward: 20,
    type: 'social_follow',
    icon: '📸',
    action: 'https://instagram.com/example',
  },
  {
    id: 'task_4',
    title: 'Watch Tutorial',
    description: 'Watch our complete tutorial video',
    reward: 25,
    type: 'watch_ad',
    icon: '📺',
    action: 'https://example.com/tutorial',
  },
  {
    id: 'task_5',
    title: 'Join Community',
    description: 'Join our Telegram community group',
    reward: 30,
    type: 'social_follow',
    icon: '👥',
    action: 'https://t.me/example',
  },
  {
    id: 'task_6',
    title: 'Share App',
    description: 'Share the app with your friends',
    reward: 50,
    type: 'invite_friend',
    icon: '🔗',
  },
];

export default function TasksPage() {
  const { user, loading, updateCoins, addTransaction, completeTask } = useUser();
  const [tasks, setTasks] = useState<Task[]>(AVAILABLE_TASKS);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  // Load completed tasks from localStorage
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`completed_tasks_${user.telegramId}`);
      if (saved) {
        setCompletedTasks(new Set(JSON.parse(saved)));
      }
    }
  }, [user]);

  const handleCompleteTask = async (task: Task) => {
    if (completedTasks.has(task.id) || !user) return;

    try {
      triggerHapticFeedback('success');

      // If task has an action URL, open it
      if (task.action) {
        openTelegramLink(task.action);
      }

      // Update coins
      await updateCoins(task.reward);
      await addTransaction({
        type: 'task_completed',
        amount: task.reward,
        timestamp: Date.now(),
        description: `Completed: ${task.title}`,
        taskId: task.id,
      });
      await completeTask(task.id);

      // Mark as completed
      const newCompleted = new Set(completedTasks);
      newCompleted.add(task.id);
      setCompletedTasks(newCompleted);

      // Save to Firebase
      const { update } = await import('firebase/database');
      const userRef = ref(database, `users/${user.telegramId}`);
      await update(userRef, {
        completedTasks: Array.from(newCompleted),
      });

      // Also save to localStorage as backup
      localStorage.setItem(
        `completed_tasks_${user.telegramId}`,
        JSON.stringify(Array.from(newCompleted))
      );

      // Update tasks state
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, completed: true } : t
        )
      );
    } catch (error) {
      console.error('Error completing task:', error);
      triggerHapticFeedback('error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  const completedCount = completedTasks.size;
  const totalReward = tasks
    .filter((t) => completedTasks.has(t.id))
    .reduce((sum, t) => sum + t.reward, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="pb-24 bg-gradient-to-b from-blue-50 to-white min-h-screen"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-3xl font-bold mb-4">Daily Tasks ⚡</h1>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-3 border border-white border-opacity-20">
            <p className="text-blue-100 text-xs">Completed</p>
            <p className="text-2xl font-bold">{completedCount}/{tasks.length}</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-3 border border-white border-opacity-20">
            <p className="text-blue-100 text-xs">Today's Earnings</p>
            <p className="text-2xl font-bold">{totalReward}</p>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="px-4 mt-6">
        <div className="space-y-4">
          {tasks.map((task, index) => {
            const isCompleted = completedTasks.has(task.id);

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: isCompleted ? 1 : 1.02 }}
                whileTap={{ scale: isCompleted ? 1 : 0.98 }}
                onClick={() => handleCompleteTask(task)}
                className={`rounded-2xl p-4 cursor-pointer transition-all border-2 ${
                  isCompleted
                    ? 'bg-gray-100 border-gray-300 opacity-60'
                    : 'bg-white border-blue-200 shadow-md hover:shadow-lg hover:border-blue-400'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Task Icon */}
                  <div className={`text-4xl flex-shrink-0 ${isCompleted ? 'opacity-50' : ''}`}>
                    {task.icon}
                  </div>

                  {/* Task Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`font-bold text-lg ${isCompleted ? 'text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </h3>
                        <p className={`text-sm mt-1 ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                          {task.description}
                        </p>
                      </div>

                      {/* Reward Badge */}
                      <div className={`flex-shrink-0 px-3 py-1 rounded-full font-bold text-sm whitespace-nowrap ${
                        isCompleted
                          ? 'bg-gray-300 text-gray-600'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        +{task.reward}
                      </div>
                    </div>

                    {/* Task Type Badge */}
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        task.type === 'watch_ad'
                          ? 'bg-blue-100 text-blue-700'
                          : task.type === 'visit_link'
                          ? 'bg-purple-100 text-purple-700'
                          : task.type === 'social_follow'
                          ? 'bg-pink-100 text-pink-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {task.type === 'watch_ad' && <Play size={12} />}
                        {task.type === 'visit_link' && <Share2 size={12} />}
                        {task.type === 'social_follow' && <Heart size={12} />}
                        {task.type.replace(/_/g, ' ')}
                      </span>

                      {isCompleted && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
                        >
                          <CheckCircle2 size={12} />
                          Completed
                        </motion.span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {completedCount === tasks.length && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 mt-8 text-center"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">All Tasks Completed!</h3>
          <p className="text-gray-600 mb-6">Come back tomorrow for more tasks</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-6 rounded-xl"
          >
            Check Back Tomorrow
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
