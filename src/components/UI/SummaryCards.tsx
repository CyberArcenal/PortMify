// src/components/UI/SummaryCards.tsx
import React from "react";
import { LucideIcon } from "lucide-react";

export interface SummaryCardItem {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: "blue" | "green" | "yellow" | "purple" | "red" | "gray";
  format?: (value: any) => string;
}

interface SummaryCardsProps {
  cards: SummaryCardItem[];
  columns?: 2 | 3 | 4;
}

const colorClasses = {
  blue: "bg-blue-500/10 text-blue-500",
  green: "bg-green-500/10 text-green-500",
  yellow: "bg-yellow-500/10 text-yellow-500",
  purple: "bg-purple-500/10 text-purple-500",
  red: "bg-red-500/10 text-red-500",
  gray: "bg-gray-500/10 text-gray-500",
};

const SummaryCards: React.FC<SummaryCardsProps> = ({ cards, columns = 4 }) => {
  const colClasses = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid grid-cols-1 gap-4 ${colClasses[columns]}`}>
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                {card.title}
              </p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                {card.format ? card.format(card.value) : card.value}
              </p>
            </div>
            <div
              className={`p-3 rounded-full ${colorClasses[card.color]}`}
            >
              <card.icon className="w-5 h-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;