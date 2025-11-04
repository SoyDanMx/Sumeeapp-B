"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faBriefcase,
  faUser,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

interface MobileBottomNavProps {
  activeTab: "home" | "leads" | "profile" | "stats";
  onTabChange: (tab: "home" | "leads" | "profile" | "stats") => void;
  newLeadsCount?: number;
}

export default function MobileBottomNav({
  activeTab,
  onTabChange,
  newLeadsCount = 0,
}: MobileBottomNavProps) {
  const tabs = [
    {
      id: "home" as const,
      label: "Inicio",
      icon: faHome,
    },
    {
      id: "leads" as const,
      label: "Leads",
      icon: faBriefcase,
      badge: newLeadsCount > 0 ? newLeadsCount : undefined,
    },
    {
      id: "stats" as const,
      label: "Stats",
      icon: faChartLine,
    },
    {
      id: "profile" as const,
      label: "Perfil",
      icon: faUser,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-xl z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16 safe-area-bottom">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full relative transition-colors duration-200 touch-manipulation ${
              activeTab === tab.id
                ? "text-indigo-600"
                : "text-gray-500 active:text-gray-700"
            }`}
            aria-label={tab.label}
          >
            <div className="relative">
              <FontAwesomeIcon
                icon={tab.icon}
                className={`text-xl ${
                  activeTab === tab.id ? "scale-110" : ""
                } transition-transform duration-200`}
              />
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {tab.badge > 9 ? "9+" : tab.badge}
                </span>
              )}
            </div>
            <span
              className={`text-xs mt-1 font-medium ${
                activeTab === tab.id ? "text-indigo-600" : "text-gray-500"
              }`}
            >
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-indigo-600 rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
