"use client";

// =============================================================================
// FlowSelector — panel for switching between widget flows (Retail / Transfer)
// Mirrors ThemeSelector in layout, position, and styling.
// =============================================================================

type WidgetFlow = "retail" | "transfer";

interface FlowDef {
  id: WidgetFlow;
  name: string;
  icon: string;
  description: string;
  color: string;
}

const FLOWS: FlowDef[] = [
  {
    id: "retail",
    name: "Retail",
    icon: "🏪",
    description: "Buy / Sell",
    color: "#6366f1",
  },
  {
    id: "transfer",
    name: "Transfer",
    icon: "↔️",
    description: "Move crypto",
    color: "#0ea5e9",
  },
];

interface FlowSelectorProps {
  flow: WidgetFlow;
  setFlow: (f: WidgetFlow) => void;
}

export function FlowSelector({ flow, setFlow }: FlowSelectorProps) {
  return (
    <div
      className="rounded-2xl bg-white/95 p-6 shadow-lg backdrop-blur-sm"
      style={{ width: 220 }}
    >
      <div className="mb-5 text-xs font-bold uppercase tracking-widest text-gray-900">
        Widget Flow
      </div>

      <div className="flex flex-col gap-3">
        {FLOWS.map((f) => {
          const isActive = flow === f.id;

          return (
            <button
              key={f.id}
              onClick={() => setFlow(f.id)}
              className="flex items-center gap-2.5 rounded-xl px-4 py-3.5 text-left text-[13px] font-semibold transition-all duration-200"
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${f.color} 0%, ${f.color}dd 100%)`
                  : "rgba(248,249,250,0.8)",
                color: isActive ? "#fff" : "#495057",
                border: isActive ? "none" : "1px solid rgba(0,0,0,0.06)",
                boxShadow: isActive
                  ? `0 6px 20px ${f.color}44`
                  : "0 2px 4px rgba(0,0,0,0.04)",
              }}
            >
              <span className="text-xl">{f.icon}</span>
              <div>
                <div>{f.name}</div>
                <div
                  className="text-[11px] font-normal"
                  style={{ opacity: isActive ? 0.85 : 0.6 }}
                >
                  {f.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
