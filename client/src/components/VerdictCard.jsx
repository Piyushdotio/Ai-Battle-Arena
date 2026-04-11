import React, { useEffect, useRef } from "react";
import { Flame, Zap, BarChart2 } from "lucide-react";

/**
 * VerdictCard — JUDGE_VERDICT card matching the Stitch design
 */
const VerdictCard = ({ scores, winner, analysis }) => {
  const barRef = useRef(null);
  const winnerName = winner === "A" ? "GPT-4o" : "Claude 3.5";
  const quotient = 94;

  const defaultAnalysis = analysis ||
    `Combatant Beta (${winnerName}) demonstrated superior handling of edge-case responses. While Alpha responded with higher velocity, the structural integrity of the mathematical proofs and contextual depth provided by Beta was 12% more robust.`;

  useEffect(() => {
    const t = setTimeout(() => {
      if (barRef.current) barRef.current.style.width = `${quotient}%`;
    }, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="verdict-card fade-up delay-3">
      {/* Header */}
      <div className="verdict-header">
        <div className="verdict-icon pulse-glow">
          <Flame size={18} strokeWidth={2} />
        </div>
        <div>
          <div className="verdict-title">JUDGE_VERDICT_09</div>
          <div className="verdict-subtitle">RESOLUTION FINALIZED</div>
        </div>
      </div>

      {/* Body: analysis + dominant panel */}
      <div className="verdict-body">
        {/* Left: Analysis */}
        <div>
          <div className="analysis-label">
            <Zap size={10} fill="currentColor" />
            ANALYSIS REPORT:
          </div>
          <p className="analysis-text">{defaultAnalysis}</p>

          <div className="verdict-tags">
            <span className="verdict-tag tag-green">ACCURACY PRIORITY</span>
            <span className="verdict-tag tag-muted">ZERO HALLUCINATION</span>
          </div>
        </div>

        {/* Right: Dominant entity */}
        <div className="dominant-panel">
          <div>
            <div className="dominant-label">DOMINANT ENTITY</div>
            <div className="dominant-name">{winnerName}</div>
          </div>

          <div>
            <div className="quotient-label">
              <span>REASONING QUOTIENT</span>
              <span>{quotient}%</span>
            </div>
            <div className="quotient-bar-track">
              <div
                ref={barRef}
                className="quotient-bar-fill"
                style={{ width: "0%" }}
              />
            </div>
          </div>

          {/* Score display */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            {[
              { label: "Model A", score: scores?.solution_1_score ?? 10 },
              { label: "Model B", score: scores?.solution_2_score ?? 10 },
            ].map(({ label, score }) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: "9px",
                  letterSpacing: "0.1em", color: "var(--color-muted)", textTransform: "uppercase",
                }}>{label}</span>
                <span style={{
                  fontFamily: "var(--font-display)", fontSize: "1.5rem",
                  fontWeight: 700, color: "#fff", lineHeight: 1,
                }}>{score}
                  <span style={{ fontSize: "0.65rem", color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>/10</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerdictCard;
