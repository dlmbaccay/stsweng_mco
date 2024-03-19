"use client"

import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { auth } from "@/lib/firebase";

import AdminNav from "@/components/nav/admin-nav";


const Layout = ({ children }) => {
    const router = useRouter();
    const [isUserValid, setIsUserValid] = useState(false);


    useEffect(() => {
        const checkAuth = () => {
            auth.onAuthStateChanged((user) => {
                // if (user.uid === "h3ThyLqqAyS0Vh8zxQEYgo1J0kI2") {
                //     setIsUserValid(true);
                //     console.log("Welcome Admin!");
                if (user) {
                    setIsUserValid(true);
                    console.log("Welcome Admin!");
                } else {
                    router.push("/  ");
                }
            });
        };

        checkAuth();
    }, []);
    return (
        <div>
            {/* Add your main content here */}
            <main>
                {children}
            </main>
        </div>
    );
};

export default Layout;