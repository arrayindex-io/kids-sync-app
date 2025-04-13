"use client"

import { useEffect, useState } from 'react'
import { api, Event } from './services/api'
import { CalendarIcon, UserGroupIcon, ClockIcon, FunnelIcon } from '@heroicons/react/24/outline'

export default function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useDateRange, setUseDateRange] = useState(false)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Get all events
        const allEventsData = await api.getEvents()
        setAllEvents(allEventsData)
        
        // Get upcoming events or events by date range
        let upcomingData: Event[] = []
        
        if (useDateRange && startDate && endDate) {
          // Format dates for API (add time component)
          const formattedStartDate = `${startDate}T00:00:00`
          const formattedEndDate = `${endDate}T23:59:59`
          
          console.log('Fetching events by date range:', formattedStartDate, 'to', formattedEndDate)
          upcomingData = await api.getEventsByDateRange(formattedStartDate, formattedEndDate)
        } else {
          // Get upcoming events
          upcomingData = await api.getUpcomingEvents()
        }
        
        setUpcomingEvents(upcomingData)
        setError(null)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [useDateRange, startDate, endDate])

  const handleDateRangeToggle = () => {
    setUseDateRange(!useDateRange)
    if (!useDateRange) {
      // Set default date range from today to one year in the future
      const today = new Date()
      const oneYearFromNow = new Date()
      oneYearFromNow.setFullYear(today.getFullYear() + 1)
      
      setStartDate(today.toISOString().split('T')[0])
      setEndDate(oneYearFromNow.toISOString().split('T')[0])
    }
  }

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
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {useDateRange ? 'Events by Date Range' : 'Upcoming Events'}
                </h3>
                
                {/* Date Range Selection */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="useDateRange"
                      checked={useDateRange}
                      onChange={handleDateRangeToggle}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <label htmlFor="useDateRange" className="ml-2 text-sm font-medium text-gray-700">
                      Filter by Date Range
                    </label>
                  </div>
                  
                  {useDateRange && (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <label htmlFor="startDate" className="mr-2 text-sm font-medium text-gray-700">
                          From:
                        </label>
                        <input
                          type="date"
                          id="startDate"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div className="flex items-center">
                        <label htmlFor="endDate" className="mr-2 text-sm font-medium text-gray-700">
                          To:
                        </label>
                        <input
                          type="date"
                          id="endDate"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
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
                  <p className="text-gray-500">No events found</p>
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
