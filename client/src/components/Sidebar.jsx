import React, { useState } from "react";
import { Swords, Settings, PanelLeftClose, PanelLeftOpen, MessageSquare } from "lucide-react";

const Sidebar = () => {
  const [expanded, setExpanded] = useState(false);

  const historyItems = [
    { id: 1, title: "GPT-4o vs Claude 3.5", active: true },
    { id: 2, title: "Llama 3 vs Gemini Pro", active: false },
    { id: 3, title: "Capital of France Test", active: false },
    { id: 4, title: "Code Gen Evaluation", active: false },
  ];

  return (
    <div className={`icon-sidebar ${expanded ? "expanded" : ""}`}>
      {/* Menu / Toggle button */}
      <div 
        className="icon-btn" 
        onClick={() => setExpanded(!expanded)}
        style={{ marginBottom: 4 }}
      >
        {expanded ? <PanelLeftClose size={18} strokeWidth={2} /> : <PanelLeftOpen size={18} strokeWidth={2} />}
        {expanded && <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "700" }}>TOGGLE NAVBAR</span>}
      </div>

      <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0 6px" }} />

      {/* Main Battle Arena Item */}
      <div className={`icon-btn active`}>
        <Swords size={18} strokeWidth={2} />
        {expanded && (
          <span style={{ 
            fontFamily: "var(--font-mono)", 
            fontSize: "11px", 
            fontWeight: "700" 
          }}>
            BATTLE ARENA
          </span>
        )}
      </div>

      <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.06)", margin: "8px 0 6px" }} />

      {/* History section label (only when expanded) */}
      {expanded && (
        <div style={{ padding: "12px 10px 8px 12px", fontSize: "10px", color: "var(--color-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.15em", fontWeight: 700 }}>
          HISTORY LOGS
        </div>
      )}

      {/* History Nav items */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4, width: "100%" }} className="custom-scrollbar">
        {historyItems.map((item) => (
          <div key={item.id} className="icon-btn" title={item.title}>
            <MessageSquare size={16} strokeWidth={item.active ? 2 : 1.8} style={{ color: item.active ? "var(--color-model-b)" : "inherit" }} />
            {expanded && (
              <span style={{ 
                fontFamily: "var(--font-mono)", 
                fontSize: "10px", 
                fontWeight: item.active ? "700" : "500",
                color: item.active ? "var(--color-model-b)" : "var(--color-muted-light)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                {item.title}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Settings at bottom */}
      <div style={{ marginTop: "auto" }}>
        <div className="icon-btn">
          <Settings size={18} strokeWidth={1.8} />
          {expanded && <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "500" }}>SETTINGS</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
