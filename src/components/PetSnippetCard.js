import React from "react";
import { Card } from "@/components/ui/card";
import { Image } from 'next/image';

export function PetSnippetCard({ props }) {
    const {
        petName, 
        petBreed,
        petPhotoURL,
        petID
    } = props;

    return (
        <Card className="mb-4">
            <div className="flex flex-col gap-2 items-center justify-center w-full">
                <Image
                    src={petPhotoURL}
                    alt={petName}
                    width={200}
                    height={200}
                    className="rounded-full"
                />
                <p>{petName}</p>
                <p>{petBreed}</p>
            </div>
        </Card>
    )
}