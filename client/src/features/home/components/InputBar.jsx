import React, { useState } from "react";
import { Terminal } from "lucide-react";

/**
 * InputBar — Bottom command bar matching the Stitch design
 */
const InputBar = ({ onExecute, value, onChange }) => {
  const [internalValue, setInternalValue] = useState("");
  const [executing, setExecuting] = useState(false);
  const inputValue = value ?? internalValue;

  const updateValue = (nextValue) => {
    if (onChange) {
      onChange(nextValue);
      return;
    }

    setInternalValue(nextValue);
  };

  const handleExecute = () => {
    if (!inputValue.trim() || executing) return;
    setExecuting(true);

    Promise.resolve(onExecute?.(inputValue))
      .then(() => {
        updateValue("");
      })
      .finally(() => {
        setExecuting(false);
      });
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
        onChange={(e) => updateValue(e.target.value)}
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
