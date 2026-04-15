import React, { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Copy,
  Crosshair,
  Cpu,
  ThumbsDown,
  ThumbsUp,
  Trophy,
  UnfoldVertical,
} from "lucide-react";

const SolutionCard = ({
  model,
  availableModels,
  onModelChange,
  content,
  type = "A",
  stats,
  isWinner,
  isLoading = false,
  isStreaming = false,
  phaseLabel = "",
}) => {
  const isA = type === "A";
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copyState, setCopyState] = useState("Copy");
  const dropdownRef = useRef(null);

  const COLOR_A = "#cb97ff";
  const COLOR_B = "#00ff99";
  const modelColor = isA ? COLOR_A : COLOR_B;

  const defaultStats = stats || {
    latency: isA ? "0.8s" : "1.1s",
    tokens: isA ? "124" : "108",
    confidence: isA ? "98.2%" : "99.1%",
  };

  const isLongContent = (content || "").length > 420;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsExpanded(false);
  }, [content]);

  const handleSelect = (nextModel) => {
    onModelChange(nextModel);
    setIsDropdownOpen(false);
  };

  const handleCopy = async () => {
    if (!content?.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      setCopyState("Copied");
      window.setTimeout(() => setCopyState("Copy"), 1600);
    } catch {
      setCopyState("Failed");
      window.setTimeout(() => setCopyState("Copy"), 1600);
    }
  };

  const formattedContent = (content || "").replace(
    /\*\*(.*?)\*\*/g,
    '<strong style="color: #fff; font-weight: 700;">$1</strong>'
  );

  return (
    <div
      className={`combatant-card ${isA ? "card-a" : "card-b"} fade-up ${isA ? "" : "delay-1"} ${isWinner ? "winner-card" : ""}`}
      style={isWinner ? { "--winner-color": modelColor } : undefined}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div className={`combatant-label ${isA ? "label-a" : "label-b"}`}>
          <Crosshair size={11} strokeWidth={2.5} />
          COMBATANT {isA ? "ALPHA" : "BETA"}
        </div>

        {isWinner ? (
          <div className="winner-badge" style={{ "--winner-color": modelColor }}>
            <div className="winner-badge-icon">
              <Trophy size={12} fill="#0b0b10" strokeWidth={2.2} />
            </div>
            <div className="winner-badge-text">
              <span className="winner-badge-title">TOP RESPONSE</span>
              <span className="winner-badge-subtitle">Winner</span>
            </div>
          </div>
        ) : (
          <div className="model-live-state" style={{ color: modelColor }}>
            <span>ONLINE</span>
            <div className="model-live-dot" />
          </div>
        )}
      </div>

      <div ref={dropdownRef} style={{ position: "relative", marginBottom: "2px" }}>
        <div
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="model-select-trigger"
          style={{ "--model-color": modelColor }}
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
              color: modelColor,
            }}
          />
        </div>

        {isDropdownOpen && (
          <div className="fade-in" style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "220px",
            background: "#15151e",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            marginTop: "8px",
            zIndex: 100,
            boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
            overflow: "hidden",
            backdropFilter: "blur(12px)"
          }}>
            <div style={{ padding: "8px 10px", fontSize: "10px", color: "var(--color-muted)", fontFamily: "var(--font-mono)", background: "rgba(255,255,255,0.03)" }}>
              SELECT MODEL PROTOCOL
            </div>
            {availableModels.map((entry) => (
              <div
                key={entry}
                onClick={() => handleSelect(entry)}
                className="model-select-item"
                style={{
                  color: model === entry ? "#fff" : "var(--color-muted-light)",
                  background: model === entry ? "rgba(255,255,255,0.06)" : "transparent",
                }}
              >
                <Cpu size={12} style={{ opacity: entry === model ? 1 : 0.4 }} />
                {entry}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="solution-meta-row">
        <div className={`phase-pill ${isStreaming ? "live" : ""}`}>
          {phaseLabel || (isStreaming ? "Streaming response" : isLoading ? "Thinking" : "Completed")}
        </div>
        {isLongContent && !isLoading && (
          <button
            className="text-action-btn"
            onClick={() => setIsExpanded((prev) => !prev)}
            type="button"
          >
            <UnfoldVertical size={12} strokeWidth={2} />
            {isExpanded ? "Collapse" : "Expand"}
          </button>
        )}
      </div>

      <div className={`solution-box ${!isExpanded && isLongContent && !isLoading ? "collapsed" : ""}`} style={{ flex: 1 }}>
        {isLoading && !content ? (
          <div className="solution-skeleton" aria-label="Loading response">
            <span className="solution-skeleton-line long" />
            <span className="solution-skeleton-line medium" />
            <span className="solution-skeleton-line long" />
            <span className="solution-skeleton-line short" />
            <span className="solution-skeleton-line medium" />
            <span className="solution-skeleton-line long" />
          </div>
        ) : (
          <p
            className="solution-text solution-text-animated"
            style={{ whiteSpace: "pre-wrap" }}
            dangerouslySetInnerHTML={{
              __html: `${formattedContent}${isStreaming ? '<span class="typing-cursor"></span>' : ""}`,
            }}
          />
        )}
      </div>

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

      <div style={{ display: "flex", gap: 8, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 10 }}>
        {[
          { icon: ThumbsUp, label: "Validate", disabled: true },
          { icon: ThumbsDown, label: "Reject", disabled: true },
          { icon: Copy, label: copyState, onClick: handleCopy, disabled: !content?.trim() },
        ].map(({ icon: Icon, label, onClick, disabled }) => (
          <button
            key={label}
            title={label}
            className="card-action-btn"
            disabled={disabled}
            onClick={onClick}
            type="button"
            style={{ "--action-color": modelColor }}
          >
            {React.createElement(Icon, { size: 13, strokeWidth: 2 })}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SolutionCard;
