import { DELETE } from '@/app/api/posts/comment-post/reply/delete-reply/route';
import { deleteReplyDocument } from '@/lib/firestore-crud';
import { NextResponse } from 'next/server';

// Mocking the external modules
jest.mock('@/lib/firestore-crud', () => ({
  deleteReplyDocument: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

describe('DELETE Reply API', () => {
  const mockPostID = 'post123';
  const mockCommentID = 'comment456';
  const mockReplyID = 'reply789';
  const mockReq = {
    json: jest.fn().mockResolvedValue({
      postID: mockPostID,
      commentID: mockCommentID,
      replyID: mockReplyID,
    }),
  };

  beforeEach(() => {
    // Clearing mocks before each test
    jest.clearAllMocks();
  });

  it('should delete the reply successfully', async () => {
    // Arrange

    // Act
    const response = await DELETE(mockReq);

    // Assert
    expect(deleteReplyDocument).toHaveBeenCalledWith(mockPostID, mockCommentID, mockReplyID); // Verify correct parameters are passed to the deleteReplyDocument function
    expect(NextResponse.json).toHaveBeenCalledWith({ message: 'Reply deleted successfully' }, { status: 200 }); // Check for successful response
  });

  it('should handle errors when deletion fails', async () => {
    // Arrange
    const mockError = new Error('Failed to delete reply');
    deleteReplyDocument.mockRejectedValue(mockError);

    // Act
    const response = await DELETE(mockReq);

    // Assert
    expect(deleteReplyDocument).toHaveBeenCalledWith(mockPostID, mockCommentID, mockReplyID); // Ensure function was called even in failure case
    expect(NextResponse.json).toHaveBeenCalledWith({ error: mockError.message }, { status: 500 }); // Verify error response is returned
  });
});
