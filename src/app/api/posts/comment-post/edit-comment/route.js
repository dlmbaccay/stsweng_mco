import { NextResponse } from 'next/server';
import { updateCommentDocument } from '@/lib/firestore-crud';

export async function POST(request) {
    const body = await request.json();
    const { postID, commentID, newCommentBody } = body;
    try {
        const commentData = {
            isEdited: true,
            commentBody: newCommentBody
        };
        await updateCommentDocument(postID, commentID, commentData);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.log('Error in API Route:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}