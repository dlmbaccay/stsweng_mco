// app/user-actions/route.js
import { NextResponse } from 'next/server';
import { updateDocument } from '@/lib/firestore-crud';


export async function POST(request) {
    const body = await request.json();
    const { action, uid, displayName, userPhotoURL, coverPhotoURL, about, gender, birthdate, location, phoneNumber } = body;
    try {
        switch (action) {
            case 'updateUserData':
                const userData = {
                    displayName: displayName,
                    userPhotoURL: userPhotoURL,
                    about: about,
                    coverPhotoURL: coverPhotoURL,
                    gender: gender,
                    birthdate: birthdate,
                    location: location,
                    phoneNumber: phoneNumber
                };
                await updateDocument('users', uid, userData);
                return NextResponse.json({ success: true }, {status: 200});
            case 'addPet':
                // Insert update, adding new field for pets
                return NextResponse.json({ success: true }, {status: 200});
            default: 
                return NextResponse.json({message: 'Invalid action'}, {status: 400});
        }
    } catch (error) {
        console.log('Error in API Route:', error);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
}
