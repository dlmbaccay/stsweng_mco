"use client"

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { auth } from "@/lib/firebase";
import { ModeToggle } from "../../mode-toggle";
import  AdminNotifications from "./notifications-tab";


export default function AdminNav({props}) {
    const router = useRouter();
    const activeTab = usePathname();
    
    const navRef = useRef(null);

    const {notifications} = props;

    const handleSignOut = () => {
        auth.signOut().then(() => {
            router.push('/landing');
            toast.success('Signed out');
            console.log('Signed out');
        })
    }

    return (
        <>
            <div ref={navRef} className={`h-screen border-r border-gray flex flex-col justify-between bg-white dark:bg-dark_gray w-80"`}>
                <>
                {/* admin user meta */}
                <div className="pt-8 mx-auto">
                    <button 
                        onClick={() => {router.push(`/user/${username}`)}}
                        className='group flex flex-col justify-center items-center gap-4'>
                            {<Image src={"/images/sample-user1-image.png"} alt={'profile picture'} width={120} height={`120`} className='rounded-full aspect-square object-cover'/>}
                    </button>
                    <div className="mx-auto flex flex-col items-center justify-center gap-4 mt-4">
                        <span className="text-md tracking-wide font-medium">ADMIN</span>
                        <div className="flex flex-row gap-6">
                            <ModeToggle></ModeToggle>
                            <AdminNotifications props={{notifications: notifications}}/>
                        </div>
                        
                    </div>
                </div>
                <div className="pb-8 text-sm">
                    <div className={`flex flex-col gap-2 justify-items-start`}>
                        
                        <hr className={`border border-xanthous opacity-30 ml-6 mr-6 mt-6`}/>
                        {/* Reported Posts Button */}
                        <div className={`w-full h-14 items-center flex ${activeTab === '/admin/reported-posts' ? 'dark:bg-gray bg-light_yellow' : ''}`}>
                            <button 
                                onClick={() => router.push('/admin/reported-posts')} className={`ml-14 transition-all duration-300 flex flex-row items-center gap-3`}>
                                <div className="p-2 bg-primary rounded-full">
                                    <svg className="w-4 h-4 text-background" aria-hidden="true" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                        <path d="M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32V64 368 480c0 17.7 14.3 32 32 32s32-14.3 32-32V352l64.3-16.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30V66.1c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L64 48V32z"/>
                                    </svg>
                                </div>
                                <span className="text-primary font-semibold tracking-wider">Reported Posts</span>
                            </button>
                        </div>
                        

                        {/* Banned Users Button */}
                        <div className={`w-full h-14 items-center flex ${activeTab === '/admin/banned-users' ? 'bg-gray' : ''}`}>
                            <button 
                                onClick={() => router.push('/admin/banned-users')} className={`ml-14 transition-all duration-300 flex flex-row items-center gap-3`}>
                                <div className="p-1 bg-primary rounded-full">
                                    <svg className="w-6 h-6 text-background" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4H6Zm7.3-2a6 6 0 0 0 0-6A4 4 0 0 1 20 8a4 4 0 0 1-6.7 3Zm2.2 9a4 4 0 0 0 .5-2v-1a6 6 0 0 0-1.5-4H18a4 4 0 0 1 4 4v1a2 2 0 0 1-2 2h-4.5Z" clipRule="evenodd"/>
                                    </svg>
                                </div>
                                <span className="text-primary font-semibold tracking-wider whitespace-nowrap">Banned Users</span>
                            </button>
                        </div>
                        {/* Notifications Button */}
                        {/* <button 
                            onClick={() => router.push('/pet-tracker')} className={`${isExpanded ? "ml-14" : "mx-auto"} transition-all duration-300 flex flex-row items-center gap-3`}>
                            <div className="p-1 bg-muted_blue rounded-full dark:bg-light_yellow">
                                <svg class="w-6 h-6 text-white dark:text-dark_gray" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.1 12.6v-1.8A5.4 5.4 0 0 0 13 5.6V3a1 1 0 0 0-2 0v2.4a5.4 5.4 0 0 0-4 5.5v1.8c0 2.4-1.9 3-1.9 4.2 0 .6 0 1.2.5 1.2h13c.5 0 .5-.6.5-1.2 0-1.2-1.9-1.8-1.9-4.2Zm-13.2-.8a1 1 0 0 1-1-1c0-2.3.9-4.6 2.5-6.4a1 1 0 1 1 1.5 1.4 7.4 7.4 0 0 0-2 5 1 1 0 0 1-1 1Zm16.2 0a1 1 0 0 1-1-1c0-1.8-.7-3.6-2-5a1 1 0 0 1 1.5-1.4c1.6 1.8 2.5 4 2.5 6.4a1 1 0 0 1-1 1ZM8.8 19a3.5 3.5 0 0 0 6.4 0H8.8Z"/>
                                </svg>
                            </div>
                            {isExpanded && <span className="text-muted_blue dark:text-light_yellow font-semibold tracking-wider">Notifications</span>}
                        </button> */}

                        {/* Profile Button */}
                        {/* <button 
                            onClick={() => router.push('/user/'+username)} className={`${isExpanded ? "ml-14" : "mx-auto"} transition-all duration-300 flex flex-row items-center gap-3 ${activeTab === '/user/'+username ? 'bg-gray-200 dark:bg-light_yellow' : ''}`}>
                            <div className="p-1 bg-muted_blue rounded-full dark:bg-light_yellow">
                                <svg class="w-6 h-6 text-white dark:text-dark_gray" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                    <path fill-rule="evenodd" d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4h-4Z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            {isExpanded && <span className="text-muted_blue dark:text-light_yellow font-semibold tracking-wider">Profile</span>}
                        </button> */}

                        {/* Settings Button */}
                        {/* <button 
                            onClick={() => router.push('/settings')} className={`${isExpanded ? "ml-14" : "mx-auto"} transition-all duration-300 flex flex-row items-center gap-3`}>
                            <div className="p-1 bg-muted_blue rounded-full dark:bg-light_yellow">
                                <svg class="w-6 h-6 text-white dark:text-dark_gray" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                    <path fill-rule="evenodd" d="M17 10v1.1l1 .5.8-.8 1.4 1.4-.8.8.5 1H21v2h-1.1l-.5 1 .8.8-1.4 1.4-.8-.8a4 4 0 0 1-1 .5V20h-2v-1.1a4 4 0 0 1-1-.5l-.8.8-1.4-1.4.8-.8a4 4 0 0 1-.5-1H11v-2h1.1l.5-1-.8-.8 1.4-1.4.8.8a4 4 0 0 1 1-.5V10h2Zm.4 3.6c.4.4.6.8.6 1.4a2 2 0 0 1-3.4 1.4A2 2 0 0 1 16 13c.5 0 1 .2 1.4.6ZM5 8a4 4 0 1 1 8 .7 7 7 0 0 0-3.3 3.2A4 4 0 0 1 5 8Zm4.3 5H7a4 4 0 0 0-4 4v1c0 1.1.9 2 2 2h6.1a7 7 0 0 1-1.8-7Z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            {isExpanded && <span className="text-muted_blue dark:text-light_yellow font-semibold tracking-wider">Settings</span>}
                        </button> */}

                    </div>

                    <hr className='border border-xanthous opacity-30 ml-6 mr-6 mt-2 mb-6'/>
                    {/* Log Out Button */}
                    <button onClick={() => handleSignOut()} className={`ml-14 transition-all duration-300 flex flex-row items-center gap-3`}>
                        <div className="p-1 bg-muted_blue rounded-full dark:bg-light_yellow">
                            <svg className="w-6 h-6 text-white dark:text-dark_gray" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12H4m12 0-4 4m4-4-4-4m3-4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2"/>
                            </svg>
                        </div>
                        <span className="text-muted_blue dark:text-light_yellow font-semibold whitespace-nowrap">Log Out</span>
                    </button>
                </div>
                
                </>
                
            </div>
            
        
        </>
    )
}
