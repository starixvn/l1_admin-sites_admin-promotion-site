"use client";

import { useState, useRef, useEffect } from "react";
import { useSidebar } from "@/context/SidebarContext";
import ResponsiveLayout from "./ResponsiveLayout";
import { useAuth } from '@/lib/auth/AuthContext';

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { logout, user } = useAuth();
  const displayName = user?.Username|| "User";
  const firstLetter = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <ResponsiveLayout />
      <header className="h-16 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="h-full px-6 flex items-center justify-between">
          {/* Left section with menu button and logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg 
                className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${
                  isCollapsed ? 'rotate-180' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <h1 className="text-xl font-bold text-[#FF5B6B]">Admin Promotion</h1>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-6">
            {/* Account Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">{firstLetter}</span>
                </div>
                <span className="text-gray-700">{displayName}</span>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-100">
                  <button
                    onClick={() => logout()}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      <span>Logout</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header; 