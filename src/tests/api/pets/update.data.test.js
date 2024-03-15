import { POST } from '@/app/api/pets/update-data/route';
import { NextResponse } from 'next/server';
import { updateDocument } from '@/lib/firestore-crud';

// Mock the modules
jest.mock('@/lib/firestore-crud', () => ({
  updateDocument: jest.fn(),
}));
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}));

describe('POST /api/pets/update-data', () => {
  beforeEach(() => {
    // Reset mocks before each test
    updateDocument.mockClear();
    NextResponse.json.mockClear();
  });

  it('successfully updates pet data', async () => {
    // Arrange
    const request = {
      json: jest.fn().mockResolvedValue({
        action: 'updatePetData',
        petID: 'pet123',
        petName: 'Fluffy',
        petAbout: 'Very cute and fluffy.',
        petHobbies: ['sleeping', 'eating'],
        petFavoriteFood: 'Fish',
        petPhotoURL: 'http://example.com/fluffy.jpg',
      }),
    };
    updateDocument.mockResolvedValue(true); // Simulate successful update

    // Act
    const response = await POST(request);

    // Assert
    expect(request.json).toHaveBeenCalled();
    expect(updateDocument).toHaveBeenCalledWith('pets', 'pet123', {
      petName: 'Fluffy',
      petAbout: 'Very cute and fluffy.',
      petHobbies: ['sleeping', 'eating'],
      petFavoriteFood: 'Fish',
      petPhotoURL: 'http://example.com/fluffy.jpg',
    });
    expect(NextResponse.json).toHaveBeenCalledWith({ success: true }, { status: 200 });
  });

  it('returns an error for invalid action', async () => {
    // Arrange
    const request = {
      json: jest.fn().mockResolvedValue({
        action: 'invalidAction',
      }),
    };

    // Act
    const response = await POST(request);

    // Assert
    expect(request.json).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith({ message: 'Invalid action' }, { status: 400 });
  });

  it('handles errors during the update process', async () => {
    // Arrange
    const request = {
      json: jest.fn().mockResolvedValue({
        action: 'updatePetData',
        petID: 'pet123',
      }),
    };
    const errorMessage = 'Database error';
    updateDocument.mockRejectedValue(new Error(errorMessage)); // Simulate an error during update

    // Act
    const response = await POST(request);

    // Assert
    expect(request.json).toHaveBeenCalled();
    expect(updateDocument).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith({ error: errorMessage }, { status: 500 });
  });
});
