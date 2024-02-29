"use client"

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { auth } from "@/lib/firebase";
import { ModeToggle } from "../mode-toggle";


export default function ExpandedNavBar({props}) {
    const router = useRouter();
    const { uid, username, userPhotoURL, expand_lock } = props;
    const [isExpanded, setIsExpanded] = useState(expand_lock);
    const activeTab = router.pathname;
    
    const navRef = useRef(null);

    const handleSignOut = () => {
        auth.signOut().then(() => {
            router.push('/landing');
            toast.success('Signed out');
            console.log('Signed out');
        })
    }

    // Close navbar when clicking outside
    useEffect(() => {
        if (expand_lock) {
            return;
        } else {
            const handleClickOutside = (event) => {
                if (navRef.current && !navRef.current.contains(event.target)) {
                    setIsExpanded(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, []);

    // const handleClick = (event) => {
    //     // Check if the event target is the background div
    //     if (event.target === navRef.current) {
    //         setIsExpanded(!isExpanded);
    //     }
    // };

    return (
        <>
            <div ref={navRef} onClick={setIsExpanded} className={`h-screen border-r-2 border-gray flex flex-col justify-between bg-white dark:bg-dark_gray ${isExpanded ? "w-80 transition-all duration-300": "w-20 transition-all duration-300"}`}>
                <>
                {/* user meta */}
                <div className="pt-8 mx-auto">
                    <button 
                        onClick={() => {router.push(`/user/${username}`)}}
                        className='group flex flex-col justify-center items-center gap-4'>
                            {<Image src={userPhotoURL} alt={'profile picture'} width={`${isExpanded ? 150: 50}`} height={`${isExpanded ? 150: 50}`} className='rounded-full aspect-square object-cover'/>}
                    </button>
                    <div className="mx-auto flex flex-col items-center justify-center gap-4 mt-4">
                        {isExpanded && <span className="text-lg tracking-wide font-medium">@{username}</span>}
                        <ModeToggle></ModeToggle>
                    </div>
                </div>
                <div className="pb-8">
                    <div className={`flex flex-col gap-6 ${isExpanded ? "justify-items-start" : ""}`}>
                        
                        <hr className={`border border-xanthous opacity-30 ml-6 mr-6 mt-6`}/>
                        {/* Home Button */}
                        <button 
                            onClick={() => router.push('/home')} className={`${isExpanded ? "ml-20" : "mx-auto"} transition-all duration-300 flex flex-row items-center gap-3 ${activeTab === '/home' ? 'bg-gray-200 dark:bg-gray-800' : ''}`}>
                            <div className="p-1 bg-muted_blue rounded-full dark:bg-light_yellow">
                                <svg class="w-6 h-6 text-white dark:text-dark_gray" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                    <path fill-rule="evenodd" d="M11.3 3.3a1 1 0 0 1 1.4 0l6 6 2 2a1 1 0 0 1-1.4 1.4l-.3-.3V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3c0 .6-.4 1-1 1H7a2 2 0 0 1-2-2v-6.6l-.3.3a1 1 0 0 1-1.4-1.4l2-2 6-6Z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            {isExpanded && <span className="text-muted_blue dark:text-light_yellow font-semibold tracking-wider">Home</span>}
                        </button>

                        {/* Pet Tracker Button */}
                        <button 
                            onClick={() => router.push('/pet-tracker')} className={`${isExpanded ? "ml-20" : "mx-auto"} transition-all duration-300 flex flex-row items-center gap-3`}>
                            <div className="p-1 bg-muted_blue rounded-full dark:bg-light_yellow">
                                <svg class="w-6 h-6 text-white dark:text-dark_gray" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                    <path fill-rule="evenodd" d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4H6Zm7.3-2a6 6 0 0 0 0-6A4 4 0 0 1 20 8a4 4 0 0 1-6.7 3Zm2.2 9a4 4 0 0 0 .5-2v-1a6 6 0 0 0-1.5-4H18a4 4 0 0 1 4 4v1a2 2 0 0 1-2 2h-4.5Z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            {isExpanded && <span className="text-muted_blue dark:text-light_yellow font-semibold tracking-wider whitespace-nowrap">Pet Tracker</span>}
                        </button>

                        {/* Notifications Button */}
                        <button 
                            onClick={() => router.push('/pet-tracker')} className={`${isExpanded ? "ml-20" : "mx-auto"} transition-all duration-300 flex flex-row items-center gap-3`}>
                            <div className="p-1 bg-muted_blue rounded-full dark:bg-light_yellow">
                                <svg class="w-6 h-6 text-white dark:text-dark_gray" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.1 12.6v-1.8A5.4 5.4 0 0 0 13 5.6V3a1 1 0 0 0-2 0v2.4a5.4 5.4 0 0 0-4 5.5v1.8c0 2.4-1.9 3-1.9 4.2 0 .6 0 1.2.5 1.2h13c.5 0 .5-.6.5-1.2 0-1.2-1.9-1.8-1.9-4.2Zm-13.2-.8a1 1 0 0 1-1-1c0-2.3.9-4.6 2.5-6.4a1 1 0 1 1 1.5 1.4 7.4 7.4 0 0 0-2 5 1 1 0 0 1-1 1Zm16.2 0a1 1 0 0 1-1-1c0-1.8-.7-3.6-2-5a1 1 0 0 1 1.5-1.4c1.6 1.8 2.5 4 2.5 6.4a1 1 0 0 1-1 1ZM8.8 19a3.5 3.5 0 0 0 6.4 0H8.8Z"/>
                                </svg>
                            </div>
                            {isExpanded && <span className="text-muted_blue dark:text-light_yellow font-semibold tracking-wider">Notifications</span>}
                        </button>

                        {/* Profile Button */}
                        <button 
                            onClick={() => router.push('/user/'+username)} className={`${isExpanded ? "ml-20" : "mx-auto"} transition-all duration-300 flex flex-row items-center gap-3 ${activeTab === '/user/'+username ? 'bg-gray-200 dark:bg-light_yellow' : ''}`}>
                            <div className="p-1 bg-muted_blue rounded-full dark:bg-light_yellow">
                                <svg class="w-6 h-6 text-white dark:text-dark_gray" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                    <path fill-rule="evenodd" d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4h-4Z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            {isExpanded && <span className="text-muted_blue dark:text-light_yellow font-semibold tracking-wider">Profile</span>}
                        </button>

                        {/* Settings Button */}
                        <button 
                            onClick={() => router.push('/settings')} className={`${isExpanded ? "ml-20" : "mx-auto"} transition-all duration-300 flex flex-row items-center gap-3`}>
                            <div className="p-1 bg-muted_blue rounded-full dark:bg-light_yellow">
                                <svg class="w-6 h-6 text-white dark:text-dark_gray" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                    <path fill-rule="evenodd" d="M17 10v1.1l1 .5.8-.8 1.4 1.4-.8.8.5 1H21v2h-1.1l-.5 1 .8.8-1.4 1.4-.8-.8a4 4 0 0 1-1 .5V20h-2v-1.1a4 4 0 0 1-1-.5l-.8.8-1.4-1.4.8-.8a4 4 0 0 1-.5-1H11v-2h1.1l.5-1-.8-.8 1.4-1.4.8.8a4 4 0 0 1 1-.5V10h2Zm.4 3.6c.4.4.6.8.6 1.4a2 2 0 0 1-3.4 1.4A2 2 0 0 1 16 13c.5 0 1 .2 1.4.6ZM5 8a4 4 0 1 1 8 .7 7 7 0 0 0-3.3 3.2A4 4 0 0 1 5 8Zm4.3 5H7a4 4 0 0 0-4 4v1c0 1.1.9 2 2 2h6.1a7 7 0 0 1-1.8-7Z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            {isExpanded && <span className="text-muted_blue dark:text-light_yellow font-semibold tracking-wider">Settings</span>}
                        </button>

                    </div>

                    <hr className='border border-xanthous opacity-30 ml-6 mr-6 mt-6 mb-6'/>
                    {/* Log Out Button */}
                    <button onClick={() => handleSignOut()} className={`${isExpanded ? "ml-20" : "mx-auto"} transition-all duration-300 flex flex-row items-center gap-3`}>
                        <div className="p-1 bg-muted_blue rounded-full dark:bg-light_yellow">
                            <svg class="w-6 h-6 text-white dark:text-dark_gray" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12H4m12 0-4 4m4-4-4-4m3-4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2"/>
                            </svg>
                        </div>
                        {isExpanded && <span className="text-muted_blue dark:text-light_yellow font-semibold whitespace-nowrap">Log Out</span>}
                    </button>
                </div>
                
                </>
                
            </div>
            
        
        </>
    )
}
