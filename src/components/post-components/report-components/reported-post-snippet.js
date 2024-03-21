"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { Loader2 } from "lucide-react"
import { handleDateFormat } from "@/lib/helper-functions"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleInfo, faAngleRight, faAnglesRight, faAngleDown } from "@fortawesome/free-solid-svg-icons"

import { Card } from "@/components/ui/card"

import { ReportDetails } from "./report-details"

export function ReportSnippet({ post }) {

    const [isEdited, setIsEdited] = useState(false);
    const [ currentImageIndex, setCurrentImageIndex ] = useState(0);

    const [ showDetails, setShowDetails ] = useState(false);

    async function handleAction(status) {
        try {
            const response = await fetch(`/api/posts/reported-post`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: "update-status", id: post.postID, status: status })
            });
            const data = await response.json();
            console.log(data);
            toast.success('Report '+status);
        } catch (error) {
            console.error('Error verifying post:', error);
            toast.error('Error verifying post');
        }
    }

    async function handleDeleteReport(event) {
        event.preventDefault();
        try {
            const response = await fetch(`/api/posts/reported-post`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({action: "delete-report", id: post.postID })
            });
            const data = await response.json();
            console.log(data);
            toast.success('Report deleted');
        } catch (error) {
            console.error('Error deleting post:', error);
            toast.error('Error deleting post');
        }
    }



    return (
        <Dialog>
            {/* <DialogTrigger asChild> */}
            <Card className="w-full drop-shadow-md hover:drop-shadow-md min-h-fit rounded-md p-6 flex flex-col">

                {/* header */}
                <div id="post-header" className="flex flex-col justify-between">
                    <div className="flex flex-row w-full justify-end border-b border-secondary pb-3 mb-4">
                        <span className={`font-semibold ${post.reportStatus === "pending" ? "text-secondary" : (post.reportStatus === "verified" ? "text-green-600" : "text-primary")}`}>{post.reportStatus === "pending" ? "UNCHECKED" : (post.reportStatus === "verified" ? "VERIFIED" : "DISMISSED")}</span>
                    </div>
                    

                </div>
                
                {/* body */}
                <div id="post-body" className='mt-2 md:mt-3 flex flex-col'>
                    <div className="flex flex-row justify-between ">
                        <div className="flex flex-row justify-start items-center">
                            <div id="author-image">
                                <Image src={post.authorPhotoURL ? post.authorPhotoURL : "/images/profilePictureHolder.jpg"} alt="author photo" width={65} height={65} className="rounded-full drop-shadow-sm aspect-square object-cover " />
                            </div>

                            <div id="post-meta" className="ml-4 items-center justify-center">
                                <div id="user-meta" className="flex flex-row gap-2 text-sm md:text-base">
                                    <div id="display-name">
                                        <p className="">{post.authorDisplayName}</p>
                                    </div>
                                    <div className='font-bold'>·</div>
                                    <Link href={`/user/${post.authorUsername}`} id="username" className="hover:text-muted_blue dark:hover:text-light_yellow font-semibold transition-all">
                                        <p>@{post.authorUsername}</p>
                                    </Link>
                                </div>
                                
                                <div id="publish-date" className="flex flex-row gap-2 items-center">
                                    <p className="text-xs md:text-sm">{handleDateFormat(post.date)}</p>
                                    
                                    { isEdited ? 
                                        (
                                            <div className="relative flex flex-row items-center gap-2">
                                                <i className="hover-tooltip fa-solid fa-clock-rotate-left text-[10px] md:text-xs"/>
                                                <p className="edited-post-tooltip hidden text-xs">Edited Post</p>
                                            </div>
                                        ) : null
                                    }
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-col w-fit items-end mt-3 md:mt-1 text-sm md:text-base'>
                        {   post.category !== 'General' && (
                            <div className='flex flex-row items-center justify-center gap-2'>
                                <div className='w-3 h-3 rounded-full bg-muted_blue dark:bg-light_yellow'></div>
                                <p>{post.category}</p>
                            </div>
                        )}
                        </div>
                    </div>

                    
                    {/* pets */}
                    <div id="post-pets" className="mr-auto my-2">
                        {post.taggedPets.length > 0 && (
                            <div className="flex flex-row items-center justify-center gap-2">
                                {post.taggedPets.length === 1 && <i className="fa-solid fa-tag text-xs md:text-md"></i>}
                                {post.taggedPets.length > 1 && <i className="fa-solid fa-tags text-xs md:text-md"></i>}

                                <p className="line-clamp-1 overflow-hidden text-sm">
                                    {post.taggedPets.map((pet, index) => (
                                        <span key={index}>
                                            <Link key={index} href={`/pet/${pet.petID}`} className="hover:font-bold hover:text-muted_blue dark:hover:text-light_yellow transition-all">
                                                <span className="hover:underline">{pet.petName}</span>
                                            </Link>
                                            {index < post.taggedPets.length - 1 ? ', ' : ''}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        )}
                    </div>

                    { (post.category === 'Unknown Owner' || post.category === 'Retrieved Pets') && 
                    <div className='flex flex-row items-center gap-1 mb-2'>
                        <p className='text-sm'>Found At:</p>
                        <p className='line-clamp-1 overflow-hidden text-sm'>{post.postTrackerLocation}</p>
                    </div>
                    }

                    {
                    post.category === 'Lost Pets' && 
                    <div className='flex flex-row items-center gap-1 mb-2'>
                        <p className='text-sm'>Last Seen:</p>
                        <p className='line-clamp-1 overflow-hidden text-sm'>{post.postTrackerLocation}</p>
                    </div>
                    }

                    <DialogTrigger asChild>
                        <div id="post-content" className="cursor-pointer">
                            <p
                                // onClick={() => {
                                //   setShowPostExpanded(true)
                                //   setPostAction('view')
                                // }} 
                                className='whitespace-pre-line line-clamp-1 text-sm md:text-base md:line-clamp-4 overflow-hidden text-justify'>
                                {post.content}
                            </p>
                        </div>
                    </DialogTrigger>

                    { post.imageURLs.length >= 1 &&
                        <div id="post-image" className='h-[200px] mt-2 md:mt-4 md:h-[300px] w-auto flex items-center justify-center relative'>
                            {post.imageURLs.length > 1 && (
                                <>
                                <i className="text-xl fa-solid fa-circle-chevron-left absolute left-0 cursor-pointer z-10 hover:text-muted_blue dark:hover:text-light_yellow active:scale-110 transition-all pl-2 md:pl-0" 
                                    onClick={() => {
                                    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + post.imageURLs.length) % post.imageURLs.length);
                                    }}
                                ></i>
                                <i className="text-xl fa-solid fa-circle-chevron-right absolute right-0 cursor-pointer z-10 hover:text-muted_blue dark:hover:text-light_yellow active:scale-110 transition-all pr-2 md:pr-0" 
                                    onClick={() => {
                                    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % post.imageURLs.length);
                                    }}></i>
                                </>
                            )}
                            <DialogTrigger asChild>
                                <Image src={post.imageURLs[currentImageIndex]} alt="post image" 
                                    layout='fill'
                                    objectFit='contain'
                                    className='rounded-lg cursor-pointer'
                                    />
                            </DialogTrigger>
                        </div>
                    }
                </div>

                {/* footer */}
                <div id="post-footer" className="mt-4 flex flex-col w-full">
                    <div className="w-full border-y border-secondary justify-between">
                        {/* See Report Details */}
                        <div className='flex flex-row justify-between items-center w-full my-3 px-4'>
                            <div onClick={() => setShowDetails(!showDetails)} className='flex flex-row items-center w-full hover:text-primary hover:cursor-pointer'>
                                <FontAwesomeIcon icon={faCircleInfo} className='text-4xl text-primary'></FontAwesomeIcon>
                                <span id="report-control" className='ml-4 text-md'>See List of Report Details:</span>
                                <span className="ml-4 text-md font-semibold"><span className="text-red-500">{post.reports.length}</span> Total User Reports</span>
                            </div>
                            <FontAwesomeIcon icon={(showDetails ? faAngleDown : faAngleRight)} className='text-3xl text-primary hover:cursor-pointer'/>
                        </div>
                    </div>
                    <div className={`${showDetails ? "flex flex-col":"hidden"}`}>
                        {post.reports.map((report, index) => 
                                <ReportDetails key={index} details={report} />
                            
                        )}
                    </div>
                    {post.reportStatus === 'pending' ? 
                        <div className="flex w-full justify-center gap-8 mt-4">
                            {/* Buttons */}
                            <Button type="button" onClick={(e) => handleAction("verified")} className={`w-36 text-lg font-semibold tracking-wide shadow-lg hover:w-40 hover:text-xl transition-all duration-150 border border-secondary`}>
                                Verify
                            </Button>
                            
                            <Button type="button" onClick={(e) => handleAction("dismissed")} className={`w-36 text-lg font-semibold tracking-wide bg-inherit border border-secondary shadow-lg text-secondary hover:text-primary-foreground`}>
                                Dismiss
                            </Button>
                        </div>
                    :
                        <div className="flex w-full justify-center gap-8 mt-4">
                            <Button type="button" onClick={(e) => handleAction("pending")} className={`w-36 text-lg font-semibold tracking-wide bg-inherit border border-secondary shadow-lg text-secondary hover:text-primary-foreground`}>
                                Undo
                            </Button>
                            <Button type="button" variant={"destructive"} onClick={(e) => handleDeleteReport(e)} className={`w-36 text-lg font-semibold tracking-wide shadow-lg border border-secondary`}>
                                Delete
                            </Button>
                        </div>
                    }
                    
                </div>
            </Card>
            {/* </DialogTrigger> */}

            <DialogContent className="sm:min-w-full md:min-w-[750px] h-[95%] flex flex-col items-start justify-center p-2">
                <DialogHeader className="flex items-center justify-center w-full">
                    <DialogTitle className="text-md">{post.authorDisplayName}&apos;s Post</DialogTitle>
                </DialogHeader>
            </DialogContent>
        </Dialog>

        
    );
}