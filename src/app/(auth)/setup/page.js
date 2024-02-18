"use client"

import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { auth, firestore, storage } from "@/lib/firebase";
import { checkDisplayName, checkLocation, checkUsername } from "@/lib/formats";
import { isUsernameTaken} from "@/lib/crud";
import { handleFilePreview } from "@/lib/helper-functions";
import { ModeToggle } from "@/components/mode-toggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import WithAuth from "@/components/WithAuth";
import { Card, CardHeader } from "@/components/ui/card";


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
    }, [router, user]);

    const handleFileChange = (event) => {
        var temp = handleFilePreview(event.target.files[0]);
        if (temp == null) {
            setUserPhoto('');
            setPreviewUrl('/images/profilePictureHolder.jpg');
        } else {
            setUserPhoto(temp[0]);
            setPreviewUrl(temp[1]);
        }
        
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        let usernameTaken = await isUsernameTaken(username);

        if (usernameTaken){
            toast.error('Username is already taken!');
            return;
        }
    
        try {
            setSubmitDisabled(true);
            toast.loading('Setting up your account...');
    
            const storagePath = `userProfile/${user.uid}/profilePic`;
            const storageRef = storage.ref().child(storagePath);
    
            if (userPhoto) {
                await uploadUserPhoto(storageRef);
            }
    
            await saveUserData();
    
            toast.success(`Welcome to BantayBuddy, ${username}!`);
            router.push(`/user/${username}`);
        } catch (error) {
            toast.error('An error occurred while setting up your account.');
            console.error(error);
        } finally {
            setSubmitDisabled(false);
            toast.dismiss();
        }
    };
    
    const uploadUserPhoto = async (storageRef) => {
        const uploadTask = storageRef.put(userPhoto);
    
        await new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    // Handle progress updates here
                    const progress = Math.round(
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    );
                    // Update progress state if needed
                },
                (error) => {
                    // Handle error here
                    reject(error);
                },
                () => {
                    // Handle successful upload here
                    toast.success('Photo uploaded successfully!');
                    resolve();
                }
            );
        });
    };
    
    const saveUserData = async () => {
        const userDoc = firestore.doc(`users/${user.uid}`);
        const batch = firestore.batch();
    
        batch.set(userDoc, {
            username: username,
            displayName: displayName,
            userPhotoURL: userPhoto ? await getUserPhotoURL() : "",
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
        });
    
        await batch.commit();
    };
    
    const getUserPhotoURL = async () => {
        const storagePath = `userProfile/${user.uid}/profilePic`;
        const storageRef = storage.ref().child(storagePath);
        return await storageRef.getDownloadURL();
    };
    


  return (
    <div className="flex items-center justify-center md:mt-16 md:mb-16 w-full md:pl-16 md:pr-16">
      <Card className="h-full outline justify-center items-center flex w-full">
        <form onSubmit={handleSubmit} className="bg-snow md:rounded-md p-8 w-full md:w-[800px] h-full md:h-fit flex flex-col overflow-y-scroll md:overflow-hidden">

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
                        <SelectItem value="Non-Binary">Prefer Not to Say</SelectItem>
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