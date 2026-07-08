// src/pages/stats/components/StatsDisplay.tsx
import React from "react";
import { Stats } from "@/api/core/stats";
import {
  Briefcase,
  Users,
  Clock,
  Smile,
} from "lucide-react";

interface StatsDisplayProps {
  stats: Stats;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats }) => {
  const statCards = [
    {
      label: "Projects Completed",
      value: stats.projects_completed,
      icon: Briefcase,
      color: "blue",
    },
    {
      label: "Client Satisfaction",
      value: `${stats.client_satisfaction}%`,
      icon: Smile,
      color: "green",
    },
    {
      label: "Years Experience",
      value: stats.years_experience,
      icon: Clock,
      color: "yellow",
    },
    {
      label: "Happy Clients",
      value: stats.happy_clients,
      icon: Users,
      color: "purple",
    },
  ];

  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-500",
    green: "bg-green-500/10 text-green-500",
    yellow: "bg-yellow-500/10 text-yellow-500",
    purple: "bg-purple-500/10 text-purple-500",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <div
          key={index}
          className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                {card.label}
              </p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                {card.value}
              </p>
            </div>
            <div
              className={`p-3 rounded-full ${colorClasses[card.color as keyof typeof colorClasses]}`}
            >
              <card.icon className="w-5 h-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsDisplay;