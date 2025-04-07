"use client"

import { useEffect, useState } from 'react'
import { api, Event } from './services/api'
import { CalendarIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [upcomingData, allEventsData] = await Promise.all([
          api.getUpcomingEvents(),
          api.getEvents()
        ])
        setUpcomingEvents(upcomingData)
        setAllEvents(allEventsData)
        setError(null)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const stats = [
    { name: 'Total Events', value: allEvents.length, icon: CalendarIcon },
    { name: 'Upcoming Events', value: upcomingEvents.length, icon: ClockIcon },
    { name: 'Active Kids', value: '3', icon: UserGroupIcon },
  ]

  return (
    <div className="py-10">
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Dashboard</h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Stats */}
          <div className="mt-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {stats.map((item) => (
                <div key={item.name} className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
                  <dt>
                    <div className="absolute rounded-md bg-indigo-500 p-3">
                      <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
                  </dt>
                  <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                    <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                  </dd>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="mt-8">
            <div className="overflow-hidden bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Upcoming Events</h3>
              </div>
              {loading ? (
                <div className="px-4 py-5 sm:p-6 text-center">
                  <p className="text-gray-500">Loading events...</p>
                </div>
              ) : error ? (
                <div className="px-4 py-5 sm:p-6 text-center">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="px-4 py-5 sm:p-6 text-center">
                  <p className="text-gray-500">No upcoming events</p>
                </div>
              ) : (
                <ul role="list" className="divide-y divide-gray-200">
                  {upcomingEvents.map((event) => (
                    <li key={event.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <p className="truncate text-sm font-medium text-indigo-600">{event.name}</p>
                          <p className="ml-2 flex-shrink-0 text-sm text-gray-500">
                            {new Date(event.dateTime).toLocaleDateString()} at {new Date(event.dateTime).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            {event.recurrence}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">{event.notes}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
