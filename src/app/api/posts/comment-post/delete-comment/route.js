import { NextResponse } from 'next/server';
import { deleteCommentDocument } from '@/lib/firestore-crud';
import { firestore } from "@/lib/firebase";


export async function DELETE(request) {    
    const body = await request.json();
    const { postID, commentID } = body;

    try {
        const message = await deleteCommentDocument(postID, commentID);
        return NextResponse.json({message: message}, {status: 200});
    } catch (error) {
        console.log('Error in API Route:', error);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
}
