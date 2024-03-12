"use client"

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket, faBell, faCircleStop, faHandHoldingHeart, faHouse, faPaw, faRightFromBracket, faUser, faBars, faUserGear} from "@fortawesome/free-solid-svg-icons";
import { auth } from "@/lib/firebase";
import { ModeToggle } from "../mode-toggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"


export default function NavBar({props}) {
    const router = useRouter();
    const { uid, username, userPhotoURL, expand_lock } = props;
    const [isExpanded, setIsExpanded] = useState(false);
    const activeTab = usePathname();
    
    const navRef = useRef(null);

    const handleSignOut = () => {
        auth.signOut().then(() => {
            router.push('/landing');
            toast.success('Signed out');
            console.log('Signed out');
        })
    }

    return (
        <>
            <div ref={navRef} className={`h-16 w-full px-4 grid grid-cols-3 justify-between bg-white dark:bg-dark_gray drop-shadow-lg pb-0.5`}>
                <>
                {/* user meta */}
                <div className="flex flex-row items-center justify-start">
                    <button 
                        onClick={() => { router.push(`/user/${username}`)}}
                        className='group flex flex-row justify-center items-center gap-4'>
                            {<Image src={'/images/logo.png'} alt={'profile picture'} width={44} height={44} className='rounded-full aspect-square object-cover'/>}
                    </button>
                    <div className="flex flex-row items-center justify-center gap-4">
                        <ModeToggle></ModeToggle>
                    </div>
                </div>
                
                
                <div className="flex flex-row items-center justify-center">
                    
                    {/* Desktop View */}
                    <div className={`hidden md:flex flex-row h-full gap-4 md:gap-8 lg:gap-12`}>
                
                        
                        {/* Home Button */}
                        <button 
                            onClick={() => router.push('/home')} className={`px-8 transition-all duration-300 flex flex-row items-center gap-3 ${activeTab === '/home' ? 'border-b-[3px] border-primary' : ''}`}>
                            <div className="rounded-full">
                                <FontAwesomeIcon icon={faHouse} className={`w-6 h-6 ${activeTab === '/home' ? 'text-primary' : 'text-white dark:text-dark_gray stroke-[50px] stroke-primary'}`}></FontAwesomeIcon>
                            </div>
                        </button>

                        {/* Pet Tracker Button */}
                        <button 
                            onClick={() => router.push('/pet-tracker')} className={`px-8 transition-all duration-300 flex flex-row items-center gap-3 ${activeTab === '/pet-tracker' ? 'border-b-[3px] border-primary' : ''}`}>
                            <div className="rounded-full">
                                <FontAwesomeIcon icon={faPaw} className={`w-6 h-6 ${activeTab === '/pet-tracker' ? 'text-primary' : 'text-white dark:text-dark_gray stroke-[50px] stroke-primary'}`}></FontAwesomeIcon>
                            </div>
                        </button>

                        

                        {/* Profile Button */}
                        <button 
                            onClick={() => router.push('/user/'+username)} className={`px-8 transition-all duration-300 flex flex-row items-center gap-3 ${activeTab === '/user/'+username ? 'border-b-[3px] border-primary' : ''}`}>
                            <div className="rounded-full">
                                <FontAwesomeIcon icon={faUser} className={`w-6 h-6 ${activeTab === '/user/'+username ? 'text-primary' : 'text-white dark:text-dark_gray stroke-[50px] stroke-primary'}`}></FontAwesomeIcon>
                            </div>
                            {/* {isExpanded && <span className="text-muted_blue dark:text-light_yellow font-semibold tracking-wider">Profile</span>} */}
                        </button>

                        {/* Adoption Button */}
                        <button 
                            onClick={() => router.push('/adopt')} className={`px-8 transition-all duration-300 flex flex-row items-center gap-3 ${activeTab === '/adopt' ? 'border-b-[3px] border-primary' : ''}`}>
                            <div className="rounded-full">
                                <FontAwesomeIcon icon={faHandHoldingHeart} className={`w-6 h-6 ${activeTab === '/adopt' ? 'text-primary' : 'text-white dark:text-dark_gray stroke-[50px] stroke-primary'}`}></FontAwesomeIcon>
                            </div>
                            {/* {isExpanded && <span className="text-muted_blue dark:text-light_yellow font-semibold tracking-wider">Settings</span>} */}
                        </button>
                    </div>

                </div>

                {/* Right End of Navbar */}
                <div className="flex flex-row items-center justify-end">
                    {/* Mobile View */}
                    <div className={`flex md:hidden flex-row h-full`}>
                
                        
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <FontAwesomeIcon icon={faBars} className="w-6 h-6 text-primary" />
                                </DropdownMenuTrigger>
                                
                                <DropdownMenuContent className="text-lg p-4 pt-2">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col">
                                            Menu
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-secondary"/>
                                    <DropdownMenuItem className="mt-2 focus:bg-inherit focus:border-b-2 focus:border-primary focus:rounded-none mx-2">
                                        <button onClick={() => router.push('/home')} className="transition-all duration-300 flex flex-row items-center gap-3">
                                            <FontAwesomeIcon icon={faHouse} className={`w-6 h-6 ${activeTab === '/home' ? 'text-primary' : 'text-white dark:text-dark_gray stroke-[50px] stroke-primary'}`}/>
                                            <span className="text-primary font-semibold tracking-wider">Home</span>
                                        </button>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="mt-2 focus:bg-inherit focus:border-b-2 focus:border-primary focus:rounded-none mx-2">
                                        <button onClick={() => router.push('/pet-tracker')} className="transition-all duration-300 flex flex-row items-center gap-3">
                                            <FontAwesomeIcon icon={faPaw} className={`w-6 h-6 ${activeTab === '/pet-tracker' ? 'text-primary' : 'text-white dark:text-dark_gray stroke-[50px] stroke-primary'}`}/>
                                            <span className="text-primary font-semibold tracking-wider">Pet Tracker</span>
                                        </button>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="mt-2 focus:bg-inherit focus:border-b-2 focus:border-primary focus:rounded-none mx-2">
                                        <button onClick={() => router.push(`/user/${username}`)} className="transition-all duration-300 flex flex-row items-center gap-3">
                                            <FontAwesomeIcon icon={faUser} className={`w-6 h-6 ${activeTab === '/user/'+username ? 'text-primary' : 'text-white dark:text-dark_gray stroke-[50px] stroke-primary'}`}/>
                                            <span className="text-primary font-semibold tracking-wider">Profile</span>
                                        </button>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="mt-2 focus:bg-inherit focus:border-b-2 focus:border-primary focus:rounded-none mx-2">
                                        <button onClick={() => router.push('/adopt')} className="transition-all duration-300 flex flex-row items-center gap-3">
                                            <FontAwesomeIcon icon={faHandHoldingHeart} className={`w-6 h-6 ${activeTab === '/adopt' ? 'text-primary' : 'text-white dark:text-dark_gray stroke-[50px] stroke-primary'}`}/>
                                            <span className="text-primary font-semibold tracking-wider">Adoption</span>
                                        </button>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                    </div>
                    {/* Notifications Button */}
                    <button 
                        onClick={() => router.push('/pet-tracker')} className={`px-6 transition-all duration-300 flex flex-row items-center gap-3`}>
                        <div className="rounded-full">
                            <FontAwesomeIcon icon={faBell} className="w-6 h-6 text-muted_blue dark:text-light_yellow"></FontAwesomeIcon>
                        </div>
                    </button>
                    {/* Profile Dropdown Button */}
                    <DropdownMenu>
                        <DropdownMenuTrigger><Image src={userPhotoURL ? userPhotoURL : "/images/profilePictureHolder.jpg"} alt={'profile picture'} width={44} height={44} className='rounded-full aspect-square object-cover'/></DropdownMenuTrigger>
                        <DropdownMenuContent className="mr-2 p-4 pt-2">
                            <DropdownMenuLabel>
                                <div className="flex flex-col">
                                    My Account
                                    <span className="text-xs">@{username}</span>
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator className="bg-secondary"/>
                            
                            <DropdownMenuItem className="focus:bg-inherit focus:border-b-2 focus:border-primary focus:rounded-none mx-2">
                                {/* Profile Button */}
                                <button 
                                    onClick={() => router.push('/user/'+username)} className={`transition-all duration-300 flex flex-row items-center gap-3`}>
                                    <div className="p-1.5 rounded-full">
                                        <FontAwesomeIcon icon={faUser} className="w-6 h-6 text-primary"></FontAwesomeIcon>
                                    </div>
                                    <span className="text-primary font-semibold tracking-wider">View Profile</span>
                                </button>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-inherit focus:border-b-2 focus:border-primary focus:rounded-none mx-2">
                                {/* Settings Button */}
                                <button 
                                    onClick={() => router.push('/settings')} className={`transition-all duration-300 flex flex-row items-center gap-3`}>
                                    <div className="p-1.5 rounded-full">
                                        <FontAwesomeIcon icon={faUserGear} className="w-6 h-6 text-primary"></FontAwesomeIcon>
                                    </div>
                                    <span className="text-primary font-semibold tracking-wider">Settings</span>
                                </button>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-secondary"/>
                            <DropdownMenuItem className="focus:bg-inherit focus:border-b-2 focus:border-primary focus:rounded-none mx-2">
                                <button onClick={() => handleSignOut()} className={` transition-all duration-300 flex flex-row items-center gap-3`}>
                                    <div className="p-1.5 rounded-full">
                                        <FontAwesomeIcon icon={faArrowRightFromBracket} className="w-6 h-6 text-primary"></FontAwesomeIcon>
                                    </div>
                                    <span className="text-primary font-semibold whitespace-nowrap">Log Out</span>
                                </button>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    
                </div>
                </>
                
            </div>
            
            
        
        </>
    )
}
