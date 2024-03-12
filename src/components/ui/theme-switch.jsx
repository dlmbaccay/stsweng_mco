"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { Moon, Sun } from "lucide-react"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"

const DarkModeSwitch = React.forwardRef(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-primary",
      className
    )}
    {...props}
    ref={ref}>
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-px"
      )} >
        <div className={`flex h-full w-full items-center justify-center align-middle `}>
          <Sun className="h-[0.8rem] w-[0.8rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[0.8rem] w-[0.8rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </div>
      </SwitchPrimitives.Thumb>
  </SwitchPrimitives.Root>
))
DarkModeSwitch.displayName = SwitchPrimitives.Root.displayName

export { DarkModeSwitch }

