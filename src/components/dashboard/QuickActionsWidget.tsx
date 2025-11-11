"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWrench,
  faBolt,
  faPaintRoller,
  faSnowflake,
  faLeaf,
} from "@fortawesome/free-solid-svg-icons";

interface QuickActionsWidgetProps {
  onServiceClick: (service: string) => void;
}

const QUICK_SERVICES = [
  { id: "plomeria", name: "Plomería", icon: faWrench, color: "bg-blue-500" },
  {
    id: "electricidad",
    name: "Electricidad",
    icon: faBolt,
    color: "bg-yellow-500",
  },
  {
    id: "pintura",
    name: "Pintura",
    icon: faPaintRoller,
    color: "bg-green-500",
  },
  {
    id: "aire",
    name: "Aire Acondicionado",
    icon: faSnowflake,
    color: "bg-cyan-500",
  },
  {
    id: "jardineria",
    name: "Jardinería",
    icon: faLeaf,
    color: "bg-emerald-500",
  },
];

export default function QuickActionsWidget({
  onServiceClick,
}: QuickActionsWidgetProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Servicios Rápidos
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {QUICK_SERVICES.map((service) => (
          <button
            key={service.id}
            onClick={() => onServiceClick(service.id)}
            className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div
              className={`w-12 h-12 ${service.color} rounded-full flex items-center justify-center text-white mb-2 group-hover:scale-110 transition-transform`}
            >
              <FontAwesomeIcon icon={service.icon} className="text-xl" />
            </div>
            <span className="text-sm font-medium text-gray-700 text-center">
              {service.name}
            </span>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-4 text-center">
        💡 Servicios más solicitados en tu zona
      </p>
    </div>
  );
}
