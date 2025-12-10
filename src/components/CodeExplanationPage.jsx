import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";

const CodeExplanationPage = ({
  editorContent,
  setEditorContent,
  fileName,
  projectFiles,
  activeFile,
  setActiveFile,
}) => {
  /* -------------------- TAB STATE -------------------- */

  const [openTabs, setOpenTabs] = useState(() => {
    if (fileName) return [{ name: fileName }];
    return [];
  });

  /* Sync openTabs when a new file is selected */
  useEffect(() => {
    if (!fileName) return;

    setOpenTabs((tabs) => {
      const exists = tabs.find((t) => t.name === fileName);
      if (exists) return tabs;
      return [...tabs, { name: fileName }];
    });
  }, [fileName]);

  /* -------------------- CLOSE TAB -------------------- */
  const closeTab = (name) => {
    setOpenTabs((prev) => {
      const remaining = prev.filter((t) => t.name !== name);

      if (name === fileName) {
        const next = remaining[remaining.length - 1];
        if (next) {
          const index = projectFiles.findIndex((f) => f.name === next.name);
          if (index !== -1) {
            setActiveFile(index);
            setEditorContent(projectFiles[index].content);
          }
        }
      }
      return remaining;
    });
  };

  const activateTab = (name) => {
    const index = projectFiles.findIndex((f) => f.name === name);
    if (index !== -1) {
      setActiveFile(index);
      setEditorContent(projectFiles[index].content);
    }
  };

  /* -------------------- OLD STATES (Tabs kept) -------------------- */

  const displayName = fileName?.trim() !== "" ? fileName : "blank";

  const tabKey = `activeTab-${displayName}`;
  const [activeTabView, setActiveTabView] = useState(
    localStorage.getItem(tabKey) || "code"
  );

  useEffect(() => {
    localStorage.setItem(tabKey, activeTabView);
  }, [activeTabView, tabKey]);

  const explanationKey = `explanation-${displayName}`;
  const [explanation, setExplanation] = useState(
    localStorage.getItem(explanationKey) || ""
  );

  useEffect(() => {
    localStorage.setItem(explanationKey, explanation);
  }, [explanation, explanationKey]);

  /* -------------------- UI SECTION -------------------- */

  return (
    <div className="w-full flex-1 flex flex-col bg-[#1B1B1B]">

      {/* -------------------- FILE TABS -------------------- */}
      <div className="flex items-center bg-[#111] border-b border-gray-800 px-2 select-none">

        {openTabs.map((tab, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 px-4 py-2 text-sm cursor-pointer border-r border-gray-700 
              ${
                tab.name === fileName
                  ? "bg-[#1E1E1E] text-white font-semibold"
                  : "text-gray-400 hover:bg-[#222]"
              }
            `}
            onClick={() => activateTab(tab.name)}
          >
            <span>{tab.name}</span>
            <button
              className="text-gray-400 hover:text-white ml-2"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.name);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* -------------------- CODE / EXPLANATION TABS -------------------- */}
      <div className="flex items-center border-b border-gray-700 bg-[#111]">
        <button
          onClick={() => setActiveTabView("code")}
          className={`px-4 py-2 font-semibold cursor-pointer ${
            activeTabView === "code"
              ? "text-white border border-blue-400"
              : "text-gray-400"
          }`}
        >
          Code
        </button>

        <button
          onClick={() => setActiveTabView("explanation")}
          className={`px-4 py-2 font-semibold cursor-pointer ${
            activeTabView === "explanation"
              ? "text-white border border-blue-400"
              : "text-gray-400"
          }`}
        >
          Explanation
        </button>
      </div>

      {/* -------------------- EDITORS -------------------- */}
      <div className="flex-1 overflow-auto relative">

        {/* CODE EDITOR */}
        {activeTabView === "code" && (
          <Editor
            height="100%"
            defaultLanguage="verilog"
            theme="vs-dark"
            value={editorContent}
            onChange={(v) => setEditorContent(v)}
            options={{
              fontSize: 14,
              automaticLayout: true,
              minimap: { enabled: true },
              wordWrap: "on",
              scrollBeyondLastLine: false,
            }}
          />
        )}

        {/* EXPLANATION EDITOR */}
        {activeTabView === "explanation" && (
          <Editor
            height="100%"
            defaultLanguage="markdown"
            theme="vs-dark"
            value={explanation}
            onChange={(v) => setExplanation(v)}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              wordWrap: "on",
              scrollBeyondLastLine: false,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CodeExplanationPage;
