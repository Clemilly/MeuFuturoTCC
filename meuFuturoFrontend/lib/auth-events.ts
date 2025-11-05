/**
 * Global authentication event system
 * Allows API service and other components to trigger auth errors and redirects
 */

type AuthErrorHandler = () => void

let authErrorHandlers: AuthErrorHandler[] = []

export const authEvents = {
  /**
   * Register a handler for auth errors
   */
  onAuthError: (handler: AuthErrorHandler) => {
    authErrorHandlers.push(handler)
    // Return unsubscribe function
    return () => {
      authErrorHandlers = authErrorHandlers.filter(h => h !== handler)
    }
  },

  /**
   * Trigger auth error - calls all registered handlers
   */
  triggerAuthError: () => {
    authErrorHandlers.forEach(handler => {
      try {
        handler()
      } catch (error) {
        console.error('Error in auth error handler:', error)
      }
    })
  },

  /**
   * Clear all handlers
   */
  clear: () => {
    authErrorHandlers = []
  }
}

