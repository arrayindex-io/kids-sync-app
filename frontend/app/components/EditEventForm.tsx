"use client"

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Event } from '../services/api'

interface EditEventFormProps {
  open: boolean
  setOpen: (open: boolean) => void
  onSubmit: (eventData: any) => void
  event: Event | null
}

export default function EditEventForm({ open, setOpen, onSubmit, event }: EditEventFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    dateTime: '',
    recurrence: 'WEEKLY',
    notes: '',
    recurrenceEndDate: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form data when event changes
  useEffect(() => {
    if (event) {
      // Format the dateTime to local datetime string for the input
      const dateTime = new Date(event.dateTime)
      const formattedDateTime = new Date(dateTime.getTime() - dateTime.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
      
      setFormData({
        name: event.name,
        dateTime: formattedDateTime,
        recurrence: event.recurrence,
        notes: event.notes,
        recurrenceEndDate: event.recurrenceEndDate || '',
      })
    }
  }, [event])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required'
    }
    
    if (!formData.dateTime) {
      newErrors.dateTime = 'Date and time is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Format the dateTime to ISO string
      const eventData = {
        ...formData,
        dateTime: new Date(formData.dateTime).toISOString(),
        // Only include recurrenceEndDate if it's not empty
        ...(formData.recurrenceEndDate ? { recurrenceEndDate: new Date(formData.recurrenceEndDate).toISOString() } : {})
      }
      console.log('Submitting event update:', eventData)
      onSubmit(eventData)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      Edit Event
                    </Dialog.Title>
                    <div className="mt-2">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Event Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-md ${
                              errors.name ? 'border-red-300' : 'border-gray-300'
                            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                          />
                          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                          <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700">
                            Date and Time
                          </label>
                          <input
                            type="datetime-local"
                            name="dateTime"
                            id="dateTime"
                            value={formData.dateTime}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-md ${
                              errors.dateTime ? 'border-red-300' : 'border-gray-300'
                            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                          />
                          {errors.dateTime && <p className="mt-1 text-sm text-red-600">{errors.dateTime}</p>}
                        </div>

                        <div>
                          <label htmlFor="recurrence" className="block text-sm font-medium text-gray-700">
                            Recurrence
                          </label>
                          <select
                            name="recurrence"
                            id="recurrence"
                            value={formData.recurrence}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          >
                            <option value="NONE">None</option>
                            <option value="DAILY">Daily</option>
                            <option value="WEEKLY">Weekly</option>
                            <option value="MONTHLY">Monthly</option>
                          </select>
                        </div>

                        {formData.recurrence !== 'NONE' && (
                          <div>
                            <label htmlFor="recurrenceEndDate" className="block text-sm font-medium text-gray-700">
                              Recurrence End Date (Optional)
                            </label>
                            <input
                              type="datetime-local"
                              name="recurrenceEndDate"
                              id="recurrenceEndDate"
                              value={formData.recurrenceEndDate}
                              onChange={handleChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                        )}

                        <div>
                          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                            Notes
                          </label>
                          <textarea
                            name="notes"
                            id="notes"
                            rows={3}
                            value={formData.notes}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>

                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:w-auto"
                          >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            onClick={() => setOpen(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
} 