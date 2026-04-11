import React from "react";
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
            <span className="protocol-status">
              PROTOCOL STATUS: <span>OPTIMAL</span>
            </span>

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

            {/* ── Hero VS ── */}
            <div className="hero-vs">
              <div className="vs-row">
                <span className="model-name-a">GPT-4O</span>
                <span className="vs-label">vs</span>
                <span className="model-name-b">CLAUDE 3.5</span>
              </div>
              <div className="tactical-sub">— TACTICAL SIMULATION ACTIVE —</div>
            </div>

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
          <InputBar />
        </div>
      </div>
    </div>
  );
};

export default App;
