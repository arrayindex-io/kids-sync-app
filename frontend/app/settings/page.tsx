"use client"

import { useState, useEffect, FormEvent } from 'react'
import { Switch } from '@headlessui/react'
import { api } from '../services/api'
import { useRouter } from 'next/navigation'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

interface User {
  id: number;
  email: string;
  name: string;
  whatsappNumber: string;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
}

interface UserUpdateData extends Omit<User, 'id'> {
  password?: string;
}

export default function Settings() {
  const router = useRouter();
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [whatsappNotifications, setWhatsappNotifications] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsappNumber: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await api.getCurrentUser();
        setFormData({
          name: user.name || '',
          email: user.email,
          whatsappNumber: user.whatsappNumber || '',
          password: '',
          confirmPassword: ''
        });
        setEmailNotifications(user.emailNotifications);
        setWhatsappNotifications(user.whatsappNotifications);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user data');
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      // Validate passwords match if either is provided
      if (formData.password || formData.confirmPassword) {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setSaving(false);
          return;
        }
      }

      // Prepare the data to send
      const updateData: UserUpdateData = {
        name: formData.name,
        email: formData.email,
        whatsappNumber: formData.whatsappNumber,
        emailNotifications: emailNotifications,
        whatsappNotifications: whatsappNotifications,
      };

      // Only include password if it's being changed
      if (formData.password) {
        updateData.password = formData.password;
      }

      // Update user profile
      await api.updateUserSettings(updateData);
      
      // Clear password fields after successful update
      setFormData({
        ...formData,
        password: '',
        confirmPassword: ''
      });
      
      // Show success message
      alert('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setDeleting(true);
    try {
      await api.deleteProfile();
      // Redirect to login page after successful deletion
      router.push('/login');
    } catch (err) {
      console.error('Error deleting profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete profile');
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div >
            <h3 className="text-xl font-semibold text-gray-700">
              Account Settings
            </h3>
            <div className="mt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="name" className="block text-sm font-medium">
                      Name
                    </label>
                    <div className="mt-2">
                      <input
                        id="name" 
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <label htmlFor="email" className="block text-sm font-medium">
                      Email
                    </label>
                    <div className="mt-2">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <label htmlFor="whatsapp" className="block text-sm font-medium">
                      WhatsApp Number
                    </label>
                    <div className="mt-2">
                      <input
                        type="tel"
                        name="whatsapp"
                        id="whatsapp"
                        value={formData.whatsappNumber}
                        onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="+1 (555) 987-6543"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <label htmlFor="password" className="block text-sm font-medium">
                      Password
                    </label>
                    <div className="mt-2">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="New Password"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium">
                      Confirm Password
                    </label>
                    <div className="mt-2">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="Confirm New Password"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
                  <button 
                    type="submit"
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* Delete Profile Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-700">
              Danger Zone
            </h3>
            <div className="mt-2 text-sm text-gray-500">
              <p>Once you delete your account, there is no going back. Please be certain.</p> 
            </div>
            <div className="mt-4 flex justify-center">
              {showDeleteConfirm ? (
                <div className="text-center space-y-4">
                  <p className="text-red-600 font-semibold">Are you sure you want to delete your account? This action cannot be undone.</p>
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500">
                   
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteProfile}
                      disabled={deleting}
                      className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50"
                    >
                      {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleDeleteProfile}
                  className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete Account
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 