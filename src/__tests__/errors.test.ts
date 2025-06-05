import { describe, it, expect } from 'vitest'
import { CreateSkipServiceError } from '../errors.js'

describe('CreateSkipServiceError', () => {
  describe('Constructor', () => {
    it('should create error with message and execution context', () => {
      const message = 'Test error message'
      const executionContext = '/path/to/project'
      
      const error = new CreateSkipServiceError(message, executionContext)
      
      expect(error.message).toBe(message)
      expect(error.executionContext).toBe(executionContext)
    })

    it('should handle empty message', () => {
      const message = ''
      const executionContext = '/path/to/project'
      
      const error = new CreateSkipServiceError(message, executionContext)
      
      expect(error.message).toBe('')
      expect(error.executionContext).toBe(executionContext)
    })

    it('should handle empty execution context', () => {
      const message = 'Test error'
      const executionContext = ''
      
      const error = new CreateSkipServiceError(message, executionContext)
      
      expect(error.message).toBe(message)
      expect(error.executionContext).toBe('')
    })

    it('should handle special characters in message', () => {
      const message = 'Error with special chars: éñ中文🚀'
      const executionContext = '/path/to/project'
      
      const error = new CreateSkipServiceError(message, executionContext)
      
      expect(error.message).toBe(message)
      expect(error.executionContext).toBe(executionContext)
    })

    it('should handle paths with spaces and special characters', () => {
      const message = 'Test error'
      const executionContext = '/path/with spaces/special-chars_123/project'
      
      const error = new CreateSkipServiceError(message, executionContext)
      
      expect(error.message).toBe(message)
      expect(error.executionContext).toBe(executionContext)
    })
  })

  describe('Error inheritance', () => {
    it('should be instance of Error', () => {
      const error = new CreateSkipServiceError('test', '/path')
      
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(CreateSkipServiceError)
    })

    it('should have correct name property', () => {
      const error = new CreateSkipServiceError('test', '/path')
      
      expect(error.name).toBe('Error')
    })

    it('should be throwable and catchable', () => {
      const message = 'Test error'
      const executionContext = '/path/to/project'
      
      expect(() => {
        throw new CreateSkipServiceError(message, executionContext)
      }).toThrow(CreateSkipServiceError)
      
      expect(() => {
        throw new CreateSkipServiceError(message, executionContext)
      }).toThrow(message)
    })

    it('should maintain stack trace', () => {
      const error = new CreateSkipServiceError('test', '/path')
      
      expect(error.stack).toBeDefined()
      expect(typeof error.stack).toBe('string')
      expect(error.stack).toContain('test')
    })
  })

  describe('Execution context preservation', () => {
    it('should preserve execution context for cleanup operations', () => {
      const contexts = [
        '/Users/test/my-project',
        '/tmp/skip-service-123',
        'C:\\Users\\test\\my-project',
        '/home/user/projects/new-service'
      ]
      
      contexts.forEach(context => {
        const error = new CreateSkipServiceError('Failed to create project', context)
        expect(error.executionContext).toBe(context)
      })
    })

    it('should allow execution context modification', () => {
      const error = new CreateSkipServiceError('test', '/original/path')
      
      error.executionContext = '/modified/path'
      
      expect(error.executionContext).toBe('/modified/path')
    })

    it('should handle absolute and relative paths', () => {
      const absolutePath = '/absolute/path/to/project'
      const relativePath = './relative/path'
      
      const error1 = new CreateSkipServiceError('test', absolutePath)
      const error2 = new CreateSkipServiceError('test', relativePath)
      
      expect(error1.executionContext).toBe(absolutePath)
      expect(error2.executionContext).toBe(relativePath)
    })
  })
})