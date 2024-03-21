import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import { handleDateFormat } from "@/lib/helper-functions"
import { firestore } from "@/lib/firebase"
import { onSnapshot, getDocs, collection } from "firebase/firestore"

import { Card, CardContent } from "@/components/ui/card"
import { DeletePost } from "@/components/post-components/delete-post"
import { EditPost } from "@/components/post-components/edit-post";
import { ReportPost } from "@/components/post-components/report-components/report-post"

import likeReaction from '/public/images/post-reactions/like.png'
import heartReaction from '/public/images/post-reactions/heart.png'
import laughReaction from '/public/images/post-reactions/haha.png'
import wowReaction from '/public/images/post-reactions/wow.png'
import sadReaction from '/public/images/post-reactions/sad.png'
import angryReaction from '/public/images/post-reactions/angry.png'

import ExpandedRepost from "@/components/post-components/repost-expanded"

export function RepostSnippet({post, currentUser}) {
    const [commentsLength, setCommentsLength] = useState(0);
    const [reactionsLength, setReactionsLength] = useState(0);
    const [currentUserReaction, setCurrentUserReaction] = useState('');
    const [reactionOverlayVisible, setReactionOverlayVisible] = useState(false);

    useEffect(() => {
        const commentsRef = firestore.collection('posts').doc(post.postID).collection('comments');
        const reactionsRef = firestore.collection('posts').doc(post.postID).collection('reactions');

        const unsubscribeComments = onSnapshot(commentsRef, async (snapshot) => {
            let totalComments = snapshot.size;

            for (let doc of snapshot.docs) {
                const repliesSnapshot = await getDocs(collection(doc.ref, 'replies'));
                totalComments += repliesSnapshot.size;
            }

            setCommentsLength(totalComments);
        });

        const unsubscribeReactions = onSnapshot(reactionsRef, async (snapshot) => {
            let totalReactions = 0;
            let currentUserReaction = null;

            const reactionTypes = ['like', 'heart', 'haha', 'wow', 'sad', 'angry']; // Replace with your actual reaction types

            for (let doc of snapshot.docs) {
                const reactionData = doc.data();
                totalReactions += reactionData.userIDs.length;

                if (reactionData.userIDs.includes(currentUser.uid)) {
                    currentUserReaction = reactionTypes.find(type => type === doc.id);
                }
            }

            setReactionsLength(totalReactions);
            setCurrentUserReaction(currentUserReaction);
        });

        // Clean up the subscriptions on unmount
        return () => {
            unsubscribeComments();
            unsubscribeReactions();
        };
    }, [post.postID, currentUser.uid]);

    const handleReaction = async (newReaction) => {
      const reactionsRef = firestore.collection('posts').doc(post.postID).collection('reactions');
      const reactionTypes = ['like', 'heart', 'haha', 'wow', 'sad', 'angry']; // Replace with your actual reaction types
      const notificationsRef = firestore.collection('users').doc(post.authorID).collection('notifications');

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
            
            if (currentUser.uid !== post.authorID) {
              // Create a new document in the notificationsRef collection
              const notificationRef = notificationsRef.doc();
              await notificationRef.set({
                userID: currentUser.uid,
                action: "reacted to your post!",
                date: new Date().toISOString(), // Get the server timestamp
                postID: post.postID,
                userPhotoURL: currentUser.userPhotoURL,
                displayname: currentUser.displayName,
                username: currentUser.username,
              });
            }
            }
        } else if (reaction === newReaction) {
          // Reaction does not exist, create reaction and add user to userIDs array
          await reactionRef.set({ userIDs: [currentUser.uid] });

          if (currentUser.uid !== post.authorID) {
            // Create a new document in the notificationsRef collection
            const notificationRef = notificationsRef.doc();
            await notificationRef.set({
              userID: currentUser.uid,
              action: "reacted to your post!",
              date: new Date().toISOString(),  // Get the server timestamp
              postID: post.postID,
                userPhotoURL: currentUser.userPhotoURL,
                displayname: currentUser.displayName,
                username: currentUser.username,
            });
          }
        }
      }

      setReactionOverlayVisible(false);
    }

    return (
        (post.postType === 'Repost' &&
            <Dialog>
                <Card className="w-full drop-shadow-md hover:drop-shadow-md min-h-fit rounded-md p-6 flex flex-col">

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
                                    
                                    { post.isEdited ? 
                                        (
                                            <div className="relative flex flex-row items-center gap-2 group">
                                                <i className="hover-tooltip fa-solid fa-clock-rotate-left text-[10px] md:text-xs"/>
                                                <p className="edited-post-tooltip hidden group-hover:block text-xs">Edited Post</p>
                                            </div>
                                        ) : null
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* body */}
                    <div id="post-body" className='mt-2 md:mt-3 flex flex-col'>
                        { post.content !== '' && post.content !== null && post.content !== undefined &&
                            <div id="post-content" className="flex flex-col mt-1">
                                <p className="text-sm md:text-base">{post.content}</p>
                            </div>
                        }

                        {/* reposted post */}
                        <div id="reposted-post" className="flex flex-col mt-4 border border-black dark:border-white rounded-md p-4">

                            <div className="flex flex-row justify-start items-start">
                                <div id="author-image">
                                    <Image src={post.originalPostAuthorPhotoURL ? post.originalPostAuthorPhotoURL : "/images/profilePictureHolder.jpg"} alt="author photo" width={50} height={50} className="rounded-full drop-shadow-sm aspect-square object-cover h-[40px] w-[40px] md:h-[45px] md:w-[45px]" />
                                </div>

                                <div id="post-meta" className="ml-4 items-center justify-center">
                                    <div id="user-meta" className="flex flex-row gap-2 text-sm md:text-base">
                                        <div id="display-name">
                                            <p className="font-bold">{post.originalPostAuthorDisplayName}</p>
                                        </div>
                                        <div className='font-bold'>·</div>
                                        <Link href={`/user/${post.originalPostAuthorUsername}`} id="username" className="hover:text-muted_blue dark:hover:text-light_yellow hover:font-bold transition-all">
                                            <p>@{post.originalPostAuthorUsername}</p>
                                        </Link>
                                    </div>
                                    
                                    <div id="publish-date" className="flex flex-row gap-2 items-center">
                                        <p className="text-xs md:text-sm">{handleDateFormat(post.originalPostDate)}</p>
                                    </div>
                                </div>
                            </div>


                            <div id="reposted-post-content" className="flex flex-row items-start justify-between mt-4 gap-8">
                                <p className="text-sm md:text-base">{post.originalPostContent}</p>

                                {/* original post images, if any (only show the first one) */}
                                { post.originalPostMedia && post.originalPostMedia.length > 0 &&
                                    <div id="reposted-post-images" className="flex">
                                        <Image
                                            src={post.originalPostMedia[0]}
                                            alt="reposted post image"
                                            width={100}
                                            height={100}
                                            className="rounded-md drop-shadow-sm aspect-square object-cover"
                                        />
                                    </div>
                                }
                            </div>
                        </div>      
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
                                            onClick={() => handleReaction('like')}
                                        />
                                        <Image 
                                            src={heartReaction} 
                                            alt="like reaction" 
                                            className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                                            onClick={() => handleReaction('heart')}
                                        />
                                        <Image 
                                            src={laughReaction} 
                                            alt="like reaction" 
                                            className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                                            onClick={() => handleReaction('haha')}
                                        />
                                        <Image 
                                            src={wowReaction} 
                                            alt="like reaction" 
                                            className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                                            onClick={() => handleReaction('wow')}
                                        />
                                        <Image 
                                            src={sadReaction} 
                                            alt="like reaction" 
                                            className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                                            onClick={() => handleReaction('sad')}
                                        />
                                        <Image 
                                            src={angryReaction} 
                                            alt="like reaction" 
                                            className='w-fit h-[40px] hover:scale-125 hover:transform transition-all'
                                            onClick={() => handleReaction('angry')}
                                        />
                                    </div>
                                )}
                            </div>

                            <div id="comment-control" className="flex flex-row justify-center items-center gap-2">
                                <DialogTrigger asChild>
                                <i
                                    className="fa-solid fa-comment hover:text-muted_blue dark:hover:text-light_yellow hover:cursor-pointer transition-all" />
                                </DialogTrigger>
                                <p>{commentsLength}</p>
                            </div>

                            <div id="share-control">
                                <DialogTrigger asChild>
                                <i
                                    className="fa-solid fa-share hover:text-muted_blue dark:hover:text-light_yellow hover:cursor-pointer transition-all" />
                                </DialogTrigger>
                            </div>
                        </div>

                        <div id="right" className="flex flex-row gap-4 items-center text-sm md:text-base">
                            {currentUser.uid !== post.authorID && 
                                <div>
                                    <ReportPost props={{
                                        currentUser: currentUser,
                                        post: post,
                                        postReports: post.reports,
                                    }}/>
                                </div>
                                
                            }

                            {currentUser.uid === post.authorID && 
                                <>
                                    <EditPost props={{
                                                postID: post.postID,
                                                postIsEdited: post.isEdited,
                                                content: post.content,
                                                category: post.category,
                                                postType: post.postType
                                            }}/>

                                    <DeletePost postID={post.postID}/>
                                </>
                            }
                        </div>
                    </div>
                </Card>

                 <DialogContent className="sm:min-w-full md:min-w-[750px] h-[95%] flex flex-col items-start justify-center p-2">
                    <DialogHeader className="flex items-center justify-center w-full">
                        <DialogTitle className="text-md">{post.authorDisplayName}&apos;s Post</DialogTitle>
                    </DialogHeader>
                    <ExpandedRepost post={post} currentUser={currentUser} />
                 </DialogContent>
            </Dialog>
        )
    )
}