import React, { useState } from "react";
import { Terminal } from "lucide-react";

/**
 * InputBar — Bottom command bar matching the Stitch design
 */
const InputBar = ({ onExecute }) => {
  const [inputValue, setInputValue] = useState("");
  const [executing, setExecuting] = useState(false);

  const handleExecute = () => {
    if (!inputValue.trim()) return;
    setExecuting(true);
    
    // Fake execution delay for visual feedback
    setTimeout(() => {
      if (onExecute) onExecute(inputValue);
      setInputValue("");
      setExecuting(false);
    }, 1200);
  };

  return (
    <div className="cmd-bar">
      <div className="cmd-icon">
        <Terminal size={15} strokeWidth={1.8} />
      </div>

      <input
        className="cmd-input"
        placeholder="INITIALIZE NEW BATTLE PROTOCOL..."
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleExecute()}
        disabled={executing}
      />

      <button 
        className="execute-btn" 
        onClick={handleExecute}
        disabled={executing || !inputValue.trim()}
        style={{ 
          opacity: (executing || !inputValue.trim()) ? 0.5 : 1, 
          cursor: executing ? "wait" : "pointer" 
        }}
      >
        {executing ? "EXECUTING..." : "EXECUTE"}
      </button>
    </div>
  );
};

export default InputBar;
