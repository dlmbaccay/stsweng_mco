import { NextResponse} from 'next/server';
import { getDocumentsWithCondition } from '@/lib/firestore-crud';

export async function GET(request) {
    // retrieve all pets of current user from firestore, return and store as userPets map

    const { searchParams } = new URL(request.url);
    const userID = searchParams.get('uid');

    try {
        const userPets = await getDocumentsWithCondition("pets", "petOwnerID", "==", userID);
        return NextResponse.json({ userPets }, {status: 200});
    } catch (error) {
        console.log('Error in API Route:', error.message);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
}