"use client"

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { auth } from "@/lib/firebase";
import { ModeToggle } from "../../mode-toggle";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { handleDateFormat } from "@/lib/helper-functions";


export default function AdminNotifications({props}) {
    const router = useRouter();
    const activeTab = usePathname();

    const {notifications} = props;
    
    const navRef = useRef(null);

    const handleSignOut = () => {
        auth.signOut().then(() => {
            router.push('/landing');
            toast.success('Signed out');
            console.log('Signed out');
        })
    }

    const handleRouterPush = (path) => {
        router.push(path);
    }

    return (
        <>
            <Dialog>
                <DialogTrigger className="items-center flex w-10 h-10">
                    <div className="p-2 bg-primary rounded-full w-full h-full">
                        <i className="fa fa-bell text-background h-6 w-6"></i>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                    </DialogHeader>
                        <div className="flex flex-col gap-4">
                            {notifications.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate()).map((notification, index) => (
                                <div key={index} className="flex items-center p-3 hover:bg-muted-foreground leading-3">
                                    <Image src={notification.userPhotoURL ? notification.userPhotoURL : "/images/profilePictureHolder.jpg"} width={100} height={100} alt="user-image" className="w-12 h-12 mr-4 rounded-full hover:drop-shadow-lg cursor-pointer" onClick={(e) => router.push(`/user/${notification.username}`)}/>
                                    <div>
                                        <div style={{ wordWrap: 'break-word' }} className=''>
                                        <span className="text-sm font-bold hover:drop-shadow-lg hover:text-base cursor-pointer" onClick={(e) => router.push(`/user/${notification.username}`)}>{notification.username}</span> 
                                        <span className="text-sm"> {notification.desc}.</span>
                                        </div>
                                        <p className='mt-1 text-xs text-raisin'>{handleDateFormat(notification.createdAt.toDate())}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    <DialogFooter>
                        {/* <button className="w-full py-3 text-sm font-semibold text-white bg-primary rounded-md hover:scale-105 transition-all focus:outline-none focus:ring" onClick={handleSignOut}>Sign Out</button> */}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        
        </>
    )
}
