<div className="w-1/4 border-gray border-r-2 border-t-2 h-full relative flex flex-col">
    {/* Profile Photo */}
    <div className="h-1/6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Image src={userData.userPhotoURL == "" ? "/images/profilePictureHolder.png" : userData.userPhotoURL} alt="user photo" width={200} height={200} className="rounded-full aspect-square object-cover"></Image>
        </div>
    </div>
    {/* Profile Display Name */}
    <p className="font-semibold text-xl tracking-wide mx-auto">{userData.displayName}</p>
    {/* Profile Username */}
    <p className="text-base tracking-wide mx-auto">@{userData.username}</p>
    
    {currentUser && currentUser.uid === userData.uid ? (
        // Edit Button 
        // <Button className="mx-auto text-lg dark:bg-light_yellow bg-muted_blue px-6 text-dark_gray mt-6 font-medium">Edit</Button>
        <EditUserProfile props={{
            uid: userData.uid,
            displayName: userData.displayName,
            userPhotoURL: userData.userPhotoURL ? userData.userPhotoURL : "",
            coverPhotoURL: userData.coverPhotoURL ? userData.coverPhotoURL : "",
            about: userData.about,
            location: userData.location,
            gender: userData.gender,
            birthdate: userData.birthdate,
            phoneNumber: userData.phoneNumber
        }}/>
    ):(
        // Follow Button 
        <Button className="mx-auto text-lg dark:bg-light_yellow bg-muted_blue px-6 text-dark_gray mt-6 font-medium">Follow</Button>
    )}
    
    {/* Followers and Following Section */}
    <div className="flex flex-row mx-auto p-6"> 
        <div className="w-1/2 px-2 mx-4 flex flex-col items-center"> 
            <p className="text-base tracking-wide">{userData.followers && userData.followers.length}</p>
            <p className="text-lg tracking-wide dark:text-light_yellow text-muted_blue font-medium">Followers</p>
        </div>
        <div className="w-1/2 px-2 mx-4 flex flex-col items-center">
            <p className="text-base tracking-wide">{userData.following && userData.following.length}</p>
            <p className="text-lg tracking-wide dark:text-light_yellow text-muted_blue font-medium">Following</p>
        </div>
    </div>

    {/* Bio Section */}
    <div className="flex flex-col items-center mx-auto w-3/4 max-w-3/4">
        <p className="text-lg tracking-wide font-semibold">About</p>
        <p className="tracking-wide text-center break-words">{userData.about}</p>
    </div>

    {/* Other Details */}
    <div className="w-3/4 mx-auto items-center flex flex-col">
        {/* Location */}
        <div className="flex flex-row mt-2 items-center">
            <svg class="w-6 h-6 text-muted_blue dark:text-light_yellow" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M12 2a8 8 0 0 1 6.6 12.6l-.1.1-.6.7-5.1 6.2a1 1 0 0 1-1.6 0L6 15.3l-.3-.4-.2-.2v-.2A8 8 0 0 1 11.8 2Zm3 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" clip-rule="evenodd"/>
            </svg>

            <p className="text-base tracking-wide font-normal px-3">{userData.location}</p>
        </div>

        {/* Gender */}
        <div className="flex flex-row mt-2">
            <svg  class="w-6 h-6 text-muted_blue dark:text-light_yellow" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 640 512">
                <path d="M256 384H208v-35.05C289.9 333.9 352 262.3 352 176c0-97.2-78.8-176-176-176c-97.2 0-176 78.8-176 176c0 86.26 62.1 157.9 144 172.1v35.05H96c-8.836 0-16 7.162-16 16v32c0 8.836 7.164 16 16 16h48v48c0 8.836 7.164 16 16 16h32c8.838 0 16-7.164 16-16v-48H256c8.838 0 16-7.164 16-16v-32C272 391.2 264.8 384 256 384zM176 272c-52.93 0-96-43.07-96-96c0-52.94 43.07-96 96-96c52.94 0 96 43.06 96 96C272 228.9 228.9 272 176 272zM624 0h-112.4c-21.38 0-32.09 25.85-16.97 40.97l29.56 29.56l-24.55 24.55c-29.97-20.66-64.81-31.05-99.74-31.05c-15.18 0-30.42 2.225-45.19 6.132c13.55 22.8 22.82 48.36 26.82 75.67c6.088-1.184 12.27-1.785 18.45-1.785c24.58 0 49.17 9.357 67.88 28.07c37.43 37.43 37.43 98.33 0 135.8c-18.71 18.71-43.3 28.07-67.88 28.07c-23.55 0-46.96-8.832-65.35-26.01c-15.92 18.84-34.93 35.1-56.75 47.35c11.45 5.898 20.17 16.3 23.97 28.82C331.5 406 365.7 416 400 416c45.04 0 90.08-17.18 124.5-51.55c60.99-60.99 67.73-155.6 20.47-224.1l24.55-24.55l29.56 29.56c4.889 4.889 10.9 7.078 16.8 7.078C628.2 152.4 640 142.8 640 128.4V16C640 7.164 632.8 0 624 0z"/>
            </svg>
            <p className="text-base tracking-wide font-normal px-3">{userData.gender}</p>
        </div>

        {/* Birthday */}
        <div className="flex flex-row mt-2">
            <svg class="w-6 h-6 text-muted_blue dark:text-light_yellow" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M5 5c.6 0 1-.4 1-1a1 1 0 1 1 2 0c0 .6.4 1 1 1h1c.6 0 1-.4 1-1a1 1 0 1 1 2 0c0 .6.4 1 1 1h1c.6 0 1-.4 1-1a1 1 0 1 1 2 0c0 .6.4 1 1 1a2 2 0 0 1 2 2v1c0 .6-.4 1-1 1H4a1 1 0 0 1-1-1V7c0-1.1.9-2 2-2ZM3 19v-7c0-.6.4-1 1-1h16c.6 0 1 .4 1 1v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm6-6c0-.6-.4-1-1-1a1 1 0 1 0 0 2c.6 0 1-.4 1-1Zm2 0a1 1 0 1 1 2 0c0 .6-.4 1-1 1a1 1 0 0 1-1-1Zm6 0c0-.6-.4-1-1-1a1 1 0 1 0 0 2c.6 0 1-.4 1-1ZM7 17a1 1 0 1 1 2 0c0 .6-.4 1-1 1a1 1 0 0 1-1-1Zm6 0c0-.6-.4-1-1-1a1 1 0 1 0 0 2c.6 0 1-.4 1-1Zm2 0a1 1 0 1 1 2 0c0 .6-.4 1-1 1a1 1 0 0 1-1-1Z" clip-rule="evenodd"/>
            </svg>

            <p className="text-base tracking-wide font-normal px-3">{userData.birthdate}</p>
        </div>

        {/* Phone Number */}
        <div className="flex flex-row mt-2">
            <svg class="w-6 h-6 text-muted_blue dark:text-light_yellow" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 4a2.6 2.6 0 0 0-2 .9 6.2 6.2 0 0 0-1.8 6 12 12 0 0 0 3.4 5.5 12 12 0 0 0 5.6 3.4 6.2 6.2 0 0 0 6.6-2.7 2.6 2.6 0 0 0-.7-3L18 12.9a2.7 2.7 0 0 0-3.8 0l-.6.6a.8.8 0 0 1-1.1 0l-1.9-1.8a.8.8 0 0 1 0-1.2l.6-.6a2.7 2.7 0 0 0 0-3.8L10 4.9A2.6 2.6 0 0 0 8 4Z"/>
            </svg>

            <p className="text-base tracking-wide font-normal px-3">{userData.phoneNumber}</p>
        </div>

        {/* Email */}
        <div className="flex flex-row mt-2">
            <svg class="w-6 h-6 text-muted_blue dark:text-light_yellow" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2 5.6V18c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2V5.6l-.9.7-7.9 6a2 2 0 0 1-2.4 0l-8-6-.8-.7Z"/>
                <path d="M20.7 4.1A2 2 0 0 0 20 4H4a2 2 0 0 0-.6.1l.7.6 7.9 6 7.9-6 .8-.6Z"/>
            </svg>

            <p className="text-base tracking-wide font-normal px-3">{userData.email}</p>
        </div>
    </div>
</div>