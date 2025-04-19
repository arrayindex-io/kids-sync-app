"use client"

import { Fragment, useState, useEffect } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { api } from '../services/api'

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Events', href: '/events' },
  { name: 'Calendar', href: '/calendar' },
  { name: 'Settings', href: '/settings' },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userInitial, setUserInitial] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Check authentication status
  const checkAuth = async () => {
    try {
      // Skip auth check if we're on the login page
      if (pathname === '/login') {
        setIsAuthenticated(false);
        setUserInitial('');
        return;
      }

      console.log('Checking authentication status...');
      const user = await api.getCurrentUser();
      console.log('Current user:', user);
      
      if (user && user.id && user.email) {
        console.log('User is authenticated');
        const initial = user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();
        console.log('Setting initial:', initial);
        setUserInitial(initial);
        setIsAuthenticated(true);
      } else {
        console.log('No valid user data, setting unauthenticated');
        setIsAuthenticated(false);
        setUserInitial('');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
      setUserInitial('');
    }
  }

  // Check auth on initial load and pathname changes
  useEffect(() => {
    console.log('Auth check triggered by pathname change');
    checkAuth();
  }, [pathname]);

  // Set up an interval to periodically check authentication status
  // Only check if we're not on the login page
  useEffect(() => {
    if (pathname !== '/login') {
      console.log('Setting up auth check interval');
      const intervalId = setInterval(checkAuth, 30000); // Check every 30 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await api.logout()
      setIsAuthenticated(false)
      setUserInitial('')
      router.push('/login')
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
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-white">Kids Sync</Link>
            </div>
            {isAuthenticated && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                      pathname === item.href
                        ? 'border-white text-white'
                        : 'border-transparent text-white hover:border-white hover:text-white'
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
                className="rounded-full bg-blue-600 p-1 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500"
              >
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </button>

              {/* Profile dropdown */}
              <div className="relative ml-3" id="user-dropdown">
                <div>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex rounded-full bg-blue-600 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
                      <span className="text-blue-600 font-medium">{userInitial || 'U'}</span>
                    </div>
                  </button>
                </div>
                {isDropdownOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <a
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
                className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
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
        <div className="sm:hidden">
          <div className="space-y-1 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
                  pathname === item.href
                    ? 'border-white bg-blue-600 text-white'
                    : 'border-transparent text-white hover:border-white hover:bg-blue-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="border-t border-blue-400 pb-3 pt-4">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
                  <span className="text-blue-600 font-medium">{userInitial || 'U'}</span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white">User</div>
              </div>
              <button
                type="button"
                className="ml-auto flex-shrink-0 rounded-full bg-blue-600 p-1 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500"
              >
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </button>
            </div>
            <div className="mt-3 space-y-1">
              <a
                href="/settings"
                className="block px-4 py-2 text-base font-medium text-white hover:bg-blue-600"
              >
                Your Profile
              </a>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-white hover:bg-blue-600"
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