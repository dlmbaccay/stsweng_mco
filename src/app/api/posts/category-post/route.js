import { NextResponse } from 'next/server';
import { getDocumentsWithCondition } from '@/lib/firestore-crud';


export async function GET(request) {    
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const category = searchParams.get('category');
    
    try {
        
        const postDocs = await getDocumentsWithCondition('posts', 'category', "==", category );
        if (postDocs) {
            return NextResponse.json({postDocs}, {status: 200});
        } else {
            return NextResponse.json({message: 'No posts found'}, {status: 404});
        }
    } catch (error) {
        console.log('Error in API Route:', error);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
}