import type { Metadata } from "next";
import "./globals.css";
import {
  ClerkProvider,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Vistagram",
  description: "Share your photos and see what others are posting",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">
          <SignedOut>
            <header className="flex justify-end items-center p-6 gap-4 h-20 glass-effect border-b border-border/20">
              <SignInButton />
              <SignUpButton>
                <button className="bg-primary text-primary-foreground rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer transition-all duration-200 hover:bg-primary/90 active:scale-95">
                  Sign Up
                </button>
              </SignUpButton>
            </header>
          </SignedOut>
          {children}
          <Toaster position="top-center" closeButton={false} duration={3000} />
        </body>
      </html>
    </ClerkProvider>
  );
}
