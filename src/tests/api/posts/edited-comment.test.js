import { POST } from '@/app/api/posts/comment-post/edit-comment/route'; // Adjust the import path accordingly
import { updateCommentDocument } from '@/lib/firestore-crud';
import { NextResponse } from 'next/server';

// Mock the external modules
jest.mock('@/lib/firestore-crud', () => ({
  updateCommentDocument: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

describe('POST Edit Comment API', () => {
  const mockPostID = 'post123';
  const mockCommentID = 'comment456';
  const mockNewCommentBody = 'This is an updated comment.';
  const mockReq = {
    json: jest.fn().mockResolvedValue({
      postID: mockPostID,
      commentID: mockCommentID,
      newCommentBody: mockNewCommentBody,
    }),
  };

  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  it('should update the comment successfully', async () => {
    // Arrange

    // Act
    const response = await POST(mockReq);

    // Assert
    expect(updateCommentDocument).toHaveBeenCalledWith(mockPostID, mockCommentID, {
      isEdited: true,
      commentBody: mockNewCommentBody,
    }); // Verify that the updateCommentDocument was called with the correct parameters
    expect(NextResponse.json).toHaveBeenCalledWith({ success: true }, { status: 200 }); // Verify that a successful response is returned
  });

  it('should handle errors when updating fails', async () => {
    // Arrange
    const mockError = new Error('Failed to update comment');
    updateCommentDocument.mockRejectedValue(mockError);

    // Act
    const response = await POST(mockReq);

    // Assert
    expect(updateCommentDocument).toHaveBeenCalledWith(mockPostID, mockCommentID, {
      isEdited: true,
      commentBody: mockNewCommentBody,
    }); // Verify that the updateCommentDocument was called, even though it fails
    expect(NextResponse.json).toHaveBeenCalledWith({ error: mockError.message }, { status: 500 }); // Verify that an error response is returned
  });
});
