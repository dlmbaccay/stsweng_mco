import { NextResponse } from 'next/server';
import { updateReplyDocument } from '@/lib/firestore-crud';

export async function POST(request) {
    const body = await request.json();
    const { postID, commentID, replyID, newReplyBody } = body;
    try {
        const replyData = {
            isEdited: true,
            replyBody: newReplyBody
        };
        await updateReplyDocument(postID, commentID, replyID, replyData);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.log('Error in API Route:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}