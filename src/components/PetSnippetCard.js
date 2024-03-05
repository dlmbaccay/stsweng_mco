import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose} from "@/components/ui/dialog";
import RoundImage from "./round-image";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from "./ui/button";
import toast from 'react-hot-toast';
import { set } from 'date-fns';

export function PetSnippetCard({ props }) {
    const router = useRouter();
    const {
        petName, 
        petBreed,
        petPhotoURL,
        petID
    } = props;

    return (
        <Card className="mb-4 flex flex-col gap-2 items-center justify-center w-1/4 h-[200px] hover:bg-white dark:hover:bg-dark_gray px-6 py-4 hover:drop-shadow-md transition-all hover:scale-105"
        >
            <ManagePet petPhotoURL={petPhotoURL} petName={petName} petID={petID} />
            <div className="flex flex-col items-center justify-center cursor-pointer"
                onClick={() => { router.push(`/pet/${petID}`) }}
            >
                <p className="text-lg font-bold">{petName}</p>
                <p className="text-sm italic text-center">{petBreed}</p>
            </div>
        </Card>
    )
}

function ManagePet({ petPhotoURL, petName, petID }) {

    const [ show, setShow ] = useState(false);
    const [ loading, setLoading ] = useState(false);

    const handleDelete = async (petID, petPhotoURL, petName) => {
        try {
            toast.loading('Deleting pet profile...')
            setLoading(true);
            const response = await fetch(`/api/pets/delete-pet?id=${petID}&petPhotoURL=${petPhotoURL}`, {
                method: 'DELETE',
                body: JSON.stringify({petPhotoURL: petPhotoURL}),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                toast.dismiss();
                toast.success(`Goodbye ${petName}!`)
                console.log("Pet profile deleted successfully");
                // refresh page
                location.reload();
                setLoading(false);
            }
        } catch (error) {
            toast.dismiss();
            toast.error("Error deleting pet profile");
            console.error("Error deleting pet profile: ", error);
            setLoading(false);
        }
    }

    return (
        <Dialog>
            <DialogTrigger 
                className="relative"
                onMouseEnter={() => { setShow(true) }}
                onMouseLeave={() => { setShow(false) }}
            >
                <Image 
                    src={petPhotoURL == "" ? "/images/profilePictureHolder.jpg" : petPhotoURL} 
                    alt="pet photo" width={100} height={100} 
                    className={`rounded-full aspect-square object-cover cursor-pointer ${show ? 'opacity-60' : ''}`} 
                    
                />

                {show && (
                    <i className="fa-solid fa-trash text-3xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hover:opacity-100"/>
                )}
            </DialogTrigger>
            <DialogContent className="flex flex-col items-center justify-center w-fit h-fit">
                <Image src={petPhotoURL == "" ? "/images/profilePictureHolder.jpg" : petPhotoURL} alt="pet photo" width={100} height={100} className="rounded-full aspect-square object-cover drop-shadow-md" 
                />
                <p>
                    Are you sure to delete <span className="font-bold">{petName}&apos;s</span> profile?
                </p>
                
                <DialogFooter className="w-full gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary" className="w-1/2"
                            type="button"
                            onClick={() => { console.log("Cancel") }}
                        >Cancel</Button>
                    </DialogClose>
                        
                    <Button
                        onClick={() => { handleDelete(petID, petPhotoURL, petName) }}
                        className={`w-1/2 ${loading ? 'cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >Delete</Button>
                </DialogFooter>
            </DialogContent>
            
        </Dialog>
    )
}   