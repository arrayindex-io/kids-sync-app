"use client"

// API base URL - adjust this to match your backend URL
const API_BASE_URL = 'http://localhost:8080/api';

// Helper functions for token management
const getToken = () => {
  // Try to get token from localStorage first (for backward compatibility)
  const localToken = localStorage.getItem('token');
  console.log('Local storage token:', localToken ? 'exists' : 'not found');
  if (localToken) return localToken;
  
  // If not in localStorage, try to get from cookies
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith('token=')) {
      const token = cookie.substring(6);
      console.log('Cookie token found');
      return token;
    }
  }
  console.log('No token found in storage');
  return null;
};

const setToken = (token: string) => {
  // Store in localStorage for backward compatibility
  localStorage.setItem('token', token);
  
  // Also store in cookies for middleware access
  document.cookie = `token=${token}; path=/; max-age=86400`; // 24 hours
};

const removeToken = () => {
  // Remove from localStorage
  localStorage.removeItem('token');
  
  // Remove from cookies
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

// Common headers for all requests
const getHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Add Authorization header if token exists
  const token = getToken();
  if (token) {
    console.log('Adding Authorization header with token');
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.log('No token available for Authorization header');
  }
  
  return headers;
};

// Event types
export interface Event {
  id: string;
  name: string;
  dateTime: string;
  recurrence: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  notes: string;
  userId: string;
  completed?: boolean;
  recurrenceEndDate?: string;
}

// User types
export interface User {
  id: number;
  email: string;
  name: string;
  whatsappNumber: string;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
}

// Signup types
export interface SignupData {
  email: string;
  password: string;
  name?: string;
  whatsappNumber?: string;
}

// User update types
export interface UserUpdateData extends Omit<User, 'id'> {
  password?: string;
}

// Add cache for user profile
let userProfileCache: User | null = null;
let lastProfileFetch: number = 0;
const PROFILE_CACHE_DURATION = 30000; // 30 seconds

// API functions
export const api = {
  // Auth
  signup: async (data: { email: string; password: string; whatsappNumber?: string }): Promise<{ token: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Signup failed');
    }
    const responseData = await response.json();
    setToken(responseData.token);
    return responseData;
  },

  login: async (email: string, password: string): Promise<{ token: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
    const responseData = await response.json();
    setToken(responseData.token);
    return responseData;
  },

  logout: async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: getHeaders(),
      });
      if (!response.ok) { 
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear cache and tokens
      api.clearProfileCache();
      removeToken();
      localStorage.clear();
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      window.location.href = '/login';
    }
  },

  updateProfile: async (data: { name?: string; password?: string }): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Profile update failed");
    }
  },

  deleteProfile: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete profile');
    }
    // Clear token after successful deletion
    removeToken();
  },

  // Events
  getEvents: async (): Promise<Event[]> => {
    try {
      console.log("API: Fetching events...");
      const response = await fetch(`${API_BASE_URL}/events`, {
        headers: getHeaders(),
      });
      console.log("API: Events response status:", response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return [];
        }
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      
      // Validate event data
      data.forEach((event: Event, index: number) => {
        console.log(`API: Event ${index}:`, event)
        if (!event.dateTime) {
          console.warn(`API: Event ${index} has no dateTime:`, event)
        }
      });
      
      return data;
    } catch (error) {
      console.error('API: Error fetching events:', error);
      return []; // Return empty array instead of throwing
    }
  },

  getUpcomingEvents: async (): Promise<Event[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/upcoming`, {
        headers: getHeaders(),
      });
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return [];
        }
        throw new Error('Failed to fetch upcoming events');
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      return []; // Return empty array instead of throwing
    }
  },

  getEventsByDateRange: async (startDate: string, endDate: string): Promise<Event[]> => {
    try {
      console.log("API: Fetching events by date range:", startDate, "to", endDate);
      const response = await fetch(`${API_BASE_URL}/events/range?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`, {
        headers: getHeaders(),
      }); 
      
      console.log('API: Date range response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('API: Unauthorized, redirecting to login');
          window.location.href = '/login';
          return [];
        }
        throw new Error('Failed to fetch events by date range');
      }
      
      const data = await response.json(); 
      console.log('API: Fetched events by date range:', data);
      
      return data;
    } catch (error) {
      console.error('API: Error fetching events by date range:', error);
      return []; // Return empty array instead of throwing
    }
  },

  getEventById: async (id: string): Promise<Event> => {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      throw new Error(`Failed to fetch event with id ${id}`);
    }
    return response.json();
  },

  createEvent: async (event: Omit<Event, 'id' | 'userId'>): Promise<Event> => {
    const response = await fetch(`${API_BASE_URL}/events`, { 
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        name: event.name,
        dateTime: event.dateTime,
        notes: event.notes,
        recurrence: event.recurrence
      }),
    });
    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to create event');
    }
    return response.json();
  },

  updateEvent: async (eventId: string, eventData: Partial<Event>): Promise<Event> => {
    console.log("API: Updating event with ID:", eventId);
    console.log("API: Update data:", eventData);
    
    try {
      // First, fetch the existing event to get all its data
      const existingEvent = await api.getEventById(eventId);
      console.log("API: Existing event data:", existingEvent);
      
      // Merge the existing event data with the update data
      const completeEventData = {
        ...existingEvent,
        ...eventData,
        id: eventId, // Ensure the ID is preserved
        userId: existingEvent.userId // Ensure the userId is preserved
      };
      
      console.log("API: Complete event data for update:", completeEventData);
      
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getHeaders(),
        }, 
        body: JSON.stringify(completeEventData),
      });
      
      if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API: Update event error:", errorData);
        throw new Error(`Failed to update event: ${errorData.message || 'Unknown error'}`);
      }

      return response.json();
    } catch (error) {
      console.error("API: Error in updateEvent:", error);
      throw error;
    }
  },

  deleteEvent: async (id: string): Promise<void> => {
    console.log("API: Deleting event with ID:", id);
    

    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login";
        throw new Error('Unauthorized');
      }
      const errorData = await response.json().catch(() => ({}));
      console.error('API: Delete event error:', errorData);
      throw new Error(`Failed to delete event: ${errorData.message || 'Unknown error'}`);
    }
  },

  // User settings
  getUserSettings: async (): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: getHeaders(),
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return {
            id: 1,
            email: '',
            name: '',
            whatsappNumber: '',
            emailNotifications: true,
            whatsappNotifications: false,
          };
        }
        throw new Error('Failed to fetch user settings');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching user settings:', error);
      // Return default user settings
      return {
        id: 1,
        email: '',
        name: '',
        whatsappNumber: '',
        emailNotifications: true,
        whatsappNotifications: false,
      };
    }
  },

  updateUserSettings: async (settings: UserUpdateData): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      throw new Error('Failed to update user settings');
    }
    const data = await response.json();
    return data;
  },

  getCurrentUser: async (): Promise<User> => {
    // Check if we have a cached profile that's still valid
    const now = Date.now();
    if (userProfileCache && (now - lastProfileFetch) < PROFILE_CACHE_DURATION) {
      console.log('Using cached user profile');
      return userProfileCache;
    }

    console.log('Fetching current user...');
    const headers = getHeaders();
    console.log('Request headers:', headers);
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers,
    });
    console.log('Current user response status:', response.status);
    
    if (response.status === 401) {
      console.log('Unauthorized access, clearing tokens and redirecting to login');
      // Clear all tokens and storage
      removeToken();
      localStorage.clear();
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    
    if (!response.ok) {
      console.error('Failed to fetch current user:', response.status);
      throw new Error('Failed to fetch current user');
    }
    
    const user = await response.json();
    console.log('Current user data:', user);
    
    // Update cache
    userProfileCache = user;
    lastProfileFetch = now;
    
    return user;
  },

  // Add function to clear profile cache
  clearProfileCache: () => {
    userProfileCache = null;
    lastProfileFetch = 0;
  },
};