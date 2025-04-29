import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SidebarProvider } from "@/context/SidebarContext";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Promotion",
  description: "Admin promotion site built with Next.js",
};

// Root layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <Sidebar />
            <main className="transition-all duration-300 pt-16">
              <div 
                className="p-6"
                style={{
                  marginLeft: '256px', // Default width khi không collapsed
                }}
              >
                {children}
              </div>
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
