import { GET } from '@/app/api/users/via-username/route';
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

describe('GET /api/users/via-username', () => {
  beforeEach(() => {
    // Reset mocks before each test
    getDocumentByFieldValue.mockClear();
    NextResponse.json.mockClear();
  });

  it('successfully fetches a user document by username', async () => {
    // Arrange
    const username = 'testUser';
    const fakeUserDoc = { username: username, email: 'test@example.com' };
    const request = {
      url: `http://example.com/api/users/via-username?username=${username}`,
    };
    getDocumentByFieldValue.mockResolvedValue(fakeUserDoc); // Simulate successful fetch

    // Act
    const response = await GET(request);

    // Assert
    expect(getDocumentByFieldValue).toHaveBeenCalledWith('users', 'username', username);
    expect(NextResponse.json).toHaveBeenCalledWith(fakeUserDoc, { status: 200 });
  });

  it('returns a 404 status code when the user is not found', async () => {
    // Arrange
    const username = 'nonexistentUser';
    const request = {
      url: `http://example.com/api/users/via-username?username=${username}`,
    };
    getDocumentByFieldValue.mockResolvedValue(null); // Simulate user not found

    // Act
    const response = await GET(request);

    // Assert
    expect(getDocumentByFieldValue).toHaveBeenCalledWith('users', 'username', username);
    expect(NextResponse.json).toHaveBeenCalledWith({ message: 'User not found' }, { status: 404 });
  });

  it('handles errors during the fetching process', async () => {
    // Arrange
    const username = 'testUser';
    const request = {
      url: `http://example.com/api/users/via-username?username=${username}`,
    };
    const errorMessage = 'Database error';
    getDocumentByFieldValue.mockRejectedValue(new Error(errorMessage)); // Simulate an error

    // Act
    const response = await GET(request);

    // Assert
    expect(getDocumentByFieldValue).toHaveBeenCalledWith('users', 'username', username);
    expect(NextResponse.json).toHaveBeenCalledWith({ error: errorMessage }, { status: 500 });
  });
});
