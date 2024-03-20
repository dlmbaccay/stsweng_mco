// api/posts/via-userid/route.js
import { NextResponse } from 'next/server';
import { getDocumentsWithCondition } from '@/lib/firestore-crud';


export async function GET(request) {    
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const petId = searchParams.get('petId');
    
    try {
        
        const postDocs = await getDocumentsWithCondition('posts', 'authorUsername', "==", username, 'taggedPets', 'array-contains', petId );
        if (postDocs) {
            return NextResponse.json({postDocs}, {status: 200});
        } else {
            return NextResponse.json({message: 'Post not found'}, {status: 404});
        }
    } catch (error) {
        console.log('Error in API Route:', error);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
    // try {
    //     // Adjust the query to filter posts that include the current pet ID in their taggedPets array
    //     const query = firestore.collection('posts')
    //       .where('authorUsername', '==', username)
    //       .where('taggedPets', 'array-contains', petId);
    
    //     const snapshot = await query.get();
    //     const postDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    //     if (postDocs.length > 0) {
    //       return NextResponse.json({ postDocs }, { status: 200 });
    //     } else {
    //       return NextResponse.json({ message: 'No posts found for the specified pet.' }, { status: 404 });
    //     }
    //  } catch (error) {
    //     console.log('Error in API Route:', error);
    //     return NextResponse.json({ error: error.message }, { status: 500 });
    //  }
}
