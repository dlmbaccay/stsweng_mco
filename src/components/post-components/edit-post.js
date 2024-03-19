import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

export function EditPost({ post }) {
    const [loading, setLoading] = useState(false);
    const [postContent, setPostContent] = useState(post.content);
    const [postCategory, setPostCategory] = useState(post.category);

    const updatePost = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('postID', post.postID);
            formData.append('postContent', postContent);
            formData.append('postCategory', postCategory == '' ? 'General' : postCategory);
            formData.append('isEdited', true);
            // console.log('FormData before fetch:', formData);

            const response = await fetch('/api/posts/edit-post', {
                method: 'POST',
                body: formData,
            });
            // console.log('Response:', response);

            if (response.ok) {
                toast.success("Post updated successfully!");
            } else {
                toast.error('Error updating post. Please try again.');
            }
        } catch (error) {
            console.error('Error updating post:', error);
            toast.error("An error occurred while updating the post.");
        } finally {
            setLoading(false);
        }
    };



    return (
        <Dialog>
            <DialogTrigger asChild>
                <i
                    id="edit-control"
                    className="fa-solid fa-pencil hover:text-muted_blue dark:hover:text-light_yellow hover:cursor-pointer transition-all"
                />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] lg:max-w-[720px]">
                <DialogHeader>
                    <DialogTitle className="text-center">Edit Post</DialogTitle>
                </DialogHeader>
                <hr className="border-b border-muted_blue dark:border-light_yellow my-2 mx-4" />
                <form onSubmit={updatePost}>
                    <div className="flex flex-col w-full mb-4">
                        <div className="flex flex-col w-full px-10">
                            <div className="flex justify-end w-full">
                                <Select required onValueChange={(value) => setPostCategory(value)} value={postCategory}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="General">General</SelectItem>
                                        <SelectItem value="Q&A">Q&A</SelectItem>
                                        <SelectItem value="Tips">Tips</SelectItem>
                                        <SelectItem value="Pet Needs">Pet Needs</SelectItem>
                                        <SelectItem value="Milestones">Milestones</SelectItem>
                                        <SelectItem value="Lost Pets">Lost Pets</SelectItem>
                                        <SelectItem value="Unknown Owner">Unknown Owner</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* <div className="flex flex-col w-full">
                                <label htmlFor="location" className="my-2">Location</label>
                                <input
                                    type="text"
                                    id="location"
                                    placeholder="Enter location"
                                    className="p-2 rounded-md w-full"
                                    // value={postLocation}
                                    onChange={(e) => setPostLocation(e.target.value)}
                                />
                            </div> */}
                            <Textarea
                                type="text"
                                id="post-content"
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                placeholder="What's on your mind?"
                                className={`my-4 p-2 rounded-md w-full`}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        {loading ?
                            <Button disabled>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please wait
                            </Button>
                            :
                            <Button type="submit" className="mt-6">Update Post</Button>
                        }
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
