import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Finance Dashboard",
  description: "Finance analytics dashboard with role-based access control"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#eef0f8] text-zinc-900 antialiased font-mono">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#ffffff",
              color: "#18181b",
              borderRadius: "1rem",
              border: "1px solid #dde0f3",
              boxShadow: "0 8px 24px -4px rgba(0,0,0,0.08)",
              fontFamily: '"Geist Mono", monospace'
            },
            success: {
              iconTheme: {
                primary: "#15803d",
                secondary: "#ecfdf3"
              }
            },
            error: {
              iconTheme: {
                primary: "#dc2626",
                secondary: "#fef2f2"
              }
            }
          }}
        />
      </body>
    </html>
  );
}
