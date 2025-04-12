"use client"

// API base URL - adjust this to match your backend URL
const API_BASE_URL = 'http://localhost:8080/api';

// Common headers for all requests
const getHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Add Authorization header if token exists
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))?.split("=")[1];
    if (token) {
    headers['Authorization'] = `Bearer ${token}`;
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

// API functions
export const api = {
  // Auth
  signup: async (data: SignupData): Promise<{ token: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
       headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password, 
        whatsappNumber: data.whatsappNumber || ''
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    const responseData = await response.json();
    // Store the token in a cookie
    document.cookie = `token=${responseData.token}; path=/; max-age=86400; SameSite=Lax`;
    return responseData;
  },

  login: async (email: string, password: string): Promise<{ token: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
       headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      }, 
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
    const data = await response.json();
    // Store the token in a cookie
    document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
    return data;
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
      // Always remove the token cookie
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
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

  // Events
  getEvents: async (): Promise<Event[]> => {
    try {
      console.log("API: Fetching events...");
      const response = await fetch(`${API_BASE_URL}/events`, {
        headers: getHeaders(),
      });
      console.log("API: Events response status:", response.status);
      
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

  getEventById: async (id: number): Promise<Event> => {
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
    

    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(),
      }, 
      body: JSON.stringify(eventData),
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
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: getHeaders(),
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return {
            id: 1,
            email: '',
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
        whatsappNumber: '',
        emailNotifications: true,
        whatsappNotifications: false,
      };
    }
  },

  updateUserSettings: async (settings: Partial<User>): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: "PUT",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify(settings), 
    });
    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to update user settings');
    }
    return response.json();
  },
};