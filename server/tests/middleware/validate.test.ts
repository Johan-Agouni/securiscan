import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '@/middleware/validate';

function createMockReqRes(body = {}, params = {}, query = {}) {
  const req = { body, params, query } as unknown as Request;
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const res = { status, json } as unknown as Response;
  const next = jest.fn() as NextFunction;
  return { req, res, status, json, next };
}

describe('validate middleware', () => {
  it('should pass valid body through', () => {
    const schema = { body: z.object({ name: z.string() }) };
    const { req, res, next } = createMockReqRes({ name: 'test' });

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ name: 'test' });
  });

  it('should return 400 for invalid body', () => {
    const schema = { body: z.object({ name: z.string() }) };
    const { req, res, next, status, json } = createMockReqRes({ name: 123 });

    validate(schema)(req, res, next);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Validation error',
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should validate query parameters', () => {
    const schema = { query: z.object({ page: z.coerce.number().positive() }) };
    const { req, res, next } = createMockReqRes({}, {}, { page: '2' });

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should validate params', () => {
    const schema = { params: z.object({ id: z.string().uuid() }) };
    const { req, res, next, status } = createMockReqRes(
      {},
      { id: 'not-a-uuid' }
    );

    validate(schema)(req, res, next);

    expect(status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('should strip unknown fields from body', () => {
    const schema = { body: z.object({ name: z.string() }) };
    const { req, res, next } = createMockReqRes({ name: 'test', extra: 'bad' });

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ name: 'test' });
  });
});
