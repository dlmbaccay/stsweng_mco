import { NextResponse } from 'next/server';
import { getDocumentsWithCondition } from '@/lib/firestore-crud';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const petID = searchParams.get('petID');
    
    try {
        const postDocs = await getDocumentsWithCondition('posts', 'taggedPets', 'array-contains', petID);
        if (postDocs) {
            return NextResponse.json({ postDocs }, { status: 200 });
        } else {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }
    } catch (error) {
        console.log('Error in API Route:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}