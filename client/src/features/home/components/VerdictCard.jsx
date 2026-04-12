import React from "react";
import { Zap } from "lucide-react";

/**
 * VerdictCard — Only displays the Judge Recommendation Analysis.
 */
const VerdictCard = ({ scores }) => {
  // Dynamically calculate tie status or info if needed for analysis
  const scoreA = scores?.solution_1_score ?? 0;
  const scoreB = scores?.solution_2_score ?? 0;
  
  const isTie = scoreA === scoreB;

  const analysis = isTie
    ? "Both combatants demonstrated identical structural integrity and analytical depth. Model A matched Model B's token density and factual accuracy precisely. Proceed with either model based on application parameters."
    : `The dominant combatant demonstrated superior handling of edge-case capabilities. The structural integrity of the completion and contextual depth provided by the winner was evaluated as significantly more robust by the Judge AI criteria.`;

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
          <p className="analysis-text" style={{ fontSize: "1rem", lineHeight: 1.6, marginTop: 4 }}>
            {analysis}
          </p>
          <div className="verdict-tags" style={{ marginTop: 16 }}>
            <span className="verdict-tag tag-green">ACCURACY PRIORITY</span>
            <span className="verdict-tag tag-muted">ZERO HALLUCINATION</span>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default VerdictCard;
