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

export function ExpandedPost({ post, currentUser }) {

    const [isEdited, setIsEdited] = useState(false);
    const [ currentImageIndex, setCurrentImageIndex ] = useState(0)

    const [commentsLength, setCommentsLength] = useState(0);
    const [reactionsLength, setReactionsLength] = useState(0);
    const [currentUserReaction, setCurrentUserReaction] = useState('');
    const [reactionOverlayVisible, setReactionOverlayVisible] = useState(false);

    const [isFocused, setIsFocused] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentBody, setCommentBody] = useState('');

    const handleComment = async (event) => {
    }


  return (
    <div className="w-full h-full flex flex-col">

        {/* expanded post */}
        <div className='w-full h-full rounded-lg mt-2 pr-6 pl-6 flex flex-col overflow-y-auto'>
            {/* header */}
            <div id="post-header" className="flex flex-col md:flex-row justify-between">

                <div className="flex flex-row justify-start items-start">
                    <div id="author-image">
                        <Image src={post.authorPhotoURL ? post.authorPhotoURL : "/images/profilePictureHolder.jpg"} alt="author photo" width={50} height={50} className="rounded-full drop-shadow-sm aspect-square object-cover h-[40px] w-[40px] md:h-[45px] md:w-[45px]" />
                    </div>

                    <div id="post-meta" className="ml-4 items-center justify-center">
                        <div id="user-meta" className="flex flex-row gap-2 text-sm md:text-base">
                            <div id="display-name">
                                <p className="font-bold">{post.authorDisplayName}</p>
                            </div>
                            <div className='font-bold'>·</div>
                            <Link href={`/user/${post.authorUsername}`} id="username" className="hover:text-muted_blue dark:hover:text-light_yellow hover:font-bold transition-all">
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

            </div>

            {/* body */}
            <div id="post-body" className='mt-2 md:mt-3 flex flex-col'>
                {/* pets */}
                <div id="post-pets" className="mr-auto mb-2">
                    {post.taggedPets.length > 0 && (
                        <div className="flex flex-row items-center justify-center gap-2">
                            {post.taggedPets.length === 1 && <i className="fa-solid fa-tag text-xs md:text-base"></i>}
                            {post.taggedPets.length > 1 && <i className="fa-solid fa-tags text-xs md:text-base"></i>}

                            <p className="line-clamp-1 overflow-hidden text-sm md:text-base">
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

            <hr className="mt-4 bg-gray"/>

            {/* reactions */}
            <Dialog>
                <DialogTrigger asChild>
                    <p className="text-sm mt-4 hover:underline cursor-pointer w-fit">View Reactions...</p>
                </DialogTrigger>
                <DialogContent>
                    To be implemented...
                </DialogContent>
            </Dialog>
           
            {/* comments */}
            <div id='post-comments' className='mt-3 mb-4 flex h-full flex-col w-full justify-between relative'>
                {comments.length === 0 ? (
                    <div className='flex text-sm'>
                        No comments yet...
                    </div>    
                ) : (
                    <div className='flex flex-col w-full h-fit gap-3 justify-start items-start'>
                        {comments.map((comment, index) => (
                            <div key={comment.commentID} className='w-full h-fit'>
                                {/* <Comment 
                                    props = {{
                                        currentUserID: currentUserID,
                                        currentUserPhotoURL: currentUser.photoURL,
                                        currentUserUsername: currentUser.username,
                                        currentUserDisplayName: currentUser.displayName,
                                        reportCount: currentUser.reportCount,
                                        postID: postID,
                                        isEdited: comment.isEdited,
                                        commentID: comment.commentID,
                                        commentBody: comment.commentBody,
                                        commentDate: comment.commentDate,
                                        authorID: comment.authorID,
                                        authorDisplayName: comment.authorDisplayName,
                                        authorUsername: comment.authorUsername,
                                        authorPhotoURL: comment.authorPhotoURL,
                                    }}
                                /> */}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* write comment */}
        <div id='write-comment' className='mt-3 pb-3 pl-6 pr-6'>
            <form 
                onSubmit={handleComment}
                className='flex flex-row items-start justify-center h-full'>
                <div className='flex aspect-square w-[40px] h-[40px] mr-2 mt-1'>
                    {currentUser && <Image src={currentUser.userPhotoURL  ? currentUser.userPhotoURL : "/images/profilePictureHolder.jpg"} alt="user image" width={40} height={40} className='rounded-full drop-shadow-sm '/>}
                </div>

                <textarea 
                    id="comment-body" 
                    value={commentBody}
                    onChange={(event) => setCommentBody(event.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    maxLength={100}
                    onKeyDown={(event => {
                        if (event.key === 'Enter') {
                            handleComment(event);
                        }
                    })}
                    placeholder='Write a comment...' 
                    className={`outline-none resize-none border bg-[#fafafa] dark:bg-black text-md rounded-xl text-raisin_black w-full p-3 transition-all ${isFocused ? 'max-h-[80px]' : 'max-h-[50px]'}`}
                />

                <Button
                    type='submit'
                    className='w-[40px] h-[40px] rounded-full ml-2 mt-1'>
                    <i className='fa-solid fa-paper-plane text-sm'></i>
                </Button>
            </form>
        </div>
    </div>
  )
}