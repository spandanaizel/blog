import { ApiError } from '../../utils/ApiError';

describe('ApiError', () => {
  it('sets the correct status code and message for each factory method', () => {
    expect(ApiError.badRequest('bad').statusCode).toBe(400);
    expect(ApiError.unauthorized().statusCode).toBe(401);
    expect(ApiError.forbidden().statusCode).toBe(403);
    expect(ApiError.notFound().statusCode).toBe(404);
    expect(ApiError.conflict().statusCode).toBe(409);
    expect(ApiError.internal().statusCode).toBe(500);
  });

  it('uses sensible default messages when none are provided', () => {
    expect(ApiError.notFound().message).toBe('Resource not found');
    expect(ApiError.unauthorized().message).toBe('Unauthorized');
  });

  it('is an instance of Error and preserves a custom message', () => {
    const err = ApiError.badRequest('Custom message');
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('Custom message');
    expect(err.isOperational).toBe(true);
  });

  it('attaches optional details for validation-style errors', () => {
    const details = { fieldErrors: { email: ['Invalid email'] } };
    const err = ApiError.badRequest('Validation failed', details);
    expect(err.details).toEqual(details);
  });
});
