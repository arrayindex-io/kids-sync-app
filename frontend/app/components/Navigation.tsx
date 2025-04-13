"use client"

import { useState, useEffect } from 'react'
import { Bars3Icon, XMarkIcon, BellIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '../services/api'

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Events', href: '/events' },
  { name: 'Calendar', href: '/calendar' },
  { name: 'Settings', href: '/settings' },
]

export default function Navigation() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userInitial, setUserInitial] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {   
      const token = localStorage.getItem('token')      
      if (token) {
        setIsAuthenticated(true)
        try {
          // Try to get user info to confirm token is valid
          const user = await api.getCurrentUser()
          if (user && user.name) {
            setUserInitial(user.name.charAt(0).toUpperCase())
          } else {
            setUserInitial('U')
          }
        } catch (error) {
          console.error('Error fetching user:', error)
          // If there's an error, the token might be invalid
          setIsAuthenticated(false)
          localStorage.removeItem('token')
        }
      } else {
        // Also check for token in cookies
        const cookies = document.cookie.split(';')
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim()
          if (cookie.startsWith('token=')) {
            const token = cookie.substring(6)
            if (token) {
              setIsAuthenticated(true)
              try {
                const user = await api.getCurrentUser()
                if (user && user.name) {
                  setUserInitial(user.name.charAt(0).toUpperCase())
                } else {
                  setUserInitial('U')
                }
              } catch (error) {
                console.error('Error fetching user:', error)
                setIsAuthenticated(false)
              }
              break
            }
          }
        }
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await api.logout()
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/login')
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('user-dropdown')
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <nav className="bg-blue-500 text-white shadow-md rounded-b-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex flex-shrink-0 items-center">
              <span className="text-2xl font-bold">Kids Sync</span>
            </Link>
            {isAuthenticated && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium hover:text-gray-200 transition-colors duration-200 ${
                      router.pathname === item.href
                        ? 'text-white border-b-2 border-white'
                        : 'border-b-2 border-transparent'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}

          </div>
          {isAuthenticated && (
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <button
                type="button"
                className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span className="sr-only">Notifications</span>
                <BellIcon className="h-6 w-6 text-white" />
              </button>

              {/* Profile dropdown */}
              <div className="relative ml-3" id="user-dropdown">
                <div>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-md">
                      <span className="text-blue-500 font-medium">{userInitial || 'U'}</span>
                    </div>
                  </button>
                </div>
                {isDropdownOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">                    
                    <Link
                      href="/settings"                     
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </a>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}          
          {isAuthenticated && (
            <div className="-mr-2 flex items-center sm:hidden">
              {/* Mobile menu button */}
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 hover:bg-blue-600 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}               
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="sm:hidden bg-blue-500 text-white">
          <div className="space-y-1 pb-3 pt-2 border-b border-blue-600">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block py-2 pl-3 pr-4 text-base font-medium hover:bg-blue-600 hover:text-white transition-colors duration-200 ${
                    router.pathname === item.href
                      ? 'text-white bg-blue-600'
                      : ''
                  }`}                
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="pb-3 pt-4">
            <div className="flex items-center px-4 ">
              

              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">{userInitial || 'U'}</span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">User</div>
              </div>
              <button
                type="button"
                className="ml-auto flex-shrink-0 rounded-full p-1 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span className="sr-only">Notifications</span>
                <BellIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href="/settings"               
                className="block px-4 py-2 text-base font-medium hover:bg-blue-600 hover:text-white"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
} 