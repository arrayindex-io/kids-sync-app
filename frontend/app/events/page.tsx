"use client"

import { useState, useEffect } from 'react';
import { api, Event } from '../services/api';
import NewEventForm from '../components/NewEventForm';
import EditEventForm from '../components/EditEventForm';
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
      // Set default date range from today to one year in the future
      const today = new Date()
      const oneYearFromNow = new Date()
      oneYearFromNow.setFullYear(today.getFullYear() + 1)
      
      setStartDate(today.toISOString().split('T')[0])
      setEndDate(oneYearFromNow.toISOString().split('T')[0])
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
    return <div className="text-center py-4 text-gray-700">Loading...</div>
  }

  if (error) {
    return <div className="text-center text-red-600 py-4">{error}</div>
  }

 return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-700">Events</h1>
          <p className="mt-2 text-gray-500">
            View and manage all your events here.
          </p>
        </div>
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
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center space-x-2">
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
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <label htmlFor="startDate" className="text-sm text-gray-700">
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
            <div className="flex items-center space-x-1">
              <label htmlFor="endDate" className="text-sm text-gray-700">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="text-lg font-semibold text-gray-700">{event.name}</h3>

                <div className="flex space-x-2">
                    <button
                        onClick={() => openEditForm(event)}
                        className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
                      >
                        <PencilIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-600 hover:text-red-900 focus:outline-none"
                      >
                        <TrashIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                  </div>
              </div>
              <div className="flex space-x-4 text-sm text-gray-600">
                <p>
                   <span className="font-medium">Date:</span>
                  {new Date(event.dateTime).toLocaleString()}
                </p>
                 {event.recurrence && (
                     <p>
                        <span className="font-medium">Recurrence:</span> {event.recurrence}
                     </p>
                  )}
               
              </div>
             
             {event.notes && (
                <div className="mt-2">
                   <p className="text-gray-600">
                     <span className="font-medium">Notes:</span> {event.notes}
                     </p>
                 </div>
              )}
               
            </div>
          ))}
      </div>
      <div className="mt-8">
        <div className="mt-6">
           
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