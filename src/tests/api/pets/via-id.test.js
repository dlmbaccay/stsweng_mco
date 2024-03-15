import { GET } from '@/app/api/pets/via-id/route';
import { NextResponse } from 'next/server';
import { getDocumentById } from '@/lib/firestore-crud';

// Mock the modules
jest.mock('@/lib/firestore-crud', () => ({
  getDocumentById: jest.fn(),
}));
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}));

describe('GET /api/pets/[id]', () => {
  beforeEach(() => {
    // Reset mocks before each test
    getDocumentById.mockClear();
    NextResponse.json.mockClear();
  });

  it('successfully fetches a pet document by id', async () => {
    // Arrange
    const id = 'pet123';
    const fakePetDoc = { id: id, name: 'Buddy', type: 'Dog' };
    const request = {
      url: `http://example.com/api/pets/${id}`, 
    };
    getDocumentById.mockResolvedValue(fakePetDoc); // Simulate successful fetch

    // Act
    const response = await GET(request);

    // Assert
    expect(getDocumentById).toHaveBeenCalledWith('pets', null); //id 
    expect(NextResponse.json).toHaveBeenCalledWith(fakePetDoc, { status: 200 });
  });

  it('returns a 404 status code when the pet is not found', async () => {
    // Arrange
    const id = 'nonexistentPet';
    const request = {
      url: `http://example.com/api/pets/${id}`,
    };
    getDocumentById.mockResolvedValue(null); // Simulate pet not found

    // Act
    const response = await GET(request);

    // Assert
    expect(getDocumentById).toHaveBeenCalledWith('pets', null); //id
    expect(NextResponse.json).toHaveBeenCalledWith({ message: 'Pet not found' }, { status: 404 });
  });

  it('handles errors during the fetching process', async () => {
    // Arrange
    const id = 'pet123';
    const request = {
      url: `http://example.com/api/pets/${id}`,
    };
    const errorMessage = 'Database error';
    getDocumentById.mockRejectedValue(new Error(errorMessage)); // Simulate an error

    // Act
    const response = await GET(request);

    // Assert
    expect(getDocumentById).toHaveBeenCalledWith('pets', null); //id 
    expect(NextResponse.json).toHaveBeenCalledWith({ error: errorMessage }, { status: 500 });
  });
});
