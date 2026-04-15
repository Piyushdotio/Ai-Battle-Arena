import React, { useMemo, useState } from "react";
import {
  Bell,
  Mail,
  PencilLine,
  RotateCcw,
  Sparkles,
  Workflow,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import InputBar from "../components/InputBar";
import SolutionCard from "../components/SolutionCard";
import VerdictCard from "../components/VerdictCard";

const AVAILABLE_MODELS = [
  "GPT-4o",
  "Claude 3.5",
  "Llama 3 70B",
  "Gemini 1.5 Pro",
  "Mistral Large",
];
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://ai-battle-arena-yfn4.vercel.app/"
).replace(/\/$/, "");

const phaseLabels = {
  thinking: "Thinking through your prompt",
  streaming: "Generating live responses",
  comparing: "Comparing both answers",
  judge: "Judge analyzing both outputs",
  completed: "Battle completed",
};

const parseSseEventBlock = (block) => {
  const dataLines = block
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim());

  if (dataLines.length === 0) {
    return null;
  }

  try {
    return JSON.parse(dataLines.join("\n"));
  } catch {
    return null;
  }
};

const Home = () => {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [requestError, setRequestError] = useState("");
  const [promptDraft, setPromptDraft] = useState("");

  const [selectedModelA, setSelectedModelA] = useState("GPT-4o");
  const [selectedModelB, setSelectedModelB] = useState("Claude 3.5");

  const updateInteraction = (sessionId, interactionId, updater) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id !== sessionId
          ? session
          : {
              ...session,
              interactions: session.interactions.map((interaction) =>
                interaction.id !== interactionId
                  ? interaction
                  : { ...interaction, ...updater(interaction) },
              ),
            },
      ),
    );
  };

  const handleStreamEvent = (sessionId, interactionId, event) => {
    if (!event) {
      return;
    }

    if (event.type === "phase") {
      updateInteraction(sessionId, interactionId, () => ({
        phase: event.phase,
        phaseLabel: phaseLabels[event.phase] ?? "Working on your battle",
        isLoading: event.phase !== "completed",
      }));
      return;
    }

    if (event.type === "model_start") {
      updateInteraction(sessionId, interactionId, () => ({
        phaseLabel:
          event.key === "solution_1"
            ? "Combatant Alpha is responding"
            : "Combatant Beta is responding",
        [event.key === "solution_1" ? "streamingA" : "streamingB"]: true,
      }));
      return;
    }

    if (event.type === "model_token") {
      updateInteraction(sessionId, interactionId, (interaction) => ({
        [event.key]: `${interaction[event.key] || ""}${event.token}`,
      }));
      return;
    }

    if (event.type === "model_end") {
      updateInteraction(sessionId, interactionId, () => ({
        [event.key]: event.text,
        [event.key === "solution_1" ? "streamingA" : "streamingB"]: false,
      }));
      return;
    }

    if (event.type === "model_error") {
      setRequestError(event.message || "One model failed during streaming.");
      return;
    }

    if (event.type === "judge_result") {
      updateInteraction(sessionId, interactionId, () => ({
        scores: event.scores,
      }));
      return;
    }

    if (event.type === "done") {
      updateInteraction(sessionId, interactionId, () => ({
        solution_1: event.data.solution_1,
        solution_2: event.data.solution_2,
        scores: event.data.judge_recommendation,
        isLoading: false,
        phase: "completed",
        phaseLabel: phaseLabels.completed,
        streamingA: false,
        streamingB: false,
      }));
      return;
    }

    if (event.type === "error") {
      throw new Error(event.message || "Streaming failed.");
    }
  };

  const streamBattle = async (prompt, sessionId, interactionId) => {
    const response = await fetch(`${API_BASE_URL}/invoke/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: prompt }),
    });

    if (!response.ok || !response.body) {
      let message = `Request failed with status ${response.status}`;

      switch (response.status) {
        case 404:
          message =
            "Unable to connect to the server. Please check if the server is running.";
          break;
        case 500:
          message = "Server error occurred. Please try again later.";
          break;
        case 400:
          message = "Invalid request. Please check your input.";
          break;
        default:
          message = `Request failed with status ${response.status}. Please try again.`;
      }

      try {
        const payload = await response.json();
        message = payload?.message || message;
      } catch {
        // ignore json parse failure for non-json streaming responses
      }

      throw new Error(message);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split("\n\n");
      buffer = blocks.pop() ?? "";

      for (const block of blocks) {
        const event = parseSseEventBlock(block);
        handleStreamEvent(sessionId, interactionId, event);
      }
    }

    if (buffer.trim()) {
      const event = parseSseEventBlock(buffer);
      handleStreamEvent(sessionId, interactionId, event);
    }
  };

  const handleExecute = async (value) => {
    const prompt = value.trim();

    if (!prompt) {
      return;
    }

    setRequestError("");

    const interactionId = Date.now() + 1;
    const newInteraction = {
      id: interactionId,
      prompt,
      modelA: selectedModelA,
      modelB: selectedModelB,
      solution_1: "",
      solution_2: "",
      scores: { solution_1_score: 0, solution_2_score: 0 },
      isLoading: true,
      hasError: false,
      phase: "thinking",
      phaseLabel: phaseLabels.thinking,
      streamingA: false,
      streamingB: false,
    };

    let targetSessionId = activeSessionId;

    setSessions((prev) => {
      const activeSession = prev.find(
        (session) => session.id === activeSessionId,
      );

      if (activeSession) {
        return prev.map((session) =>
          session.id === activeSessionId
            ? {
                ...session,
                interactions: [...session.interactions, newInteraction],
              }
            : session,
        );
      }

      const newSessionId = Date.now();
      targetSessionId = newSessionId;
      setActiveSessionId(newSessionId);

      return [
        {
          id: newSessionId,
          title: prompt,
          interactions: [newInteraction],
        },
        ...prev,
      ];
    });

    try {
      await streamBattle(prompt, targetSessionId, interactionId);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Model responses could not be generated.";

      setRequestError(errorMessage);

      updateInteraction(targetSessionId, interactionId, (interaction) => ({
        solution_1:
          interaction.solution_1 ||
          "Model response is currently unavailable. Please try again later.",
        solution_2:
          interaction.solution_2 ||
          "Model response is currently unavailable. Please try again later.",
        scores: { solution_1_score: 0, solution_2_score: 0 },
        isLoading: false,
        hasError: true,
        phase: "completed",
        phaseLabel: "Battle interrupted",
        streamingA: false,
        streamingB: false,
      }));
    }
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setPromptDraft("");
  };

  const handleSelectSession = (id) => {
    setActiveSessionId(id);
  };

  const handleDeleteSession = (id) => {
    setSessions((prev) => {
      const remaining = prev.filter((session) => session.id !== id);

      if (activeSessionId === id) {
        setActiveSessionId(null);
      }

      return remaining;
    });
  };

  const historyItems = useMemo(
    () =>
      sessions.map((session) => ({
        id: session.id,
        title: session.title,
        active: session.id === activeSessionId,
      })),
    [sessions, activeSessionId],
  );

  const activeSession = sessions.find(
    (session) => session.id === activeSessionId,
  );
  const interactions = activeSession ? activeSession.interactions : [];

  return (
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
        <Sidebar
          historyItems={historyItems}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onNewChat={handleNewChat}
        />

        <div className="arena-main">
          <div className="arena-header">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  color: "#fff",
                }}
              >
                AI BATTLE ARENA
              </span>
              <span
                className="protocol-status"
                style={{
                  borderLeft: "1px solid var(--color-border)",
                  paddingLeft: 12,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    fontWeight: "bold",
                    display: "flex",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      color: "var(--color-model-a)",
                      textShadow: "0 0 8px rgba(203, 151, 255, 0.4)",
                    }}
                  >
                    {selectedModelA.toUpperCase()}
                  </span>
                  <span style={{ color: "var(--color-muted)" }}>VS</span>
                  <span
                    style={{
                      color: "var(--color-model-b)",
                      textShadow: "0 0 8px rgba(0, 255, 153, 0.4)",
                    }}
                  >
                    {selectedModelB.toUpperCase()}
                  </span>
                </div>
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginLeft: "auto",
              }}
            >
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

          <div className="arena-scroll">
            {requestError && (
              <div style={{ padding: "16px 24px 0" }}>
                <div className="arena-alert">{requestError}</div>
              </div>
            )}

            {interactions.length === 0 && (
              <div className="empty-state-shell">
                <div className="empty-state-orbit">
                  <div className="empty-state-core">
                    <Sparkles size={18} strokeWidth={2.2} />
                  </div>
                  <div className="empty-state-ring ring-a" />
                  <div className="empty-state-ring ring-b" />
                </div>

                <div className="empty-state-copy">
                  <p className="empty-state-title">
                    Set up a head-to-head prompt battle
                  </p>
                  <p className="empty-state-subtitle">
                    Ask one question and watch both models stream their answers
                    live before the judge compares them.
                  </p>
                </div>

                <div className="empty-state-guides">
                  <div className="empty-guide-card">
                    <Workflow size={16} strokeWidth={2} />
                    <span>Live model streaming</span>
                  </div>
                  <div className="empty-guide-card">
                    <Sparkles size={16} strokeWidth={2} />
                    <span>Judge scoring and winner reveal</span>
                  </div>
                </div>
              </div>
            )}

            {interactions.map((interaction, index) => (
              <div
                key={interaction.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginBottom: index < interactions.length - 1 ? "40px" : "0",
                }}
              >
                {interaction.prompt && (
                  <div
                    className="fade-up"
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      padding: "24px 24px 10px",
                      position: "relative",
                      zIndex: 10,
                    }}
                  >
                    <div className="user-prompt-bubble">
                      <p className="user-prompt-text">{interaction.prompt}</p>
                      <div className="prompt-action-row">
                        <button
                          type="button"
                          className="prompt-action-btn"
                          onClick={() => setPromptDraft(interaction.prompt)}
                        >
                          <PencilLine size={12} strokeWidth={2} />
                          Edit prompt
                        </button>
                        <button
                          type="button"
                          className="prompt-action-btn"
                          onClick={() => {
                            setPromptDraft(interaction.prompt);
                            void handleExecute(interaction.prompt);
                          }}
                        >
                          <RotateCcw size={12} strokeWidth={2} />
                          Re-run
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="battle-phase-bar">
                  <span
                    className={`battle-phase-dot ${interaction.isLoading ? "live" : ""}`}
                  />
                  <span>{interaction.phaseLabel}</span>
                </div>

                <div className="battle-grid">
                  <SolutionCard
                    model={interaction.modelA}
                    availableModels={AVAILABLE_MODELS}
                    onModelChange={setSelectedModelA}
                    content={interaction.solution_1}
                    type="A"
                    isLoading={interaction.isLoading}
                    isStreaming={interaction.streamingA}
                    phaseLabel={
                      interaction.streamingA
                        ? "Streaming live tokens"
                        : interaction.phase === "judge"
                          ? "Waiting for judge verdict"
                          : interaction.isLoading && !interaction.solution_1
                            ? "Thinking"
                            : "Response ready"
                    }
                    isWinner={
                      interaction.scores.solution_1_score >
                      interaction.scores.solution_2_score
                    }
                  />
                  <SolutionCard
                    model={interaction.modelB}
                    availableModels={AVAILABLE_MODELS}
                    onModelChange={setSelectedModelB}
                    content={interaction.solution_2}
                    type="B"
                    isLoading={interaction.isLoading}
                    isStreaming={interaction.streamingB}
                    phaseLabel={
                      interaction.streamingB
                        ? "Streaming live tokens"
                        : interaction.phase === "judge"
                          ? "Waiting for judge verdict"
                          : interaction.isLoading && !interaction.solution_2
                            ? "Thinking"
                            : "Response ready"
                    }
                    isWinner={
                      interaction.scores.solution_2_score >
                      interaction.scores.solution_1_score
                    }
                  />
                </div>

                {interaction.isLoading ? (
                  <div className="verdict-loading-card">
                    <div className="verdict-loading-label">JUDGE PIPELINE</div>
                    <div className="verdict-loading-title">
                      {interaction.phase === "judge"
                        ? "Judge is analyzing both outputs"
                        : interaction.phaseLabel}
                    </div>
                    <div className="verdict-loading-track">
                      <span className="verdict-loading-bar" />
                    </div>
                  </div>
                ) : !interaction.hasError ? (
                  <VerdictCard
                    scores={interaction.scores}
                    modelA={interaction.modelA}
                    modelB={interaction.modelB}
                  />
                ) : null}

                {index < interactions.length - 1 && (
                  <div
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      margin: "20px 24px 0 24px",
                    }}
                  />
                )}
              </div>
            ))}

            <div style={{ height: "32px", flexShrink: 0 }} />
          </div>

          <InputBar
            onExecute={handleExecute}
            value={promptDraft}
            onChange={setPromptDraft}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
