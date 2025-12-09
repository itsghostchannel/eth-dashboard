import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { validateConfig } from '../src/services/config'

// Mock environment variables
const originalEnv = process.env

describe('poller configuration', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('validateConfig', () => {
    it('should pass with valid configuration', () => {
      process.env.ETH_RPC_URL = 'https://mainnet.infura.io/v3/test-project-id'
      process.env.POLL_INTERVAL = '30000'
      process.env.MAX_BLOCKS = '5'

      expect(() => validateConfig()).not.toThrow()
    })

    it('should throw error when ETH_RPC_URL is missing', () => {
      delete process.env.ETH_RPC_URL

      expect(() => validateConfig()).toThrow('ETH_RPC_URL environment variable is required')
    })

    it('should throw error when POLL_INTERVAL is too small', () => {
      process.env.ETH_RPC_URL = 'https://mainnet.infura.io/v3/test-project-id'
      process.env.POLL_INTERVAL = '500'

      expect(() => validateConfig()).toThrow('POLL_INTERVAL must be at least 1000ms')
    })

    it('should throw error when MAX_BLOCKS is less than 1', () => {
      process.env.ETH_RPC_URL = 'https://mainnet.infura.io/v3/test-project-id'
      process.env.MAX_BLOCKS = '0'

      expect(() => validateConfig()).toThrow('MAX_BLOCKS must be at least 1')
    })
  })
})

describe('poller basic functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NODE_ENV = 'test'
    process.env.ETH_RPC_URL = 'https://mainnet.infura.io/v3/test-project-id'
    process.env.POLL_INTERVAL = '30000'
    process.env.MAX_BLOCKS = '5'
  })

  it('should import poller functions without errors', async () => {
    const { startPoller, stopPoller, gracefulShutdown } = await import('../src/services/poller')

    expect(typeof startPoller).toBe('function')
    expect(typeof stopPoller).toBe('function')
    expect(typeof gracefulShutdown).toBe('function')
  })

  it('should handle stopPoller when no poller is running', async () => {
    const { stopPoller } = await import('../src/services/poller')

    expect(() => stopPoller()).not.toThrow()
  })

  it('should handle gracefulShutdown', async () => {
    const { gracefulShutdown } = await import('../src/services/poller')

    await expect(gracefulShutdown()).resolves.not.toThrow()
  })
})