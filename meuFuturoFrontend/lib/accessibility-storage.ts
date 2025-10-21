export interface AccessibilitySettings {
  fontSize: number
  contrast: "normal" | "high" | "dark"
  screenReader: boolean
  reducedMotion: boolean
  keyboardNavigation: boolean
  focusIndicator: boolean
  soundFeedback: boolean
}

const COOKIE_NAME = 'accessibility-settings'
const STORAGE_KEY = 'accessibility-settings'

export const saveAccessibilitySettings = (settings: AccessibilitySettings): void => {
  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  
  // Save to session cookie
  const maxAge = 60 * 60 * 24 * 365 // 1 year
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(settings))}; path=/; max-age=${maxAge}; SameSite=Strict`
}

export const loadAccessibilitySettings = (): AccessibilitySettings | null => {
  // Try cookie first
  const cookies = document.cookie.split(';')
  const accessibilityCookie = cookies.find(c => c.trim().startsWith(`${COOKIE_NAME}=`))
  
  if (accessibilityCookie) {
    try {
      const value = accessibilityCookie.split('=')[1]
      return JSON.parse(decodeURIComponent(value))
    } catch (e) {
      console.error('Failed to parse accessibility cookie', e)
    }
  }
  
  // Fallback to localStorage
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error('Failed to parse accessibility settings', e)
    }
  }
  
  return null
}

export const clearAccessibilitySettings = (): void => {
  localStorage.removeItem(STORAGE_KEY)
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`
}
