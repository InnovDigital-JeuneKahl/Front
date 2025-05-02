"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from '../api/auth'

export function useAuthCheck() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = getToken()
    setIsAuthenticated(!!token)
    
    if (!token) {
      router.push('/login')
    }
  }, [router])

  return isAuthenticated
}

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const isAuthenticated = useAuthCheck()
    
    if (isAuthenticated === null) {
      // Still checking authentication
      return <div>Loading...</div>
    }
    
    if (isAuthenticated === false) {
      // Not authenticated, redirect handled in useAuthCheck
      return null
    }
    
    // Authenticated, render the component
    return <Component {...props} />
  }
}