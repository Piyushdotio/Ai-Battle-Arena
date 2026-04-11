import React, { useEffect, useRef } from "react";
import { Flame, Zap, BarChart2 } from "lucide-react";

/**
 * VerdictCard — JUDGE_VERDICT card matching the Stitch design
 */
const VerdictCard = ({ scores }) => {
  const barRef = useRef(null);

  // Dynamically calculate winner based on scores
  const scoreA = scores?.solution_1_score ?? 0;
  const scoreB = scores?.solution_2_score ?? 0;
  
  const isTie = scoreA === scoreB;
  let winnerName = "EQUILIBRIUM (TIE)";
  let quotient = 100;

  if (scoreA > scoreB) {
    winnerName = "GPT-4o";
    quotient = Math.min(100, Math.round((scoreA / 10) * 100));
  } else if (scoreB > scoreA) {
    winnerName = "Claude 3.5";
    quotient = Math.min(100, Math.round((scoreB / 10) * 100));
  }

  const analysis = isTie
    ? "Both combatants demonstrated identical structural integrity and analytical depth. Model A matched Model B's token density and factual accuracy precisely. Proceed with either model based on application parameters."
    : `Dominant Combatant (${winnerName}) demonstrated superior handling of edge-case capabilities. The structural integrity of the completion and contextual depth provided by the winner was evaluated as significantly more robust by the Judge AI criteria.`;

  useEffect(() => {
    const t = setTimeout(() => {
      if (barRef.current) barRef.current.style.width = `${isTie ? 50 : quotient}%`;
    }, 300);
    return () => clearTimeout(t);
  }, [quotient, isTie]);

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
          <p className="analysis-text">{analysis}</p>

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
              { label: "GPT-4O", score: scoreA },
              { label: "CLAUDE 3.5", score: scoreB },
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
