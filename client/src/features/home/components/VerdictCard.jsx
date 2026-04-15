import React from "react";
import { Zap } from "lucide-react";

/**
 * VerdictCard — Only displays the Judge Recommendation Analysis.
 */
const VerdictCard = ({ scores, modelA = "Model A", modelB = "Model B" }) => {
  const scoreA = scores?.solution_1_score ?? 0;
  const scoreB = scores?.solution_2_score ?? 0;
  const isTie = scoreA === scoreB;
  const winner = scoreA > scoreB ? modelA : modelB;
  const loser = scoreA > scoreB ? modelB : modelA;
  const margin = Math.abs(scoreA - scoreB);

  const analysis = isTie
    ? `${modelA} and ${modelB} delivered responses of equal quality according to the judge. Both received the same score, so this round ends in a tie.`
    : `${winner} delivered the stronger response compared with ${loser}. The judge scored ${winner} higher by ${margin} point${margin === 1 ? "" : "s"}, so ${winner} is the winner of this round.`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", margin: "0 14px 14px" }}>
      {/* ── Judge Recommendation Section ── */}
      <div className="verdict-card fade-up delay-3" style={{ margin: 0 }}>
        <div className="verdict-header">
          <div className="verdict-icon pulse-glow">
            <Zap size={18} strokeWidth={2} />
          </div>
          <div>
            <div className="verdict-title">JUDGE RECOMMENDATION</div>
            <div className="verdict-subtitle">AI ANALYSIS REPORT</div>
          </div>
        </div>
        <div style={{ padding: "16px 20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "12px",
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              color: "#fff",
            }}
          >
            <span>{modelA}: {scoreA}/10</span>
            <span>{modelB}: {scoreB}/10</span>
          </div>
          <p className="analysis-text" style={{ fontSize: "1rem", lineHeight: 1.6, marginTop: 4 }}>
            {analysis}
          </p>
          <div className="verdict-tags" style={{ marginTop: 16 }}>
            <span className="verdict-tag tag-green">
              {isTie ? "TIE" : `${winner.toUpperCase()} WINS`}
            </span>
            <span className="verdict-tag tag-muted">JUDGE SCORED BOTH RESPONSES</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerdictCard;
