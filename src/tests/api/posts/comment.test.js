// Import the function and mocks necessary modules
import { POST } from '@/app/api/posts/comment-post/route';
import { createCommentDocument } from '@/lib/firestore-crud';
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase';

// Mocking the external dependencies
jest.mock('@/lib/firestore-crud', () => ({
  createCommentDocument: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

jest.mock('@/lib/firebase', () => ({
  firestore: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({
            id: 'mockCommentID', // Simulates generating an ID for a new comment document
          })),
        })),
      })),
    })),
  },
}));

describe('POST Comment API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a comment successfully', async () => {
    // Simulate formData
    const request = {
      formData: async () => new Map([
        ['postID', 'post123'],
        // include other fields as necessary
      ])
    };

    const response = await POST(request);

    expect(createCommentDocument).toHaveBeenCalledWith(
      'post123',
      'mockCommentID',
      expect.any(Object) // You can tailor this expectation to match the exact shape you anticipate
    );
    expect(NextResponse.json).toHaveBeenCalledWith({ message: "Comment created successfully." }, { status: 200 });
  });

  it('should handle failure in comment creation', async () => {
    // Force the mock to reject to simulate a database error
    createCommentDocument.mockRejectedValueOnce(new Error('Failed to create comment'));

    // Simulate formData
    const request = {
      formData: async () => new Map([
        ['postID', 'post123'],
        // include other fields as necessary
      ])
    };

    const response = await POST(request);

    // Here we check that NextResponse.json is called with an error, indicating failure
    expect(NextResponse.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }), { status: 500 });
  });
});
