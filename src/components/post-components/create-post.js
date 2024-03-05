import Image from "next/image"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { handleImageFilePreview } from "@/lib/helper-functions"
import { checkDisplayName, checkLocation } from "@/lib/formats"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PhoneInput } from "@/components/ui/phone-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import RoundImage from "@/components/round-image"
import Loader from "../Loader"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faImage } from "@fortawesome/free-solid-svg-icons"


export function CreatePost({props}) {
    const [loading, setLoading] = useState(false);

    const { uid, username, displayname, userphoto } = props;
    const pets = [{id:1, name: 'pet1'}, {id:2, name: 'pet2'}]
    
    const [ postAuthorID, setPostAuthorID ] = useState(uid);
    const [ postAuthorName, setPostAuthorName ] = useState(username);
    const [ postAuthorDisplayName, setPostAuthorDisplayName ] = useState(displayname);
    const [ postAuthorPhotoURL, setPostAuthorPhotoURL ] = useState(userphoto);
    const [ postContent, setPostContent] = useState('');
    const [ postCategory, setPostCategory] = useState('');
    const [ postTaggedPets, setPostTaggedPets] = useState('');
    const [ postImageURLs, setPostImageURLs] = useState([]);

    const handleCoverPhotoChange = (event) => {
        var temp = handleImageFilePreview(event.target.files[0]);
        if (temp == null) {
            setCoverPhoto('');
            setCoverPreviewUrl('/images/coverPhotoHolder.jpg');
        } else {
            setCoverPhoto(temp[0]);
            setCoverPreviewUrl(temp[1]);
        }
    };
    
    const createPost = (event) => {
        event.preventDefault();
    }

    return (
        <Dialog>
            <div className="flex flex-row items-center"> 
                <DialogTrigger asChild>
                    <Button variant="outline" className="h-[35px] w-11/12 bg-light_yellow hover:bg-primary text-primary-foreground hover:text-primary-foreground gap-2 flex items-center justify-center rounded-full">
                        What&apos;s on your mind? 
                    </Button>
                </DialogTrigger>
                <DialogTrigger asChild>
                    <Button variant="outline" className="p-1.5 bg-light_yellow hover:bg-primary text-primary-foreground hover:text-primary-foreground rounded-full aspect-square mx-auto">
                        <FontAwesomeIcon icon={faImage} class="w-5 h-5 text-white dark:text-dark_gray"></FontAwesomeIcon>
                    </Button>
                </DialogTrigger>
            </div>
            <DialogContent className="sm:max-w-[600px] lg:max-w-[1080px]">
                {loading ? <Loader show={loading}/> : 
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-center">Write a Post</DialogTitle>
                        </DialogHeader>
                        <hr className="border-b border-light_yellow my-2 mx-4"/>
                        <form onSubmit={createPost}>
                            <div className="flex flex-col w-full mb-4">
                                <div className="flex flex-row items-center w-1/3 p-4">
                                    <div className="flex flex-col items-center">
                                        <Select required onValueChange={(value) => setPostCategory(value)} defaultValue={''}>
                                            <SelectTrigger className="w-[280px]">
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="General">General</SelectItem>
                                                <SelectItem value="Q&A">Q&A</SelectItem>
                                                <SelectItem value="Tips">Tips</SelectItem>
                                                <SelectItem value="Pet Needs">Pet Needs</SelectItem>
                                                <SelectItem value="Milestones">Milestones</SelectItem>
                                                <SelectItem value="Lost Pets">Lost Pets</SelectItem>
                                                <SelectItem value="Unknown Owner">Unknown Owner</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <Select isMulti required onValueChange={(value) => setPostTaggedPets(value)} defaultValue={''}>
                                            <SelectTrigger className="w-[280px]">
                                                <SelectValue placeholder="Select Pets" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {pets.map((pet) => (
                                                    <SelectItem key={pet.id} value={pet}>{pet.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex flex-col w-2/3 px-20">
                                    <div className="flex flex-col items-left">
                                        <Label htmlFor="display-name" className="text-left text-lg font-normal">
                                            Display Name
                                        </Label>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Save changes</Button>
                            </DialogFooter>
                        </form>
                    </>
                }
                
            </DialogContent>
        </Dialog>
    )
}
