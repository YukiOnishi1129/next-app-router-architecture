import { Geist, Geist_Mono } from "next/font/google";

import { AuthProvider } from "@/features/auth/providers/AuthProvider";

import { QueryProvider } from "@/shared/providers/QueryProvider";

import type { Metadata } from "next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Request & Approval System",
  description:
    "Sample implementation of a scalable Next.js App Router architecture for request approvals.",
};

export default function RootLayout(props: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <AuthProvider>{props.children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
