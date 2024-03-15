// File path: <root>/src/tests/api/pets/retrieve-user-pets.test.js

import { GET } from '@/app/api/pets/retrieve-user-pets/route';
import { NextResponse } from 'next/server';
import { getDocumentsWithCondition } from '@/lib/firestore-crud';

// Mock the modules
jest.mock('@/lib/firestore-crud', () => ({
  getDocumentsWithCondition: jest.fn(),
}));
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}));

describe('GET /api/pets/retrieve-user-pets', () => {
  beforeEach(() => {
    // Reset mocks before each test
    getDocumentsWithCondition.mockClear();
    NextResponse.json.mockClear();
  });

  it('successfully retrieves user pets', async () => {
    // Arrange
    const fakeUserID = 'user123';
    const request = {
      url: `http://example.com/api/pets/retrieve-user-pets?uid=${fakeUserID}`,
    };
    const fakePets = [{ id: 'pet1', name: 'Fido' }, { id: 'pet2', name: 'Whiskers' }];
    getDocumentsWithCondition.mockResolvedValue(fakePets); // Simulate successful retrieval

    // Act
    const response = await GET(request);

    // Assert
    expect(getDocumentsWithCondition).toHaveBeenCalledWith("pets", "petOwnerID", "==", fakeUserID);
    expect(NextResponse.json).toHaveBeenCalledWith({ userPets: fakePets }, { status: 200 });
  });

  it('handles errors during the retrieval process', async () => {
    // Arrange
    const fakeUserID = 'user123';
    const request = {
      url: `http://example.com/api/pets/retrieve-user-pets?uid=${fakeUserID}`,
    };
    const errorMessage = 'Database error';
    getDocumentsWithCondition.mockRejectedValue(new Error(errorMessage)); // Simulate an error during retrieval

    // Act
    const response = await GET(request);

    // Assert
    expect(getDocumentsWithCondition).toHaveBeenCalledWith("pets", "petOwnerID", "==", fakeUserID);
    expect(NextResponse.json).toHaveBeenCalledWith({ error: errorMessage }, { status: 500 });
  });
});
