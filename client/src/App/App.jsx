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

const AVAILABLE_MODELS = ["GPT-4o", "Claude 3.5", "Llama 3 70B", "Gemini 1.5 Pro", "Mistral Large"];

const App = () => {
  const [sessions, setSessions] = useState([
    {
      id: Date.now(),
      title: "First Battle",
      interactions: [
        {
          id: Date.now() + 1,
          prompt: mockData.prompt,
          solution_1: mockData.solution_1,
          solution_2: mockData.solution_2,
          scores: mockData.judge_recommendation,
        }
      ]
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState(sessions[0].id);

  const [selectedModelA, setSelectedModelA] = useState("GPT-4o");
  const [selectedModelB, setSelectedModelB] = useState("Claude 3.5");

  const handleExecute = (val) => {
    const s1 = Math.floor(Math.random() * 4) + 7;
    const s2 = Math.floor(Math.random() * 4) + 7;

    const newInteraction = {
      id: Date.now() + 1,
      prompt: val,
      solution_1: `Simulated response from Model A to: "${val}"\n\n` + mockData.solution_1,
      solution_2: `Simulated response from Model B to: "${val}"\n\n` + mockData.solution_2,
      scores: { solution_1_score: s1, solution_2_score: s2 },
    };

    setSessions((prev) => {
      const activeSession = prev.find(s => s.id === activeSessionId);
      if (activeSession) {
        // Append to existing session
        return prev.map(s => s.id === activeSessionId ? { ...s, interactions: [...s.interactions, newInteraction] } : s);
      } else {
        // Create new session
        const newSessionId = Date.now();
        setActiveSessionId(newSessionId);
        return [{ id: newSessionId, title: val, interactions: [newInteraction] }, ...prev];
      }
    });
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
  };

  const handleSelectSession = (id) => {
    setActiveSessionId(id);
  };

  const handleDeleteSession = (id) => {
    setSessions((prev) => {
      const remaining = prev.filter(s => s.id !== id);
      if (activeSessionId === id) {
        setActiveSessionId(null);
      }
      return remaining;
    });
  };

  const historyItems = sessions.map(s => ({
    id: s.id,
    title: s.title,
    active: s.id === activeSessionId
  }));

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const interactions = activeSession ? activeSession.interactions : [];

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
        <Sidebar 
          historyItems={historyItems} 
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onNewChat={handleNewChat} 
        />

        {/* Main Content Area */}
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
              <span className="protocol-status" style={{ borderLeft: "1px solid var(--color-border)", paddingLeft: 12, display: "flex", alignItems: "center" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "bold", display: "flex", gap: "6px" }}>
                  <span style={{ color: "var(--color-model-a)", textShadow: "0 0 8px rgba(203, 151, 255, 0.4)" }}>{selectedModelA.toUpperCase()}</span>
                  <span style={{ color: "var(--color-muted)" }}>VS</span>
                  <span style={{ color: "var(--color-model-b)", textShadow: "0 0 8px rgba(0, 255, 153, 0.4)" }}>{selectedModelB.toUpperCase()}</span>
                </div>
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

            {interactions.map((interaction, index) => (
              <div key={interaction.id} style={{ display: "flex", flexDirection: "column", marginBottom: index < interactions.length - 1 ? "40px" : "0" }}>
                {/* ── User Prompt Display ── */}
                {interaction.prompt && (
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
                        {interaction.prompt}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Hero VS Removed per user request ── */}

                {/* ── Battle grid ── */}
                <div className="battle-grid">
                  <SolutionCard
                    model={selectedModelA}
                    availableModels={AVAILABLE_MODELS}
                    onModelChange={setSelectedModelA}
                    content={interaction.solution_1}
                    type="A"
                    isWinner={interaction.scores.solution_1_score > interaction.scores.solution_2_score}
                  />
                  <SolutionCard
                    model={selectedModelB}
                    availableModels={AVAILABLE_MODELS}
                    onModelChange={setSelectedModelB}
                    content={interaction.solution_2}
                    type="B"
                    isWinner={interaction.scores.solution_2_score > interaction.scores.solution_1_score}
                  />
                </div>

                {/* ── Verdict card ── */}
                <VerdictCard
                  scores={interaction.scores}
                />
                
                {index < interactions.length - 1 && (
                   <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", margin: "20px 24px 0 24px" }} />
                )}
              </div>
            ))}

            <div style={{ height: "32px", flexShrink: 0 }} />
          </div>

          {/* ── Bottom command bar ── */}
          <InputBar onExecute={handleExecute} />
        </div>
      </div>
    </div>
  );
};

export default App;
