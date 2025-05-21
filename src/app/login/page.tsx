"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Page() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/promotion');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Left side - Login form */}
        <div className="w-1/2 p-8">
          <h2 className="text-2xl font-semibold mb-6">Sign In</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                USERNAME
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-gray-50"
                placeholder="Username"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PASSWORD
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-gray-50"
                placeholder="Password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF5B6B] text-white py-2 rounded-md hover:bg-[#FF4559] transition-colors cursor-pointer"
            >
              Sign In
            </button>

            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="mr-2 accent-[#FF5B6B] cursor-pointer"
                />
                <span className="text-sm text-gray-600">Remember Me</span>
              </label>
              <Link 
                href="/forgot-password"
                className="text-sm text-gray-600 hover:text-[#FF5B6B] cursor-pointer"
              >
                Forgot Password
              </Link>
            </div>
          </form>
        </div>

        {/* Right side - Welcome message */}
        <div className="w-1/2 bg-[#FF5B6B] p-8 flex flex-col items-center justify-center text-white">
          <h2 className="text-2xl font-semibold mb-4">Welcome to login</h2>
          <Link 
            href="/signup"
            className="px-6 py-2 border-2 border-white rounded-md hover:bg-white hover:text-[#FF5B6B] transition-colors cursor-pointer"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
