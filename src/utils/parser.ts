import { UAParser } from 'ua-parser-js'

interface ParsedUA {
  device: string
  browser: string
  os: string
}

export function parseUserAgent(userAgent: string): ParsedUA {
  const parser = new UAParser(userAgent)
  const browser = parser.getBrowser().name || 'Unknown'
  const os = parser.getOS().name || 'Unknown'
  const deviceType = parser.getDevice().type
  const device = deviceType ? deviceType.charAt(0).toUpperCase() + deviceType.slice(1) : 'Desktop'
  return { device, browser, os }
}
