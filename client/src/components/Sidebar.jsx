import React, { useState } from "react";
import { Swords, Shield, Database, Target, Settings, PanelLeftClose, PanelLeftOpen } from "lucide-react";

const Sidebar = () => {
  const [expanded, setExpanded] = useState(false);

  const navItems = [
    { icon: Swords, label: "BATTLE ARENA", active: true },
    { icon: Shield, label: "SECURITY PROTOCOLS", active: false },
    { icon: Database, label: "MODEL REGISTRY", active: false },
    { icon: Target, label: "EVAL METRICS", active: false },
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

      {/* Nav items */}
      {navItems.map(({ icon: Icon, label, active }, i) => (
        <div key={i} className={`icon-btn ${active ? "active" : ""}`}>
          <Icon size={18} strokeWidth={active ? 2 : 1.8} />
          {expanded && (
            <span style={{ 
              fontFamily: "var(--font-mono)", 
              fontSize: "11px", 
              fontWeight: active ? "700" : "500" 
            }}>
              {label}
            </span>
          )}
        </div>
      ))}

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
