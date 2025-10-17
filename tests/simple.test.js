// Simple test to verify the testing environment is working
describe('Simple Test', () => {
  test('should pass', () => {
    expect(1 + 1).toBe(2);
  });

  test('should handle async code', async () => {
    const result = await Promise.resolve('test');
    expect(result).toBe('test');
  });
});
