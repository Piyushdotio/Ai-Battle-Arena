import React, { useState } from "react";
import { Bell, Mail } from "lucide-react";
import Sidebar from "../components/Sidebar";
import InputBar from "../components/InputBar";
import SolutionCard from "../components/SolutionCard";
import VerdictCard from "../components/VerdictCard";

const mockData = {
  prompt: "What is the capital of France?",
  solution_1: "The capital of France is Paris.",
  solution_2:
    "The capital of France is Paris. It is the country's largest city and main cultural and commercial center, located on the River Seine in northern France at the heart of the Île-de-France region.",
  judge_recommendation: {
    solution_1_score: 10,
    solution_2_score: 10,
  },
};

const App = () => {
  const [currentPrompt, setCurrentPrompt] = useState(mockData.prompt);

  return (
    /* Outer dot-grid fullscreen */
    <div
      className="dot-grid"
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "stretch",
      }}
    >
      {/* Arena frame — full screen layout */}
      <div
        className="arena-frame"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          overflow: "hidden",
          borderRadius: 0,
          border: "none",
        }}
      >
        {/* Icon Sidebar */}
        <Sidebar />

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* ── Top header strip ── */}
          <div className="arena-header">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ 
                fontFamily: "var(--font-display)", 
                fontSize: "1.1rem", 
                fontWeight: 700, 
                letterSpacing: "0.05em",
                color: "#fff"
              }}>
                AI BATTLE ARENA
              </span>
              <span className="protocol-status" style={{ borderLeft: "1px solid var(--color-border)", paddingLeft: 12 }}>
               
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
              <button className="sync-btn">SYNC LICENSE</button>
              <div className="header-icons">
                <div className="header-icon-btn">
                  <Bell size={13} strokeWidth={1.8} />
                </div>
                <div className="header-icon-btn">
                  <Mail size={13} strokeWidth={1.8} />
                </div>
                <div className="avatar-btn" />
              </div>
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

            {/* ── User Prompt Display ── */}
            <div className="fade-up" style={{ 
              display: "flex", 
              justifyContent: "flex-end", 
              padding: "24px 24px 10px", 
              position: "relative", 
              zIndex: 10 
            }}>
              <div style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "10px 16px",
                borderRadius: "16px 16px 4px 16px",
                maxWidth: "70%",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                backdropFilter: "blur(10px)"
              }}>
                <p style={{ 
                  fontFamily: "var(--font-body)", 
                  fontSize: "0.95rem", 
                  color: "#e2e2e8", 
                  lineHeight: 1.5,
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word"
                }}>
                  {currentPrompt}
                </p>
              </div>
            </div>

            {/* ── Hero VS Removed per user request ── */}

            {/* ── Battle grid ── */}
            <div className="battle-grid">
              <SolutionCard
                model="GPT-4o"
                content={mockData.solution_1}
                type="A"
              />
              <SolutionCard
                model="Claude 3.5"
                content={mockData.solution_2}
                type="B"
              />
            </div>

            {/* ── Verdict card ── */}
            <VerdictCard
              scores={mockData.judge_recommendation}
              winner="B"
            />

          </div>

          {/* ── Bottom command bar ── */}
          <InputBar onExecute={setCurrentPrompt} />
        </div>
      </div>
    </div>
  );
};

export default App;
