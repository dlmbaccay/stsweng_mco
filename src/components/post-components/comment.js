import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { Loader2 } from "lucide-react"
import { uploadPostMedia } from "@/lib/storage-funcs"
import { firestore } from "@/lib/firebase"
import { createPostDocument } from "@/lib/firestore-crud"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogClose, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
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

import likeReaction from '/public/images/post-reactions/like.png'
import heartReaction from '/public/images/post-reactions/heart.png'
import laughReaction from '/public/images/post-reactions/haha.png'
import wowReaction from '/public/images/post-reactions/wow.png'
import sadReaction from '/public/images/post-reactions/sad.png'
import angryReaction from '/public/images/post-reactions/angry.png'

export function Comment({ props }) {

    const router = useRouter();

    const { currentUser, postID, postAuthorID, postAuthorDisplayName, postAuthorUsername, postAuthorPhotoURL, commentID, commentBody, commentDate, authorID, authorDisplayName, authorUsername, authorPhotoURL, isEdited } = props;

    const formatCommentDate = () => {
        const date = new Date(commentDate);
        const now = new Date();
        const diff = now - date;
        const secs = Math.floor(diff / 1000);
        const mins = Math.floor(secs / 60);
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);

        if (secs < 60) {
            return 'Just now';
        } else if (mins < 60) {
            return `${mins === 1 ? '1 minute' : `${mins} minutes`} ago`;
        } else if (hours < 24) {
            return `${hours === 1 ? '1 hour' : `${hours} hours`} ago`;
        } else if (days < 7) {
            return `${days === 1 ? '1 day' : `${days} days`} ago`;
        } else if (weeks < 4) {
            return `${weeks === 1 ? '1 week' : `${weeks} weeks`} ago`;
        }
    }

    const handleEditComment = (event) => {
        
    }

    const handleDeleteComment = async () => {

        // call delete api
        // if success, remove comment from state

        try {
            const response = await fetch('/api/posts/comment-post/delete-comment', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ postID, commentID }),
            });

            if (response.ok) { 
                toast.success('Comment deleted successfully!');
            } else {
                toast.error('Error deleting comment. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast.error('An error occurred while deleting the comment.');
        } finally {
            router.refresh();
        }
    }

    const [isReplying, setIsReplying] = useState(false)
    const [replyBody, setReplyBody] = useState('')

    const [replies, setReplies] = useState([]);
    
    const reactionImages = {
        like: { src: likeReaction, alt: 'like reaction' },
        heart: { src: heartReaction, alt: 'heart reaction' },
        haha: { src: laughReaction, alt: 'haha reaction' },
        wow: { src: wowReaction, alt: 'wow reaction' },
        sad: { src: sadReaction, alt: 'sad reaction' },
        angry: { src: angryReaction, alt: 'angry reaction' },
    };

    const [isOverlayVisible, setIsOverlayVisible ] = useState(false)

    const handleCommentReaction = async (newReaction) => {
        toast.success("To be implemented")
    }

    const reactionTypes = ['like', 'heart', 'haha', 'wow', 'sad', 'angry']

    const [currentUserReaction, setCurrentUserReaction] = useState('')
    const [allReactions, setAllReactions] = useState([])

    return (
        <div className="flex flex-row w-full items-start mih-h-[60px] max-h-fit gap-2">
            <Image src={authorPhotoURL} alt={authorUsername} 
                width={40} height={40} className="rounded-full aspect-square object-cover" />

            <div className="flex flex-col w-full">
                {/* add bg and border later */}
                <div className="flex flex-col gap-1 w-full items-start break-all py-2 px-3 text-sm rounded-xl drop-shadow-sm bg-off_white dark:bg-gray"> 

                    <div>
                        <span className='font-bold'>{authorDisplayName}</span>
                        <span className='font-bold'> · </span>
                        <Link href={`/user/${authorUsername}`} className='hover:font-bold transition-all'> @{authorUsername}</Link>
                    </div> 

                    <div>
                        <p>{commentBody}</p>
                    </div>

                    <div className="flex flex-row w-full text-xs gap-2 pl-1 mt-1">
                        <div id='like-control'
                            className='flex items-center justify-center'
                            onMouseEnter={() => setIsOverlayVisible(true)}
                            onMouseLeave={() => setIsOverlayVisible(false)}
                        >
                            {currentUserReaction === '' && 
                                <i 
                                    className={`fa-solid fa-heart hover:text-muted_blue dark:hover:text-light_yellow hover:cursor-pointer transition-all ${isOverlayVisible? "" : ""}`}
                                    onMouseEnter={() => setIsOverlayVisible(true)}
                                    onMouseLeave={() => setIsOverlayVisible(false)}
                                />
                            }

                            {currentUserReaction !== '' &&(
                                <div className='flex flex-row gap-1'>
                                    <Image
                                        src={reactionImages[currentUserReaction].src}
                                        alt={reactionImages[currentUserReaction].alt}
                                        className={`mt-[1px] w-fit h-[15px] flex items-center justify-center hover:transform transition-all `}
                                        onMouseEnter={() => setIsOverlayVisible(true)}
                                        onMouseLeave={() => setIsOverlayVisible(false)} 
                                    />

                                    <p className='capitalize font-semibold text-[12px] flex items-center'>
                                        {currentUserReaction}
                                    </p>
                                </div>
                            )}

                            {isOverlayVisible && (
                                <div 
                                    onMouseEnter={() => setIsOverlayVisible(true)}
                                    onMouseLeave={() => setIsOverlayVisible(false)}
                                    id='overlay' 
                                    className='absolute top-13 left-0 flex flex-row gap-2 w-[240px] h-[45px] justify-center items-center bg-dark_gray rounded-full drop-shadow-sm transition-all' 
                                >
                                    <Image 
                                    src={likeReaction} 
                                    alt="like reaction" 
                                    className='w-fit h-[30px] hover:scale-125 hover:transform transition-all'
                                    onClick={() => handleCommentReaction('like')}
                                    />
                                    <Image 
                                    src={heartReaction} 
                                    alt="like reaction" 
                                    className='w-fit h-[30px] hover:scale-125 hover:transform transition-all'
                                    onClick={() => handleCommentReaction('heart')}
                                    />
                                    <Image 
                                    src={laughReaction} 
                                    alt="like reaction" 
                                    className='w-fit h-[30px] hover:scale-125 hover:transform transition-all'
                                    onClick={() => handleCommentReaction('haha')}
                                    />
                                    <Image 
                                    src={wowReaction} 
                                    alt="like reaction" 
                                    className='w-fit h-[30px] hover:scale-125 hover:transform transition-all'
                                    onClick={() => handleCommentReaction('wow')}
                                    />
                                    <Image 
                                    src={sadReaction} 
                                    alt="like reaction" 
                                    className='w-fit h-[30px] hover:scale-125 hover:transform transition-all'
                                    onClick={() => handleCommentReaction('sad')}
                                    />
                                    <Image 
                                    src={angryReaction} 
                                    alt="like reaction" 
                                    className='w-fit h-[30px] hover:scale-125 hover:transform transition-all'
                                    onClick={() => handleCommentReaction('angry')}
                                    />
                                </div>
                            )}
                        </div>

                        <div id="reply-control">

                        </div>

                        { currentUser.uid === authorID && (
                            <div className="flex gap-2">
                                <div id="edit-control" className="hover:underline cursor-pointer">
                                    Edit
                                </div>

                                <Dialog>
                                    <DialogTrigger className="hover:underline cursor-pointer">
                                        Delete
                                    </DialogTrigger>
                                    <DialogContent className="w-full h-fit">
                                        <DialogHeader>
                                            <DialogTitle>
                                                Delete Comment
                                            </DialogTitle>
                                        </DialogHeader>
                                        Are you sure you want to delete this comment?

                                         <DialogFooter className="flex flex-row gap-2 w-full">
                                            <DialogClose>
                                                <Button className="bg-white  text-black dark:text-white dark:bg-dark_gray hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black">
                                                    Cancel
                                                </Button>
                                            </DialogClose>
                                            <Button
                                                onClick={() => handleDeleteComment()}
                                            >
                                                Delete
                                            </Button>
                                         </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        )}

                        <div id="date-control" className="flex gap-2 items-center">
                            {formatCommentDate()}
                    
                            {isEdited ? 
                                <div className='italic text-xs'>
                                    Edited
                                </div>
                            : null}
                        </div>
                    </div>


                </div>
            </div>
        </div>
    )
}