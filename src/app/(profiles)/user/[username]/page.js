"use client"

import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { auth, firestore } from "@/lib/firebase";
import { getDocumentByFieldValue } from "@/lib/firestore-crud";
import { ModeToggle } from "@/components/mode-toggle";
import  Loader from "@/components/Loader";
import ExpandedNavBar from "@/components/nav/navbar";
import CoverPhoto from "@/components/ui/cover-photo";
import { Button } from "@/components/ui/button";
import { EditUserProfile } from "@/components/edit-dialogs/edit-user-profile";
import { CreatePetProfile } from "@/components/create-pet-profile";
import { Card } from "@/components/ui/card";
import WithAuth from "@/components/WithAuth";

function UserProfile() {
    const router = useRouter();
    const urlParams = useParams();
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [ activeTab, setActiveTab ] = useState('posts');
    const [ currentUser, setCurrentUser ] = useState([]);

    useEffect(() => {
        setLoading(true); 
    
        // Fetch profile data
        const fetchProfileData = async (username) => {
            const response = await fetch(`/api/users/via-username?username=${username}`, {
                method: 'GET' // Specify GET method
            });

            if (response.ok) {
                const data = await response.json();
                setUserData(data);
            } else {
                // Assuming the API returns { message: '...' } on error
                const errorData = await response.json();
                throw new Error(errorData.message);
            }
        };

        // Fetch signed-in user's data
        const fetchCurrentUser = async (userId) => {
            const response = await fetch(`/api/users/via-id?id=${userId}`, {
                method: 'GET' // Specify GET method
            });
            if (response.ok) {
                const data = await response.json();
                setCurrentUser(data);
            } else {
                // Assuming the API returns { message: '...' } on error
                const errorData = await response.json();
                throw new Error(errorData.message);
            }
        };

        const fetchData = async () => {
            try {
                const user = await auth.currentUser;
                await Promise.all([
                    fetchProfileData(urlParams.username),
                    fetchCurrentUser(user.uid)
                ]);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [urlParams]);

    /**
     * This useEffect hook is responsible for fetching and updating the data of the user whose profile is being viewed.
     * It subscribes to changes in the user's data in the Firestore database and updates the user's data on the page accordingly.
     * The cleanup function is returned to unsubscribe from the Firestore listener when the component unmounts.
     */
    useEffect(() => {
        let unsubscribe;

        if (userData) { // info of the user whose profile is being viewed
            const userRef = firestore.collection('users').doc(userData.uid);
            // Whenever the user's data in the database changes, update the user's data on the page
            unsubscribe = userRef.onSnapshot((doc) => {
                const newData = doc.data();
                // Prevent infinite loop by setting data only when there is a difference
                if (JSON.stringify(newData) !== JSON.stringify(userData)) {
                    setUserData(newData);
                }
            });
        } 

        return () => unsubscribe; // Cleanup function
    }, [userData]);
    
    /**
     * This useEffect hook is responsible for fetching and updating the data of the current user.
     * It subscribes to changes in the current user's data in the Firestore database and updates the current user's data on the page accordingly.
     * The cleanup function is returned to unsubscribe from the Firestore listener when the component unmounts.
     * This is for the viewer of the page.
     */
    useEffect(() => {
        let unsubscribe;
    
        if (currentUser) { // info of the current user
            const userRef = firestore.collection('users').doc(currentUser.uid);
            // Whenever the user's data in the database changes, update the user's data on the page
            unsubscribe = userRef.onSnapshot((doc) => {
                const newData = doc.data();
                // Prevent infinite loop by setting data only when there is a difference
                if (JSON.stringify(newData) !== JSON.stringify(currentUser)) {
                    setCurrentUser(newData);
                }
            });
        } 
    
        return () => unsubscribe; // Cleanup function
    }, [currentUser]);

    return (
        <>
            { loading ? <Loader show={true} /> : ( currentUser && 
                <div className="flex">
                    {/* Side Navbar */}
                    <div className="min-w-20 z-50 fixed">
                        <ExpandedNavBar props={{
                            uid : currentUser.uid,
                            username: currentUser.username, 
                            userPhotoURL: currentUser.userPhotoURL,
                            expand_lock: false,
                        }}/>
                    </div>
                    
                    { userData &&
                        <div className="w-full h-screen fixed z-10 ml-20 flex flex-col items-center justify-start">
                            {/* Cover Photo */}
                            <div className="h-[30%] w-[60%]">
                                <CoverPhoto 
                                    src={userData.coverPhotoURL ? userData.coverPhotoURL : "/images/cover0-image.png"}
                                    alt="cover photo" />
                            </div>

                            {/* Profile Details */}
                            <div className="flex items-start justify-start w-[60%] h-[110px] px-10">
                                {/* Profile Photo */}
                                <div className="-translate-y-12 flex items-center justify-center w-[20%]">
                                    <Image src={userData.userPhotoURL == "" ? "/images/profilePictureHolder.png" : userData.userPhotoURL} alt="user photo" width={175} height={175} className="border-2 rounded-full aspect-square object-cover" />
                                </div>

                                {/* Display Name, Username, Followers, Following */}
                                <div className="flex flex-col gap-2 h-full justify-end w-[60%] ml-4">
                                    {/* Display Name and Username Section */}
                                    <div className="flex flex-col">
                                        <p className="font-semibold text-3xl tracking-wide">{userData.displayName}</p>
                                        <p className="text-sm font-semibold tracking-wide text-muted_blue dark:text-light_yellow">@{userData.username}</p>
                                    </div>

                                    {/* Followers and Following Section */}
                                    <div className="flex flex-row justify-start gap-2 text-xs font-semibold"> 
                                        <div className="flex items-center gap-1"> 
                                            <p>{userData.followers && userData.followers.length}</p>
                                            <p className="dark:text-light_yellow text-muted_blue">Followers</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <p>{userData.following && userData.following.length}</p>
                                            <p className="dark:text-light_yellow text-muted_blue">Following</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Edit Profile / Follow Button */}
                                <div className="flex h-full items-end justify-end w-[20%]">
                                    {currentUser && currentUser.uid === userData.uid ? (
                                        // Edit Button 
                                        // <Button className="mx-auto text-lg dark:bg-light_yellow bg-muted_blue px-6 text-dark_gray mt-6 font-medium">Edit</Button>
                                        <EditUserProfile props={{
                                            uid: userData.uid,
                                            displayName: userData.displayName,
                                            userPhotoURL: userData.userPhotoURL ? userData.userPhotoURL : "",
                                            coverPhotoURL: userData.coverPhotoURL ? userData.coverPhotoURL : "",
                                            about: userData.about,
                                            location: userData.location,
                                            gender: userData.gender,
                                            birthdate: userData.birthdate,
                                            phoneNumber: userData.phoneNumber
                                        }}/>
                                    ):(
                                        // Follow Button 
                                        <Button className="mx-auto text-lg dark:bg-light_yellow bg-muted_blue px-6 text-dark_gray mt-6 font-medium">Follow</Button>
                                    )}
                                </div>
                            </div>
                            
                            {/* Main Container */}
                            <div className="flex w-[60%] px-10 mt-8">

                                {/* About and Details Containers */}
                                <div className="flex flex-col items-start w-[30%] gap-6">
                                    <Card className="drop-shadow-md flex flex-col w-full p-6 text-sm rounded-md">
                                        <div className="flex flex-col justify-start gap-4">
                                            <h1 className="tracking-wide font-bold text-lg text-muted_blue dark:text-light_yellow">About</h1>
                                            <p className="tracking-wide break-words">{userData.about}</p>
                                        </div>
                                    </Card>

                                    <Card className="drop-shadow-md flex flex-col w-full p-6 text-sm rounded-md">
                                        <h1 className="tracking-wide font-bold text-lg pb-4 text-muted_blue dark:text-light_yellow">Details</h1>

                                        <div className="flex items-start flex-col gap-2">
                                            {/* Location */}
                                            <div className="flex items-center justify-center gap-1">
                                                <i className="flex items-center justify-center  w-[20px] fa-solid fa-location-dot "/>
                                                <p className="tracking-wide">{userData.location}</p>
                                            </div>

                                            {/* Gender */}
                                            <div className="flex items-center justify-center gap-1">
                                                <i class="flex items-center justify-center  w-[20px] fa-solid fa-venus-mars" />
                                                <p className="tracking-wide">{userData.gender}</p>
                                            </div>

                                            {/* Birthday */}
                                            <div className="flex items-center justify-center gap-1">
                                                <i class="flex items-center justify-center  w-[20px] fa-solid fa-cake-candles" />
                                                <p className="tracking-wide">{userData.birthdate}</p>
                                            </div>

                                            {/* Phone Number */}
                                            <div className="flex items-center justify-center gap-1">
                                                <i class="flex items-center justify-center  w-[20px] fa-solid fa-phone" />
                                                <p className="tracking-wide">{userData.phoneNumber}</p>
                                            </div>

                                            {/* Email */}
                                            <div className="flex items-center justify-center gap-1">
                                                <i class="flex items-center justify-center  w-[20px] fa-solid fa-envelope" />
                                                <p className="tracking-wide">{userData.email}</p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                                
                                {/* Posts and Pets Containers */}
                                <div className="w-[70%] ml-6">

                                    {/* Tabs */}
                                    <div className="mb-6 flex flex-row font-bold w-full h-[35px] text-sm bg-off_white dark:bg-gray drop-shadow-md rounded-l-sm rounded-r-sm">
                                        <div
                                            className={`transition-all w-1/2 flex items-center justify-center rounded-l-sm ${activeTab == 'posts' ? "bg-muted_blue dark:bg-light_yellow text-white dark:text-black" : "hover:bg-light_yellow dark:hover:bg-muted_blue cursor-pointer"}`} 
                                            onClick={() => setActiveTab('posts')}
                                        >
                                            Posts
                                        </div>

                                        <div
                                            className={`transition-all w-1/2 flex items-center justify-center rounded-r-sm ${activeTab == 'pets' ? "bg-muted_blue dark:bg-light_yellow text-white dark:text-black" : "hover:bg-light_yellow dark:hover:bg-muted_blue cursor-pointer"}`} 
                                            onClick={() => setActiveTab('pets')}
                                        >
                                            Pets
                                        </div>
                                    </div>

                                    {activeTab == 'posts' ? (
                                        <Card className="text-sm p-4 drop-shadow-md rounded-sm">
                                            <p>Posts Container</p>
                                        </Card>
                                    ): (
                                        <Card className="text-sm p-4 drop-shadow-md rounded-sm">
                                            <p className="mb-4">Pets Container</p>

                                            <CreatePetProfile props={{
                                                uid: userData.uid,
                                                username: userData.username,
                                                displayName: userData.displayName,
                                                location: userData.location,
                                            }}/>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </div> 
                    }
                </div>
            ) }
        </>
    )
}   

export default WithAuth(UserProfile);