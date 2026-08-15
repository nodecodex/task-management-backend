process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_jwt_key_super_secure_2026_test';
process.env.LOG_LEVEL = 'fatal'; // Suppress logging during tests

beforeAll(async () => {
  // Global test setup
});

afterAll(async () => {
  // Global test teardown
});
