import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { removeNotification } from '../../slices/notificationSlice';

const NotificationContainer = () => {
  const notifications = useAppSelector((state) => state.notifications.notifications);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timers: number[] = [];

    notifications.forEach((notification) => {
      if (notification.duration) {
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, notification.duration);
        timers.push(timer);
      }
    });

    // Cleanup function to clear all timers
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications, dispatch]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 ${
            notification.type === 'success' ? 'border-l-4 border-green-400' :
            notification.type === 'error' ? 'border-l-4 border-red-400' :
            notification.type === 'warning' ? 'border-l-4 border-yellow-400' :
            'border-l-4 border-blue-400'
          }`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' && (
                  <div className="text-green-400 text-xl">✅</div>
                )}
                {notification.type === 'error' && (
                  <div className="text-red-400 text-xl">❌</div>
                )}
                {notification.type === 'warning' && (
                  <div className="text-yellow-400 text-xl">⚠️</div>
                )}
                {notification.type === 'info' && (
                  <div className="text-blue-400 text-xl">ℹ️</div>
                )}
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900">
                  {notification.title}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => dispatch(removeNotification(notification.id))}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
