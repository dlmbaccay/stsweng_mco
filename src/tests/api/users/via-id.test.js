import { GET } from '@/app/api/users/via-id/route';
import { NextResponse } from 'next/server';
import { getDocumentByFieldValue } from '@/lib/firestore-crud';

// Mock the modules
jest.mock('@/lib/firestore-crud', () => ({
  getDocumentByFieldValue: jest.fn(),
}));
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}));

describe('GET /api/users/via-id', () => {
  beforeEach(() => {
    // Reset mocks before each test
    getDocumentByFieldValue.mockClear();
    NextResponse.json.mockClear();
  });

  it('successfully fetches a user document by ID', async () => {
    // Arrange
    const userId = 'testUserId';
    const fakeUserDoc = { uid: userId, username: 'testUser' };
    const request = {
      url: `http://example.com/api/users/via-id?id=${userId}`,
    };
    getDocumentByFieldValue.mockResolvedValue(fakeUserDoc); // Simulate successful fetch

    // Act
    const response = await GET(request);

    // Assert
    expect(getDocumentByFieldValue).toHaveBeenCalledWith('users', 'uid', userId);
    expect(NextResponse.json).toHaveBeenCalledWith(fakeUserDoc, { status: 200 });
  });

  it('returns a 404 status code when the user is not found', async () => {
    // Arrange
    const userId = 'nonexistentUserId';
    const request = {
      url: `http://example.com/api/users/via-id?id=${userId}`,
    };
    getDocumentByFieldValue.mockResolvedValue(null); // Simulate user not found

    // Act
    const response = await GET(request);

    // Assert
    expect(getDocumentByFieldValue).toHaveBeenCalledWith('users', 'uid', userId);
    expect(NextResponse.json).toHaveBeenCalledWith({ message: 'User not found' }, { status: 404 });
  });

  it('handles errors during the fetching process', async () => {
    // Arrange
    const userId = 'testUserId';
    const request = {
      url: `http://example.com/api/users/via-id?id=${userId}`,
    };
    const errorMessage = 'Database error';
    getDocumentByFieldValue.mockRejectedValue(new Error(errorMessage)); // Simulate an error

    // Act
    const response = await GET(request);

    // Assert
    expect(getDocumentByFieldValue).toHaveBeenCalledWith('users', 'uid', userId);
    expect(NextResponse.json).toHaveBeenCalledWith({ error: errorMessage }, { status: 500 });
  });
});
