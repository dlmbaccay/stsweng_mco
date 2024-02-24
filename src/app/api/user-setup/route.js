// app/user-actions/route.js
import { NextResponse } from 'next/server';
import { uploadUserProfilePhoto} from '@/lib/storage-funcs';
import { createUserDocument, isUsernameTaken } from '@/lib/firestore-crud';


export async function POST(request) {
    const body = await request.json();
    const { action, user, username, displayName, userPhoto, userPhotoURL, about, gender, birthdate, location, phoneNumber } = body;
    try {
        switch (action) {
        case 'isUsernameTaken': 
            const isTaken = await isUsernameTaken(username);
            return NextResponse.json({ usernameTaken: isTaken }, {status: 200});
            break;
        case 'saveUserData':
            const userData = {
                username: username,
                displayName: displayName,
                userPhotoURL: userPhotoURL,
                about: about,
                email: user.email,
                followers: [],
                following: [],
                hidden: [],
                coverPhotoURL: "",
                gender: gender,
                birthdate: birthdate,
                location: location,
                phoneNumber: phoneNumber,
                uid: user.uid
            };
            await createUserDocument('users', user.uid, userData);
            return NextResponse.json({ success: true }, {status: 200});
            break;
        case 'uploadUserPhoto':
            const photoURL = await uploadUserProfilePhoto(user, userPhoto);
            return NextResponse.json({ url: photoURL }), {status: 200};
            break;
        default: 
            return NextResponse.json({message: 'Invalid action'}, {status: 400});
        }
    } catch (error) {
        console.log('Error in API Route:', error);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
}
