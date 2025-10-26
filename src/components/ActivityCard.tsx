"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

interface ActivityCardProps {
  name: string;
  profession: string;
  rating: number;
  jobsCount: number;
  avatarColor: string;
  avatarInitial: string;
}

export default function ActivityCard({
  name,
  profession,
  rating,
  jobsCount,
  avatarColor,
  avatarInitial,
}: ActivityCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FontAwesomeIcon
        key={i}
        icon={faStar}
        className={`w-3 h-3 ${
          i < rating ? "text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:bg-white/15 transition-all duration-300">
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <div className={`w-8 h-8 ${avatarColor} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
          {avatarInitial}
        </div>
        
        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-white font-semibold text-sm truncate">
              {name}
            </span>
            <span className="text-blue-200 text-xs">
              {profession}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {renderStars(rating)}
            </div>
            <span className="text-yellow-400 text-xs font-medium">
              {rating}/5
            </span>
            <span className="text-blue-200 text-xs">
              • {jobsCount}+ trabajos
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
