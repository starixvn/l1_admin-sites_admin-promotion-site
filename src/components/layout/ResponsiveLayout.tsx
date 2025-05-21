"use client";

import { useSidebar } from "@/context/SidebarContext";
import { useEffect } from "react";

export default function ResponsiveLayout() {
  const { isCollapsed } = useSidebar();

  useEffect(() => {
    const mainContent = document.querySelector('main > div') as HTMLDivElement;
    if (mainContent) {
      mainContent.style.marginLeft = isCollapsed ? '80px' : '256px';
      mainContent.style.width = isCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 256px)';
    }
  }, [isCollapsed]);

  return null;
} 