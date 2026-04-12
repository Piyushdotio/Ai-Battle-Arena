import React, { useState, useRef, useEffect } from "react";
import { Crosshair, Copy, ThumbsUp, ThumbsDown, ChevronDown, Cpu, Trophy } from "lucide-react";

/**
 * SolutionCard — Premium Combatant card with custom UX dropdown
 */
const SolutionCard = ({ model, availableModels, onModelChange, content, type = "A", stats, isWinner }) => {
  const isA = type === "A";
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // HEX colors for JS manipulation (matching CSS theme)
  const COLOR_A = "#cb97ff";
  const COLOR_B = "#00ff99";
  const modelColor = isA ? COLOR_A : COLOR_B;

  const defaultStats = stats || {
    latency: isA ? "0.8s" : "1.1s",
    tokens: isA ? "124" : "108",
    confidence: isA ? "98.2%" : "99.1%",
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (m) => {
    onModelChange(m);
    setIsDropdownOpen(false);
  };

  return (
    <div 
      className={`combatant-card ${isA ? "card-a" : "card-b"} fade-up ${isA ? "" : "delay-1"}`}
      style={isWinner ? {
        borderColor: modelColor,
        boxShadow: `0 0 30px -10px ${modelColor}`,
        background: `linear-gradient(180deg, ${modelColor}08 0%, #111118 100%)`
      } : {}}
    >
      {/* Combatant label + icon */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className={`combatant-label ${isA ? "label-a" : "label-b"}`}>
          <Crosshair size={11} strokeWidth={2.5} />
          COMBATANT {isA ? "ALPHA" : "BETA"}
        </div>
        
        {isWinner ? (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "6px",
            background: modelColor,
            color: "#000",
            padding: "2px 8px",
            borderRadius: "4px",
            fontSize: "9px",
            fontWeight: 900,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.1em",
            boxShadow: `0 0 15px ${modelColor}`
          }}>
            <Trophy size={10} fill="#000" />
            WINNER
          </div>
        ) : (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px",
            color: modelColor, 
            opacity: 0.5 
          }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px" }}>ONLINE</span>
            <div style={{ 
              width: 5, 
              height: 5, 
              borderRadius: "50%", 
              background: "currentColor",
              boxShadow: "0 0 8px currentColor" 
            }}></div>
          </div>
        )}
      </div>

      {/* Premium Custom Dropdown */}
      <div ref={dropdownRef} style={{ position: "relative", marginBottom: "8px" }}>
        <div 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "6px 8px 6px 0",
            cursor: "pointer",
            transition: "all 0.2s",
            borderBottom: `1px solid ${isDropdownOpen ? modelColor : "transparent"}`
          }}
        >
          <div className="combatant-name" style={{ margin: 0, fontSize: "1.3rem" }}>
            {model}
          </div>
          <ChevronDown 
            size={16} 
            style={{ 
              marginTop: "4px", 
              transition: "transform 0.3s",
              transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
              color: modelColor
            }} 
          />
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="fade-in" style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "200px",
            background: "#15151e",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            marginTop: "8px",
            zIndex: 100,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            overflow: "hidden",
            backdropFilter: "blur(10px)"
          }}>
            <div style={{ padding: "8px", fontSize: "10px", color: "var(--color-muted)", fontFamily: "var(--font-mono)", background: "rgba(255,255,255,0.03)" }}>
              SELECT MODEL PROTOCOL
            </div>
            {availableModels.map((m) => (
              <div
                key={m}
                onClick={() => handleSelect(m)}
                style={{
                  padding: "10px 12px",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                  color: model === m ? "#fff" : "var(--color-muted-light)",
                  background: model === m ? "rgba(255,255,255,0.06)" : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  transition: "all 0.15s"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = model === m ? "rgba(255,255,255,0.06)" : "transparent";
                  e.currentTarget.style.color = model === m ? "#fff" : "var(--color-muted-light)";
                }}
              >
                <Cpu size={12} style={{ opacity: m === model ? 1 : 0.4 }} />
                {m}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Solution text inset box */}
      <div className="solution-box" style={{ flex: 1 }}>
        <p 
          className="solution-text" 
          dangerouslySetInnerHTML={{ 
            __html: content.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #fff; font-weight: 700;">$1</strong>') 
          }} 
        />
      </div>

      {/* Footer: stats + actions */}
      <div className="card-stats" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "10px", marginTop: "auto" }}>
        <div className="stat-item">
          <span className="stat-label">Latency</span>
          <span className="stat-value">{defaultStats.latency}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Tokens</span>
          <span className="stat-value">{defaultStats.tokens}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Confidence</span>
          <span className="stat-value">{defaultStats.confidence}</span>
        </div>
      </div>

      {/* Action icons */}
      <div style={{ display: "flex", gap: 8, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 8 }}>
        {[
          { icon: ThumbsUp, label: "Validate" },
          { icon: ThumbsDown, label: "Reject" },
          { icon: Copy, label: "Copy" },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            title={label}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "transparent", border: "none", cursor: "pointer",
              color: "var(--color-muted)", transition: "color 0.2s",
              fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.1em",
              textTransform: "uppercase", padding: "2px 0",
            }}
            onMouseEnter={e => e.currentTarget.style.color = modelColor}
            onMouseLeave={e => e.currentTarget.style.color = "var(--color-muted)"}
          >
            <Icon size={13} strokeWidth={2} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SolutionCard;
