"use client"

import { useState, useEffect, FormEvent } from 'react'
import { Switch } from '@headlessui/react'
import { api } from '../services/api'

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
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user data');
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

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Account Settings
            </h3>
            <div className="mt-5">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
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
                  <div className="sm:col-span-4">
                    <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                      Email address
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
                  <div className="sm:col-span-4">
                    <label htmlFor="whatsapp" className="block text-sm font-medium leading-6 text-gray-900">
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
                  <div className="sm:col-span-4">
                    <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
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
                  <div className="sm:col-span-4">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900">
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
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 