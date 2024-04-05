import { GET } from '@/app/api/posts/get-post/route';
import { getAllDocuments } from '@/lib/firestore-crud';
import { NextResponse } from 'next/server';

// Mock the modules
jest.mock('@/lib/firestore-crud', () => ({
  getAllDocuments: jest.fn(),
}));
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({ data, options })),
  },
}));

describe('GET /api/posts/getpost', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully fetches documents from a collection', async () => {
    // Arrange
    const mockDocuments = [{ id: '1', title: 'Test Post' }];
    getAllDocuments.mockResolvedValue(mockDocuments);
    const mockRequest = {
      url: 'http://example.com?collection=posts',
    };

    // Act
    const response = await GET(mockRequest);

    // Assert
    expect(getAllDocuments).toHaveBeenCalledWith('posts');
    expect(NextResponse.json).toHaveBeenCalledWith(mockDocuments, { status: 200 });
  });

  it('handles errors during document fetching', async () => {
    // Arrange
    const errorMessage = 'Failed to fetch documents';
    getAllDocuments.mockRejectedValue(new Error(errorMessage));
    const mockRequest = {
      url: 'http://example.com?collection=posts',
    };

    // Act
    const response = await GET(mockRequest);

    // Assert
    expect(getAllDocuments).toHaveBeenCalledWith('posts');
    expect(NextResponse.json).toHaveBeenCalledWith({ error: errorMessage }, { status: 500 });
  });
});
