// app/users/route.js
import { NextResponse } from 'next/server';
import { getDocumentByFieldValue } from '@/lib/firestore-crud';


export async function GET(request) {    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    try {
        // fetch pet document by id
        const petDoc = await getDocumentByFieldValue('pets', 'uid', id );
        if (petDoc) {
            return NextResponse.json(petDoc, {status: 200});
        } else {
            return NextResponse.json({message: 'Pet not found'}, {status: 404});
        }
    } catch (error) {
        console.log('Error in API Route:', error);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
}
