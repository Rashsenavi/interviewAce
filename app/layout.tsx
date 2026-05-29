import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import Script from "next/script";

export const metadata = {
  title: "InterviewAce - Ace Your Next Interview",
  description: "Practice with verified experts from top Sri Lankan companies. Affordable, culturally relevant interview preparation for Sri Lankan job seekers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
        <Script 
          src="https://www.payhere.lk/lib/payhere.js"
          strategy="beforeInteractive" 
        />
      </body>
    </html>
  );
}
