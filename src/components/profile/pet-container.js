import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { PetSnippetCard } from "@/components/PetSnippetCard";
import { Image } from 'next/image';

export function PetsContainer({ props }) {
    
    const { userID, pets } = props;

    return (
        <Card className="mb-4">
            <div className="flex flex-col gap-2 items-center justify-center w-full">
                {pets.map((pet, index) => {
                    return (
                        <PetSnippetCard 
                            key={index}
                            props={{
                                petName: pet.petName,
                                petBreed: pet.petBreed,
                                petPhotoURL: pet.petPhotoURL,
                                petID: pet.petID,
                            }}
                        />
                    )}
                )}
            </div>
        </Card>
    )
}