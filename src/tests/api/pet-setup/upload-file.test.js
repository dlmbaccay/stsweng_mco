// Assuming your project structure and jest setup allows resolving modules as configured
import { NextResponse } from 'next/server';
import { uploadPetProfilePhoto } from '@/lib/storage-funcs';
import { POST } from '@/app/api/pet-setup/upload-file/route';

// Mocking NextResponse and uploadPetProfilePhoto to control their behavior in tests
jest.mock('next/server', () => ({
    NextResponse: {
      json: jest.fn((data, options) => ({ data, options })),
    },
  }));

jest.mock('@/lib/storage-funcs', () => ({
  uploadPetProfilePhoto: jest.fn(),
}));

describe('/api/pet-setup/upload-file POST', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    NextResponse.json.mockClear();
    uploadPetProfilePhoto.mockClear();
  });

  it('successfully uploads pet profile photo', async () => {
    // Setup: Mock uploadPetProfilePhoto to simulate successful upload
    const uploadPetProfilePhotoMock = require('@/lib/storage-funcs').uploadPetProfilePhoto;
    uploadPetProfilePhotoMock.mockResolvedValue('http://example.com/photo-url');
  
    // Act: Simulate POST request
    const formData = new FormData();
    formData.append('action', 'uploadPetProfile');
    formData.append('pet', 'pet123');
    formData.append('file', new Blob(['file content'], { type: 'image/jpeg' }));
  
    const response = await POST({ formData: () => formData });
  
    // Assertions
    expect(uploadPetProfilePhotoMock).toHaveBeenCalledWith('pet123', expect.any(Blob));
    expect(NextResponse.json).toHaveBeenCalledWith({ url: 'http://example.com/photo-url' });

  });

  it('returns an error if no file is received', async () => {
    // Simulate formData without a file
    const mockFormData = new Map();
    mockFormData.set('action', 'uploadPetProfile');
    mockFormData.set('pet', 'pet123');

    // Simulate the request object
    const mockRequest = {
      formData: async () => mockFormData,
    };

    // Call the POST function with the mocked request
    const response = await POST(mockRequest);

    // Assertions
    expect(uploadPetProfilePhoto).not.toHaveBeenCalled();
    expect(response).toEqual(NextResponse.json({ error: "No files received." }, { status: 400 }));
  });

  // Additional test cases as needed...
});
