/**
 * useChatHistory Hook
 * Manages chat memory state and history
 */

const { useState } = window.React;

/**
 * Custom hook for chat history management
 * @returns {Object} Chat history state and functions
 */
export function useChatHistory() {
  const [enableMemory, setEnableMemory] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const handleMemoryToggle = () => {
    if (enableMemory) {
      if (chatHistory.length > 0 && window.confirm("Do you want to clear your chat memory?")) {
        setChatHistory([]);
      }
      setEnableMemory(false);
    } else {
      setEnableMemory(true);
    }
  };

  return {
    enableMemory,
    chatHistory,
    setChatHistory,
    handleMemoryToggle
  };
}

export default { useChatHistory };
