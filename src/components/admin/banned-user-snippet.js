"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { updateDocument } from "@/lib/firestore-crud"
import { handleDateFormat } from "@/lib/helper-functions"

import { Button } from "@/components/ui/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleInfo, faAngleRight, faAngleDown } from "@fortawesome/free-solid-svg-icons"
import { Card } from "@/components/ui/card"
import { UserReportSnippet } from "@/components/admin/user-report-snippets"
import { ModifyBan } from "@/components/admin/modify-ban-dialog"

export function BannedUserSnippet({ user, reportedPosts }) {

    const [isEdited, setIsEdited] = useState(false);
    const [ currentImageIndex, setCurrentImageIndex ] = useState(0);

    const [ showDetails, setShowDetails ] = useState(false);
    // const [ reportList, setReportList ] = useState(reportedPosts);

    async function handleAction(status) {
        try {
            const response = await fetch(`/api/posts/reported-post`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: "update-status", id: post.postID, author: post.authorID, status: status })
            });
            const data = await response.json();
            console.log(data);
            toast.success('Report '+status);
        } catch (error) {
            console.error('Error verifying post:', error);
            toast.error('Error verifying post');
        }
    }

    async function handleRemoveBan(event) {
        event.preventDefault();
        try {
            await updateDocument('users', user.uid, {ban: {status: "none", when: null, until: null}});
            await Promise.all(reportedPosts.map(async (post) => {
                await updateDocument('posts', post.postID, { reportStatus: "none", reports: [] });
            }));
            toast.success('User ban removed.');
        } catch (error) {
            console.error('Error removing ban:', error);
            toast.error('Error removing ban');
        }
    } 

    return (
        <>
            <Card className="w-full drop-shadow-md hover:drop-shadow-md min-h-fit rounded-md p-6 flex flex-col">
                <div className='mt-2 md:mt-3 flex flex-col'>
                    <div className="flex flex-row justify-between ">
                        <div className="flex flex-row justify-between items-center">
                            <div id="user-image">
                                <Image src={user.userPhotoURL ? user.userPhotoURL : "/images/profilePictureHolder.jpg"} alt="user photo" width={50} height={50} className="rounded-full drop-shadow-sm aspect-square object-cover " />
                            </div>

                            <div className="ml-4 items-center justify-center">
                                <div id="user-meta" className="flex flex-row gap-2 text-sm md:text-base">
                                    <div id="display-name">
                                        <p className="">{user.displayName}</p>
                                    </div>
                                    <div className='font-bold'>·</div>
                                    <Link href={`/user/${user.username}`} id="username" className="hover:text-muted_blue dark:hover:text-light_yellow font-semibold transition-all">
                                        <p>@{user.username}</p>
                                    </Link>
                                </div>
                                <div id="ban-date" className="flex flex-row gap-2 items-center">
                                    <p className="text-xs md:text-sm">Banned {user.ban.when ? handleDateFormat(user.ban.when.toDate()) : "INDEFINITE"}</p>
                                    
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
                        
                        <div className="flex flex-col items-end">
                            <span>This user is banned until:</span>
                            <span className="font-semibold">{user.ban.status === "temporary" ? handleDateFormat(user.ban.until.toDate()) : "INDEFINITE"}</span>
                        </div>    
                    </div>
                    
                    <div className="mt-3">
                        <p
                            className='whitespace-pre-line line-clamp-1 text-sm md:text-base md:line-clamp-4 overflow-hidden text-justify'>
                            User is {user.ban.status === "temporary" ? "TEMPORARILY" : "PERMANENTLY"} banned due to multiple {user.ban.status === "permanent" && "verified"} reports.
                        </p>
                    </div>
                </div>

                {/* footer */}
                <div className=" flex flex-col w-full">
                    <div className="flex w-full justify-center gap-8 my-4">
                        <ModifyBan props={{user: user}}/>
                        <Button type="button" variant={"destructive"} onClick={(e) => handleRemoveBan(e)} className={`w-36 text-lg font-semibold tracking-wide shadow-lg border border-secondary`}>
                            Remove Ban
                        </Button>
                    </div>
                    <div className="w-full border-y border-secondary justify-between">
                        {/* See Report Details */}
                        <div className='flex flex-row justify-between items-center w-full my-3 px-4'>
                            <div onClick={() => setShowDetails(!showDetails)} className='flex flex-row items-center w-full hover:text-primary hover:cursor-pointer'>
                                <FontAwesomeIcon icon={faCircleInfo} className='text-4xl text-primary'></FontAwesomeIcon>
                                <span id="report-control" className='ml-4 text-md'>See List of Reported Posts:</span>
                                <span className="ml-4 text-md font-semibold"><span className="text-red-500">{reportedPosts.length}</span> Total Reported Posts</span>
                            </div>
                            <FontAwesomeIcon icon={(showDetails ? faAngleDown : faAngleRight)} className='text-3xl text-primary hover:cursor-pointer'/>
                        </div>
                    </div>
                    <div className={`${showDetails ? "flex flex-col mt-6 mx-6":"hidden"}`}>
                        {reportedPosts && reportedPosts.map((post, index) => 
                            <div key={index} className="w-full mb-4 border border-secondary rounded-lg"> {/* Add a key for the outer container */}
                                <UserReportSnippet post={post} />
                            </div>
                        )}
                    </div>
                    
                    
                </div>
            </Card>
        </>
    );
}