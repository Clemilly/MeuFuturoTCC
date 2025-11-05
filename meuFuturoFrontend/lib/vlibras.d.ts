import 'react'

declare global {
  interface Window {
    VLibras: {
      Widget: new (config: string) => void
    }
  }
}

declare module 'react' {
  interface HTMLAttributes<T> {
    vw?: string | boolean
    'vw-access-button'?: string | boolean
    'vw-plugin-wrapper'?: string | boolean
  }
}

export {}

