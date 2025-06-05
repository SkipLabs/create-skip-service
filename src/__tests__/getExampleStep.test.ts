import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getExampleStep } from '../getExampleStep.js'
import { Config, GitRepo } from '../types.js'

// Mock dependencies
vi.mock('../io.js', () => ({
  logger: {
    logTitle: vi.fn(),
    green: vi.fn(),
    yellow: vi.fn(),
  }
}))

vi.mock('../downloadUtils.js', () => ({
  downloadRepo: vi.fn()
}))

describe('getExampleStep', () => {
  const mockExample: GitRepo = {
    repo: 'SkipLabs/skip',
    path: 'examples',
    name: 'blogger'
  }

  const mockConfig: Config = {
    projectName: 'test-project',
    executionContext: '/test/project',
    withGit: true,
    verbose: false,
    quiet: false,
    force: false,
    template: null,
    example: mockExample
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Example handling', () => {
    it('should skip when example is null', async () => {
      const configWithoutExample = { ...mockConfig, example: null }
      const { logger } = await import('../io.js')
      const { downloadRepo } = await import('../downloadUtils.js')

      await getExampleStep(configWithoutExample)

      expect(logger.logTitle).not.toHaveBeenCalled()
      expect(downloadRepo).not.toHaveBeenCalled()
    })

    it('should skip when example is undefined', async () => {
      const configWithoutExample = { ...mockConfig, example: undefined as any }
      const { logger } = await import('../io.js')
      const { downloadRepo } = await import('../downloadUtils.js')

      await getExampleStep(configWithoutExample)

      expect(logger.logTitle).not.toHaveBeenCalled()
      expect(downloadRepo).not.toHaveBeenCalled()
    })
  })

  describe('Successful example download', () => {
    it('should download example successfully', async () => {
      const { logger } = await import('../io.js')
      const { downloadRepo } = await import('../downloadUtils.js')
      
      vi.mocked(downloadRepo).mockResolvedValueOnce(undefined)

      await getExampleStep(mockConfig)

      expect(logger.logTitle).toHaveBeenCalledWith(
        " - Getting example 'blogger' from SkipLabs/skip"
      )
      expect(downloadRepo).toHaveBeenCalledWith(
        mockExample,
        '/test/project',
        false
      )
      expect(logger.green).toHaveBeenCalledWith(
        '\t✓ Example blogger downloaded successfully'
      )
    })

    it('should pass verbose flag to downloadRepo', async () => {
      const verboseConfig = { ...mockConfig, verbose: true }
      const { downloadRepo } = await import('../downloadUtils.js')
      
      vi.mocked(downloadRepo).mockResolvedValueOnce(undefined)

      await getExampleStep(verboseConfig)

      expect(downloadRepo).toHaveBeenCalledWith(
        mockExample,
        '/test/project',
        true
      )
    })

    it('should handle different example names', async () => {
      const customExample = { ...mockExample, name: 'todo-app' }
      const configWithCustomExample = { ...mockConfig, example: customExample }
      const { logger } = await import('../io.js')
      const { downloadRepo } = await import('../downloadUtils.js')
      
      vi.mocked(downloadRepo).mockResolvedValueOnce(undefined)

      await getExampleStep(configWithCustomExample)

      expect(logger.logTitle).toHaveBeenCalledWith(
        " - Getting example 'todo-app' from SkipLabs/skip"
      )
      expect(downloadRepo).toHaveBeenCalledWith(
        customExample,
        '/test/project',
        false
      )
      expect(logger.green).toHaveBeenCalledWith(
        '\t✓ Example todo-app downloaded successfully'
      )
    })

    it('should handle different repositories', async () => {
      const customExample = { ...mockExample, repo: 'CustomOrg/custom-examples' }
      const configWithCustomRepo = { ...mockConfig, example: customExample }
      const { logger } = await import('../io.js')
      const { downloadRepo } = await import('../downloadUtils.js')
      
      vi.mocked(downloadRepo).mockResolvedValueOnce(undefined)

      await getExampleStep(configWithCustomRepo)

      expect(logger.logTitle).toHaveBeenCalledWith(
        " - Getting example 'blogger' from CustomOrg/custom-examples"
      )
      expect(downloadRepo).toHaveBeenCalledWith(
        customExample,
        '/test/project',
        false
      )
    })

    it('should handle different example paths', async () => {
      const customExample = { ...mockExample, path: 'sample-projects' }
      const configWithCustomPath = { ...mockConfig, example: customExample }
      const { downloadRepo } = await import('../downloadUtils.js')
      
      vi.mocked(downloadRepo).mockResolvedValueOnce(undefined)

      await getExampleStep(configWithCustomPath)

      expect(downloadRepo).toHaveBeenCalledWith(
        customExample,
        '/test/project',
        false
      )
    })
  })

  describe('Error handling', () => {
    it('should handle download errors for default example', async () => {
      const defaultExample = { ...mockExample, name: 'default' }
      const configWithDefaultExample = { ...mockConfig, example: defaultExample }
      const downloadError = new Error('Download failed')
      const { logger } = await import('../io.js')
      const { downloadRepo } = await import('../downloadUtils.js')
      
      vi.mocked(downloadRepo).mockRejectedValueOnce(downloadError)

      await expect(getExampleStep(configWithDefaultExample)).rejects.toThrow('Download failed')

      expect(logger.logTitle).toHaveBeenCalled()
      expect(downloadRepo).toHaveBeenCalled()
      expect(logger.green).not.toHaveBeenCalled()
      expect(logger.yellow).not.toHaveBeenCalled()
    })

    it('should show warning for non-default example errors', async () => {
      const downloadError = new Error('Example not found')
      const { logger } = await import('../io.js')
      const { downloadRepo } = await import('../downloadUtils.js')
      
      vi.mocked(downloadRepo).mockRejectedValueOnce(downloadError)

      await expect(getExampleStep(mockConfig)).rejects.toThrow('Example not found')

      expect(logger.yellow).toHaveBeenCalledWith(
        "Example blogger not found in SkipLabs/skip repo..."
      )
    })

    it('should not show warning for default example errors', async () => {
      const defaultExample = { ...mockExample, name: 'default' }
      const configWithDefaultExample = { ...mockConfig, example: defaultExample }
      const downloadError = new Error('Network error')
      const { logger } = await import('../io.js')
      const { downloadRepo } = await import('../downloadUtils.js')
      
      vi.mocked(downloadRepo).mockRejectedValueOnce(downloadError)

      await expect(getExampleStep(configWithDefaultExample)).rejects.toThrow('Network error')

      expect(logger.yellow).not.toHaveBeenCalled()
    })

    it('should handle different error types', async () => {
      const customError = new TypeError('Invalid response')
      const { downloadRepo } = await import('../downloadUtils.js')
      
      vi.mocked(downloadRepo).mockRejectedValueOnce(customError)

      await expect(getExampleStep(mockConfig)).rejects.toThrow('Invalid response')
      expect(downloadRepo).toHaveBeenCalled()
    })

    it('should handle CreateSkipServiceError instances', async () => {
      const { CreateSkipServiceError } = await import('../errors.js')
      const customError = new CreateSkipServiceError('Repository not found', '/test/path')
      const { downloadRepo } = await import('../downloadUtils.js')
      
      vi.mocked(downloadRepo).mockRejectedValueOnce(customError)

      await expect(getExampleStep(mockConfig)).rejects.toThrow('Repository not found')
      expect(downloadRepo).toHaveBeenCalled()
    })
  })

  describe('Configuration edge cases', () => {
    it('should handle execution context with special characters', async () => {
      const configWithSpecialPath = { 
        ...mockConfig, 
        executionContext: '/test/project with spaces/特殊字符/emoji🚀' 
      }
      const { downloadRepo } = await import('../downloadUtils.js')
      
      vi.mocked(downloadRepo).mockResolvedValueOnce(undefined)

      await getExampleStep(configWithSpecialPath)

      expect(downloadRepo).toHaveBeenCalledWith(
        mockExample,
        '/test/project with spaces/特殊字符/emoji🚀',
        false
      )
    })

    it('should handle example with special characters in name', async () => {
      const specialExample = { ...mockExample, name: 'example-with_special.chars-123' }
      const configWithSpecialExample = { ...mockConfig, example: specialExample }
      const { logger } = await import('../io.js')
      const { downloadRepo } = await import('../downloadUtils.js')
      
      vi.mocked(downloadRepo).mockResolvedValueOnce(undefined)

      await getExampleStep(configWithSpecialExample)

      expect(logger.logTitle).toHaveBeenCalledWith(
        " - Getting example 'example-with_special.chars-123' from SkipLabs/skip"
      )
      expect(logger.green).toHaveBeenCalledWith(
        '\t✓ Example example-with_special.chars-123 downloaded successfully'
      )
    })

    it('should handle empty string example name', async () => {
      const emptyExample = { ...mockExample, name: '' }
      const configWithEmptyExample = { ...mockConfig, example: emptyExample }
      const { logger } = await import('../io.js')
      const { downloadRepo } = await import('../downloadUtils.js')
      
      vi.mocked(downloadRepo).mockResolvedValueOnce(undefined)

      await getExampleStep(configWithEmptyExample)

      expect(logger.logTitle).toHaveBeenCalledWith(
        " - Getting example '' from SkipLabs/skip"
      )
      expect(downloadRepo).toHaveBeenCalledWith(
        emptyExample,
        '/test/project',
        false
      )
    })

    it('should handle long example names', async () => {
      const longExample = { ...mockExample, name: 'very-long-example-name-with-many-hyphens-and-descriptive-text' }
      const configWithLongExample = { ...mockConfig, example: longExample }
      const { logger } = await import('../io.js')
      const { downloadRepo } = await import('../downloadUtils.js')
      
      vi.mocked(downloadRepo).mockResolvedValueOnce(undefined)

      await getExampleStep(configWithLongExample)

      expect(logger.green).toHaveBeenCalledWith(
        '\t✓ Example very-long-example-name-with-many-hyphens-and-descriptive-text downloaded successfully'
      )
    })
  })

  describe('Logging verification', () => {
    it('should call logger methods in correct order', async () => {
      const { logger } = await import('../io.js')
      const { downloadRepo } = await import('../downloadUtils.js')
      
      vi.mocked(downloadRepo).mockResolvedValueOnce(undefined)

      await getExampleStep(mockConfig)

      // Verify all expected calls were made
      expect(logger.logTitle).toHaveBeenCalledTimes(1)
      expect(downloadRepo).toHaveBeenCalledTimes(1)
      expect(logger.green).toHaveBeenCalledTimes(1)
    })

    it('should log correct messages for successful download', async () => {
      const { logger } = await import('../io.js')
      const { downloadRepo } = await import('../downloadUtils.js')
      
      vi.mocked(downloadRepo).mockResolvedValueOnce(undefined)

      await getExampleStep(mockConfig)

      expect(logger.logTitle).toHaveBeenCalledWith(
        " - Getting example 'blogger' from SkipLabs/skip"
      )
      expect(logger.green).toHaveBeenCalledWith(
        '\t✓ Example blogger downloaded successfully'
      )
    })

    it('should not log success message on error', async () => {
      const { logger } = await import('../io.js')
      const { downloadRepo } = await import('../downloadUtils.js')
      
      vi.mocked(downloadRepo).mockRejectedValueOnce(new Error('Download failed'))

      await expect(getExampleStep(mockConfig)).rejects.toThrow()

      expect(logger.logTitle).toHaveBeenCalled()
      expect(logger.green).not.toHaveBeenCalled()
    })

    it('should log warning with correct example name and repository', async () => {
      const customExample = { 
        repo: 'CustomOrg/examples', 
        path: 'samples', 
        name: 'custom-example' 
      }
      const configWithCustomExample = { ...mockConfig, example: customExample }
      const downloadError = new Error('Example not found')
      const { logger } = await import('../io.js')
      const { downloadRepo } = await import('../downloadUtils.js')
      
      vi.mocked(downloadRepo).mockRejectedValueOnce(downloadError)

      await expect(getExampleStep(configWithCustomExample)).rejects.toThrow()

      expect(logger.yellow).toHaveBeenCalledWith(
        "Example custom-example not found in CustomOrg/examples repo..."
      )
    })
  })
})