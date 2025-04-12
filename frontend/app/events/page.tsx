"use client"

import { useState, useEffect } from 'react'
import { api, Event } from '../services/api'
import NewEventForm from '../components/NewEventForm'
import EditEventForm from '../components/EditEventForm'
import { PencilIcon, TrashIcon, FunnelIcon, CalendarIcon } from '@heroicons/react/24/outline'

export default function Events() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isNewEventFormOpen, setIsNewEventFormOpen] = useState(false)
  const [isEditEventFormOpen, setIsEditEventFormOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [useDateRange, setUseDateRange] = useState(false)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const fetchEvents = async () => {
    try {
      setLoading(true)
      
      let data: Event[] = []
      
      if (useDateRange && startDate && endDate) {
        // Format dates for API (add time component)
        const formattedStartDate = `${startDate}T00:00:00`
        const formattedEndDate = `${endDate}T23:59:59`
        
        console.log('Fetching events by date range:', formattedStartDate, 'to', formattedEndDate)
        data = await api.getEventsByDateRange(formattedStartDate, formattedEndDate)
      } else {
        // Fetch all events
        data = await api.getEvents()
      }
      
      setEvents(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch events')
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [useDateRange, startDate, endDate])

  const handleDateRangeToggle = () => {
    setUseDateRange(!useDateRange)
    if (!useDateRange) {
      // Set default date range to April 2024 (when the events are from)
      const firstDay = new Date(2024, 3, 1) // April 1, 2024 (month is 0-indexed)
      const lastDay = new Date(2024, 3, 30) // April 30, 2024
      
      setStartDate(firstDay.toISOString().split('T')[0])
      setEndDate(lastDay.toISOString().split('T')[0])
    }
  }

  const handleCreateEvent = async (eventData: any) => {
    try {
      await api.createEvent(eventData)
      setIsNewEventFormOpen(false)
      fetchEvents()
    } catch (err) {
      console.error('Error creating event:', err)
    }
  }

  const handleEditEvent = async (eventData: any) => {
    if (!selectedEvent) return

    try {
      console.log('Events page: Updating event with ID:', selectedEvent.id)
      console.log('Events page: Update data:', eventData)
      
      // Make sure we're passing the correct event ID
      const eventId = selectedEvent.id
      
      // Call the updateEvent function with the correct parameters
      await api.updateEvent(eventId, eventData)
      
      console.log('Events page: Event updated successfully')
      setIsEditEventFormOpen(false)
      setSelectedEvent(null)
      fetchEvents()
    } catch (err) {
      console.error('Events page: Error updating event:', err)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      await api.deleteEvent(eventId)
      fetchEvents()
    } catch (err) {
      console.error('Error deleting event:', err)
    }
  }

  const openEditForm = (event: Event) => {
    setSelectedEvent(event)
    setIsEditEventFormOpen(true)
  }

  if (loading) {
    return <div className="text-center py-4">Loading...</div>
  }

  if (error) {
    return <div className="text-center text-red-600 py-4">{error}</div>
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Events</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all events in your account including their name, date, recurrence, and notes.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsNewEventFormOpen(true)}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add event
          </button>
        </div>
      </div>
      
      {/* Date Range Selection */}
      <div className="mt-4 flex items-center space-x-4">
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
            <button
              type="button"
              onClick={fetchEvents}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <CalendarIcon className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
              Apply
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Recurrence
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Notes
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {event.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(event.dateTime).toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {event.recurrence}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {event.notes}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => openEditForm(event)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <PencilIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <NewEventForm
        open={isNewEventFormOpen}
        setOpen={setIsNewEventFormOpen}
        onSubmit={handleCreateEvent}
      />

      <EditEventForm
        open={isEditEventFormOpen}
        setOpen={setIsEditEventFormOpen}
        onSubmit={handleEditEvent}
        event={selectedEvent}
      />
    </div>
  )
} 