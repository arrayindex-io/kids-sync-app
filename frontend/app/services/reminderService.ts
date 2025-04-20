import { API_BASE_URL } from './api';

export interface ReminderWindow {
  key: string;
  minDuration: number;
  maxDuration: number;
  isHourBased: boolean;
  displayName: string;
}

/**
 * Fetch all configured reminder windows from the API
 */
export async function getReminderWindows(): Promise<ReminderWindow[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reminders/windows`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch reminder windows');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching reminder windows:', error);
    throw error;
  }
} 