import '@testing-library/jest-dom'

// Mock IndexedDB for tests (Dexie uses it)
import 'fake-indexeddb/auto'

// Mock localStorage so Zustand persist middleware works in jsdom
// (jsdom exposes localStorage but some environments don't wire setItem correctly)
const localStorageData: Record<string, string> = {}
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => localStorageData[key] ?? null,
    setItem: (key: string, value: string) => { localStorageData[key] = value },
    removeItem: (key: string) => { delete localStorageData[key] },
    clear: () => { Object.keys(localStorageData).forEach((k) => delete localStorageData[k]) },
    get length() { return Object.keys(localStorageData).length },
    key: (index: number) => Object.keys(localStorageData)[index] ?? null,
  },
  writable: true,
})
