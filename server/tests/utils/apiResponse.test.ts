import { apiResponse, apiError } from '@/utils/apiResponse';

describe('apiResponse', () => {
  it('should format a success response with default status 200', () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const res = { status } as unknown as import('express').Response;

    apiResponse({ res, data: { id: '1' }, message: 'OK' });

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'OK',
        data: { id: '1' },
      })
    );
  });

  it('should use custom status code', () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const res = { status } as unknown as import('express').Response;

    apiResponse({ res, data: null, message: 'Created', statusCode: 201 });

    expect(status).toHaveBeenCalledWith(201);
  });
});

describe('apiError', () => {
  it('should format an error response', () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const res = { status } as unknown as import('express').Response;

    apiError(res, 400, 'Bad request');

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Bad request',
      })
    );
  });
});
