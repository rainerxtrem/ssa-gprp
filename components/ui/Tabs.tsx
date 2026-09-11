"use client";

import { useState } from "react";

export interface TabDefinition {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  content: React.ReactNode;
}

export function Tabs({ tabs, defaultTab }: { tabs: TabDefinition[]; defaultTab?: string }) {
  const [actif, setActif] = useState(defaultTab ?? tabs[0]?.key);
  const tabActif = tabs.find((t) => t.key === actif) ?? tabs[0];

  return (
    <div>
      <div className="mb-5 flex gap-1 border-b border-slate-200 print:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActif(tab.key)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab.key === tabActif?.key
                ? "border-emerald-700 text-emerald-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge}
          </button>
        ))}
      </div>
      <div>{tabActif?.content}</div>
    </div>
  );
}
