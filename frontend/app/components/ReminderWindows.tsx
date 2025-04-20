'use client';

import { useState, useEffect } from 'react';
import { getReminderWindows, ReminderWindow } from '../services/reminderService';

export default function ReminderWindows() {
  const [reminderWindows, setReminderWindows] = useState<ReminderWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReminderWindows = async () => {
      try {
        setLoading(true);
        const windows = await getReminderWindows();
        setReminderWindows(windows);
        setError(null);
      } catch (err) {
        setError('Failed to load reminder windows');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReminderWindows();
  }, []);

  if (loading) {
    return <div className="text-center p-4">Loading reminder windows...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Reminder Windows</h2>
      <div className="space-y-4">
        {reminderWindows.map((window) => (
          <div key={window.key} className="border-b pb-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{window.displayName}</h3>
                <p className="text-sm text-gray-500">
                  {window.isHourBased
                    ? `${window.minDuration} to ${window.maxDuration} hours before event`
                    : `${Math.round(window.minDuration * 60)} to ${Math.round(window.maxDuration * 60)} minutes before event`}
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {window.key}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 