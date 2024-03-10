import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { Loader2 } from "lucide-react"
import { uploadPostMedia } from "@/lib/storage-funcs"
import { firestore } from "@/lib/firebase"
import { createPostDocument } from "@/lib/firestore-crud"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faImage } from "@fortawesome/free-solid-svg-icons"
import { faTags } from "@fortawesome/free-solid-svg-icons"
import { handleDateFormat } from "@/lib/helper-functions"
import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"

import likeReaction from '/public/images/post-reactions/like.png'
import heartReaction from '/public/images/post-reactions/heart.png'
import laughReaction from '/public/images/post-reactions/haha.png'
import wowReaction from '/public/images/post-reactions/wow.png'
import sadReaction from '/public/images/post-reactions/sad.png'
import angryReaction from '/public/images/post-reactions/angry.png'

import { ExpandedPost } from "./post-expanded"

export function PostSnippet({ post, currentUser }) {

    const [isEdited, setIsEdited] = useState(false);
    const [ currentImageIndex, setCurrentImageIndex ] = useState(0)

    const [commentsLength, setCommentsLength] = useState(0);
    const [reactionsLength, setReactionsLength] = useState(0);
    const [currentUserReaction, setCurrentUserReaction] = useState('');
    const [reactionOverlayVisible, setReactionOverlayVisible] = useState(false);

  return (
    <Dialog>
        <DialogTrigger asChild>
            <Card className="drop-shadow-md hover:drop-shadow-md min-h-fit rounded-md p-6 flex flex-col cursor-pointer">

                {/* header */}
                <div id="post-header" className="flex flex-col md:flex-row justify-between">

                    <div className="flex flex-row justify-start items-start">
                        <div id="author-image">
                            <Image src={post.authorPhotoURL} alt="author photo" width={50} height={50} className="rounded-full drop-shadow-sm aspect-square object-cover h-[40px] w-[40px] md:h-[45px] md:w-[45px]" />
                        </div>

                        <div id="post-meta" className="ml-4 items-center justify-center">
                            <div id="user-meta" className="flex flex-row gap-2 text-sm md:text-base">
                                <div id="display-name">
                                    <p className="font-bold">{post.authorDisplayName}</p>
                                </div>
                                <div className='font-bold'>·</div>
                                <Link href={`/user/${post.authorName}`} id="username" className="hover:text-muted_blue dark:hover:text-light_yellow hover:font-bold transition-all">
                                    <p>@{post.authorName}</p>
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

                </div>

                {/* body */}
                <div id="post-body" className='mt-2 md:mt-3 flex flex-col'>
                    {/* pets */}
                    <div id="post-pets" className="mr-auto mb-2">
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

                    <div id="post-content">
                        <p
                            // onClick={() => {
                            //   setShowPostExpanded(true)
                            //   setPostAction('view')
                            // }} 
                            className='whitespace-pre-line line-clamp-1 text-sm md:text-base md:line-clamp-4 overflow-hidden text-justify'>
                            {post.content}
                        </p>
                    </div>

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
                            <Image src={post.imageURLs[currentImageIndex]} alt="post image" 
                                layout='fill'
                                objectFit='contain'
                                className='rounded-lg cursor-pointer'
                                />
                        </div>
                    }
                </div>

                {/* footer */}
                <div id="post-footer" className="mt-4 flex flex-row w-full justify-between relative">
                    <div id="left" className="flex flex-row gap-4 text-sm md:text-base items-center">
                        <div id="post-reaction-control" className="flex flex-row justify-center items-center gap-2 w-fit h-6">
                            { !currentUserReaction &&
                                <i
                                    className="fa-solid fa-heart hover:text-muted_blue dark:hover:text-light_yellow hover:cursor-pointer transition-all" 
                                    onClick={() => setReactionOverlayVisible(true)}
                                    onMouseEnter={() => setReactionOverlayVisible(true)}
                                />    
                            }

                            { currentUserReaction === 'like' &&
                                <Image
                                    src={likeReaction}
                                    alt="like reaction"
                                    className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                                    onMouseEnter={() => setReactionOverlayVisible(true)}
                                />
                            }

                            { currentUserReaction === 'heart' &&
                                <Image
                                    src={heartReaction}
                                    alt="heart reaction"
                                    className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                                    onMouseEnter={() => setReactionOverlayVisible(true)}
                                />
                            }

                            { currentUserReaction === 'haha' &&
                                <Image
                                    src={laughReaction}
                                    alt="haha reaction"
                                    className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                                    onMouseEnter={() => setReactionOverlayVisible(true)}
                                />
                            }

                            { currentUserReaction === 'wow' &&
                                <Image
                                    src={wowReaction}
                                    alt="wow reaction"
                                    className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                                    onMouseEnter={() => setReactionOverlayVisible(true)}
                                />
                            }

                            { currentUserReaction === 'sad' &&
                                <Image
                                    src={sadReaction}
                                    alt="sad reaction"
                                    className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                                    onMouseEnter={() => setReactionOverlayVisible(true)}
                                />
                            }

                            { currentUserReaction === 'angry' &&
                                <Image
                                    src={angryReaction}
                                    alt="angry reaction"
                                    className={`w-fit h-[21px] flex items-center justify-center hover:transform transition-all`}
                                    onMouseEnter={() => setReactionOverlayVisible(true)}
                                />
                            }                    

                            <p>{reactionsLength}</p>

                            {reactionOverlayVisible && (
                                <div 
                                    onMouseEnter={() => setReactionOverlayVisible(true)}
                                    onMouseLeave={() => setReactionOverlayVisible(false)}
                                    id='overlay' 
                                    className='absolute -left-1 md:-left-2 flex flex-row gap-2 md:w-[300px] md:h-[45px] justify-center items-center bg-off_white dark:bg-dark_gray rounded-full drop-shadow-sm transition-all' 
                                >
                                    <Image 
                                        src={likeReaction} 
                                        alt="like reaction" 
                                        className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                                        // onClick={() => handleReaction('like')}
                                        onClick={() => toast.success("You reacted with a like!")}
                                    />
                                    <Image 
                                        src={heartReaction} 
                                        alt="like reaction" 
                                        className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                                        // onClick={() => handleReaction('heart')}
                                        onClick={() => toast.success("You reacted with a heart!")}
                                    />
                                    <Image 
                                        src={laughReaction} 
                                        alt="like reaction" 
                                        className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                                        // onClick={() => handleReaction('haha')}
                                        onClick={() => toast.success("You reacted with a haha!")}
                                    />
                                    <Image 
                                        src={wowReaction} 
                                        alt="like reaction" 
                                        className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                                        // onClick={() => handleReaction('wow')}
                                        onClick={() => toast.success("You reacted with a wow!")}
                                    />
                                    <Image 
                                        src={sadReaction} 
                                        alt="like reaction" 
                                        className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                                        // onClick={() => handleReaction('sad')}
                                        onClick={() => toast.success("You reacted with a sad!")}
                                    />
                                    <Image 
                                        src={angryReaction} 
                                        alt="like reaction" 
                                        className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                                        // onClick={() => handleReaction('angry')}
                                        onClick={() => toast.success("You reacted with a angry!")}
                                    />
                                </div>
                            )}
                        </div>

                        <div id="comment-control" className="flex flex-row justify-center items-center gap-2">
                            <i 
                                onClick={() => {
                                    // setShowPostExpanded(true)
                                    // setPostAction('comment')
                                    toast.success("You're commenting on a post!")
                                }}
                                className="fa-solid fa-comment hover:text-muted_blue dark:hover:text-light_yellow hover:cursor-pointer transition-all" />
                            <p>{commentsLength}</p>
                        </div>

                        <div id="share-control">
                            <i 
                                onClick={() => {
                                    // setShowPostExpanded(true)
                                    // setPostAction('share')
                                    toast.success("You're sharing a post!")
                                }}
                                className="fa-solid fa-share hover:text-muted_blue dark:hover:text-light_yellow hover:cursor-pointer transition-all" />
                        </div>
                    </div>

                    <div id="right" className="flex flex-row gap-4 items-center text-sm md:text-base">
                        {currentUser.uid !== post.authorID && 
                            <i
                                id="report-control"
                                onClick={() => {
                                    // setShowPostExpanded(true)
                                    // setPostAction('report')
                                    toast.success("You're reporting a post!")
                                }}
                                className="fa-solid fa-flag hover:text-muted_blue dark:hover:text-light_yellow hover:cursor-pointer transition-all" 
                            />
                        }

                        {currentUser.uid === post.authorID && 
                            <>
                                <i
                                    id="edit-control"
                                    onClick={() => {
                                        // setShowPostExpanded(true)
                                        // setPostAction('edit')
                                        toast.success("You're editing a post!")
                                    }}
                                    className="fa-solid fa-pencil hover:text-muted_blue dark:hover:text-light_yellow hover:cursor-pointer transition-all" 
                                />

                                <i
                                    id="delete-control"
                                    onClick={() => {
                                        // setShowPostExpanded(true)
                                        // setPostAction('delete')
                                        toast.success("You're deleting a post!")
                                    }}
                                    className="fa-solid fa-trash hover:text-muted_blue dark:hover:text-light_yellow hover:cursor-pointer transition-all"
                                />
                            </>
                        }
                    </div>
                </div>
            </Card>
        </DialogTrigger>

        <DialogContent className="sm:min-w-full md:min-w-[750px] h-[95%] flex flex-col items-start justify-center p-2">
            <DialogHeader className="flex items-center justify-center w-full">
                <DialogTitle className="text-md">{post.authorDisplayName}&apos;s Post</DialogTitle>
            </DialogHeader>
            <ExpandedPost post={post} currentUser={currentUser} />
        </DialogContent>
    </Dialog>

    
  );
}