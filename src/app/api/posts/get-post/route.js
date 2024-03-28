import { NextResponse } from 'next/server';
import { getAllDocuments } from '@/lib/firestore-crud';

export async function GET(request) {
    // Parsing request URL to get the collection name
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('collection');

    try {
        // getAllDocuments function to fetch all documents from the specified collection
        const documents = await getAllDocuments(collection);

        // Return the documents as JSON with a 200 status code
        return NextResponse.json(documents, { status: 200 });
    } catch (error) {
        
        console.error('Error fetching documents:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}