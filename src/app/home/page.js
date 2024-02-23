"use client"

import WithAuth from "@/components/WithAuth";
import { ModeToggle } from "@/components/mode-toggle";

function homePage() {
  return (
    <div>
      Home Page
      <ModeToggle></ModeToggle>
    </div>
  )
}

export default WithAuth(homePage);