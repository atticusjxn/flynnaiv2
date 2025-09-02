describe('Simple Test', () => {
  it('should run basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle string operations', () => {
    const text = 'Flynn.ai Testing'
    expect(text).toContain('Testing')
    expect(text.toLowerCase()).toBe('flynn.ai testing')
  })

  it('should handle array operations', () => {
    const items = ['test', 'jest', 'setup']
    expect(items).toHaveLength(3)
    expect(items).toContain('jest')
  })
})