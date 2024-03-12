"use client"; // Assuming this is still required

import * as React from "react";
import { useTheme } from "next-themes";
import { DarkModeSwitch } from "@/components/ui/theme-switch"; // Assuming you have a Shadcn Switch component

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark";

  const handleThemeChange = (checked) => {
    if (isDarkMode) {
      setTheme("light");
    } else {
      setTheme("dark");
    }
    // setTheme(checked ? "dark" : "light"); // Adapt if system theme is needed
  };

  return (
    <div className="items-center flex"> {/* Container for label and switch */}
      <DarkModeSwitch
        id="mode-switch"
        checked={isDarkMode}
        onClick={handleThemeChange}
      />
      <label htmlFor="mode-switch"></label> 
    </div>
  );
}