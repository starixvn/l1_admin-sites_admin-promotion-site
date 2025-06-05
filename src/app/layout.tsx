import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SidebarProvider } from "@/context/SidebarContext";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import QueryProvider from "@/providers/QueryProvider";
import { AuthProvider } from '@/lib/auth/AuthContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Promotion",
  description: "Admin promotion site built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <QueryProvider>
            <SidebarProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </SidebarProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}