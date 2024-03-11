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

    fetchData();
  }, [urlParams.petID]);

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
                <div className="w-full h-screen fixed z-10 mt-16 flex flex-col items-center justify-start overflow-y-auto">
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
                              <p className="text-base font-semibold tracking-wide text-muted_blue dark:text-light_yellow italic">
                                <span 
                                  onClick={() => router.push(`/user/${petData.petOwnerUsername}`)}
                                  className="text-black  dark:text-white mr-1 hover:text-muted_blue dark:hover:text-light_yellow transition-all cursor-pointer">
                                  @{petData.petOwnerUsername}&apos;s
                                </span>
                                <span className="">
                                  {petData.petBreed}
                                </span>
                              </p>
                          </div>

                          {/* Followers and Following Section */}
                          <div className="flex flex-row justify-start gap-2 text-sm font-semibold"> 
                            <div className="flex items-center gap-1">
                                <p>{ petData.following && petData.following.length ? '' : 0 }</p>
                                <p className="dark:text-light_yellow text-muted_blue">Following</p>
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
                          <Button className="px-3 h-[35px] gap-2 flex items-center justify-center">
                              Follow
                          </Button>
                      }
                      </div>
                  </div>

                  {/* Main Container */}
                  <div className="flex flex-col xl:flex-row xl:w-[60%] 2xl:w-[60%] w-full px-10 mt-8">
                    {/* About and Details Containers */}
                    <div className="flex flex-col items-start xl:w-[30%] 2xl:w-[30%] w-full gap-6">
                        <Card className="drop-shadow-md flex flex-col w-full p-6 text-sm rounded-md">
                            <div className="flex flex-col justify-start gap-4">
                                <h1 className="tracking-wide font-bold text-lg text-muted_blue dark:text-light_yellow">About</h1>
                                <p className="tracking-wide break-words">{petData.petAbout}</p>
                            </div>
                        </Card>

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
                          <Card className="text-sm p-4 drop-shadow-md rounded-sm">
                            <p>Tagged Posts Container</p>
                          </Card>
                        ): (
                          <Card className="text-sm p-4 drop-shadow-md rounded-sm">
                            <p>Milestones Container</p>
                          </Card>
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