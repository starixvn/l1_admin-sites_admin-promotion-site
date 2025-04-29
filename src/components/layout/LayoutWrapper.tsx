'use client';

import { usePathname } from 'next/navigation';
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return children;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      <main className="transition-all duration-300 pt-16">
        <div 
          className="p-6"
          style={{
            marginLeft: '256px',
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
} 