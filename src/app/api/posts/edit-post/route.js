import { NextResponse } from 'next/server';
import { updateDocument } from '@/lib/firestore-crud';

export async function POST(request) {
    const body = await request.json();
    const { action, postID, isEdited, content, category, postType } = body;
    try {
        switch (action) {
            case 'updatePostData':
                if (postType === 'Original') {
                    const postData = {
                        isEdited: true,
                        content: content,
                        category: category
                    };

                    await updateDocument('posts', postID, postData);
                    return NextResponse.json({ success: true }, { status: 200 });
                } else if (postType === 'Repost') {
                    const postData = {
                        isEdited: true,
                        content: content
                    };

                    await updateDocument('posts', postID, postData);
                    return NextResponse.json({ success: true }, { status: 200 });
                }
            default:
                return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.log('Error in API Route:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}