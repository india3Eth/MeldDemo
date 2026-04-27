"use client";

import { useState } from "react";
import { ThemeProvider } from "@/themes/ThemeProvider";
import { ThemeSelector } from "@/themes/ThemeSelector";
import { FlowSelector } from "@/components/FlowSelector";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { MeldWidget } from "@/components/widget/MeldWidget";
import { TransferWidget } from "@/components/widget/TransferWidget";

// =============================================================================
// Home Page — renders the theme selector and flow selector alongside the widget
// =============================================================================

type WidgetFlow = "retail" | "transfer";

export default function HomePage() {
  const [widgetFlow, setWidgetFlow] = useState<WidgetFlow>("retail");

  return (
    <ThemeProvider defaultTheme="skeuomorphism">
      <WidgetProvider>
        <div className="flex min-h-screen w-full items-center justify-center p-4">
          {/* Desktop: side-by-side layout */}
          <div className="flex items-center gap-10 max-[900px]:flex-col">
            {/* Theme selector — left sidebar on desktop, hidden on mobile */}
            <div className="hidden lg:block">
              <ThemeSelector />
            </div>

            {/* Widget — swaps based on selected flow */}
            {widgetFlow === "retail" ? <MeldWidget /> : <TransferWidget />}

            {/* Flow selector — right sidebar on desktop, hidden on mobile */}
            <div className="hidden lg:block">
              <FlowSelector flow={widgetFlow} setFlow={setWidgetFlow} />
            </div>

            {/* Mobile: selectors appear below the widget */}
            <div className="mt-6 flex flex-col gap-4 lg:hidden">
              <ThemeSelector />
              <FlowSelector flow={widgetFlow} setFlow={setWidgetFlow} />
            </div>
          </div>
        </div>
      </WidgetProvider>
    </ThemeProvider>
  );
}
