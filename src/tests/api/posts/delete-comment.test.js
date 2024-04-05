import { firestore } from '@/lib/firebase';
import { DELETE } from '@/app/api/posts/comment-post/delete-comment/route';
import { deleteCommentDocument } from '@/lib/firestore-crud';
import { NextResponse } from 'next/server';

// Mock the external modules
jest.mock('@/lib/firestore-crud', () => ({
  deleteCommentDocument: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

describe('DELETE Comment API', () => {
  const mockPostID = 'post123';
  const mockCommentID = 'comment123';
  const mockReq = {
    json: jest.fn().mockResolvedValue({ postID: mockPostID, commentID: mockCommentID }),
  };

  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  it('should delete the comment successfully', async () => {
    // Arrange
    const mockMessage = 'Comment deleted successfully';
    deleteCommentDocument.mockResolvedValue(mockMessage);

    // Act
    const response = await DELETE(mockReq);

    // Assert
    expect(deleteCommentDocument).toHaveBeenCalledWith(mockPostID, mockCommentID); // Verify the correct arguments were passed
    expect(NextResponse.json).toHaveBeenCalledWith({ message: mockMessage }, { status: 200 }); // Verify the response structure and status code
  });

  it('should handle errors when deletion fails', async () => {
    // Arrange
    const mockError = new Error('Failed to delete comment');
    deleteCommentDocument.mockRejectedValue(mockError);

    // Act
    const response = await DELETE(mockReq);

    // Assert
    expect(deleteCommentDocument).toHaveBeenCalledWith(mockPostID, mockCommentID); // Verify the correct arguments were passed
    expect(NextResponse.json).toHaveBeenCalledWith({ error: mockError.message }, { status: 500 }); // Verify the error response structure and status code
  });
});
