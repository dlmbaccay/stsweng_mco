import { POST } from '@/app/api/posts/create-post/route';
import { NextResponse } from 'next/server';
import { uploadPostMedia } from '@/lib/storage-funcs';
import { firestore } from '@/lib/firebase';
import { createPostDocument } from '@/lib/firestore-crud';

// Mock the modules
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}));
jest.mock('@/lib/storage-funcs', () => ({
  uploadPostMedia: jest.fn(),
}));
jest.mock('@/lib/firebase', () => ({
  firestore: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        id: 'mockPostId',
      })),
    })),
  },
}));
jest.mock('@/lib/firestore-crud', () => ({
  createPostDocument: jest.fn(),
}));

describe('POST /api/posts/create-post', () => {
  beforeEach(() => {
    // Reset mocks before each test
    NextResponse.json.mockClear();
    uploadPostMedia.mockClear();
    firestore.collection.mockClear();
    createPostDocument.mockClear();
  });

  it('successfully creates a post', async () => {
    // Arrange
    const formData = new FormData();
    // Add form data fields here according to your implementation
    // Example: formData.append('postAuthorID', 'authorId');
    
    const request = {
      formData: async () => formData,
    };
    
    // Mock uploadPostMedia function
    uploadPostMedia.mockResolvedValue(['mockImageURL']);
    
    // Act
    const response = await POST(request);

    // Assert
    expect(firestore.collection).toHaveBeenCalledWith('posts');
    expect(createPostDocument).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith({ message: 'Post created successfully.' }, { status: 200 });
  });

//   it('returns a 400 status code for empty form data', async () => {
//     // Arrange
//     const formData = new FormData();
//     const request = {
//       formData: async () => formData,
//     };
  
//     // Act
//     const response = await POST(request);
  
//     // Assert
//     expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Empty form data' }, { status: 400 });
//   });
  
});
