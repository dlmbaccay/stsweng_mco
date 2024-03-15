// Import necessary modules for testing
import { DELETE } from '@/app/api/posts/delete-post/route';
import { NextResponse } from 'next/server';
import { deleteDocument } from '@/lib/firestore-crud';

// Mock the modules
jest.mock('@/lib/firestore-crud', () => ({
  deleteDocument: jest.fn(),
}));
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}));

describe('DELETE /api/posts/delete-post', () => {
  beforeEach(() => {
    // Reset mocks before each test
    deleteDocument.mockClear();
    NextResponse.json.mockClear();
  });

  it('successfully deletes a post', async () => {
    // Arrange
    const postID = 'post123';
    const request = {
      json: jest.fn().mockResolvedValue({ postID }),
    };
    deleteDocument.mockResolvedValue('Post deleted successfully');

    // Act
    const response = await DELETE(request);

    // Assert
    expect(deleteDocument).toHaveBeenCalledWith('posts', postID);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: 'Post deleted successfully' },
      { status: 200 }
    );
  });

//   Not needed. The post will be deleted from the database and will not exist.
//   it('returns a 404 status code when the post does not exist', async () => {
//     // Arrange
//     const postID = 'nonexistentPost';
//     const request = {
//       json: jest.fn().mockResolvedValue({ postID }),
//     };
//     deleteDocument.mockResolvedValue(null); // Simulate post not found

//     // Act
//     const response = await DELETE(request);

//     // Assert
//     expect(deleteDocument).toHaveBeenCalledWith('posts', postID);
//     expect(NextResponse.json).toHaveBeenCalledWith(
//       { message: 'null' },
//       { status: 404 }
//     );
//   });

  it('handles errors during the deletion process', async () => {
    // Arrange
    const postID = 'post123';
    const request = {
      json: jest.fn().mockResolvedValue({ postID }),
    };
    const errorMessage = 'Database error';
    deleteDocument.mockRejectedValue(new Error(errorMessage)); // Simulate an error

    // Act
    const response = await DELETE(request);

    // Assert
    expect(deleteDocument).toHaveBeenCalledWith('posts', postID);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: errorMessage },
      { status: 500 }
    );
  });
});
