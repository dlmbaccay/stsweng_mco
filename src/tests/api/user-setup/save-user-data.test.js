import { POST } from '@/app/api/user-setup/save-user-data/route';
import { NextResponse } from 'next/server';
import { createUserDocument, isUsernameTaken } from '@/lib/firestore-crud';

// Mocking necessary modules
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({ data, options })),
  },
}));
jest.mock('@/lib/firestore-crud', () => ({
  isUsernameTaken: jest.fn(),
  createUserDocument: jest.fn(),
}));

describe('POST user-setup/save-user-data', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    jest.clearAllMocks();
  });

  it('checks if username is taken', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ action: 'isUsernameTaken', username: 'testUser' }),
    };
    isUsernameTaken.mockResolvedValue(true);

    const response = await POST(mockRequest);
    expect(isUsernameTaken).toHaveBeenCalledWith('testUser');
    expect(NextResponse.json).toHaveBeenCalledWith({ usernameTaken: true }, { status: 200 });
    expect(response.data).toEqual({ usernameTaken: true });
    expect(response.options).toEqual({ status: 200 });
  });

  it('saves user data successfully', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        action: 'saveUserData',
        user: { uid: '123', email: 'test@example.com' },
        username: 'testUser',
        // Additional fields as necessary
      }),
    };
    createUserDocument.mockResolvedValue(undefined); // Assuming it returns nothing on success

    const response = await POST(mockRequest);
    expect(createUserDocument).toHaveBeenCalledWith('users', '123', expect.any(Object));
    expect(NextResponse.json).toHaveBeenCalledWith({ success: true }, { status: 200 });
  });

  it('handles invalid action', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ action: 'invalidAction' }),
    };

    const response = await POST(mockRequest);
    expect(NextResponse.json).toHaveBeenCalledWith({ message: 'Invalid action' }, { status: 400 });
  });

  it('handles errors gracefully', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ action: 'isUsernameTaken', username: 'testUser' }),
    };
    isUsernameTaken.mockRejectedValue(new Error('Test Error'));

    const response = await POST(mockRequest);
    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Test Error' }, { status: 500 });
  });
});
