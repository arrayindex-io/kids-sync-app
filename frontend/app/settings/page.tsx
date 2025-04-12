"use client"

import { useState, useEffect, FormEvent } from 'react'
import { Switch } from '@headlessui/react'
import { api, User } from '../services/api'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [whatsappNotifications, setWhatsappNotifications] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsappNumber: '',
    password:'',
    confirmPassword:'',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        setLoading(true)
        const userData = await api.getUserSettings()
        setFormData({
          name:userData.name ||'',
          email: userData.email,
          whatsappNumber: userData.whatsappNumber || '',
        })
        setEmailNotifications(userData.emailNotifications)
        setWhatsappNotifications(userData.whatsappNotifications)
        setError(null)
      } catch (err) {
        console.error('Error fetching user settings:', err)
        setError('Failed to load user settings. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchUserSettings()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const { confirmPassword, ...signupData } = formData;
    const profileData: { name?: string; password?: string } = {};

    if (formData.name) {
        profileData.name = formData.name;
    }
    if (formData.password) {
        profileData.password = formData.password;
    }

    const settingsData = {
        email: formData.email,
        whatsappNumber: formData.whatsappNumber,
        emailNotifications,
        whatsappNotifications,
    };


    try {
      setSaving(true)
      const promises = [];
      if (Object.keys(profileData).length > 0) {
        promises.push(api.updateProfile(profileData));
      }
      promises.push(api.updateUserSettings(settingsData))
      await Promise.all(promises)
        alert('Settings updated successfully!')    } catch (err:any) {
        console.error('Error updating settings:', err);
        setError(err.message || 'Failed to update settings. Please try again.');
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="py-10">
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Settings
          </h2>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Loading settings...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <div className="space-y-10 divide-y divide-gray-900/10">
              <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
                <div className="px-4 sm:px-0">
                  <h2 className="text-base font-semibold leading-7 text-gray-900">Profile</h2>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Update your contact information for notifications.
                  </p>
                </div>

                <form className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2" onSubmit={handleSubmit}>
                  <div className="px-4 py-6 sm:p-8">
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

              <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
                <div className="px-4 sm:px-0">
                  <h2 className="text-base font-semibold leading-7 text-gray-900">Notifications</h2>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Choose how you want to receive notifications about upcoming events.
                  </p>
                </div>

                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                  <div className="px-4 py-6 sm:p-8">
                    <div className="max-w-2xl space-y-10">
                      <fieldset>
                        <div className="space-y-6">
                          <div className="flex items-center">
                            <Switch
                              checked={emailNotifications}
                              onChange={setEmailNotifications}
                              className={classNames(
                                emailNotifications ? 'bg-indigo-600' : 'bg-gray-200',
                                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2'
                              )}
                            >
                              <span className="sr-only">Email notifications</span>
                              <span
                                className={classNames(
                                  emailNotifications ? 'translate-x-5' : 'translate-x-0',
                                  'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                                )}
                              >
                                <span
                                  className={classNames(
                                    emailNotifications ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in',
                                    'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                                  )}
                                  aria-hidden="true"
                                />
                                <span
                                  className={classNames(
                                    emailNotifications ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out',
                                    'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                                  )}
                                  aria-hidden="true"
                                />
                              </span>
                            </Switch>
                            <span className="ml-3">
                              <span className="text-sm font-medium leading-6 text-gray-900">Email notifications</span>
                              <span className="text-sm text-gray-500">
                                <span className="block sm:inline sm:ml-2">Receive email reminders for upcoming events.</span>
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Switch
                              checked={whatsappNotifications}
                              onChange={setWhatsappNotifications}
                              className={classNames(
                                whatsappNotifications ? 'bg-indigo-600' : 'bg-gray-200',
                                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2'
                              )}
                            >
                              <span className="sr-only">WhatsApp notifications</span>
                              <span
                                className={classNames(
                                  whatsappNotifications ? 'translate-x-5' : 'translate-x-0',
                                  'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                                )}
                              >
                                <span
                                  className={classNames(
                                    whatsappNotifications ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in',
                                    'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                                  )}
                                  aria-hidden="true"
                                />
                                <span
                                  className={classNames(
                                    whatsappNotifications ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out',
                                    'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
                                  )}
                                  aria-hidden="true"
                                />
                              </span>
                            </Switch>
                            <span className="ml-3">
                              <span className="text-sm font-medium leading-6 text-gray-900">WhatsApp notifications</span>
                              <span className="text-sm text-gray-500">
                                <span className="block sm:inline sm:ml-2">Receive WhatsApp reminders for upcoming events.</span>
                              </span>
                            </span>
                          </div>
                        </div>
                      </fieldset>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 