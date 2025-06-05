import { describe, it, expect, vi, beforeEach } from 'vitest'
import chalk from 'chalk'
import { logger } from '../io.js'

// Mock console methods
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('Logger', () => {
  beforeEach(() => {
    // Reset logger state and mocks
    logger.setVerbose(false)
    logger.setQuiet(false)
    mockConsoleLog.mockClear()
    mockConsoleError.mockClear()
  })

  describe('Log level behavior', () => {
    describe('Normal mode (default)', () => {
      it('should not log colored messages in normal mode', () => {
        logger.red('test message')
        logger.green('test message')
        logger.blue('test message')
        logger.yellow('test message')
        logger.gray('test message')
        
        expect(mockConsoleLog).not.toHaveBeenCalled()
      })

      it('should log titles in normal mode', () => {
        logger.logTitle('Test Title')
        
        expect(mockConsoleLog).toHaveBeenCalledWith(chalk.blue('Test Title'))
      })

      it('should log errors in normal mode', () => {
        logger.logError('Test Error')
        
        expect(mockConsoleError).toHaveBeenCalledWith(chalk.red('Test Error'), '')
      })
    })

    describe('Verbose mode', () => {
      beforeEach(() => {
        logger.setVerbose(true)
      })

      it('should log all colored messages in verbose mode', () => {
        logger.red('red message')
        logger.green('green message')
        logger.blue('blue message')
        logger.yellow('yellow message')
        logger.gray('gray message')
        
        expect(mockConsoleLog).toHaveBeenCalledTimes(5)
        expect(mockConsoleLog).toHaveBeenCalledWith(chalk.red('red message'))
        expect(mockConsoleLog).toHaveBeenCalledWith(chalk.green('green message'))
        expect(mockConsoleLog).toHaveBeenCalledWith(chalk.blue('blue message'))
        expect(mockConsoleLog).toHaveBeenCalledWith(chalk.yellow('yellow message'))
        expect(mockConsoleLog).toHaveBeenCalledWith(chalk.gray('gray message'))
      })

      it('should log titles in verbose mode', () => {
        logger.logTitle('Verbose Title')
        
        expect(mockConsoleLog).toHaveBeenCalledWith(chalk.blue('Verbose Title'))
      })

      it('should log errors in verbose mode', () => {
        logger.logError('Verbose Error')
        
        expect(mockConsoleError).toHaveBeenCalledWith(chalk.red('Verbose Error'), '')
      })
    })

    describe('Quiet mode', () => {
      beforeEach(() => {
        logger.setQuiet(true)
      })

      it('should not log colored messages in quiet mode', () => {
        logger.red('test message')
        logger.green('test message')
        logger.blue('test message')
        logger.yellow('test message')
        logger.gray('test message')
        
        expect(mockConsoleLog).not.toHaveBeenCalled()
      })

      it('should not log titles in quiet mode', () => {
        logger.logTitle('Quiet Title')
        
        expect(mockConsoleLog).not.toHaveBeenCalled()
      })

      it('should still log errors in quiet mode', () => {
        logger.logError('Quiet Error')
        
        expect(mockConsoleError).toHaveBeenCalledWith(chalk.red('Quiet Error'), '')
      })
    })
  })

  describe('Log level transitions', () => {
    it('should transition from normal to verbose correctly', () => {
      // Normal mode - no colored logs
      logger.red('normal message')
      expect(mockConsoleLog).not.toHaveBeenCalled()
      
      // Switch to verbose
      logger.setVerbose(true)
      logger.red('verbose message')
      expect(mockConsoleLog).toHaveBeenCalledWith(chalk.red('verbose message'))
    })

    it('should transition from verbose to quiet correctly', () => {
      logger.setVerbose(true)
      logger.red('verbose message')
      expect(mockConsoleLog).toHaveBeenCalledWith(chalk.red('verbose message'))
      
      // Switch to quiet
      mockConsoleLog.mockClear()
      logger.setQuiet(true)
      logger.red('quiet message')
      expect(mockConsoleLog).not.toHaveBeenCalled()
    })

    it('should handle multiple state changes', () => {
      // Normal -> Verbose
      logger.setVerbose(true)
      logger.blue('verbose blue')
      expect(mockConsoleLog).toHaveBeenCalledWith(chalk.blue('verbose blue'))
      
      // Verbose -> Normal
      mockConsoleLog.mockClear()
      logger.setVerbose(false)
      logger.blue('normal blue')
      expect(mockConsoleLog).not.toHaveBeenCalled()
      
      // Normal -> Quiet
      logger.setQuiet(true)
      logger.logTitle('quiet title')
      expect(mockConsoleLog).not.toHaveBeenCalled()
      
      // Quiet -> Normal
      logger.setQuiet(false)
      logger.logTitle('normal title')
      expect(mockConsoleLog).toHaveBeenCalledWith(chalk.blue('normal title'))
    })
  })

  describe('State management', () => {
    it('should toggle between verbose and normal', () => {
      // Start normal
      logger.red('normal message')
      expect(mockConsoleLog).not.toHaveBeenCalled()
      
      // Set verbose
      logger.setVerbose(true)
      logger.red('verbose message')
      expect(mockConsoleLog).toHaveBeenCalledWith(chalk.red('verbose message'))
      
      // Back to normal
      logger.setVerbose(false)
      mockConsoleLog.mockClear()
      logger.red('normal again')
      expect(mockConsoleLog).not.toHaveBeenCalled()
    })

    it('should toggle between quiet and normal', () => {
      // Start normal, titles should show
      logger.logTitle('normal title')
      expect(mockConsoleLog).toHaveBeenCalledWith(chalk.blue('normal title'))
      
      // Set quiet
      logger.setQuiet(true)
      mockConsoleLog.mockClear()
      logger.logTitle('quiet title')
      expect(mockConsoleLog).not.toHaveBeenCalled()
      
      // Back to normal
      logger.setQuiet(false)
      logger.logTitle('normal again')
      expect(mockConsoleLog).toHaveBeenCalledWith(chalk.blue('normal again'))
    })
  })

  describe('Color methods', () => {
    beforeEach(() => {
      logger.setVerbose(true) // Enable logging for color tests
    })

    it('should apply correct colors to messages', () => {
      const testMessage = 'color test'
      
      logger.red(testMessage)
      logger.green(testMessage)
      logger.blue(testMessage)
      logger.yellow(testMessage)
      logger.gray(testMessage)
      
      expect(mockConsoleLog).toHaveBeenCalledWith(chalk.red(testMessage))
      expect(mockConsoleLog).toHaveBeenCalledWith(chalk.green(testMessage))
      expect(mockConsoleLog).toHaveBeenCalledWith(chalk.blue(testMessage))
      expect(mockConsoleLog).toHaveBeenCalledWith(chalk.yellow(testMessage))
      expect(mockConsoleLog).toHaveBeenCalledWith(chalk.gray(testMessage))
    })

    it('should handle empty messages', () => {
      logger.red('')
      logger.green('')
      
      expect(mockConsoleLog).toHaveBeenCalledWith(chalk.red(''))
      expect(mockConsoleLog).toHaveBeenCalledWith(chalk.green(''))
    })

    it('should handle special characters and unicode', () => {
      const specialMessage = 'Special chars: éñ中文🚀'
      
      logger.blue(specialMessage)
      
      expect(mockConsoleLog).toHaveBeenCalledWith(chalk.blue(specialMessage))
    })

    it('should handle multiline messages', () => {
      const multilineMessage = 'Line 1\nLine 2\nLine 3'
      
      logger.yellow(multilineMessage)
      
      expect(mockConsoleLog).toHaveBeenCalledWith(chalk.yellow(multilineMessage))
    })
  })

  describe('Error logging', () => {
    it('should log error message only', () => {
      logger.logError('Simple error')
      
      expect(mockConsoleError).toHaveBeenCalledWith(chalk.red('Simple error'), '')
    })

    it('should log error with Error object', () => {
      const error = new Error('Test error details')
      logger.logError('Main error', error)
      
      expect(mockConsoleError).toHaveBeenCalledWith(
        chalk.red('Main error'), 
        'Test error details'
      )
    })

    it('should handle error with empty message', () => {
      const error = new Error('')
      logger.logError('Main message', error)
      
      expect(mockConsoleError).toHaveBeenCalledWith(chalk.red('Main message'), '')
    })

    it('should always log errors regardless of log level', () => {
      // Test in quiet mode
      logger.setQuiet(true)
      logger.logError('Quiet mode error')
      expect(mockConsoleError).toHaveBeenCalledWith(chalk.red('Quiet mode error'), '')
      
      // Test in normal mode
      mockConsoleError.mockClear()
      logger.setVerbose(false)
      logger.logError('Normal mode error')
      expect(mockConsoleError).toHaveBeenCalledWith(chalk.red('Normal mode error'), '')
      
      // Test in verbose mode
      mockConsoleError.mockClear()
      logger.setVerbose(true)
      logger.logError('Verbose mode error')
      expect(mockConsoleError).toHaveBeenCalledWith(chalk.red('Verbose mode error'), '')
    })
  })

  describe('Title logging', () => {
    it('should log titles with blue color', () => {
      logger.logTitle('Blue Title')
      
      expect(mockConsoleLog).toHaveBeenCalledWith(chalk.blue('Blue Title'))
    })

    it('should respect quiet mode for titles', () => {
      logger.setQuiet(true)
      logger.logTitle('Quiet Title')
      
      expect(mockConsoleLog).not.toHaveBeenCalled()
    })

    it('should log titles in verbose mode', () => {
      logger.setVerbose(true)
      logger.logTitle('Verbose Title')
      
      expect(mockConsoleLog).toHaveBeenCalledWith(chalk.blue('Verbose Title'))
    })
  })
})