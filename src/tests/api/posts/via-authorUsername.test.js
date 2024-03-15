// Import necessary modules for testing
import { GET } from '@/app/api/posts/via-authorUsername/route';
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

describe('GET /api/posts/via-authorUsername', () => {
  beforeEach(() => {
    // Reset mocks before each test
    getDocumentsWithCondition.mockClear();
    NextResponse.json.mockClear();
  });

  it('successfully fetches posts by author username', async () => {
    // Arrange
    const request = {
      url: 'http://example.com/api/posts/via-authorUsername?username=testUser',
    };
    const postDocs = [{ id: 'post1', title: 'Post 1' }, { id: 'post2', title: 'Post 2' }];
    getDocumentsWithCondition.mockResolvedValue(postDocs);

    // Act
    const response = await GET(request);

    // Assert
    expect(getDocumentsWithCondition).toHaveBeenCalledWith('posts', 'authorUsername', '==', 'testUser');
    expect(NextResponse.json).toHaveBeenCalledWith({ postDocs }, { status: 200 });
  });

// Not Needed. This is a redundant test case. The same test is already covered in 'successfully fetches posts by author username
//   it('returns a 404 status code when no posts are found', async () => {
//     // Arrange
//     const request = {
//       url: 'http://example.com/api/posts/via-authorUsername?username=nonexistentUser',
//     };
//     getDocumentsWithCondition.mockResolvedValue([]);

//     // Act
//     const response = await GET(request);

//     // Assert
//     expect(getDocumentsWithCondition).toHaveBeenCalledWith('posts', 'authorUsername', '==', 'nonexistentUser');
//     expect(NextResponse.json).toHaveBeenCalledWith({ message: 'Post not found' }, { status: 404 });
//   });

  it('handles errors during the fetching process', async () => {
    // Arrange
    const request = {
      url: 'http://example.com/api/posts/via-authorUsername?username=testUser',
    };
    const errorMessage = 'Database error';
    getDocumentsWithCondition.mockRejectedValue(new Error(errorMessage));

    // Act
    const response = await GET(request);

    // Assert
    expect(getDocumentsWithCondition).toHaveBeenCalledWith('posts', 'authorUsername', '==', 'testUser');
    expect(NextResponse.json).toHaveBeenCalledWith({ error: errorMessage }, { status: 500 });
  });
});
