import { NextResponse } from 'next/server';
import { updateDocument } from '@/lib/firestore-crud';

export async function POST(request) {
    const body = await request.json();
    const { action, petID, petName, petAbout, petHobbies, petFavoriteFood, petPhotoURL } = body;

    try {
        switch (action) {
            case 'updatePetData':
                const petData = {
                    petName: petName,
                    petAbout: petAbout,
                    petHobbies: petHobbies,
                    petFavoriteFood: petFavoriteFood,
                    petPhotoURL: petPhotoURL
                };
                await updateDocument('pets', petID, petData);
                return NextResponse.json({ success: true }, { status: 200 });
            default:
                return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.log('Error in API Route:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}