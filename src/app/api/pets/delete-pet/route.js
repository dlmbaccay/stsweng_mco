import { NextResponse } from 'next/server';
import { deleteDocument } from '@/lib/firestore-crud';
import { deletePhotoFromStorage } from '@/lib/storage-funcs';

export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const petPhotoURL = searchParams.get('petPhotoURL');

    try {
        // delete pet document by id
        const petDoc = await deleteDocument('pets', id);

        if (petPhotoURL !== "") {
            // delete pet profile photo from storage
            await deletePhotoFromStorage('petProfile', id, 'profilePic');
        }

        if (petDoc) {
            return NextResponse.json({message: 'Pet profile deleted successfully'}, {status: 200});
        } else {
            return NextResponse.json({message: 'Pet profile not found'}, {status: 404});
        }
    } catch (error) {
        console.log('Error in API Route:', error);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
}