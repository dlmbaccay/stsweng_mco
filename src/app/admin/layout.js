"use client"

import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { auth } from "@/lib/firebase";

import AdminNav from "@/components/nav/admin/admin-nav";


const Layout = ({ children }) => {
    const router = useRouter();
    const [isUserValid, setIsUserValid] = useState(false);


    useEffect(() => {
        const checkAuth = () => {
            auth.onAuthStateChanged((user) => {
                const adminIDs = ["5QMdCpbNvBMBSJ0wY9i28adWdx72", "h3ThyLqqAyS0Vh8zxQEYgo1J0kI2", "BPkVGVwvFAZskwoi1XGeluHDNTt2", "EGd2StgK9IV2j1FGTqLGrr4u8dr1", "x9QpuLIRWvgVYwkSlQUUC3y052R2", "LIsCrodmyGYPHBHO4K7GkrklXyx2", "sBZ2tTZFLHgmRW9c1CVVx3mqkoY2", "53pEdqC76oaSUrfsjySo4zQQei43"]
                if (user) {
                    if (adminIDs.includes(user.uid)) {
                        setIsUserValid(true);
                        console.log("Welcome Admin!");
                    } else {
                        router.push("/home");
                    }
                } else {
                    router.push("/not-found");
                }
                
            });
        };

        checkAuth();
    });
    
    return (
        <div>
            {isUserValid && (
                // Add main content here
                <main>
                    {children}
                </main>
            )}
        </div>
    );
};

export default Layout;