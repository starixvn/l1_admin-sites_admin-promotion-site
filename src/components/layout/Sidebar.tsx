"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";

const Sidebar = () => {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();

  const menuItems = [
    {
      title: "PROMOTION",
      items: [
        { icon: (
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
        ), label: "Promotion Management", path: "/promotion" },
        { icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 20.5C7.305 20.5 3.5 16.695 3.5 12S7.305 3.5 12 3.5 20.5 7.305 20.5 12 16.695 20.5 12 20.5z" />
          </svg>
        ), label: "Promotion Announcement", path: "/announcement" }
      ]
    }
  ];

  return (
    <aside 
      className={`bg-white border-r border-gray-200 transition-all duration-300 
        ${isCollapsed ? 'w-20' : 'w-64'} min-h-screen fixed left-0 top-16
        flex flex-col`}
    >
      <div className="p-4">
        <nav>
          {menuItems.map((section, idx) => (
            <div key={idx} className="mb-6">
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-gray-400 mb-2 px-3">
                  {section.title}
                </h3>
              )}
              {section.items.map((item, itemIdx) => (
                <Link
                  key={itemIdx}
                  href={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg mb-1
                    ${pathname === item.path 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {!isCollapsed && <span className="text-sm">{item.label}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar; 