import '@testing-library/jest-dom/vitest'

// Polyfill matchMedia for @lonik/themer in jsdom
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false
    })
  })
}

// Polyfill scrollTo for TanStack Router scroll restoration in jsdom
window.scrollTo = () => {}
