import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

// fetch existing post data
const fetchPostData = async (postID) => {
    
//  TODO: implement logic to fetch post data
 return {
    content: 'Initial post content',
    category: 'General',
 };
};

export function EditPost({ postID }) {
 const [loading, setLoading] = useState(false);
 const [postContent, setPostContent] = useState('');
 const [postCategory, setPostCategory] = useState('');

 useEffect(() => {
    if (postID) {
      fetchPostData(postID).then(data => {
        setPostContent(data.content);
        setPostCategory(data.category);
      });
    }
 }, [postID]);

 const updatePost = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('postID', postID);
      formData.append('postContent', postContent);
      formData.append('postCategory', postCategory);

      await fetch('/api/posts/update-post', {
        method: 'POST',
        body: formData,
      }).then(response => response.json()).then(async data => {
        console.log(data);
        setLoading(false);
        toast.success("Post updated successfully!");
        // Reset form or close dialog
      });
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast.error("Error updating post. Please try again later.");
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
            <hr className="border-b border-muted_blue dark:border-light_yellow my-2 mx-4"/>
            <form onSubmit={updatePost}>
            <div className="flex flex-col w-full mb-4">
                {/* Adjusted layout for the select element, location input, and textarea */}
                <div className="flex flex-col w-full px-10">
                {/* Post Category Select */}
                <div className="flex justify-end w-full">
                    <Select required onValueChange={(value) => setPostCategory(value)} defaultValue={postCategory}>
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
                {/* Location Input */}
                <div className="flex flex-col w-full">
                    <label htmlFor="location" className="my-2">Location</label>
                    <input
                    type="text"
                    id="location"
                    placeholder="Enter location"
                    className="p-2 rounded-md w-full"
                    // Add state management for location here
                    />
                </div>
                {/* Post Content Textarea */}
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
                :   <Button type="submit" className="mt-6">Update Post</Button>}
            </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>

 );
}
