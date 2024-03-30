"use client"

import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { auth, firestore } from "@/lib/firebase";
import  Loader from "@/components/Loader";
import NavBar from "@/components/nav/navbar";
import CoverPhoto from "@/components/ui/cover-photo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditUserProfile } from "@/components/edit-dialogs/edit-user-profile";
import { CreatePetProfile } from "@/components/profile/create-pet-profile";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { EditPetProfile } from "@/components/edit-dialogs/edit-pet-profile";
import { DeletePetProfile } from "@/components/profile/delete-pet-profile";
import WithAuth from "@/components/WithAuth";
import { FollowButton } from "@/components/profile/follow-user-button";
import { CreatePost } from "@/components/post-components/create-post";
import { PetsContainer } from "@/components/profile/pet-container";
import { set } from "date-fns";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FollowPetButton } from "@/components/profile/follow-pet-button";

import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  startAfter,
  getDocs,
  where,
} from "firebase/firestore";

import { PostSnippet } from "@/components/post-components/post-snippet";
import { RepostSnippet } from "@/components/post-components/repost-snippet";

function PetProfile() {

  const router = useRouter();
  const urlParams = useParams();

  const [ petData, setPetData ] = useState(null);

  const [ loading, setLoading ] = useState(false);
  const [ activeTab, setActiveTab ] = useState("tagged posts"); // tagged posts and milestones

  const [ currentUser, setCurrentUser ] = useState(null); 

  const [ showMisc, setShowMisc ] = useState(false);

  useEffect(() => {
    // get current user using auth and firestore
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        firestore.collection('users').doc(user.uid).get().then((doc) => {
          if (doc.exists) {
            setCurrentUser(doc.data());
          } else {
            console.log('No such document!');
          }
        }).catch((error) => {
          console.log('Error getting document:', error);
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      unsubscribe();
    }
  }, []);


  const [ fetchedTaggedPosts, setFetchedTaggedPosts ] = useState([]);
  const [ fetchedTaggedPostsLoaded, setFetchedTaggedPostsLoaded ] = useState(false);
  const [ fetchedTaggedPostsLastVisible, setFetchedTaggedPostsLastVisible ] = useState(null);
  const [ fetchedTaggedPostsLoading, setFetchedTaggedPostsLoading ] = useState(false);

  const [ fetchedMilestones, setFetchedMilestones ] = useState([]);
  const [ fetchedMilestonesLoaded, setFetchedMilestonesLoaded ] = useState(false);
  const [ fetchedMilestonesLastVisible, setFetchedMilestonesLastVisible ] = useState(null);
  const [ fetchedMilestonesLoading, setFetchedMilestonesLoading ] = useState(false);

  /**
   * Fetch pet data
   */
  useEffect(() => {
    setLoading(true);

    // Fetch profile data
    const fetchProfileData = async (petID) => {
        const response = await fetch(`/api/pets/via-id?id=${petID}`, {
            method: 'GET' // Specify GET method
        });

        if (response.ok) {
            const data = await response.json();
            setPetData(data);
        } else {
            // Assuming the API returns { message: '...' } on error
            toast.error('Pet not found')
            const errorData = await response.json();
            throw new Error(errorData.message);
        }
    };

    const fetchData = async () => {
        try {
          await Promise.all([
            fetchProfileData(urlParams.petID),
          ]);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
    };

    const fetchTaggedPosts = async () => {
      const taggedPosts = [];
      const milestones = [];

      // fetch tagged posts
      const taggedPostsQuery = query(
        collection(firestore, 'posts'), 
        where('petIDs', 'array-contains', urlParams.petID)
      );

      const taggedPostsSnapshot = await getDocs(taggedPostsQuery);
      taggedPostsSnapshot.forEach((doc) => {
        taggedPosts.push(doc.data());
      });

      setFetchedTaggedPosts(taggedPosts);
      setFetchedTaggedPostsLastVisible(taggedPostsSnapshot.docs[taggedPostsSnapshot.docs.length - 1]);
      setFetchedTaggedPostsLoaded(true);

      // fetch milestones
      const milestonesQuery = query(
        collection(firestore, 'posts'), 
        where('petIDs', 'array-contains', urlParams.petID),
        where('category', '==', 'Milestones')
      );
      const milestonesSnapshot = await getDocs(milestonesQuery);
      milestonesSnapshot.forEach((doc) => {
        milestones.push(doc.data());
      });

      setFetchedMilestones(milestones);
      setFetchedMilestonesLastVisible(milestonesSnapshot.docs[milestonesSnapshot.docs.length - 1]);
      setFetchedMilestonesLoaded(true);

      // setFetchedTaggedPosts(taggedPosts);
      // setFetchedMilestones(milestones);
    }

    fetchData();
    fetchTaggedPosts();

  }, [urlParams.petID]);

  // const fetchMoreUserPosts = async () => {
  //       if (userPostsLastVisible) {
  //           setUserPostsLoading(true);
  //           const response = await firestore.collection('posts').where('authorID', '==', userData.uid).startAfter(userPostsLastVisible).get();
  //           const postDocs = response.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  //           setUserPosts([...userPosts, ...postDocs]);
  //           setUserPostsLastVisible(response.docs[response.docs.length - 1]);
  //           setUserPostsLoading(false);
  //       }
  //   }

  const fetchMoreTaggedPosts = async () => {
    if (fetchedTaggedPostsLastVisible) {
      setFetchedTaggedPostsLoading(true);
      const response = await firestore.collection('posts').where('petIDs', 'array-contains', urlParams.petID).startAfter(fetchedTaggedPostsLastVisible).get();
      const postDocs = response.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFetchedTaggedPosts([...fetchedTaggedPosts, ...postDocs]);
      setFetchedTaggedPostsLastVisible(response.docs[response.docs.length - 1]);
      setFetchedTaggedPostsLoading(false);
    }
  }
  // const refreshUserPosts = async () => {
  //       setUserPostsLoading(true);
  //       const response = await firestore.collection('posts').where('authorID', '==', userData.uid).get();
  //       const postDocs = response.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  //       setUserPosts(postDocs);
  //       setUserPostsLastVisible(response.docs[response.docs.length - 1]);
  //       setUserPostsLoading(false);
  //   }

  const refreshTaggedPosts = async () => {
    setFetchedTaggedPostsLoading(true);
    const response = await firestore.collection('posts').where('petIDs', 'array-contains', urlParams.petID).get();
    const postDocs = response.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setFetchedTaggedPosts(postDocs);
    setFetchedTaggedPostsLastVisible(response.docs[response.docs.length - 1]);
    setFetchedTaggedPostsLoading(false);
  }

  const fetchMoreMilestones = async () => {
    if (fetchedMilestonesLastVisible) {
      setFetchedMilestonesLoading(true);
      const response = await firestore.collection('posts').where('petIDs', 'array-contains', urlParams.petID).where('category', '==', 'Milestones').startAfter(fetchedMilestonesLastVisible).get();
      const postDocs = response.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFetchedMilestones([...fetchedMilestones, ...postDocs]);
      setFetchedMilestonesLastVisible(response.docs[response.docs.length - 1]);
      setFetchedMilestonesLoading(false);
    }
  }

  const refreshMilestones = async () => {
    setFetchedMilestonesLoading(true);
    const response = await firestore.collection('posts').where('petIDs', 'array-contains', urlParams.petID).where('category', '==', 'Milestones').get();
    const postDocs = response.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setFetchedMilestones(postDocs);
    setFetchedMilestonesLastVisible(response.docs[response.docs.length - 1]);
    setFetchedMilestonesLoading(false);
  }

  return (
    <>
      { loading ? <Loader show={true} /> : ( currentUser && 
          <div className="flex">
              {/* Side Navbar */}
              <div className="min-h-16 w-full z-50 fixed">
                  <NavBar props={{
                      uid : currentUser.uid,
                      username: currentUser.username, 
                      userPhotoURL: currentUser.userPhotoURL,
                      expand_lock: false,
                  }}/>
              </div>

              { petData && 
                <div className="w-full h-screen z-10 mt-16 pb-32 flex flex-col items-center justify-start">
                  {/* Cover Photo */}
                  <div className="h-[30%] xl:w-[60%] 2xl:w-[60%] w-full border-red">
                      <CoverPhoto 
                          src={petData.petOwnerCoverPhotoURL ? petData.petOwnerCoverPhotoURL : "/images/cover0-image.png"}
                          alt="cover photo"
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
                          <Image src={petData.petPhotoURL == "" ? "/images/petPictureHolder.jpg" : petData.petPhotoURL} alt="pet photo" width={175} height={175} className="border-2 border-white dark:border-dark_gray rounded-full aspect-square object-cover drop-shadow-md" />
                      </div>

                      {/* Display Name, Username, Followers, Following */}
                      <div className="flex flex-col gap-2 h-full justify-end w-[60%] ml-4">
                          {/* Display Name and Username Section */}
                          <div className="flex flex-col">
                              <p className="font-semibold text-3xl tracking-wide">{petData.petName}</p>
                              <p className="font-semibold tracking-wide italic">
                                <span className="text-secondary">@</span>
                                <span 
                                  onClick={() => router.push(`/user/${petData.petOwnerUsername}`)}
                                  className="text-secondary mr-1 hover:text-primary transition-all cursor-pointer">
                                  {petData.petOwnerUsername}<span className="text-secondary">&apos;s</span>
                                </span>
                                
                                <span className="text-secondary">
                                  {petData.petBreed}
                                </span>
                              </p>
                          </div>

                          {/* Followers and Following Section */}
                          <div className="flex flex-row justify-start gap-2 text-sm font-semibold"> 
                            <div className="flex items-center gap-1">
                                <p>{ petData.followers && petData.followers.length ? petData.followers.length : 0 }</p>
                                <p className="dark:text-light_yellow text-muted_blue">Followers</p>
                            </div>
                          </div>
                      </div>
                      
                      {/* Edit Pet Profile / Follow Button */}
                      <div className="flex h-full items-end justify-end w-[20%]">
                        { currentUser.uid == petData.petOwnerID ?
                          <div className="flex items-center justify-end gap-4">
                            <EditPetProfile props={{ 
                              petData: petData,
                              currentUser: currentUser,
                            }} />

                            <DropdownMenu>
                              <DropdownMenuTrigger className="flex items-center justify-center w-[35px] h-[35px] bg-muted_blue text-white dark:text-black dark:bg-light_yellow rounded-md hover:opacity-90 cursor-pointer">
                                { showMisc ? 
                                  <i className="fa-solid fa-ellipsis" onClick={() => setShowMisc(false)} />
                                  :
                                  <i className="fa-solid fa-ellipsis" onClick={() => setShowMisc(true)} />  
                                }
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Pet Account Settings</DropdownMenuLabel>
                                <DeletePetProfile props={{
                                  petData: petData,
                                  currentUser: currentUser,
                                }} />
                              </DropdownMenuContent>
                            </DropdownMenu>

                            
                          </div>  
                          :
                          // <FollowButton props={{ currentUser: currentUser, petData: petData }} />
                          <FollowPetButton props={{
                            pet: petData,
                            currentUser_uid: currentUser.uid,
                            currentUser_following: currentUser.following,
                          }}/>
                      }
                      </div>
                  </div>

                  {/* Main Container */}
                  <div className="flex flex-col xl:flex-row xl:w-[60%] 2xl:w-[60%] w-full px-10 mt-8">
                    {/* About and Details Containers */}
                    <div className="flex flex-col items-start xl:w-[30%] 2xl:w-[30%] w-full gap-6">
                      { petData.about &&
                        <Card className="drop-shadow-md flex flex-col w-full p-6 text-sm rounded-md">
                            <div className="flex flex-col justify-start gap-4">
                                <h1 className="tracking-wide font-bold text-lg text-muted_blue dark:text-light_yellow">About</h1>
                                <p className="tracking-wide break-words">{petData.petAbout}</p>
                            </div>
                        </Card>
                      }

                        <Card className="drop-shadow-md flex flex-col w-full p-6 text-sm rounded-md">
                            <h1 className="tracking-wide font-bold text-lg pb-4 text-muted_blue dark:text-light_yellow">Details</h1>

                            <div className="flex items-start flex-col gap-2 break-all">
                                {/* Location */}
                                <div className="flex items-center justify-center gap-1">
                                    <i className="flex items-center justify-center  w-[20px] fa-solid fa-location-dot "/>
                                    <p className="tracking-wide">{petData.petBirthplace}</p>
                                </div>

                                {/* Sex */}
                                <div className="flex items-center justify-center gap-1">
                                    <i class="flex items-center justify-center  w-[20px] fa-solid fa-venus-mars" />
                                    <p className="tracking-wide">{petData.petSex}</p>
                                </div>

                                {/* Birthday */}
                                <div className="flex items-center justify-center gap-1">
                                    <i class="flex items-center justify-center  w-[20px] fa-solid fa-cake-candles" />
                                    <p className="tracking-wide">{petData.petBirthdate}</p>
                                </div>

                                {/* Favorite Food */}
                                <div className="flex items-center justify-center gap-1">
                                    <i class="flex items-center justify-center  w-[20px] fa-solid fa-utensils" />
                                    <p className="tracking-wide">{petData.petFavoriteFood}</p>
                                </div>

                                {/* Hobbies */}
                                <div className="flex items-center justify-center gap-1">
                                    <i class="flex items-center justify-center  w-[20px] fa-solid fa-water-ladder" />
                                    <p className="tracking-wide">{petData.petHobbies}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Posts and Pets Containers */}
                    <div className="xl:w-[70%] 2xl:w-[70%] xl:mt-0 2xl:mt-0 mt-8 w-full xl:ml-6 2xl:ml-6">

                        {/* Tabs */}
                        <div className="mb-6 flex flex-row font-bold w-full h-[35px] text-sm bg-off_white dark:bg-gray drop-shadow-md rounded-l-sm rounded-r-sm gap-1">
                            <div
                                className={`transition-all w-1/2 flex items-center justify-center rounded-l-sm ${activeTab == 'tagged posts' ? "bg-muted_blue dark:bg-light_yellow text-white dark:text-black" : "hover:bg-inherit hover:border-2 hover:border-primary hover:text-primary cursor-pointer transition-all"}`} 
                                onClick={() => setActiveTab('tagged posts')}
                            >
                                Tagged Posts
                            </div>

                            <div
                                className={`transition-all w-1/2 flex items-center justify-center rounded-r-sm ${activeTab == 'milestones' ? "bg-muted_blue dark:bg-light_yellow text-white dark:text-black" : "hover:bg-inherit hover:border-2 hover:border-primary hover:text-primary cursor-pointer transition-all"}`} 
                                onClick={() => setActiveTab('milestones')}
                            >
                                Milestones
                            </div>
                        </div>

                        {activeTab == 'tagged posts' ? (
                          <div className="flex flex-col min-w-full items-center justify-center gap-6">
                            {fetchedTaggedPosts.map((post) => {
                                return (
                                    (post.postType == 'Original' ?
                                        <PostSnippet key={post.postID} post={post} currentUser={currentUser} />
                                    
                                    : post.postType == 'Repost' ?
                                        <RepostSnippet key={post.postID} post={post} currentUser={currentUser} />
                                    : null)
                                )
                            })}

                            {fetchedTaggedPostsLoaded ? (
                                <button
                                    className={`font-semibold px-4 py-2 dark:bg-light_yellow dark:text-black bg-muted_blue text-off_white rounded-lg text-sm hover:opacity-80 transition-all mb-20 ${fetchedTaggedPostsLoading ? 'hidden' : 'flex'}`}
                                    onClick={refreshTaggedPosts}
                                >
                                    Refresh Posts
                                </button>
                            ) : (
                                <button
                                    className={`font-semibold px-4 py-2 dark:bg-light_yellow dark:text-black bg-muted_blue text-off_white rounded-lg text-sm hover:opacity-80 transition-all mb-20 ${fetchedTaggedPostsLoading ? 'hidden' : 'flex'}`}
                                    onClick={fetchMoreTaggedPosts}
                                    disabled={fetchedTaggedPostsLoading}
                                >
                                    Load More
                                </button>
                            )}

                            {fetchedTaggedPostsLoading && <div className="mb-20 flex items-center justify-center">Loading...</div>}
                          </div>
                        ) : (
                          <div className="flex flex-col min-w-full items-center justify-center gap-6">
                            {fetchedMilestones.map((post) => {
                                return (
                                    (post.postType == 'Original' ?
                                        <PostSnippet key={post.postID} post={post} currentUser={currentUser} />
                                    
                                    : post.postType == 'Repost' ?
                                        <RepostSnippet key={post.postID} post={post} currentUser={currentUser} />
                                    : null)
                                )
                            })}

                            {fetchedMilestonesLoaded ? (
                                <button
                                    className={`font-semibold px-4 py-2 dark:bg-light_yellow dark:text-black bg-muted_blue text-off_white rounded-lg text-sm hover:opacity-80 transition-all mb-20 ${fetchedMilestonesLoading ? 'hidden' : 'flex'}`}
                                    onClick={refreshMilestones}
                                >
                                    Refresh Milestones
                                </button>
                            ) : (
                                <button
                                    className={`font-semibold px-4 py-2 dark:bg-light_yellow dark:text-black bg-muted_blue text-off_white rounded-lg text-sm hover:opacity-80 transition-all mb-20 ${fetchedMilestonesLoading ? 'hidden' : 'flex'}`}
                                    onClick={fetchMoreMilestones}
                                    disabled={fetchedMilestonesLoading}
                                >
                                    Load More
                                </button>
                            )}

                            {fetchedMilestonesLoading && <div className="mb-20 flex items-center justify-center">Loading...</div>}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              }
          </div>
      )}
    </>
  )
}

export default WithAuth(PetProfile)