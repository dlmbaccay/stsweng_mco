import { NextResponse } from 'next/server';
import { updateDocument } from '@/lib/firestore-crud';
import { POST } from '@/app/api/users/update-data/route';

// Mock the modules
jest.mock('@/lib/firestore-crud', () => ({
  updateDocument: jest.fn(),
}));
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

describe('POST /api/users/update-data', () => {
  beforeEach(() => {
    // Reset mocks before each test
    updateDocument.mockClear();
    NextResponse.json.mockClear();
  });

  it('successfully updates user data', async () => {
    // Arrange
    const userData = {
      action: 'updateUserData',
      uid: 'user123',
      displayName: 'John Doe',
      userPhotoURL: 'https://example.com/profile.jpg',
      coverPhotoURL: 'https://example.com/cover.jpg',
      about: 'About John Doe',
      gender: 'Male',
      birthdate: '1990-01-01',
      location: 'New York',
      phoneNumber: '+1234567890',
    };
    const request = {
      json: jest.fn().mockResolvedValue(userData),
    };
    const expectedResponse = { success: true };

    // Act
    await POST(request);

    // Assert
    expect(updateDocument).toHaveBeenCalledWith('users', 'user123', {
      displayName: 'John Doe',
      userPhotoURL: 'https://example.com/profile.jpg',
      coverPhotoURL: 'https://example.com/cover.jpg',
      about: 'About John Doe',
      gender: 'Male',
      birthdate: '1990-01-01',
      location: 'New York',
      phoneNumber: '+1234567890',
    });
    expect(NextResponse.json).toHaveBeenCalledWith(expectedResponse, { status: 200 });
  });

  it('returns a 400 status code for invalid action', async () => {
    // Arrange
    const invalidData = {
      action: 'invalidAction',
      uid: 'user123',
    };
    const request = {
      json: jest.fn().mockResolvedValue(invalidData),
    };
    const expectedResponse = { message: 'Invalid action' };

    // Act
    await POST(request);

    // Assert
    expect(updateDocument).not.toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith(expectedResponse, { status: 400 });
  });

  it('handles errors during the update process', async () => {
    // Arrange
    const userData = {
      action: 'updateUserData',
      uid: 'user123',
      displayName: 'John Doe',
      userPhotoURL: 'https://example.com/profile.jpg',
      coverPhotoURL: 'https://example.com/cover.jpg',
      about: 'About John Doe',
      gender: 'Male',
      birthdate: '1990-01-01',
      location: 'New York',
      phoneNumber: '+1234567890',
    };
    const request = {
      json: jest.fn().mockResolvedValue(userData),
    };
    const errorMessage = 'Database error';
    updateDocument.mockRejectedValue(new Error(errorMessage));
    const expectedResponse = { error: errorMessage };

    // Act
    await POST(request);

    // Assert
    expect(updateDocument).toHaveBeenCalledWith('users', 'user123', {
      displayName: 'John Doe',
      userPhotoURL: 'https://example.com/profile.jpg',
      coverPhotoURL: 'https://example.com/cover.jpg',
      about: 'About John Doe',
      gender: 'Male',
      birthdate: '1990-01-01',
      location: 'New York',
      phoneNumber: '+1234567890',
    });
    expect(NextResponse.json).toHaveBeenCalledWith(expectedResponse, { status: 500 });
  });
});
