import { describe, it, expect, beforeEach, vi } from 'vitest'

const STORAGE_KEY = 'sidebar-collapsed'

beforeEach(() => {
  localStorage.clear()
})

describe('ui store', () => {
  it('initializes with defaults when localStorage is empty', async () => {
    const { uiStore } = await import('./ui.store')
    expect(uiStore.state.sidebarOpen).toBe(false)
    expect(uiStore.state.sidebarCollapsed).toBe(false)
  })

  it('reads collapsed state from localStorage', async () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    // @ts-expect-error — query param forces fresh module import
    const { uiStore } = await import('./ui.store?r=1')
    expect(uiStore.state.sidebarCollapsed).toBe(true)
  })

  it('reads expanded state from localStorage', async () => {
    localStorage.setItem(STORAGE_KEY, 'false')
    // @ts-expect-error — query param forces fresh module import
    const { uiStore } = await import('./ui.store?r=2')
    expect(uiStore.state.sidebarCollapsed).toBe(false)
  })

  it('persists sidebarCollapsed to localStorage on change', async () => {
    // @ts-expect-error — query param forces fresh module import
    const { sidebarActions } = await import('./ui.store?r=3')

    sidebarActions.collapse()
    expect(localStorage.getItem(STORAGE_KEY)).toBe('true')

    sidebarActions.expand()
    expect(localStorage.getItem(STORAGE_KEY)).toBe('false')
  })

  it('sidebarActions.open sets sidebarOpen to true', async () => {
    // @ts-expect-error — query param forces fresh module import
    const { uiStore, sidebarActions } = await import('./ui.store?r=4')
    sidebarActions.open()
    expect(uiStore.state.sidebarOpen).toBe(true)
  })

  it('sidebarActions.close sets sidebarOpen to false', async () => {
    // @ts-expect-error — query param forces fresh module import
    const { uiStore, sidebarActions } = await import('./ui.store?r=5')
    uiStore.setState((s: Record<string, boolean>) => ({ ...s, sidebarOpen: true }))
    sidebarActions.close()
    expect(uiStore.state.sidebarOpen).toBe(false)
  })

  it('sidebarActions.toggle toggles sidebarOpen', async () => {
    // @ts-expect-error — query param forces fresh module import
    const { uiStore, sidebarActions } = await import('./ui.store?r=6')
    sidebarActions.toggle()
    expect(uiStore.state.sidebarOpen).toBe(true)
    sidebarActions.toggle()
    expect(uiStore.state.sidebarOpen).toBe(false)
  })

  it('sidebarActions.toggleCollapse toggles sidebarCollapsed', async () => {
    // @ts-expect-error — query param forces fresh module import
    const { uiStore, sidebarActions } = await import('./ui.store?r=7')
    sidebarActions.toggleCollapse()
    expect(uiStore.state.sidebarCollapsed).toBe(true)
    sidebarActions.toggleCollapse()
    expect(uiStore.state.sidebarCollapsed).toBe(false)
  })

  it('handles localStorage throw in getInitialCollapsed', async () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    // @ts-expect-error — query param forces fresh module import
    const { uiStore } = await import('./ui.store?r=8')
    expect(uiStore.state.sidebarCollapsed).toBe(false)
    getItem.mockRestore()
  })
})
