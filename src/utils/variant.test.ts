import { describe, it, expect } from 'vitest'
import { tv, clx } from './variant'

describe('variant', () => {
  it('tv creates a variant function', () => {
    const button = tv({
      base: 'btn',
      variants: {
        size: { sm: 'btn-sm', lg: 'btn-lg' }
      }
    })
    expect(button()).toBe('btn')
    expect(button({ size: 'sm' })).toBe('btn btn-sm')
    expect(button({ size: 'lg' })).toBe('btn btn-lg')
  })

  it('clx handles falsy values', () => {
    expect(clx('a', 'b')).toBe('a b')
    expect(clx('a', undefined)).toBe('a')
  })
})
