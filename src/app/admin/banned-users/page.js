"use client"

import { useEffect, useState } from "react";
import { isEqual } from 'lodash';

import { auth, firestore } from "@/lib/firebase";
import { getReportedPosts, getDocumentsWithCondition } from "@/lib/firestore-crud";

import WithAuth from "@/components/WithAuth";
import { ModeToggle } from "@/components/mode-toggle";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Loader from "@/components/Loader";
import AdminNav from "@/components/nav/admin/admin-nav";
import { ReportSnippet } from "@/components/admin/reported-post-snippet";
import AdminNotifications from "@/components/nav/admin/notifications-tab";
import { BannedUserSnippet } from "@/components/admin/banned-user-snippet";

function BannedUsersPage() {
    const [loading, setLoading] = useState(true);
    const [ postsLoading, setPostsLoading] = useState(false);
    const [ currentUser, setCurrentUser ] = useState([]);
    const [ notifications, setNotifications ] = useState([]);

    const [ reportedPosts, setReportedPosts ] = useState([]);
    const [ filteredReports, setFilteredReports ] = useState([]);

    const [ bannedUsers, setBannedUsers] = useState([]);
    const [ filteredUsers, setFilteredUsers ] = useState([]);

    const [ filter, setFilter ] = useState("all");
    const [ sort, setSort ] = useState("newest");

    useEffect(() => {
        setLoading(true); 

        
        async function fetchBannedUsers() {
            try {
                const data = await firestore.collection('users').where('ban.status', '!=', 'none').get();
                const bannedUsers = data.docs.map(doc => doc.data());
                setBannedUsers(bannedUsers);
                setLoading(false);
                
            } catch (error) {
                console.error("Error fetching banned users:", error);
                setLoading(false);
            }
        }

        async function fetchReportedPosts() {
            try {
                const postDocs = await getDocumentsWithCondition('posts', 'reports', ">", [] );
                setReportedPosts(postDocs);

            } catch (error) {
                console.error("Error fetching reported posts:", error);
            }
        }

        async function getAdminNotifications() {
            const user = await auth.currentUser;
            if (user) {
                const adminNotifs = await firestore.collection('admin').doc(user.uid).collection('notifications').get();
                const notifs = adminNotifs.docs.map(doc => doc.data());
                setNotifications(notifs);
            }
        }

        fetchBannedUsers();
        fetchReportedPosts();
        getAdminNotifications();
    }, []);

    useEffect(() => {
        let unsubscribe

        if (bannedUsers) {
            const usersRef = firestore.collection('users').where('ban.status', "!=", "none"); // Matches if 'reports' is not empty

            unsubscribe = usersRef.onSnapshot((querySnapshot) => {
                
                const userDocs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                if (!isEqual(userDocs, bannedUsers)){
                    setBannedUsers(userDocs);
                }
            });
        }
       
        return () => unsubscribe(); // Clean up the listener when the component unmounts
    }, [bannedUsers]);

    useEffect(() => {
        if (filter === "temporary") {
            const temporaryBans = bannedUsers.filter((user) => user.ban.status === "temporary");
            setFilteredUsers(temporaryBans);
        } else if (filter === "permanent") {
            const permanentBans = bannedUsers.filter((user) => user.ban.status === "permanent");
            setFilteredUsers(permanentBans);
        } else {
            setFilteredUsers(bannedUsers);
        }
    }, [filter, bannedUsers]);

    useEffect(() => {
        if (sort === "newest") {
            const sortedUsers = [...filteredUsers].sort((a, b) => {
                const latestBannedAtA = a.ban.createdAt;
                const latestBannedAtB = b.ban.createdAt;
                return new Date(latestBannedAtB) - new Date(latestBannedAtA);
            });
            if (!isEqual(sortedUsers, filteredUsers)) {
                setFilteredUsers(sortedUsers);
            }
        } else if (sort === "oldest") {
            const sortedUsers = [...filteredUsers].sort((a, b) => {
                const latestBannedAtA = a.ban.createdAt;
                const latestBannedAtB = b.ban.createdAt;
                return new Date(latestBannedAtA) - new Date(latestBannedAtB);
            });
            if (!isEqual(sortedUsers, filteredUsers)) {
                setFilteredUsers(sortedUsers);
            }
        } else if (sort === "shortest") {
            const sortedUsers = [...filteredUsers].sort((a, b) => {
                const bannedDurationA = a.ban.until - a.ban.createdAt;
                const bannedDurationB = b.ban.until - b.ban.createdAt;
                return bannedDurationA - bannedDurationB;
            });
            if (!isEqual(sortedUsers, filteredUsers)) {
                setFilteredUsers(sortedUsers);
            }
        } else if (sort === "longest") {
            const sortedUsers = [...filteredUsers].sort((a, b) => {
                const bannedDurationA = a.ban.until - a.ban.createdAt;
                const bannedDurationB = b.ban.until - b.ban.createdAt;
                return bannedDurationB - bannedDurationA;
            });
            if (!isEqual(sortedUsers, filteredUsers)) {
                setFilteredUsers(sortedUsers);
            }
        }
    }, [sort, filteredUsers]);

    return (
        <>
        { loading ? <Loader show={true} /> : (currentUser && 
            <div className="flex">
                    <div className="w-80 fixed h-screen">
                        <AdminNav props={{notifications: notifications}}/>
                    </div>
                    <div className="ml-80 w-full flex flex-col">
                        <div className="flex flex-row w-full border-b border-gray shadow-lg p-4 sticky top-0 bg-background z-10 items-center justify-between">
                            <h1 className="text-2xl font-semibold text-primary tracking-wider">Banned Users</h1>

                            <div className="flex flex-row gap-8">
                                {/* Add a filter dropdown */}
                                <div className="flex items-center border border-primary rounded-md">
                                    <Select required onValueChange={(value) => setFilter(value)} defaultValue="all">
                                        <SelectTrigger className="w-full text-primary text-md tracking-wide">
                                            Filter
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="temporary">Temporary</SelectItem>
                                            <SelectItem value="permanent">Permanent</SelectItem>
                                            <SelectItem value="all">None</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* Add a sort dropdown */}
                                <div className="flex items-center border border-primary rounded-md">
                                    <Select required onValueChange={(value) => setSort(value)} defaultValue="newest">
                                        <SelectTrigger className="w-full text-primary text-md tracking-wide">
                                            Sort
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="newest">Newest</SelectItem>
                                            <SelectItem value="oldest">Oldest</SelectItem>
                                            <SelectItem value="shortest">Shortest</SelectItem>
                                            <SelectItem value="longest">Longest</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                        </div>
                        <div className="items-center flex flex-col mt-8">
                            {filteredUsers && filteredUsers.map((user, index) => (
                                <div key={index} className="w-3/5 mb-4"> {/* Add a key for the outer container */}
                                    <BannedUserSnippet user={user} reportedPosts={reportedPosts.filter((post) => post.authorID === user.uid)}/>
                                </div>
                            ))}
                        </div>


                    </div>
                    


            </div>
        )}
        </>
    )
}

export default WithAuth(BannedUsersPage);