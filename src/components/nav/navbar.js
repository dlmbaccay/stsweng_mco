"use client"

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket, faBell, faCircleStop, faHandHoldingHeart, faHouse, faPaw, faRightFromBracket, faUser, faUserGear} from "@fortawesome/free-solid-svg-icons";
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
            <div ref={navRef} className={`h-16 w-full px-4 border-b-2 border-slate-400 grid grid-cols-3 justify-between bg-white dark:bg-dark_gray `}>
                <>
                {/* user meta */}
                <div className="flex flex-row items-center">
                    <button 
                        onClick={() => { router.push(`/user/${username}`)}}
                        className='group flex flex-row justify-center items-center gap-4'>
                            {<Image src={'/images/logo.png'} alt={'profile picture'} width={44} height={44} className='rounded-full aspect-square object-cover'/>}
                    </button>
                    <div className="flex flex-row items-center justify-center gap-4">
                        <ModeToggle></ModeToggle>
                    </div>
                </div>
                
                <div className="flex flex-row items-center mx-auto">
                    <div className={`flex flex-row h-full gap-2 lg:gap-4 xl:gap-14 2xl:gap-14`}>
                        
                        {/* Home Button */}
                        <button 
                            onClick={() => router.push('/home')} className={`px-4 transition-all duration-300 flex flex-row items-center gap-3 ${activeTab === '/home' ? 'border-b-2 border-muted_blue dark:border-light_yellow' : ''}`}>
                            <div className="p-2 bg-muted_blue rounded-full dark:bg-light_yellow">
                                <FontAwesomeIcon icon={faHouse} class="w-5 h-5 text-white dark:text-dark_gray"></FontAwesomeIcon>
                            </div>
                        </button>

                        {/* Pet Tracker Button */}
                        <button 
                            onClick={() => router.push('/pet-tracker')} className={`px-4 transition-all duration-300 flex flex-row items-center gap-3 ${activeTab === '/pet-tracker' ? 'border-b-2 border-muted_blue dark:border-light_yellow' : ''}`}>
                            <div className="p-2 bg-muted_blue rounded-full dark:bg-light_yellow">
                                <FontAwesomeIcon icon={faPaw} class="w-5 h-5 text-white dark:text-dark_gray"></FontAwesomeIcon>
                            </div>
                        </button>

                        

                        {/* Profile Button */}
                        <button 
                            onClick={() => router.push('/user/'+username)} className={`px-4 transition-all duration-300 flex flex-row items-center gap-3 ${activeTab === '/user/'+username ? 'border-b-2 border-muted_blue dark:border-light_yellow' : ''}`}>
                            <div className="p-2 bg-muted_blue rounded-full dark:bg-light_yellow">
                                <FontAwesomeIcon icon={faUser} class="w-5 h-5 text-white dark:text-dark_gray"></FontAwesomeIcon>
                            </div>
                            {isExpanded && <span className="text-muted_blue dark:text-light_yellow font-semibold tracking-wider">Profile</span>}
                        </button>

                        {/* Adoption Button */}
                        <button 
                            onClick={() => router.push('/adopt')} className={`px-4 transition-all duration-300 flex flex-row items-center gap-3 ${activeTab === '/adopt' ? 'border-b-2 border-muted_blue dark:border-light_yellow' : ''}`}>
                            <div className="p-2 bg-muted_blue rounded-full dark:bg-light_yellow">
                                <FontAwesomeIcon icon={faHandHoldingHeart} class="w-5 h-5 text-white dark:text-dark_gray"></FontAwesomeIcon>
                            </div>
                            {isExpanded && <span className="text-muted_blue dark:text-light_yellow font-semibold tracking-wider">Settings</span>}
                        </button>

                        {/* Settings Button */}
                        {/* <button 
                            onClick={() => router.push('/settings')} className={`px-4 transition-all duration-300 flex flex-row items-center gap-3`}>
                            <div className="p-2 bg-muted_blue rounded-full dark:bg-light_yellow">
                                <FontAwesomeIcon icon={faUserGear} class="w-5 h-5 text-white dark:text-dark_gray"></FontAwesomeIcon>
                            </div>
                            {isExpanded && <span className="text-muted_blue dark:text-light_yellow font-semibold tracking-wider">Settings</span>}
                        </button> */}

                    </div>

                    {/* Log Out Button */}
                    {/* <button onClick={() => handleSignOut()} className={` transition-all duration-300 flex flex-row items-center gap-3`}>
                        <div className="p-1 bg-muted_blue rounded-full dark:bg-light_yellow">
                            <svg class="w-6 h-6 text-white dark:text-dark_gray" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12H4m12 0-4 4m4-4-4-4m3-4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2"/>
                            </svg>
                        </div>
                        {isExpanded && <span className="text-muted_blue dark:text-light_yellow font-semibold whitespace-nowrap">Log Out</span>}
                    </button> */}
                    
                </div>
                <div className="flex flex-row items-center justify-end">
                    {/* Notifications Button */}
                    <button 
                        onClick={() => router.push('/pet-tracker')} className={`px-4 transition-all duration-300 flex flex-row items-center gap-3`}>
                        <div className="p-2 bg-muted_blue rounded-full dark:bg-light_yellow">
                            <FontAwesomeIcon icon={faBell} class="w-5 h-5 text-white dark:text-dark_gray"></FontAwesomeIcon>
                        </div>
                    </button>
                    <DropdownMenu>
                        <DropdownMenuTrigger><Image src={userPhotoURL ? userPhotoURL : "/images/profilePictureHolder.jpg"} alt={'profile picture'} width={44} height={44} className='rounded-full aspect-square object-cover'/></DropdownMenuTrigger>
                        <DropdownMenuContent className="mr-2">
                            <DropdownMenuLabel>
                                <div className="flex flex-col">
                                    My Account
                                    <span className="text-xs">@{username}</span>
                                </div>
                            
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                {/* Profile Button */}
                                <button 
                                    onClick={() => router.push('/user/'+username)} className={`transition-all duration-300 flex flex-row items-center gap-3`}>
                                    <div className="p-1.5 bg-muted_blue rounded-full dark:bg-light_yellow">
                                        <FontAwesomeIcon icon={faUser} class="w-4 h-4 text-white dark:text-dark_gray"></FontAwesomeIcon>
                                    </div>
                                    <span className="text-muted_blue dark:text-light_yellow font-semibold tracking-wider">View Profile</span>
                                </button>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                {/* Settings Button */}
                                <button 
                                    onClick={() => router.push('/settings')} className={`transition-all duration-300 flex flex-row items-center gap-3`}>
                                    <div className="p-1.5 bg-muted_blue rounded-full dark:bg-light_yellow">
                                        <FontAwesomeIcon icon={faUserGear} class="w-4 h-4 text-white dark:text-dark_gray"></FontAwesomeIcon>
                                    </div>
                                    <span className="text-muted_blue dark:text-light_yellow font-semibold tracking-wider">Settings</span>
                                </button>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <button onClick={() => handleSignOut()} className={` transition-all duration-300 flex flex-row items-center gap-3`}>
                                    <div className="p-1.5 bg-muted_blue rounded-full dark:bg-light_yellow">
                                        <FontAwesomeIcon icon={faArrowRightFromBracket} class="w-4 h-4 text-white dark:text-dark_gray"></FontAwesomeIcon>
                                    </div>
                                    <span className="text-muted_blue dark:text-light_yellow font-semibold whitespace-nowrap">Log Out</span>
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
