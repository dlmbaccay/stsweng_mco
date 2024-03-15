import { NextResponse } from 'next/server';
import { updateDocument } from '@/lib/firestore-crud';

export async function POST(request) {
    const body = await request.json();
    const { action, postID, content, category } = body;
    try {
        switch (action) {
            case 'updatePostData':
                // Use the updateDocument function from firestore-crud.js
                // await updateDocument("posts", postID, {
                //     content: postContent,
                //     category: postCategory
                // });
                const postData = {
                    content: content,
                    category: category
                };
                await updateDocument('posts', postID, postData);
                return NextResponse.json({ success: true }, { status: 200 });
            default:
                return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.log('Error in API Route:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}