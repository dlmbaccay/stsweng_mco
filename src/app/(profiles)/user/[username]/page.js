"use client"

import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { auth, firestore } from "@/lib/firebase";
import { handleDateFormat } from "@/lib/helper-functions";
import  Loader from "@/components/Loader";
import NavBar from "@/components/nav/navbar";
import CoverPhoto from "@/components/ui/cover-photo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditUserProfile } from "@/components/edit-dialogs/edit-user-profile";
import { CreatePetProfile } from "@/components/profile/create-pet-profile";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import WithAuth from "@/components/WithAuth";
import { FollowButton } from "@/components/profile/follow-user-button";
import { CreatePost } from "@/components/post-components/create-post";
import { PetsContainer } from "@/components/profile/pet-container";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTags } from "@fortawesome/free-solid-svg-icons";
import { PostSnippet } from "@/components/post-components/post-snippet";

function UserProfile() {
    const router = useRouter();
    const urlParams = useParams();
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [ activeTab, setActiveTab ] = useState('posts');
    const [ currentUser, setCurrentUser ] = useState([{}]);

    const [ userPets, setUserPets ] = useState([]);
    const [ userPosts, setUserPosts ] = useState([]);

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
    
    /**
     * This useEffect hook is responsible for fetching and updating the pets of the user whose profile is being viewed.
     * It fetches the pets of the user from the Firestore database and updates the user's pets on the page accordingly.
     * 
     */
    useEffect(() => {
        // Fetch user pets
        if (userData) {

            const fetchUserPets = async () => {
                const response = await fetch(`/api/pets/retrieve-user-pets?uid=${userData.uid}`, {
                    method: 'GET' // Specify GET method
                });
    
                if (response.ok) {
                    const data = await response.json();
                    setUserPets(data.userPets);
                } else {
                    // Assuming the API returns { message: '...' } on error
                    const errorData = await response.json();
                    throw new Error(errorData.message);
                }
            };

            fetchUserPets();
        }
    }, [userData]);

     /**
     * This useEffect hook is responsible for fetching and updating the posts of the user whose profile is being viewed.
     * It fetches the posts of the user from the Firestore database and updates the user's posts on the page accordingly.
     * 
     */
     useEffect(() => {
        // Fetch user posts
        if (userData) {

            const fetchUserPosts = async () => {
                const response = await fetch(`/api/posts/via-authorUsername?username=${userData.username}`, {
                    method: 'GET' // Specify GET method
                });
    
                if (response.ok) {
                    const data = await response.json();
                    setUserPosts(data.postDocs);
                } else {
                    // Assuming the API returns { message: '...' } on error
                    const errorData = await response.json();
                    throw new Error(errorData.message);
                }
            };

            fetchUserPosts();
        }
    }, [userData]);

    return (
        <>
            { loading ? <Loader show={true} /> : ( currentUser && 
                <div className="flex">
                    {/* Navbar */}
                    <div className="min-h-16 w-full z-50 fixed">
                        <NavBar props={{
                            uid : currentUser.uid,
                            username: currentUser.username, 
                            userPhotoURL: currentUser.userPhotoURL,
                            expand_lock: false,
                        }}/>
                    </div>
                    
                    { userData &&
                        <div className="w-full h-screen fixed z-10 mt-16 pb-32 flex flex-col items-center justify-start overflow-y-scroll page-background">
                            {/* Cover Photo */}
                            <div className="h-[30%] xl:w-[60%] 2xl:w-[60%] w-full border-red">
                                {/* <CoverPhoto 
                                    src={userData.coverPhotoURL ? userData.coverPhotoURL : "/images/cover0-image.png"}
                                    alt="cover photo"/> */}
                                <Image
                                    src={userData.coverPhotoURL ? userData.coverPhotoURL : "/images/cover0-image.png"}
                                    alt={"cover photo"}
                                    width={0}
                                    height={0}
                                    sizes="100vw"
                                    className='w-full h-full rounded-b-lg aspect-square object-cover drop-shadow-xl outline-none border-none'
                                />
                            </div>

                            {/* Profile Details */}
                            <div className="flex items-start justify-start xl:w-[60%] 2xl:w-[60%] w-full h-[110px] lg:px-10 px-5">
                                {/* Profile Photo */}
                                <div className="-translate-y-12 flex items-center justify-center w-[20%]">
                                    <Image src={userData.userPhotoURL ? userData.userPhotoURL : "/images/profilePictureHolder.jpg"} alt="user photo" width={175} height={175} className="border-2 border-white dark:border-dark_gray rounded-full aspect-square object-cover drop-shadow-md" />
                                </div>

                                {/* Display Name, Username, Followers, Following */}
                                <div className="flex flex-col gap-2 h-full justify-end w-[60%] ml-4">
                                    {/* Display Name and Username Section */}
                                    <div className="flex flex-col">
                                        <p className="font-semibold text-3xl tracking-wide">{userData.displayName}</p>
                                        <p className=" font-semibold tracking-wide text-muted_blue dark:text-light_yellow">@{userData.username}</p>
                                    </div>

                                    {/* Followers and Following Section */}
                                    <div className="flex flex-row justify-start gap-2 text-sm font-semibold"> 
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
                                        <FollowButton props={{
                                                profileUser_uid: userData.uid,
                                                profileUser_name: userData.username,
                                                currentUser_uid: currentUser.uid,
                                                profileUser_followers: userData.followers,
                                                currentUser_following: currentUser.following
                                        }}/>
                                    )}
                                </div>
                            </div>
                            
                            {/* Main Container */}
                            <div className="flex flex-col xl:flex-row xl:w-[60%] 2xl:w-[60%] w-full px-10 mt-8">

                                {/* About and Details Containers */}
                                <div className="flex flex-col items-start xl:w-[30%] 2xl:w-[30%] w-full gap-6">

                                    <Card className="drop-shadow-md flex flex-col w-full p-6 text-sm rounded-md">
                                        <div className="flex flex-col justify-start gap-4">
                                            <h1 className="tracking-wide font-bold text-lg text-muted_blue dark:text-light_yellow">About</h1>
                                            <p className="tracking-wide break-words">{userData.about}</p>
                                        </div>
                                    </Card>

                                    <Card className="drop-shadow-md flex flex-col w-full p-6 text-sm rounded-md">
                                        <h1 className="tracking-wide font-bold text-lg pb-4 text-muted_blue dark:text-light_yellow">Details</h1>

                                        <div className="flex items-start flex-col gap-2 break-all">
                                            {/* Location */}
                                            <div className="flex items-center justify-center gap-1">
                                                <i className="flex items-center justify-center  w-[20px] fa-solid fa-location-dot "/>
                                                <p className="tracking-wide">{userData.location}</p>
                                            </div>

                                            {/* Gender */}
                                            <div className="flex items-center justify-center gap-1">
                                                <i className="flex items-center justify-center  w-[20px] fa-solid fa-venus-mars" />
                                                <p className="tracking-wide">{userData.gender}</p>
                                            </div>

                                            {/* Birthday */}
                                            <div className="flex items-center justify-center gap-1">
                                                <i className="flex items-center justify-center  w-[20px] fa-solid fa-cake-candles" />
                                                <p className="tracking-wide">{userData.birthdate}</p>
                                            </div>

                                            {/* Phone Number */}
                                            <div className="flex items-center justify-center gap-1">
                                                <i className="flex items-center justify-center  w-[20px] fa-solid fa-phone" />
                                                <p className="tracking-wide">{userData.phoneNumber}</p>
                                            </div>

                                            {/* Email */}
                                            <div className="flex items-center justify-center gap-1">
                                                <i className="flex items-center justify-center  w-[20px] fa-solid fa-envelope" />
                                                <p className="tracking-wide">{userData.email}</p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                                
                                {/* Posts and Pets Containers */}
                                <div className="xl:w-[70%] 2xl:w-[70%] xl:mt-0 2xl:mt-0 mt-8 w-full xl:ml-6 2xl:ml-6">

                                    {/* Tabs */}
                                    <div className="mb-6 flex flex-row font-bold w-full h-[35px] text-sm bg-off_white dark:bg-gray drop-shadow-md rounded-l-sm rounded-r-sm gap-1">
                                        <div
                                            className={`transition-all w-1/2 flex items-center justify-center rounded-l-sm ${activeTab == 'posts' ? "bg-muted_blue dark:bg-light_yellow text-white dark:text-black" : "hover:bg-inherit hover:border-2 hover:border-primary hover:text-primary cursor-pointer transition-all"}`} 
                                            onClick={() => setActiveTab('posts')}
                                        >
                                            Posts
                                        </div>

                                        <div
                                            className={`transition-all w-1/2 flex items-center justify-center rounded-r-sm ${activeTab == 'pets' ? "bg-muted_blue dark:bg-light_yellow text-white dark:text-black" : "hover:bg-inherit hover:border-2 hover:border-primary hover:text-primary cursor-pointer transition-all"}`} 
                                            onClick={() => setActiveTab('pets')}
                                        >
                                            Pets
                                        </div>
                                    </div>

                                    {activeTab == 'posts' ? (
                                        <>
                                            { currentUser.uid === userData.uid ? 
                                                <Card className="drop-shadow-md rounded-sm mb-6">
                                                    <div className="flex flex-row items-center w-full my-2">
                                                        <div className="ml-4">
                                                            <Image src={userData.userPhotoURL == "" ? "/images/profilePictureHolder.jpg" : userData.userPhotoURL} alt="user photo" width={44} height={44} className="rounded-full aspect-square object-cover" />
                                                        </div>
                                                        <div className="w-full mr-4">
                                                            <CreatePost props={{
                                                                uid: userData.uid,
                                                                username: userData.username,
                                                                displayname: userData.displayName,
                                                                userphoto: userData.userPhotoURL,
                                                                pets: userPets,
                                                            }}/>
                                                        </div>
                                                    </div>
                                                </Card> : null
                                            }
                                            <div className="flex flex-col min-w-full items-center justify-center gap-6">
                                                {[...userPosts].reverse().map((post) => {
                                                    return (
                                                        <PostSnippet key={post.postID} post={post} currentUser={currentUser} />
                                                    )
                                                })}
                                            </div>
                                            
                                        </>
                                    ): (
                                        <Card className="p-4 rounded-md drop-shadow-md">
                                            
                                            { userData && userPets && <PetsContainer props={{
                                                uid: userData.uid,
                                                username: userData.username,
                                                displayName: userData.displayName,
                                                location: userData.location,
                                                userPhotoURL: userData.userPhotoURL,
                                                coverPhotoURL: userData.coverPhotoURL,
                                                pets: userPets
                                            }}/>}
                                            
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