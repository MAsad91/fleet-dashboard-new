"use client";

import React, { useState, ReactNode } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabbedInterfaceProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export function TabbedInterface({ tabs, defaultTab, className = "" }: TabbedInterfaceProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Get active tab from URL or use default
  const activeTab = searchParams.get('tab') || defaultTab || tabs[0]?.id;
  
  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTabContent}
      </div>
    </div>
  );
}
