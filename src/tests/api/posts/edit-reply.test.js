import { POST } from '@/app/api/posts/comment-post/reply/edit-reply/route';
import { updateReplyDocument } from '@/lib/firestore-crud';
import { NextResponse } from 'next/server';

// Correcting mocks to focus on updating a reply
jest.mock('@/lib/firestore-crud', () => ({
  updateReplyDocument: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

describe('POST Edit Reply API', () => {
  const mockPostID = 'post123';
  const mockCommentID = 'comment456';
  const mockReplyID = 'reply789';
  const mockNewReplyBody = 'This is the updated reply.';

  beforeEach(() => {
    jest.clearAllMocks(); // Clears mocks before each test

    // Resetting mockReq to correctly mock a JSON request for the POST function
    global.mockReq = {
      json: jest.fn().mockResolvedValue({
        postID: mockPostID,
        commentID: mockCommentID,
        replyID: mockReplyID,
        newReplyBody: mockNewReplyBody,
      }),
    };
  });

  it('should update the reply successfully', async () => {
    // Act
    const response = await POST(mockReq);

    // Assert
    expect(updateReplyDocument).toHaveBeenCalledWith(
      mockPostID, mockCommentID, mockReplyID,
      { isEdited: true, replyBody: mockNewReplyBody }
    ); // Verifies that updateReplyDocument was called with correct parameters
    expect(NextResponse.json).toHaveBeenCalledWith({ success: true }, { status: 200 }); // Checks for a successful response
  });

  it('should handle errors when updating fails', async () => {
    // Arrange
    const mockError = new Error('Failed to update reply');
    updateReplyDocument.mockRejectedValue(mockError);

    // Act
    const response = await POST(mockReq);

    // Assert
    expect(updateReplyDocument).toHaveBeenCalledWith(
      mockPostID, mockCommentID, mockReplyID,
      { isEdited: true, replyBody: mockNewReplyBody }
    ); // Ensures function was called even in failure case
    expect(NextResponse.json).toHaveBeenCalledWith({ error: mockError.message }, { status: 500 }); // Verifies an error response is returned
  });
});
