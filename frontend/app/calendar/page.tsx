"use client"

import { useState, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, ArrowPathIcon, PlusIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { api, Event } from '../services/api'
import { useRouter } from 'next/navigation'
import NewEventForm from '../components/NewEventForm'

function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Calendar() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredEvent, setHoveredEvent] = useState<Event | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [isNewEventFormOpen, setIsNewEventFormOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [useDateRange, setUseDateRange] = useState(false)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  // Initialize currentDate on client-side only
  useEffect(() => {
    setCurrentDate(new Date())
  }, [])

  const fetchEvents = async () => {
    if (!currentDate) return; // Don't fetch if currentDate is not initialized
    
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
      
      console.log('Fetched events for calendar:', data)
      
      // Check if events have valid dateTime values
      data.forEach(event => {
        console.log(`Event: ${event.name}, dateTime: ${event.dateTime}`)
        
        // Validate dateTime format
        if (!event.dateTime || !event.dateTime.includes('T')) {
          console.warn(`Event ${event.name} has invalid dateTime format: ${event.dateTime}`)
        }
      })
      
      // Direct check for specific dates
      const april8Events = data.filter(event => event.dateTime.startsWith('2024-04-08'))
      const april11Events = data.filter(event => event.dateTime.startsWith('2024-04-11'))
      
      console.log('Events on April 8:', april8Events)
      console.log('Events on April 11:', april11Events)
      
      setEvents(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Failed to load events. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentDate) {
      fetchEvents()
    }
  }, [currentDate, useDateRange, startDate, endDate])

  // Get the first day of the current month
  const firstDayOfMonth = currentDate ? new Date(currentDate.getFullYear(), currentDate.getMonth(), 1) : new Date()
  
  // Get the last day of the current month
  const lastDayOfMonth = currentDate ? new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0) : new Date()
  
  // Get the day of the week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  
  // Get the total number of days in the month
  const daysInMonth = lastDayOfMonth.getDate()
  
  // Create an array of days for the month
  const days = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({ date: null, events: [] })
  }
  
  // Add cells for each day of the month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = currentDate ? new Date(currentDate.getFullYear(), currentDate.getMonth(), i) : new Date()
    // Format the date as YYYY-MM-DD for comparison
    const dateString = date.toISOString().split('T')[0]
    
    // Log the current date being processed
    console.log('Processing date:', dateString)
    
    const dayEvents = events.filter(event => {
      // Format the event date as YYYY-MM-DD for comparison
      const eventDateString = event.dateTime.split('T')[0]
      
      // Log the comparison
      console.log(`Comparing ${eventDateString} with ${dateString}: ${eventDateString === dateString}`)
      
      // Simple string comparison for dates
      const isMatch = eventDateString === dateString
      
      if (isMatch) {
        console.log('Event match found:', event.name, 'for date:', dateString)
      }
      return isMatch
    })
    
    days.push({ date, events: dayEvents })
  }

  // Function to go to the previous month
  const goToPreviousMonth = () => {
    if (currentDate) {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }
  }

  // Function to go to the next month
  const goToNextMonth = () => {
    if (currentDate) {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }
  }

  // Format the current month and year for display
  const monthYear = currentDate ? currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }) : 'Loading...'

  const handleCreateEvent = async (eventData: any) => {
    try {
      setLoading(true)
      await api.createEvent(eventData)
      setIsNewEventFormOpen(false)
      setSelectedDate(null)
      // Show success message
      alert('Event created successfully!')
      // Refresh events
      fetchEvents()
    } catch (err) {
      console.error('Error creating event:', err)
      alert('Failed to create event. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setIsNewEventFormOpen(true)
  }

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

  return (
    <div className="py-10">
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                Calendar
              </h2>
            </div>
            <div className="mt-4 flex md:ml-4 md:mt-0">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={goToPreviousMonth}
                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  <ChevronLeftIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                  Previous
                </button>
                <span className="text-lg font-medium text-gray-900">{monthYear}</span>
                <button
                  type="button"
                  onClick={goToNextMonth}
                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Next
                  <ChevronRightIcon className="-mr-0.5 ml-1.5 h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={fetchEvents}
                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  disabled={loading}
                >
                  <ArrowPathIcon className={`-ml-0.5 mr-1.5 h-5 w-5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate(new Date())
                    setIsNewEventFormOpen(true)
                  }}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                  Create Event
                </button>
              </div>
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
                Use Date Range
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
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Loading calendar...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <>
              <div className="mt-8 overflow-hidden bg-white shadow sm:rounded-lg">
                <div className="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs font-semibold leading-6 text-gray-700">
                  <div className="bg-white py-1.5">Sun</div>
                  <div className="bg-white py-1.5">Mon</div>
                  <div className="bg-white py-1.5">Tue</div>
                  <div className="bg-white py-1.5">Wed</div>
                  <div className="bg-white py-1.5">Thu</div>
                  <div className="bg-white py-1.5">Fri</div>
                  <div className="bg-white py-1.5">Sat</div>
                </div>
                <div className="flex bg-gray-200 text-xs leading-6 text-gray-700">
                  <div className="w-full grid grid-cols-7 grid-rows-6 gap-px">
                    {days.map((day, dayIdx) => {
                      // Log days with events
                      if (day.events.length > 0) {
                        console.log(`Day ${day.date?.toISOString().split('T')[0]} has ${day.events.length} events:`, day.events)
                      }
                      
                      return (
                        <div
                          key={dayIdx}
                          className={classNames(
                            day.date ? 'bg-white hover:bg-gray-50 cursor-pointer transition-colors duration-150' : 'bg-gray-50',
                            day.date && day.date.getDate() === new Date().getDate() && 
                            day.date.getMonth() === new Date().getMonth() && 
                            day.date.getFullYear() === new Date().getFullYear() 
                              ? 'ring-2 ring-indigo-500 bg-indigo-50' 
                              : '',
                            'relative py-2 px-3 min-h-[100px]'
                          )}
                          onClick={() => day.date && handleDayClick(day.date)}
                          title={day.date ? "Click to create an event on this day" : ""}
                        >
                          {day.date && (
                            <div className="flex justify-between items-center">
                              <time
                                dateTime={day.date.toISOString().split('T')[0]}
                                className={classNames(
                                  day.date.getDate() === new Date().getDate() &&
                                  day.date.getMonth() === new Date().getMonth() &&
                                  day.date.getFullYear() === new Date().getFullYear()
                                    ? 'font-semibold text-indigo-600'
                                    : 'text-gray-900',
                                  'text-sm'
                                )}
                              >
                                {day.date.getDate()}
                              </time>
                              <button
                                type="button"
                                className="text-gray-400 hover:text-indigo-600 focus:outline-none"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDayClick(day.date!);
                                }}
                                title="Create event on this day"
                              >
                                <PlusIcon className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </div>
                          )}
                          {day.events.length > 0 && (
                            <ol className="mt-2">
                              {day.events.map((event) => (
                                <li key={event.id} className="group flex">
                                  <div
                                    className="flex-auto truncate p-2 text-xs leading-5 text-white bg-indigo-600 rounded-md mb-1 group-hover:bg-indigo-700 cursor-pointer"
                                    onMouseEnter={(e) => {
                                      setHoveredEvent(event);
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      const viewportWidth = window.innerWidth;
                                      const viewportHeight = window.innerHeight;
                                      const tooltipWidth = 200; // Approximate width of tooltip
                                      const tooltipHeight = 100; // Approximate height of tooltip

                                      let x = rect.right + 10;
                                      let y = rect.top;

                                      // Adjust horizontal position if tooltip would go off screen
                                      if (x + tooltipWidth > viewportWidth) {
                                        x = rect.left - tooltipWidth - 10;
                                      }

                                      // Adjust vertical position if tooltip would go off screen
                                      if (y + tooltipHeight > viewportHeight) {
                                        y = viewportHeight - tooltipHeight - 10;
                                      }

                                      setTooltipPosition({ x, y });
                                    }}
                                    onMouseLeave={() => setHoveredEvent(null)}
                                    onClick={() => router.push('/events')}
                                  >
                                    {event.name}
                                    {event.recurrence !== 'NONE' && (
                                      <span className="ml-1 text-xs text-indigo-200">
                                        ({event.recurrence})
                                      </span>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ol>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              
              {/* Event Tooltip */}
              {hoveredEvent && (
                <div 
                  className="fixed z-10 bg-white shadow-lg rounded-md p-4 max-w-xs border border-gray-200"
                  style={{
                    left: `${tooltipPosition.x}px`,
                    top: `${tooltipPosition.y}px`,
                    transform: 'translateY(10px)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <h3 className="text-sm font-medium text-gray-900">{hoveredEvent.name}</h3>
                  <div className="mt-1 text-xs text-gray-500">
                    <p><span className="font-medium">Date:</span> {new Date(hoveredEvent.dateTime).toLocaleString()}</p>
                    <p><span className="font-medium">Recurrence:</span> {hoveredEvent.recurrence}</p>
                    {hoveredEvent.recurrenceEndDate && (
                      <p><span className="font-medium">Ends:</span> {new Date(hoveredEvent.recurrenceEndDate).toLocaleDateString()}</p>
                    )}
                    {hoveredEvent.notes && (
                      <p className="mt-2"><span className="font-medium">Notes:</span> {hoveredEvent.notes}</p>
                    )}
                  </div>
                </div>
              )}
              
              {/* New Event Form */}
              <NewEventForm
                open={isNewEventFormOpen}
                setOpen={setIsNewEventFormOpen}
                onSubmit={handleCreateEvent}
                initialDate={selectedDate}
              />
              
              {/* Debug section */}
              <div className="mt-8 overflow-hidden bg-white shadow sm:rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Debug Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Current Month: {monthYear}</h4>
                    <p className="text-sm text-gray-500">Total Events: {events.length}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Events by Date</h4>
                    <div className="mt-2 space-y-2">
                      {days.filter(day => day.events.length > 0).map((day, index) => (
                        <div key={index} className="text-sm">
                          <p className="font-medium">
                            {day.date?.toLocaleDateString()}: {day.events.length} events
                          </p>
                          <ul className="ml-4 list-disc">
                            {day.events.map(event => (
                              <li key={event.id}>
                                {event.name} ({event.dateTime})
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
} 