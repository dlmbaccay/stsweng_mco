// app/user-actions/route.js
import { NextResponse } from 'next/server';
import { createPetDocument, uploadPetPhotoURL } from '@/lib/firestore-crud';

export async function POST(request) {
    const body = await request.json();
    const { action, petOwnerID, petID, petOwnerUsername, petOwnerDisplayName, petOwnerCoverPhotoURL, petName, petPhotoURL, petBreed, petSex, petAbout, petBirthplace, petBirthdate, petFavoriteFood, petHobbies } = body;

    try {
        switch (action) {
            case 'savePetData':
                const petData = {
                    petOwnerID: petOwnerID,
                    petID: petID,
                    petOwnerUsername: petOwnerUsername,
                    petOwnerDisplayName: petOwnerDisplayName,
                    petOwnerCoverPhotoURL: petOwnerCoverPhotoURL,
                    petName: petName,
                    petPhotoURL: petPhotoURL,
                    petBreed: petBreed,
                    petSex: petSex,
                    petAbout: petAbout,
                    petBirthplace: petBirthplace,
                    petBirthdate: petBirthdate,
                    petFavoriteFood: petFavoriteFood,
                    petHobbies: petHobbies
                };

                await createPetDocument("pets", petID, petData);
                return NextResponse.json({ success: true }, {status: 200});
            default: 
                return NextResponse.json({message: 'Invalid action'}, {status: 400});
        }
    } catch (error) {
        console.log('Error in API Route:', error.message);
        return NextResponse.json({ error: error.message }, {status: 500});
    }
}
