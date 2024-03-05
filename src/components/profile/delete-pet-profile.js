import Image from "next/image"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { handleImageFilePreview } from "@/lib/helper-functions"
import { checkDisplayName, checkLocation } from "@/lib/formats"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PhoneInput } from "@/components/ui/phone-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import RoundImage from "@/components/round-image"
import Loader from "../Loader"
import { set } from "date-fns"

export function DeletePetProfile({props}) {
    const router = useRouter();
    const { petData, currentUser } = props;
    const [ deleteLoading, setDeleteLoading ] = useState(false);

    const handleDelete = async (petID, petPhotoURL, petName) => {
        try {
            toast.loading('Deleting pet profile...')
            setDeleteLoading(true);
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
                // go back to current user's profile
                router.push(`/user/${currentUser.username}`);
                setDeleteLoading(false);
            }
        } catch (error) {
            toast.dismiss();
            toast.error("Error deleting pet profile");
            console.error("Error deleting pet profile: ", error);
            setDeleteLoading(false);
        }
    }

    return (
        <Dialog>
            <DialogTrigger>
                <div className="px-4 py-2 flex items-center justify-center w-fit h-fit gap-2"
                >
                    <i class="fa-solid fa-trash" />
                    <p>Delete Pet Profile</p>
                </div>
            </DialogTrigger>

            <DialogContent className="flex flex-col items-center justify-center w-fit h-fit">
                <Image src={petData.petPhotoURL == "" ? "/images/profilePictureHolder.jpg" : petData.petPhotoURL} alt="pet photo" width={100} height={100} className="rounded-full aspect-square object-cover drop-shadow-md" 
                />
                <p>
                    Are you sure to delete <span className="font-bold">{petData.petName}&apos;s</span> profile?
                </p>
                
                <DialogFooter className="w-full gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary" className="w-1/2"
                            type="button"
                            onClick={() => { console.log("Cancel") }}
                        >Cancel</Button>
                    </DialogClose>
                        
                    <Button
                        onClick={() => { handleDelete(petData.petID, petData.petPhotoURL, petData.petName) }}
                        className={`w-1/2 ${deleteLoading ? 'cursor-not-allowed' : ''}`}
                        disabled={deleteLoading}
                    >Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}