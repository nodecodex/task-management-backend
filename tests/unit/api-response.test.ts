import { ApiResponse } from '../../src/utils/api-response.js';
import { HTTP_STATUS } from '../../src/constants/index.js';
import { Response } from 'express';

describe('ApiResponse Utility', () => {
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    sendMock = jest.fn();
    statusMock = jest.fn().mockImplementation(() => ({
      json: jsonMock,
      send: sendMock,
    }));

    mockRes = {
      status: statusMock,
    } as unknown as Response;
  });

  it('should format success response correctly', () => {
    ApiResponse.success(mockRes as Response, 'Task fetched', { id: '123' }, HTTP_STATUS.OK);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: 'Task fetched',
      data: { id: '123' },
    });
  });

  it('should format paginated response correctly', () => {
    const meta = {
      page: 1,
      limit: 10,
      total: 10,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    };

    ApiResponse.paginated(mockRes as Response, 'List fetched', [{ id: '1' }], meta);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: 'List fetched',
      data: [{ id: '1' }],
      meta,
    });
  });

  it('should format error response correctly with error codes', () => {
    ApiResponse.error(
      mockRes as Response,
      'Resource not found',
      'NOT_FOUND',
      HTTP_STATUS.NOT_FOUND,
      ['item id 999']
    );

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: 'Resource not found',
      error: {
        code: 'NOT_FOUND',
        details: ['item id 999'],
      },
    });
  });
});
