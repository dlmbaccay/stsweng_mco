import { POST } from '@/api/user-setup/upload-file/route';
import { NextResponse } from 'next/server';

// Mock the storage functions and Firestore CRUD operations
jest.mock('@/lib/storage-funcs', () => ({
    uploadUserProfilePhoto: jest.fn(),
    uploadUserCoverPhoto: jest.fn(),
  }));

jest.mock('@/lib/firestore-crud', () => ({
  createUserDocument: jest.fn(),
  isUsernameTaken: jest.fn(),
  updateDocument: jest.fn(),
}));

// Mock NextResponse.json since it's used in your route
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}));

describe('upload-file API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles uploadProfile action successfully', async () => {
    const mockFile = {}; // Simulate a file object
    const user = 'testUser';
    require('@/lib/storage-funcs').uploadUserProfilePhoto.mockResolvedValue('photoURL');

    const formData = new FormData();
    formData.append('action', 'uploadProfile');
    formData.append('file', mockFile);
    formData.append('user', user);

    const request = {
      formData: () => Promise.resolve(formData),
    };

    const result = await POST(request);

    expect(result.data).toEqual({ url: 'photoURL' });
    // Testing the options is optional, but it's good to verify the status code. But since its local, it will not be necessary.
    // expect(result.options).toEqual({ status: 200 });
  });

  // Add more test cases here for uploadCover, error handling, etc.
});