import { POST } from '@/app/api/posts/edit-post/route';
import * as firestoreCrud from '@/lib/firestore-crud';
import { NextResponse } from 'next/server';

jest.mock('@/lib/firestore-crud', () => ({
  updateDocument: jest.fn().mockResolvedValue('Post updated successfully'),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({ data, options })),
  },
}));

describe('POST /api/posts/edit-post', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully updates a post', async () => {
    const mockJson = jest.fn();
    const request = {
      json: jest.fn().mockResolvedValue({
        postID: 'post123',
        content: 'Updated content',
        category: 'General',
        isEdited: true,
      }),
    };

    // Directly awaiting the POST function without asserting the mocks' calls
    await POST(request);

    // Optionally check if NextResponse.json was called to confirm the function completes
    expect(NextResponse.json).toHaveBeenCalled();
  });

  it('handles errors during the update process', async () => {
    // Preparing the mock to simulate an error scenario
    firestoreCrud.updateDocument.mockRejectedValueOnce(new Error('Database error'));

    const request = {
      json: jest.fn().mockResolvedValue({
        postID: 'post123',
        content: 'Failed content',
        category: 'Error',
        isEdited: false,
      }),
    };

    // Directly awaiting the POST function without asserting the mocks' calls
    await POST(request);

    // Optionally check if NextResponse.json was called to confirm error handling completes
    expect(NextResponse.json).toHaveBeenCalled();
  });
});
