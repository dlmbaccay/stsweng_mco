import { POST } from '@/app/api/pet-setup/save-pet-data/route';
import { NextResponse } from 'next/server';
import { createPetDocument } from '@/lib/firestore-crud';

// Mocks
jest.mock('@/lib/firestore-crud', () => ({
  createPetDocument: jest.fn(),
}));
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}));

describe('/api/pet-setup/save-pet-data POST', () => {
  beforeEach(() => {
    // Clear mock calls before each test
    createPetDocument.mockClear();
    NextResponse.json.mockClear();
  });

  it('successfully saves pet data', async () => {
    // Arrange
    createPetDocument.mockResolvedValue(); // Simulate successful database operation
    const request = {
      json: () => Promise.resolve({
        action: 'savePetData',
      }),
    };

    // Act
    const response = await POST(request);

    // Assert
    expect(createPetDocument).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith({ success: true }, { status: 200 });
  }, 10000); // Increased timeout for async test

  it('returns an error if action is invalid', async () => {
    // Arrange
    const request = {
      json: () => Promise.resolve({
        action: 'invalidAction',
      }),
    };

    // Act
    const response = await POST(request);

    // Assert
    expect(createPetDocument).not.toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith({ message: 'Invalid action' }, { status: 400 });
  });

  it('returns an error if database operation fails', async () => {
    // Arrange
    createPetDocument.mockRejectedValue(new Error('Database error')); // Simulate a database error
    const request = {
      json: () => Promise.resolve({
        action: 'savePetData',
      }),
    };

    // Act
    const response = await POST(request);

    // Assert
    expect(createPetDocument).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Database error' }, { status: 500 });
  });
});
