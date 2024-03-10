import { NextResponse } from 'next/server';
import { deleteDocument } from '@/lib/firestore-crud';
import { firestore } from "@/lib/firebase";


export async function DELETE(request) {    
    const body = await request.json();
    const {postID} = body;

    console.log(postID)
    
    try {
        const message = await firestore.collection('posts').doc(postID).delete()
        // const message = await deleteDocument('posts', postID );
        return NextResponse.json({message: message}, {status: 200});
    } catch (error) {
        console.log('Error in API Route:', error);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
}
