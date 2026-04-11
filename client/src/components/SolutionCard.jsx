import React from "react";
import { Crosshair, Copy, ThumbsUp, ThumbsDown } from "lucide-react";

/**
 * SolutionCard — Combatant card matching the Stitch design
 * type="A" → GPT-4o (yellow-lime)
 * type="B" → Claude 3.5 (bright green)
 */
const SolutionCard = ({ model, content, type = "A", stats }) => {
  const isA = type === "A";

  const defaultStats = stats || {
    latency: isA ? "0.8s" : "1.1s",
    tokens: isA ? "124" : "108",
    confidence: isA ? "98.2%" : "99.1%",
  };

  return (
    <div className={`combatant-card ${isA ? "card-a" : "card-b"} fade-up ${isA ? "" : "delay-1"}`}>
      {/* Combatant label + icon */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className={`combatant-label ${isA ? "label-a" : "label-b"}`}>
          <Crosshair size={11} strokeWidth={2.5} />
          COMBATANT {isA ? "ALPHA" : "BETA"}
        </div>
        <div style={{ color: isA ? "var(--color-model-a)" : "var(--color-model-b)", opacity: 0.6 }}>
          <Crosshair size={14} strokeWidth={1.5} />
        </div>
      </div>

      {/* Model name */}
      <div className="combatant-name">{model}</div>

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
      <div className="card-stats">
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
            onMouseEnter={e => e.currentTarget.style.color = isA ? "var(--color-model-a)" : "var(--color-model-b)"}
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
