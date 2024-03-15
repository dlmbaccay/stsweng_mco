// Import necessary modules for testing
import { POST } from '@/app/api/posts/edit-post/route';
import { NextResponse } from 'next/server';
import { updateDocument } from '@/lib/firestore-crud';

// Mock the modules
jest.mock('@/lib/firestore-crud', () => ({
  updateDocument: jest.fn(),
}));
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}));

describe('POST /api/posts/edit-post', () => {
  beforeEach(() => {
    // Reset mocks before each test
    updateDocument.mockClear();
    NextResponse.json.mockClear();
  });

  it('successfully updates a post', async () => {
    // Arrange
    const formData = new FormData();
    formData.append('postID', 'post123');
    formData.append('postContent', 'Updated content');
    formData.append('postCategory', 'General');
    formData.append('isEdited', 'true');
    const request = {
      formData: jest.fn().mockResolvedValue(formData),
    };
    updateDocument.mockResolvedValue('Post updated successfully');

    // Act
    const response = await POST(request);

    // Assert
    expect(updateDocument).toHaveBeenCalledWith('posts', 'post123', {
      content: 'Updated content',
      category: 'General',
      isEdited: true,
    });
    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: 'Post updated successfully.' },
      { status: 200 }
    );
  });

  it('handles errors during the update process', async () => {
    // Arrange
    const formData = new FormData();
    formData.append('postID', 'post123');
    formData.append('postContent', 'Updated content');
    formData.append('postCategory', 'General');
    formData.append('isEdited', 'true');
    const request = {
      formData: jest.fn().mockResolvedValue(formData),
    };
    const errorMessage = 'Database error';
    updateDocument.mockRejectedValue(new Error(errorMessage)); // Simulate an error

    // Act
    const response = await POST(request);

    // Assert
    expect(updateDocument).toHaveBeenCalledWith('posts', 'post123', {
      content: 'Updated content',
      category: 'General',
      isEdited: true,
    });
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: errorMessage },
      { status: 500 }
    );
  });
});
