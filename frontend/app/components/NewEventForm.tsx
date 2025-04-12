"use client"

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface NewEventFormProps {
  open: boolean
  setOpen: (open: boolean) => void
  onSubmit: (event: any) => void
  initialDate?: Date | null
}

export default function NewEventForm({ open, setOpen, onSubmit, initialDate }: NewEventFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    dateTime: '',
    recurrence: 'WEEKLY',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Set initial date when the form opens
  useEffect(() => {
    if (open && initialDate) {
      // Format the date to YYYY-MM-DDThh:mm format for the datetime-local input
      const year = initialDate.getFullYear()
      const month = String(initialDate.getMonth() + 1).padStart(2, '0')
      const day = String(initialDate.getDate()).padStart(2, '0')
      const hours = String(initialDate.getHours()).padStart(2, '0')
      const minutes = String(initialDate.getMinutes()).padStart(2, '0')
      
      const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`
      
      setFormData(prev => ({
        ...prev,
        dateTime: formattedDateTime
      }))
    }
  }, [open, initialDate])

  // Reset form when it's closed
  useEffect(() => {
    if (!open) {
      setFormData({
        name: '',
        dateTime: '',
        recurrence: 'WEEKLY',
        notes: '',
      })
      setErrors({})
    }
  }, [open])

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
        dateTime: new Date(formData.dateTime).toISOString()
      }
      onSubmit(eventData)
      // Reset form after successful submission
      setFormData({
        name: '',
        dateTime: '',
        recurrence: 'WEEKLY',
        notes: '',
      })
      setErrors({})
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
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
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      New Event
                    </Dialog.Title>
                    <div className="mt-2">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                            Event Name
                          </label>
                          <div className="mt-2">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                                errors.name ? 'ring-red-300' : 'ring-gray-300'
                              } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                          </div>
                        </div>

                        <div>
                          <label htmlFor="dateTime" className="block text-sm font-medium leading-6 text-gray-900">
                            Date & Time
                          </label>
                          <div className="mt-2">
                            <input
                              type="datetime-local"
                              name="dateTime"
                              id="dateTime"
                              value={formData.dateTime}
                              onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                              className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                                errors.dateTime ? 'ring-red-300' : 'ring-gray-300'
                              } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                            />
                            {errors.dateTime && <p className="mt-1 text-sm text-red-600">{errors.dateTime}</p>}
                          </div>
                        </div>

                        <div>
                          <label htmlFor="recurrence" className="block text-sm font-medium leading-6 text-gray-900">
                            Recurrence
                          </label>
                          <div className="mt-2">
                            <select
                              id="recurrence"
                              name="recurrence"
                              value={formData.recurrence}
                              onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            >
                              <option value="NONE">None</option>
                              <option value="DAILY">Daily</option>
                              <option value="WEEKLY">Weekly</option>
                              <option value="MONTHLY">Monthly</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="notes" className="block text-sm font-medium leading-6 text-gray-900">
                            Notes
                          </label>
                          <div className="mt-2">
                            <textarea
                              id="notes"
                              name="notes"
                              rows={3}
                              value={formData.notes}
                              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                          </div>
                        </div>

                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 sm:ml-3 sm:w-auto"
                          >
                            {isSubmitting ? 'Creating...' : 'Create Event'}
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