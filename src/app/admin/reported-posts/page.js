"use client"

import { useEffect, useState } from "react";
import { isEqual } from 'lodash';

import { auth, firestore } from "@/lib/firebase";
import { getReportedPosts } from "@/lib/firestore-crud";

import WithAuth from "@/components/WithAuth";
import { ModeToggle } from "@/components/mode-toggle";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Loader from "@/components/Loader";
import AdminNav from "@/components/nav/admin-nav";
import { ReportSnippet } from "@/components/post-components/report-components/reported-post-snippet";

function AdminPage() {
    const [loading, setLoading] = useState(true);
    const [ postsLoading, setPostsLoading] = useState(false);
    const [ currentUser, setCurrentUser ] = useState([]);

    const [ reportedPosts, setReportedPosts ] = useState([]);
    const [ filteredReports, setFilteredReports ] = useState([]);

    const [ filter, setFilter ] = useState("all");
    const [ sort, setSort ] = useState("newest");

    useEffect(() => {
        setLoading(true); 
        
        async function fetchReportedPosts() {
            try {
                const response = await fetch("/api/posts/reported-post", {
                    method: 'GET' // Specify GET method
                });

                if (response.ok) {
                    const data = await response.json();
                    setReportedPosts(data.postDocs);
                    setFilteredReports(data.postDocs);
                    setLoading(false);
                } else {
                    // Assuming the API returns { message: '...' } on error
                    const errorData = await response.json();
                    throw new Error(errorData.message);
                }

            } catch (error) {
                console.error("Error fetching reported posts:", error);
                setLoading(false);
            }
        }

        fetchReportedPosts();
    }, []);

    useEffect(() => {
        let unsubscribe

        if (reportedPosts) {
            const reportsRef = firestore.collection('posts').where('reports', ">", []); // Matches if 'reports' is not empty

            unsubscribe = reportsRef.onSnapshot((querySnapshot) => {
                
                const reportDocs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                if (!isEqual(reportDocs, reportedPosts)){
                    setPostsLoading(true);
                    setReportedPosts(reportDocs);
                    setPostsLoading(false);
                }
            });
        }
       
        return () => unsubscribe(); // Clean up the listener when the component unmounts
    }, [reportedPosts]);

    useEffect(() => {
        if (filter === "pending") {
            const uncheckedPosts = reportedPosts.filter((post) => post.reportStatus === "pending");
            setFilteredReports(uncheckedPosts);
        } else if (filter === "verified") {
            const verifiedPosts = reportedPosts.filter((post) => post.reportStatus=== "verified");
            setFilteredReports(verifiedPosts);
        } else if (filter === "dismissed") {
            const dismissedPosts = reportedPosts.filter((post) => post.reportStatus === "dismissed");
            setFilteredReports(dismissedPosts);
        } else {
            setFilteredReports(reportedPosts);
        }
    },[filter, reportedPosts])

    useEffect(() => {
        if (sort === "newest") {
            const sortedPosts = [...filteredReports].sort((a, b) => {
                const latestCreatedAtA = a.reports.reduce((latest, report) => {
                    return new Date(report.createdAt) > new Date(latest) ? report.createdAt : latest;
                }, 0);
                const latestCreatedAtB = b.reports.reduce((latest, report) => {
                    return new Date(report.createdAt) > new Date(latest) ? report.createdAt : latest;
                }, 0);
                return new Date(latestCreatedAtB) - new Date(latestCreatedAtA);
            });
            if (!isEqual(sortedPosts, filteredReports)) {
                setFilteredReports(sortedPosts);
            }
        } else {
            const sortedPosts = [...filteredReports].sort((a, b) => {
                const latestCreatedAtA = a.reports.reduce((latest, report) => {
                    return new Date(report.createdAt) > new Date(latest) ? report.createdAt : latest;
                }, 0);
                const latestCreatedAtB = b.reports.reduce((latest, report) => {
                    return new Date(report.createdAt) > new Date(latest) ? report.createdAt : latest;
                }, 0);
                return new Date(latestCreatedAtA) - new Date(latestCreatedAtB);
            });
            if (!isEqual(sortedPosts, filteredReports)) {
                setFilteredReports(sortedPosts);
            }
        }
    }, [sort, filteredReports]);

  return (
    <>
      { loading ? <Loader show={true} /> : (currentUser && 
          <div className="flex">
                <div className="w-80 h-screen fixed">
                    <AdminNav />
                </div>
                <div className="ml-80 w-full flex flex-col">
                    <div className="flex flex-row w-full border-b border-gray shadow-lg p-4 sticky top-0 bg-background z-10 items-center justify-between">
                        <h1 className="text-2xl font-semibold text-primary tracking-wider">Reported Posts</h1>

                        <div className="flex flex-row gap-8">
                            {/* Add a filter dropdown */}
                            <div className="flex items-center border border-primary rounded-md">
                                <Select required onValueChange={(value) => setFilter(value)} defaultValue="all">
                                    <SelectTrigger className="w-full text-primary text-md tracking-wide">
                                        Filter
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="verified">Verified</SelectItem>
                                        <SelectItem value="dismissed">Dismissed</SelectItem>
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
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                    </div>
                    <div className="items-center flex flex-col mt-8">
                        {!postsLoading && filteredReports.map((post, index) => (
                            <div key={index} className="w-3/5 mb-4"> {/* Add a key for the outer container */}
                                <ReportSnippet post={post} />
                            </div>
                        ))}
                    </div>


                </div>
                


          </div>
      )}
    </>
  )
}

export default WithAuth(AdminPage);