import { DELETE } from '@/app/api/pets/delete-pet/route';
import { NextResponse } from 'next/server';
import { deleteDocument } from '@/lib/firestore-crud';
import { deletePhotoFromStorage } from '@/lib/storage-funcs';

// Mock the modules
jest.mock('@/lib/firestore-crud', () => ({
  deleteDocument: jest.fn(),
}));
jest.mock('@/lib/storage-funcs', () => ({
  deletePhotoFromStorage: jest.fn(),
}));
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}));

describe('DELETE /api/pets/delete-pet', () => {
  beforeEach(() => {
    // Reset mocks before each test
    deleteDocument.mockClear();
    deletePhotoFromStorage.mockClear();
    NextResponse.json.mockClear();
  });

  it('successfully deletes pet profile with photo', async () => {
    // Arrange
    deleteDocument.mockResolvedValue(true); // Simulate successful document deletion
    const request = {
      url: 'https://example.com/api/pets/delete-pet?id=pet123&petPhotoURL=https://example.com/petPhoto.jpg',
    };

    // Act
    const response = await DELETE(request);

    // Assert
    expect(deleteDocument).toHaveBeenCalledWith('pets', 'pet123');
    expect(deletePhotoFromStorage).toHaveBeenCalledWith('petProfile', 'pet123', 'profilePic');
    expect(NextResponse.json).toHaveBeenCalledWith({ message: 'Pet profile deleted successfully' }, { status: 200 });
  });

  it('successfully deletes pet profile without photo', async () => {
    // Arrange
    deleteDocument.mockResolvedValue(true); // Assume deletion is successful
    const request = {
      url: 'https://example.com/api/pets/delete-pet?id=pet123&petPhotoURL=',
    };

    // Act
    const response = await DELETE(request);

    // Assert
    expect(deleteDocument).toHaveBeenCalledWith('pets', 'pet123');
    expect(deletePhotoFromStorage).not.toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith({ message: 'Pet profile deleted successfully' }, { status: 200 });
  });

  it('attempts to delete a non-existent pet profile', async () => {
    // Arrange
    deleteDocument.mockResolvedValue(false); // Simulate no document found
    const request = {
      url: 'https://example.com/api/pets/delete-pet?id=nonExistentID&petPhotoURL=https://example.com/petPhoto.jpg',
    };

    // Act
    const response = await DELETE(request);

    // Assert
    expect(deleteDocument).toHaveBeenCalledWith('pets', 'nonExistentID');
    expect(NextResponse.json).toHaveBeenCalledWith({ message: 'Pet profile not found' }, { status: 404 });
  });

  it('handles errors during the deletion process', async () => {
    // Arrange
    const errorMessage = 'Database error';
    deleteDocument.mockRejectedValue(new Error(errorMessage)); // Simulate an error
    const request = {
      url: 'https://example.com/api/pets/delete-pet?id=pet123&petPhotoURL=https://example.com/petPhoto.jpg',
    };

    // Act
    const response = await DELETE(request);

    // Assert
    expect(deleteDocument).toHaveBeenCalledWith('pets', 'pet123');
    expect(NextResponse.json).toHaveBeenCalledWith({ error: errorMessage }, { status: 500 });
  });
});