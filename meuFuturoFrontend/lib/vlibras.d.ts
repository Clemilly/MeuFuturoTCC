declare global {
  interface Window {
    VLibras: {
      Widget: new (config: string) => void
    }
  }
}

export {}

