import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";

const CodeExplanationPage = ({
  editorContent,
  setEditorContent,
  fileName,
  setFileName,
  projectFiles,
  activeFile,
  setActiveFile,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  // Explanation API
useEffect(() => {
  window.setExplanationFromAPI = (text) => {
    setExplanation(text);
    setActiveTab("explanation"); // auto switch to explanation tab
  };
}, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayName = fileName?.trim() !== "" ? fileName : "";

  const activeTabKey = `activeTab-${displayName || "blank"}`;
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem(activeTabKey) || "code"
  );

  useEffect(() => {
    localStorage.setItem(activeTabKey, activeTab);
  }, [activeTab, activeTabKey]);

  const explanationKey = `explanation-${displayName || "blank"}`;
  const [explanation, setExplanation] = useState(
    localStorage.getItem(explanationKey) || ""
  );

  useEffect(() => {
    localStorage.setItem(explanationKey, explanation);
  }, [explanation, explanationKey]);

const handleFileSwitch = (index) => {
  const selected = projectFiles[index];
  if (!selected) return;

  // OPEN IN EDITOR
  setActiveFile(index);
  setEditorContent(selected.content);
  setFileName(selected.name);

  // UPDATE LOCAL STORAGE FOR FOLDER ACTIVE FILE
  localStorage.setItem("activeFile", index.toString());

  // LOAD PREVIOUS EXPLANATION IF ANY
  setExplanation(localStorage.getItem(`explanation-${selected.name}`) || "");

  // -------------------------
  // ADD TO RECENT FILES LIST
  // -------------------------
  // ADD TO RECENT
const recent = JSON.parse(localStorage.getItem("recentFiles") || "[]");
const updated = [
  { name: selected.name, content: selected.content },
  ...recent.filter((f) => f.name !== selected.name),
].slice(0, 15);

localStorage.setItem("recentFiles", JSON.stringify(updated));

// Notify Navbar to update immediately
window.dispatchEvent(new Event("recentFilesUpdated"));



  // CLOSE DROPDOWN
  setShowDropdown(false);
};


  return (
    <div className="w-full flex-1 flex flex-col bg-[#1B1B1B] border border-amber-50 rounded relative">
      <div className="flex items-center border-b border-gray-700 bg-[#111]">
        <button
          onClick={() => setActiveTab("code")}
          className={`px-4 py-2 font-semibold cursor-pointer ${
            activeTab === "code"
              ? "text-white border border-blue-400"
              : "text-gray-400"
          }`}
        >
          Code{" "}
          {displayName && (
            <span className="text-gray-500 text-sm">({displayName})</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("explanation")}
          className={`px-4 py-2 font-semibold cursor-pointer ${
            activeTab === "explanation"
              ? "text-white border border-blue-400"
              : "text-gray-400"
          }`}
        >
          Explanation{" "}
          {displayName && (
            <span className="text-gray-500 text-sm">({displayName})</span>
          )}
        </button>
      </div>

      {/* Dropdown only when folder is loaded */}
      {projectFiles.length > 0 && (
        <div className="w-full bg-[#111] border-b border-gray-700 px-3 py-2">
          <div className="relative w-64" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full bg-[#1E1E1E] text-white text-sm px-3 py-2 rounded-md 
              border-2 border-white hover:border-blue-400 hover:text-blue-400
              shadow-md flex items-center justify-between"
            >
              <span>{projectFiles[activeFile]?.name || "Select file"}</span>
              <span className="text-white text-xs">
                {showDropdown ? "▲" : "▼"}
              </span>
            </button>

            {showDropdown && (
              <div
                className="absolute mt-1 w-full bg-gray-800 border border-blue-400 rounded-md shadow-lg z-50 py-1"
              >
                {projectFiles.map((file, index) => (
                  <div
                    key={index}
                    onClick={() => handleFileSwitch(index)}
                    className="px-3 py-2 cursor-pointer text-sm text-blue-400 hover:bg-gray-600 hover:text-white"
                  >
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto relative">
        {activeTab === "code" && (
          <Editor
            height="100%"
            defaultLanguage="verilog"
            theme="vs-dark"
            value={editorContent}
            onChange={() => {}}
            onMount={(editor) => {
              window.monacoEditor = editor;
            }}
            options={{
              fontSize: 14,
              automaticLayout: true,
              minimap: { enabled: true },
              wordWrap: "on",
              scrollBeyondLastLine: false,
              readOnly: false,
            }}
          />
        )}

        {activeTab === "explanation" && (
          <Editor
            height="100%"
            defaultLanguage="markdown"
            theme="vs-dark"
            value={explanation}
            onChange={() => {}}
            onMount={(editor) => {
              window.monacoExplanationEditor = editor;
            }}
            options={{
              fontSize: 14,
              automaticLayout: true,
              minimap: { enabled: false },
              wordWrap: "on",
              scrollBeyondLastLine: false,
              readOnly: false,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CodeExplanationPage;
