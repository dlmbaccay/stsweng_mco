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
import { Reply } from "./reply"

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

    const [isEditingComment, setIsEditingComment] = useState(false)
    const [newCommentBody, setNewCommentBody] = useState(commentBody)

    const handleEditComment = async (event) => {
        event.preventDefault();

        if (newCommentBody === '') {
            toast.error('Comment cannot be empty.');
            return;
        }
        // call edit api
        // if success, update comment in state

        try {
            const response = await fetch('/api/posts/comment-post/edit-comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ postID, commentID, newCommentBody }),
            });

            if (response.ok) { 
                toast.success('Comment updated successfully!');
            } else {
                toast.error('Error updating comment. Please try again.');
            }
        } catch (error) {
            console.error('Error updating comment:', error);
            toast.error('An error occurred while updating the comment.');
        } finally {
            setIsEditingComment(false);
            router.refresh();
        }
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

    const handleReply = async (event) => {
        event.preventDefault();

        if (replyBody === '') {
            toast.error('Reply cannot be empty.');
            return;
        }

        // call reply api
        // if success, add reply to state
        try {
            const formData = new FormData();
            formData.append('postID', postID);
            formData.append('commentID', commentID);
            formData.append('postAuthorID', postAuthorID);
            formData.append('postAuthorDisplayName', postAuthorDisplayName);
            formData.append('postAuthorUsername', postAuthorUsername);
            formData.append('postAuthorPhotoURL', postAuthorPhotoURL);
            formData.append('replyBody', replyBody);
            formData.append('replyDate', new Date().toISOString());
            formData.append('authorID', currentUser.uid);
            formData.append('authorDisplayName', currentUser.displayName);
            formData.append('authorUsername', currentUser.username);
            formData.append('authorPhotoURL', currentUser.userPhotoURL);

            const response = await fetch('/api/posts/comment-post/reply', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                toast.success('Reply added successfully!');
            } else {
                toast.error('Error adding reply. Please try again.');
            }
        } catch (error) {
            console.error('Error adding reply:', error);
            toast.error('An error occurred while adding the reply.');
        } finally {
            setIsReplying(false);
            setReplyBody('');
            router.refresh();
        }
    }

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
        const reactionsRef = firestore.collection('posts').doc(postID).collection('comments').doc(commentID).collection('reactions');
        const reactionTypes = ['like', 'heart', 'haha', 'wow', 'sad', 'angry']; // Replace with your actual reaction types

        for (let reaction of reactionTypes) {
            const reactionRef = reactionsRef.doc(reaction);
            const reactionDoc = await reactionRef.get();

            if (reactionDoc.exists) {
                const reactionData = reactionDoc.data();
                const userIDs = reactionData.userIDs;

                if (userIDs.includes(currentUser.uid)) {
                    if (reaction === newReaction) {
                        // User has reacted with the same type again, remove user from userIDs array
                        const updatedUserIDs = userIDs.filter((userID) => userID !== currentUser.uid);
                        await reactionRef.update({ userIDs: updatedUserIDs });
                        setCurrentUserReaction('');
                    } else {
                        // User has reacted with a different type, remove user from current userIDs array
                        const updatedUserIDs = userIDs.filter((userID) => userID !== currentUser.uid);
                        await reactionRef.update({ userIDs: updatedUserIDs });
                    }
                } else if (reaction === newReaction) {
                    // User has not reacted with this type, add user to userIDs array
                    await reactionRef.update({ userIDs: [...userIDs, currentUser.uid] });

                    const notificationsRef = firestore.collection('users').doc(authorID).collection('notifications');
                    if (currentUser.uid !== authorID) {
                        // Create a new document in the notificationsRef collection
                        const notificationRef = notificationsRef.doc();
                        await notificationRef.set({
                            userID: currentUser.uid,
                            action: "reacted to your comment!",
                            date: new Date().toISOString(), // Get the server timestamp
                            postID: postID,
                            userPhotoURL: currentUser.userPhotoURL,
                            displayname: currentUser.displayName,
                            username: currentUser.username,
                        });
                        }
                }
            } else if (reaction === newReaction) {
                // Reaction does not exist, create reaction and add user to userIDs array
                await reactionRef.set({ userIDs: [currentUser.uid] });

                const notificationsRef = firestore.collection('users').doc(authorID).collection('notifications');
                if (currentUser.uid !== authorID) {
                    // Create a new document in the notificationsRef collection
                    const notificationRef = notificationsRef.doc();
                    await notificationRef.set({
                        userID: currentUser.uid,
                        action: "reacted to your comment!",
                        date: new Date().toISOString(), // Get the server timestamp
                        postID: postID,
                        userPhotoURL: currentUser.userPhotoURL,
                        displayname: currentUser.displayName,
                        username: currentUser.username,
                    });
                }
            }
        }
    }

    const reactionTypes = ['like', 'heart', 'haha', 'wow', 'sad', 'angry']

    const [currentUserReaction, setCurrentUserReaction] = useState('')
    const [allReactions, setAllReactions] = useState([])

    useEffect(() => {
        const reactionsRef = firestore.collection('posts').doc(postID).collection('comments').doc(commentID).collection('reactions');
        const unsubscribe = reactionsRef.onSnapshot((snapshot) => {
            let currentUserReaction = '';
            let allReactions = [];

            snapshot.docs.forEach(doc => {
                const reaction = doc.id;
                const userIDs = doc.data().userIDs;

                if (reactionTypes.includes(reaction)) {
                    if (userIDs.includes(currentUser.uid)) {
                        currentUserReaction = reaction;
                    }
                    allReactions.push({ reaction: reaction, userIDs: userIDs });
                }
            });

            setCurrentUserReaction(currentUserReaction);
            setAllReactions(allReactions);
        })

        return unsubscribe;
    }, [])

    useEffect(() => {
        // Fetch replies from firestore
        const repliesRef = firestore.collection('posts').doc(postID).collection('comments').doc(commentID).collection('replies');
        const unsubscribe = repliesRef.onSnapshot((snapshot) => {
            let replies = [];

            snapshot.docs.forEach(doc => {
                const reply = doc.data();
                replies.push(reply);
            });

            setReplies(replies);
        });

        return unsubscribe;
    }, []);

    return (
        <div className="flex flex-row w-full items-start mih-h-[60px] max-h-fit gap-2">
            <Image src={authorPhotoURL} alt={authorUsername} 
                width={40} height={40} className="rounded-full aspect-square object-cover" />

            <div className="flex flex-col w-full">
                <div className="flex flex-col gap-1 w-full items-start break-all py-2 px-3 text-sm rounded-xl drop-shadow-sm bg-off_white dark:bg-gray"> 

                    <div>
                        <span className='font-bold'>{authorDisplayName}</span>
                        <span className='font-bold'> · </span>
                        <Link href={`/user/${authorUsername}`} className='hover:font-bold transition-all'> @{authorUsername}</Link>
                    </div> 

                    { !isEditingComment && (
                        <div>
                            <p>{commentBody}</p>

                            {/* if each reaction's userIDs are not 0 */}
                            {allReactions.filter((reaction) => reaction.userIDs.length > 0).length > 0 && (
                                <div className='flex flex-row gap-2 items-center mt-2'>
                                    {allReactions.filter((reaction) => reaction.userIDs.length > 0).map((reaction, index) => (
                                        <div key={index} className='flex flex-row gap-1 items-center'>
                                            <Image 
                                                src={reactionImages[reaction.reaction].src} 
                                                alt={reactionImages[reaction.reaction].alt} 
                                                className='w-[15px] h-[15px] rounded-full' 
                                            />
                                            <p className='text-xs'>{reaction.userIDs.length}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    { isEditingComment && (
                        <form 
                            className="flex flex-row w-full"
                            onSubmit={(event) => { handleEditComment(event) }}>
                            <textarea
                                value={newCommentBody}
                                onChange={(event) => setNewCommentBody(event.target.value)}
                                maxLength={100}
                                // onKeyDown={(event => {
                                //     if (event.key === 'Enter') {
                                //         handleEditComment(event);
                                //     }
                                // })}
                                placeholder='Write a comment...'
                                className={`outline-none resize-none border-t border-l border-b border-[#d1d1d1] text-sm rounded-l-md text-raisin_black w-full p-3 transition-all h-[80px]`}
                            />

                            <div className='flex flex-col h-[80px] w-[40px] bg-black text-white dark:bg-white dark:text-black border-white items-center justify-center text-xs rounded-r-md'>
                                <button type='submit' 
                                    className='flex items-center h-1/2 w-full justify-center rounded-rt-md rounded-tr-md hover:bg-light_yellow hover:text-black dark:hover:text-white dark:hover:bg-muted_blue transition-all'>
                                    <i className='fa-solid fa-check h-1/2 flex items-center' />
                                </button>
                                <button type='button' 
                                    onClick={() => {
                                        setIsEditingComment(false);
                                        setNewCommentBody(commentBody);
                                    }} 
                                    className='flex items-center h-1/2 w-full justify-center rounded-br-md rounded-rb-md hover:bg-light_yellow hover:text-black dark:hover:text-white dark:hover:bg-muted_blue transition-all'>
                                    <i className='fa-solid fa-xmark h-1/2 flex items-center' />
                                </button>
                            </div>
                        </form>
                    )}      

                    <div className="flex flex-row w-full text-xs gap-2 mt-1">
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

                        <div id='reply-control' 
                            className='hover:underline cursor-pointer flex items-center justify-center' 
                            onClick={() => {
                                setIsReplying(true);
                                setTimeout(() => {
                                    const replyBody = document.getElementById(`reply-${commentID}`);
                                    if (replyBody) replyBody.focus();
                                }, 0);
                            }}
                        >
                            Reply
                        </div>

                        { currentUser.uid === authorID && (
                            <div className="flex gap-2">
                                <div 
                                    id="edit-control"
                                    className="hover:underline cursor-pointer"
                                    onClick={() => setIsEditingComment(true)}
                                >
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
                    
                    {replies.length > 0 && (
                        <div className='mt-3 flex flex-col w-full h-fit gap-2 justify-start items-start'>
                            {replies.map((reply, index) => (
                                <div key={reply.replyID} className='w-full h-fit'>
                                    <Reply 
                                        props = {{
                                            currentUser: currentUser,
                                            postID: postID,
                                            postAuthorID: postAuthorID,
                                            postAuthorDisplayName: postAuthorDisplayName,
                                            postAuthorUsername: postAuthorUsername,
                                            postAuthorPhotoURL: postAuthorPhotoURL,
                                            commentID: commentID,
                                            replyID: reply.replyID,
                                            replyBody: reply.replyBody,
                                            replyDate: reply.replyDate,
                                            authorID: reply.authorID,
                                            authorDisplayName: reply.authorDisplayName,
                                            authorUsername: reply.authorUsername,
                                            authorPhotoURL: reply.authorPhotoURL,
                                            isEdited: reply.isEdited,
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {isReplying && 
                        <div className='flex flex-row w-full mt-2 mb-2'>
                            <form 
                                onSubmit={(event) => {
                                    handleReply(event);
                                }}
                                className='flex flex-row w-full items-start justify-center h-full'>
                                <div className='flex aspect-square w-[40px] h-[40px] mr-2 mt-1'>
                                    <Image src={currentUser.userPhotoURL} alt="user image" width={40} height={40} className='rounded-full drop-shadow-sm '/>
                                </div>

                                <textarea 
                                    id={`reply-${commentID}`}
                                    value={replyBody}
                                    onChange={(event) => setReplyBody(event.target.value)}
                                    maxLength={100}
                                    // onKeyDown={(event => {
                                    //     if (event.key === 'Enter') {
                                    //         handleReply(event);
                                    //     }
                                    // })}
                                    placeholder='Write a reply...' 
                                    className={`outline-none resize-none border border-[#d1d1d1] bg-white dark:bg-black text-sm rounded-xl text-raisin_black w-full p-3 transition-all h-[60px]`}
                                />

                                <button
                                    type='submit'
                                    className='flex rounded-full aspect-square w-[40px] h-[40px] mt-1 bg-muted_blue text-white hover:opacity-80 dark:bg-light_yellow dark:text-black items-center justify-center ml-2 hover:bg-grass hover:text-snow '>
                                    <i className='fa-solid fa-paper-plane text-sm'></i>
                                </button>
                            </form>
                        </div>
                    }

                </div>
            </div>
        </div>
    )
}