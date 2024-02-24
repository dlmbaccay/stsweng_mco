// app/users/route.js
import { NextResponse } from 'next/server';
import { getDocumentByFieldValue } from '@/lib/firestore-crud';


export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    // const body = await request.json();
    // const { action, user, username, displayName, userPhoto, userPhotoURL, about, gender, birthdate, location, phoneNumber } = body;
    console.log(username);
    try {
        
        const userDoc = await getDocumentByFieldValue('users', 'username', username);
        if (userDoc) {
            return NextResponse.json(userDoc, {status: 200});
        } else {
            return NextResponse.json({message: 'User not found'}, {status: 404});
        }
    } catch (error) {
        console.log('Error in API Route:', error);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
}
