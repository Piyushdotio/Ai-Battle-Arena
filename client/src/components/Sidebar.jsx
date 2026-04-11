import React, { useState } from "react";
import { Swords, Settings, PanelLeftClose, PanelLeftOpen, MessageSquare, Trash2, Plus, ChevronDown, ChevronRight } from "lucide-react";

const Sidebar = ({ historyItems, setHistoryItems, onNewChat }) => {
  const [expanded, setExpanded] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);

  const handleDelete = (e, id) => {
    e.stopPropagation();
    setHistoryItems((prev) => prev.filter((item) => item.id !== id));
  };

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
      <div className={`icon-btn ${historyItems?.some(i => i.active) ? '' : 'active'}`}>
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

      {/* NEW CHAT Button */}
      <div 
        className="icon-btn" 
        onClick={onNewChat}
        style={{ color: "var(--color-primary)", marginTop: 4, cursor: "pointer" }}
        title="Start New Battle"
      >
        <Plus size={18} strokeWidth={2.5} />
        {expanded && (
          <span style={{ 
            fontFamily: "var(--font-mono)", 
            fontSize: "11px", 
            fontWeight: "700",
            letterSpacing: "0.1em"
          }}>
            NEW BATTLE
          </span>
        )}
      </div>

      <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.06)", margin: "8px 0 6px" }} />

      {/* History section label (only when expanded) */}
      {expanded && (
        <div 
          onClick={() => setHistoryOpen(!historyOpen)}
          style={{ 
            padding: "12px 10px 8px 12px", fontSize: "10px", color: "var(--color-muted)", 
            fontFamily: "var(--font-mono)", letterSpacing: "0.15em", fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
            userSelect: "none"
          }}
        >
          <span>HISTORY LOGS</span>
          {historyOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      )}

      {/* History Nav items */}
      {historyOpen && (
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4, width: "100%", overflowX: "hidden" }} className="custom-scrollbar">
        {historyItems?.map((item) => (
          <div key={item.id} className={`icon-btn ${item.active ? "active" : ""}`} title={item.title}>
            <MessageSquare size={16} strokeWidth={item.active ? 2 : 1.8} style={{ color: item.active ? "var(--color-model-b)" : "inherit", flexShrink: 0 }} />
            {expanded && (
              <span style={{ 
                fontFamily: "var(--font-mono)", 
                fontSize: "10px", 
                fontWeight: item.active ? "700" : "500",
                color: item.active ? "var(--color-model-b)" : "var(--color-muted-light)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "130px"
              }}>
                {item.title}
              </span>
            )}
            {expanded && (
              <button 
                onClick={(e) => handleDelete(e, item.id)}
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  color: "var(--color-muted)", marginLeft: "auto", display: "flex",
                  padding: "4px", borderRadius: "4px", marginRight: "4px"
                }}
                title="Delete Log"
                onMouseEnter={e => e.currentTarget.style.color = "#ff4444"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--color-muted)"}
              >
                <Trash2 size={13} strokeWidth={2} />
              </button>
            )}
          </div>
        ))}
        {expanded && (!historyItems || historyItems.length === 0) && (
          <div style={{ padding: "12px", fontSize: "10px", color: "var(--color-muted)", fontFamily: "var(--font-mono)", opacity: 0.7 }}>
            NO ACTIVE LOGS.
          </div>
        )}
      </div>
      )}

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
