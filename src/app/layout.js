import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast"
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BantayBuddy",
  description: "Social Media App with Pets",
};

export default async function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system">
          {children}
          <Toaster 
            position="top-right"
            reverseOrder={false}
          />
        </ThemeProvider>
        </body>
    </html>
  );
}
