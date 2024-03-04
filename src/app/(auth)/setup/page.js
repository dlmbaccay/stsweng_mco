"use client"

import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { auth, firestore, storage } from "@/lib/firebase";
import { checkDisplayName, checkLocation, checkUsername } from "@/lib/formats";
import { isUsernameTaken} from "@/lib/firestore-crud";
import { handleImageFilePreview } from "@/lib/helper-functions";
import { ModeToggle } from "@/components/mode-toggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import WithAuth from "@/components/WithAuth";
import { Card, CardHeader } from "@/components/ui/card";
import { set } from "date-fns";


function SetupPage() {

    const router = useRouter();
    const user = auth.currentUser;
    const [loading, setLoading] = useState(false);

    // Form value variables
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [about, setAbout] = useState('');
    const [gender, setGender] = useState('');
    const [birthdate, setBirthdate] = useState(null);
    const [location, setLocation] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [userPhoto, setUserPhoto] = useState('');
    const [previewUrl, setPreviewUrl] = useState('/images/profilePictureHolder.jpg');
    const [userPhotoURL, setUserPhotoURL] = useState('');

    const [submitDisabled, setSubmitDisabled] = useState(false);


    // Tooltip variables
    const [showUsernameTooltip, setShowUsernameTooltip] = useState(false);
    const [showDisplayNameTooltip, setShowDisplayNameTooltip] = useState(false);
    const [showLocationTooltip, setShowLocationTooltip] = useState(false);

    const handleSignOut = () => {
        auth.signOut().then(() => {
            router.push('/landing');
            toast.success('Signed out');
            console.log('Signed out');
        })
    }

    useEffect(() => {
        const checkUserSetup = async () => {
            if (user) {
                const userRef = firestore.doc(`users/${user.uid}`);
                const doc = await userRef.get();
                if (doc.exists && doc.data().username) {
                    toast.error("You've already set up your account!");
                    router.push(`/home`);
                }
            }
        };
        checkUserSetup();
    });

    /**
     * Handles the change event of the file input element.
     * This will set the preview image of their selected file 
     * and assign it to the userPhoto variable.
     * 
     * @param {Event} event - The change event object.
     */
    const handleFileChange = (event) => {
        var temp = handleImageFilePreview(event.target.files[0]);
        if (temp == null) {
            setUserPhoto('');
            setPreviewUrl('/images/profilePictureHolder.jpg');
        } else {
            setUserPhoto(temp[0]);
            setPreviewUrl(temp[1]);
        }
        
    };
    
    /**
     * Handles the form submission event.
     * This function sends requests to the server to check if the username is taken,
     * upload the user's photo, and save the user's data.
     * 
     * @param {Event} event - The form submission event object.
     */
    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            // Check if username is taken
            await fetch('/api/user-setup/save-user-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'isUsernameTaken', username }) 
            }).then(res => res.json()).then(data => {
                if (data.usernameTaken) {
                    throw new Error("username taken");
                    return;
                }
            });

            // Photo Upload
            if (userPhoto) {
                const formData = new FormData();
                formData.append('action', "uploadProfile");
                formData.append('user', user.uid);
                formData.append('file', userPhoto);

                // Upload user photo
                await fetch('/api/user-setup/upload-file', {
                    method: 'POST',
                    body: formData
                }).then(response => response.json()).then(async data => {
                    console.log(data);
                    setUserPhotoURL(data.url);
                    // Save User Data
                    await saveUserData(data.url);
                });
            } else {
                // Save User Data
                await saveUserData(userPhotoURL);
            }

            async function saveUserData(photoURL) {
                await fetch('/api/user-setup/save-user-data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'saveUserData', user, username, displayName, userPhotoURL: photoURL, about, gender, birthdate, location, phoneNumber /* ... */ }) 
                }).then(response => response.json()).then(data => {
                    if (data.success) {
                        toast.success(`Welcome to BantayBuddy, ${username}!`);
                        router.push(`/user/${username}`);
                    }
                });
            }

            
        } catch (error) {
            if (error.message === 'username taken'){
                toast.error('Username is already taken!');
            } else {
                toast.error('An error occurred while setting up your account.');
            }
        } 
    }
      

  return (
    <div className="flex items-center justify-center md:mt-16 md:mb-16 w-full md:pl-16 md:pr-16 setup-page-background">
      <Card className="h-full md:outline justify-center items-center flex w-full md:w-fit">
        <form onSubmit={handleSubmit} className="md:rounded-md p-8 w-full md:w-[800px] h-full md:h-fit flex flex-col overflow-y-scroll md:overflow-hidden">

            <h1 className="font-bold text-xl">Let&apos;s create your BantayBuddy account!</h1>
            
            {/* Username */}
            <div className="w-full mt-4">
                <label htmlFor="username" className="block text-sm font-medium text-raisin_black">
                    <span>Username</span>
                    <span className="text-red-500"> *</span>
                </label>

                <Input 
                    type="text"
                    id="username" 
                    value={username} 
                    className={`border border-slate-400 mt-2 p-2 rounded-md w-full ${username === '' ? '': !checkUsername(username) ? 'border-red-500' : 'border-green-500'}`} 
                    placeholder="Enter your username" 
                    required
                    onFocus={() => setShowUsernameTooltip(true)}
                    onBlur={() => setShowUsernameTooltip(false)}
                    minLength={3}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())} />
                
                { showUsernameTooltip  && (
                    <div className="mt-4 flex flex-row w-full pl-2 gap-4">
                        <div>
                            <p className={`text-xs ${username.length >= 3 && username.length <= 15 ? 'text-green-500' : 'text-slate-400'}`}>- Be 3-15 characters long.</p>
                            <p className={`text-xs ${/^[a-zA-Z0-9]+(?:[_.][a-zA-Z0-9]+)*$/.test(username) ? 'text-green-500' : 'text-slate-400'}`}>- Start and end with alphanumeric characters.</p>
                            <p className={`text-xs ${/^[a-zA-Z0-9]+(?:[_.][a-zA-Z0-9]+)*$/.test(username) ? 'text-green-500' : 'text-slate-400'}`}>- Underscores or periods must be in between alphanumeric characters.</p>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Display Name */}
            <div className="w-full mt-4">
                <label htmlFor="display-name" className="block text-sm font-medium text-raisin_black">
                    <span>Display Name</span>
                    <span className="text-red-500"> *</span>
                </label>
                <Input 
                    type="text" 
                    id="display-name" 
                    value={displayName} 
                    className={`border border-slate-400 mt-2 p-2 rounded-md w-full ${displayName === '' ? '': !checkDisplayName(displayName) ? 'border-red-500' : 'border-green-500'}`} 
                    placeholder="What would you like us to call you?" 
                    required
                    onFocus={() => setShowDisplayNameTooltip(true)}
                    onBlur={() => setShowDisplayNameTooltip(false)}
                    maxLength={30}
                    minLength={1}
                    onChange={(e) => setDisplayName(e.target.value)} />
                
                { showDisplayNameTooltip  && (
                    <div className="mt-4 flex flex-row w-full pl-2 gap-4">
                        <div>
                            <p className={`text-xs ${displayName.length >= 1 && displayName.length <= 30 ? 'text-green-500' : 'text-slate-400'}`}>- Be 1-30 characters long.</p>
                            <p className={`text-xs ${/^[^\s]+(\s+[^\s]+)*$/.test(displayName) ? 'text-green-500' : 'text-slate-400'}`}>- No blank spaces on either ends.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Location */}
            <div className="w-full mt-4">
                <label htmlFor="location" className="block text-sm font-medium text-raisin_black">
                    <span>Location</span>
                    <span className="text-red-500"> *</span>
                </label>
                <Input 
                    type="text" 
                    id="location" 
                    value={location} 
                    className={`border border-slate-400 mt-2 p-2 rounded-md w-full ${location === '' ? '': !checkLocation(location) ? 'border-red-500' : 'border-green-500'}`} 
                    placeholder="Where are you from?" 
                    required
                    onFocus={() => setShowLocationTooltip(true)}
                    onBlur={() => setShowLocationTooltip(false)}
                    maxLength={30}
                    minLength={1}
                    onChange={(e) => setLocation(e.target.value)} />
                
                { showLocationTooltip  && (
                    <div className="mt-4 flex flex-row w-full pl-2 gap-4">
                        <div>
                            <p className={`text-xs ${location.length >= 1 && location.length <= 30 ? 'text-green-500' : 'text-slate-400'}`}>- Be 2-30 characters long.</p>
                            <p className={`text-xs ${/^[^\s]+(\s+[^\s]+)*$/.test(location) ? 'text-green-500' : 'text-slate-400'}`}>- No blank spaces on either ends.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Phone Number */}
            <div className="w-full mt-4">
                <label htmlFor="phone-number" className="block text-sm font-medium text-raisin_black">
                    <span>Phone Number</span>
                    <span className="text-red-500"> *</span>
                </label>
                <PhoneInput 
                    defaultCountry="PH"
                    value={phoneNumber} 
                    onChange={setPhoneNumber} 
                    className={`border border-slate-400 mt-2 rounded-md w-full`} 
                    placeholder="Enter your phone number" 
                    required
                    />
            </div>

            {/* Profile Picture */}
            <div className="w-full mt-4">
                <label htmlFor="profile-pic" className="block text-sm font-medium text-raisin_black">
                    Profile Picture
                    <span className="text-raisin_black text-xs"> (JPG, PNG, or GIF).</span>
                </label>
                <Input type="file"  onChange={handleFileChange} accept="image/x-png,image/gif,image/jpeg" className='border border-slate-400 mt-2 mb-10 rounded-md w-full'/>
                {!previewUrl && (
                    <div className='relative mx-auto w-52 h-52 drop-shadow-md rounded-full aspect-square'>
                        <Image src={'/images/profilePictureHolder.jpg'} alt="Profile Picture" layout="fill" style={{objectFit: 'cover'}} className='rounded-full'/>
                    </div>
                )}

                {previewUrl && (
                    <div className='relative mx-auto w-52 h-52 drop-shadow-md rounded-full aspect-square'>
                        <Image src={previewUrl} alt="Preview" layout="fill" style={{objectFit: 'cover'}} className='rounded-full'/>
                    </div>
                )}
            </div>

            {/* About */}
            <div className="w-full mt-4">
                <label htmlFor="about" className="block text-sm font-medium text-raisin_black">
                    <span>About</span>
                </label>
                <Textarea 
                    type="text" 
                    id="about" 
                    value={about} 
                    className={`border border-slate-400 mt-2 p-2 rounded-md w-full`} 
                    placeholder="Tell us about yourself!" 
                    maxLength={100}
                    minLength={1}
                    onChange={(e) => setAbout(e.target.value)} />
            </div>

            {/* Gender */}
            <div className="w-full mt-4">
                <label htmlFor="gender" className="block text-sm font-medium text-raisin_black">
                    <span>Gender</span>
                    <span className="text-red-500"> *</span>
                </label>
                <Select required onValueChange={(value) => setGender(value)} defaultValue="">
                    <SelectTrigger className="border border-slate-400">
                        <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Non-Binary">Non-Binary</SelectItem>
                        <SelectItem value="Prefer not to Say">Prefer Not to Say</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Birthdate */}
            <div className="w-full mt-4">
                <label htmlFor="birthdate" className="block text-sm font-medium text-raisin_black">
                    <span>Birthdate</span>
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
                    value = {birthdate}
                    onChange={(e) => setBirthdate(e.target.value)} />
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse md:flex-row lg:justify-end md:justify-end sm:justify-center gap-4 mt-6">
                <Button onClick={handleSignOut} className="border border-slate-400 bg-snow text-secondary-background hover:bg-background hover:font-bold w-full md:w-20 lg:w-20 xl:w-20 transition-all">
                    Sign out
                </Button>
                <Button type='submit' disabled={submitDisabled} className="hover:opacity-80 w-full md:w-20 lg:w-20 xl:w-20 transition-all">
                    Submit
                </Button>
            </div>
        </form>
      </Card>
    </div>
  )
}


export default WithAuth(SetupPage);