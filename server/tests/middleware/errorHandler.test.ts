import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '@/middleware/errorHandler';
import { ApiError } from '@/utils/ApiError';

function createMockRes() {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  return { res: { status, json } as unknown as Response, status, json };
}

describe('errorHandler', () => {
  const req = {} as Request;
  const next = jest.fn() as NextFunction;

  it('should handle ApiError with correct status code', () => {
    const { res, status, json } = createMockRes();
    const error = ApiError.badRequest('Invalid input');

    errorHandler(error, req, res, next);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid input',
    });
  });

  it('should handle 404 ApiError', () => {
    const { res, status } = createMockRes();
    const error = ApiError.notFound('User not found');

    errorHandler(error, req, res, next);

    expect(status).toHaveBeenCalledWith(404);
  });

  it('should handle 401 ApiError', () => {
    const { res, status } = createMockRes();
    const error = ApiError.unauthorized();

    errorHandler(error, req, res, next);

    expect(status).toHaveBeenCalledWith(401);
  });

  it('should handle generic Error with 500 status', () => {
    const { res, status, json } = createMockRes();
    const error = new Error('Something broke');

    errorHandler(error, req, res, next);

    expect(status).toHaveBeenCalledWith(500);
  });
});
