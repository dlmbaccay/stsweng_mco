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
import Loader from "@/components/Loader"
import { set } from "date-fns"


export function CreatePetProfile({props}) {
    const [loading, setLoading] = useState(false);

    const { uid, username, displayName, location, coverPhotoURL } = props;

    const [ petName, setPetName ] = useState('');
    const [ petPhotoURL, setPetPhotoURL ] = useState('');
    const [ petBreed, setPetBreed ] = useState('');
    const [ petSex, setPetSex ] = useState('');
    const [ petAbout, setPetAbout ] = useState('');
    const [ petBirthdate, setPetBirthdate ] = useState('');
    const [ petBirthplace, setPetBirthplace ] = useState(location);
    const [ petFavoriteFood, setPetFavoriteFood ] = useState('');
    const [ petHobbies, setPetHobbies ] = useState('');

    const [showDisplayNameTooltip, setShowDisplayNameTooltip] = useState(false);
    const [showLocationTooltip, setShowLocationTooltip] = useState(false);

    const [ petPhotoPreviewUrl, setPetPhotoPreviewUrl ] = useState('/images/profilePictureHolder.jpg');

    const handleFileChange = (event) => {
        var temp = handleImageFilePreview(event.target.files[0]);
        if (temp == null) {
            setUserPhoto('');
            setPreviewUrl('/images/profilePictureHolder.jpg');
        } else {
            setPetPhotoURL(temp[0]);
            setPetPhotoPreviewUrl(temp[1]);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        try {
            if (petPhotoURL) {
                // Create a new document in the 'pets' collection with the given data
                const petID = firestore.collection("pets").doc().id;

                const formData = new FormData();
                formData.append('action', "uploadPetProfile");
                formData.append('pet', petID);
                formData.append('file', petPhotoURL);

                // Upload user photo
                await fetch('/api/pet-setup/upload-file', {
                    method: 'POST',
                    body: formData
                }).then(response => response.json()).then(async data => {
                    console.log(data);
                    setPetPhotoURL(data.url);
                    // save pet data
                    await savePetData(data.url);
                });
            } else {
                const petID = firestore.collection("pets").doc().id;
                await savePetData(petID, petPhotoURL);
            }

            async function savePetData(petID, petPhotoURL) {
                await fetch('/api/pet-setup/save-pet-data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'savePetData',
                        petID, petID,
                        petOwnerUsername: username,
                        petOwnerDisplayName: displayName,
                        petOwnerCoverPhotoURL: coverPhotoURL,
                        petName: petName,
                        petPhoto: petPhotoURL,
                        petBreed: petBreed,
                        petSex: petSex,
                        petAbout: petAbout,
                        petBirthplace: petBirthplace,
                        petBirthdate: petBirthdate,
                        petFavoriteFood: petFavoriteFood,
                        petHobbies: petHobbies
                    })
                }).then(response => response.json()).then(data => {
                    if (data.success) {
                        toast.success(`${petName}'s profile created successfully!`);
                        router.push(`/pet/${petName}`);
                    }
                });
            }
        } catch (error) {
            toast.error('Error creating pet profile. Please try again.');
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                 <Button className="rounded-full w-[60px] h-[60px]">
                    <i className="fa-solid fa-paw text-3xl flex items-center justify-center"/>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] lg:max-w-[1080px]">
                {loading ? <Loader show={loading}/> : 
                    <>
                        <DialogHeader>
                            <DialogTitle>Create Pet Profile</DialogTitle>
                            <DialogDescription>
                                Create a profile for your pet and let others know more about them. Click submit when you&apos;re done.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>

                            <div className="flex items-start justify-start w-full gap-6">
                                {/* pet display name */}
                                <div className="w-1/2 mt-4">
                                    <label htmlFor="display-name" className="block text-sm font-medium text-raisin_black">
                                        <span>Pet Name</span>
                                        <span className="text-red-500"> *</span>
                                    </label>
                                    <Input 
                                        type="text" 
                                        id="display-name" 
                                        placeholder="What would you like us to call your pet?"
                                        className={`border border-slate-400 mt-2 p-2 rounded-md w-full ${displayName === '' ? '': !checkDisplayName(petName) ? 'border-red-500' : 'border-green-500'}`} 
                                        required
                                        onFocus={() => setShowDisplayNameTooltip(true)}
                                        onBlur={() => setShowDisplayNameTooltip(false)}
                                        maxLength={30}
                                        minLength={1}
                                        onChange={(e) => setPetName(e.target.value)} />
                                    
                                    { showDisplayNameTooltip  && (
                                        <div className="mt-4 flex flex-row w-full pl-2 gap-4">
                                            <div>
                                                <p className={`text-xs ${displayName.length >= 1 && displayName.length <= 30 ? 'text-green-500' : 'text-slate-400'}`}>- Be 1-30 characters long.</p>
                                                <p className={`text-xs ${/^[^\s]+(\s+[^\s]+)*$/.test(displayName) ? 'text-green-500' : 'text-slate-400'}`}>- No blank spaces on either ends.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                 {/* pet breed */}
                                <div className="w-1/2 mt-4">
                                    <label htmlFor="breed" className="block text-sm font-medium text-raisin_black">
                                        <span>Breed</span>
                                    </label>
                                    <Input 
                                        type="text" 
                                        id="breed" 
                                        className={`border border-slate-400 mt-2 p-2 rounded-md w-full`} 
                                        placeholder="What breed is your pet?"
                                        maxLength={30}
                                        minLength={1}
                                        onChange={(e) => setPetBreed(e.target.value)} />
                                </div>
                            </div>

                            <div className="flex items-start justify-center w-full gap-6">
                                {/* pet photo */}
                                <div className="w-1/2 mt-4">
                                    <label htmlFor="profile-pic" className="block text-sm font-medium text-raisin_black">
                                        Profile Picture
                                        <span className="text-raisin_black text-xs"> (JPG, PNG, or GIF).</span>
                                    </label>

                                    <Input type="file" onChange={handleFileChange} accept="image/x-png,image/gif,image/jpeg" className='border border-slate-400 mt-2 mb-10 rounded-md w-full' />

                                    {!petPhotoPreviewUrl && (
                                        <div className='relative mx-auto w-52 h-52 drop-shadow-md rounded-full aspect-square'>
                                            <Image src={'/images/profilePictureHolder.jpg'} alt="Profile Picture" layout="fill" style={{objectFit: 'cover'}} className='rounded-full'/>
                                        </div>
                                    )}

                                    {petPhotoPreviewUrl && (
                                        <div className='relative mx-auto w-52 h-52 drop-shadow-md rounded-full aspect-square'>
                                            <Image src={petPhotoPreviewUrl} alt="Preview" layout="fill" style={{objectFit: 'cover'}} className='rounded-full'/>
                                        </div>
                                    )}
                                    
                                </div>

                                {/* about, favorite food, hobbies */}
                                <div className="w-1/2 flex flex-col h-full justify-between">
                                    {/* about */}
                                    <div className="w-full mt-4">
                                        <label htmlFor="about" className="block text-sm font-medium text-raisin_black">
                                            <span>About</span>
                                        </label>
                                        <Textarea 
                                            type="text" 
                                            id="about" 
                                            className={`border border-slate-400 mt-2 p-2 rounded-md w-full`} 
                                            placeholder="Tell us about your pet!"
                                            maxLength={100}
                                            minLength={1}
                                            onChange={(e) => setPetAbout(e.target.value)} />
                                    </div>

                                    {/* favorite food */}
                                    <div className="w-full mt-4">
                                        <label htmlFor="favorite-food" className="block text-sm font-medium text-raisin_black">
                                            <span>Favorite Food</span>
                                        </label>
                                        <Input 
                                            type="text" 
                                            id="favorite-food" 
                                            className={`border border-slate-400 mt-2 p-2 rounded-md w-full`} 
                                            placeholder="What's your pet's favorite food? i.e. Chicken, Beef, etc."
                                            maxLength={30}
                                            minLength={1}
                                            onChange={(e) => setPetFavoriteFood(e.target.value)} />
                                    </div>

                                    {/* hobbies */}
                                    <div className="w-full mt-4">
                                        <label htmlFor="hobbies" className="block text-sm font-medium text-raisin_black">
                                            <span>Hobbies</span>
                                        </label>
                                        <Input 
                                            type="text" 
                                            id="hobbies" 
                                            className={`border border-slate-400 mt-2 p-2 rounded-md w-full`} 
                                            placeholder="What are your pet's hobbies? i.e. Barking, Eating, etc."
                                            maxLength={30}
                                            minLength={1}
                                            onChange={(e) => setPetHobbies(e.target.value)} />
                                    </div>
                                </div>  
                            </div>

                            
                            <div className="flex items-start justify-start gap-6">
                                {/* sex */}
                                <div className="w-full mt-4">
                                    <label htmlFor="gender" className="mb-2 block text-sm font-medium text-raisin_black">
                                        <span>Sex</span>
                                        <span className="text-red-500"> *</span>
                                    </label>
                                    <Select required onValueChange={(value) => setPetSex(value)} defaultValue="">
                                        <SelectTrigger className="border border-slate-400">
                                            <SelectValue placeholder="Select Pet's Sex" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* pet birthdate */}
                                <div className="w-full mt-4">
                                    <label htmlFor="birthdate" className="block text-sm font-medium text-raisin_black">
                                        <span>Date of Birth</span>
                                        <span className="text-red-500"> *</span>
                                    </label>
                                    <Input 
                                        type="date" 
                                        id="birthdate" 
                                        name="birthdate"
                                        className={`border border-slate-400 mt-2 p-2 rounded-md w-full`} 
                                        placeholder="Tell us about yourself!" 
                                        max="9999-12-31"
                                        required
                                        value = {petBirthdate}
                                        onChange={(e) => setPetBirthdate(e.target.value)} />
                                </div>

                                {/* pet birthplace */}
                                <div className="w-full mt-4">
                                    <label htmlFor="location" className="block text-sm font-medium text-raisin_black">
                                        <span>Place of Birth</span>
                                        <span className="text-red-500"> *</span>
                                    </label>
                                    <Input 
                                        type="text" 
                                        id="location" 
                                        value={petBirthplace} 
                                        className={`border border-slate-400 mt-2 p-2 rounded-md w-full ${location === '' ? '': !checkLocation(petBirthplace) ? 'border-red-500' : 'border-green-500'}`} 
                                        placeholder="Where was your pet born?"
                                        required
                                        onFocus={() => setShowLocationTooltip(true)}
                                        onBlur={() => setShowLocationTooltip(false)}
                                        maxLength={30}
                                        minLength={1}
                                        onChange={(e) => setPetBirthplace(e.target.value)} />
                                    
                                    { showLocationTooltip  && (
                                        <div className="mt-4 flex flex-row w-full pl-2 gap-4">
                                            <div>
                                                <p className={`text-xs ${location.length >= 1 && location.length <= 30 ? 'text-green-500' : 'text-slate-400'}`}>- Be 2-30 characters long.</p>
                                                <p className={`text-xs ${/^[^\s]+(\s+[^\s]+)*$/.test(location) ? 'text-green-500' : 'text-slate-400'}`}>- No blank spaces on either ends.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <DialogFooter className="mt-6">
                                <Button
                                    type="reset"
                                    className="bg-red-500 hover:bg-red-600"
                                    onClick={() => {
                                        setPetName('');
                                        setPetPhotoURL('');
                                        setPetBreed('');
                                        setPetSex('');
                                        setPetAbout('');
                                        setPetBirthdate('');
                                        setPetBirthplace('');
                                        setPetFavoriteFood('');
                                        setPetHobbies('');
                                    }}
                                >Cancel</Button>
                                <Button type="submit">Submit</Button>
                            </DialogFooter>
                        </form>
                    </>
                }
                
            </DialogContent>
        </Dialog>
    )
}
