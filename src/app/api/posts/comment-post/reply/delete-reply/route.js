import { NextResponse } from 'next/server';
import { deleteReplyDocument } from '@/lib/firestore-crud';
import { firestore } from "@/lib/firebase";

export async function DELETE(request) {    
    const body = await request.json();
    const { postID, commentID, replyID } = body;

    try {
        await deleteReplyDocument(postID, commentID, replyID);
        return NextResponse.json({ message: 'Reply deleted successfully' }, {status: 200});
    } catch (error) {
        console.log('Error in API Route:', error);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
}
